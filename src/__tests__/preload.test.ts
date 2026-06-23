// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const electron = vi.hoisted(() => ({
  exposeInMainWorld: vi.fn(),
  invoke: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  send: vi.fn(),
}));

vi.mock('electron', () => ({
  contextBridge: { exposeInMainWorld: electron.exposeInMainWorld },
  ipcRenderer: {
    invoke: electron.invoke,
    on: electron.on,
    removeListener: electron.removeListener,
    send: electron.send,
  },
}));

await import('../preload');

type ExposedApi = {
  onDailyStatsRefresh: (callback: () => void) => () => void;
  checkForUpdates: () => void;
};

describe('preload daily stats subscription', () => {
  beforeEach(() => {
    electron.on.mockClear();
    electron.removeListener.mockClear();
  });

  it('forwards refresh events and removes the exact IPC listener', () => {
    const api = electron.exposeInMainWorld.mock.calls[0][1] as ExposedApi;
    const callback = vi.fn();

    const unsubscribe = api.onDailyStatsRefresh(callback);
    const listener = electron.on.mock.calls[0][1] as () => void;
    listener();

    expect(electron.on).toHaveBeenCalledWith('daily-stats:refresh', listener);
    expect(callback).toHaveBeenCalledOnce();

    unsubscribe();
    expect(electron.removeListener).toHaveBeenCalledWith('daily-stats:refresh', listener);
  });

  it('requests a manual update check over the update:check channel', () => {
    const api = electron.exposeInMainWorld.mock.calls[0][1] as ExposedApi;
    api.checkForUpdates();
    expect(electron.send).toHaveBeenCalledWith('update:check');
  });
});
