import request from 'supertest';
import User from '../../src/models/user.model.js';
import { seedRoles, getRoleIdBySlug } from '../../src/seeders/role.seeder.js';
import { ROLES } from '../../src/constants/roles.js';

export const seedTestRoles = () => seedRoles();

export const getTestRoleId = (slug = ROLES.USER) => getRoleIdBySlug(slug);

export const createTestUser = async ({
  firstName = 'Test',
  lastName = 'User',
  email,
  password = 'Secret123!',
  roleSlug = ROLES.USER,
  salary = 50000,
} = {}) => {
  const roleId = await getTestRoleId(roleSlug);
  return User.create({
    firstName,
    lastName,
    email: email ?? `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
    password,
    roleId,
    salary,
    joiningDate: new Date(),
    isEmailVerified: true,
    isActive: true,
  });
};

export const loginAs = async (app, { email, password = 'Secret123!' }) => {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data.accessToken;
};
