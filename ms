MASTER PROMPT — IMS/ERP + CRUNCHX E-COMMERCE PLATFORM
You are a Senior Software Architect, Product Engineer, UI/UX Designer,
Database Architect, DevOps Engineer and QA Engineer.

Your task is to design and build a complete production-ready
BUSINESS MANAGEMENT + IMS/ERP + E-COMMERCE PLATFORM.

PROJECT NAME:
CRUNCHX Business Management & E-Commerce Platform

==================================================
1. PROJECT OBJECTIVE
==================================================

Build a complete integrated business platform consisting of:

A. Internal Management System (IMS/ERP)
B. CRUNCHX E-Commerce Platform
C. Admin Panel
D. Employee/User Management
E. Inventory Management
F. Raw Material Management
G. Production Management
H. Finished Goods Management
I. Order Management
J. Customer Management
K. Payment Integration
L. Shipping Integration
M. Reports & Analytics
N. Notifications
O. Role-Based Access Control
P. Real-Time synchronization between IMS and E-Commerce

The system must be scalable, secure, modular, responsive and
production-ready.

Do NOT build this as a simple CRUD application.

Treat it as a real enterprise business management system.

==================================================
2. TECHNOLOGY STACK
==================================================

Frontend:
- React.js
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Reusable component architecture
- Responsive design

Backend:
- Node.js
- Express.js
- TypeScript
- REST APIs
- Service/Controller/Repository architecture
- JWT authentication
- Refresh token system
- Validation
- Centralized error handling
- Logging

Database:
- PostgreSQL
- Supabase can be used as the PostgreSQL platform
- Proper relational database design
- Foreign keys
- Indexes
- Constraints
- Transactions
- Audit fields

Storage:
- Supabase Storage or equivalent object storage

Optional:
- Redis for caching/queues
- Background workers for asynchronous jobs

External integrations must be implemented through separate
service modules so providers can be changed later.

==================================================
3. CORE ARCHITECTURE
==================================================

Use a modular architecture.

Frontend:

src/
  components/
  layouts/
  pages/
  features/
  hooks/
  services/
  api/
  types/
  utils/
  validations/
  stores/
  routes/

Backend:

src/
  config/
  controllers/
  services/
  repositories/
  models/
  routes/
  middleware/
  validators/
  integrations/
  jobs/
  utils/
  types/
  database/

Do not put all business logic inside route files.

Use:

Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database

For integrations:

Service
  ↓
Integration Adapter
  ↓
External API

==================================================
4. USER TYPES
==================================================

Implement RBAC.

Default roles:

1. Super Admin
2. Admin
3. Inventory Manager
4. Production Manager
5. Warehouse Manager
6. Sales Manager
7. Order Manager
8. Finance Manager
9. Customer Support
10. Employee
11. Customer

Do NOT hard-code permissions inside components.

Create dynamic:

Roles
Permissions
Role Permissions
User Roles

Example permissions:

users.view
users.create
users.update
users.delete

products.view
products.create
products.update
products.delete

inventory.view
inventory.create
inventory.adjust

production.view
production.create
production.update

orders.view
orders.create
orders.update
orders.cancel

payments.view
payments.refund

reports.view

settings.manage

==================================================
5. AUTHENTICATION
==================================================

Implement:

- Login
- Register where applicable
- Logout
- Refresh token
- Forgot password
- Reset password
- Email verification
- Session management
- Password hashing
- Account activation/deactivation
- Role-based authorization
- Permission-based authorization

Security requirements:

- Never store plain passwords
- Never expose sensitive tokens
- Validate all input
- Protect admin APIs
- Rate-limit authentication APIs
- Secure cookies where applicable
- CORS configuration
- Helmet/security headers
- Audit sensitive actions

==================================================
6. ADMIN DASHBOARD
==================================================

Create a professional enterprise dashboard.

Dashboard cards:

- Total Orders
- Today's Orders
- Revenue
- Pending Orders
- Completed Orders
- Inventory Value
- Low Stock Items
- Production Today
- Pending Production
- Customers
- Payments
- Dispatches

Charts:

- Sales trend
- Order trend
- Production trend
- Inventory movement
- Top products
- Revenue by category
- Order status distribution

Dashboard must support:

- Date filters
- Today
- Yesterday
- Last 7 days
- Last 30 days
- Custom date range

==================================================
7. PRODUCT MANAGEMENT
==================================================

Create complete product management.

Product fields:

- Product ID
- SKU
- Name
- Slug
- Description
- Short Description
- Category
- Subcategory
- Brand
- Product Images
- Price
- MRP
- Discount
- Tax
- Selling Price
- Cost Price
- Stock
- Minimum Stock
- Maximum Stock
- Weight
- Dimensions
- Status
- Health attributes
- Tags
- SEO title
- SEO description
- Created date
- Updated date

Product statuses:

- Draft
- Active
- Inactive
- Out of Stock
- Archived

Support:

- Product variants
- Multiple images
- Bulk upload
- CSV import/export
- Product search
- Filters
- Sorting
- Pagination

==================================================
8. CATEGORY MANAGEMENT
==================================================

Implement:

Categories
Subcategories
Nested categories

Fields:

- Name
- Slug
- Description
- Image
- Status
- SEO metadata
- Sort order

==================================================
9. RAW MATERIAL MANAGEMENT
==================================================

Create raw material module.

Fields:

- Material ID
- Material Name
- SKU
- Category
- Unit
- Current Quantity
- Minimum Quantity
- Maximum Quantity
- Supplier
- Cost
- Batch
- Expiry
- Storage Location
- Status

Inventory transactions:

- Purchase
- Receive
- Issue
- Adjustment
- Return
- Damage
- Transfer
- Consumption

Maintain complete inventory history.

Never directly overwrite stock without creating
an inventory transaction.

==================================================
10. INVENTORY MANAGEMENT
==================================================

Create inventory system.

Support:

- Warehouses
- Storage locations
- Stock levels
- Stock movements
- Stock transfers
- Stock adjustments
- Low-stock alerts
- Batch tracking
- Expiry tracking
- Inventory valuation
- Inventory history

Inventory flow:

Purchase
 ↓
Goods Received
 ↓
