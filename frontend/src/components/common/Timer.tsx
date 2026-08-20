import React, { useState, useEffect } from 'react';

export const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = () => {
    const nextMode = mode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    setIsActive(false);
    setSeconds(nextMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1 text-xs shadow-inner">
      <button
        onClick={switchMode}
        className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors uppercase text-[10px] tracking-wider"
        title="Switch between Focus (25m) and Break (5m)"
      >
        {mode}
      </button>
      <span className="font-mono font-bold text-slate-100 min-w-[42px] text-center">
        {formatTime(seconds)}
      </span>
      <button
        onClick={toggleTimer}
        className={`p-1 rounded-full transition-colors ${
          isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
        }`}
        title={isActive ? 'Pause' : 'Start'}
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
      <button
        onClick={resetTimer}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
        title="Reset Timer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

export default Timer;
