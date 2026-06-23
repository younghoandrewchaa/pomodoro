import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SettingsPanel from '../SettingsPanel';

function renderPanel(overrides: Partial<React.ComponentProps<typeof SettingsPanel>> = {}) {
  const props = {
    focusMinutes: 20,
    breakMinutes: 5,
    onSetFocus: vi.fn(),
    onSetBreak: vi.fn(),
    onCheckForUpdates: vi.fn(),
    onQuit: vi.fn(),
    ...overrides,
  };
  render(<SettingsPanel {...props} />);
  return props;
}

describe('SettingsPanel – Check for Updates', () => {
  it('invokes onCheckForUpdates when the button is clicked', () => {
    const onCheckForUpdates = vi.fn();
    renderPanel({ onCheckForUpdates });

    fireEvent.click(screen.getByRole('button', { name: /check for updates/i }));

    expect(onCheckForUpdates).toHaveBeenCalledOnce();
  });
});
