// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const forgeConfig = readFileSync('forge.config.ts', 'utf8');

describe('Forge DMG configuration', () => {
  it('uses a distinctive volume title to avoid generic /Volumes/pomodoro mount collisions in CI', () => {
    expect(forgeConfig).toContain("new MakerDMG({ format: 'ULFO', title: 'Sprout Installer' })");
  });
});
