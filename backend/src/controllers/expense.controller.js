import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import expenseService from '../services/expense.service.js';
import expenseReportService from '../services/expenseReport.service.js';
import { MESSAGES } from '../constants/messages.js';

export const listExpenses = catchAsync(async (req, res) => {
  const { items, meta } = await expenseService.list(req.query, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.EXPENSE.LIST_FETCHED, data: items, meta });
});

export const getExpenseSummary = catchAsync(async (req, res) => {
  const summary = await expenseService.summary(req.query, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.EXPENSE.SUMMARY_FETCHED, data: summary });
});

export const getExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getById(req.params.id, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.EXPENSE.FETCHED, data: { expense } });
});

export const createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.create(req.body, req.user, req.user.roles);
  return ApiResponse.created(res, { message: MESSAGES.EXPENSE.CREATED, data: { expense } });
});

export const updateExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.update(req.params.id, req.body, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.EXPENSE.UPDATED, data: { expense } });
});

export const deleteExpense = catchAsync(async (req, res) => {
  await expenseService.remove(req.params.id, req.user, req.user.roles);
  return ApiResponse.send(res, { message: MESSAGES.EXPENSE.DELETED });
});

export const exportExpensePdf = catchAsync(async (req, res) => {
  await expenseReportService.streamPdf(req.query, req.user, req.user.roles, res);
});
