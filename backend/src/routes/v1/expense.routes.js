import { Router } from 'express';
import * as expenseController from '../../controllers/expense.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermissions } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import {
  listExpensesSchema,
  expenseSummarySchema,
  expenseExportSchema,
  expenseIdSchema,
  createExpenseSchema,
  updateExpenseSchema,
} from '../../validators/expense.validator.js';

const router = Router();
const P = PERMISSIONS;

router.use(authenticate);

router
  .route('/summary')
  .get(requirePermissions(P.EXPENSE_READ), validate(expenseSummarySchema), expenseController.getExpenseSummary);

router
  .route('/export/pdf')
  .get(requirePermissions(P.EXPENSE_READ), validate(expenseExportSchema), expenseController.exportExpensePdf);

router
  .route('/')
  .get(requirePermissions(P.EXPENSE_READ), validate(listExpensesSchema), expenseController.listExpenses)
  .post(requirePermissions(P.EXPENSE_CREATE), validate(createExpenseSchema), expenseController.createExpense);

router
  .route('/:id')
  .get(requirePermissions(P.EXPENSE_READ), validate(expenseIdSchema), expenseController.getExpense)
  .patch(requirePermissions(P.EXPENSE_UPDATE), validate(updateExpenseSchema), expenseController.updateExpense)
  .delete(requirePermissions(P.EXPENSE_DELETE), validate(expenseIdSchema), expenseController.deleteExpense);

export default router;
