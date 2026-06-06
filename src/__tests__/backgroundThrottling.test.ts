// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const src = readFileSync(join(__dirname, '../../src/main.ts'), 'utf-8');

// Regression test: Chromium throttles setInterval in hidden windows by default,
// freezing the timer when the popover is dismissed. backgroundThrottling: false
// prevents this. This test ensures the config is never accidentally removed.
describe('BrowserWindow webPreferences', () => {
  it('disables backgroundThrottling so the timer keeps running when the popover is hidden', () => {
    expect(src).toContain('backgroundThrottling: false');
  });

  it('keeps enough vertical room for the timer stage, stats and bottom nav', () => {
    expect(src).toContain('height: 844');
  });

  it('uses an opaque surface-toned window to avoid bright rounded-corner artifacts', () => {
    expect(src).toContain('transparent: false');
    expect(src).toContain("backgroundColor: '#f9f9f7'");
    expect(src).not.toContain("vibrancy: 'popover'");
    expect(src).not.toContain('visualEffectState');
  });
});

// Regression test: Electron Notification API silently fails in unsigned LSUIElement apps.
// osascript is used instead — it runs through Apple's signed binary and works in dev builds.
describe('timer:completed handler', () => {
  it('shows the popover when the timer completes', () => {
    expect(src).toContain('popoverWindow.show()');
  });

  it('uses osascript for notifications instead of the broken Electron Notification API', () => {
    expect(src).toContain('display notification');
    expect(src).not.toContain('new Notification(');
  });
});
