const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

type Props = {
  focusMinutes: number;
  breakMinutes: number;
  onSetFocus: (minutes: number) => void;
  onSetBreak: (minutes: number) => void;
  onClose: () => void;
};

export default function SettingsPanel({ focusMinutes, breakMinutes, onSetFocus, onSetBreak, onClose }: Props) {
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <button className="settings-back" onClick={onClose} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="settings-title">Settings</span>
      </div>

      <div className="settings-body">
        <div className="settings-row">
          <label className="settings-label">Focus Duration</label>
          <select
            className="settings-select"
            value={focusMinutes}
            onChange={e => onSetFocus(Number(e.target.value))}
          >
            {DURATION_OPTIONS.map(m => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>

        <div className="settings-row">
          <label className="settings-label">Break Duration</label>
          <select
            className="settings-select"
            value={breakMinutes}
            onChange={e => onSetBreak(Number(e.target.value))}
          >
            {DURATION_OPTIONS.map(m => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>

        <p className="settings-hint">
          Changing a duration resets that timer.
        </p>
      </div>
    </div>
  );
}
