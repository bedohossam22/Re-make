import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types';
import { getErrorMessage } from '../../utils/helpers';

const schema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setErrorMessage(null);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 mt-2 flex justify-center items-center font-semibold text-white rounded-xl shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 underline underline-offset-4">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
