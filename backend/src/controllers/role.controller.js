import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import roleService from '../services/role.service.js';

export const listRoles = catchAsync(async (req, res) => {
  const { items, meta } = await roleService.list(req.query);
  return ApiResponse.send(res, { message: 'Roles fetched successfully', data: items, meta });
});

export const getRole = catchAsync(async (req, res) => {
  const role = await roleService.getById(req.params.id);
  return ApiResponse.send(res, { message: 'Role fetched successfully', data: { role } });
});

export const createRole = catchAsync(async (req, res) => {
  const role = await roleService.create(req.body);
  return ApiResponse.created(res, { message: 'Role created successfully', data: { role } });
});

export const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.update(req.params.id, req.body);
  return ApiResponse.send(res, { message: 'Role updated successfully', data: { role } });
});

export const deleteRole = catchAsync(async (req, res) => {
  await roleService.remove(req.params.id);
  return ApiResponse.send(res, { message: 'Role deleted successfully' });
});
