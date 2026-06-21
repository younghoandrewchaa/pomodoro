// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const src = readFileSync(join(__dirname, '../../src/main.ts'), 'utf-8');

describe('first daily tray open', () => {
  it('persists the local date and asks the renderer to refresh daily stats', () => {
    expect(src).toContain('isFirstOpenToday(lastOpenedDate, now)');
    expect(src).toContain("settingsStore.set('lastOpenedDate', localDateKey(now))");
    expect(src).toContain("popoverWindow.webContents.send('daily-stats:refresh')");
  });

  it('checks for a new day only in the tray-click opening path', () => {
    const togglePopover = src.slice(
      src.indexOf('function togglePopover()'),
      src.indexOf('function registerIpcHandlers()'),
    );
    const completionHandler = src.slice(
      src.indexOf("ipcMain.on('timer:completed'"),
      src.indexOf("ipcMain.handle('session:record'"),
    );

    expect(togglePopover).toContain('refreshDailyStatsOnFirstOpen();');
    expect(completionHandler).not.toContain('refreshDailyStatsOnFirstOpen');
  });
});

describe('daily session queries', () => {
  it('filters today and yesterday using local calendar dates', () => {
    expect(src).toContain('isTimestampOnLocalDate(s.startedAt, today)');
    expect(src).toContain('isTimestampOnLocalDate(s.startedAt, yesterday)');
    expect(src).toContain('previousLocalDate(today)');
  });
});
