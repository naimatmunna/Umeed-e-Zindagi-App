import request from 'supertest';
import createApp from '../../src/app.js';
import { seedTestRoles, createTestUser, loginAs } from '../helpers/roles.js';
import { seedOfficeSettings } from '../../src/seeders/officeSettings.seeder.js';
import { ROLES } from '../../src/constants/roles.js';
import { currentMonthParam } from '../../src/utils/dateRange.js';

const app = createApp();
const base = '/api/v1';

beforeEach(async () => {
  await seedTestRoles();
  await seedOfficeSettings();
});

describe('Attendance API', () => {
  it('allows employee check-in and check-out', async () => {
    const user = await createTestUser({
      email: 'attendance-emp@example.com',
      roleSlug: ROLES.USER,
    });
    const token = await loginAs(app, { email: user.email });

    const checkIn = await request(app)
      .post(`${base}/attendance/check-in`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(checkIn.status).toBe(200);
    expect(checkIn.body.data.attendance.checkIn).toBeDefined();

    const checkOut = await request(app)
      .post(`${base}/attendance/check-out`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(checkOut.status).toBe(200);
    expect(checkOut.body.data.attendance.checkOut).toBeDefined();
    expect(checkOut.body.data.attendance.workingHours).toBeGreaterThanOrEqual(0);
  });

  it('returns today attendance for employee', async () => {
    const user = await createTestUser({ email: 'today@example.com', roleSlug: ROLES.USER });
    const token = await loginAs(app, { email: user.email });
    const res = await request(app)
      .get(`${base}/attendance/today`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.dateKey).toBeDefined();
    expect(res.body.data.office).toBeDefined();
  });

  it('allows admin to create manual attendance', async () => {
    const employee = await createTestUser({ email: 'emp-manual@example.com', roleSlug: ROLES.USER });
    const admin = await createTestUser({ email: 'admin-att@example.com', roleSlug: ROLES.ADMIN });
    const token = await loginAs(app, { email: admin.email });

    const res = await request(app)
      .post(`${base}/attendance`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: employee.id,
        dateKey: '2025-06-10',
        status: 'leave_paid',
        leaveReason: 'Annual leave',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.attendance.status).toBe('leave_paid');
  });

  it('returns attendance matrix for admin', async () => {
    const admin = await createTestUser({ email: 'matrix-admin@example.com', roleSlug: ROLES.ADMIN });
    const token = await loginAs(app, { email: admin.email });
    const res = await request(app)
      .get(`${base}/attendance/matrix`)
      .query({ month: currentMonthParam() })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.employees).toBeDefined();
    expect(res.body.data.days).toBeDefined();
  });

  it('forbids employee from viewing matrix', async () => {
    const user = await createTestUser({ email: 'no-matrix@example.com', roleSlug: ROLES.USER });
    const token = await loginAs(app, { email: user.email });
    const res = await request(app)
      .get(`${base}/attendance/matrix`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('Office Settings API', () => {
  it('allows all users to read office settings', async () => {
    const user = await createTestUser({ email: 'settings-read@example.com', roleSlug: ROLES.USER });
    const token = await loginAs(app, { email: user.email });
    const res = await request(app)
      .get(`${base}/settings/office`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.settings.timezone).toBeDefined();
  });

  it('allows super admin to update office settings', async () => {
    const superAdmin = await createTestUser({
      email: 'super-settings@example.com',
      roleSlug: ROLES.SUPER_ADMIN,
    });
    const token = await loginAs(app, { email: superAdmin.email });
    const res = await request(app)
      .patch(`${base}/settings/office`)
      .set('Authorization', `Bearer ${token}`)
      .send({ workStartTime: '08:30', workEndTime: '17:30' });
    expect(res.status).toBe(200);
    expect(res.body.data.settings.workStartTime).toBe('08:30');
  });

  it('forbids admin from updating office settings', async () => {
    const admin = await createTestUser({ email: 'admin-settings@example.com', roleSlug: ROLES.ADMIN });
    const token = await loginAs(app, { email: admin.email });
    const res = await request(app)
      .patch(`${base}/settings/office`)
      .set('Authorization', `Bearer ${token}`)
      .send({ workStartTime: '10:00' });
    expect(res.status).toBe(403);
  });
});
