import { query } from '../database/pool';

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  revenue: number;
  pendingOrders: number;
  customers: number;
  inventoryValue: number;
  lowStock: number;
  productionToday: number;
  pendingProduction: number;
  shipments: number;
}

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [totalOrders, todayOrders, revenue, pendingOrders, customers, inventoryValue, lowStock, productionToday, pendingProduction, shipments] =
      await Promise.all([
        query.one<{ n: number }>('SELECT COUNT(*) AS n FROM orders'),
        query.one<{ n: number }>('SELECT COUNT(*) AS n FROM orders WHERE placed_at >= CURDATE()'),
        query.one<{ n: number | null }>(
          "SELECT COALESCE(SUM(grand_total), 0) AS n FROM orders WHERE status IN ('CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED')"
        ),
        query.one<{ n: number }>('SELECT COUNT(*) AS n FROM orders WHERE status = ?', ['PENDING_PAYMENT']),
        query.one<{ n: number }>('SELECT COUNT(*) AS n FROM customers WHERE deleted_at IS NULL'),
        query.one<{ n: number | null }>(
          'SELECT COALESCE(SUM(quantity_on_hand * unit_cost), 0) AS n FROM inventory'
        ),
        query.one<{ n: number }>('SELECT COUNT(*) AS n FROM inventory WHERE quantity_on_hand <= ?', [5]),
        query.one<{ n: number }>(
          "SELECT COUNT(*) AS n FROM production_orders WHERE started_at >= CURDATE() OR status IN ('IN_PROGRESS','QUALITY_CHECK')"
        ),
        query.one<{ n: number }>(
          "SELECT COUNT(*) AS n FROM production_orders WHERE status IN ('DRAFT','PENDING_APPROVAL','APPROVED')"
        ),
        query.one<{ n: number }>(
          "SELECT COUNT(*) AS n FROM shipments WHERE status NOT IN ('DELIVERED','CANCELLED')"
        ),
      ]);

    return {
      totalOrders: totalOrders?.n ?? 0,
      todayOrders: todayOrders?.n ?? 0,
      revenue: Number(revenue?.n ?? 0),
      pendingOrders: pendingOrders?.n ?? 0,
      customers: customers?.n ?? 0,
      inventoryValue: Number(inventoryValue?.n ?? 0),
      lowStock: lowStock?.n ?? 0,
      productionToday: productionToday?.n ?? 0,
      pendingProduction: pendingProduction?.n ?? 0,
      shipments: shipments?.n ?? 0,
    };
  },
};