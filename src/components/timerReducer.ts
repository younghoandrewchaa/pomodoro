import type { Task } from '../types';

export type { Task };
export type Mode = 'focus' | 'break';
export type View = 'timer' | 'settings' | 'tasks';

export interface SessionRecord {
  startedAt: string;
  durationSeconds: number;
}

export interface PendingCompletion {
  mode: Mode;
  record?: SessionRecord;
}

export interface State {
  mode: Mode;
  view: View;
  secondsRemaining: number;
  isRunning: boolean;
  focusMinutes: number;
  breakMinutes: number;
  todaySessions: SessionRecord[];
  yesterdaySessions: SessionRecord[];
  sessionStartedAt: string | null;
  initialized: boolean;
  pendingCompletion: PendingCompletion | null;
  tasks: Task[];
  activeTaskId: string | null;
}

export type Action =
  | { type: 'TICK' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP_TO_BREAK' }
  | { type: 'SKIP_TO_FOCUS' }
  | { type: 'CLEAR_PENDING_COMPLETION' }
  | { type: 'SET_FOCUS_DURATION'; minutes: number }
  | { type: 'SET_BREAK_DURATION'; minutes: number }
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_ACTIVE_TASK'; taskId: string | null }
  | { type: 'SESSIONS_UPDATED'; sessions: SessionRecord[] }
  | { type: 'TASKS_UPDATED'; tasks: Task[] }
  | { type: 'INIT'; focusMinutes: number; breakMinutes: number; sessions: SessionRecord[]; yesterdaySessions: SessionRecord[]; lastOpenedDate: string; tasks: Task[] };

export function toSeconds(minutes: number) {
  return minutes * 60;
}

export function otherMode(mode: Mode): Mode {
  return mode === 'focus' ? 'break' : 'focus';
}

export function modeSeconds(mode: Mode, state: Pick<State, 'focusMinutes' | 'breakMinutes'>): number {
  return toSeconds(mode === 'focus' ? state.focusMinutes : state.breakMinutes);
}

export const DEFAULT_FOCUS = 20;
export const DEFAULT_BREAK = 5;

export const initialState: State = {
  mode: 'focus',
  view: 'timer',
  secondsRemaining: toSeconds(DEFAULT_FOCUS),
  isRunning: false,
  focusMinutes: DEFAULT_FOCUS,
  breakMinutes: DEFAULT_BREAK,
  todaySessions: [],
  yesterdaySessions: [],
  sessionStartedAt: null,
  initialized: false,
  pendingCompletion: null,
  tasks: [],
  activeTaskId: null,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TICK': {
      const next = state.secondsRemaining - 1;
      if (next <= 0) {
        const nextMode = otherMode(state.mode);
        const record: SessionRecord | undefined =
          state.mode === 'focus' && state.sessionStartedAt
            ? { startedAt: state.sessionStartedAt, durationSeconds: toSeconds(state.focusMinutes) }
            : undefined;
        return {
          ...state,
          secondsRemaining: modeSeconds(nextMode, state),
          isRunning: false,
          mode: nextMode,
          sessionStartedAt: null,
          pendingCompletion: { mode: state.mode, record },
        };
      }
      return { ...state, secondsRemaining: next };
    }

    case 'PLAY':
      return {
        ...state,
        isRunning: true,
        sessionStartedAt: state.mode === 'focus' && !state.sessionStartedAt
          ? new Date().toISOString()
          : state.sessionStartedAt,
      };

    case 'PAUSE':
      return { ...state, isRunning: false };

    case 'RESET':
      return {
        ...state,
        isRunning: false,
        secondsRemaining: modeSeconds(state.mode, state),
        sessionStartedAt: null,
      };

    case 'SKIP_TO_BREAK':
      if (state.isRunning || state.mode !== 'focus') return state;
      return {
        ...state,
        mode: 'break',
        secondsRemaining: toSeconds(state.breakMinutes),
        sessionStartedAt: null,
      };

    case 'SKIP_TO_FOCUS':
      if (state.isRunning || state.mode !== 'break') return state;
      return {
        ...state,
        mode: 'focus',
        secondsRemaining: toSeconds(state.focusMinutes),
        sessionStartedAt: null,
      };

    case 'CLEAR_PENDING_COMPLETION':
      return { ...state, pendingCompletion: null };

    case 'SET_FOCUS_DURATION':
      return {
        ...state,
        focusMinutes: action.minutes,
        ...(state.mode === 'focus' ? {
          secondsRemaining: toSeconds(action.minutes),
          isRunning: false,
          sessionStartedAt: null,
        } : {}),
      };

    case 'SET_BREAK_DURATION':
      return {
        ...state,
        breakMinutes: action.minutes,
        ...(state.mode === 'break' ? {
          secondsRemaining: toSeconds(action.minutes),
          isRunning: false,
        } : {}),
      };

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'SET_ACTIVE_TASK':
      return { ...state, activeTaskId: action.taskId };

    case 'SESSIONS_UPDATED':
      return { ...state, todaySessions: action.sessions };

    case 'TASKS_UPDATED':
      return { ...state, tasks: action.tasks };

    case 'INIT': {
      const today = new Date().toISOString().slice(0, 10);
      const isFirstOpenToday = action.lastOpenedDate !== today;
      const mode: Mode = isFirstOpenToday ? 'focus' : state.mode;
      return {
        ...state,
        focusMinutes: action.focusMinutes,
        breakMinutes: action.breakMinutes,
        mode,
        secondsRemaining: toSeconds(mode === 'focus' ? action.focusMinutes : action.breakMinutes),
        todaySessions: action.sessions,
        yesterdaySessions: action.yesterdaySessions,
        tasks: action.tasks,
        initialized: true,
      };
    }

    default:
      return state;
  }
}
