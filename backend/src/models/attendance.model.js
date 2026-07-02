import mongoose from 'mongoose';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_VALUES } from '../constants/attendance.js';
import { formatMinutesToHours } from '../utils/attendanceTime.js';

const { Schema } = mongoose;

const attendanceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ATTENDANCE_STATUS_VALUES,
      default: ATTENDANCE_STATUS.ABSENT,
    },
    workingMinutes: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, maxlength: 500 },
    leaveReason: { type: String, trim: true, maxlength: 280 },
    isManual: { type: Boolean, default: false },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.workingHours = formatMinutesToHours(ret.workingMinutes);
        if (ret.userId && typeof ret.userId === 'object' && ret.userId.email) {
          ret.user = {
            id: ret.userId.id ?? ret.userId._id?.toString(),
            firstName: ret.userId.firstName,
            lastName: ret.userId.lastName,
            email: ret.userId.email,
            fullName: `${ret.userId.firstName} ${ret.userId.lastName}`.trim(),
          };
          ret.userId = ret.user.id;
        }
        return ret;
      },
    },
  },
);

attendanceSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

attendanceSchema.virtual('workingHours').get(function workingHours() {
  return formatMinutesToHours(this.workingMinutes);
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
