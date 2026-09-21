import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/auth';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export default function Register() {
  const {
    register: registerForm,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError('');
    try {
      await register(values.name, values.email, values.password, values.phone);
      navigate('/', { replace: true });
    } catch (err) {
      setError(AuthService.errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Create account</h2>
      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            {...registerForm('name', { required: 'Name is required', minLength: 2 })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
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
          <label className="label">Phone (optional)</label>
          <input className="input" {...registerForm('phone')} />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            {...registerForm('password', { required: 'Password is required', minLength: 6 })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input
            type="password"
            className="input"
            {...registerForm('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="text-brand-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}