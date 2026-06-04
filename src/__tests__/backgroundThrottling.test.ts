// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Regression test: Chromium throttles setInterval in hidden windows by default,
// freezing the timer when the popover is dismissed. backgroundThrottling: false
// prevents this. This test ensures the config is never accidentally removed.
describe('BrowserWindow webPreferences', () => {
  it('disables backgroundThrottling so the timer keeps running when the popover is hidden', () => {
    const src = readFileSync(join(__dirname, '../../src/main.ts'), 'utf-8');
    expect(src).toContain('backgroundThrottling: false');
  });
});
