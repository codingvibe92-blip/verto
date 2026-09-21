import client, { apiErrorMessage } from '../api/client';
import { Paginated } from './types';

export interface RawMaterial {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category_id: number | null;
  category_name?: string | null;
  unit: string;
  supplier_id: number | null;
  supplier_name?: string | null;
  cost: string | number;
  quantity_on_hand: string | number;
  reserved_quantity: string | number;
  min_quantity: string | number;
  max_quantity: string | number | null;
  reorder_level: string | number | null;
  storage_location: string | null;
  batch_no: string | null;
  expiry_date: string | null;
  status: string;
  created_at: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  contact_name?: string;
  contact_phone?: string;
  is_active: number;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  location?: string;
  updated_at: string;
}

export interface StockHistoryItem {
  id: number;
  inventory_id: number;
  product_name?: string;
  product_sku?: string;
  warehouse_name?: string;
  type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: number | null;
  notes: string | null;
  created_at: string;
}

export const InventoryService = {
  errorMessage: apiErrorMessage,

  // Raw Materials
  async listRawMaterials(params?: Record<string, unknown>): Promise<Paginated<RawMaterial>> {
    const res = await client.get('/raw-materials', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async getRawMaterial(id: number): Promise<RawMaterial> {
    const res = await client.get(`/raw-materials/${id}`);
    return res.data.data;
  },

  async createRawMaterial(data: Partial<RawMaterial>): Promise<RawMaterial> {
    const res = await client.post('/raw-materials', data);
    return res.data.data;
  },

  async updateRawMaterial(id: number, data: Partial<RawMaterial>): Promise<RawMaterial> {
    const res = await client.put(`/raw-materials/${id}`, data);
    return res.data.data;
  },

  async deleteRawMaterial(id: number): Promise<void> {
    await client.delete(`/raw-materials/${id}`);
  },

  // Warehouses
  async listWarehouses(params?: Record<string, unknown>): Promise<Paginated<Warehouse>> {
    const res = await client.get('/warehouses', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async allWarehouses(): Promise<Warehouse[]> {
    const res = await client.get('/warehouses/all');
    return res.data.data;
  },

  async createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
    const res = await client.post('/warehouses', data);
    return res.data.data;
  },

  async updateWarehouse(id: number, data: Partial<Warehouse>): Promise<Warehouse> {
    const res = await client.put(`/warehouses/${id}`, data);
    return res.data.data;
  },

  // Inventory & Stock
  async listInventory(params?: Record<string, unknown>): Promise<Paginated<InventoryItem>> {
    const res = await client.get('/inventory', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async receiveStock(data: {
    product_id: number;
    warehouse_id: number;
    quantity: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
  }): Promise<void> {
    await client.post('/inventory/receive', data);
  },

  async adjustStock(data: {
    inventory_id: number;
    quantity_change: number;
    reason: string;
    notes?: string;
  }): Promise<void> {
    await client.post('/inventory/adjust', data);
  },

  async transferStock(data: {
    product_id: number;
    source_warehouse_id: number;
    destination_warehouse_id: number;
    quantity: number;
    notes?: string;
  }): Promise<void> {
    await client.post('/inventory/transfer', data);
  },

  async stockHistory(params?: Record<string, unknown>): Promise<Paginated<StockHistoryItem>> {
    const res = await client.get('/stock-history', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },
};
