import { ProductionRepository } from '../repositories/production.repository';
import { PaginationParams } from '../utils/pagination';

export const ProductionService = {
  // BOM
  async listBOMs(opts: PaginationParams & { search?: string; status?: string; product_id?: number }) {
    return ProductionRepository.listBOMs(opts);
  },

  async getBOM(id: number) {
    const bom = await ProductionRepository.findBOMById(id);
    if (!bom) throw new Error('BOM not found');
    return bom;
  },

  async createBOM(
    data: {
      product_id: number;
      name: string;
      description?: string | null;
      yield_quantity?: number;
      wastage_percent?: number;
      items: Array<{ raw_material_id: number; quantity: number; unit?: string }>;
    },
    userId?: number
  ) {
    const bomId = await ProductionRepository.createBOM(
      {
        product_id: data.product_id,
        name: data.name,
        description: data.description,
        yield_quantity: data.yield_quantity,
        wastage_percent: data.wastage_percent,
        created_by: userId,
      },
      data.items
    );
    return ProductionRepository.findBOMById(bomId);
  },

  async updateBOM(
    id: number,
    data: {
      name?: string;
      description?: string | null;
      yield_quantity?: number;
      wastage_percent?: number;
      status?: string;
      items?: Array<{ raw_material_id: number; quantity: number; unit?: string }>;
    }
  ) {
    await ProductionRepository.updateBOM(id, data, data.items);
    return ProductionRepository.findBOMById(id);
  },

  async deleteBOM(id: number) {
    return ProductionRepository.deleteBOM(id);
  },

  // Production Orders
  async listOrders(opts: PaginationParams & { search?: string; status?: string; product_id?: number }) {
    return ProductionRepository.listOrders(opts);
  },

  async getOrder(id: number) {
    const order = await ProductionRepository.findOrderById(id);
    if (!order) throw new Error('Production order not found');
    return order;
  },

  async createOrder(
    data: {
      product_id: number;
      bom_id?: number | null;
      quantity: number;
      planned_start?: string | null;
      planned_end?: string | null;
    },
    userId?: number
  ) {
    const orderId = await ProductionRepository.createOrder({
      ...data,
      created_by: userId,
    });
    return ProductionRepository.findOrderById(orderId);
  },

  async startOrder(id: number, userId: number) {
    await ProductionRepository.startOrder(id, userId);
    return ProductionRepository.findOrderById(id);
  },

  async completeOrder(id: number) {
    await ProductionRepository.completeOrder(id);
    return ProductionRepository.findOrderById(id);
  },

  async cancelOrder(id: number, reason: string) {
    await ProductionRepository.cancelOrder(id, reason);
    return ProductionRepository.findOrderById(id);
  },

  // Quality Checks
  async listQualityChecks(opts: PaginationParams & { search?: string; product_id?: number }) {
    return ProductionRepository.listQualityChecks(opts);
  },

  async createQualityCheck(
    data: {
      production_order_id: number;
      product_id: number;
      quantity_checked: number;
      passed_qty: number;
      failed_qty: number;
      remarks?: string | null;
      warehouse_id?: number;
    },
    userId?: number
  ) {
    const qcId = await ProductionRepository.createQualityCheck({
      ...data,
      checked_by: userId,
    });
    return { id: qcId, message: 'Quality check completed and finished goods updated.' };
  },
};
