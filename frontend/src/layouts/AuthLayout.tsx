import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-2xl font-bold text-brand-600">CRUNCHX</div>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>
        <div className="card p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}