import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { PublisherGithub } from '@electron-forge/publisher-github';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

type AppleCredentialName = 'APPLE_ID' | 'APPLE_APP_SPECIFIC_PASSWORD' | 'APPLE_TEAM_ID';

const requireEnv = (name: AppleCredentialName): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const shouldNotarize = Boolean(process.env.CI || process.env.APPLE_ID);

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    extraResource: ['./assets'],
    appBundleId: 'com.pomodoro.app',
    osxSign: {},
    osxNotarize: shouldNotarize
      ? {
          appleId: requireEnv('APPLE_ID'),
          appleIdPassword: requireEnv('APPLE_APP_SPECIFIC_PASSWORD'),
          teamId: requireEnv('APPLE_TEAM_ID'),
        }
      : undefined,
    extendInfo: {
      LSUIElement: true,
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerDMG({ format: 'ULFO', title: 'Pomodoro Installer' }),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: { owner: 'younghoandrewchaa', name: 'pomodoro' },
      prerelease: false,
      draft: false,
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      // Disabled: this app stores no web cookies worth encrypting, and enabling
      // it makes Chromium fetch a key from the macOS keychain (Safe Storage),
      // which triggers a keychain-access prompt on first launch.
      [FuseV1Options.EnableCookieEncryption]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
