export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: 'access_token',
  THEME: 'theme',
});

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
});

export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  EXPENSES: '/dashboard/expenses',
  CATEGORIES: '/dashboard/categories',
  ATTENDANCE: '/dashboard/attendance',
  PATIENTS: '/dashboard/patients',
  PATIENT_NEW: '/dashboard/patients/new',
  PATIENT_DETAIL: '/dashboard/patients/:id',
  PATIENT_EDIT: '/dashboard/patients/:id/edit',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
  NOT_FOUND: '/404',
});
