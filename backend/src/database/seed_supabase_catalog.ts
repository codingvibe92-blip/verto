import { Client } from 'pg';

const SUPABASE_CONFIG = {
  host: 'db.yxrmcwqurxpcbecszske.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '*AK8?QJee2_!buW',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

async function seedCatalog() {
  const client = new Client(SUPABASE_CONFIG);
  await client.connect();
  console.log('Connected to Supabase for catalog & inventory seeding...');

  const sql = `
    -- Raw Materials
    INSERT INTO raw_materials (sku, name, category_id, unit, cost, quantity_on_hand, reorder_level, status)
    VALUES
      ('RM-ALM-01', 'California Raw Almonds', (SELECT id FROM raw_material_categories WHERE name='Super Seeds'), 'KG', 650.00, 150.00, 40.00, 'ACTIVE'),
      ('RM-QNA-02', 'Organic White Quinoa', (SELECT id FROM raw_material_categories WHERE name='Grains'), 'KG', 180.00, 200.00, 50.00, 'ACTIVE'),
      ('RM-FLX-03', 'Cold-Cleaned Brown Flax Seeds', (SELECT id FROM raw_material_categories WHERE name='Super Seeds'), 'KG', 95.00, 120.00, 30.00, 'ACTIVE'),
      ('RM-MKH-04', 'Jumbo Fox Nuts (Makhana)', (SELECT id FROM raw_material_categories WHERE name='Super Seeds'), 'KG', 420.00, 80.00, 25.00, 'ACTIVE'),
      ('RM-OIL-05', 'Cold-Pressed Olive Oil', (SELECT id FROM raw_material_categories WHERE name='Oils'), 'L', 520.00, 90.00, 20.00, 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET quantity_on_hand = EXCLUDED.quantity_on_hand;

    -- Products
    INSERT INTO products (sku, slug, name, short_description, description, category_id, subcategory_id, price, selling_price, cost_price, status, tags, min_stock)
    VALUES
      (
        'CRX-CHIP-01',
        'roasted-beetroot-quinoa-crisps',
        'Roasted Beetroot & Quinoa Crisps',
        'Crispy, slow-roasted superfood chips with Himalayan pink salt.',
        'Crafted from organic white quinoa and farm-fresh beetroot extracts, vacuum-roasted to preserve dietary fibers without hydrogenated oils.',
        (SELECT id FROM categories WHERE slug='food-snacks'),
        (SELECT id FROM subcategories WHERE slug='chips-crisps'),
        149.00, 139.00, 65.00, 'ACTIVE', 'gluten-free, vegan, organic', 10
      ),
      (
        'CRX-NMK-02',
        'spiced-roasted-makhana-protein-mix',
        'Spiced Roasted Makhana Protein Mix',
        'Hand-roasted Foxnuts tossed with peri-peri herbs and almond slivers.',
        'Packed with 12g of clean plant protein per serving, gluten-free, with zero trans-fats.',
        (SELECT id FROM categories WHERE slug='food-snacks'),
        (SELECT id FROM subcategories WHERE slug='namkeens'),
        199.00, 185.00, 80.00, 'ACTIVE', 'keto, high-protein, gluten-free', 10
      ),
      (
        'CRX-BAR-03',
        'almond-flax-energy-crunch-bar',
        'Almond Butter & Flax Seed Energy Bar',
        'Wholesome nutrient-dense snack bar made with raw dates and cold-pressed nuts.',
        'Formulated for sustained endurance without insulin spikes. No refined sugar or artificial preservatives.',
        (SELECT id FROM categories WHERE slug='health-wellness'),
        (SELECT id FROM subcategories WHERE slug='nutrition'),
        120.00, 110.00, 48.00, 'ACTIVE', 'vegan, high-protein, non-gmo', 15
      ),
      (
        'CRX-BITE-04',
        'chia-coconut-keto-crunch-bites',
        'Chia Seed & Toasted Coconut Keto Bites',
        'Ultra-low carb keto treats infused with raw chia seeds and toasted coconut flakes.',
        'Less than 2g net carbs per pack, satisfying cravings while maintaining ketosis.',
        (SELECT id FROM categories WHERE slug='health-wellness'),
        (SELECT id FROM subcategories WHERE slug='nutrition'),
        175.00, 160.00, 72.00, 'ACTIVE', 'keto, organic, vegan', 10
      )
    ON CONFLICT (sku) DO UPDATE SET selling_price = EXCLUDED.selling_price;

    -- Finished Goods Inventory in Main Warehouse
    INSERT INTO inventory (warehouse_id, location_id, product_id, quantity_on_hand, unit_cost)
    SELECT 
      (SELECT id FROM warehouses WHERE code='WH-MAIN'),
      (SELECT id FROM warehouse_locations WHERE code='WH-MAIN-A01'),
      p.id,
      120.00,
      p.cost_price
    FROM products p
    ON CONFLICT DO NOTHING;

    -- Bill of Materials (BOM)
    INSERT INTO boms (product_id, name, yield_quantity, wastage_percent, status)
    SELECT 
      p.id,
      CONCAT(p.name, ' - Standard Formulation'),
      1.0,
      2.5,
      'ACTIVE'
    FROM products p
    ON CONFLICT DO NOTHING;

    -- BOM Items for Beetroot Quinoa Crisps
    INSERT INTO bom_items (bom_id, raw_material_id, quantity, unit)
    SELECT 
      b.id,
      rm.id,
      0.08,
      'KG'
    FROM boms b
    JOIN products p ON p.id = b.product_id
    CROSS JOIN raw_materials rm
    WHERE p.sku = 'CRX-CHIP-01' AND rm.sku = 'RM-QNA-02'
    ON CONFLICT DO NOTHING;

    -- BOM Items for Spiced Makhana
    INSERT INTO bom_items (bom_id, raw_material_id, quantity, unit)
    SELECT 
      b.id,
      rm.id,
      0.06,
      'KG'
    FROM boms b
    JOIN products p ON p.id = b.product_id
    CROSS JOIN raw_materials rm
    WHERE p.sku = 'CRX-NMK-02' AND rm.sku = 'RM-MKH-04'
    ON CONFLICT DO NOTHING;

    -- Coupons
    INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, is_active)
    VALUES
      ('CRUNCH20', 'PERCENT', 20.00, 499.00, 150.00, 500, TRUE),
      ('FLAT50', 'FIXED', 50.00, 299.00, 50.00, 1000, TRUE),
      ('FITKETO', 'PERCENT', 15.00, 399.00, 100.00, 300, TRUE)
    ON CONFLICT (code) DO NOTHING;
  `;

  await client.query(sql);
  console.log('Catalog, inventory, BOMs, and coupons seeded in Supabase!');

  // Verify counts
  const resProducts = await client.query('SELECT COUNT(*) as n FROM products');
  const resRM = await client.query('SELECT COUNT(*) as n FROM raw_materials');
  const resInv = await client.query('SELECT COUNT(*) as n FROM inventory');
  const resBoms = await client.query('SELECT COUNT(*) as n FROM boms');
  const resCoupons = await client.query('SELECT COUNT(*) as n FROM coupons');

  console.log(`\nVerified Seeded Records in Supabase:`);
  console.log(`- Products: ${resProducts.rows[0].n}`);
  console.log(`- Raw Materials: ${resRM.rows[0].n}`);
  console.log(`- Finished Goods Inventory: ${resInv.rows[0].n}`);
  console.log(`- BOM Formulations: ${resBoms.rows[0].n}`);
  console.log(`- Promotional Coupons: ${resCoupons.rows[0].n}`);

  await client.end();
}

seedCatalog().catch((err) => {
  console.error('Catalog seeding failed:', err);
  process.exit(1);
});
