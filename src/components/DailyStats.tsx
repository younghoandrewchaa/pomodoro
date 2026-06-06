import { computeDailyStats } from './focusStats';
import type { SessionRecord } from './timerReducer';

type Props = {
  sessions: SessionRecord[];
  yesterdaySessions: SessionRecord[];
};

export default function DailyStats({ sessions, yesterdaySessions }: Props) {
  const stats = computeDailyStats(sessions, yesterdaySessions);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card__header stat-card__header--focus">
          <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
          <span className="stat-card__label">Sessions Today</span>
        </div>
        <div className="stat-card__value">{stats.completed}/{stats.goal}</div>
        <div
          className="stat-progress"
          role="progressbar"
          aria-valuenow={stats.completed}
          aria-valuemin={0}
          aria-valuemax={stats.goal}
          aria-label="Sessions completed today"
        >
          <div className="stat-progress__fill" style={{ width: `${stats.progressPct}%` }} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__header stat-card__header--break">
          <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
          <span className="stat-card__label">Total Focus</span>
        </div>
        <div className="stat-card__value">{stats.totalFocusLabel}</div>
        {stats.deltaLabel && <p className="stat-card__delta">{stats.deltaLabel}</p>}
      </div>
    </div>
  );
}
