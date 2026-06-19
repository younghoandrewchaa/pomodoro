import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(import.meta.url), '../..');

function loadDotEnv(filePath: string): void {
  try {
    const lines = readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const raw = trimmed.slice(eqIdx + 1).trim();
      const value = raw.replace(/^(['"])(.*)\1$/, '$2');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch { /* .env not found — continue with existing env */ }
}

function run(cmd: string, opts: { stdio?: 'inherit' | 'pipe' } = {}): string {
  return execSync(cmd, { cwd: rootDir, stdio: 'pipe', ...opts }).toString().trim();
}

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(question, answer => { rl.close(); res(answer.trim()); }));
}

async function main(): Promise<void> {
  // --- Load .env ---
  loadDotEnv(resolve(rootDir, '.env'));

  // --- Required env vars ---
  const REQUIRED = ['APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'APPLE_TEAM_ID'] as const;
  const missing = REQUIRED.filter(v => !process.env[v]);
  if (missing.length) {
    console.error(`Error: missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // --- Fetch GitHub token from gh CLI ---
  process.env.GITHUB_TOKEN = run('gh auth token');

  // --- Clean working tree ---
  if (run('git status --porcelain')) {
    console.error('Error: working tree has uncommitted changes. Commit or stash them first.');
    process.exit(1);
  }

  // --- Release notes ---
  const releaseNote = await prompt('Release notes: ');
  if (!releaseNote) {
    console.error('Error: release notes cannot be empty.');
    process.exit(1);
  }

  // --- Detect version bump ---
  const req = createRequire(import.meta.url);
  const currentVersion: string = req(resolve(rootDir, 'package.json')).version;
  const latestTag = (() => {
    try { return run('git describe --tags --match "v*" --abbrev=0').replace(/^v/, ''); }
    catch { return ''; }
  })();

  let newVersion: string;
  if (currentVersion === latestTag) {
    newVersion = run('npm version patch --no-git-tag-version').replace(/^v/, '');
    console.log(`==> Bumped version to ${newVersion}`);
    run('git add package.json package-lock.json');
    run(`git commit -m "v${newVersion}"`);
    run('git push', { stdio: 'inherit' });
  } else {
    newVersion = currentVersion;
    console.log(`==> Using existing version ${newVersion}`);
  }

  const tag = `v${newVersion}`;

  // --- Tag and push ---
  run(`git tag -a ${tag} -m ${JSON.stringify(releaseNote)}`);
  run(`git push origin ${tag}`, { stdio: 'inherit' });

  // --- Create GitHub release ---
  run(
    `gh release create ${tag} --title ${tag} --notes ${JSON.stringify(releaseNote)}`,
    { stdio: 'inherit' },
  );

  // --- Build, sign, notarise, publish ---
  console.log('==> Building, signing, notarising, and publishing…');
  run('npx electron-forge publish', { stdio: 'inherit' });

  console.log(`\nDone — ${tag} is live on GitHub.`);
}

main().catch(err => { console.error(err.message ?? err); process.exit(1); });
