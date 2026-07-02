import BaseRepository from './base.repository.js';
import User from '../models/user.model.js';

const ROLE_POPULATE = { path: 'roleId', select: 'name slug description isActive' };

/**
 * User-specific data access. Extends BaseRepository with queries that must
 * explicitly select normally-hidden fields (password, token hashes).
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email, { withSecret = false, populate = true } = {}) {
    let q = this.model.findOne({ email: email?.toLowerCase() });
    if (withSecret) q = q.select('+password +refreshTokenHashes');
    if (populate) q = q.populate(ROLE_POPULATE);
    return q.exec();
  }

  findByIdPopulated(id) {
    return this.model.findById(id).populate(ROLE_POPULATE).exec();
  }

  findByIdWithSecret(id) {
    return this.model.findById(id).select('+password +refreshTokenHashes').populate(ROLE_POPULATE).exec();
  }

  findByResetToken(hashedToken) {
    return this.model
      .findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: new Date() } })
      .select('+passwordResetToken +passwordResetExpires')
      .populate(ROLE_POPULATE)
      .exec();
  }

  findByVerifyToken(hashedToken) {
    return this.model
      .findOne({ emailVerifyToken: hashedToken, emailVerifyExpires: { $gt: new Date() } })
      .select('+emailVerifyToken +emailVerifyExpires')
      .populate(ROLE_POPULATE)
      .exec();
  }

  paginate(options) {
    return super.paginate({ ...options, populate: ROLE_POPULATE });
  }

  findById(id, options = {}) {
    return super.findById(id, { ...options, populate: ROLE_POPULATE });
  }
}

export default new UserRepository();
