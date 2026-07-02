import { Router } from 'express';
import * as categoryController from '../../controllers/category.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermissions } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import {
  listCategoriesSchema,
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../../validators/category.validator.js';

const router = Router();
const P = PERMISSIONS;

router.use(authenticate);

router
  .route('/')
  .get(requirePermissions(P.CATEGORY_READ), validate(listCategoriesSchema), categoryController.listCategories)
  .post(requirePermissions(P.CATEGORY_CREATE), validate(createCategorySchema), categoryController.createCategory);

router
  .route('/:id')
  .get(requirePermissions(P.CATEGORY_READ), validate(categoryIdSchema), categoryController.getCategory)
  .patch(requirePermissions(P.CATEGORY_UPDATE), validate(updateCategorySchema), categoryController.updateCategory)
  .delete(requirePermissions(P.CATEGORY_DELETE), validate(categoryIdSchema), categoryController.deleteCategory);

export default router;
