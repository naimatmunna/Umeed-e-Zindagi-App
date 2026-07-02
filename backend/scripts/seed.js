/**
 * Idempotent database seeder.
 *   npm run seed           # insert seed data
 *   npm run seed:destroy   # wipe seed data
 */
import { connectDatabase, disconnectDatabase } from '../src/loaders/database.js';
import { seedRoles, destroyRoles } from '../src/seeders/role.seeder.js';
import { seedUsers, destroyUsers } from '../src/seeders/user.seeder.js';
import { seedCategories, destroyCategories } from '../src/seeders/category.seeder.js';
import { seedExpenses, destroyExpenses } from '../src/seeders/expense.seeder.js';
import { seedOfficeSettings, destroyOfficeSettings } from '../src/seeders/officeSettings.seeder.js';
import { seedAttendance, destroyAttendance } from '../src/seeders/attendance.seeder.js';
import { seedPatients, destroyPatients } from '../src/seeders/patient.seeder.js';
import logger from '../src/utils/logger.js';

const run = async () => {
  const destroy = process.argv.includes('--destroy');
  await connectDatabase();
  try {
    if (destroy) {
      await destroyPatients();
      await destroyAttendance();
      await destroyExpenses();
      await destroyUsers();
      await destroyCategories();
      await destroyOfficeSettings();
      await destroyRoles();
    } else {
      await seedRoles();
      await seedOfficeSettings();
      await seedCategories();
      await seedUsers();
      await seedExpenses();
      await seedAttendance();
      await seedPatients();
    }
    logger.info(destroy ? 'Seed destroy complete' : 'Seed complete');
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
