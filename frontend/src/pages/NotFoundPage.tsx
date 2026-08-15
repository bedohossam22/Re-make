import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-center relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="glass-card max-w-md w-full p-8 z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
          <span className="text-4xl font-black">404</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
