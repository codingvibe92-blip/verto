import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm font-medium text-slate-500">CRUNCHX Admin</div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-700">{user?.name}</span>
            <button onClick={logout} className="text-slate-500 hover:text-red-600">
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}