import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const electronAPI = {
  updateTimerState: vi.fn(),
  notifyCompletion: vi.fn(),
  recordSession: vi.fn().mockResolvedValue(undefined),
  getTodaySessions: vi.fn().mockResolvedValue([]),
  getYesterdaySessions: vi.fn().mockResolvedValue([]),
  getSettings: vi.fn().mockResolvedValue({
    focusMinutes: 25,
    breakMinutes: 5,
    lastOpenedDate: new Date().toISOString().slice(0, 10),
  }),
  setSettings: vi.fn().mockResolvedValue(undefined),
  getAllTasks: vi.fn().mockResolvedValue([]),
  createTask: vi.fn().mockResolvedValue({ id: 'task-1', name: 'Test task', createdAt: new Date().toISOString(), status: 'active', totalSeconds: 0, totalPomodoros: 0 }),
  updateTask: vi.fn().mockResolvedValue(null),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  recordTaskSession: vi.fn().mockResolvedValue(undefined),
  quit: vi.fn(),
  onUpdateDownloaded: vi.fn(),
  installUpdate: vi.fn(),
};

describe('App shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    electronAPI.getTodaySessions.mockResolvedValue([]);
    electronAPI.getYesterdaySessions.mockResolvedValue([]);
    electronAPI.getAllTasks.mockResolvedValue([]);
    window.electronAPI = electronAPI;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the sidebar layout with timer and brand', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    });

    expect(container.querySelector('.sidebar')).toBeInTheDocument();
    expect(container.querySelector('.timer-ring-shell')).toBeInTheDocument();
    expect(container.querySelector('.progress-ring')).toBeInTheDocument();
    expect(container.querySelector('.sidebar-nav')).toBeInTheDocument();
  });

  it('syncs remaining and total timer seconds to the tray icon', async () => {
    render(<App />);

    await waitFor(() => {
      expect(electronAPI.updateTimerState).toHaveBeenCalledWith({
        mode: 'focus',
        isRunning: false,
        secondsRemaining: 1500,
        totalSeconds: 1500,
      });
    });
  });

  it('shows daily focus stats in the bento cards with a yesterday delta', async () => {
    electronAPI.getTodaySessions.mockResolvedValue([
      { startedAt: '2026-06-06T09:00:00.000Z', durationSeconds: 6000 }, // 100 min
    ]);
    electronAPI.getYesterdaySessions.mockResolvedValue([
      { startedAt: '2026-06-05T09:00:00.000Z', durationSeconds: 5220 }, // 87 min
    ]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Sessions Today')).toBeInTheDocument();
    });
    expect(screen.getByText('1/8')).toBeInTheDocument();
    expect(screen.getByText('1h 40m')).toBeInTheDocument();
    expect(screen.getByText('+15% vs yesterday')).toBeInTheDocument();
  });

  it('restores the active task from settings on startup', async () => {
    const task = {
      id: 'task-abc',
      name: 'Restored Task',
      createdAt: new Date().toISOString(),
      status: 'active' as const,
      totalSeconds: 300,
      totalPomodoros: 1,
    };
    electronAPI.getSettings.mockResolvedValue({
      focusMinutes: 25,
      breakMinutes: 5,
      lastOpenedDate: new Date().toISOString().slice(0, 10),
      activeTaskId: task.id,
    });
    electronAPI.getAllTasks.mockResolvedValue([task]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Restored Task')).toBeInTheDocument();
    });
  });

  it('persists activeTaskId to settings when a task is created and made active', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    screen.getByText('Add New Task').click();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Task name…')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Task name…'), { target: { value: 'My Task' } });
    fireEvent.submit(screen.getByPlaceholderText('Task name…').closest('form')!);

    await waitFor(() => {
      expect(electronAPI.setSettings).toHaveBeenCalledWith(
        expect.objectContaining({ activeTaskId: 'task-1' }),
      );
    });
  });

  it('switches to the settings view via the sidebar nav', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    });

    screen.getByText('Settings').click();

    await waitFor(() => {
      expect(screen.getByText('Focus Duration')).toBeInTheDocument();
    });
    expect(container.querySelector('.timer-ring-shell')).not.toBeInTheDocument();
    expect(screen.getByText('Quit Pomodoro')).toBeInTheDocument();
  });
});
