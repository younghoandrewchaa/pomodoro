type Props = {
  mode: 'focus' | 'break';
  isRunning: boolean;
  secondsRemaining: number;
  totalSeconds: number;
};

export default function ModeLabel({ mode, isRunning, secondsRemaining, totalSeconds }: Props) {
  const hasStarted = secondsRemaining < totalSeconds;
  const label = isRunning
    ? mode === 'focus' ? 'GROWING' : 'RESTING'
    : hasStarted ? 'PAUSED' : mode === 'focus' ? 'READY' : 'BREAK';

  return (
    <div className={`mode-label mode-label--${mode}`}>
      {label}
    </div>
  );
}
