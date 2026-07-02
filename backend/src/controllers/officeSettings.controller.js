import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import officeSettingsService from '../services/officeSettings.service.js';
import { MESSAGES } from '../constants/messages.js';

export const getOfficeSettings = catchAsync(async (_req, res) => {
  const settings = await officeSettingsService.get();
  return ApiResponse.send(res, { message: MESSAGES.SETTINGS.FETCHED, data: { settings } });
});

export const updateOfficeSettings = catchAsync(async (req, res) => {
  const settings = await officeSettingsService.update(req.body, req.user.id);
  return ApiResponse.send(res, { message: MESSAGES.SETTINGS.UPDATED, data: { settings } });
});
