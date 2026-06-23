import { describe, it, expect } from 'vitest';
import { reducer, initialState, toSeconds, DEFAULT_FOCUS, DEFAULT_BREAK } from '../timerReducer';

const runningFocusState = { ...initialState, isRunning: true };

describe('reducer – TICK', () => {
  it('decrements secondsRemaining by 1', () => {
    const state = reducer(runningFocusState, { type: 'TICK' });
    expect(state.secondsRemaining).toBe(initialState.secondsRemaining - 1);
  });

  it('transitions to break and stops when secondsRemaining reaches 0', () => {
    const almostDone = { ...runningFocusState, secondsRemaining: 1 };
    const state = reducer(almostDone, { type: 'TICK' });
    expect(state.mode).toBe('break');
    expect(state.isRunning).toBe(false);
    expect(state.secondsRemaining).toBe(toSeconds(DEFAULT_BREAK));
  });

  it('records a session on focus completion', () => {
    const almostDone = {
      ...runningFocusState,
      secondsRemaining: 1,
      sessionStartedAt: '2026-06-04T10:00:00.000Z',
    };
    const state = reducer(almostDone, { type: 'TICK' });
    expect(state.pendingCompletion?.record).toMatchObject({
      startedAt: '2026-06-04T10:00:00.000Z',
      durationSeconds: toSeconds(DEFAULT_FOCUS),
    });
  });
});

describe('reducer – PLAY / PAUSE / RESET', () => {
  it('PLAY sets isRunning to true', () => {
    const state = reducer(initialState, { type: 'PLAY' });
    expect(state.isRunning).toBe(true);
  });

  it('PAUSE sets isRunning to false', () => {
    const state = reducer(runningFocusState, { type: 'PAUSE' });
    expect(state.isRunning).toBe(false);
  });

  it('RESET stops timer and restores full duration', () => {
    const mid = { ...runningFocusState, secondsRemaining: 300 };
    const state = reducer(mid, { type: 'RESET' });
    expect(state.isRunning).toBe(false);
    expect(state.secondsRemaining).toBe(toSeconds(DEFAULT_FOCUS));
  });
});

describe('reducer – DAY_RESET', () => {
  it('resets an idle break-mode timer back to focus on the first open of a new day', () => {
    const leftInBreak = {
      ...initialState,
      mode: 'break' as const,
      secondsRemaining: toSeconds(DEFAULT_BREAK),
    };
    const state = reducer(leftInBreak, { type: 'DAY_RESET' });
    expect(state.mode).toBe('focus');
    expect(state.secondsRemaining).toBe(toSeconds(DEFAULT_FOCUS));
    expect(state.isRunning).toBe(false);
    expect(state.sessionStartedAt).toBeNull();
  });

  it('leaves a running session untouched', () => {
    const running = { ...runningFocusState, secondsRemaining: 300 };
    const state = reducer(running, { type: 'DAY_RESET' });
    expect(state.isRunning).toBe(true);
    expect(state.mode).toBe('focus');
    expect(state.secondsRemaining).toBe(300);
  });
});

describe('reducer – DAILY_SESSIONS_UPDATED', () => {
  it('replaces both daily session collections without changing timer state', () => {
    const current = {
      ...runningFocusState,
      secondsRemaining: 300,
      todaySessions: [{ startedAt: '2026-06-20T09:00:00.000Z', durationSeconds: 1200 }],
      yesterdaySessions: [{ startedAt: '2026-06-19T09:00:00.000Z', durationSeconds: 600 }],
    };
    const sessions = [{ startedAt: '2026-06-21T09:00:00.000Z', durationSeconds: 1500 }];
    const yesterdaySessions = [{ startedAt: '2026-06-20T09:00:00.000Z', durationSeconds: 1200 }];

    const state = reducer(current, {
      type: 'DAILY_SESSIONS_UPDATED',
      sessions,
      yesterdaySessions,
    });

    expect(state.todaySessions).toBe(sessions);
    expect(state.yesterdaySessions).toBe(yesterdaySessions);
    expect(state.isRunning).toBe(true);
    expect(state.secondsRemaining).toBe(300);
  });
});
