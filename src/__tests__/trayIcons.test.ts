import { describe, expect, it } from 'vitest';
import { inflateSync } from 'node:zlib';
import {
  focusRipenessProgress,
  interpolateTomatoColor,
  createTomatoPngBuffer,
} from '../tray-icons';

function visibleBounds(png: Buffer) {
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const idatChunks: Buffer[] = [];
  let offset = 8;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString('ascii');
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IDAT') idatChunks.push(data);
    offset += 12 + length;
  }

  const scanlines = inflateSync(Buffer.concat(idatChunks));
  const bounds = { minX: width, minY: height, maxX: -1, maxY: -1 };

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1) + 1;
    for (let x = 0; x < width; x += 1) {
      const alpha = scanlines[rowOffset + x * 4 + 3];
      if (alpha > 0) {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.maxY = Math.max(bounds.maxY, y);
      }
    }
  }

  return {
    width: bounds.maxX - bounds.minX + 1,
    height: bounds.maxY - bounds.minY + 1,
  };
}

describe('tomato tray icon helpers', () => {
  it('clamps focus ripeness progress between empty and complete', () => {
    expect(focusRipenessProgress({ secondsRemaining: 1500, totalSeconds: 1500 })).toBe(0);
    expect(focusRipenessProgress({ secondsRemaining: 750, totalSeconds: 1500 })).toBe(0.5);
    expect(focusRipenessProgress({ secondsRemaining: 0, totalSeconds: 1500 })).toBe(1);
    expect(focusRipenessProgress({ secondsRemaining: 1800, totalSeconds: 1500 })).toBe(0);
    expect(focusRipenessProgress({ secondsRemaining: -30, totalSeconds: 1500 })).toBe(1);
  });

  it('interpolates tomato ripeness from green to red', () => {
    expect(interpolateTomatoColor(0)).toBe('#3ca35c');
    expect(interpolateTomatoColor(0.5)).toBe('#a7783f');
    expect(interpolateTomatoColor(1)).toBe('#ea4d22');
  });

  it('generates PNG buffers with the requested dimensions', () => {
    const icon = createTomatoPngBuffer('#ea4d22', 16);
    const retinaIcon = createTomatoPngBuffer('#ea4d22', 32);

    expect(Array.from(icon.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(icon.readUInt32BE(16)).toBe(16);
    expect(icon.readUInt32BE(20)).toBe(16);
    expect(retinaIcon.readUInt32BE(16)).toBe(32);
    expect(retinaIcon.readUInt32BE(20)).toBe(32);
  });

  it('fills most of the tray canvas with visible tomato pixels', () => {
    const bounds = visibleBounds(createTomatoPngBuffer('#ea4d22', 16));

    expect(bounds.width).toBeGreaterThanOrEqual(14);
    expect(bounds.height).toBeGreaterThanOrEqual(14);
  });
});
