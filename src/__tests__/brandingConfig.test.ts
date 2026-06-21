// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  name: string;
  productName: string;
};
const mainSource = readFileSync('src/main.ts', 'utf8');

describe('Sprout application identity', () => {
  it('renames the product while preserving its technical package name', () => {
    expect(packageJson.productName).toBe('Sprout');
    expect(packageJson.name).toBe('pomodoro');
  });

  it('uses Sprout in menu and tray labels', () => {
    expect(mainSource).toContain('`Sprout v${app.getVersion()}`');
    expect(mainSource).toContain("tray.setToolTip('Sprout')");
    expect(mainSource).toContain("showNotification('Sprout: Focus Complete'");
  });
});
