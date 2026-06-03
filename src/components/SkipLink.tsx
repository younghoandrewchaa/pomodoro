type Props = {
  mode: 'focus' | 'break';
  isRunning: boolean;
  onSkipToBreak: () => void;
  onSkipToFocus: () => void;
};

export default function SkipLink({ mode, isRunning, onSkipToBreak, onSkipToFocus }: Props) {
  if (isRunning) return null;

  if (mode === 'focus') {
    return (
      <div className="skip-link-row">
        <button className="skip-link skip-link--break" onClick={onSkipToBreak}>
          Skip to Break
        </button>
      </div>
    );
  }

  return (
    <div className="skip-link-row">
      <button className="skip-link skip-link--focus" onClick={onSkipToFocus}>
        Skip Break
      </button>
    </div>
  );
}
