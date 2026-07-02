import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[a-z]/, 'Include a lowercase letter')
    .regex(/[0-9]/, 'Include a number'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
  email: z.string().email('Enter a valid email'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
});

export const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(128).optional().or(z.literal('')),
  joiningDate: z.string().min(1, 'Joining date is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive'),
  roleId: z.string().min(1, 'Role is required'),
  isActive: z.boolean().optional(),
});

export const roleFormSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers, underscores'),
  description: z.string().max(280).optional(),
  isActive: z.boolean().optional(),
});
