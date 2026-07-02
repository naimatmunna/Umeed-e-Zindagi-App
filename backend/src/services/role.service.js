import roleRepository from '../repositories/role.repository.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { parseQueryOptions } from '../utils/pagination.js';

const SEARCHABLE = ['name', 'slug', 'description'];

class RoleService {
  async list(query) {
    const options = parseQueryOptions(query, { searchableFields: SEARCHABLE });
    if (query.activeOnly === true || query.activeOnly === 'true') {
      options.filter = { ...options.filter, isActive: true };
    }
    return roleRepository.paginate(options);
  }

  async getById(id) {
    const role = await roleRepository.findById(id);
    if (!role) throw ApiError.notFound('Role not found', { code: 'ROLE_NOT_FOUND' });
    return role;
  }

  async getBySlug(slug) {
    const role = await roleRepository.findBySlug(slug);
    if (!role) throw ApiError.notFound('Role not found', { code: 'ROLE_NOT_FOUND' });
    return role;
  }

  async create(payload) {
    if (await roleRepository.exists({ slug: payload.slug.toLowerCase() })) {
      throw ApiError.conflict('Role slug already exists', { code: 'ROLE_SLUG_IN_USE' });
    }
    if (await roleRepository.exists({ name: payload.name })) {
      throw ApiError.conflict('Role name already exists', { code: 'ROLE_NAME_IN_USE' });
    }
    return roleRepository.create(payload);
  }

  async update(id, payload) {
    if (payload.slug) {
      const existing = await roleRepository.findOne({
        slug: payload.slug.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) throw ApiError.conflict('Role slug already exists', { code: 'ROLE_SLUG_IN_USE' });
    }
    if (payload.name) {
      const existing = await roleRepository.findOne({ name: payload.name, _id: { $ne: id } });
      if (existing) throw ApiError.conflict('Role name already exists', { code: 'ROLE_NAME_IN_USE' });
    }
    const role = await roleRepository.updateById(id, payload);
    if (!role) throw ApiError.notFound('Role not found', { code: 'ROLE_NOT_FOUND' });
    return role;
  }

  async remove(id) {
    const inUse = await userRepository.exists({ roleId: id });
    if (inUse) {
      throw ApiError.conflict('Cannot delete a role assigned to users', { code: 'ROLE_IN_USE' });
    }
    const role = await roleRepository.deleteById(id);
    if (!role) throw ApiError.notFound('Role not found', { code: 'ROLE_NOT_FOUND' });
    return role;
  }
}

export default new RoleService();
