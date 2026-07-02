import request from 'supertest';
import createApp from '../../src/app.js';
import { seedTestRoles, getTestRoleId, createTestUser, loginAs } from '../helpers/roles.js';
import { ROLES } from '../../src/constants/roles.js';

const app = createApp();
const base = '/api/v1';

const validUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'Secret123!',
};

beforeEach(async () => {
  await seedTestRoles();
});

describe('Auth flow', () => {
  it('registers a new user', async () => {
    const res = await request(app).post(`${base}/auth/register`).send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.firstName).toBe(validUser.firstName);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.role?.slug).toBe(ROLES.USER);
  });

  it('rejects duplicate email', async () => {
    await request(app).post(`${base}/auth/register`).send(validUser);
    const res = await request(app).post(`${base}/auth/register`).send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_IN_USE');
  });

  it('rejects invalid registration payload', async () => {
    const res = await request(app).post(`${base}/auth/register`).send({ email: 'bad' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('logs in and returns an access token + refresh cookie', async () => {
    await request(app).post(`${base}/auth/register`).send(validUser);
    const res = await request(app).post(`${base}/auth/login`).send({
      email: validUser.email,
      password: validUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.fullName).toBe('Jane Doe');
    expect(res.headers['set-cookie'].join()).toMatch(/refresh_token/);
  });

  it('rejects bad credentials', async () => {
    await request(app).post(`${base}/auth/register`).send(validUser);
    const res = await request(app).post(`${base}/auth/login`).send({
      email: validUser.email,
      password: 'wrongpass',
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns the current user from /me with a valid token', async () => {
    await request(app).post(`${base}/auth/register`).send(validUser);
    const login = await request(app).post(`${base}/auth/login`).send({
      email: validUser.email,
      password: validUser.password,
    });
    const token = login.body.data.accessToken;
    const res = await request(app).get(`${base}/auth/me`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.salary).toBeDefined();
    expect(res.body.data.user.joiningDate).toBeDefined();
  });

  it('blocks /me without a token', async () => {
    const res = await request(app).get(`${base}/auth/me`);
    expect(res.status).toBe(401);
  });

  it('updates profile via PATCH /me', async () => {
    await request(app).post(`${base}/auth/register`).send(validUser);
    const login = await request(app).post(`${base}/auth/login`).send({
      email: validUser.email,
      password: validUser.password,
    });
    const token = login.body.data.accessToken;
    const res = await request(app)
      .patch(`${base}/auth/me`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Janet', lastName: 'Roe' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.firstName).toBe('Janet');
    expect(res.body.data.user.lastName).toBe('Roe');
  });

  it('rotates refresh tokens', async () => {
    await request(app).post(`${base}/auth/register`).send(validUser);
    const login = await request(app).post(`${base}/auth/login`).send({
      email: validUser.email,
      password: validUser.password,
    });
    const cookie = login.headers['set-cookie'];
    const res = await request(app).post(`${base}/auth/refresh`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});

describe('Health', () => {
  it('reports healthy', async () => {
    const res = await request(app).get(`${base}/health`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('RBAC', () => {
  it('forbids a normal user from creating users', async () => {
    await request(app).post(`${base}/auth/register`).send(validUser);
    const login = await request(app).post(`${base}/auth/login`).send({
      email: validUser.email,
      password: validUser.password,
    });
    const token = login.body.data.accessToken;
    const roleId = await getTestRoleId(ROLES.USER);
    const res = await request(app)
      .post(`${base}/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'X',
        lastName: 'Y',
        email: 'x@example.com',
        password: 'Secret123!',
        roleId,
      });
    expect(res.status).toBe(403);
  });
});

describe('Roles API', () => {
  const adminLogin = async () => {
    const admin = await createTestUser({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin-test@example.com',
      roleSlug: ROLES.ADMIN,
    });
    return loginAs(app, { email: admin.email });
  };

  it('lists roles for an admin', async () => {
    const token = await adminLogin();
    const res = await request(app).get(`${base}/roles`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('creates a role', async () => {
    const token = await adminLogin();
    const res = await request(app)
      .post(`${base}/roles`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Analyst', slug: 'analyst', description: 'Read-only analyst' });
    expect(res.status).toBe(201);
    expect(res.body.data.role.slug).toBe('analyst');
  });
});

describe('Users API', () => {
  const adminToken = async () => {
    const admin = await createTestUser({
      firstName: 'Ops',
      lastName: 'Admin',
      email: 'ops-admin@example.com',
      roleSlug: ROLES.ADMIN,
    });
    return loginAs(app, { email: admin.email });
  };

  it('creates a user with role, salary, and joining date', async () => {
    const token = await adminToken();
    const roleId = await getTestRoleId(ROLES.MANAGER);
    const res = await request(app)
      .post(`${base}/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Sam',
        lastName: 'Taylor',
        email: 'sam@example.com',
        password: 'Secret123!',
        roleId,
        salary: 68000,
        joiningDate: '2024-03-15',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.user.firstName).toBe('Sam');
    expect(res.body.data.user.salary).toBe(68000);
    expect(res.body.data.user.role.slug).toBe(ROLES.MANAGER);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('lists users with populated roles', async () => {
    const token = await adminToken();
    const res = await request(app).get(`${base}/users`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].role).toBeDefined();
  });
});
