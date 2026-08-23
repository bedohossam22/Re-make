import React from 'react';
import { useTimer } from '../../context/TimerContext';

export const Timer: React.FC = () => {
  const {
    mode,
    secondsRemaining,
    isActive,
    attachedTaskTitle,
    toggleTimer,
    resetTimer,
    switchMode,
    setIsModalOpen,
  } = useTimer();

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded-full px-3 py-1.5 text-xs shadow-lg transition-all hover:border-slate-600">
      
      {/* Mode Selector */}
      <button
        onClick={() => switchMode()}
        className={`font-bold uppercase text-[10px] tracking-wider transition-colors px-1.5 py-0.5 rounded-full ${
          mode === 'work'
            ? 'text-indigo-400 hover:text-indigo-300 bg-indigo-950/60'
            : 'text-teal-400 hover:text-teal-300 bg-teal-950/60'
        }`}
        title={`Current mode: ${mode.toUpperCase()}. Click to switch mode.`}
      >
        {mode}
      </button>

      {/* Countdown Time */}
      <span
        onClick={() => setIsModalOpen(true)}
        className="font-mono font-bold text-slate-100 min-w-[42px] text-center cursor-pointer hover:text-indigo-300 transition-colors"
        title="Click to open full Pomodoro Focus Suite"
      >
        {formattedTime}
      </span>

      {/* Attached Task Badge indicator (if set) */}
      {attachedTaskTitle && (
        <span
          onClick={() => setIsModalOpen(true)}
          className="hidden lg:inline-block text-[10px] text-indigo-300 bg-indigo-900/40 border border-indigo-700/50 rounded-full px-2 py-0.5 truncate max-w-[90px] cursor-pointer"
          title={`Active Focus Task: ${attachedTaskTitle}`}
        >
          📌 {attachedTaskTitle}
        </span>
      )}

      {/* Play / Pause Toggle */}
      <button
        onClick={toggleTimer}
        className={`p-1 rounded-full transition-all ${
          isActive
            ? 'text-amber-400 hover:text-amber-300 bg-amber-950/40 animate-pulse'
            : mode === 'work'
            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
            : 'text-teal-400 hover:text-teal-300 hover:bg-teal-950/40'
        }`}
        title={isActive ? 'Pause Timer' : 'Start Focus Timer'}
      >
        {isActive ? (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Reset Button */}
      <button
        onClick={resetTimer}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
        title="Reset Timer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Expand / Settings Modal Launcher Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-indigo-400 hover:text-indigo-200 transition-colors p-0.5 border-l border-slate-700/60 pl-1.5 ml-0.5"
        title="Open Pomodoro Suite Settings & Presets"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
};

export default Timer;
