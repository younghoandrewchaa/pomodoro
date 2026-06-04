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
