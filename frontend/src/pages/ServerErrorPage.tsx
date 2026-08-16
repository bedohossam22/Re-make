import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-center relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card max-w-lg w-full p-8 z-10 flex flex-col items-center shadow-2xl">
        {/* Error Badge */}
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20 mb-3">
          Error 500
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
          Internal Server Error
        </h1>
        
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          Something unexpected happened on our end. Our engineering team has been notified and is looking into it.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            {isRetrying ? (
              <>
                <svg className="w-4 h-4 animate-spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Reconnecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-semibold"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Technical Details Toggle */}
        <div className="w-full border-t border-slate-800 pt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <span>{showDetails ? 'Hide Technical Details' : 'Show Technical Details'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-left text-xs font-mono text-slate-400 space-y-1">
              <div><span className="text-slate-500">Status:</span> 500 Internal Server Error</div>
              <div><span className="text-slate-500">Request ID:</span> req_500_srv</div>
              <div><span className="text-slate-500">Timestamp:</span> {new Date().toISOString()}</div>
              <div><span className="text-slate-500">Message:</span> Unexpected backend response or service unavailability</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
