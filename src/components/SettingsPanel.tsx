const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

type Props = {
  focusMinutes: number;
  breakMinutes: number;
  onSetFocus: (minutes: number) => void;
  onSetBreak: (minutes: number) => void;
  onQuit: () => void;
};

export default function SettingsPanel({ focusMinutes, breakMinutes, onSetFocus, onSetBreak, onQuit }: Props) {
  return (
    <div className="settings-panel">
      <h2 className="settings-title">Settings</h2>

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

      <div className="settings-spacer" />

      <button className="quit-btn" onClick={onQuit}>
        Quit Sprout
      </button>
    </div>
  );
}
