import { query } from '../database/pool';

export interface DailySalesMetric {
  date: string;
  order_count: number;
  total_revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TopSellingProduct {
  product_id: number;
  product_name: string;
  units_sold: number;
  revenue: number;
}

export interface CategorySales {
  category_name: string;
  total_sales: number;
  units_sold: number;
}

export interface LowStockAlertItem {
  type: 'FINISHED_GOOD' | 'RAW_MATERIAL';
  id: number;
  name: string;
  sku?: string;
  current_stock: number;
  threshold: number;
  unit?: string;
}

export const ReportRepository = {
  async getOverview(): Promise<{
    revenue: number;
    ordersToday: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProducts: number;
    inventoryValuation: number;
    totalCustomers: number;
    productionBatches: number;
    qcPassRate: number;
  }> {
    const [revRow, ordersCount, productsCount, invValRow, custCount, prodBatches, qcStats] = await Promise.all([
      query.one<{ total_rev: number | null; aov: number | null }>(
        `SELECT COALESCE(SUM(grand_total), 0) AS total_rev, 
                COALESCE(AVG(grand_total), 0) AS aov 
         FROM orders 
         WHERE status NOT IN ('CANCELLED')`
      ),
      query.one<{ total: number; today: number }>(
        `SELECT COUNT(*) AS total, 
                SUM(CASE WHEN placed_at >= CURDATE() THEN 1 ELSE 0 END) AS today 
         FROM orders`
      ),
      query.one<{ n: number }>('SELECT COUNT(*) AS n FROM products WHERE deleted_at IS NULL'),
      query.one<{ val: number | null }>(
        'SELECT COALESCE(SUM(quantity_on_hand * unit_cost), 0) AS val FROM inventory'
      ),
      query.one<{ n: number }>('SELECT COUNT(*) AS n FROM customers WHERE deleted_at IS NULL'),
      query.one<{ n: number }>('SELECT COUNT(*) AS n FROM production_orders'),
      query.one<{ passed: number | null; total: number | null }>(
        'SELECT COALESCE(SUM(passed_qty), 0) AS passed, COALESCE(SUM(quantity_checked), 0) AS total FROM quality_checks'
      ),
    ]);

    const totalQc = Number(qcStats?.total || 0);
    const passedQc = Number(qcStats?.passed || 0);
    const qcPassRate = totalQc > 0 ? Math.round((passedQc / totalQc) * 100) : 100;

    return {
      revenue: Number(revRow?.total_rev || 0),
      ordersToday: Number(ordersCount?.today || 0),
      totalOrders: Number(ordersCount?.total || 0),
      averageOrderValue: Math.round(Number(revRow?.aov || 0)),
      totalProducts: Number(productsCount?.n || 0),
      inventoryValuation: Number(invValRow?.val || 0),
      totalCustomers: Number(custCount?.n || 0),
      productionBatches: Number(prodBatches?.n || 0),
      qcPassRate,
    };
  },

  async getSalesReport(days = 30): Promise<{
    timeline: DailySalesMetric[];
    statusBreakdown: StatusCount[];
    topProducts: TopSellingProduct[];
    categoryDistribution: CategorySales[];
  }> {
    const timeline = await query.rows<DailySalesMetric>(
      `SELECT DATE(placed_at) AS date,
              COUNT(*) AS order_count,
              COALESCE(SUM(grand_total), 0) AS total_revenue
       FROM orders
       WHERE placed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         AND status NOT IN ('CANCELLED')
       GROUP BY DATE(placed_at)
       ORDER BY date ASC`,
      [days]
    );

    const statusBreakdown = await query.rows<StatusCount>(
      `SELECT status, COUNT(*) AS count
       FROM orders
       GROUP BY status
       ORDER BY count DESC`
    );

    const topProducts = await query.rows<TopSellingProduct>(
      `SELECT oi.product_id,
              oi.product_name,
              SUM(oi.quantity) AS units_sold,
              SUM(oi.line_total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status NOT IN ('CANCELLED')
       GROUP BY oi.product_id, oi.product_name
       ORDER BY revenue DESC
       LIMIT 10`
    );

    const categoryDistribution = await query.rows<CategorySales>(
      `SELECT COALESCE(c.name, 'Uncategorized') AS category_name,
              COALESCE(SUM(oi.line_total), 0) AS total_sales,
              COALESCE(SUM(oi.quantity), 0) AS units_sold
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status NOT IN ('CANCELLED')
       GROUP BY c.name
       ORDER BY total_sales DESC`
    );

    return { timeline, statusBreakdown, topProducts, categoryDistribution };
  },

  async getInventoryReport(): Promise<{
    warehouseValuation: { warehouse_name: string; total_items: number; valuation: number }[];
    lowStockAlerts: LowStockAlertItem[];
    movementsSummary: { movement_type: string; count: number; total_qty: number }[];
  }> {
    const warehouseValuation = await query.rows<{ warehouse_name: string; total_items: number; valuation: number }>(
      `SELECT w.name AS warehouse_name,
              COALESCE(SUM(i.quantity_on_hand), 0) AS total_items,
              COALESCE(SUM(i.quantity_on_hand * i.unit_cost), 0) AS valuation
       FROM warehouses w
       LEFT JOIN inventory i ON i.warehouse_id = w.id
       GROUP BY w.id, w.name
       ORDER BY valuation DESC`
    );

    const fgLow = await query.rows<{ id: number; name: string; sku: string; qty: number }>(
      `SELECT p.id, p.name, p.sku, COALESCE(SUM(i.quantity_on_hand), 0) AS qty
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.deleted_at IS NULL
       GROUP BY p.id, p.name, p.sku
       HAVING qty <= 10
       LIMIT 20`
    );

    const rmLow = await query.rows<{ id: number; name: string; sku: string; qty: number; reorder_level: number; unit: string }>(
      `SELECT id, name, sku, current_stock AS qty, reorder_level, unit
       FROM raw_materials
       WHERE current_stock <= reorder_level
       LIMIT 20`
    );

    const lowStockAlerts: LowStockAlertItem[] = [
      ...fgLow.map((f) => ({
        type: 'FINISHED_GOOD' as const,
        id: f.id,
        name: f.name,
        sku: f.sku,
        current_stock: Number(f.qty),
        threshold: 10,
        unit: 'PCS',
      })),
      ...rmLow.map((r) => ({
        type: 'RAW_MATERIAL' as const,
        id: r.id,
        name: r.name,
        sku: r.sku,
        current_stock: Number(r.qty),
        threshold: Number(r.reorder_level),
        unit: r.unit,
      })),
    ];

    const movementsSummary = await query.rows<{ movement_type: string; count: number; total_qty: number }>(
      `SELECT movement_type,
              COUNT(*) AS count,
              COALESCE(SUM(quantity), 0) AS total_qty
       FROM stock_movements
       GROUP BY movement_type
       ORDER BY count DESC`
    );

    return { warehouseValuation, lowStockAlerts, movementsSummary };
  },

  async getProductionReport(): Promise<{
    statusCounts: { status: string; count: number }[];
    totalProduced: number;
    qualityPassed: number;
    qualityFailed: number;
    materialUsage: { material_name: string; unit: string; total_consumed: number }[];
  }> {
    const statusCounts = await query.rows<{ status: string; count: number }>(
      `SELECT status, COUNT(*) AS count
       FROM production_orders
       GROUP BY status
       ORDER BY count DESC`
    );

    const qcSummary = await query.one<{ total_checked: number | null; passed: number | null; failed: number | null }>(
      `SELECT COALESCE(SUM(quantity_checked), 0) AS total_checked,
              COALESCE(SUM(passed_qty), 0) AS passed,
              COALESCE(SUM(failed_qty), 0) AS failed
       FROM quality_checks`
    );

    const materialUsage = await query.rows<{ material_name: string; unit: string; total_consumed: number }>(
      `SELECT rm.name AS material_name,
              rm.unit,
              COALESCE(SUM(pm.quantity), 0) AS total_consumed
       FROM production_materials pm
       JOIN raw_materials rm ON rm.id = pm.raw_material_id
       GROUP BY rm.id, rm.name, rm.unit
       ORDER BY total_consumed DESC
       LIMIT 10`
    );

    return {
      statusCounts,
      totalProduced: Number(qcSummary?.total_checked || 0),
      qualityPassed: Number(qcSummary?.passed || 0),
      qualityFailed: Number(qcSummary?.failed || 0),
      materialUsage,
    };
  },

  async getCustomerReport(): Promise<{
    totalCustomers: number;
    newCustomersLast30Days: number;
    topCustomers: { id: number; name: string; email: string; order_count: number; total_spent: number }[];
  }> {
    const [tot, newCust] = await Promise.all([
      query.one<{ n: number }>('SELECT COUNT(*) AS n FROM customers WHERE deleted_at IS NULL'),
      query.one<{ n: number }>(
        'SELECT COUNT(*) AS n FROM customers WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND deleted_at IS NULL'
      ),
    ]);

    const topCustomers = await query.rows<{
      id: number;
      name: string;
      email: string;
      order_count: number;
      total_spent: number;
    }>(
      `SELECT c.id,
              CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS name,
              c.email,
              COUNT(o.id) AS order_count,
              COALESCE(SUM(o.grand_total), 0) AS total_spent
       FROM customers c
       JOIN orders o ON o.customer_id = c.id
       WHERE o.status NOT IN ('CANCELLED')
       GROUP BY c.id, c.first_name, c.last_name, c.email
       ORDER BY total_spent DESC
       LIMIT 10`
    );

    return {
      totalCustomers: Number(tot?.n || 0),
      newCustomersLast30Days: Number(newCust?.n || 0),
      topCustomers,
    };
  },
};
