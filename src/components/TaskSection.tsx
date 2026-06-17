import { useState } from 'react';
import type { Task } from '../types';
import { formatFocus } from './focusStats';

type Props = {
  tasks: Task[];
  activeTaskId: string | null;
  onOpenManager: () => void;
  onSelectTask: (id: string) => void;
  onCreateTask: (name: string) => Promise<void>;
};

export default function TaskSection({ tasks, activeTaskId, onOpenManager, onCreateTask }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeTask = tasks.find(t => t.id === activeTaskId) ?? null;

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
    <section className="task-section">
      <div className="task-section__header">
        <span className="task-section__title">Current Task</span>
        <button className="task-section__manage" onClick={onOpenManager}>Manage</button>
      </div>

      <div className="task-card">
        <div className="task-card__icon">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span>
        </div>
        {activeTask ? (
          <div className="task-card__body">
            <div className="task-card__name">{activeTask.name}</div>
            <div className="task-card__meta">
              <span>🍅 {activeTask.totalPomodoros}</span>
              <span className="task-card__meta-sep">·</span>
              <span>{formatFocus(activeTask.totalSeconds)}</span>
            </div>
          </div>
        ) : (
          <div className="task-card__body">
            <div className="task-card__name task-card__name--empty">No task selected</div>
            <div className="task-card__tags">
              <span className="task-card__tag">—</span>
            </div>
          </div>
        )}
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
    </section>
  );
}
