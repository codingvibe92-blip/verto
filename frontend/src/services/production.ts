import client, { apiErrorMessage } from '../api/client';
import { Paginated } from './types';

export interface BOMItem {
  id?: number;
  bom_id?: number;
  raw_material_id: number;
  raw_material_name?: string;
  raw_material_sku?: string;
  quantity: number | string;
  unit: string;
  cost?: string;
}

export interface BOM {
  id: number;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  name: string;
  description: string | null;
  yield_quantity: string;
  wastage_percent: string;
  status: string;
  version: number;
  created_at: string;
  items?: BOMItem[];
}

export interface ProductionOrder {
  id: number;
  order_number: string;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  bom_id: number | null;
  bom_name?: string;
  quantity: number;
  status: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  planned_start: string | null;
  planned_end: string | null;
  started_at: string | null;
  completed_at: string | null;
  approved_by: number | null;
  created_at: string;
  items?: any[];
  materials?: any[];
  quality_checks?: any[];
}

export interface QualityCheck {
  id: number;
  production_order_id: number;
  order_number?: string;
  product_id: number;
  product_name?: string;
  quantity_checked: number;
  passed_qty: number;
  failed_qty: number;
  remarks: string | null;
  checked_by_name?: string;
  checked_at: string;
}

export const ProductionService = {
  errorMessage: apiErrorMessage,

  // BOM
  async listBOMs(params?: Record<string, unknown>): Promise<Paginated<BOM>> {
    const res = await client.get('/boms', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async getBOM(id: number): Promise<BOM> {
    const res = await client.get(`/boms/${id}`);
    return res.data.data;
  },

  async createBOM(data: {
    product_id: number;
    name: string;
    description?: string;
    yield_quantity?: number;
    wastage_percent?: number;
    items: Array<{ raw_material_id: number; quantity: number; unit?: string }>;
  }): Promise<BOM> {
    const res = await client.post('/boms', data);
    return res.data.data;
  },

  async updateBOM(id: number, data: Partial<BOM>): Promise<BOM> {
    const res = await client.put(`/boms/${id}`, data);
    return res.data.data;
  },

  async deleteBOM(id: number): Promise<void> {
    await client.delete(`/boms/${id}`);
  },

  // Production Orders
  async listOrders(params?: Record<string, unknown>): Promise<Paginated<ProductionOrder>> {
    const res = await client.get('/production/orders', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async getOrder(id: number): Promise<ProductionOrder> {
    const res = await client.get(`/production/orders/${id}`);
    return res.data.data;
  },

  async createOrder(data: {
    product_id: number;
    bom_id?: number;
    quantity: number;
    planned_start?: string;
    planned_end?: string;
  }): Promise<ProductionOrder> {
    const res = await client.post('/production/orders', data);
    return res.data.data;
  },

  async startOrder(id: number): Promise<ProductionOrder> {
    const res = await client.post(`/production/orders/${id}/start`);
    return res.data.data;
  },

  async completeOrder(id: number): Promise<ProductionOrder> {
    const res = await client.post(`/production/orders/${id}/complete`);
    return res.data.data;
  },

  async cancelOrder(id: number, reason?: string): Promise<ProductionOrder> {
    const res = await client.post(`/production/orders/${id}/cancel`, { reason });
    return res.data.data;
  },

  // Quality Checks
  async listQualityChecks(params?: Record<string, unknown>): Promise<Paginated<QualityCheck>> {
    const res = await client.get('/production/quality-checks', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async createQualityCheck(data: {
    production_order_id: number;
    product_id: number;
    quantity_checked: number;
    passed_qty: number;
    failed_qty: number;
    remarks?: string;
    warehouse_id?: number;
  }): Promise<void> {
    await client.post('/production/quality-checks', data);
  },
};
