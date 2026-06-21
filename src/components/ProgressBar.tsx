type Props = {
  secondsRemaining: number;
  totalSeconds: number;
  mode: 'focus' | 'break';
};

export default function ProgressBar({ secondsRemaining, totalSeconds, mode }: Props) {
  const progress = totalSeconds > 0 ? 1 - secondsRemaining / totalSeconds : 0;
  const radius = 138;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg className={`progress-ring progress-ring--${mode}`} viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <linearGradient id="sprout-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6fbf7e" />
          <stop offset="100%" stopColor="#3e8b52" />
        </linearGradient>
      </defs>
      <circle className="progress-ring__track" cx="150" cy="150" r={radius} />
      <circle
        className="progress-ring__fill"
        cx="150"
        cy="150"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}
