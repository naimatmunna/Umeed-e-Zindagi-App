import Category from '../models/category.model.js';
import logger from '../utils/logger.js';

export const SEED_CATEGORIES = [
  { name: 'Food & Dining', slug: 'food', color: '#FF9500', icon: 'utensils' },
  { name: 'Transport', slug: 'transport', color: '#007AFF', icon: 'car' },
  { name: 'Housing & Rent', slug: 'housing', color: '#5856D6', icon: 'home' },
  { name: 'Utilities', slug: 'utilities', color: '#34C759', icon: 'zap' },
  { name: 'Healthcare', slug: 'healthcare', color: '#FF2D55', icon: 'heart' },
  { name: 'Entertainment', slug: 'entertainment', color: '#AF52DE', icon: 'film' },
  { name: 'Shopping', slug: 'shopping', color: '#FF6482', icon: 'shopping-bag' },
  { name: 'Education', slug: 'education', color: '#5AC8FA', icon: 'book' },
  { name: 'Personal Care', slug: 'personal_care', color: '#FFCC00', icon: 'star' },
  { name: 'Other', slug: 'other', color: '#8E8E93', icon: 'tag' },
];

export const seedCategories = async () => {
  for (const data of SEED_CATEGORIES) {
    const exists = await Category.exists({ slug: data.slug });
    if (!exists) {
      await Category.create(data);
      logger.info(`Seeded category: ${data.slug}`);
    }
  }
};

export const getCategoryIdBySlug = async (slug) => {
  const category = await Category.findOne({ slug }).select('_id').lean();
  if (!category) throw new Error(`Category not found for slug: ${slug}`);
  return category._id;
};

export const destroyCategories = async () => {
  await Category.deleteMany({});
  logger.info('Removed all categories');
};
