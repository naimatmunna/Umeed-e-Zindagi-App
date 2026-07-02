import { Router } from 'express';
import * as attendanceController from '../../controllers/attendance.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermissions } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import {
  listAttendanceSchema,
  attendanceSummarySchema,
  attendanceMatrixSchema,
  attendanceIdSchema,
  createAttendanceSchema,
  updateAttendanceSchema,
  checkInOutSchema,
} from '../../validators/attendance.validator.js';

const router = Router();
const P = PERMISSIONS;

router.use(authenticate);

router.get('/today', requirePermissions(P.ATTENDANCE_READ), attendanceController.getToday);
router.post('/check-in', requirePermissions(P.ATTENDANCE_CHECKIN), validate(checkInOutSchema), attendanceController.checkIn);
router.post('/check-out', requirePermissions(P.ATTENDANCE_CHECKIN), validate(checkInOutSchema), attendanceController.checkOut);
router.get('/summary', requirePermissions(P.ATTENDANCE_READ), validate(attendanceSummarySchema), attendanceController.getSummary);
router.get('/matrix', requirePermissions(P.ATTENDANCE_READ_ALL), validate(attendanceMatrixSchema), attendanceController.getMatrix);

router
  .route('/')
  .get(requirePermissions(P.ATTENDANCE_READ), validate(listAttendanceSchema), attendanceController.listAttendance)
  .post(requirePermissions(P.ATTENDANCE_CREATE), validate(createAttendanceSchema), attendanceController.createAttendance);

router
  .route('/:id')
  .get(requirePermissions(P.ATTENDANCE_READ), validate(attendanceIdSchema), attendanceController.getAttendance)
  .patch(requirePermissions(P.ATTENDANCE_UPDATE), validate(updateAttendanceSchema), attendanceController.updateAttendance)
  .delete(requirePermissions(P.ATTENDANCE_DELETE), validate(attendanceIdSchema), attendanceController.deleteAttendance);

export default router;
