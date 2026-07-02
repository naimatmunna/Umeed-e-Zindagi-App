import { Router } from 'express';
import * as officeSettingsController from '../../controllers/officeSettings.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermissions, requireRoles } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import { ROLES } from '../../constants/roles.js';
import { updateOfficeSettingsSchema } from '../../validators/officeSettings.validator.js';

const router = Router();

router.use(authenticate);

router
  .route('/office')
  .get(requirePermissions(PERMISSIONS.OFFICE_SETTINGS_READ), officeSettingsController.getOfficeSettings)
  .patch(
    requireRoles(ROLES.SUPER_ADMIN),
    validate(updateOfficeSettingsSchema),
    officeSettingsController.updateOfficeSettings,
  );

export default router;
