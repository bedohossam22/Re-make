import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { playTimerCompleteChime } from '../utils/audio';

export type TimerMode = 'work' | 'break';

export interface PresetOption {
  name: string;
  workMins: number;
  breakMins: number;
  icon: string;
}

export const TIMER_PRESETS: PresetOption[] = [
  { name: 'Pomodoro', workMins: 25, breakMins: 5, icon: '🎯' },
  { name: 'Deep Work', workMins: 50, breakMins: 10, icon: '⚡' },
  { name: 'Quick Sprint', workMins: 15, breakMins: 3, icon: '🚀' },
];

interface TimerContextType {
  mode: TimerMode;
  workMinutes: number;
  breakMinutes: number;
  secondsRemaining: number;
  isActive: boolean;
  soundEnabled: boolean;
  attachedTaskId: string | null;
  attachedTaskTitle: string | null;
  completedSessions: number;
  totalFocusSeconds: number;
  isModalOpen: boolean;
  totalDurationSeconds: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  toggleTimer: () => void;
  switchMode: (targetMode?: TimerMode) => void;
  setWorkMinutes: (mins: number) => void;
  setBreakMinutes: (mins: number) => void;
  applyPreset: (workMins: number, breakMins: number) => void;
  setAttachedTask: (id: string | null, title: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  resetStats: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'taskflow_pomodoro_settings_v1';

interface StoredTimerData {
  workMinutes?: number;
  breakMinutes?: number;
  soundEnabled?: boolean;
  completedSessions?: number;
  totalFocusSeconds?: number;
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved preferences
  const getInitialStorage = (): StoredTimerData => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const initialStorage = getInitialStorage();

  const [mode, setMode] = useState<TimerMode>('work');
  const [workMinutes, setWorkMinutesState] = useState<number>(initialStorage.workMinutes || 25);
  const [breakMinutes, setBreakMinutesState] = useState<number>(initialStorage.breakMinutes || 5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>((initialStorage.workMinutes || 25) * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(
    initialStorage.soundEnabled !== undefined ? initialStorage.soundEnabled : true
  );

  const [attachedTaskId, setAttachedTaskId] = useState<string | null>(null);
  const [attachedTaskTitle, setAttachedTaskTitle] = useState<string | null>(null);

  const [completedSessions, setCompletedSessions] = useState<number>(initialStorage.completedSessions || 0);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState<number>(initialStorage.totalFocusSeconds || 0);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      const data: StoredTimerData = {
        workMinutes,
        breakMinutes,
        soundEnabled,
        completedSessions,
        totalFocusSeconds,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save timer data to localStorage', e);
    }
  }, [workMinutes, breakMinutes, soundEnabled, completedSessions, totalFocusSeconds]);

  const totalDurationSeconds = (mode === 'work' ? workMinutes : breakMinutes) * 60;

  const handleTimerCompletion = useCallback(() => {
    if (soundEnabled) {
      playTimerCompleteChime();
    }

    if (mode === 'work') {
      setCompletedSessions((prev) => prev + 1);
      setTotalFocusSeconds((prev) => prev + workMinutes * 60);

      const taskNotice = attachedTaskTitle ? ` on "${attachedTaskTitle}"` : '';
      toast.success(`🎉 Focus session completed${taskNotice}! Time for a break.`);

      // Switch to break mode
      setMode('break');
      setSecondsRemaining(breakMinutes * 60);
    } else {
      toast.info('⚡ Break session over! Ready to focus again?');
      setMode('work');
      setSecondsRemaining(workMinutes * 60);
    }

    setIsActive(false);
  }, [mode, workMinutes, breakMinutes, attachedTaskTitle, soundEnabled]);

  // Main countdown timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      handleTimerCompletion();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, handleTimerCompletion]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining((mode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  const switchMode = (targetMode?: TimerMode) => {
    const nextMode = targetMode || (mode === 'work' ? 'break' : 'work');
    setIsActive(false);
    setMode(nextMode);
    setSecondsRemaining((nextMode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  const setWorkMinutes = (mins: number) => {
    const validMins = Math.max(1, Math.min(120, mins));
    setWorkMinutesState(validMins);
    if (mode === 'work' && !isActive) {
      setSecondsRemaining(validMins * 60);
    }
  };

  const setBreakMinutes = (mins: number) => {
    const validMins = Math.max(1, Math.min(60, mins));
    setBreakMinutesState(validMins);
    if (mode === 'break' && !isActive) {
      setSecondsRemaining(validMins * 60);
    }
  };

  const applyPreset = (wMins: number, bMins: number) => {
    setIsActive(false);
    setWorkMinutesState(wMins);
    setBreakMinutesState(bMins);
    setSecondsRemaining((mode === 'work' ? wMins : bMins) * 60);
    toast.info(`Preset applied: ${wMins}m Focus / ${bMins}m Break`);
  };

  const setAttachedTask = (id: string | null, title: string | null) => {
    setAttachedTaskId(id);
    setAttachedTaskTitle(title);
    if (title) {
      toast.info(`Timer bound to task: "${title}"`);
    } else {
      toast.info('Task un-bound from timer');
    }
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
  };

  const resetStats = () => {
    setCompletedSessions(0);
    setTotalFocusSeconds(0);
    toast.info('Focus statistics reset');
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        workMinutes,
        breakMinutes,
        secondsRemaining,
        isActive,
        soundEnabled,
        attachedTaskId,
        attachedTaskTitle,
        completedSessions,
        totalFocusSeconds,
        isModalOpen,
        totalDurationSeconds,
        startTimer,
        pauseTimer,
        resetTimer,
        toggleTimer,
        switchMode,
        setWorkMinutes,
        setBreakMinutes,
        applyPreset,
        setAttachedTask,
        setSoundEnabled,
        setIsModalOpen,
        resetStats,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
