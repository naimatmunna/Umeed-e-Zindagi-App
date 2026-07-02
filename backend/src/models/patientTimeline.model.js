import mongoose from 'mongoose';
import { TIMELINE_EVENTS } from '../constants/patient.js';

const { Schema } = mongoose;

const patientTimelineSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    event: { type: String, enum: TIMELINE_EVENTS, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    metadata: { type: Schema.Types.Mixed },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.performedBy && typeof ret.performedBy === 'object' && ret.performedBy.email) {
          ret.user = {
            id: ret.performedBy.id ?? ret.performedBy._id?.toString(),
            firstName: ret.performedBy.firstName,
            lastName: ret.performedBy.lastName,
          };
          ret.performedBy = ret.user.id;
        }
        return ret;
      },
    },
  },
);

patientTimelineSchema.index({ patientId: 1, createdAt: -1 });

const PatientTimeline = mongoose.model('PatientTimeline', patientTimelineSchema);
export default PatientTimeline;