Warehouse
 ↓
Available Stock
 ↓
Production Consumption / E-Commerce Order
 ↓
Stock Deduction
 ↓
Stock Ledger

Every stock change must create a transaction.

==================================================
11. PRODUCTION MANAGEMENT
==================================================

Create complete production module.

Features:

- Production orders
- Bill of Materials
- Raw material requirements
- Production planning
- Material consumption
- Production status
- Quality check
- Finished goods
- Production wastage
- Production history

Production workflow:

Production Draft
 ↓
Approved
 ↓
Materials Reserved
 ↓
Production Started
 ↓
Materials Consumed
 ↓
Quality Check
 ↓
Completed
 ↓
Finished Goods Added to Inventory

Production statuses:

- Draft
- Pending Approval
- Approved
- In Progress
- Quality Check
- Completed
- Cancelled

==================================================
12. BILL OF MATERIALS
==================================================

Implement BOM.

Example:

Product A

Raw Material A = 2 KG
Raw Material B = 1 KG
Raw Material C = 500 GM

When production quantity changes,
automatically calculate required materials.

Do not allow production if required stock
is insufficient unless an authorized user overrides it.

==================================================
13. FINISHED GOODS
==================================================

When production is completed:

Raw Material Stock
        ↓
Consumption
        ↓
Production Output
        ↓
Finished Goods
        ↓
Inventory

Automatically create inventory transactions.

==================================================
14. E-COMMERCE CUSTOMER WEBSITE
==================================================

Create a premium modern e-commerce frontend.

Pages:

/
 /products
 /products/:slug
 /categories/:slug
 /search
 /cart
 /checkout
 /login
 /register
 /account
 /account/orders
 /account/orders/:id
 /wishlist
 /contact
 /about
 /privacy
 /terms

Design requirements:

- Mobile-first
- Fast
- Modern
- Clean
- Professional
- Accessible
- SEO friendly
- Responsive

==================================================
15. CUSTOMER PRODUCT EXPERIENCE
==================================================

Customer should be able to:

- Search products
- Browse categories
- Filter products
- Sort products
- View product details
- Select variants
- Add to cart
- Update quantity
- Remove items
- Wishlist
- Apply coupon
- Checkout
- Save addresses
- Pay
- View orders
- Track orders
- Cancel eligible orders
- View invoices

==================================================
16. HEALTH-BASED FILTERS
==================================================

Because the project specification mentions health-based filters,
design this as configurable product attributes.

Examples:

- Dietary preference
- Ingredients
- Allergens
- Nutritional attributes
- Suitable-for tags

Do not hard-code medical claims.

Admin must be able to configure these attributes.

==================================================
17. CART SYSTEM
==================================================

Cart must support:

- Guest cart
- Logged-in cart
- Product variants
- Quantity
- Price snapshot
- Discount
- Tax
- Shipping
- Total

When user logs in,
merge guest cart with customer cart safely.

Prevent:

- Negative quantity
- Invalid products
- Inactive products
- Purchasing unavailable stock

==================================================
18. CHECKOUT
==================================================

Checkout workflow:

Cart
 ↓
Address
 ↓
Shipping Method
 ↓
Coupon
 ↓
Tax
 ↓
Order Summary
 ↓
Payment
 ↓
Order Confirmation

Before payment:

Validate:

- Product availability
- Current price
- Discount
- Tax
- Shipping
- Customer address
- Stock

Never trust prices received from frontend.

Calculate final amount on backend.

==================================================
19. ORDER MANAGEMENT
==================================================

Create order management.

Order statuses:

- Pending Payment
- Confirmed
- Processing
- Packed
- Shipped
- Out for Delivery
- Delivered
- Cancelled
- Returned
- Refunded

Order workflow:

Customer Checkout
 ↓
Payment
 ↓
Order Created
 ↓
IMS Synchronization
 ↓
Inventory Reservation
 ↓
Processing
 ↓
Packing
 ↓
Shipping
 ↓
Delivery

==================================================
20. ORDER + INVENTORY SYNCHRONIZATION
==================================================

This is a critical requirement.

When an order is confirmed:

E-Commerce
     ↓
Order Service
     ↓
Inventory Service
     ↓
Reserve Stock
     ↓
IMS

When order is cancelled:

Order
 ↓
Cancellation
 ↓
Release Reserved Stock

When order is shipped:

Reserved Stock
 ↓
Deduct/Finalize Stock

Use database transactions and idempotency.

Never allow duplicate order processing.

==================================================
21. PAYMENT SYSTEM
==================================================

Create payment abstraction.

Payment service should support providers
through adapters.

Example architecture:

PaymentService
    ↓
PaymentProviderInterface
    ↓
ProviderAdapter

Features:

- Create payment
- Verify payment
- Webhook
- Payment status
- Refund
- Transaction history

IMPORTANT:

Never trust frontend payment-success response.

Payment status must be verified server-side.

Implement webhook idempotency.

==================================================
22. SHIPPING SYSTEM
==================================================

Create shipping abstraction.

ShippingService
     ↓
ShippingProviderInterface
     ↓
Provider Adapter

Support:

- Create shipment
- Generate shipment details
- Tracking number
- Shipping label
- Track shipment
- Cancel shipment
- Delivery status

Shipping provider should be configurable.

==================================================
23. CUSTOMER MANAGEMENT
==================================================

Admin should manage:

- Customers
- Addresses
- Orders
- Purchase history
- Total spending
- Customer status
- Notes
- Communication history

Customer profile:

Customer
 ↓
Orders
 ↓
Payments
 ↓
Addresses
 ↓
Support history

==================================================
24. DISCOUNT & COUPON SYSTEM
==================================================

Implement:

- Percentage discount
- Fixed discount
- Product discount
- Category discount
- Minimum order value
- Maximum discount
- Start date
- End date
- Usage limit
- Per-user limit
- Active/inactive

Validate coupons on backend.

==================================================
25. NOTIFICATION SYSTEM
==================================================

Create notification architecture.

Events:

- Registration
- Order created
- Payment successful
- Payment failed
- Order confirmed
- Order shipped
- Out for delivery
- Delivered
- Cancellation
- Refund
- Low inventory
- Production completed

