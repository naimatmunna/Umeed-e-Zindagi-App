import mongoose from 'mongoose';
import { PDF_LANGUAGES } from '../constants/patient.js';

const { Schema } = mongoose;

const patientPdfSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    language: { type: String, enum: PDF_LANGUAGES, required: true },
    version: { type: Number, default: 1 },
    url: { type: String },
    publicId: { type: String },
    fileName: { type: String, trim: true, maxlength: 200 },
    fileSize: { type: Number },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

patientPdfSchema.index({ patientId: 1, createdAt: -1 });

const PatientPdf = mongoose.model('PatientPdf', patientPdfSchema);
export default PatientPdf;
