import User from '../models/user.model.js';
import { ROLES } from '../constants/roles.js';
import { getRoleIdBySlug } from './role.seeder.js';
import logger from '../utils/logger.js';

const SEED_USERS = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@example.com',
    password: 'Password123!',
    roleSlug: ROLES.SUPER_ADMIN,
    salary: 120000,
    isEmailVerified: true,
  },
  {
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'Password123!',
    roleSlug: ROLES.ADMIN,
    salary: 95000,
    isEmailVerified: true,
  },
  {
    firstName: 'Team',
    lastName: 'Manager',
    email: 'manager@example.com',
    password: 'Password123!',
    roleSlug: ROLES.MANAGER,
    salary: 75000,
    isEmailVerified: true,
  },
  {
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@example.com',
    password: 'Password123!',
    roleSlug: ROLES.USER,
    salary: 45000,
    isEmailVerified: true,
  },
];

export const seedUsers = async () => {
  for (const { roleSlug, ...data } of SEED_USERS) {
    const exists = await User.exists({ email: data.email });
    if (!exists) {
      const roleId = await getRoleIdBySlug(roleSlug);
      await User.create({
        ...data,
        roleId,
        joiningDate: new Date(),
      });
      logger.info(`Seeded user: ${data.email}`);
    }
  }
};

export const destroyUsers = async () => {
  await User.deleteMany({});
  logger.info('Removed all users');
};
