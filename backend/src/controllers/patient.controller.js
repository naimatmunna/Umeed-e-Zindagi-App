import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import patientService from '../services/patient.service.js';
import patientReportService from '../services/patientReport.service.js';
import { MESSAGES } from '../constants/messages.js';

export const getPatientSummary = catchAsync(async (req, res) => {
  const summary = await patientService.summary();
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.SUMMARY_FETCHED, data: summary });
});

export const listPatients = catchAsync(async (req, res) => {
  const { items, meta } = await patientService.list(req.query);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.LIST_FETCHED, data: items, meta });
});

export const getPatient = catchAsync(async (req, res) => {
  const patient = await patientService.getById(req.params.id);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.FETCHED, data: { patient } });
});

export const createPatient = catchAsync(async (req, res) => {
  const patient = await patientService.create(req.body, req.user, req);
  return ApiResponse.created(res, { message: MESSAGES.PATIENT.CREATED, data: { patient } });
});

export const updatePatient = catchAsync(async (req, res) => {
  const patient = await patientService.update(req.params.id, req.body, req.user, req);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.UPDATED, data: { patient } });
});

export const submitPatient = catchAsync(async (req, res) => {
  const patient = await patientService.submit(req.params.id, req.user, req);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.SUBMITTED, data: { patient } });
});

export const deletePatient = catchAsync(async (req, res) => {
  await patientService.remove(req.params.id, req.user, req);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.DELETED });
});

export const checkDuplicates = catchAsync(async (req, res) => {
  const warnings = await patientService.checkDuplicates(req.query, req.query.excludeId);
  return ApiResponse.send(res, { message: 'Duplicate check completed', data: { warnings } });
});

export const uploadDocument = catchAsync(async (req, res) => {
  if (!req.file) {
    return ApiResponse.send(res, { message: 'No file uploaded' }, 400);
  }
  const patient = await patientService.uploadDocument(
    req.params.id,
    req.file,
    req.body,
    req.user,
  );
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.DOCUMENT_UPLOADED, data: { patient } });
});

export const deleteDocument = catchAsync(async (req, res) => {
  await patientService.removeDocument(req.params.id, req.params.documentId, req.user);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.DOCUMENT_DELETED });
});

export const getTimeline = catchAsync(async (req, res) => {
  const { items, meta } = await patientService.getTimeline(req.params.id, req.query);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.TIMELINE_FETCHED, data: items, meta });
});

export const getAuditLog = catchAsync(async (req, res) => {
  const { items } = await patientService.getAuditLog(req.params.id, req.query);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.AUDIT_FETCHED, data: items });
});

export const exportPatientPdf = catchAsync(async (req, res) => {
  await patientReportService.streamPdf(
    req.params.id,
    req.query.lang ?? 'en',
    req.user,
    res,
  );
});

export const listPdfHistory = catchAsync(async (req, res) => {
  const items = await patientReportService.listPdfHistory(req.params.id);
  return ApiResponse.send(res, { message: MESSAGES.PATIENT.PDF_HISTORY_FETCHED, data: items });
});
