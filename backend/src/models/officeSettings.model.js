import mongoose from 'mongoose';

const { Schema } = mongoose;

const officeSettingsSchema = new Schema(
  {
    key: { type: String, default: 'office', unique: true },
    timezone: { type: String, default: 'Asia/Karachi' },
    workStartTime: { type: String, default: '09:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    workEndTime: { type: String, default: '18:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    offDays: { type: [Number], default: [0, 6] },
    gracePeriodMinutes: { type: Number, default: 15, min: 0, max: 120 },
    halfDayThresholdHours: { type: Number, default: 4, min: 1, max: 8 },
    lateThresholdMinutes: { type: Number, default: 15, min: 0, max: 120 },
    autoMarkAbsent: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.key;
        return ret;
      },
    },
  },
);

const OfficeSettings = mongoose.model('OfficeSettings', officeSettingsSchema);
export default OfficeSettings;
