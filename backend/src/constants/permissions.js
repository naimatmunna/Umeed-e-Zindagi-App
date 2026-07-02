/**
 * Granular permissions in `resource:action` form.
 * Roles map to sets of these (see security/rbac.js), so you can grant
 * fine-grained access without inventing new roles.
 */
export const PERMISSIONS = Object.freeze({
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',

  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  CATEGORY_CREATE: 'category:create',
  CATEGORY_READ: 'category:read',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',

  EXPENSE_CREATE: 'expense:create',
  EXPENSE_READ: 'expense:read',
  EXPENSE_UPDATE: 'expense:update',
  EXPENSE_DELETE: 'expense:delete',
  EXPENSE_READ_ALL: 'expense:read_all',

  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_READ_ALL: 'attendance:read_all',
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_DELETE: 'attendance:delete',
  ATTENDANCE_CHECKIN: 'attendance:checkin',

  OFFICE_SETTINGS_READ: 'office_settings:read',
  OFFICE_SETTINGS_UPDATE: 'office_settings:update',

  AUDIT_READ: 'audit:read',
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  PATIENT_READ: 'patient:read',
  PATIENT_CREATE: 'patient:create',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',
  PATIENT_PDF_DOWNLOAD: 'patient:pdf_download',
  PATIENT_PDF_PRINT: 'patient:pdf_print',
  PATIENT_DOCUMENT_MANAGE: 'patient:document_manage',
});

export const PERMISSION_VALUES = Object.freeze(Object.values(PERMISSIONS));
