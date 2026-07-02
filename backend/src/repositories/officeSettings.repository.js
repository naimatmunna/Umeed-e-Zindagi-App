import OfficeSettings from '../models/officeSettings.model.js';

class OfficeSettingsRepository {
  async get() {
    let doc = await OfficeSettings.findOne({ key: 'office' });
    if (!doc) {
      doc = await OfficeSettings.create({ key: 'office' });
    }
    return doc;
  }

  async update(payload) {
    return OfficeSettings.findOneAndUpdate(
      { key: 'office' },
      { $set: payload },
      { new: true, upsert: true, runValidators: true },
    ).exec();
  }
}

export default new OfficeSettingsRepository();
