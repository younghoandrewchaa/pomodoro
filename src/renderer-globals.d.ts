export {};

declare global {
  interface ElectronAPI {
    updateTimerState: (state: { mode: 'focus' | 'break'; isRunning: boolean }) => void;
    notifyCompletion: (mode: 'focus' | 'break') => void;
    recordSession: (session: { startedAt: string; durationSeconds: number }) => Promise<void>;
    getTodaySessions: () => Promise<Array<{ startedAt: string; durationSeconds: number }>>;
    getSettings: () => Promise<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string }>;
    setSettings: (updates: Partial<{ focusMinutes: number; breakMinutes: number; lastOpenedDate: string }>) => Promise<void>;
    quit: () => void;
  }

  interface Window {
    electronAPI: ElectronAPI;
  }
}
