import { useReducer, useEffect, useRef, useState } from 'react';
import TimerDisplay from './TimerDisplay';
import ProgressBar from './ProgressBar';
import ControlButtons from './ControlButtons';
import DailyStats from './DailyStats';
import SettingsPanel from './SettingsPanel';
import ModeLabel from './ModeLabel';
import TaskSection from './TaskSection';
import TaskManagerPanel from './TaskManagerPanel';
import UpdateBanner from './UpdateBanner';
import { reducer, initialState, toSeconds } from './timerReducer';
import type { UpdateCheckStatus } from '../autoUpdate';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateCheckStatus | null>(null);

  useEffect(() => {
    window.electronAPI.onUpdateDownloaded(() => setUpdateReady(true));
  }, []);

  useEffect(() => window.electronAPI.onUpdateCheckResult(setUpdateStatus), []);

  // Auto-dismiss the update-check status after 5 seconds
  useEffect(() => {
    if (!updateStatus) return;
    const timer = setTimeout(() => setUpdateStatus(null), 5000);
    return () => clearTimeout(timer);
  }, [updateStatus]);

  useEffect(() => window.electronAPI.onDailyStatsRefresh(async () => {
    const [sessions, yesterdaySessions] = await Promise.all([
      window.electronAPI.getTodaySessions(),
      window.electronAPI.getYesterdaySessions(),
    ]);
    dispatch({ type: 'DAY_RESET' });
    dispatch({ type: 'DAILY_SESSIONS_UPDATED', sessions, yesterdaySessions });
  }), []);

  // Load settings, sessions, and tasks on mount
  useEffect(() => {
    (async () => {
      const [settings, sessions, yesterdaySessions, tasks] = await Promise.all([
        window.electronAPI.getSettings(),
        window.electronAPI.getTodaySessions(),
        window.electronAPI.getYesterdaySessions(),
        window.electronAPI.getAllTasks(),
      ]);
      dispatch({
        type: 'INIT',
        focusMinutes: settings.focusMinutes,
        breakMinutes: settings.breakMinutes,
        lastOpenedDate: settings.lastOpenedDate,
        sessions,
        yesterdaySessions,
        tasks,
        activeTaskId: settings.activeTaskId,
      });
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

  const totalSeconds = state.mode === 'focus'
    ? toSeconds(state.focusMinutes)
    : toSeconds(state.breakMinutes);

  // Persist active task selection across restarts
  useEffect(() => {
    if (!state.initialized) return;
    window.electronAPI.setSettings({ activeTaskId: state.activeTaskId });
  }, [state.activeTaskId, state.initialized]);

  // Sync tray icon
  useEffect(() => {
    if (!state.initialized) return;
    window.electronAPI.updateTimerState({
      mode: state.mode,
      isRunning: state.isRunning,
      secondsRemaining: state.secondsRemaining,
      totalSeconds,
    });
  }, [state.mode, state.isRunning, state.secondsRemaining, totalSeconds, state.initialized]);

  // Handle completion side effects
  useEffect(() => {
    if (!state.pendingCompletion) return;
    const { mode, record } = state.pendingCompletion;
    const activeTaskId = state.activeTaskId;
    window.electronAPI.notifyCompletion(mode);
    if (record) {
      (async () => {
        await window.electronAPI.recordSession(record);
        if (activeTaskId) {
          await window.electronAPI.recordTaskSession(activeTaskId, record.durationSeconds);
        }
        const [sessions, tasks] = await Promise.all([
          window.electronAPI.getTodaySessions(),
          window.electronAPI.getAllTasks(),
        ]);
        dispatch({ type: 'SESSIONS_UPDATED', sessions });
        dispatch({ type: 'TASKS_UPDATED', tasks });
      })();
    }
    dispatch({ type: 'CLEAR_PENDING_COMPLETION' });
  }, [state.pendingCompletion]);

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

  const handleCreateTask = async (name: string) => {
    const task = await window.electronAPI.createTask(name);
    const tasks = await window.electronAPI.getAllTasks();
    dispatch({ type: 'TASKS_UPDATED', tasks });
    dispatch({ type: 'SET_ACTIVE_TASK', taskId: task.id });
  };

  const handleCompleteTask = async (id: string) => {
    await window.electronAPI.updateTask(id, { status: 'completed', completedAt: new Date().toISOString() });
    const tasks = await window.electronAPI.getAllTasks();
    dispatch({ type: 'TASKS_UPDATED', tasks });
    if (state.activeTaskId === id) dispatch({ type: 'SET_ACTIVE_TASK', taskId: null });
  };

  const handleDeleteTask = async (id: string) => {
    await window.electronAPI.deleteTask(id);
    const tasks = await window.electronAPI.getAllTasks();
    dispatch({ type: 'TASKS_UPDATED', tasks });
    if (state.activeTaskId === id) dispatch({ type: 'SET_ACTIVE_TASK', taskId: null });
  };

  if (!state.initialized) {
    return <div className="app loading" />;
  }

  return (
    <div className="app">
      {updateReady && (
        <UpdateBanner onInstall={() => window.electronAPI.installUpdate()} />
      )}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">Sprout</div>
          <div className="sidebar-brand-sub">Grow your focus</div>
        </div>
        <div className="sidebar-nav">
          <button
            className={`sidebar-nav__item${state.view === 'timer' ? ' sidebar-nav__item--active' : ''}`}
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'timer' })}
          >
            <span className="material-symbols-outlined" aria-hidden="true">timer</span>
            Timer
          </button>
          <button
            className={`sidebar-nav__item${state.view === 'settings' ? ' sidebar-nav__item--active' : ''}`}
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'settings' })}
          >
            <span className="material-symbols-outlined" aria-hidden="true">settings</span>
            Settings
          </button>
        </div>
      </nav>

      <div className="main-content">
        {state.view === 'settings' ? (
          <SettingsPanel
            focusMinutes={state.focusMinutes}
            breakMinutes={state.breakMinutes}
            onSetFocus={handleSetFocusDuration}
            onSetBreak={handleSetBreakDuration}
            onCheckForUpdates={() => window.electronAPI.checkForUpdates()}
            updateStatus={updateStatus}
            onQuit={() => window.electronAPI.quit()}
          />
        ) : state.view === 'tasks' ? (
          <TaskManagerPanel
            tasks={state.tasks}
            activeTaskId={state.activeTaskId}
            onBack={() => dispatch({ type: 'SET_VIEW', view: 'timer' })}
            onSelect={(id) => dispatch({ type: 'SET_ACTIVE_TASK', taskId: id })}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
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
                  <ModeLabel
                    mode={state.mode}
                    isRunning={state.isRunning}
                    secondsRemaining={state.secondsRemaining}
                    totalSeconds={totalSeconds}
                  />
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

            <TaskSection
              tasks={state.tasks}
              activeTaskId={state.activeTaskId}
              onOpenManager={() => dispatch({ type: 'SET_VIEW', view: 'tasks' })}
              onSelectTask={(id) => dispatch({ type: 'SET_ACTIVE_TASK', taskId: id })}
              onCreateTask={handleCreateTask}
            />
          </>
        )}
      </div>
    </div>
  );
}
