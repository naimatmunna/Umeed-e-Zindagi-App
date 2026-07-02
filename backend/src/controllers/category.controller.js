import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import categoryService from '../services/category.service.js';
import { MESSAGES } from '../constants/messages.js';

export const listCategories = catchAsync(async (req, res) => {
  const { items, meta } = await categoryService.list(req.query);
  return ApiResponse.send(res, { message: MESSAGES.CATEGORY.LIST_FETCHED, data: items, meta });
});

export const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  return ApiResponse.send(res, { message: MESSAGES.CATEGORY.FETCHED, data: { category } });
});

export const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.create(req.body);
  return ApiResponse.created(res, { message: MESSAGES.CATEGORY.CREATED, data: { category } });
});

export const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  return ApiResponse.send(res, { message: MESSAGES.CATEGORY.UPDATED, data: { category } });
});

export const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.remove(req.params.id);
  return ApiResponse.send(res, { message: MESSAGES.CATEGORY.DELETED });
});
