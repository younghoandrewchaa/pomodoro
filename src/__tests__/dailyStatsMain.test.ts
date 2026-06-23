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
    const trigger = src.slice(
      src.indexOf('function triggerManualUpdateCheck()'),
      src.indexOf('function buildContextMenu()'),
    );
    expect(trigger).toContain('manualUpdateCheck = true;');
    expect(trigger.indexOf('manualUpdateCheck = true;'))
      .toBeLessThan(trigger.indexOf('autoUpdater.checkForUpdates()'));
  });

  it('runs the check regardless of packaging and reports synchronous failures', () => {
    const trigger = src.slice(
      src.indexOf('function triggerManualUpdateCheck()'),
      src.indexOf('function buildContextMenu()'),
    );
    expect(trigger).not.toContain('app.isPackaged');
    expect(trigger).toContain('autoUpdater.checkForUpdates()');
    expect(trigger).toContain("showManualResult('error'");
  });

  it('reports manual-check results as inline IPC, not a native dialog', () => {
    expect(src).toContain('if (!manualUpdateCheck) return;');
    expect(src).toContain("showManualResult('not-available')");
    expect(src).toContain("showManualResult('error', err.message)");
    expect(src).toContain("showManualResult('available')");
    // Result is pushed to the renderer for inline display, with no native popup.
    expect(src).toContain("webContents.send('update:check-result'");
    expect(src).not.toContain('dialog.showMessageBox');
  });

  it('routes both the tray menu and the update:check IPC through one trigger', () => {
    expect(src).toContain("ipcMain.on('update:check'");
    expect(src).toContain('function triggerManualUpdateCheck()');
    // The IPC handler and the tray menu click both call the shared trigger.
    const triggerCalls = src.match(/triggerManualUpdateCheck\(\)/g) ?? [];
    expect(triggerCalls.length).toBeGreaterThanOrEqual(3); // definition + tray + IPC
  });
});

describe('daily session queries', () => {
  it('filters today and yesterday using local calendar dates', () => {
    expect(src).toContain('isTimestampOnLocalDate(s.startedAt, today)');
    expect(src).toContain('isTimestampOnLocalDate(s.startedAt, yesterday)');
    expect(src).toContain('previousLocalDate(today)');
  });
});
