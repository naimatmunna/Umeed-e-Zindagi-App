import officeSettingsRepository from '../repositories/officeSettings.repository.js';

class OfficeSettingsService {
  get() {
    return officeSettingsRepository.get();
  }

  update(payload, userId) {
    return officeSettingsRepository.update({ ...payload, updatedBy: userId });
  }
}

export default new OfficeSettingsService();
