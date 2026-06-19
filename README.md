# Pomodoro

A macOS menu-bar Pomodoro timer built with Electron, React, and TypeScript.

## Development

```bash
npm install
npm run start      # dev server with hot reload
npm test           # run tests
```

## Releasing a new version

Releases are published from your local machine using `npm run release`. The script builds, signs, notarises, and uploads a DMG + ZIP directly to GitHub Releases. Existing installs pick up the update automatically via the in-app updater.

### One-time setup

Create a `.env` file in the project root (already git-ignored):

```sh
APPLE_ID=you@example.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
```

| Variable | Where to get it |
|---|---|
| `APPLE_ID` | Your Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | Create an [app-specific password](https://support.apple.com/en-us/102654) at appleid.apple.com |
| `APPLE_TEAM_ID` | Found in the [Apple Developer portal](https://developer.apple.com/account) under Membership |

Your Apple Developer signing certificate must also be installed in your macOS Keychain. The GitHub token is read automatically from the `gh` CLI — make sure you're logged in (`gh auth login`).

### Publishing

Make sure your working tree is clean, then:

```bash
npm run release
```

The script will:

1. Prompt you for release notes
2. Bump the **patch** version automatically — unless you already changed the version in `package.json`, in which case it uses yours as-is
3. Commit the version bump, create an annotated git tag, and push both
4. Create a GitHub Release with your release notes
5. Build, code-sign, notarise, and upload the `.dmg` and `.zip` to that release

The whole process takes ~5–10 minutes (notarisation is the slow part).

### Bumping minor or major versions

`npm run release` always bumps the patch number. To release a minor or major version, bump it yourself first:

```bash
npm version minor --no-git-tag-version   # or: major
```

Then run `npm run release` as normal — it will detect the already-bumped version and skip the auto-bump.
