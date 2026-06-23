import { contextBridge, ipcRenderer } from 'electron';
import type { Task } from './types';

const api = {
  updateTimerState: (state: {
    mode: 'focus' | 'break';
    isRunning: boolean;
    secondsRemaining: number;
    totalSeconds: number;
  }) =>
    ipcRenderer.send('timer:state-update', state),

  notifyCompletion: (mode: 'focus' | 'break') =>
    ipcRenderer.send('timer:completed', mode),

  recordSession: (session: { startedAt: string; durationSeconds: number }) =>
    ipcRenderer.invoke('session:record', session),

  getTodaySessions: (): Promise<Array<{ startedAt: string; durationSeconds: number }>> =>
    ipcRenderer.invoke('session:get-today'),

  getYesterdaySessions: (): Promise<Array<{ startedAt: string; durationSeconds: number }>> =>
    ipcRenderer.invoke('session:get-yesterday'),

  getSettings: (): Promise<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string; activeTaskId: string | null }> =>
    ipcRenderer.invoke('settings:get'),

  setSettings: (updates: Partial<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string; activeTaskId: string | null }>) =>
    ipcRenderer.invoke('settings:set', updates),

  getAllTasks: (): Promise<Task[]> =>
    ipcRenderer.invoke('task:get-all'),

  createTask: (name: string): Promise<Task> =>
    ipcRenderer.invoke('task:create', { name }),

  updateTask: (id: string, changes: Partial<Task>): Promise<Task | null> =>
    ipcRenderer.invoke('task:update', { id, changes }),

  deleteTask: (id: string): Promise<void> =>
    ipcRenderer.invoke('task:delete', { id }),

  recordTaskSession: (id: string, durationSeconds: number): Promise<void> =>
    ipcRenderer.invoke('task:record-session', { id, durationSeconds }),

  onDailyStatsRefresh: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on('daily-stats:refresh', listener);
    return () => ipcRenderer.removeListener('daily-stats:refresh', listener);
  },

  quit: () => ipcRenderer.send('app:quit'),

  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update:downloaded', () => callback());
  },

  installUpdate: () => ipcRenderer.send('update:install'),

  checkForUpdates: () => ipcRenderer.send('update:check'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
