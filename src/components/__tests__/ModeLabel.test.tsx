import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ModeLabel from '../ModeLabel';

describe('ModeLabel', () => {
  it('shows READY before a focus session starts', () => {
    render(
      <ModeLabel
        mode="focus"
        isRunning={false}
        secondsRemaining={1500}
        totalSeconds={1500}
      />,
    );

    expect(screen.getByText('READY')).toBeInTheDocument();
  });

  it('shows GROWING while a focus session runs', () => {
    render(
      <ModeLabel
        mode="focus"
        isRunning
        secondsRemaining={1499}
        totalSeconds={1500}
      />,
    );

    expect(screen.getByText('GROWING')).toBeInTheDocument();
  });

  it('shows PAUSED when an active focus session is paused', () => {
    render(
      <ModeLabel
        mode="focus"
        isRunning={false}
        secondsRemaining={1200}
        totalSeconds={1500}
      />,
    );

    expect(screen.getByText('PAUSED')).toBeInTheDocument();
  });

  it('distinguishes ready and running break sessions', () => {
    const { rerender } = render(
      <ModeLabel
        mode="break"
        isRunning={false}
        secondsRemaining={300}
        totalSeconds={300}
      />,
    );
    expect(screen.getByText('BREAK')).toBeInTheDocument();

    rerender(
      <ModeLabel
        mode="break"
        isRunning
        secondsRemaining={299}
        totalSeconds={300}
      />,
    );
    expect(screen.getByText('RESTING')).toBeInTheDocument();
  });
});
