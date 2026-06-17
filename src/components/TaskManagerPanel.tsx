import type { Task } from '../types';
import { formatFocus } from './focusStats';

type Props = {
  tasks: Task[];
  activeTaskId: string | null;
  onBack: () => void;
  onSelect: (id: string) => void;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function TaskManagerPanel({ tasks, activeTaskId, onBack, onSelect, onComplete, onDelete }: Props) {
  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="task-manager">
      <div className="task-manager__header">
        <button className="task-manager__back" onClick={onBack} aria-label="Back">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <h2 className="task-manager__title">Tasks</h2>
      </div>

      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <p className="task-manager__empty">No tasks yet. Add one from the timer view.</p>
      )}

      {activeTasks.length > 0 && (
        <div className="task-manager__section">
          <div className="task-manager__section-label">Active</div>
          {activeTasks.map(task => (
            <div
              key={task.id}
              className={`task-row${task.id === activeTaskId ? ' task-row--selected' : ''}`}
            >
              <button
                className="task-row__select"
                onClick={() => onSelect(task.id)}
                aria-label={task.id === activeTaskId ? 'Selected task' : 'Select task'}
              >
                {task.id === activeTaskId
                  ? <span className="material-symbols-outlined task-row__check">radio_button_checked</span>
                  : <span className="material-symbols-outlined task-row__check">radio_button_unchecked</span>
                }
              </button>
              <div className="task-row__info">
                <div className="task-row__name">{task.name}</div>
                <div className="task-row__stats">🍅 {task.totalPomodoros} · {formatFocus(task.totalSeconds)}</div>
              </div>
              <div className="task-row__actions">
                <button
                  className="task-row__btn task-row__btn--done"
                  onClick={() => onComplete(task.id)}
                  title="Mark complete"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                </button>
                <button
                  className="task-row__btn task-row__btn--delete"
                  onClick={() => onDelete(task.id)}
                  title="Delete"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-manager__section">
          <div className="task-manager__section-label">Completed</div>
          {completedTasks.map(task => (
            <div key={task.id} className="task-row task-row--completed">
              <span className="material-symbols-outlined task-row__done-icon">check_circle</span>
              <div className="task-row__info">
                <div className="task-row__name">{task.name}</div>
                <div className="task-row__stats">🍅 {task.totalPomodoros} · {formatFocus(task.totalSeconds)}</div>
              </div>
              <div className="task-row__actions">
                <button
                  className="task-row__btn task-row__btn--delete"
                  onClick={() => onDelete(task.id)}
                  title="Delete"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
