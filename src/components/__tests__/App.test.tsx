import { render, screen, waitFor } from '@testing-library/react';
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
  quit: vi.fn(),
};

describe('App redesign shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    electronAPI.getTodaySessions.mockResolvedValue([]);
    electronAPI.getYesterdaySessions.mockResolvedValue([]);
    window.electronAPI = electronAPI;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the Precision Focus shell around the timer', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    });

    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.timer-ring-shell')).toBeInTheDocument();
    expect(container.querySelector('.progress-ring')).toBeInTheDocument();
    expect(container.querySelector('.bottom-nav')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toHaveClass('bottom-nav__tab');
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

  it('switches to the settings view via the bottom nav', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    });

    screen.getByLabelText('Settings').click();

    await waitFor(() => {
      expect(screen.getByText('Focus Duration')).toBeInTheDocument();
    });
    expect(container.querySelector('.timer-ring-shell')).not.toBeInTheDocument();
    expect(screen.getByText('Quit Pomodoro')).toBeInTheDocument();
  });
});
