import { Link, useLocation } from 'react-router-dom';

export default function Placeholder() {
  const location = useLocation();
  const section = location.pathname.replace(/^\/+/, '').split('/').join(' / ');

  return (
    <div className="card flex flex-col items-center p-12 text-center">
      <div className="text-3xl font-bold text-brand-600">CRUNCHX</div>
      <h1 className="mt-2 text-xl font-semibold text-slate-800 capitalize">{section}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        This module is scheduled in the development roadmap and will be wired to the
        backend in its dedicated phase.
      </p>
      <Link to="/" className="btn-secondary mt-6">
        Back to Home
      </Link>
    </div>
  );
}