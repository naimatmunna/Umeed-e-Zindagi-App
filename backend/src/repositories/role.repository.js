import BaseRepository from './base.repository.js';
import Role from '../models/role.model.js';

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  findBySlug(slug) {
    return this.model.findOne({ slug: slug?.toLowerCase() }).exec();
  }
}

export default new RoleRepository();
