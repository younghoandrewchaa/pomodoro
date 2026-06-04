import { useReducer, useEffect, useRef } from 'react';
import ModeLabel from './ModeLabel';
import TimerDisplay from './TimerDisplay';
import ProgressBar from './ProgressBar';
import ControlButtons from './ControlButtons';
import SkipLink from './SkipLink';
import Footer from './Footer';
import DailyStats from './DailyStats';
import SettingsPanel from './SettingsPanel';
import { reducer, initialState, toSeconds, type SessionRecord } from './timerReducer';

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
      <button onClick={() => window.electronAPI.notifyCompletion('focus')} style={{ marginTop: 8, fontSize: 11, opacity: 0.5 }}>
        test notification
      </button>
    </div>
  );
}
