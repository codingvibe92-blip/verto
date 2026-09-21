import { Routes, Route, Navigate } from 'react-router-dom';
import StorefrontLayout from './layouts/StorefrontLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import { AdminRoute, GuestRoute, ProtectedRoute } from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import RawMaterials from './pages/admin/RawMaterials';
import BillOfMaterials from './pages/admin/BillOfMaterials';
import Production from './pages/admin/Production';
import QualityChecks from './pages/admin/QualityChecks';
import Inventory from './pages/admin/Inventory';
import Warehouses from './pages/admin/Warehouses';
import StockTransfers from './pages/admin/StockTransfers';
import StockHistory from './pages/admin/StockHistory';
import Orders from './pages/admin/Orders';
import Discounts from './pages/admin/Discounts';
import Customers from './pages/admin/Customers';
import Shipments from './pages/admin/Shipments';
import Payments from './pages/admin/Payments';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import AccountOrders from './pages/customer/AccountOrders';
import AccountProfile from './pages/customer/AccountProfile';
import CustomerProducts from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import About from './pages/customer/About';
import Contact from './pages/customer/Contact';
import Legal from './pages/customer/Legal';
import Users from './pages/admin/Users';
import Roles from './pages/admin/Roles';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import Wishlist from './pages/customer/Wishlist';
import Notifications from './pages/admin/Notifications';

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<CustomerProducts />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/categories/:slug" element={<CustomerProducts />} />
        <Route path="/search" element={<CustomerProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route
          path="/account/orders"
          element={
            <ProtectedRoute>
              <AccountOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/profile"
          element={
            <ProtectedRoute>
              <AccountProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/*"
          element={
            <ProtectedRoute>
              <AccountOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="raw-materials" element={<RawMaterials />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="stock-transfers" element={<StockTransfers />} />
        <Route path="stock-history" element={<StockHistory />} />
        <Route path="bom" element={<BillOfMaterials />} />
        <Route path="production" element={<Production />} />
        <Route path="quality-checks" element={<QualityChecks />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="tracking" element={<Shipments />} />
        <Route path="payments" element={<Payments />} />
        <Route path="refunds" element={<Payments />} />
        <Route path="transactions" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/sales" element={<Reports />} />
        <Route path="reports/inventory" element={<Reports />} />
        <Route path="reports/production" element={<Reports />} />
        <Route path="reports/customers" element={<Reports />} />
        <Route path="reports/orders" element={<Reports />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}