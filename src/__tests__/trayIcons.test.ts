import { describe, expect, it } from 'vitest';
import {
  focusRipenessProgress,
  interpolateTomatoColor,
  createTomatoPngBuffer,
} from '../tray-icons';

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
});
