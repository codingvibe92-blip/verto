import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/auth';

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const { register: registerForm, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError('');
    try {
      const u = await login(values.email, values.password);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        navigate(redirect, { replace: true });
      } else {
        const isAdmin = u?.roles?.some((r) =>
          ['super-admin', 'admin', 'employee', 'inventory-manager', 'production-manager', 'quality-inspector'].includes(r.slug)
        );
        navigate(isAdmin ? '/admin' : '/', { replace: true });
      }
    } catch (err) {
      setError(AuthService.errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Login</h2>
      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            {...registerForm('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            {...registerForm('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="text-brand-600 hover:underline">
          Register
        </Link>
      </p>
      <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
        <p className="font-semibold">Demo accounts</p>
        <p>Admin: admin@crunchx.com / Admin@123</p>
        <p>Employee: employee@crunchx.com / Admin@123</p>
        <p>Customer: customer@crunchx.com / Admin@123</p>
      </div>
    </div>
  );
}