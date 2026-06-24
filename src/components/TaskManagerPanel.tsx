import { useState } from 'react';
import type { Task } from '../types';
import { formatFocus } from './focusStats';
import SproutMark from './SproutMark';

type Props = {
  tasks: Task[];
  activeTaskId: string | null;
  onBack: () => void;
  onSelect: (id: string) => void;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreateTask: (name: string) => Promise<void>;
};

export default function TaskManagerPanel({ tasks, activeTaskId, onBack, onSelect, onComplete, onDelete, onCreateTask }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputValue.trim();
    if (!name) return;
    setSubmitting(true);
    await onCreateTask(name);
    setInputValue('');
    setShowForm(false);
    setSubmitting(false);
  };

  return (
    <div className="task-manager">
      <div className="task-manager__header">
        <button className="task-manager__back" onClick={onBack} aria-label="Back">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <h2 className="task-manager__title">Tasks</h2>
      </div>

      {showForm ? (
        <form className="task-form" onSubmit={handleSubmit}>
          <input
            className="task-form__input"
            type="text"
            placeholder="Task name…"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            autoFocus
            disabled={submitting}
          />
          <button className="task-form__submit" type="submit" disabled={submitting || !inputValue.trim()}>
            Add
          </button>
          <button className="task-form__cancel" type="button" onClick={() => { setShowForm(false); setInputValue(''); }}>
            ✕
          </button>
        </form>
      ) : (
        <button className="add-task-btn" onClick={() => setShowForm(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Add New Task
        </button>
      )}

      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <p className="task-manager__empty">No tasks yet.</p>
      )}

      {activeTasks.length > 0 && (
        <div className="task-manager__section">
          <div className="task-manager__section-label">Active</div>
          {activeTasks.map(task => (
            <div
              key={task.id}
              className={`task-row${task.id === activeTaskId ? ' task-row--selected' : ''}`}
              onClick={() => onSelect(task.id)}
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
                <div className="task-row__stats">
                  <SproutMark />
                  <span>{task.totalPomodoros} · {formatFocus(task.totalSeconds)}</span>
                </div>
              </div>
              <div className="task-row__actions">
                <button
                  className="task-row__btn task-row__btn--done"
                  onClick={e => { e.stopPropagation(); onComplete(task.id); }}
                  title="Mark complete"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                </button>
                <button
                  className="task-row__btn task-row__btn--delete"
                  onClick={e => { e.stopPropagation(); onDelete(task.id); }}
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
                <div className="task-row__stats">
                  <SproutMark />
                  <span>{task.totalPomodoros} · {formatFocus(task.totalSeconds)}</span>
                </div>
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
