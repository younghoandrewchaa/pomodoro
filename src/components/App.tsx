import { useReducer, useEffect, useRef } from 'react';
import ModeLabel from './ModeLabel';
import TimerDisplay from './TimerDisplay';
import ProgressBar from './ProgressBar';
import ControlButtons from './ControlButtons';
import SkipLink from './SkipLink';
import Footer from './Footer';
import DailyStats from './DailyStats';
import SettingsPanel from './SettingsPanel';

type Mode = 'focus' | 'break';

interface SessionRecord {
  startedAt: string;
  durationSeconds: number;
}

interface PendingCompletion {
  mode: Mode;
  record?: SessionRecord;
}

interface State {
  mode: Mode;
  secondsRemaining: number;
  isRunning: boolean;
  focusMinutes: number;
  breakMinutes: number;
  showSettings: boolean;
  todaySessions: SessionRecord[];
  sessionStartedAt: string | null;
  initialized: boolean;
  pendingCompletion: PendingCompletion | null;
}

type Action =
  | { type: 'TICK' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP_TO_BREAK' }
  | { type: 'SKIP_TO_FOCUS' }
  | { type: 'CLEAR_PENDING_COMPLETION' }
  | { type: 'SET_FOCUS_DURATION'; minutes: number }
  | { type: 'SET_BREAK_DURATION'; minutes: number }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'SESSIONS_UPDATED'; sessions: SessionRecord[] }
  | { type: 'INIT'; focusMinutes: number; breakMinutes: number; sessions: SessionRecord[]; lastOpenedDate: string };

function toSeconds(minutes: number) {
  return minutes * 60;
}

function otherMode(mode: Mode): Mode {
  return mode === 'focus' ? 'break' : 'focus';
}

function modeSeconds(mode: Mode, state: Pick<State, 'focusMinutes' | 'breakMinutes'>): number {
  return toSeconds(mode === 'focus' ? state.focusMinutes : state.breakMinutes);
}

function reducer(state: State, action: Action): State {
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

    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };

    case 'CLOSE_SETTINGS':
      return { ...state, showSettings: false };

    case 'SESSIONS_UPDATED':
      return { ...state, todaySessions: action.sessions };

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
        initialized: true,
      };
    }

    default:
      return state;
  }
}

const DEFAULT_FOCUS = 20;
const DEFAULT_BREAK = 5;

const initialState: State = {
  mode: 'focus',
  secondsRemaining: toSeconds(DEFAULT_FOCUS),
  isRunning: false,
  focusMinutes: DEFAULT_FOCUS,
  breakMinutes: DEFAULT_BREAK,
  showSettings: false,
  todaySessions: [],
  sessionStartedAt: null,
  initialized: false,
  pendingCompletion: null,
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load settings and sessions on mount
  useEffect(() => {
    (async () => {
      const [settings, sessions] = await Promise.all([
        window.electronAPI.getSettings(),
        window.electronAPI.getTodaySessions(),
      ]);
      dispatch({
        type: 'INIT',
        focusMinutes: settings.focusMinutes,
        breakMinutes: settings.breakMinutes,
        lastOpenedDate: settings.lastOpenedDate,
        sessions,
      });
      await window.electronAPI.setSettings({ lastOpenedDate: new Date().toISOString().slice(0, 10) });
    })();
  }, []);

  // Timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning]);

  // Sync tray icon
  useEffect(() => {
    if (!state.initialized) return;
    window.electronAPI.updateTimerState({ mode: state.mode, isRunning: state.isRunning });
  }, [state.mode, state.isRunning, state.initialized]);

  // Handle completion side effects
  useEffect(() => {
    if (!state.pendingCompletion) return;
    const { mode, record } = state.pendingCompletion;
    window.electronAPI.notifyCompletion(mode);
    if (record) {
      window.electronAPI.recordSession(record).then(async () => {
        const sessions = await window.electronAPI.getTodaySessions();
        dispatch({ type: 'SESSIONS_UPDATED', sessions });
      });
    }
    dispatch({ type: 'CLEAR_PENDING_COMPLETION' });
  }, [state.pendingCompletion]);

  const totalSeconds = state.mode === 'focus'
    ? toSeconds(state.focusMinutes)
    : toSeconds(state.breakMinutes);

  const handleSetFocusDuration = (minutes: number) => {
    dispatch({ type: 'SET_FOCUS_DURATION', minutes });
    window.electronAPI.setSettings({ focusMinutes: minutes });
  };

  const handleSetBreakDuration = (minutes: number) => {
    dispatch({ type: 'SET_BREAK_DURATION', minutes });
    window.electronAPI.setSettings({ breakMinutes: minutes });
  };

  if (!state.initialized) {
    return <div className="app loading" />;
  }

  if (state.showSettings) {
    return (
      <div className="app">
        <SettingsPanel
          focusMinutes={state.focusMinutes}
          breakMinutes={state.breakMinutes}
          onSetFocus={handleSetFocusDuration}
          onSetBreak={handleSetBreakDuration}
          onClose={() => dispatch({ type: 'CLOSE_SETTINGS' })}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <ModeLabel mode={state.mode} />
      <TimerDisplay secondsRemaining={state.secondsRemaining} />
      <ProgressBar
        secondsRemaining={state.secondsRemaining}
        totalSeconds={totalSeconds}
        mode={state.mode}
      />
      <ControlButtons
        isRunning={state.isRunning}
        mode={state.mode}
        onPlay={() => dispatch({ type: 'PLAY' })}
        onPause={() => dispatch({ type: 'PAUSE' })}
        onReset={() => dispatch({ type: 'RESET' })}
      />
      <SkipLink
        mode={state.mode}
        isRunning={state.isRunning}
        onSkipToBreak={() => dispatch({ type: 'SKIP_TO_BREAK' })}
        onSkipToFocus={() => dispatch({ type: 'SKIP_TO_FOCUS' })}
      />
      <hr className="divider" />
      <Footer
        onToggleSettings={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        onQuit={() => window.electronAPI.quit()}
      />
      <hr className="divider" />
      <DailyStats sessions={state.todaySessions} />
    </div>
  );
}