Support architecture for:

- Email
- SMS
- WhatsApp
- In-app notifications

External providers must be replaceable.

==================================================
26. REPORTING
==================================================

Create reporting module.

Reports:

Sales
Orders
Revenue
Products
Inventory
Stock Movement
Production
Raw Materials
Customers
Payments
Shipping
Returns
Refunds

Support:

- Date filtering
- Export CSV
- Export Excel
- PDF where appropriate
- Print-friendly reports

==================================================
27. AUDIT LOG
==================================================

Every sensitive admin action should be logged.

Example:

User:
Admin

Action:
Updated Product

Old Value:
₹1,000

New Value:
₹950

Timestamp:
...

IP/device metadata where appropriate.

Audit logs must not be editable by normal admins.

==================================================
28. DATABASE DESIGN
==================================================

Create a normalized PostgreSQL database.

Minimum major tables:

users
roles
permissions
user_roles
role_permissions

customers
customer_addresses

products
product_variants
categories
subcategories
product_images
product_attributes

warehouses
warehouse_locations

raw_materials
suppliers

inventory
inventory_transactions
stock_reservations

boms
bom_items

production_orders
production_items
production_material_consumption
quality_checks

orders
order_items
order_status_history

carts
cart_items
wishlists

payments
payment_transactions
payment_webhooks

shipments
shipment_tracking

coupons
coupon_usage

notifications

audit_logs

settings

Integrations should have their own configuration tables
where appropriate.

Use UUIDs.

Use created_at and updated_at.

Use soft delete where appropriate.

Add indexes for frequently queried columns.

==================================================
29. DATABASE RULE
==================================================

Do not create an unnecessarily complicated database.

Before coding:

1. Identify entities.
2. Identify relationships.
3. Identify business rules.
4. Create ER diagram.
5. Create SQL schema.
6. Add indexes.
7. Add constraints.
8. Create seed data.

Do not duplicate business data unnecessarily.

==================================================
30. API DESIGN
==================================================

Use REST API.

Example:

/api/v1/auth
/api/v1/users
/api/v1/roles
/api/v1/products
/api/v1/categories
/api/v1/inventory
/api/v1/raw-materials
/api/v1/production
/api/v1/bom
/api/v1/orders
/api/v1/customers
/api/v1/payments
/api/v1/shipments
/api/v1/coupons
/api/v1/reports
/api/v1/notifications
/api/v1/settings

Use consistent response format:

{
  "success": true,
  "data": {},
  "message": "Success",
  "meta": {}
}

Errors:

