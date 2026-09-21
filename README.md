# verto

> **CRUNCHX Enterprise Business Management + IMS/ERP + E-Commerce Platform**

An integrated, enterprise-grade business management platform combining recipe-driven manufacturing, multi-warehouse inventory, quality control inspections, customer e-commerce storefront, order fulfillment pipeline, shipping logistics, transaction auditing, RBAC administration, and executive analytics.

---

## Subsystems & Features

1. **Authentication & RBAC**: 12 system roles (Super Admin, Production Manager, Warehouse Manager, Finance, etc.) and 40+ granular module permissions.
2. **Bill of Materials (BOM)**: Formulation recipe builder with ingredient proportions, scrap factor percentage, and unit production cost calculation.
3. **Batch Production Orders**: Lifecycle tracking (`DRAFT` → `IN_PROGRESS` → `COMPLETED`) with automated raw material inventory consumption.
4. **Quality Control (QC)**: Pass/Fail/Rework inspections with automatic finished goods inwarding into selected warehouses.
5. **Multi-Warehouse Inventory & Binning**: Real-time stock visibility across warehouses, inter-warehouse transfers, adjustments, and reorder alerts.
6. **E-Commerce Storefront**: Debounced product search, category filters, and dietary/health attributes (Gluten-Free, Vegan, Organic, Non-GMO, High-Protein, Keto).
7. **Cart & Promotions**: Guest and customer shopping carts with automatic login merging, plus percentage and flat discount coupon vouchers.
8. **Atomic Checkout**: MySQL row-level locking (`SELECT ... FOR UPDATE`) prevents overselling under high concurrency. Automated restock on cancellation.
9. **Logistics & Shipping**: Automated Air Waybill generation (`CRX-EXP-XXXX`), carrier assignments, and tracking checkpoint logger.
10. **Payments & Refunds**: Mock transaction gateway simulator, multi-gateway audit ledger, and refund processor.
11. **Executive Reports & Analytics**: Real-time dashboards for Sales revenue timelines, Inventory valuation, Production batch yield, and Customer CRM.
12. **Forensic Audit Logs & Settings**: Immutable system audit trail and global store parameters.

---

## Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, React Hook Form, Axios, React Icons.
* **Backend**: Node.js, Express, TypeScript, Zod, JWT, Bcrypt, MySQL2 / PG (PostgreSQL 17 / Supabase).
* **Database**: MySQL 8 / Supabase PostgreSQL with 47 relational tables and comprehensive seed data.

---

## Deployment Guide

### Deploying Frontend to Vercel
1. Import this repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build` (or `tsc -b && vite build`).
5. Output Directory: `dist`.
6. Add Environment Variable:
   * `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://your-backend.onrender.com/api/v1`).
7. Click **Deploy**. (A `vercel.json` rewrite configuration is already included to handle SPA routing).

### Deploying Backend to Render
1. In [Render](https://render.com), create a new **Web Service** and connect this repository.
2. Set **Root Directory** to `backend`.
3. Environment: **Node**.
4. Build Command: `npm install && npm run build`.
5. Start Command: `npm start` (runs `node dist/server.js`).
6. Add Environment Variables:
   * `PORT`: `5000` (or leave default for Render)
   * `NODE_ENV`: `production`
   * `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (or Supabase connection string)
   * `JWT_SECRET`: Your production random JWT secret string
   * `JWT_REFRESH_SECRET`: Your production refresh token secret string
   * `CORS_ORIGIN`: Your Vercel frontend domain (e.g. `https://verto-frontend.vercel.app`)

---

## Local Development

### 1. Backend Setup
```bash
cd backend
npm install
npm run typecheck
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```

### 3. Database Migration
* Local MySQL: `database/schema.sql`
* Supabase PostgreSQL: `database/supabase_schema.sql` (or run `npx tsx src/database/push_supabase.ts`)

---

## Default Seeded Credentials

* **Super Admin**: `admin@crunchx.com` / `Admin@123`
* **Demo Employee**: `employee@crunchx.com` / `Admin@123`
* **Demo Customer**: `customer@crunchx.com` / `Admin@123`
