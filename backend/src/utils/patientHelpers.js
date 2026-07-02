/** Pakistan CNIC: 12345-1234567-1 or 13 digits */
export const normalizeCnic = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 13) return String(value).trim();
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const isValidCnic = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 13;
};

export const isValidPhone = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
};

export const generateSerial = async (repo, field, prefix, year) => {
  const count = await repo.countByYearPrefix(field, year);
  return `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return Math.max(0, age);
};
