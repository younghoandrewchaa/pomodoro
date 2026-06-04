type Session = { startedAt: string; durationSeconds: number };

type Props = { sessions: Session[] };

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

export default function DailyStats({ sessions }: Props) {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const completedDots = Math.min(sessions.length, 4);

  return (
    <div className="daily-stats">
      <div className="session-dots" aria-label={`${sessions.length} completed sessions`}>
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={`session-dot${index < completedDots ? ' session-dot--complete' : ''}`}
          />
        ))}
      </div>
      <span className="daily-stats__summary">
        {sessions.length} session{sessions.length !== 1 ? 's' : ''} / {formatTime(totalSeconds)}
      </span>
    </div>
  );
}
