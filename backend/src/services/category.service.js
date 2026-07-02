import categoryRepository from '../repositories/category.repository.js';
import expenseRepository from '../repositories/expense.repository.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { parseQueryOptions } from '../utils/pagination.js';

const SEARCHABLE = ['name', 'slug'];

class CategoryService {
  async list(query) {
    const options = parseQueryOptions(query, { searchableFields: SEARCHABLE });
    if (query.activeOnly === true || query.activeOnly === 'true') {
      options.filter = { ...options.filter, isActive: true };
    }
    return categoryRepository.paginate(options);
  }

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw ApiError.notFound(MESSAGES.CATEGORY.NOT_FOUND, { code: 'CATEGORY_NOT_FOUND' });
    return category;
  }

  async create(payload) {
    if (await categoryRepository.exists({ slug: payload.slug.toLowerCase() })) {
      throw ApiError.conflict('Category slug already exists', { code: 'CATEGORY_SLUG_IN_USE' });
    }
    if (await categoryRepository.exists({ name: payload.name })) {
      throw ApiError.conflict('Category name already exists', { code: 'CATEGORY_NAME_IN_USE' });
    }
    return categoryRepository.create(payload);
  }

  async update(id, payload) {
    if (payload.slug) {
      const existing = await categoryRepository.findOne({
        slug: payload.slug.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) throw ApiError.conflict('Category slug already exists', { code: 'CATEGORY_SLUG_IN_USE' });
    }
    const category = await categoryRepository.updateById(id, payload);
    if (!category) throw ApiError.notFound(MESSAGES.CATEGORY.NOT_FOUND, { code: 'CATEGORY_NOT_FOUND' });
    return category;
  }

  async remove(id) {
    const inUse = await expenseRepository.exists({ categoryId: id });
    if (inUse) {
      throw ApiError.conflict('Cannot delete a category used by expenses', { code: 'CATEGORY_IN_USE' });
    }
    const category = await categoryRepository.deleteById(id);
    if (!category) throw ApiError.notFound(MESSAGES.CATEGORY.NOT_FOUND, { code: 'CATEGORY_NOT_FOUND' });
    return category;
  }
}

export default new CategoryService();
