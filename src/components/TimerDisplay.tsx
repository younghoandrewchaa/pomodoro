type Props = { secondsRemaining: number };

export default function TimerDisplay({ secondsRemaining: s }: Props) {
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return <div className="timer-display">{mm}:{ss}</div>;
}
