import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setStatusMsg(null);
    setTimeout(() => {
      setIsChecking(false);
      setStatusMsg('Maintenance is still in progress. Estimated completion in ~15 minutes.');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-center relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card max-w-lg w-full p-8 z-10 flex flex-col items-center shadow-2xl">
        {/* Maintenance Icon */}
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-3">
          503 Scheduled Maintenance
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
          We'll Be Back Soon
        </h1>
        
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          System upgrades are currently in progress to improve reliability and performance. Thank you for your patience!
        </p>

        {/* System Services Status Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mb-1.5 animate-ping" />
            <span className="text-[11px] font-medium text-slate-300">Database</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Operational</span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="w-2 h-2 rounded-full bg-amber-400 mb-1.5" />
            <span className="text-[11px] font-medium text-slate-300">API Gateway</span>
            <span className="text-[10px] text-amber-400 font-semibold">Upgrading</span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mb-1.5" />
            <span className="text-[11px] font-medium text-slate-300">Storage</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Operational</span>
          </div>
        </div>

        {statusMsg && (
          <div className="w-full mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
            {statusMsg}
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <svg className="w-4 h-4 animate-spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Check System Status</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
