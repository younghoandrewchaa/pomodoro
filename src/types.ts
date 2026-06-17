export interface Task {
  id: string;
  name: string;
  createdAt: string;
  status: 'active' | 'completed';
  completedAt?: string;
  totalSeconds: number;
  totalPomodoros: number;
}
