import client, { apiErrorMessage } from '../api/client';

export interface OverviewMetrics {
  revenue: number;
  ordersToday: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  inventoryValuation: number;
  totalCustomers: number;
  productionBatches: number;
  qcPassRate: number;
}

export interface SalesReport {
  timeline: { date: string; order_count: number; total_revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
  topProducts: { product_id: number; product_name: string; units_sold: number; revenue: number }[];
  categoryDistribution: { category_name: string; total_sales: number; units_sold: number }[];
}

export interface InventoryReport {
  warehouseValuation: { warehouse_name: string; total_items: number; valuation: number }[];
  lowStockAlerts: {
    type: 'FINISHED_GOOD' | 'RAW_MATERIAL';
    id: number;
    name: string;
    sku?: string;
    current_stock: number;
    threshold: number;
    unit?: string;
  }[];
  movementsSummary: { movement_type: string; count: number; total_qty: number }[];
}

export interface ProductionReport {
  statusCounts: { status: string; count: number }[];
  totalProduced: number;
  qualityPassed: number;
  qualityFailed: number;
  materialUsage: { material_name: string; unit: string; total_consumed: number }[];
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomersLast30Days: number;
  topCustomers: { id: number; name: string; email: string; order_count: number; total_spent: number }[];
}

export const ReportService = {
  async getOverview(): Promise<OverviewMetrics> {
    const res = await client.get('/reports/overview');
    return res.data.data;
  },

  async getSalesReport(days = 30): Promise<SalesReport> {
    const res = await client.get('/reports/sales', { params: { days } });
    return res.data.data;
  },

  async getInventoryReport(): Promise<InventoryReport> {
    const res = await client.get('/reports/inventory');
    return res.data.data;
  },

  async getProductionReport(): Promise<ProductionReport> {
    const res = await client.get('/reports/production');
    return res.data.data;
  },

  async getCustomerReport(): Promise<CustomerReport> {
    const res = await client.get('/reports/customers');
    return res.data.data;
  },

  errorMessage(err: unknown) {
    return apiErrorMessage(err);
  },
};
