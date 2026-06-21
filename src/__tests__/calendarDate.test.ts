import { describe, expect, it } from 'vitest';
import {
  isFirstOpenToday,
  isTimestampOnLocalDate,
  localDateKey,
  previousLocalDate,
} from '../calendarDate';

describe('local calendar dates', () => {
  it('formats dates using local calendar fields', () => {
    expect(localDateKey(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02');
  });

  it('finds the previous local calendar day without subtracting 24 hours', () => {
    const previous = previousLocalDate(new Date(2026, 2, 30, 12));

    expect(localDateKey(previous)).toBe('2026-03-29');
    expect(previous.getHours()).toBe(12);
  });

  it('matches stored ISO timestamps against their local calendar date', () => {
    const localSessionStart = new Date(2026, 5, 21, 23, 30);

    expect(isTimestampOnLocalDate(localSessionStart.toISOString(), new Date(2026, 5, 21))).toBe(true);
    expect(isTimestampOnLocalDate(localSessionStart.toISOString(), new Date(2026, 5, 22))).toBe(false);
    expect(isTimestampOnLocalDate('not-a-date', new Date(2026, 5, 21))).toBe(false);
  });
});

describe('first daily open', () => {
  const today = new Date(2026, 5, 21, 8);

  it('recognizes an empty or older last-opened date as the first open today', () => {
    expect(isFirstOpenToday('', today)).toBe(true);
    expect(isFirstOpenToday('2026-06-20', today)).toBe(true);
  });

  it('recognizes subsequent opens on the same local day', () => {
    expect(isFirstOpenToday('2026-06-21', today)).toBe(false);
  });
});
