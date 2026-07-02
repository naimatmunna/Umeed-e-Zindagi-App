import BaseRepository from './base.repository.js';
import Category from '../models/category.model.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  findBySlug(slug) {
    return this.model.findOne({ slug: slug?.toLowerCase() }).exec();
  }
}

export default new CategoryRepository();
