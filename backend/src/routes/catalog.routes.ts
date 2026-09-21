import { Router } from 'express';
import {
  CategoryController,
  SubcategoryController,
  ProductController,
} from '../controllers/catalog.controller';
import { authenticate, authorizePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  productCreateSchema,
  productUpdateBodySchema,
  subcategoryCreateSchema,
  subcategoryUpdateSchema,
} from '../validators/catalog.validator';

const router = Router();

// Public product browsing (storefront)
router.get('/products/slug/:slug', ProductController.getBySlug);
router.get('/products', ProductController.list);

// Category management (GET is public for storefront; mutations are protected)
router.get('/categories', CategoryController.list);
router.get('/categories/:id', CategoryController.get);
router.post(
  '/categories',
  authenticate,
  authorizePermission('categories.create'),
  validate(categoryCreateSchema),
  CategoryController.create
);
router.put(
  '/categories/:id',
  authenticate,
  authorizePermission('categories.update'),
  validate(categoryUpdateSchema),
  CategoryController.update
);
router.delete(
  '/categories/:id',
  authenticate,
  authorizePermission('categories.delete'),
  CategoryController.remove
);

// Subcategory management
router.get('/subcategories', SubcategoryController.list);
router.get(
  '/subcategories/:id',
  authenticate,
  authorizePermission('categories.view'),
  SubcategoryController.get
);
router.post(
  '/subcategories',
  authenticate,
  authorizePermission('categories.create'),
  validate(subcategoryCreateSchema),
  SubcategoryController.create
);
router.put(
  '/subcategories/:id',
  authenticate,
  authorizePermission('categories.update'),
  validate(subcategoryUpdateSchema),
  SubcategoryController.update
);
router.delete(
  '/subcategories/:id',
  authenticate,
  authorizePermission('categories.delete'),
  SubcategoryController.remove
);

// Product management (protected)
router.get(
  '/products/export',
  authenticate,
  authorizePermission('products.view'),
  ProductController.exportCsv
);
router.post(
  '/products/import',
  authenticate,
  authorizePermission('products.create'),
  upload.single('file'),
  ProductController.importCsv
);
router.get(
  '/products/:id',
  authenticate,
  authorizePermission('products.view'),
  ProductController.get
);
router.post(
  '/products',
  authenticate,
  authorizePermission('products.create'),
  validate(productCreateSchema),
  ProductController.create
);
router.put(
  '/products/:id',
  authenticate,
  authorizePermission('products.update'),
  validate(productUpdateBodySchema),
  ProductController.update
);
router.delete(
  '/products/:id',
  authenticate,
  authorizePermission('products.delete'),
  ProductController.remove
);

export default router;