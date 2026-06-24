import { useEffect, useRef, useState } from 'react';
import type { Task } from '../types';
import { formatFocus } from './focusStats';
import SproutMark from './SproutMark';

type Props = {
  tasks: Task[];
  activeTaskId: string | null;
  onOpenManager: () => void;
  onSelectTask: (id: string) => void;
  onCreateTask: (name: string) => Promise<void>;
};

export default function TaskSection({ tasks, activeTaskId, onOpenManager, onSelectTask, onCreateTask }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeTask = tasks.find(t => t.id === activeTaskId) ?? null;
  const otherTasks = tasks.filter(t => t.status === 'active' && t.id !== activeTaskId);

  useEffect(() => {
    if (!showSwitcher) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showSwitcher]);

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

      <div className="task-card-wrapper" ref={wrapperRef}>
        <div className="task-card" onClick={() => setShowSwitcher(v => !v)}>
          <div className="task-card__icon">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span>
          </div>
          {activeTask ? (
            <div className="task-card__body">
              <div className="task-card__name">{activeTask.name}</div>
              <div className="task-card__meta">
                <SproutMark />
                <span>{activeTask.totalPomodoros}</span>
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
          <span className="material-symbols-outlined task-card__chevron">
            {showSwitcher ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        {showSwitcher && (
          <div className="task-switcher">
            {otherTasks.length === 0 ? (
              <p className="task-switcher__empty">No other tasks</p>
            ) : (
              otherTasks.map(task => (
                <button
                  key={task.id}
                  className="task-switcher__item"
                  onClick={() => { onSelectTask(task.id); setShowSwitcher(false); }}
                >
                  <div className="task-card__icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span>
                  </div>
                  <div className="task-card__body">
                    <div className="task-card__name">{task.name}</div>
                    <div className="task-card__meta">
                      <SproutMark />
                      <span>{task.totalPomodoros}</span>
                      <span className="task-card__meta-sep">·</span>
                      <span>{formatFocus(task.totalSeconds)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
            <button
              className="task-switcher__manage"
              onClick={() => { onOpenManager(); setShowSwitcher(false); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_full</span>
              Manage
            </button>
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
