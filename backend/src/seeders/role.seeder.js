import Role from '../models/role.model.js';
import { ROLES } from '../constants/roles.js';
import logger from '../utils/logger.js';

const SEED_ROLES = [
  {
    name: 'Super Admin',
    slug: ROLES.SUPER_ADMIN,
    description: 'Full system access with every permission.',
  },
  {
    name: 'Admin',
    slug: ROLES.ADMIN,
    description: 'Manage users, roles, and application settings.',
  },
  {
    name: 'Manager',
    slug: ROLES.MANAGER,
    description: 'View and update users within their scope.',
  },
  {
    name: 'User',
    slug: ROLES.USER,
    description: 'Standard employee access.',
  },
];

export const seedRoles = async () => {
  for (const data of SEED_ROLES) {
    const exists = await Role.exists({ slug: data.slug });
    if (!exists) {
      await Role.create(data);
      logger.info(`Seeded role: ${data.slug}`);
    }
  }
};

export const getRoleIdBySlug = async (slug) => {
  const role = await Role.findOne({ slug }).select('_id').lean();
  if (!role) throw new Error(`Role not found for slug: ${slug}`);
  return role._id;
};

export const destroyRoles = async () => {
  await Role.deleteMany({});
  logger.info('Removed all roles');
};
