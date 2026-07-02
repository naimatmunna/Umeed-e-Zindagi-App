import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import attendanceService from '../services/attendance.service.js';
import { MESSAGES } from '../constants/messages.js';

export const getToday = catchAsync(async (req, res) => {
  const today = await attendanceService.getToday(req.user);
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.TODAY_FETCHED, data: today });
});

export const checkIn = catchAsync(async (req, res) => {
  const attendance = await attendanceService.checkIn(req.user, req.body ?? {});
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.CHECKED_IN, data: { attendance } });
});

export const checkOut = catchAsync(async (req, res) => {
  const attendance = await attendanceService.checkOut(req.user, req.body ?? {});
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.CHECKED_OUT, data: { attendance } });
});

export const listAttendance = catchAsync(async (req, res) => {
  const { items, meta } = await attendanceService.list(req.query, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.LIST_FETCHED, data: items, meta });
});

export const getSummary = catchAsync(async (req, res) => {
  const summary = await attendanceService.summary(req.query, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.SUMMARY_FETCHED, data: summary });
});

export const getMatrix = catchAsync(async (req, res) => {
  const matrix = await attendanceService.matrix(req.query, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.MATRIX_FETCHED, data: matrix });
});

export const getAttendance = catchAsync(async (req, res) => {
  const attendance = await attendanceService.getById(req.params.id, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.FETCHED, data: { attendance } });
});

export const createAttendance = catchAsync(async (req, res) => {
  const attendance = await attendanceService.createManual(req.body, req.user);
  return ApiResponse.created(res, { message: MESSAGES.ATTENDANCE.CREATED, data: { attendance } });
});

export const updateAttendance = catchAsync(async (req, res) => {
  const attendance = await attendanceService.update(req.params.id, req.body, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.UPDATED, data: { attendance } });
});

export const deleteAttendance = catchAsync(async (req, res) => {
  await attendanceService.remove(req.params.id, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.ATTENDANCE.DELETED });
});
