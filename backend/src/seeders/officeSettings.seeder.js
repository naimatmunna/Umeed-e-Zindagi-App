import OfficeSettings from '../models/officeSettings.model.js';
import logger from '../utils/logger.js';

export const seedOfficeSettings = async () => {
  const exists = await OfficeSettings.exists({ key: 'office' });
  if (!exists) {
    await OfficeSettings.create({
      key: 'office',
      timezone: 'Asia/Karachi',
      workStartTime: '09:00',
      workEndTime: '18:00',
      offDays: [0, 6],
      gracePeriodMinutes: 15,
      halfDayThresholdHours: 4,
      lateThresholdMinutes: 15,
      autoMarkAbsent: true,
    });
    logger.info('Seeded office settings');
  }
};

export const destroyOfficeSettings = async () => {
  await OfficeSettings.deleteMany({});
  logger.info('Removed office settings');
};
