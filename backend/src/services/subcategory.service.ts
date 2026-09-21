import { CategoryRepository } from '../repositories/category.repository';
import { SubcategoryInput, SubcategoryRepository } from '../repositories/subcategory.repository';
import { ProductRepository } from '../repositories/product.repository';
import { slugify } from '../utils/generate';
import { ApiError } from '../utils/errors';
import { PaginationParams } from '../utils/pagination';

export const SubcategoryService = {
  list(opts: PaginationParams & { category_id?: number; search?: string; status?: string }) {
    if (opts.category_id) {
      const category = CategoryRepository.findById(opts.category_id);
      if (!category) throw ApiError.notFound('Category not found');
    }
    return SubcategoryRepository.list(opts);
  },

  async listByCategory(categoryId: number, status?: string) {
    const category = await CategoryRepository.findById(categoryId);
    if (!category) throw ApiError.notFound('Category not found');
    return SubcategoryRepository.findAllByCategory(categoryId, status);
  },

  async get(id: number) {
    const subcategory = await SubcategoryRepository.findById(id);
    if (!subcategory) throw ApiError.notFound('Subcategory not found');
    return subcategory;
  },

  async create(input: SubcategoryInput) {
    const category = await CategoryRepository.findById(input.category_id);
    if (!category) throw ApiError.notFound('Category not found');

    const slug = input.slug || slugify(input.name);
    if (!slug) throw ApiError.badRequest('Subcategory requires a valid slug');
    if (await SubcategoryRepository.slugExists(slug)) {
      throw ApiError.conflict('Subcategory slug already exists');
    }

    const id = await SubcategoryRepository.create({ ...input, slug });
    return this.get(id);
  },

  async update(id: number, input: Partial<SubcategoryInput>) {
    const subcategory = await SubcategoryRepository.findById(id);
    if (!subcategory) throw ApiError.notFound('Subcategory not found');

    if (input.category_id) {
      const category = await CategoryRepository.findById(input.category_id);
      if (!category) throw ApiError.notFound('Category not found');
    }

    const slug = input.slug ? slugify(input.slug) : undefined;
    if (slug && slug !== subcategory.slug) {
      if (await SubcategoryRepository.slugExists(slug, id)) {
        throw ApiError.conflict('Subcategory slug already exists');
      }
    }

    await SubcategoryRepository.update(id, { ...input, slug });
    return this.get(id);
  },

  async remove(id: number) {
    const subcategory = await SubcategoryRepository.findById(id);
    if (!subcategory) throw ApiError.notFound('Subcategory not found');

    const used = await ProductRepository.countBySubcategory(id);
    if (used > 0) {
      throw ApiError.conflict('Subcategory has products assigned; remove them first');
    }

    await SubcategoryRepository.remove(id);
  },
};