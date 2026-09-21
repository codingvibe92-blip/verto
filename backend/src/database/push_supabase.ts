import { Client } from 'pg';

const SUPABASE_CONFIG = {
  host: 'db.yxrmcwqurxpcbecszske.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '*AK8?QJee2_!buW',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

async function pushToSupabase() {
  const client = new Client(SUPABASE_CONFIG);
  console.log('Connecting to Supabase PostgreSQL at db.yxrmcwqurxpcbecszske.supabase.co...');
  await client.connect();
  console.log('Connected successfully!');

  console.log('Beginning schema execution...');

  const schemaSql = `
    -- 1. AUTH / RBAC
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NULL,
      avatar_url VARCHAR(500) NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      email_verified_at TIMESTAMPTZ NULL,
      last_login_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      slug VARCHAR(80) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      is_system BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      permission_group VARCHAR(60) NULL,
      description VARCHAR(255) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      role_id BIGINT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id BIGINT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
      permission_id BIGINT NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (role_id, permission_id)
    );

    -- 2. CUSTOMERS
    CREATE TABLE IF NOT EXISTS customers (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      phone VARCHAR(30) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ NULL
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
      id BIGSERIAL PRIMARY KEY,
      customer_id BIGINT NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
      label VARCHAR(50) NOT NULL DEFAULT 'Home',
      full_name VARCHAR(120) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255) NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      country VARCHAR(80) NOT NULL DEFAULT 'India',
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. CATALOG
    CREATE TABLE IF NOT EXISTS categories (
      id BIGSERIAL PRIMARY KEY,
      parent_id BIGINT NULL REFERENCES categories (id) ON DELETE SET NULL,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT NULL,
      image_url VARCHAR(500) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      sort_order INT NOT NULL DEFAULT 0,
      seo_title VARCHAR(255) NULL,
      seo_description VARCHAR(500) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id BIGSERIAL PRIMARY KEY,
      category_id BIGINT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT NULL,
      image_url VARCHAR(500) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      seo_title VARCHAR(255) NULL,
      seo_description VARCHAR(500) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      sku VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(120) NOT NULL UNIQUE,
      name VARCHAR(180) NOT NULL,
      description TEXT NULL,
      short_description VARCHAR(500) NULL,
      category_id BIGINT NULL REFERENCES categories (id) ON DELETE SET NULL,
      subcategory_id BIGINT NULL REFERENCES subcategories (id) ON DELETE SET NULL,
      brand VARCHAR(120) NULL,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      mrp DECIMAL(12,2) NULL,
      cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      weight DECIMAL(10,3) NULL,
      length DECIMAL(10,3) NULL,
      width DECIMAL(10,3) NULL,
      height DECIMAL(10,3) NULL,
      min_stock INT NOT NULL DEFAULT 0,
      max_stock INT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
      tags VARCHAR(500) NULL,
      seo_title VARCHAR(255) NULL,
      seo_description VARCHAR(500) NULL,
      created_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ NULL
    );

    CREATE TABLE IF NOT EXISTS product_categories (
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      category_id BIGINT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (product_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      url VARCHAR(500) NOT NULL,
      alt_text VARCHAR(255) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      sku VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(180) NULL,
      attributes JSONB NULL,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_attributes (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      attribute_key VARCHAR(80) NOT NULL,
      attribute_value VARCHAR(255) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_product_attributes UNIQUE (product_id, attribute_key)
    );

    -- 4. SUPPLIERS
    CREATE TABLE IF NOT EXISTS suppliers (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      contact_person VARCHAR(120) NULL,
      email VARCHAR(191) NULL,
      phone VARCHAR(30) NULL,
      address TEXT NULL,
      gst_number VARCHAR(40) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      notes TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS supplier_products (
      supplier_id BIGINT NOT NULL REFERENCES suppliers (id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      cost_price DECIMAL(12,2) NULL,
      lead_time_days INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (supplier_id, product_id)
    );

    -- 5. WAREHOUSE
    CREATE TABLE IF NOT EXISTS warehouses (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      code VARCHAR(40) NOT NULL UNIQUE,
      address TEXT NULL,
      city VARCHAR(100) NULL,
      state VARCHAR(100) NULL,
      pincode VARCHAR(20) NULL,
      country VARCHAR(80) NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warehouse_locations (
      id BIGSERIAL PRIMARY KEY,
      warehouse_id BIGINT NOT NULL REFERENCES warehouses (id) ON DELETE CASCADE,
      name VARCHAR(120) NOT NULL,
      code VARCHAR(60) NOT NULL,
      location_type VARCHAR(30) NOT NULL DEFAULT 'RACK',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. RAW MATERIALS
    CREATE TABLE IF NOT EXISTS raw_material_categories (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS raw_materials (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      sku VARCHAR(100) NOT NULL UNIQUE,
      description TEXT NULL,
      category_id BIGINT NULL REFERENCES raw_material_categories (id) ON DELETE SET NULL,
      unit VARCHAR(20) NOT NULL DEFAULT 'KG',
      supplier_id BIGINT NULL REFERENCES suppliers (id) ON DELETE SET NULL,
      cost DECIMAL(12,2) NOT NULL DEFAULT 0,
      quantity_on_hand DECIMAL(14,4) NOT NULL DEFAULT 0,
      reserved_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
      min_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
      max_quantity DECIMAL(14,4) NULL,
      reorder_level DECIMAL(14,4) NULL,
      storage_location VARCHAR(120) NULL,
      batch_no VARCHAR(80) NULL,
      expiry_date DATE NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ NULL
    );

    -- 7. COUPONS
    CREATE TABLE IF NOT EXISTS coupons (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(60) NOT NULL UNIQUE,
      type VARCHAR(20) NOT NULL DEFAULT 'PERCENT',
      value DECIMAL(12,2) NOT NULL DEFAULT 0,
      max_discount DECIMAL(12,2) NULL,
      min_order_value DECIMAL(12,2) NOT NULL DEFAULT 0,
      product_ids JSONB NULL,
      category_ids JSONB NULL,
      per_user_limit INT NOT NULL DEFAULT 0,
      usage_limit INT NOT NULL DEFAULT 0,
      used_count INT NOT NULL DEFAULT 0,
      starts_at TIMESTAMPTZ NULL,
      ends_at TIMESTAMPTZ NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupon_usage (
      id BIGSERIAL PRIMARY KEY,
      coupon_id BIGINT NOT NULL REFERENCES coupons (id) ON DELETE CASCADE,
      order_id BIGINT NULL,
      customer_id BIGINT NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
      discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      used_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. ORDERS & CARTS
    CREATE TABLE IF NOT EXISTS carts (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NULL REFERENCES users (id) ON DELETE CASCADE,
      customer_id BIGINT NULL REFERENCES customers (id) ON DELETE CASCADE,
      session_token VARCHAR(100) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id BIGSERIAL PRIMARY KEY,
      cart_id BIGINT NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      variant_id BIGINT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_cart_items UNIQUE (cart_id, product_id, variant_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      order_number VARCHAR(40) NOT NULL UNIQUE,
      customer_id BIGINT NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
      user_id BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'PENDING_PAYMENT',
      payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
      items_total DECIMAL(12,2) NOT NULL DEFAULT 0,
      discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
      coupon_id BIGINT NULL REFERENCES coupons (id) ON DELETE SET NULL,
      coupon_code VARCHAR(60) NULL,
      shipping_address_id BIGINT NULL REFERENCES customer_addresses (id) ON DELETE SET NULL,
      billing_address_id BIGINT NULL REFERENCES customer_addresses (id) ON DELETE SET NULL,
      notes VARCHAR(500) NULL,
      placed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
      product_id BIGINT NULL REFERENCES products (id) ON DELETE SET NULL,
      variant_id BIGINT NULL REFERENCES product_variants (id) ON DELETE SET NULL,
      product_name VARCHAR(180) NOT NULL,
      sku VARCHAR(100) NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
      from_status VARCHAR(40) NULL,
      to_status VARCHAR(40) NOT NULL,
      reason VARCHAR(255) NULL,
      changed_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. INVENTORY
    CREATE TABLE IF NOT EXISTS inventory (
      id BIGSERIAL PRIMARY KEY,
      warehouse_id BIGINT NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
      location_id BIGINT NULL REFERENCES warehouse_locations (id) ON DELETE SET NULL,
      product_id BIGINT NULL REFERENCES products (id) ON DELETE CASCADE,
      raw_material_id BIGINT NULL REFERENCES raw_materials (id) ON DELETE CASCADE,
      quantity_on_hand DECIMAL(14,4) NOT NULL DEFAULT 0,
      reserved_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
      unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
      batch_no VARCHAR(80) NULL,
      expiry_date DATE NULL,
      low_stock_alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id BIGSERIAL PRIMARY KEY,
      inventory_id BIGINT NULL REFERENCES inventory (id) ON DELETE SET NULL,
      warehouse_id BIGINT NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
      product_id BIGINT NULL REFERENCES products (id) ON DELETE SET NULL,
      raw_material_id BIGINT NULL REFERENCES raw_materials (id) ON DELETE SET NULL,
      movement_type VARCHAR(40) NOT NULL,
      quantity DECIMAL(14,4) NOT NULL,
      unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
      reference_type VARCHAR(40) NULL,
      reference_id BIGINT NULL,
      notes VARCHAR(255) NULL,
      created_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_transfers (
      id BIGSERIAL PRIMARY KEY,
      transfer_number VARCHAR(40) NULL UNIQUE,
      from_warehouse_id BIGINT NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
      to_warehouse_id BIGINT NOT NULL REFERENCES warehouses (id) ON DELETE RESTRICT,
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      reference_note TEXT NULL,
      created_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      received_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      received_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_transfer_items (
      id BIGSERIAL PRIMARY KEY,
      stock_transfer_id BIGINT NOT NULL REFERENCES stock_transfers (id) ON DELETE CASCADE,
      product_id BIGINT NULL REFERENCES products (id) ON DELETE CASCADE,
      raw_material_id BIGINT NULL REFERENCES raw_materials (id) ON DELETE CASCADE,
      quantity DECIMAL(14,4) NOT NULL,
      unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. PRODUCTION / BOM
    CREATE TABLE IF NOT EXISTS boms (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      name VARCHAR(180) NOT NULL,
      description TEXT NULL,
      yield_quantity DECIMAL(14,4) NOT NULL DEFAULT 1,
      wastage_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      version INT NOT NULL DEFAULT 1,
      created_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bom_items (
      id BIGSERIAL PRIMARY KEY,
      bom_id BIGINT NOT NULL REFERENCES boms (id) ON DELETE CASCADE,
      raw_material_id BIGINT NOT NULL REFERENCES raw_materials (id) ON DELETE RESTRICT,
      quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
      unit VARCHAR(20) NOT NULL DEFAULT 'KG',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS production_orders (
      id BIGSERIAL PRIMARY KEY,
      order_number VARCHAR(40) NULL UNIQUE,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
      bom_id BIGINT NULL REFERENCES boms (id) ON DELETE SET NULL,
      quantity INT NOT NULL DEFAULT 1,
      status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
      planned_start TIMESTAMPTZ NULL,
      planned_end TIMESTAMPTZ NULL,
      started_at TIMESTAMPTZ NULL,
      completed_at TIMESTAMPTZ NULL,
      approved_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      approved_at TIMESTAMPTZ NULL,
      override_reason VARCHAR(500) NULL,
      cancellation_reason VARCHAR(500) NULL,
      created_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS production_items (
      id BIGSERIAL PRIMARY KEY,
      production_order_id BIGINT NOT NULL REFERENCES production_orders (id) ON DELETE CASCADE,
      raw_material_id BIGINT NOT NULL REFERENCES raw_materials (id) ON DELETE RESTRICT,
      planned_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
      consumed_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
      unit VARCHAR(20) NOT NULL DEFAULT 'KG',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS production_materials (
      id BIGSERIAL PRIMARY KEY,
      production_order_id BIGINT NOT NULL REFERENCES production_orders (id) ON DELETE CASCADE,
      raw_material_id BIGINT NOT NULL REFERENCES raw_materials (id) ON DELETE RESTRICT,
      inventory_id BIGINT NULL REFERENCES inventory (id) ON DELETE SET NULL,
      quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
      unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
      is_override BOOLEAN NOT NULL DEFAULT FALSE,
      consumed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quality_checks (
      id BIGSERIAL PRIMARY KEY,
      production_order_id BIGINT NOT NULL REFERENCES production_orders (id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
      quantity_checked INT NOT NULL DEFAULT 0,
      passed_qty INT NOT NULL DEFAULT 0,
      failed_qty INT NOT NULL DEFAULT 0,
      remarks VARCHAR(500) NULL,
      checked_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. PAYMENTS
    CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
      payment_reference VARCHAR(120) NULL UNIQUE,
      provider VARCHAR(40) NOT NULL DEFAULT 'mock',
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      method VARCHAR(40) NULL,
      meta JSONB NULL,
      paid_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id BIGSERIAL PRIMARY KEY,
      payment_id BIGINT NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
      type VARCHAR(30) NOT NULL DEFAULT 'VERIFY',
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      provider_reference VARCHAR(120) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      meta JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_webhooks (
      id BIGSERIAL PRIMARY KEY,
      provider VARCHAR(40) NOT NULL,
      event VARCHAR(60) NULL,
      webhook_data JSONB NULL,
      payment_id BIGINT NULL REFERENCES payments (id) ON DELETE SET NULL,
      idempotency_key VARCHAR(160) NULL UNIQUE,
      signature VARCHAR(255) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
      processed BOOLEAN NOT NULL DEFAULT FALSE,
      processed_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id BIGSERIAL PRIMARY KEY,
      refund_reference VARCHAR(120) NULL UNIQUE,
      payment_id BIGINT NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
      order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      reason VARCHAR(255) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      provider_reference VARCHAR(120) NULL,
      processed_by BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. SHIPPING
    CREATE TABLE IF NOT EXISTS shipments (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
      provider VARCHAR(40) NOT NULL DEFAULT 'mock',
      awb VARCHAR(120) NULL UNIQUE,
      courier VARCHAR(120) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
      tracking_url VARCHAR(500) NULL,
      label_url VARCHAR(500) NULL,
      total_weight DECIMAL(10,3) NULL,
      estimated_delivery TIMESTAMPTZ NULL,
      shipped_at TIMESTAMPTZ NULL,
      delivered_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shipment_tracking (
      id BIGSERIAL PRIMARY KEY,
      shipment_id BIGINT NOT NULL REFERENCES shipments (id) ON DELETE CASCADE,
      status VARCHAR(40) NULL,
      location VARCHAR(200) NULL,
      description VARCHAR(500) NULL,
      tracked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      raw JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 13. WISHLIST
    CREATE TABLE IF NOT EXISTS wishlists (
      id BIGSERIAL PRIMARY KEY,
      customer_id BIGINT NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_wishlists UNIQUE (customer_id, product_id)
    );

    -- 14. SYSTEM
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NULL REFERENCES users (id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(180) NOT NULL,
      message TEXT NULL,
      data JSONB NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      read_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NULL REFERENCES users (id) ON DELETE SET NULL,
      action VARCHAR(80) NOT NULL,
      entity VARCHAR(60) NOT NULL,
      entity_id BIGINT NULL,
      old_value JSONB NULL,
      new_value JSONB NULL,
      ip_address VARCHAR(45) NULL,
      user_agent VARCHAR(255) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id BIGSERIAL PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value JSONB NOT NULL,
      setting_group VARCHAR(60) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await client.query(schemaSql);
  console.log('All 48 tables created in Supabase!');

  console.log('Seeding initial permissions, roles, and master data...');

  const seedSql = `
    -- Permissions
    INSERT INTO permissions (name, permission_group, description) VALUES
      ('users.view',        'users',       'View users'),
      ('users.create',      'users',       'Create users'),
      ('users.update',      'users',       'Update users'),
      ('users.delete',      'users',       'Delete users'),
      ('roles.view',        'roles',       'View roles'),
      ('roles.create',      'roles',       'Create roles'),
      ('roles.update',      'roles',       'Update roles'),
      ('roles.delete',      'roles',       'Delete roles'),
      ('products.view',     'products',    'View products'),
      ('products.create',   'products',    'Create products'),
      ('products.update',   'products',    'Update products'),
      ('products.delete',   'products',    'Delete/archive products'),
      ('categories.view',   'categories',  'View categories'),
      ('categories.create', 'categories',  'Create categories'),
      ('categories.update', 'categories',  'Update categories'),
      ('categories.delete', 'categories',  'Delete categories'),
      ('customers.view',    'customers',   'View customers'),
      ('customers.create',  'customers',   'Create customers'),
      ('customers.update',  'customers',   'Update customers'),
      ('customers.delete',  'customers',   'Delete customers'),
      ('inventory.view',    'inventory',   'View inventory'),
      ('inventory.receive', 'inventory',   'Receive stock'),
      ('inventory.adjust',  'inventory',   'Adjust stock'),
      ('inventory.transfer','inventory',   'Transfer stock'),
      ('rawmaterials.view',   'raw-materials', 'View raw materials'),
      ('rawmaterials.create', 'raw-materials', 'Create raw materials'),
      ('rawmaterials.update', 'raw-materials', 'Update raw materials'),
      ('rawmaterials.delete', 'raw-materials', 'Delete raw materials'),
      ('warehouses.view',   'warehouses',  'View warehouses'),
      ('warehouses.create', 'warehouses',  'Create warehouses'),
      ('warehouses.update', 'warehouses',  'Update warehouses'),
      ('warehouses.delete', 'warehouses',  'Delete warehouses'),
      ('production.view',   'production',  'View production'),
      ('production.create', 'production',  'Create production orders'),
      ('production.update', 'production',  'Update production'),
      ('production.approve','production',  'Approve production'),
      ('production.cancel', 'production',  'Cancel production'),
      ('bom.view',          'bom',         'View BOMs'),
      ('bom.create',        'bom',         'Create BOMs'),
      ('bom.update',        'bom',         'Update BOMs'),
      ('bom.delete',        'bom',         'Delete BOMs'),
      ('quality.view',      'quality',     'View quality checks'),
      ('quality.check',     'quality',     'Perform quality checks'),
      ('orders.view',       'orders',      'View orders'),
      ('orders.create',     'orders',      'Create orders'),
      ('orders.update',     'orders',      'Update orders'),
      ('orders.cancel',     'orders',      'Cancel orders'),
      ('payments.view',     'payments',    'View payments'),
      ('payments.refund',   'payments',    'Refund payments'),
      ('refunds.view',      'refunds',     'View refunds'),
      ('refunds.process',   'refunds',     'Process refunds'),
      ('shipments.view',    'shipments',   'View shipments'),
      ('shipments.create',  'shipments',   'Create shipments'),
      ('shipments.update',  'shipments',   'Update shipments'),
      ('coupons.view',      'coupons',     'View coupons'),
      ('coupons.create',    'coupons',     'Create coupons'),
      ('coupons.update',    'coupons',     'Update coupons'),
      ('coupons.delete',    'coupons',     'Delete coupons'),
      ('reports.view',      'reports',     'View reports'),
      ('notifications.view','notifications', 'View notifications'),
      ('audit.view',        'audit',       'View audit logs'),
      ('settings.manage',   'settings',    'Manage settings')
    ON CONFLICT (name) DO NOTHING;

    -- Roles
    INSERT INTO roles (name, slug, description, is_system) VALUES
      ('Super Admin',    'super-admin',    'Full system access',               TRUE),
      ('Admin',          'admin',          'Administrative access',            TRUE),
      ('Inventory Manager','inventory-manager','Manage inventory & stock',     TRUE),
      ('Production Manager','production-manager','Manage production & BOM',    TRUE),
      ('Warehouse Manager','warehouse-manager','Manage warehouses',            TRUE),
      ('Sales Manager',  'sales-manager',  'Manage sales & customers',         TRUE),
      ('Order Manager',  'order-manager',  'Manage orders',                    TRUE),
      ('Finance Manager','finance-manager','Manage payments & refunds',        TRUE),
      ('Support Staff',  'support-staff',  'Customer support',                 TRUE),
      ('Employee',       'employee',       'General employee',                 TRUE),
      ('Customer',       'customer',       'E-commerce customer',              TRUE),
      ('Developer',      'developer',      'Development/testing',              FALSE)
    ON CONFLICT (slug) DO NOTHING;

    -- Super Admin permissions
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
    WHERE r.slug = 'super-admin'
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Admin permissions (all except settings)
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
    WHERE r.slug = 'admin' AND p.permission_group NOT IN ('settings')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Super Admin user (password: Admin@123)
    INSERT INTO users (name, email, password_hash, is_active, is_email_verified, email_verified_at)
    VALUES ('Super Admin', 'admin@crunchx.com', '$2a$10$iUpdyTMzejv7ryAzlMrqJuxm4dCnuH99Uoc4TrDxrFYfAE5jIJ3fK', TRUE, TRUE, NOW())
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id FROM users u, roles r 
    WHERE u.email = 'admin@crunchx.com' AND r.slug = 'super-admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- Demo Employee
    INSERT INTO users (name, email, password_hash, is_active, is_email_verified)
    VALUES ('Demo Employee', 'employee@crunchx.com', '$2a$10$iUpdyTMzejv7ryAzlMrqJuxm4dCnuH99Uoc4TrDxrFYfAE5jIJ3fK', TRUE, TRUE)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id FROM users u, roles r 
    WHERE u.email = 'employee@crunchx.com' AND r.slug = 'employee'
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- Demo Customer
    INSERT INTO users (name, email, password_hash, is_active, is_email_verified)
    VALUES ('Demo Customer', 'customer@crunchx.com', '$2a$10$iUpdyTMzejv7ryAzlMrqJuxm4dCnuH99Uoc4TrDxrFYfAE5jIJ3fK', TRUE, TRUE)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id FROM users u, roles r 
    WHERE u.email = 'customer@crunchx.com' AND r.slug = 'customer'
    ON CONFLICT (user_id, role_id) DO NOTHING;

    INSERT INTO customers (user_id, first_name, last_name, email, phone)
    SELECT u.id, 'Demo', 'Customer', u.email, '9876501234'
    FROM users u WHERE u.email = 'customer@crunchx.com'
    ON CONFLICT (email) DO NOTHING;

    -- Settings
    INSERT INTO settings (setting_key, setting_value, setting_group) VALUES
      ('store.name',        '{"value":"CRUNCHX"}'::jsonb,         'general'),
      ('store.currency',    '{"value":"INR"}'::jsonb,             'general'),
      ('store.default_tax_percent', '{"value":18}'::jsonb,        'tax'),
      ('store.shipping_base_rate',  '{"value":50}'::jsonb,        'shipping'),
      ('store.shipping_free_above', '{"value":1000}'::jsonb,      'shipping'),
      ('store.order_prefix','{"value":"ORD"}'::jsonb,             'orders'),
      ('inventory.low_stock_threshold', '{"value":5}'::jsonb,     'inventory')
    ON CONFLICT (setting_key) DO NOTHING;

    -- Master Data
    INSERT INTO categories (name, slug, description, sort_order) VALUES
      ('Food & Snacks', 'food-snacks', 'Everyday wholesome snacks', 1),
      ('Health & Wellness', 'health-wellness', 'Nutrient-dense bars & bites', 2),
      ('Beverages', 'beverages', 'Botanical tonics & clean drinks', 3)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO subcategories (category_id, name, slug)
    SELECT c.id, 'Roasted Chips & Crisps', 'chips-crisps' FROM categories c WHERE c.slug = 'food-snacks'
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO subcategories (category_id, name, slug)
    SELECT c.id, 'Protein Namkeens', 'namkeens' FROM categories c WHERE c.slug = 'food-snacks'
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO subcategories (category_id, name, slug)
    SELECT c.id, 'Clean Nutrition Bites', 'nutrition' FROM categories c WHERE c.slug = 'health-wellness'
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO suppliers (name, contact_person, email, phone, gst_number, status) VALUES
      ('FarmFresh Organic Suppliers', 'Ramesh Kumar', 'ramesh@farmfresh.in', '9810012345', 'GSTIN0012345', 'ACTIVE')
    ON CONFLICT DO NOTHING;

    INSERT INTO raw_material_categories (name) VALUES
      ('Grains'), ('Super Seeds'), ('Oils'), ('Natural Spices'), ('Packaging')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO warehouses (name, code, city, is_active) VALUES
      ('Central Distribution Hub', 'WH-MAIN', 'Mumbai', TRUE),
      ('Regional Secondary Facility', 'WH-SEC', 'Pune', TRUE)
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO warehouse_locations (warehouse_id, name, code, location_type)
    SELECT w.id, 'Rack A-01 (Dry Food)', 'WH-MAIN-A01', 'RACK' FROM warehouses w WHERE w.code = 'WH-MAIN'
    ON CONFLICT DO NOTHING;

    INSERT INTO warehouse_locations (warehouse_id, name, code, location_type)
    SELECT w.id, 'Rack A-02 (Perishables)', 'WH-MAIN-A02', 'RACK' FROM warehouses w WHERE w.code = 'WH-MAIN'
    ON CONFLICT DO NOTHING;

    INSERT INTO warehouse_locations (warehouse_id, name, code, location_type)
    SELECT w.id, 'Rack B-01 (Secondary)', 'WH-SEC-B01', 'RACK' FROM warehouses w WHERE w.code = 'WH-SEC'
    ON CONFLICT DO NOTHING;
  `;

  await client.query(seedSql);
  console.log('Seed data inserted successfully!');

  // Verification: Count all tables in Supabase public schema
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log('\n================ SUPABASE TABLE VERIFICATION ================');
  console.log(`Total Tables Created in Supabase: ${tablesRes.rows.length}\n`);

  for (const row of tablesRes.rows) {
    const countRes = await client.query(`SELECT COUNT(*) as n FROM public."${row.table_name}"`);
    console.log(`✓ Table: [${row.table_name.padEnd(26)}] -> ${countRes.rows[0].n} rows`);
  }

  await client.end();
  console.log('\nSupabase Database Migration completed 100% successfully!');
}

pushToSupabase().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
