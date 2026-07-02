import mongoose from 'mongoose';

const { Schema } = mongoose;

const patientAuditLogSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    action: { type: String, required: true, trim: true, maxlength: 80 },
    field: { type: String, trim: true, maxlength: 120 },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    ip: { type: String, trim: true, maxlength: 64 },
    userAgent: { type: String, trim: true, maxlength: 300 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.userId && typeof ret.userId === 'object' && ret.userId.email) {
          ret.user = {
            id: ret.userId.id ?? ret.userId._id?.toString(),
            firstName: ret.userId.firstName,
            lastName: ret.userId.lastName,
            email: ret.userId.email,
          };
          ret.userId = ret.user.id;
        }
        return ret;
      },
    },
  },
);

patientAuditLogSchema.index({ patientId: 1, createdAt: -1 });

const PatientAuditLog = mongoose.model('PatientAuditLog', patientAuditLogSchema);
export default PatientAuditLog;
