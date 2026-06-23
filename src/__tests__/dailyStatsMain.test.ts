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

describe('manual update check feedback', () => {
  it('flags a user-initiated check before asking the updater', () => {
    const menuClick = src.slice(
      src.indexOf("label: checkingForUpdate"),
      src.indexOf("{ type: 'separator' },\n    { label: 'Quit'"),
    );
    expect(menuClick).toContain('manualUpdateCheck = true;');
    expect(menuClick.indexOf('manualUpdateCheck = true;'))
      .toBeLessThan(menuClick.indexOf('autoUpdater.checkForUpdates()'));
  });

  it('surfaces a dialog only for manual checks via showManualResult', () => {
    expect(src).toContain('if (!manualUpdateCheck) return;');
    expect(src).toContain("showManualResult('not-available')");
    expect(src).toContain("showManualResult('error', err.message)");
    expect(src).toContain("showManualResult('available')");
  });
});

describe('daily session queries', () => {
  it('filters today and yesterday using local calendar dates', () => {
    expect(src).toContain('isTimestampOnLocalDate(s.startedAt, today)');
    expect(src).toContain('isTimestampOnLocalDate(s.startedAt, yesterday)');
    expect(src).toContain('previousLocalDate(today)');
  });
});
