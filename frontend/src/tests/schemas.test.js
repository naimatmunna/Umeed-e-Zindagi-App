import { describe, it, expect } from 'vitest';
import { userFormSchema, roleFormSchema, registerSchema } from '@/schemas/auth.schema.js';

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Secret123!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing first name', () => {
    const result = registerSchema.safeParse({
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Secret123!',
    });
    expect(result.success).toBe(false);
  });
});

describe('userFormSchema', () => {
  it('accepts valid user form data', () => {
    const result = userFormSchema.safeParse({
      firstName: 'Sam',
      lastName: 'Taylor',
      email: 'sam@example.com',
      password: 'Secret123!',
      joiningDate: '2024-01-15',
      salary: 50000,
      roleId: '507f1f77bcf86cd799439011',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative salary', () => {
    const result = userFormSchema.safeParse({
      firstName: 'Sam',
      lastName: 'Taylor',
      email: 'sam@example.com',
      joiningDate: '2024-01-15',
      salary: -1,
      roleId: '507f1f77bcf86cd799439011',
    });
    expect(result.success).toBe(false);
  });
});

describe('roleFormSchema', () => {
  it('accepts valid role data', () => {
    const result = roleFormSchema.safeParse({
      name: 'Analyst',
      slug: 'analyst',
      description: 'Read-only role',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug characters', () => {
    const result = roleFormSchema.safeParse({
      name: 'Bad Role',
      slug: 'Bad-Slug',
    });
    expect(result.success).toBe(false);
  });
});
