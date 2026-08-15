import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotAuthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-center relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card max-w-md w-full p-8 z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Access Denied
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          You do not have permission to view this resource. Please sign in with appropriate credentials.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
