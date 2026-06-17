export default function TaskSection() {
  return (
    <section className="task-section">
      <div className="task-section__header">
        <span className="task-section__title">Current Task</span>
        <button className="task-section__manage">Manage</button>
      </div>
      <div className="task-card">
        <div className="task-card__icon">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span>
        </div>
        <div>
          <div className="task-card__name">No task selected</div>
          <div className="task-card__tags">
            <span className="task-card__tag">—</span>
          </div>
        </div>
      </div>
      <button className="add-task-btn">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
        Add New Task
      </button>
    </section>
  );
}