{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

==================================================
31. API SECURITY
==================================================

Implement:

- Authentication middleware
- Authorization middleware
- Request validation
- Rate limiting
- CORS
- Security headers
- SQL injection protection
- XSS protection
- CSRF protection where applicable
- File upload validation
- API logging
- Error handling

Never expose:

- Password hashes
- Private API keys
- Payment secrets
- Database credentials

Use environment variables.

==================================================
32. FILE STORAGE
==================================================

Product images and documents must not be stored
directly inside database blobs unless necessary.

Use object storage.

Store:

- URL/path
- File name
- MIME type
- Size
- Entity relation

Validate uploaded files.

==================================================
33. SEARCH
==================================================

Implement product search.

Search by:

- Product name
- SKU
- Category
- Tags
- Attributes

Admin search should also support:

- Order ID
- Customer
- SKU
- Product

Use pagination everywhere.

Never load thousands of records unnecessarily.

==================================================
34. REAL-TIME FEATURES
==================================================

Where useful, implement real-time updates.

Examples:

- Order status
- Inventory updates
- Production status
- Notifications
- Dashboard counters

Avoid unnecessary real-time connections.

Use polling where real-time is not actually required.

==================================================
35. UI/UX REQUIREMENTS
==================================================

Admin panel:

- Professional enterprise UI
- Sidebar navigation
- Top navbar
- Breadcrumbs
- Search
- Notifications
- User menu
- Tables
- Filters
- Pagination
- Drawers/modals
- Confirmation dialogs
- Toast notifications
- Loading skeletons
- Empty states
- Error states

E-commerce:

- Premium design
- Fast product browsing
- Mobile responsive
- Clean checkout
- Clear product information
- Accessible forms

Do not make the interface look like a basic template.

==================================================
36. RESPONSIVE DESIGN
==================================================

Support:

Mobile
Tablet
Laptop
Desktop
Large screens

Test:

320px
375px
425px
768px
1024px
1440px
1920px

No horizontal overflow.

==================================================
37. SEO
==================================================

E-commerce pages should support:

- Dynamic title
- Meta description
- Canonical URL
- Open Graph
- Structured data where applicable
- SEO-friendly URLs
- Sitemap
- Robots.txt

==================================================
38. PERFORMANCE
==================================================

Optimize:

- Database queries
- API responses
- Images
- Bundle size
- Lazy loading
- Pagination
- Caching
- Code splitting

Avoid unnecessary API calls.

Use React Query caching properly.

==================================================
39. ERROR HANDLING
==================================================

Every feature must have:

Loading state
Success state
Empty state
Error state

Backend must have:

Central error middleware
Typed errors
Validation errors
Database errors
Integration errors

Never expose stack traces in production.

==================================================
40. TESTING
==================================================

Create:

Unit tests
Integration tests
API tests
Database tests
E2E tests

Critical test scenarios:

1. User login
2. Permission validation
3. Product creation
4. Inventory update
5. Production
6. Stock consumption
7. Customer registration
8. Add to cart
9. Checkout
10. Payment verification
11. Order creation
12. Inventory reservation
13. Order cancellation
14. Shipping creation
15. Refund
16. Role permissions

==================================================
41. CRITICAL BUSINESS RULES
==================================================

RULE 1:
Frontend must never be trusted for price.

RULE 2:
Frontend must never be trusted for stock.

RULE 3:
Payment must be verified server-side.

RULE 4:
Stock changes must create inventory transactions.

RULE 5:
Order processing must be idempotent.

RULE 6:
Payment webhooks must be idempotent.

RULE 7:
Unauthorized users must not access restricted APIs.

RULE 8:
Deleted/disabled products cannot be purchased.

RULE 9:
Production cannot consume unavailable material
without an authorized override.

RULE 10:
Every important state change must have history.

==================================================
42. BUSINESS EVENT ARCHITECTURE
==================================================

Design the system around business events.

Examples:

OrderCreated
PaymentSucceeded
PaymentFailed
OrderConfirmed
StockReserved
ProductionStarted
ProductionCompleted
OrderPacked
OrderShipped
OrderDelivered
OrderCancelled
RefundCompleted

Services should react to events where appropriate.

Avoid tightly coupling every module together.

==================================================
43. INTEGRATION ARCHITECTURE
==================================================

Create:

/integrations

Inside:

payment/
shipping/
email/
sms/
whatsapp/

Every provider must use an adapter/interface.

Example:

PaymentProvider
 ├── ProviderA
 ├── ProviderB

ShippingProvider
 ├── ProviderA
 └── ProviderB

This allows changing providers without rewriting
the entire application.

==================================================
44. ENVIRONMENT CONFIGURATION
==================================================

Create:

.env.example

Example:

DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

JWT_SECRET=
JWT_REFRESH_SECRET=

PAYMENT_API_KEY=
PAYMENT_SECRET=

SHIPPING_API_KEY=
SHIPPING_SECRET=

EMAIL_API_KEY=

APP_URL=
API_URL=

Never commit .env files.

==================================================
45. DEVELOPMENT PHASES
==================================================

Do NOT attempt to build everything randomly.

Follow this exact order.

PHASE 1:
Requirements + architecture

PHASE 2:
Database + ER diagram

PHASE 3:
Authentication + RBAC

PHASE 4:
Admin foundation

PHASE 5:
Product + category management

PHASE 6:
Raw materials + inventory

PHASE 7:
BOM + production

PHASE 8:
Finished goods

PHASE 9:
Customer e-commerce

PHASE 10:
Cart + checkout

PHASE 11:
Orders

PHASE 12:
Payment integration

PHASE 13:
Shipping integration

PHASE 14:
IMS ↔ E-commerce synchronization

PHASE 15:
Notifications

PHASE 16:
Reports

PHASE 17:
Audit logs

PHASE 18:
Testing

PHASE 19:
Security hardening

PHASE 20:
Deployment

PHASE 21:
Documentation + handover

==================================================
46. DEVELOPMENT RULE
==================================================

Before implementing each phase:

1. Explain what will be built.
2. Show affected modules.
3. Show database changes.
4. Show API changes.
5. Show frontend changes.
6. Implement.
7. Run tests.
8. Fix errors.
9. Verify integration.
10. Only then move to next phase.

Do not skip phases.

==================================================
47. CODE QUALITY
==================================================

Write production-quality code.

Requirements:

- TypeScript strict mode
- Strong typing
- Reusable components
- Reusable services
- No duplicated business logic
- No giant components
- No giant controllers
- No hard-coded credentials
- No unnecessary dependencies
- Clean naming
- Clear folder structure
- Comments only where useful

Do not create fake APIs or fake backend logic
unless explicitly requested for development mock mode.

==================================================
48. MOCK / DEVELOPMENT MODE
==================================================

If external payment or shipping APIs are not available,
create a development adapter.

Example:

MockPaymentProvider
MockShippingProvider

But clearly separate it from production providers.

Production code must never accidentally use mock services.

==================================================
49. DEPLOYMENT
==================================================

Prepare the application for production.

Frontend:
- Build
- Environment variables
- SPA routing
- HTTPS

Backend:
- Production environment
- Process management
- Logging
- Health endpoint
- Database connection handling

Create:

GET /health

Response:

{
  "status": "ok"
}

Also create deployment documentation.

==================================================
50. DOCUMENTATION
==================================================

Generate:

README.md

Include:

- Project overview
- Architecture
- Installation
- Environment variables
- Database setup
- Development commands
- Production commands
- API overview
- Deployment
- Troubleshooting

Also create:

docs/
  architecture.md
  database.md
  api.md
  authentication.md
  inventory.md
  production.md
  ecommerce.md
  integrations.md
  deployment.md
  user-guide.md

==================================================
51. FINAL ACCEPTANCE CRITERIA
==================================================

The project is considered complete only when:

[ ] Authentication works
[ ] RBAC works
[ ] Admin dashboard works
[ ] Product management works
[ ] Category management works
[ ] Raw material management works
[ ] Inventory works
[ ] Stock ledger works
[ ] BOM works
[ ] Production works
[ ] Finished goods works
[ ] Customer registration works
[ ] E-commerce works
[ ] Cart works
[ ] Checkout works
[ ] Orders work
[ ] Payment integration works
[ ] Shipping integration works
[ ] IMS synchronization works
[ ] Notifications work
[ ] Reports work
[ ] Audit logs work
[ ] Responsive design works
[ ] Security checks completed
[ ] Tests completed
[ ] Production build works
[ ] Documentation completed

==================================================
52. IMPORTANT AI DEVELOPMENT INSTRUCTION
==================================================

You are not allowed to simply generate large amounts of code
without understanding the architecture.

First inspect the existing project.

If code already exists:

- Do not unnecessarily rewrite it.
- Reuse working modules.
- Identify existing architecture.
- Identify bugs.
- Preserve working functionality.
- Refactor only when necessary.

Before creating a new module, check whether
a reusable service/component already exists.

Never duplicate functionality.

When you encounter an error:

1. Identify root cause.
2. Explain it briefly.
3. Fix it.
4. Test it.
5. Continue.

Do not hide errors.

==================================================
53. FIRST TASK
==================================================

DO NOT START CODING IMMEDIATELY.

First create:

1. Complete system architecture
2. Module architecture
3. User/role architecture
4. Complete database ER diagram
5. Database table list with relationships
6. Business workflow diagram
7. IMS workflow
8. E-commerce workflow
9. Order workflow
10. Inventory workflow
11. Production workflow
12. Payment workflow
13. Shipping workflow
14. IMS ↔ E-commerce synchronization workflow
15. API architecture
16. Frontend page structure
17. Admin sidebar structure
18. Project folder structure
19. Development roadmap
20. Risk list

Then wait for approval before implementing Phase 1.

Do not skip the architecture stage.

==================================================
FINAL GOAL
==================================================

Build a real production-ready integrated:

        IMS / ERP
            +
      E-COMMERCE
            +
        INVENTORY
            +
       PRODUCTION
            +
        PAYMENTS
            +
        SHIPPING
            +
       CUSTOMERS
            +
          RBAC
            +
        REPORTING

system where all major business operations are connected,
traceable, secure and scalable.
Recommended build structure

For your project, I would use this high-level flow:

                    CRUNCHX PLATFORM
                           │
          ┌────────────────┴────────────────┐
          │                                 │
     E-COMMERCE                         ADMIN / IMS
          │                                 │
   ┌──────┼──────┐                  ┌───────┼────────┐
   │      │      │                  │       │        │
Products Cart  Customers        Inventory Production Orders
   │      │      │                  │       │        │
   └──────┼──────┘                  └───────┼────────┘
          │                                 │
          └──────────────┬──────────────────┘
                         │
                    CORE BACKEND
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    PostgreSQL       Payment          Shipping
    /Supabase        Gateway            API
        │
        ├── Auth/RBAC
        ├── Inventory
        ├── Production
        ├── Orders
        ├── Customers
        ├── Reports
        └── Audit Logs

One important point: don't ask the AI coding tool to generate the entire application in one shot. Give it this master prompt, let it produce the architecture + database + workflow first, then build phase-by-phase. That will greatly reduce broken relationships between inventory → production → e-commerce → orders → payment → shipping.

I can react js and backend node js and database MySQL so give me master 

Yes. If your stack is React.js + Node.js + MySQL, use this version of the master prompt. It is tailored specifically for that stack and for the IMS/ERP + CRUNCHX e-commerce project shown in your image.

MASTER PROMPT — REACT + NODE.JS + MYSQL
You are a Senior Full-Stack Software Architect and Engineer.

I want you to build a complete production-ready business platform
called:

CRUNCHX — IMS/ERP + E-COMMERCE PLATFORM

TECHNOLOGY STACK:

Frontend:
- React.js
- Vite
- JavaScript or TypeScript
- React Router
- Axios
- Tailwind CSS
- React Hook Form
- Reusable components

Backend:
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt
- Axios
- Multer where required

Database:
- MySQL 8+
- mysql2
- Proper relational database design
- Foreign keys
- Indexes
- Transactions
- Constraints

DO NOT use:
- Supabase
- Firebase
- MongoDB
- PostgreSQL
- Node frameworks other than Express unless explicitly required.

==================================================
1. PROJECT PURPOSE
==================================================

Build TWO connected applications:

1. INTERNAL MANAGEMENT SYSTEM / ERP
2. CRUNCHX E-COMMERCE PLATFORM

Both systems must communicate through the Node.js backend.

Overall architecture:

                 CRUNCHX PLATFORM
                        |
          +-------------+-------------+
          |                           |
          v                           v
   E-COMMERCE WEBSITE             ADMIN / IMS
          |                           |
          |                           |
          +------------+--------------+
                       |
                 NODE.JS API
                       |
                    MYSQL
                       |
       +---------------+----------------+
       |               |                |
   Inventory       Production        Orders
       |               |                |
       +---------------+----------------+
                       |
             Payment / Shipping
==================================================
2. DEVELOPMENT PHILOSOPHY

This is NOT a simple CRUD project.

Build it like a real company ERP + e-commerce system.

Requirements:

Modular architecture
Secure authentication
Role-based permissions
Proper database relationships
Transaction-safe inventory
Reliable order processing
Payment verification
Shipping integration
Audit logs
Error handling
Validation
Responsive UI
Production-ready code

Do not create unnecessary complexity.

Prefer simple, maintainable solutions.

==================================================
3. PROJECT STRUCTURE

Create two applications:

/frontend
/backend

Frontend:

frontend/
src/
components/
layouts/
pages/
features/
hooks/
services/
api/
context/
utils/
validations/
routes/
assets/

Backend:

backend/
src/
config/
controllers/
routes/
services/
repositories/
middleware/
validators/
models/
utils/
integrations/
jobs/
database/
uploads/

Use:

Route
↓
Controller
↓
Service
↓
Repository
↓
MySQL

Do NOT put all business logic inside controllers.

==================================================
4. DATABASE

Use MySQL 8+.

Use InnoDB.

Use UUID or carefully designed BIGINT IDs.

Every major table should have:

id
created_at
updated_at

Use foreign keys.

Use indexes on:

email
SKU
slug
order number
customer ID
product ID
status
created_at

Use database transactions for:

Orders
Payments
Inventory
Production
Stock reservation
Refunds
==================================================
5. CORE DATABASE TABLES

Create these major tables.

AUTH:

users
roles
permissions
user_roles
role_permissions

CUSTOMERS:

customers
customer_addresses

PRODUCTS:

products
product_categories
categories
subcategories
product_images
product_variants
product_attributes

SUPPLIERS:

suppliers
supplier_products

WAREHOUSE:

warehouses
warehouse_locations

RAW MATERIAL:

raw_materials
raw_material_categories

INVENTORY:

inventory
inventory_transactions
stock_reservations
stock_transfers

PRODUCTION:

boms
bom_items
production_orders
production_items
production_materials
quality_checks

ORDERS:

carts
cart_items
orders
order_items
order_status_history

PAYMENTS:

payments
payment_transactions
payment_webhooks
refunds

SHIPPING:

shipments
shipment_tracking

MARKETING:

coupons
coupon_usage
wishlists

SYSTEM:

notifications
audit_logs
settings

==================================================
6. AUTHENTICATION

Implement:

Login
Logout
Register
Forgot password
Reset password
JWT access token
Refresh token
Password hashing using bcrypt
Account activation/deactivation

Never store plain passwords.

Never expose password hashes through APIs.

Use middleware:

authenticateUser
authorizeRole
authorizePermission

Example:

Authorization: Bearer <token>

==================================================
7. RBAC

Create dynamic Role-Based Access Control.

Roles:

Super Admin
Admin
Inventory Manager
Production Manager
Warehouse Manager
Sales Manager
Order Manager
Finance Manager
Support Staff
Employee
Customer

Permissions should be granular.

Examples:

users.view
users.create
users.update
users.delete

products.view
products.create
products.update
products.delete

inventory.view
inventory.adjust
inventory.transfer

production.view
production.create
production.update
production.approve

orders.view
orders.update
orders.cancel

payments.view
payments.refund

reports.view

settings.manage

Do not hard-code permissions in React.

Backend must enforce permissions.

==================================================
8. ADMIN PANEL

Create professional admin dashboard.

Sidebar:

Dashboard

Business
├── Products
├── Categories
├── Customers
├── Orders
└── Discounts

Inventory
├── Inventory
├── Raw Materials
├── Warehouses
├── Stock Transfers
└── Stock History

Production
├── Bill of Materials
├── Production Orders
├── Production Planning
└── Quality Checks

Shipping
├── Shipments
└── Tracking

Finance
├── Payments
├── Refunds
└── Transactions

Reports
├── Sales
├── Inventory
├── Production
├── Customers
└── Orders

System
├── Users
├── Roles & Permissions
├── Notifications
├── Audit Logs
└── Settings

==================================================
9. ADMIN DASHBOARD

Show:

Total Sales
Total Orders
Pending Orders
Completed Orders
Customers
Inventory Value
Low Stock
Production
Pending Production
Shipments

Charts:

Sales
Orders
Revenue
Production
Inventory movement
Top products

Date filters:

Today
Yesterday
7 Days
30 Days
Custom Range

==================================================
10. PRODUCT MANAGEMENT

Admin can:

Create product
Edit product
Delete/archive product
Upload images
Manage variants
Manage price
Manage stock settings
Manage categories
Manage attributes

Product fields:

SKU
Name
Slug
Description
Short Description
Category
Subcategory
Brand
MRP
Selling Price
Cost Price
Tax
Discount
Weight
Dimensions
Minimum Stock
Status

Product status:

Draft
Active
Inactive
Out of Stock
Archived

Never allow customers to purchase inactive products.

==================================================
11. INVENTORY SYSTEM

Inventory is one of the most important modules.

Never simply update:

stock = stock - 1

without recording a transaction.

Use:

inventory_transactions

Transaction types:

PURCHASE
RECEIVE
ISSUE
SALE
PRODUCTION_CONSUMPTION
PRODUCTION_OUTPUT
TRANSFER
ADJUSTMENT
RETURN
DAMAGE
RESERVATION
RELEASE

Example:

Initial stock = 100

Customer orders 5.

Create:

Stock Reservation = 5

Available stock = 95

After order confirmation/shipping according to
business rules:

Create stock deduction transaction.

Maintain complete history.

==================================================
12. WAREHOUSE

Support multiple warehouses.

Example:

Warehouse A
Warehouse B
Warehouse C

Each warehouse can contain:

Locations
Racks
Bins

Inventory should be warehouse-aware.

Example:

Product A

Warehouse A = 100
Warehouse B = 50

Do not mix warehouse stock incorrectly.

==================================================
13. RAW MATERIAL MANAGEMENT

Manage:

Material name
SKU
Unit
Supplier
Cost
Quantity
Minimum stock
Maximum stock
Batch
Expiry
Warehouse
Location

Workflow:

Purchase
↓
Receive
↓
Warehouse
↓
Available
↓
Production Consumption
↓
Stock Ledger


==================================================
14. BILL OF MATERIALS
==================================================

Create BOM.

Example:

Product:

CRUNCHX Product A

Requires:

Material A = 2 KG
Material B = 1 KG
Material C = 500 GM

If production quantity = 100:

Automatically calculate:

Material A = 200 KG
Material B = 100 KG
Material C = 50 KG

Validate stock before production.

==================================================
15. PRODUCTION
==================================================

Production workflow:

Draft
 ↓
Pending Approval
 ↓
Approved
 ↓
Materials Reserved
 ↓
Production Started
 ↓
Materials Consumed
 ↓
Quality Check
 ↓
Completed
 ↓
Finished Goods Added To Inventory

Production must generate inventory transactions.

Example:

Raw Material:

100 KG

Production consumes:

20 KG

Transaction:

PRODUCTION_CONSUMPTION

Production output:

50 units

Transaction:

PRODUCTION_OUTPUT

==================================================
16. QUALITY CHECK
==================================================

Production quality check:

- Production ID
- Product
- Quantity
- Passed
- Failed
- Defective quantity
- Remarks
- Checked by
- Checked date

If quality fails:

Do not automatically move all production
into sellable inventory.

==================================================
17. E-COMMERCE WEBSITE
==================================================

Create separate customer-facing React application/interface.

Pages:

Home
Products
Product Details
Categories
Search
Cart
Checkout
Login
Register
My Account
Orders
Order Details
Wishlist
Contact
About
Privacy
Terms

==================================================
18. CUSTOMER EXPERIENCE
==================================================

Customer can:

Browse products
Search
Filter
Sort
View product
Select variant
Add to cart
Wishlist
Apply coupon
Checkout
Add address
Pay
View order
Track order
Request cancellation if allowed
View invoice

==================================================
19. HEALTH-BASED FILTERS
==================================================

The specification requires health-based filtering.

Make this configurable.

Do not hard-code medical claims.

Create product attributes such as:

Ingredients
Allergens
Dietary preferences
Nutritional attributes
Suitable-for tags

Admin controls these attributes.

==================================================
20. CART
==================================================

Support:

Guest cart
Logged-in cart
Variants
Quantity
Coupon
Tax
Shipping
Total

When guest logs in:

Merge guest cart with customer cart.

Validate product availability on backend.

Never trust frontend price.

==================================================
21. CHECKOUT
==================================================

Workflow:

Cart
 ↓
Address
 ↓
Shipping
 ↓
Coupon
 ↓
Tax
 ↓
Order Summary
 ↓
Payment
 ↓
Confirmation

Backend recalculates:

Product price
Discount
Tax
Shipping
Grand total

Never accept the final total directly from React.

==================================================
22. ORDER MANAGEMENT
==================================================

Order statuses:

PENDING_PAYMENT
CONFIRMED
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURNED
REFUNDED

Create:

orders
order_items
order_status_history

Every status change must be recorded.

Example:

Order #10001

PENDING_PAYMENT
 ↓
CONFIRMED
 ↓
PROCESSING
 ↓
PACKED
 ↓
SHIPPED
 ↓
DELIVERED

==================================================
23. ORDER + INVENTORY
==================================================

When customer places order:

Customer
 ↓
Checkout
 ↓
Backend validates stock
 ↓
Create order
 ↓
Reserve stock
 ↓
Payment
 ↓
Payment verified
 ↓
Order confirmed
 ↓
IMS updated

If payment fails:

Release reservation.

If order is cancelled:

Release or restore stock according to
the current order state.

Use MySQL transactions.

==================================================
24. PAYMENT
==================================================

Create payment abstraction.

Do not tightly couple application
to one payment provider.

Architecture:

PaymentService
       ↓
PaymentProvider
       ↓
Provider Adapter

Functions:

createPayment()
verifyPayment()
handleWebhook()
refundPayment()

Payment webhook must be idempotent.

Never trust:

payment_success = true

from React.

Always verify payment on backend.

==================================================
25. SHIPPING
==================================================

Create shipping abstraction.

ShippingService
       ↓
ShippingProvider
       ↓
Provider Adapter

Functions:

createShipment()
cancelShipment()
trackShipment()
getShippingLabel()

Store:

Shipment ID
Order ID
AWB
Courier
Status
Tracking URL
Tracking events

==================================================
26. IMS + E-COMMERCE SYNCHRONIZATION
==================================================

This is a core requirement.

E-commerce:

Customer places order
        ↓
Node.js Order Service
        ↓
MySQL
        ↓
IMS

IMS:

Inventory
Production
Warehouse
Order Processing
Shipping

must all work with the same central business data.

Do not create duplicate stock systems.

==================================================
27. CUSTOMER MANAGEMENT
==================================================

Admin can view:

Customer profile
Addresses
Orders
Purchase history
Total spending
Customer status
Notes

Customer dashboard:

Profile
Addresses
Orders
Wishlist
Payments
Account settings

==================================================
28. COUPONS
==================================================

Support:

Percentage
Fixed amount
Product-specific
Category-specific
Minimum order
Maximum discount
Start date
End date
Usage limit
Per-customer limit

Validate everything server-side.

==================================================
29. NOTIFICATIONS
==================================================

Create notification service.

Events:

Registration
Order Created
Payment Success
Payment Failure
Order Confirmed
Packed
Shipped
Delivered
Cancelled
Refund
Low Stock
Production Complete

Support architecture for:

Email
SMS
WhatsApp
In-app

Providers must be replaceable.

==================================================
30. REPORTS
==================================================

Create:

Sales Report
Order Report
Revenue Report
Inventory Report
Stock Movement Report
Production Report
Raw Material Report
Customer Report
Payment Report
Shipping Report
Return Report
Refund Report

Support:

Date range
Filters
Search
Pagination
CSV export

==================================================
31. AUDIT LOG
==================================================

Record sensitive actions.

Example:

Admin changed product price.

Store:

User
Action
Entity
Entity ID
Old value
New value
Timestamp

Audit logs should be protected.

==================================================
32. REST API
==================================================

Use:

/api/v1/auth

/api/v1/users
/api/v1/roles
/api/v1/permissions

/api/v1/products
/api/v1/categories

/api/v1/customers

/api/v1/inventory
/api/v1/raw-materials
/api/v1/warehouses

/api/v1/boms
/api/v1/production

/api/v1/carts
/api/v1/orders

/api/v1/payments
/api/v1/refunds

/api/v1/shipments

/api/v1/coupons

/api/v1/reports

/api/v1/notifications

/api/v1/settings

==================================================
33. API RESPONSE FORMAT
==================================================

Success:

{
  "success": true,
  "message": "Products fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

Error:

{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

Use correct HTTP status codes.

==================================================
34. VALIDATION
==================================================

Validate:

Request body
Query parameters
URL parameters
Files
Authentication
Permissions

Never trust client-side validation alone.

React validation is for UX.

Node.js validation is mandatory for security.

==================================================
35. SECURITY
==================================================

Implement:

JWT
bcrypt
Helmet
CORS
Rate limiting
Input validation
SQL injection protection
Secure file uploads
Access control
Error handling

Never expose:

Database passwords
JWT secrets
Payment secrets
API keys

Use:

.env

Create:

.env.example

==================================================
36. FILE UPLOADS
==================================================

Product images can be uploaded.

Validate:

File type
File size
Extension

Do not trust file extension alone.

Store file metadata in MySQL.

==================================================
37. SEARCH + PAGINATION
==================================================

All large lists must use pagination.

Examples:

Products
Customers
Orders
Inventory
Transactions
Production

Never return thousands of rows unnecessarily.

Support:

Search
Filters
Sorting
Pagination

==================================================
38. FRONTEND ARCHITECTURE
==================================================

Create reusable components:

Button
Input
Select
Modal
Drawer
Table
Pagination
Dropdown
Badge
Card
Tabs
DatePicker
SearchBox
ConfirmDialog
Toast
Loader
EmptyState
ErrorState

Create reusable layouts:

AdminLayout
CustomerLayout
AuthLayout

==================================================
39. REACT ROUTING
==================================================

Admin:

/admin
/admin/products
/admin/categories
/admin/orders
/admin/customers
/admin/inventory
/admin/raw-materials
/admin/production
/admin/bom
/admin/warehouses
/admin/payments
/admin/shipments
/admin/reports
/admin/users
/admin/roles
/admin/settings

Customer:

/
/products
/products/:slug
/cart
/checkout
/login
/register
/account
/account/orders
/account/orders/:id
/wishlist

Protect admin routes.

==================================================
40. RESPONSIVE UI
==================================================

Must work on:

Mobile
Tablet
Laptop
Desktop

Test:

320px
375px
425px
768px
1024px
1440px
1920px

No horizontal scrolling.

==================================================
41. ERROR / LOADING STATES
==================================================

Every page must have:

Loading
Success
Empty
Error

Do not leave blank screens.

Show useful messages.

==================================================
42. DATABASE TRANSACTIONS
==================================================

Use MySQL transactions for critical operations.

Example:

BEGIN

Create order

Create order items

Reserve inventory

Create payment record

Create order status

COMMIT

If any operation fails:

ROLLBACK

Never leave half-created orders.

==================================================
43. IDEMPOTENCY
==================================================

Implement idempotency for:

Payment webhooks
Order processing
Shipping webhooks
Stock operations where necessary

The same webhook must not:

- Create duplicate payment
- Create duplicate order
- Deduct stock twice

==================================================
44. PERFORMANCE
==================================================

Optimize:

MySQL queries
Indexes
React rendering
API requests
Images
Pagination

Avoid:

N+1 queries
Unnecessary API calls
Huge frontend bundles
Unnecessary re-renders

==================================================
45. LOGGING
==================================================

Backend should log:

Errors
Authentication failures
Important business events
Payment failures
Integration failures

Do not log passwords or secret keys.

==================================================
46. TESTING
==================================================

Create tests for:

Authentication
RBAC
Products
Inventory
Production
Orders
Payments
Shipping
Coupons

Critical scenarios:

Customer buys product
 ↓
Payment succeeds
 ↓
Order created
 ↓
Stock reserved
 ↓
IMS updated

Also test:

Payment failure
Order cancellation
Insufficient stock
Duplicate webhook
Unauthorized access
Invalid coupon

==================================================
47. DEPLOYMENT
==================================================

Prepare:

Frontend production build
Backend production configuration
MySQL production database
Environment variables
HTTPS
CORS
API URL
Frontend URL

Create:

GET /api/v1/health

Return:

{
  "success": true,
  "status": "ok"
}

==================================================
48. DOCUMENTATION
==================================================

Create:

README.md

docs/

  architecture.md
  database.md
  api.md
  authentication.md
  rbac.md
  inventory.md
  production.md
  ecommerce.md
  orders.md
  payments.md
  shipping.md
  deployment.md
  user-guide.md

==================================================
49. DEVELOPMENT PHASES
==================================================

DO NOT BUILD EVERYTHING AT ONCE.

PHASE 1
Architecture + Requirements

PHASE 2
MySQL Database + ER Diagram

PHASE 3
Node.js Project + Express

PHASE 4
Authentication + JWT + RBAC

PHASE 5
React Admin Foundation

PHASE 6
Product + Category Management

PHASE 7
Warehouse + Inventory

PHASE 8
Raw Materials

PHASE 9
BOM + Production

PHASE 10
Finished Goods

PHASE 11
Customer E-Commerce

PHASE 12
Cart + Wishlist

PHASE 13
Checkout

PHASE 14
Orders

PHASE 15
Payment

PHASE 16
Shipping

PHASE 17
IMS ↔ E-Commerce Synchronization

PHASE 18
Notifications

PHASE 19
Reports

PHASE 20
Audit Logs

PHASE 21
Testing

PHASE 22
Security

PHASE 23
Performance Optimization

PHASE 24
Deployment

PHASE 25
Documentation + Handover

==================================================
50. IMPORTANT DEVELOPMENT RULE
==================================================

Before coding:

FIRST generate:

1. System architecture
2. Complete workflow
3. Database ER diagram
4. Database tables
5. Relationships
6. API list
7. Admin pages
8. Customer pages
9. RBAC structure
10. Development roadmap

Then start Phase 1.

Do not immediately generate hundreds of files.

Build incrementally.

==================================================
51. EXISTING PROJECT RULE
==================================================

If an existing project is provided:

FIRST inspect it.

Do not delete working code.

Do not rewrite the whole project unnecessarily.

Reuse existing:

Components
APIs
Database tables
Authentication
Utilities

Only modify what is required.

==================================================
52. CODING RULES
==================================================

Write clean production-quality code.

Do not:

- Hard-code credentials
- Duplicate business logic
- Put SQL everywhere
- Put business logic inside React components
- Create huge components
- Create huge controllers
- Trust frontend data
- Ignore errors
- Create fake production integrations

Use:

Reusable components
Reusable services
Reusable API clients
Reusable validation
Reusable middleware

==================================================
53. FIRST RESPONSE
==================================================

Before writing implementation code, provide:

A. Complete architecture

B. System workflow

C. Database ER diagram

D. MySQL table structure

E. Relationships

F. API architecture

G. React page architecture

H. Admin sidebar

I. Customer website structure

J. RBAC structure

K. Inventory workflow

L. Production workflow

M. Order workflow

N. Payment workflow

O. Shipping workflow

P. IMS ↔ E-Commerce workflow

Q. Complete development phases

R. Potential technical risks

Then wait for my approval.

Do not start Phase 1 implementation until I approve.
Your exact technology architecture
                    ┌─────────────────────┐
                    │      React.js       │
                    │                     │
                    │ Admin + E-Commerce  │
                    └──────────┬──────────┘
                               │
                            Axios
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Node.js         │
                    │     Express.js      │
                    │                     │
                    │ Auth / RBAC         │
                    │ Products            │
                    │ Inventory           │
                    │ Production          │
                    │ Orders              │
                    │ Payments            │
                    │ Shipping            │
                    └──────────┬──────────┘
                               │
                            mysql2
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MySQL 8       │
                    │                     │
                    │ Users               │
                    │ Products            │
                    │ Inventory           │
                    │ Production          │
                    │ Orders              │
                    │ Payments             │
                    │ Shipping            │
                    └─────────────────────┘
Most important workflow
RAW MATERIAL
     ↓
WAREHOUSE
     ↓
PRODUCTION
     ↓
QUALITY CHECK
     ↓
FINISHED GOODS
     ↓
INVENTORY
     ↓
E-COMMERCE
     ↓
CUSTOMER
     ↓
CART
     ↓
CHECKOUT
     ↓
PAYMENT
     ↓
ORDER
     ↓
INVENTORY RESERVATION
     ↓
IMS
     ↓
PACKING
     ↓
SHIPPING
     ↓
DELIVERY

This stack is fully suitable for the project in your image: React.js frontend + Node.js/Express backend + MySQL database. The key is to make Inventory, Production, Orders, and RBAC the core foundation before connecting payment/shipping and polishing the e-commerce frontend