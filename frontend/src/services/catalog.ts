import client, { apiErrorMessage } from '../api/client';

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  sort_order: number;
  created_at: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category_id: number | null;
  subcategory_id: number | null;
  brand: string | null;
  price: string;
  mrp: string | null;
  cost_price: string;
  tax_percent: string;
  discount_percent: string;
  selling_price: string;
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  min_stock: number;
  max_stock: number | null;
  status: string;
  tags: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  category_name?: string | null;
  subcategory_name?: string | null;
}

export interface ProductImage {
  url: string;
  alt_text?: string | null;
  is_primary?: boolean;
  sort_order?: number;
}

export interface ProductAttribute {
  attribute_key: string;
  attribute_value: string;
}

export interface ProductVariant {
  sku: string;
  name?: string | null;
  attributes?: Record<string, unknown> | null;
  price?: number;
  selling_price?: number;
}

export interface ProductDetail {
  product: Product;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
}

export interface Paginated<T> {
  rows: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface ProductPayload {
  sku: string;
  name: string;
  slug?: string;
  price: number;
  selling_price?: number;
  mrp?: number | null;
  cost_price?: number;
  tax_percent?: number;
  discount_percent?: number;
  status: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  brand?: string | null;
  description?: string;
  short_description?: string;
  tags?: string;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  min_stock?: number;
  max_stock?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}

export const CatalogService = {
  async listCategories(params: Record<string, unknown> = {}): Promise<Paginated<Category>> {
    const res = await client.get('/categories', { params });
    return res.data;
  },

  async createCategory(payload: { name: string; status?: string }): Promise<Category> {
    const res = await client.post('/categories', payload);
    return res.data.data;
  },

  async updateCategory(id: number, payload: Partial<{ name: string; status?: string; sort_order?: number }>): Promise<Category> {
    const res = await client.put(`/categories/${id}`, payload);
    return res.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await client.delete(`/categories/${id}`);
  },

  async listSubcategories(params: Record<string, unknown> = {}): Promise<Paginated<Subcategory>> {
    const res = await client.get('/subcategories', { params });
    return res.data;
  },

  async createSubcategory(payload: { category_id: number; name: string; status?: string }): Promise<Subcategory> {
    const res = await client.post('/subcategories', payload);
    return res.data.data;
  },

  async updateSubcategory(
    id: number,
    payload: Partial<{ category_id?: number; name: string; status?: string; description?: string }>
  ): Promise<Subcategory> {
    const res = await client.put(`/subcategories/${id}`, payload);
    return res.data.data;
  },

  async deleteSubcategory(id: number): Promise<void> {
    await client.delete(`/subcategories/${id}`);
  },

  async exportProducts(params: Record<string, unknown> = {}): Promise<void> {
    const res = await client.get('/products/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(res.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async importProducts(file: File): Promise<{ created: number; updated: number; skipped: number; errors: { row: number; sku?: string; error?: string }[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async listProducts(params: Record<string, unknown> = {}): Promise<Paginated<Product>> {
    const res = await client.get('/products', { params });
    return res.data;
  },

  async getProduct(id: number): Promise<ProductDetail> {
    const res = await client.get(`/products/${id}`);
    return res.data.data;
  },

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const res = await client.get(`/products/slug/${slug}`);
    return res.data.data;
  },

  async createProduct(payload: ProductPayload): Promise<ProductDetail> {
    const res = await client.post('/products', payload);
    return res.data.data;
  },

  async updateProduct(id: number, payload: Partial<ProductPayload>): Promise<ProductDetail> {
    const res = await client.put(`/products/${id}`, payload);
    return res.data.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await client.delete(`/products/${id}`);
  },

  errorMessage(err: unknown): string {
    return apiErrorMessage(err);
  },
};