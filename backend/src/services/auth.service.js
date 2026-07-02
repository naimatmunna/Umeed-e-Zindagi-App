import userRepository from '../repositories/user.repository.js';
import roleService from './role.service.js';
import tokenService from './token.service.js';
import emailService from './email.service.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';
import { createHashedToken, hashToken } from '../utils/crypto.js';
import { getStorage } from '../storage/index.js';

const FIFTEEN_MIN = 15 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const toAuthUser = (user) => {
  const role = user.roleId?.slug ? user.roleId : user.role;
  const roleSlug = role?.slug;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName ?? `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    joiningDate: user.joiningDate,
    salary: user.salary,
    roleId: role?.id ?? user.roleId?._id ?? user.roleId,
    role: role ? { id: role.id ?? role._id, name: role.name, slug: role.slug } : undefined,
    roles: roleSlug ? [roleSlug] : [],
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    avatar: user.avatar?.url ? { url: user.avatar.url, publicId: user.avatar.publicId } : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Orchestrates authentication use-cases. Controllers stay thin;
 * all business rules and side effects live here.
 */
class AuthService {
  async register({ firstName, lastName, email, password }) {
    if (await userRepository.exists({ email: email.toLowerCase() })) {
      throw ApiError.conflict(MESSAGES.AUTH.EMAIL_IN_USE, { code: 'EMAIL_IN_USE' });
    }

    const defaultRole = await roleService.getBySlug(ROLES.USER);
    const { raw, hashed } = createHashedToken();
    const user = await userRepository.create({
      firstName,
      lastName,
      email,
      password,
      roleId: defaultRole.id,
      emailVerifyToken: hashed,
      emailVerifyExpires: new Date(Date.now() + DAY),
    });

    const populated = await userRepository.findByIdPopulated(user.id);
    await emailService.sendVerificationEmail(populated.email, raw);
    return toAuthUser(populated);
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, { withSecret: true });
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS, { code: 'INVALID_CREDENTIALS' });
    }
    if (!user.isActive) throw ApiError.forbidden('Account is disabled', { code: 'ACCOUNT_DISABLED' });

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await tokenService.issuePair(user);
    return { user: toAuthUser(user), tokens };
  }

  refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized('Refresh token missing', { code: 'NO_REFRESH' });
    return tokenService.rotate(refreshToken);
  }

  logout(userId, refreshToken) {
    return tokenService.revoke(userId, refreshToken);
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const { raw, hashed } = createHashedToken();
    const doc = await userRepository.findByIdWithSecret(user.id);
    doc.passwordResetToken = hashed;
    doc.passwordResetExpires = new Date(Date.now() + FIFTEEN_MIN);
    await doc.save();

    await emailService.sendPasswordResetEmail(user.email, raw);
  }

  async resetPassword({ token, password }) {
    const user = await userRepository.findByResetToken(hashToken(token));
    if (!user) throw ApiError.badRequest('Invalid or expired reset token', { code: 'BAD_RESET' });

    const doc = await userRepository.findByIdWithSecret(user.id);
    doc.password = password;
    doc.passwordResetToken = undefined;
    doc.passwordResetExpires = undefined;
    doc.refreshTokenHashes = [];
    await doc.save();
  }

  async verifyEmail(token) {
    const user = await userRepository.findByVerifyToken(hashToken(token));
    if (!user) throw ApiError.badRequest('Invalid or expired token', { code: 'BAD_VERIFY' });

    const doc = await userRepository.findById(user.id);
    doc.isEmailVerified = true;
    doc.emailVerifyToken = undefined;
    doc.emailVerifyExpires = undefined;
    await doc.save();
  }

  async changePassword({ userId, currentPassword, newPassword }) {
    const user = await userRepository.findByIdWithSecret(userId);
    if (!user || !(await user.comparePassword(currentPassword))) {
      throw ApiError.badRequest('Current password is incorrect', { code: 'BAD_CURRENT_PASSWORD' });
    }
    user.password = newPassword;
    user.refreshTokenHashes = [];
    await user.save();
  }

  async getProfile(userId) {
    const user = await userRepository.findByIdPopulated(userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Account is inactive or removed');
    }
    return toAuthUser(user);
  }

  async updateProfile(userId, { firstName, lastName, email }) {
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND, { code: 'USER_NOT_FOUND' });
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      if (await userRepository.exists({ email: email.toLowerCase() })) {
        throw ApiError.conflict(MESSAGES.AUTH.EMAIL_IN_USE, { code: 'EMAIL_IN_USE' });
      }
      user.email = email.toLowerCase();
    }
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    await user.save();

    const populated = await userRepository.findByIdPopulated(userId);
    return toAuthUser(populated);
  }

  async uploadAvatar(userId, file) {
    if (!file?.buffer) {
      throw ApiError.badRequest('No file uploaded', { code: 'NO_FILE' });
    }

    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND, { code: 'USER_NOT_FOUND' });
    }

    const storage = getStorage();
    if (user.avatar?.publicId) {
      try {
        await storage.delete(user.avatar.publicId);
      } catch {
        /* ignore missing file */
      }
    }

    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const { url, publicId } = await storage.upload(file.buffer, {
      filename: `avatars/${userId}-${Date.now()}.${ext}`,
    });

    user.avatar = { url, publicId };
    await user.save();

    const populated = await userRepository.findByIdPopulated(userId);
    return toAuthUser(populated);
  }

  async removeAvatar(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND, { code: 'USER_NOT_FOUND' });

    if (user.avatar?.publicId) {
      const storage = getStorage();
      try {
        await storage.delete(user.avatar.publicId);
      } catch {
        /* ignore */
      }
    }
    user.avatar = undefined;
    await user.save();

    const populated = await userRepository.findByIdPopulated(userId);
    return toAuthUser(populated);
  }
}

export default new AuthService();
