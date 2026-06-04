import { useReducer, useEffect, useRef } from 'react';
import ModeLabel from './ModeLabel';
import TimerDisplay from './TimerDisplay';
import ProgressBar from './ProgressBar';
import ControlButtons from './ControlButtons';
import SkipLink from './SkipLink';
import DailyStats from './DailyStats';
import SettingsPanel from './SettingsPanel';
import { reducer, initialState, toSeconds } from './timerReducer';

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

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
      <div className="app app--settings">
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
      <header className="app-header">
        <h1 className="app-title">Pomodoro</h1>
        <button
          className="app-menu-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          aria-label="Settings"
        >
          <MoreIcon />
        </button>
      </header>

      <main className="timer-stage">
        <ModeLabel mode={state.mode} />
        <div className="timer-ring-shell">
          <ProgressBar
            secondsRemaining={state.secondsRemaining}
            totalSeconds={totalSeconds}
            mode={state.mode}
          />
          <TimerDisplay secondsRemaining={state.secondsRemaining} />
        </div>
        <ControlButtons
          isRunning={state.isRunning}
          mode={state.mode}
          onPlay={() => dispatch({ type: 'PLAY' })}
          onPause={() => dispatch({ type: 'PAUSE' })}
          onReset={() => dispatch({ type: 'RESET' })}
        />
      </main>

      <footer className="app-footer">
        <SkipLink
          mode={state.mode}
          isRunning={state.isRunning}
          onSkipToBreak={() => dispatch({ type: 'SKIP_TO_BREAK' })}
          onSkipToFocus={() => dispatch({ type: 'SKIP_TO_FOCUS' })}
        />
        <DailyStats sessions={state.todaySessions} />
        <button className="quit-btn" onClick={() => window.electronAPI.quit()}>
          Quit
        </button>
      </footer>
    </div>
  );
}
