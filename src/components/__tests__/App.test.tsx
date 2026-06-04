import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const electronAPI = {
  updateTimerState: vi.fn(),
  notifyCompletion: vi.fn(),
  recordSession: vi.fn().mockResolvedValue(undefined),
  getTodaySessions: vi.fn().mockResolvedValue([]),
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
    window.electronAPI = electronAPI;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the Chronos popover shell around the timer', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    });

    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.timer-ring-shell')).toBeInTheDocument();
    expect(container.querySelector('.progress-ring')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toHaveClass('app-menu-btn');
    expect(screen.queryByText('test notification')).not.toBeInTheDocument();
  });

  it('shows daily focus stats in the popover footer', async () => {
    electronAPI.getTodaySessions.mockResolvedValue([
      { startedAt: '2026-06-04T09:00:00.000Z', durationSeconds: 1500 },
      { startedAt: '2026-06-04T10:00:00.000Z', durationSeconds: 1500 },
    ]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('2 sessions / 50 min')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('2 completed sessions')).toBeInTheDocument();
  });
});
