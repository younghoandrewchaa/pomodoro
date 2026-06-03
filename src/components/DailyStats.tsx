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
  return (
    <div className="daily-stats">
      <span className="daily-stats__left">
        🍅 {sessions.length} session{sessions.length !== 1 ? 's' : ''}
      </span>
      <span className="daily-stats__right">
        {formatTime(totalSeconds)} today
      </span>
    </div>
  );
}
