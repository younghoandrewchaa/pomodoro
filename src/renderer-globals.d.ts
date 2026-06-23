import type { Task } from './types';
import type { UpdateCheckStatus } from './autoUpdate';

export {};

declare global {
  interface ElectronAPI {
    updateTimerState: (state: {
      mode: 'focus' | 'break';
      isRunning: boolean;
      secondsRemaining: number;
      totalSeconds: number;
    }) => void;
    notifyCompletion: (mode: 'focus' | 'break') => void;
    recordSession: (session: { startedAt: string; durationSeconds: number }) => Promise<void>;
    getTodaySessions: () => Promise<Array<{ startedAt: string; durationSeconds: number }>>;
    getYesterdaySessions: () => Promise<Array<{ startedAt: string; durationSeconds: number }>>;
    getSettings: () => Promise<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string; activeTaskId: string | null }>;
    setSettings: (updates: Partial<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string; activeTaskId: string | null }>) => Promise<void>;
    getAllTasks: () => Promise<Task[]>;
    createTask: (name: string) => Promise<Task>;
    updateTask: (id: string, changes: Partial<Task>) => Promise<Task | null>;
    deleteTask: (id: string) => Promise<void>;
    recordTaskSession: (id: string, durationSeconds: number) => Promise<void>;
    onDailyStatsRefresh: (callback: () => void) => () => void;
    quit: () => void;
    onUpdateDownloaded: (callback: () => void) => void;
    installUpdate: () => void;
    checkForUpdates: () => void;
    onUpdateCheckResult: (callback: (status: UpdateCheckStatus) => void) => () => void;
  }

  interface Window {
    electronAPI: ElectronAPI;
  }
}
