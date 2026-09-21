import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StorefrontLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-brand-600">
            CRUNCHX
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
            <NavLink to="/products" className="hover:text-brand-600">
              Products
            </NavLink>
            <a href="#/" className="hover:text-brand-600">Categories</a>
            <Link to="/cart" className="hover:text-brand-600">
              Cart
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 text-sm">
                <Link to="/account" className="text-slate-700 hover:text-brand-600">
                  {user.name}
                </Link>
                <button onClick={logout} className="text-slate-500 hover:text-red-600">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-600 hover:text-brand-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} CRUNCHX Business Management & E-Commerce Platform
      </footer>
    </div>
  );
}