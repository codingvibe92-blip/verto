-- ============================================================
-- CRUNCHX IMS/ERP + E-COMMERCE PLATFORM
-- MySQL 8 schema (XAMPP, port 3307)
-- Single idempotent file: create database + tables + seed data
-- ============================================================

CREATE DATABASE IF NOT EXISTS crunchx
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crunchx;

-- ------------------------------------------------------------
-- 1. AUTH / RBAC
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  avatar_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_email_verified TINYINT(1) NOT NULL DEFAULT 0,
  email_verified_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_status (is_active, deleted_at),
  KEY idx_users_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  description VARCHAR(255) NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_roles_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  permission_group VARCHAR(60) NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_permissions_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  KEY idx_user_roles_role (role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  KEY idx_role_permissions_permission (permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. CUSTOMERS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(30) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_customers_email (email),
  KEY idx_customers_status (status, deleted_at),
  KEY idx_customers_created (created_at),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(50) NOT NULL DEFAULT 'Home',
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255) NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  country VARCHAR(80) NOT NULL DEFAULT 'India',
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_customer_addresses_customer (customer_id),
  CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. CATALOG
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  sort_order INT NOT NULL DEFAULT 0,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  KEY idx_categories_status (status, sort_order),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subcategories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subcategories_slug (slug),
  KEY idx_subcategories_category (category_id),
  CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  short_description VARCHAR(500) NULL,
  category_id BIGINT UNSIGNED NULL,
  subcategory_id BIGINT UNSIGNED NULL,
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
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_products_sku (sku),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_category (category_id),
  KEY idx_products_subcategory (subcategory_id),
  KEY idx_products_status (status, deleted_at),
  KEY idx_products_created (created_at),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE SET NULL,
  CONSTRAINT fk_products_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_categories (
  product_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, category_id),
  KEY idx_product_categories_category (category_id),
  CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(180) NULL,
  attributes JSON NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_variants_sku (sku),
  KEY idx_product_variants_product (product_id),
  CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_attributes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  attribute_key VARCHAR(80) NOT NULL,
  attribute_value VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_attributes (product_id, attribute_key),
  KEY idx_product_attributes_key (attribute_key, attribute_value),
  CONSTRAINT fk_product_attributes_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. SUPPLIERS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS suppliers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  contact_person VARCHAR(120) NULL,
  email VARCHAR(191) NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  gst_number VARCHAR(40) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_suppliers_name (name),
  KEY idx_suppliers_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS supplier_products (
  supplier_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  cost_price DECIMAL(12,2) NULL,
  lead_time_days INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id, product_id),
  KEY idx_supplier_products_product (product_id),
  CONSTRAINT fk_supplier_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE,
  CONSTRAINT fk_supplier_products_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. WAREHOUSE
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS warehouses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  code VARCHAR(40) NOT NULL,
  address TEXT NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  pincode VARCHAR(20) NULL,
  country VARCHAR(80) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_warehouses_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS warehouse_locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(60) NOT NULL,
  location_type VARCHAR(30) NOT NULL DEFAULT 'RACK',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_warehouse_locations_warehouse (warehouse_id),
  CONSTRAINT fk_warehouse_locations_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. RAW MATERIALS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS raw_material_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rm_categories_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS raw_materials (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  description TEXT NULL,
  category_id BIGINT UNSIGNED NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'KG',
  supplier_id BIGINT UNSIGNED NULL,
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
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_raw_materials_sku (sku),
  KEY idx_raw_materials_category (category_id),
  KEY idx_raw_materials_supplier (supplier_id),
  KEY idx_raw_materials_status (status, deleted_at),
  CONSTRAINT fk_raw_materials_category FOREIGN KEY (category_id) REFERENCES raw_material_categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_raw_materials_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. COUPONS (needed by orders)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(60) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'PERCENT',
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_discount DECIMAL(12,2) NULL,
  min_order_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  product_ids JSON NULL,
  category_ids JSON NULL,
  per_user_limit INT NOT NULL DEFAULT 0,
  usage_limit INT NOT NULL DEFAULT 0,
  used_count INT NOT NULL DEFAULT 0,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_coupons_code (code),
  KEY idx_coupons_active (is_active, starts_at, ends_at),
  CONSTRAINT fk_coupons_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupon_usage (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_coupon_usage_coupon (coupon_id),
  KEY idx_coupon_usage_customer (customer_id),
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. ORDERS + CARTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS carts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NULL,
  session_token VARCHAR(100) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_carts_user (user_id),
  KEY idx_carts_session (session_token),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_carts_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_items (cart_id, product_id, variant_id),
  KEY idx_cart_items_product (product_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
  items_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  coupon_id BIGINT UNSIGNED NULL,
  coupon_code VARCHAR(60) NULL,
  shipping_address_id BIGINT UNSIGNED NULL,
  billing_address_id BIGINT UNSIGNED NULL,
  notes VARCHAR(500) NULL,
  placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_number (order_number),
  KEY idx_orders_customer (customer_id),
  KEY idx_orders_status (status, payment_status),
  KEY idx_orders_created (created_at),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_ship_address FOREIGN KEY (shipping_address_id) REFERENCES customer_addresses (id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_bill_address FOREIGN KEY (billing_address_id) REFERENCES customer_addresses (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  variant_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(180) NOT NULL,
  sku VARCHAR(100) NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  from_status VARCHAR(40) NULL,
  to_status VARCHAR(40) NOT NULL,
  reason VARCHAR(255) NULL,
  changed_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order_history_order (order_id),
  CONSTRAINT fk_order_history_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_history_user FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. INVENTORY
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS inventory (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  location_id BIGINT UNSIGNED NULL,
  product_id BIGINT UNSIGNED NULL,
  raw_material_id BIGINT UNSIGNED NULL,
  quantity_on_hand DECIMAL(14,4) NOT NULL DEFAULT 0,
  reserved_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  batch_no VARCHAR(80) NULL,
  expiry_date DATE NULL,
  low_stock_alert_sent TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inventory_item (warehouse_id, product_id, raw_material_id, location_id),
  KEY idx_inventory_product (product_id),
  KEY idx_inventory_raw_material (raw_material_id),
  KEY idx_inventory_warehouse (warehouse_id, location_id),
  CONSTRAINT fk_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_location FOREIGN KEY (location_id) REFERENCES warehouse_locations (id) ON DELETE SET NULL,
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_inventory_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials (id) ON DELETE CASCADE,
  CONSTRAINT chk_inventory_single_item CHECK (
    (product_id IS NOT NULL AND raw_material_id IS NULL) OR
    (product_id IS NULL AND raw_material_id IS NOT NULL)
  )
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_type VARCHAR(40) NOT NULL,
  inventory_id BIGINT UNSIGNED NULL,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  raw_material_id BIGINT UNSIGNED NULL,
  quantity DECIMAL(14,4) NOT NULL,
  unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  before_qty DECIMAL(14,4) NOT NULL DEFAULT 0,
  after_qty DECIMAL(14,4) NOT NULL DEFAULT 0,
  batch_no VARCHAR(80) NULL,
  reference_type VARCHAR(40) NULL,
  reference_id BIGINT UNSIGNED NULL,
  reason VARCHAR(255) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_invtx_product (product_id, created_at),
  KEY idx_invtx_raw_material (raw_material_id, created_at),
  KEY idx_invtx_inventory (inventory_id),
  KEY idx_invtx_reference (reference_type, reference_id),
  KEY idx_invtx_created (created_at),
  CONSTRAINT fk_invtx_inventory FOREIGN KEY (inventory_id) REFERENCES inventory (id) ON DELETE SET NULL,
  CONSTRAINT fk_invtx_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
  CONSTRAINT fk_invtx_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
  CONSTRAINT fk_invtx_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials (id) ON DELETE SET NULL,
  CONSTRAINT fk_invtx_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock_reservations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inventory_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(14,4) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'RESERVED',
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  released_at DATETIME NULL,
  fulfilled_at DATETIME NULL,
  KEY idx_stock_reservation_inventory (inventory_id),
  KEY idx_stock_reservation_order (order_id),
  KEY idx_stock_reservation_status (status),
  CONSTRAINT fk_stock_reservations_inventory FOREIGN KEY (inventory_id) REFERENCES inventory (id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_reservations_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_reservations_user FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock_transfers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transfer_number VARCHAR(40) NULL,
  from_warehouse_id BIGINT UNSIGNED NOT NULL,
  to_warehouse_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  reference_note TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  received_by BIGINT UNSIGNED NULL,
  received_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_stock_transfers_number (transfer_number),
  KEY idx_stock_transfers_status (status),
  KEY idx_stock_transfers_from (from_warehouse_id),
  KEY idx_stock_transfers_to (to_warehouse_id),
  CONSTRAINT fk_stock_transfers_from FOREIGN KEY (from_warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
  CONSTRAINT fk_stock_transfers_to FOREIGN KEY (to_warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
  CONSTRAINT fk_stock_transfers_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_stock_transfers_receiver FOREIGN KEY (received_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. PRODUCTION / BOM
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS boms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  yield_quantity DECIMAL(14,4) NOT NULL DEFAULT 1,
  wastage_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  version INT NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_boms_product (product_id),
  KEY idx_boms_status (status),
  CONSTRAINT fk_boms_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_boms_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bom_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bom_id BIGINT UNSIGNED NOT NULL,
  raw_material_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(14,4) NOT NULL DEFAULT 0 COMMENT 'per unit of finished good',
  unit VARCHAR(20) NOT NULL DEFAULT 'KG',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bom_items_bom (bom_id),
  KEY idx_bom_items_material (raw_material_id),
  CONSTRAINT fk_bom_items_bom FOREIGN KEY (bom_id) REFERENCES boms (id) ON DELETE CASCADE,
  CONSTRAINT fk_bom_items_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS production_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(40) NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  bom_id BIGINT UNSIGNED NULL,
  quantity INT NOT NULL DEFAULT 1,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  planned_start DATETIME NULL,
  planned_end DATETIME NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  override_reason VARCHAR(500) NULL,
  cancellation_reason VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_production_orders_number (order_number),
  KEY idx_production_orders_product (product_id),
  KEY idx_production_orders_status (status),
  CONSTRAINT fk_production_orders_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
  CONSTRAINT fk_production_orders_bom FOREIGN KEY (bom_id) REFERENCES boms (id) ON DELETE SET NULL,
  CONSTRAINT fk_production_orders_approver FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_production_orders_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS production_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  production_order_id BIGINT UNSIGNED NOT NULL,
  raw_material_id BIGINT UNSIGNED NOT NULL,
  planned_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
  consumed_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'KG',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_production_items_order (production_order_id),
  KEY idx_production_items_material (raw_material_id),
  CONSTRAINT fk_production_items_order FOREIGN KEY (production_order_id) REFERENCES production_orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_production_items_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS production_materials (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  production_order_id BIGINT UNSIGNED NOT NULL,
  raw_material_id BIGINT UNSIGNED NOT NULL,
  inventory_id BIGINT UNSIGNED NULL,
  quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_override TINYINT(1) NOT NULL DEFAULT 0,
  consumed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_production_materials_order (production_order_id),
  KEY idx_production_materials_material (raw_material_id),
  CONSTRAINT fk_production_materials_order FOREIGN KEY (production_order_id) REFERENCES production_orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_production_materials_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials (id) ON DELETE RESTRICT,
  CONSTRAINT fk_production_materials_inventory FOREIGN KEY (inventory_id) REFERENCES inventory (id) ON DELETE SET NULL,
  CONSTRAINT fk_production_materials_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quality_checks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  production_order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity_checked INT NOT NULL DEFAULT 0,
  passed_qty INT NOT NULL DEFAULT 0,
  failed_qty INT NOT NULL DEFAULT 0,
  remarks VARCHAR(500) NULL,
  checked_by BIGINT UNSIGNED NULL,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_quality_checks_order (production_order_id),
  CONSTRAINT fk_quality_checks_order FOREIGN KEY (production_order_id) REFERENCES production_orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_quality_checks_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
  CONSTRAINT fk_quality_checks_user FOREIGN KEY (checked_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11. PAYMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_reference VARCHAR(120) NULL,
  provider VARCHAR(40) NOT NULL DEFAULT 'mock',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  method VARCHAR(40) NULL,
  meta JSON NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payments_reference (payment_reference),
  KEY idx_payments_order (order_id),
  KEY idx_payments_status (status),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'VERIFY',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  provider_reference VARCHAR(120) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  meta JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_payment_transactions_payment (payment_id),
  CONSTRAINT fk_payment_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_webhooks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(40) NOT NULL,
  event VARCHAR(60) NULL,
  webhook_data JSON NULL,
  payment_id BIGINT UNSIGNED NULL,
  idempotency_key VARCHAR(160) NULL,
  signature VARCHAR(255) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
  processed TINYINT(1) NOT NULL DEFAULT 0,
  processed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_webhooks_idempotency (idempotency_key),
  KEY idx_payment_webhooks_payment (payment_id),
  CONSTRAINT fk_payment_webhooks_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refunds (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  refund_reference VARCHAR(120) NULL,
  payment_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  reason VARCHAR(255) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  provider_reference VARCHAR(120) NULL,
  processed_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_refunds_reference (refund_reference),
  KEY idx_refunds_payment (payment_id),
  KEY idx_refunds_order (order_id),
  CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE,
  CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_refunds_user FOREIGN KEY (processed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 12. SHIPPING
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS shipments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(40) NOT NULL DEFAULT 'mock',
  awb VARCHAR(120) NULL,
  courier VARCHAR(120) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  tracking_url VARCHAR(500) NULL,
  label_url VARCHAR(500) NULL,
  total_weight DECIMAL(10,3) NULL,
  estimated_delivery DATETIME NULL,
  shipped_at DATETIME NULL,
  delivered_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shipments_awb (awb),
  KEY idx_shipments_order (order_id),
  KEY idx_shipments_status (status),
  CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shipment_tracking (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(40) NULL,
  location VARCHAR(200) NULL,
  description VARCHAR(500) NULL,
  tracked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  raw JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_shipment_tracking_shipment (shipment_id),
  CONSTRAINT fk_shipment_tracking_shipment FOREIGN KEY (shipment_id) REFERENCES shipments (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 13. WISHLIST
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wishlists (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlists (customer_id, product_id),
  KEY idx_wishlists_product (product_id),
  CONSTRAINT fk_wishlists_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 14. SYSTEM
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NULL,
  data JSON NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notifications_user (user_id, is_read),
  KEY idx_notifications_created (created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(60) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  old_value JSON NULL,
  new_value JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_logs_user (user_id),
  KEY idx_audit_logs_entity (entity, entity_id),
  KEY idx_audit_logs_action (action),
  KEY idx_audit_logs_created (created_at),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSON NOT NULL,
  setting_group VARCHAR(60) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Permissions -------------------------------------------------
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
  ('settings.manage',   'settings',    'Manage settings');

-- Roles --------------------------------------------------------
INSERT INTO roles (name, slug, description, is_system) VALUES
  ('Super Admin',    'super-admin',    'Full system access',               1),
  ('Admin',          'admin',          'Administrative access',            1),
  ('Inventory Manager','inventory-manager','Manage inventory & stock',     1),
  ('Production Manager','production-manager','Manage production & BOM',    1),
  ('Warehouse Manager','warehouse-manager','Manage warehouses',            1),
  ('Sales Manager',  'sales-manager',  'Manage sales & customers',         1),
  ('Order Manager',  'order-manager',  'Manage orders',                    1),
  ('Finance Manager','finance-manager','Manage payments & refunds',        1),
  ('Support Staff',  'support-staff',  'Customer support',                 1),
  ('Employee',       'employee',       'General employee',                 1),
  ('Customer',       'customer',       'E-commerce customer',              1),
  ('Developer',      'developer',      'Development/testing',              0);

-- role_permissions ---------------------------------------------
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.slug = 'super-admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.slug = 'admin' AND p.permission_group NOT IN ('settings');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'inventory.view','inventory.receive','inventory.adjust','inventory.transfer',
  'rawmaterials.view','rawmaterials.create','rawmaterials.update','rawmaterials.delete',
  'warehouses.view','warehouses.create','warehouses.update',
  'products.view','categories.view','reports.view','notifications.view'
)
WHERE r.slug = 'inventory-manager';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'production.view','production.create','production.update','production.approve',
  'production.cancel','bom.view','bom.create','bom.update','bom.delete',
  'quality.view','quality.check','rawmaterials.view','inventory.view',
  'products.view','reports.view','notifications.view'
)
WHERE r.slug = 'production-manager';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'inventory.view','inventory.receive','inventory.adjust','inventory.transfer',
  'warehouses.view','warehouses.create','warehouses.update',
  'rawmaterials.view','reports.view','notifications.view'
)
WHERE r.slug = 'warehouse-manager';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'products.view','categories.view','customers.view','customers.create','customers.update',
  'orders.view','coupons.view','coupons.create','coupons.update',
  'reports.view','notifications.view'
)
WHERE r.slug = 'sales-manager';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'orders.view','orders.create','orders.update','orders.cancel',
  'customers.view','products.view','shipments.view','shipments.create','shipments.update',
  'reports.view','notifications.view'
)
WHERE r.slug = 'order-manager';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'payments.view','payments.refund','refunds.view','refunds.process',
  'orders.view','customers.view','products.view','reports.view','notifications.view'
)
WHERE r.slug = 'finance-manager';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'customers.view','customers.update','orders.view','orders.update',
  'products.view','notifications.view'
)
WHERE r.slug = 'support-staff';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'products.view','inventory.view','production.view','notifications.view'
)
WHERE r.slug = 'employee';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN ('notifications.view')
WHERE r.slug IN ('customer');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'products.view','categories.view','inventory.view','rawmaterials.view',
  'warehouses.view','inventory.adjust','inventory.receive','inventory.transfer',
  'production.view','production.create','production.update','bom.view','bom.create','bom.update',
  'orders.view','customers.view','reports.view','notifications.view'
)
WHERE r.slug = 'developer';

-- Super Admin user (password: Admin@123) ------------------------
INSERT INTO users (name, email, password_hash, is_active, is_email_verified, email_verified_at)
VALUES ('Super Admin', 'admin@crunchx.com', '$2a$10$iUpdyTMzejv7ryAzlMrqJuxm4dCnuH99Uoc4TrDxrFYfAE5jIJ3fK', 1, 1, NOW());

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE email = 'admin@crunchx.com'),
        (SELECT id FROM roles WHERE slug = 'super-admin'));

-- Demo employee + customer users ---------------------------------
INSERT INTO users (name, email, password_hash, is_active, is_email_verified)
VALUES ('Demo Employee','employee@crunchx.com','$2a$10$iUpdyTMzejv7ryAzlMrqJuxm4dCnuH99Uoc4TrDxrFYfAE5jIJ3fK',1,1);

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE email = 'employee@crunchx.com'),
        (SELECT id FROM roles WHERE slug = 'employee'));

INSERT INTO users (name, email, password_hash, is_active, is_email_verified)
VALUES ('Demo Customer','customer@crunchx.com','$2a$10$iUpdyTMzejv7ryAzlMrqJuxm4dCnuH99Uoc4TrDxrFYfAE5jIJ3fK',1,1);

INSERT INTO customers (user_id, first_name, last_name, email, phone)
SELECT u.id, 'Demo', 'Customer', u.email, '9876501234'
FROM users u WHERE u.email = 'customer@crunchx.com';

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE email = 'customer@crunchx.com'),
        (SELECT id FROM roles WHERE slug = 'customer'));

-- Settings -------------------------------------------------------
INSERT INTO settings (setting_key, setting_value, setting_group) VALUES
  ('store.name',        JSON_OBJECT('value','CRUNCHX'),         'general'),
  ('store.currency',    JSON_OBJECT('value','INR'),             'general'),
  ('store.default_tax_percent', JSON_OBJECT('value',18),        'tax'),
  ('store.shipping_base_rate',  JSON_OBJECT('value',50),        'shipping'),
  ('store.shipping_free_above', JSON_OBJECT('value',1000),      'shipping'),
  ('store.order_prefix',JSON_OBJECT('value','ORD'),             'orders'),
  ('inventory.low_stock_threshold', JSON_OBJECT('value',5),     'inventory');

-- Master data ----------------------------------------------------
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Food & Snacks', 'food-snacks', 'Everyday food and snacks', 1),
  ('Health & Wellness', 'health-wellness', 'Health-focused products', 2),
  ('Beverages', 'beverages', 'Drinks and beverages', 3);

INSERT INTO subcategories (category_id, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug='food-snacks'),'Chips & Crisps','chips-crisps'),
  ((SELECT id FROM categories WHERE slug='food-snacks'),'Namkeens','namkeens'),
  ((SELECT id FROM categories WHERE slug='health-wellness'),'Nutrition','nutrition');

INSERT INTO suppliers (name, contact_person, email, phone, gst_number, status) VALUES
  ('FarmFresh Suppliers','Ramesh Kumar','ramesh@farmfresh.in','9810012345','GSTIN0012345','ACTIVE');

INSERT INTO raw_material_categories (name) VALUES
  ('Grains'),('Oils'),('Spices'),('Packaging');

INSERT INTO warehouses (name, code, city, is_active) VALUES
  ('Main Warehouse','WH-MAIN','Mumbai',1),
  ('Secondary Warehouse','WH-SEC','Pune',1);

INSERT INTO warehouse_locations (warehouse_id, name, code, location_type) VALUES
  ((SELECT id FROM warehouses WHERE code='WH-MAIN'),'Rack A-01','WH-MAIN-A01','RACK'),
  ((SELECT id FROM warehouses WHERE code='WH-MAIN'),'Rack A-02','WH-MAIN-A02','RACK'),
  ((SELECT id FROM warehouses WHERE code='WH-SEC'),'Rack B-01','WH-SEC-B01','RACK');