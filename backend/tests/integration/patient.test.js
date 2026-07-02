import request from 'supertest';
import createApp from '../../src/app.js';
import { seedTestRoles, createTestUser, loginAs } from '../helpers/roles.js';
import { ROLES } from '../../src/constants/roles.js';

const app = createApp();
const base = '/api/v1';

beforeEach(async () => {
  await seedTestRoles();
});

describe('Patients API', () => {
  const adminSession = async () => {
    const user = await createTestUser({
      firstName: 'Patient',
      lastName: 'Admin',
      email: 'patient-admin@example.com',
      roleSlug: ROLES.ADMIN,
    });
    const token = await loginAs(app, { email: user.email });
    return { token };
  };

  it('creates a draft patient', async () => {
    const { token } = await adminSession();
    const res = await request(app)
      .post(`${base}/patients`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Ali',
        lastName: 'Khan',
        gender: 'male',
        phone: '03001234567',
        status: 'draft',
        wizardStep: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.patient.patientId).toMatch(/^PAT-/);
    expect(res.body.data.patient.status).toBe('draft');
  });

  it('lists patients with pagination', async () => {
    const { token } = await adminSession();
    await request(app)
      .post(`${base}/patients`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Sara', lastName: 'Ahmed', gender: 'female', phone: '03007654321' });

    const res = await request(app)
      .get(`${base}/patients`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.pagination).toBeDefined();
  });

  it('exports patient admission PDF in English only', async () => {
    const { token } = await adminSession();
    const created = await request(app)
      .post(`${base}/patients`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'PDF',
        lastName: 'Test',
        gender: 'male',
        phone: '03001112233',
        admissionDate: new Date().toISOString(),
      });

    const id = created.body.data.patient.id;
    const res = await request(app)
      .get(`${base}/patients/${id}/export/pdf`)
      .query({ lang: 'en' })
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((r, cb) => {
        const data = [];
        r.on('data', (c) => data.push(c));
        r.on('end', () => cb(null, Buffer.concat(data)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    expect(res.body.length).toBeGreaterThan(2000);
  });

  it('ignores urdu lang param and still exports English PDF', async () => {
    const { token } = await adminSession();
    const created = await request(app)
      .post(`${base}/patients`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Lang',
        lastName: 'Test',
        gender: 'male',
        phone: '03009998877',
      });

    const id = created.body.data.patient.id;
    const res = await request(app)
      .get(`${base}/patients/${id}/export/pdf`)
      .query({ lang: 'ur' })
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((r, cb) => {
        const data = [];
        r.on('data', (c) => data.push(c));
        r.on('end', () => cb(null, Buffer.concat(data)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/admission-PAT-/);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
  });

  it('returns patient summary for dashboard', async () => {
    const { token } = await adminSession();
    const res = await request(app)
      .get(`${base}/patients/summary`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(0);
    expect(res.body.data.byStatus).toBeDefined();
    expect(res.body.data.recentPatients).toBeDefined();
  });

  it('forbids regular users from creating patients', async () => {
    const user = await createTestUser({ email: 'nopatient@example.com', roleSlug: ROLES.USER });
    const token = await loginAs(app, { email: user.email });
    const res = await request(app)
      .post(`${base}/patients`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'X' });
    expect(res.status).toBe(403);
  });
});
