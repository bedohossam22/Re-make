import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Timer } from './Timer';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <nav className="glass-nav sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              TaskFlow
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold block -mt-1">
              Management App
            </span>
          </div>
        </div>

        {/* Desktop Navigation / User Info & Actions */}
        {user && (
          <>
            <div className="hidden md:flex items-center space-x-4">
              <Timer />
              <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800/80 rounded-full py-1.5 px-3.5 shadow-inner">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 text-white font-bold flex items-center justify-center text-xs shadow-md">
                  {userInitials}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[140px]">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary text-xs sm:text-sm flex items-center space-x-2 py-2 px-4 rounded-xl hover:border-red-500/40 hover:text-red-300 transition-colors"
                title="Logout"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex md:hidden items-center space-x-2">
              <Timer />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col space-y-3 animate-fade-in">
          <div className="flex items-center space-x-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
              {userInitials}
            </div>
            <div className="text-left leading-tight min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="btn-danger text-sm flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
