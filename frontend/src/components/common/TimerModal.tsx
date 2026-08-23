import React, { useState, useEffect } from 'react';
import { useTimer, TIMER_PRESETS } from '../../context/TimerContext';
import { taskService } from '../../services/api';
import { playTimerCompleteChime } from '../../utils/audio';
import type { ITask } from '../../types';

export const TimerModal: React.FC = () => {
  const {
    mode,
    workMinutes,
    breakMinutes,
    secondsRemaining,
    totalDurationSeconds,
    isActive,
    soundEnabled,
    attachedTaskId,
    attachedTaskTitle,
    completedSessions,
    totalFocusSeconds,
    isModalOpen,
    toggleTimer,
    resetTimer,
    switchMode,
    setWorkMinutes,
    setBreakMinutes,
    applyPreset,
    setAttachedTask,
    setSoundEnabled,
    setIsModalOpen,
    resetStats,
  } = useTimer();

  const [availableTasks, setAvailableTasks] = useState<ITask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);

  useEffect(() => {
    if (isModalOpen) {
      setIsLoadingTasks(true);
      taskService
        .getTasks()
        .then((res) => {
          if (res.success && res.data) {
            setAvailableTasks(res.data);
          }
        })
        .catch((err) => console.error('Failed to load tasks for timer:', err))
        .finally(() => setIsLoadingTasks(false));
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  // Format time MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // SVG Progress calculation
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = totalDurationSeconds > 0 ? secondsRemaining / totalDurationSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressFraction);

  // Format focus hours/mins
  const focusHours = Math.floor(totalFocusSeconds / 3600);
  const focusMins = Math.floor((totalFocusSeconds % 3600) / 60);
  const formattedFocusTime =
    focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Pomodoro Focus Suite
              </h2>
              <p className="text-xs text-slate-400">Boost focus and track productivity</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Mode Selector Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => switchMode('work')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                mode === 'work'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🎯 Focus Mode ({workMinutes}m)</span>
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                mode === 'break'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>☕ Break Time ({breakMinutes}m)</span>
            </button>
          </div>

          {/* Radial Countdown Timer */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
                {/* Background Ring */}
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  className={`transition-all duration-1000 ease-linear ${
                    mode === 'work' ? 'stroke-indigo-500' : 'stroke-teal-400'
                  }`}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Time Display Inside Ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                  {formattedTime}
                </span>
                
                <span
                  className={`mt-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isActive
                      ? mode === 'work'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isActive ? (mode === 'work' ? 'Focusing' : 'On Break') : 'Paused'}
                </span>

                {attachedTaskTitle && (
                  <p className="mt-2 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 rounded-lg px-2.5 py-0.5 truncate max-w-[180px]">
                    📌 {attachedTaskTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Controls: Play/Pause, Reset, Sound toggle */}
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-md"
                title="Reset Timer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center space-x-2.5 transition-all shadow-xl hover:scale-105 ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                    : mode === 'work'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/40'
                }`}
              >
                {isActive ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Start Session</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-2xl border transition-all shadow-md ${
                  soundEnabled
                    ? 'bg-slate-800 border-indigo-500/50 text-indigo-400 hover:bg-slate-700'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
                title={soundEnabled ? 'Sound Notifications Enabled' : 'Sound Muted'}
              >
                {soundEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Focus Presets
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {TIMER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.workMins, preset.breakMins)}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                    workMinutes === preset.workMins && breakMinutes === preset.breakMins
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center space-x-1">
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {preset.workMins}m / {preset.breakMins}m
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Task Binding Dropdown & Custom Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Task Selector */}
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Bind Focus Session to Task
                </label>
                <select
                  value={attachedTaskId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) {
                      setAttachedTask(null, null);
                    } else {
                      const task = availableTasks.find((t) => t._id === id);
                      setAttachedTask(id, task ? task.title : null);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  disabled={isLoadingTasks}
                >
                  <option value="">-- No specific task --</option>
                  {availableTasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      [{t.status}] {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Linking a task lets you track focus time against your roadmap.
              </p>
            </div>

            {/* Duration Adjustments */}
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Custom Durations
              </label>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Focus Minutes:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setWorkMinutes(workMinutes - 5)}
                    className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-indigo-400 w-8 text-center">
                    {workMinutes}m
                  </span>
                  <button
                    onClick={() => setWorkMinutes(workMinutes + 5)}
                    className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Break Minutes:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBreakMinutes(breakMinutes - 1)}
                    className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-teal-400 w-8 text-center">
                    {breakMinutes}m
                  </span>
                  <button
                    onClick={() => setBreakMinutes(breakMinutes + 1)}
                    className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Daily Focus Stats Widget */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950/60 p-4 rounded-2xl border border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Focus Stats Logged
                </h4>
                <div className="flex items-center space-x-3 mt-1 text-xs">
                  <span className="text-slate-100 font-semibold">
                    🎯 <strong className="text-indigo-400">{completedSessions}</strong> Sessions
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-100 font-semibold">
                    ⏱️ <strong className="text-teal-400">{formattedFocusTime}</strong> Total
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={playTimerCompleteChime}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition-colors"
                title="Test Chime Sound"
              >
                🔊 Test Sound
              </button>
              {completedSessions > 0 && (
                <button
                  onClick={resetStats}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                  title="Reset Statistics"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimerModal;
