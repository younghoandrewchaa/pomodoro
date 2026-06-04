# Repository Guidelines

## Project Structure & Module Organization

This is an Electron Forge app using Vite, React, and TypeScript. Main-process code lives in `src/main.ts`, preload APIs in `src/preload.ts`, and renderer entry points in `src/renderer.tsx` and `src/renderer.ts`. React UI is organized under `src/components/`, with shared timer logic in `src/components/timerReducer.ts`. Tests live next to the code they cover in `src/**/__tests__/`, with shared Vitest setup in `src/test-setup.ts`. Static tray icons and packaged image assets are in `assets/`. Build and Forge configuration is kept at the repository root in `forge.config.ts`, `vite.*.config.ts`, `vitest.config.ts`, and `tsconfig.json`.

## Build, Test, and Development Commands

- `npm start`: run the Electron app locally through Electron Forge.
- `npm test`: run the Vitest suite once.
- `npm run lint`: lint `.ts` and `.tsx` files with ESLint.
- `npm run package`: create a local packaged app build.
- `npm run make`: produce distributable installers via Electron Forge makers.
- `npm run publish`: publish Forge artifacts when release credentials are configured.

## Coding Style & Naming Conventions

Use TypeScript for app code and `.tsx` for React components. Follow the existing style: two-space indentation, single quotes, semicolons, named type exports, and PascalCase component filenames such as `TimerDisplay.tsx`. Keep reducer actions explicit and uppercase, for example `{ type: 'SET_BREAK_DURATION' }`. Prefer colocating small component-specific helpers with the component, and keep shared state transitions in `timerReducer.ts`.

## Testing Guidelines

Vitest runs in `jsdom` with React support. Place tests in `__tests__` directories and name them `*.test.ts` or `*.test.tsx`. Use descriptive `describe` blocks matching the unit under test, such as `reducer - TICK`. Always include a regression test when fixing a bug; it should fail before the fix and pass after.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries such as `Fix notification` or direct work-in-progress notes. Prefer concise, specific subjects that describe the user-visible change. Pull requests should include a brief summary, test results (`npm test`, `npm run lint` when applicable), linked issues, and screenshots or recordings for renderer UI changes.

## Security & Configuration Tips

Keep Electron APIs behind `src/preload.ts` and expose only the minimal renderer surface on `window.electronAPI`. Do not commit local credentials, release tokens, or machine-specific packaging output.
