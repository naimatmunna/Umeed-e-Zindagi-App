import { Router } from 'express';
import * as roleController from '../../controllers/role.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermissions } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import {
  listRolesSchema,
  roleIdSchema,
  createRoleSchema,
  updateRoleSchema,
} from '../../validators/role.validator.js';

const router = Router();
const P = PERMISSIONS;

router.use(authenticate);

router
  .route('/')
  .get(requirePermissions(P.ROLE_READ), validate(listRolesSchema), roleController.listRoles)
  .post(requirePermissions(P.ROLE_CREATE), validate(createRoleSchema), roleController.createRole);

router
  .route('/:id')
  .get(requirePermissions(P.ROLE_READ), validate(roleIdSchema), roleController.getRole)
  .patch(requirePermissions(P.ROLE_UPDATE), validate(updateRoleSchema), roleController.updateRole)
  .delete(requirePermissions(P.ROLE_DELETE), validate(roleIdSchema), roleController.deleteRole);

export default router;
