import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UpdateBanner from './UpdateBanner';

describe('UpdateBanner', () => {
  it('renders the update message', () => {
    render(<UpdateBanner onInstall={() => {}} />);
    expect(screen.getByText('A new version is ready.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restart to update' })).toBeInTheDocument();
  });

  it('calls onInstall when the button is clicked', () => {
    const onInstall = vi.fn();
    render(<UpdateBanner onInstall={onInstall} />);
    fireEvent.click(screen.getByRole('button', { name: 'Restart to update' }));
    expect(onInstall).toHaveBeenCalledOnce();
  });
});
