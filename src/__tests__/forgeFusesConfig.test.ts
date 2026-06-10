// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const forgeConfig = readFileSync('forge.config.ts', 'utf8');

describe('Forge fuses configuration', () => {
  it('disables cookie encryption so the app does not prompt for macOS keychain Safe Storage access', () => {
    expect(forgeConfig).toContain('[FuseV1Options.EnableCookieEncryption]: false');
  });
});
