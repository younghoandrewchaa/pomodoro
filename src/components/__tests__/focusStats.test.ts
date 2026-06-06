import { describe, it, expect } from 'vitest';
import { computeDailyStats, DAILY_GOAL } from '../focusStats';

type S = { startedAt: string; durationSeconds: number };

const session = (durationSeconds: number): S => ({
  startedAt: '2026-06-06T09:00:00.000Z',
  durationSeconds,
});

describe('computeDailyStats', () => {
  it('reports completed count against the daily goal with progress percentage', () => {
    const today = [session(1500), session(1500), session(1500), session(1500)];
    const stats = computeDailyStats(today, []);
    expect(stats.completed).toBe(4);
    expect(stats.goal).toBe(DAILY_GOAL); // 8
    expect(stats.progressPct).toBe(50);
  });

  it('caps progress at 100% when the goal is exceeded', () => {
    const today = Array.from({ length: 10 }, () => session(1500));
    const stats = computeDailyStats(today, []);
    expect(stats.progressPct).toBe(100);
  });

  it('formats total focus time as hours and minutes', () => {
    // 4 x 1500s = 6000s = 1h 40m
    const stats = computeDailyStats([session(6000)], []);
    expect(stats.totalFocusLabel).toBe('1h 40m');
  });

  it('formats sub-hour focus time in minutes', () => {
    const stats = computeDailyStats([session(2400)], []); // 40 min
    expect(stats.totalFocusLabel).toBe('40 min');
  });

  it('computes a positive delta vs yesterday', () => {
    const today = [session(6000)]; // 100 min
    const yesterday = [session(5220)]; // 87 min -> +15%
    const stats = computeDailyStats(today, yesterday);
    expect(stats.deltaLabel).toBe('+15% vs yesterday');
  });

  it('computes a negative delta vs yesterday', () => {
    const today = [session(4500)]; // 75 min
    const yesterday = [session(6000)]; // 100 min -> -25%
    const stats = computeDailyStats(today, yesterday);
    expect(stats.deltaLabel).toBe('-25% vs yesterday');
  });

  it('returns no delta when there is no yesterday data', () => {
    const stats = computeDailyStats([session(6000)], []);
    expect(stats.deltaLabel).toBeNull();
  });
});
