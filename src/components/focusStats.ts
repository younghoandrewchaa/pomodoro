import type { SessionRecord } from './timerReducer';

export const DAILY_GOAL = 8;

export interface DailyStatsView {
  completed: number;
  goal: number;
  progressPct: number;
  totalFocusLabel: string;
  deltaLabel: string | null;
}

export function formatFocus(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

function totalSeconds(sessions: SessionRecord[]): number {
  return sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
}

export function computeDailyStats(
  today: SessionRecord[],
  yesterday: SessionRecord[],
  goal: number = DAILY_GOAL,
): DailyStatsView {
  const completed = today.length;
  const progressPct = goal > 0 ? Math.min(100, Math.round((completed / goal) * 100)) : 0;

  const todayTotal = totalSeconds(today);
  const yesterdayTotal = totalSeconds(yesterday);

  let deltaLabel: string | null = null;
  if (yesterdayTotal > 0) {
    const pct = Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100);
    deltaLabel = `${pct >= 0 ? '+' : ''}${pct}% vs yesterday`;
  }

  return {
    completed,
    goal,
    progressPct,
    totalFocusLabel: formatFocus(todayTotal),
    deltaLabel,
  };
}
