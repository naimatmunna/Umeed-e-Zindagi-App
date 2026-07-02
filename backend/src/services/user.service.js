import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { parseQueryOptions } from '../utils/pagination.js';

const SEARCHABLE = ['firstName', 'lastName', 'email'];

class UserService {
  async list(query) {
    const options = parseQueryOptions(query, { searchableFields: SEARCHABLE });
    return userRepository.paginate(options);
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND, { code: 'USER_NOT_FOUND' });
    return user;
  }

  async create(payload) {
    if (await userRepository.exists({ email: payload.email.toLowerCase() })) {
      throw ApiError.conflict(MESSAGES.AUTH.EMAIL_IN_USE, { code: 'EMAIL_IN_USE' });
    }
    const user = await userRepository.create(payload);
    return userRepository.findById(user.id);
  }

  async update(id, payload) {
    const user = await userRepository.updateById(id, payload, {
      new: true,
      runValidators: true,
      populate: { path: 'roleId', select: 'name slug description isActive' },
    });
    if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND, { code: 'USER_NOT_FOUND' });
    return user;
  }

  async remove(id) {
    const user = await userRepository.deleteById(id);
    if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND, { code: 'USER_NOT_FOUND' });
    return user;
  }
}

export default new UserService();
