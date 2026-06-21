export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function previousLocalDate(date: Date): Date {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return previous;
}

export function isTimestampOnLocalDate(timestamp: string, date: Date): boolean {
  const parsed = new Date(timestamp);
  return !Number.isNaN(parsed.getTime()) && localDateKey(parsed) === localDateKey(date);
}

export function isFirstOpenToday(lastOpenedDate: string, now: Date): boolean {
  return lastOpenedDate !== localDateKey(now);
}
