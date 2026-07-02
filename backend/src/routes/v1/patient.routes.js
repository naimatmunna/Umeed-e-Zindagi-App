import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermissions } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { patientUpload } from '../../middlewares/upload.js';
import { PERMISSIONS as P } from '../../constants/permissions.js';
import * as patientController from '../../controllers/patient.controller.js';
import {
  listPatientsSchema,
  createPatientSchema,
  updatePatientSchema,
  patientIdSchema,
  exportPatientPdfSchema,
  uploadDocumentSchema,
  documentIdSchema,
  checkDuplicatesSchema,
} from '../../validators/patient.validator.js';

const router = Router();

router.use(authenticate);

router.get('/check-duplicates', requirePermissions(P.PATIENT_READ), validate(checkDuplicatesSchema), patientController.checkDuplicates);

router.get('/summary', requirePermissions(P.PATIENT_READ), patientController.getPatientSummary);

router
  .route('/')
  .get(requirePermissions(P.PATIENT_READ), validate(listPatientsSchema), patientController.listPatients)
  .post(requirePermissions(P.PATIENT_CREATE), validate(createPatientSchema), patientController.createPatient);

router
  .route('/:id')
  .get(requirePermissions(P.PATIENT_READ), validate(patientIdSchema), patientController.getPatient)
  .patch(requirePermissions(P.PATIENT_UPDATE), validate(updatePatientSchema), patientController.updatePatient)
  .delete(requirePermissions(P.PATIENT_DELETE), validate(patientIdSchema), patientController.deletePatient);

router.post(
  '/:id/submit',
  requirePermissions(P.PATIENT_UPDATE),
  validate(patientIdSchema),
  patientController.submitPatient,
);

router.get(
  '/:id/timeline',
  requirePermissions(P.PATIENT_READ),
  validate(patientIdSchema),
  patientController.getTimeline,
);

router.get(
  '/:id/audit',
  requirePermissions(P.AUDIT_READ),
  validate(patientIdSchema),
  patientController.getAuditLog,
);

router.get(
  '/:id/export/pdf',
  requirePermissions(P.PATIENT_PDF_DOWNLOAD),
  validate(exportPatientPdfSchema),
  patientController.exportPatientPdf,
);

router.get(
  '/:id/pdf-history',
  requirePermissions(P.PATIENT_PDF_DOWNLOAD),
  validate(patientIdSchema),
  patientController.listPdfHistory,
);

router.post(
  '/:id/documents',
  requirePermissions(P.PATIENT_DOCUMENT_MANAGE),
  patientUpload.single('file'),
  validate(uploadDocumentSchema),
  patientController.uploadDocument,
);

router.delete(
  '/:id/documents/:documentId',
  requirePermissions(P.PATIENT_DOCUMENT_MANAGE),
  validate(documentIdSchema),
  patientController.deleteDocument,
);

export default router;
