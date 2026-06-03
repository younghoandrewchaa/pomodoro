type Props = {
  secondsRemaining: number;
  totalSeconds: number;
  mode: 'focus' | 'break';
};

export default function ProgressBar({ secondsRemaining, totalSeconds, mode }: Props) {
  const progress = totalSeconds > 0 ? 1 - secondsRemaining / totalSeconds : 0;
  return (
    <div className="progress-track">
      <div
        className={`progress-fill progress-fill--${mode}`}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
