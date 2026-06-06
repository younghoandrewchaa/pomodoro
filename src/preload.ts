import { contextBridge, ipcRenderer } from 'electron';

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

  getSettings: (): Promise<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string }> =>
    ipcRenderer.invoke('settings:get'),

  setSettings: (updates: Partial<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string }>) =>
    ipcRenderer.invoke('settings:set', updates),

  quit: () => ipcRenderer.send('app:quit'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
