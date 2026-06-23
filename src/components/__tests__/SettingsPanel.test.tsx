import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SettingsPanel from '../SettingsPanel';

type PanelProps = React.ComponentProps<typeof SettingsPanel>;

function renderPanel(overrides: Partial<PanelProps> = {}) {
  const props: PanelProps = {
    focusMinutes: 20,
    breakMinutes: 5,
    onSetFocus: vi.fn(),
    onSetBreak: vi.fn(),
    onCheckForUpdates: vi.fn(),
    updateStatus: null,
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
