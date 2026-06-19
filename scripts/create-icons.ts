import sharp from 'sharp';
import { mkdirSync, rmSync, readFileSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(import.meta.url), '../..');
const svgPath = resolve(rootDir, 'assets/icon.svg');
const iconsetDir = resolve(rootDir, 'assets/icon.iconset');
const outIcns = resolve(rootDir, 'assets/icon.icns');

// macOS iconset: each logical size needs a 1x file and a @2x file
const ENTRIES: Array<{ size: number; file: string }> = [
  { size: 16,   file: 'icon_16x16.png' },
  { size: 32,   file: 'icon_16x16@2x.png' },
  { size: 32,   file: 'icon_32x32.png' },
  { size: 64,   file: 'icon_32x32@2x.png' },
  { size: 128,  file: 'icon_128x128.png' },
  { size: 256,  file: 'icon_128x128@2x.png' },
  { size: 256,  file: 'icon_256x256.png' },
  { size: 512,  file: 'icon_256x256@2x.png' },
  { size: 512,  file: 'icon_512x512.png' },
  { size: 1024, file: 'icon_512x512@2x.png' },
];

async function main(): Promise<void> {
  rmSync(iconsetDir, { recursive: true, force: true });
  mkdirSync(iconsetDir);

  const svg = readFileSync(svgPath);
  const rendered = new Map<number, string>();

  for (const { size, file } of ENTRIES) {
    const dest = resolve(iconsetDir, file);
    if (rendered.has(size)) {
      copyFileSync(rendered.get(size)!, dest);
    } else {
      await sharp(svg).resize(size, size).png().toFile(dest);
      rendered.set(size, dest);
    }
    console.log(`  ${file}`);
  }

  execSync(`iconutil -c icns "${iconsetDir}" -o "${outIcns}"`);
  rmSync(iconsetDir, { recursive: true });
  console.log(`\nCreated assets/icon.icns`);
}

main().catch(err => { console.error(err.message ?? err); process.exit(1); });
