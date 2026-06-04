type Props = {
  secondsRemaining: number;
  totalSeconds: number;
  mode: 'focus' | 'break';
};

export default function ProgressBar({ secondsRemaining, totalSeconds, mode }: Props) {
  const progress = totalSeconds > 0 ? 1 - secondsRemaining / totalSeconds : 0;
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg className={`progress-ring progress-ring--${mode}`} viewBox="0 0 168 168" aria-hidden="true">
      <circle className="progress-ring__track" cx="84" cy="84" r={radius} />
      <circle
        className="progress-ring__fill"
        cx="84"
        cy="84"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}
