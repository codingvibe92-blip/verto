import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/validate';
import { CategoryService } from '../services/category.service';
import { SubcategoryService } from '../services/subcategory.service';
import { ProductService } from '../services/product.service';
import { parsePagination } from '../utils/pagination';
import { ApiError } from '../utils/errors';

export const CategoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req.query);
    const data = await CategoryService.list({
      ...pagination,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
    });
    res.json({ success: true, message: 'Categories fetched', data: data.rows, meta: data.meta });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await CategoryService.get(Number(req.params.id));
    res.json({ success: true, message: 'Category fetched', data });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await CategoryService.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await CategoryService.update(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Category updated', data });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await CategoryService.remove(Number(req.params.id));
    res.json({ success: true, message: 'Category deleted' });
  }),
};

export const SubcategoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req.query);
    const data = await SubcategoryService.list({
      ...pagination,
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
    });
    res.json({ success: true, message: 'Subcategories fetched', data: data.rows, meta: data.meta });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await SubcategoryService.get(Number(req.params.id));
    res.json({ success: true, message: 'Subcategory fetched', data });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await SubcategoryService.create(req.body);
    res.status(201).json({ success: true, message: 'Subcategory created', data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await SubcategoryService.update(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Subcategory updated', data });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await SubcategoryService.remove(Number(req.params.id));
    res.json({ success: true, message: 'Subcategory deleted' });
  }),
};

export const ProductController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req.query);
    const data = await ProductService.list({
      ...pagination,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      subcategory_id: req.query.subcategory_id ? Number(req.query.subcategory_id) : undefined,
      publicOnly: req.query.public === 'true',
      sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
      order: req.query.order === 'asc' || req.query.order === 'desc' ? req.query.order : undefined,
    });
    res.json({ success: true, message: 'Products fetched', data: data.rows, meta: data.meta });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await ProductService.getDetail(Number(req.params.id));
    res.json({ success: true, message: 'Product fetched', data });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const data = await ProductService.getBySlug(req.params.slug);
    res.json({ success: true, message: 'Product fetched', data });
  }),

  exportCsv: asyncHandler(async (req: Request, res: Response) => {
    const csv = await ProductService.exportCsv({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      subcategory_id: req.query.subcategory_id ? Number(req.query.subcategory_id) : undefined,
    });
    res
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader('Content-Disposition', 'attachment; filename="products.csv"')
      .send(csv);
  }),

  importCsv: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('CSV file is required');
    const text = req.file.buffer.toString('utf-8');
    const result = await ProductService.importCsv(text);
    res.json({
      success: true,
      message: `Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`,
      data: result,
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await ProductService.create(req.body);
    res.status(201).json({ success: true, message: 'Product created', data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await ProductService.update(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Product updated', data });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await ProductService.remove(Number(req.params.id));
    res.json({ success: true, message: 'Product archived' });
  }),
};