import { useReducer, useEffect, useRef } from 'react';
import ModeLabel from './ModeLabel';
import TimerDisplay from './TimerDisplay';
import ProgressBar from './ProgressBar';
import ControlButtons from './ControlButtons';
import DailyStats from './DailyStats';
import SettingsPanel from './SettingsPanel';
import { reducer, initialState, toSeconds } from './timerReducer';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load settings and sessions on mount
  useEffect(() => {
    (async () => {
      const [settings, sessions, yesterdaySessions] = await Promise.all([
        window.electronAPI.getSettings(),
        window.electronAPI.getTodaySessions(),
        window.electronAPI.getYesterdaySessions(),
      ]);
      dispatch({
        type: 'INIT',
        focusMinutes: settings.focusMinutes,
        breakMinutes: settings.breakMinutes,
        lastOpenedDate: settings.lastOpenedDate,
        sessions,
        yesterdaySessions,
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

  const handleSkip = () => {
    dispatch({ type: state.mode === 'focus' ? 'SKIP_TO_BREAK' : 'SKIP_TO_FOCUS' });
  };

  if (!state.initialized) {
    return <div className="app loading" />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="material-symbols-outlined" aria-hidden="true">timer</span>
          <h1 className="app-title">Pomodoro</h1>
        </div>
        <button className="app-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
        </button>
      </header>

      {state.showSettings ? (
        <SettingsPanel
          focusMinutes={state.focusMinutes}
          breakMinutes={state.breakMinutes}
          onSetFocus={handleSetFocusDuration}
          onSetBreak={handleSetBreakDuration}
          onQuit={() => window.electronAPI.quit()}
        />
      ) : (
        <>
          <main className="timer-stage">
            <div className="timer-ring-shell">
              <ProgressBar
                secondsRemaining={state.secondsRemaining}
                totalSeconds={totalSeconds}
                mode={state.mode}
              />
              <div className="timer-center">
                <TimerDisplay secondsRemaining={state.secondsRemaining} />
                <ModeLabel mode={state.mode} />
              </div>
            </div>
            <ControlButtons
              isRunning={state.isRunning}
              mode={state.mode}
              onPlay={() => dispatch({ type: 'PLAY' })}
              onPause={() => dispatch({ type: 'PAUSE' })}
              onReset={() => dispatch({ type: 'RESET' })}
              onSkip={handleSkip}
            />
          </main>

          <DailyStats
            sessions={state.todaySessions}
            yesterdaySessions={state.yesterdaySessions}
          />
        </>
      )}

      <nav className="bottom-nav">
        <button
          className={`bottom-nav__tab${!state.showSettings ? ' bottom-nav__tab--active' : ''}`}
          onClick={() => dispatch({ type: 'CLOSE_SETTINGS' })}
          aria-label="Timer"
        >
          <span className="material-symbols-outlined" aria-hidden="true">timer</span>
          <span>Timer</span>
        </button>
        <button
          className={`bottom-nav__tab${state.showSettings ? ' bottom-nav__tab--active' : ''}`}
          onClick={() => { if (!state.showSettings) dispatch({ type: 'TOGGLE_SETTINGS' }); }}
          aria-label="Settings"
        >
          <span className="material-symbols-outlined" aria-hidden="true">settings</span>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
