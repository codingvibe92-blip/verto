import { CategoryRepository, CategoryInput } from '../repositories/category.repository';
import { ProductRepository } from '../repositories/product.repository';
import { slugify } from '../utils/generate';
import { ApiError } from '../utils/errors';
import { PaginationParams } from '../utils/pagination';

export const CategoryService = {
  list(opts: PaginationParams & { search?: string; status?: string }) {
    return CategoryRepository.list(opts);
  },

  async get(id: number) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw ApiError.notFound('Category not found');
    return category;
  },

  async create(input: CategoryInput) {
    const slug = input.slug || slugify(input.name);
    if (!slug) throw ApiError.badRequest('Category requires a valid slug');
    if (await CategoryRepository.slugExists(slug)) {
      throw ApiError.conflict('Category slug already exists');
    }
    const id = await CategoryRepository.create({ ...input, slug });
    const created = await CategoryRepository.findById(id);
    return created;
  },

  async update(id: number, input: Partial<CategoryInput>) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw ApiError.notFound('Category not found');

    const slug = input.slug ? slugify(input.slug) : undefined;
    if (slug && slug !== category.slug) {
      if (await CategoryRepository.slugExists(slug, id)) {
        throw ApiError.conflict('Category slug already exists');
      }
    }

    await CategoryRepository.update(id, { ...input, slug });
    return CategoryRepository.findById(id);
  },

  async remove(id: number) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw ApiError.notFound('Category not found');

    const used = await ProductRepository.countByCategory(id);
    if (used > 0) {
      throw ApiError.conflict('Category has products assigned; archive those first');
    }

    await CategoryRepository.remove(id);
  },
};