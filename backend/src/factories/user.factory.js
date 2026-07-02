import { ROLES } from '../constants/roles.js';

/**
 * Factory Pattern: builds consistent User payloads for seeds/tests.
 * Overrides let callers customize any field.
 */
export const buildUser = (overrides = {}) => ({
  firstName: 'Test',
  lastName: 'User',
  email: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`,
  password: 'Password123!',
  roleSlug: ROLES.USER,
  salary: 50000,
  joiningDate: new Date(),
  isActive: true,
  isEmailVerified: true,
  ...overrides,
});
