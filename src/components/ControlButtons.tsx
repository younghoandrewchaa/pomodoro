type Props = {
  isRunning: boolean;
  mode: 'focus' | 'break';
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
};

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

export default function ControlButtons({ isRunning, mode, onPlay, onPause, onReset }: Props) {
  const playPauseClass = `play-pause-btn play-pause-btn--${isRunning ? (mode === 'focus' ? 'focus' : 'break') : 'idle'}`;

  return (
    <div className="control-buttons">
      <button className="reset-btn" onClick={onReset} aria-label="Reset">
        <ResetIcon />
      </button>
      <button
        className={playPauseClass}
        onClick={isRunning ? onPause : onPlay}
        aria-label={isRunning ? 'Pause' : 'Play'}
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="control-spacer" />
    </div>
  );
}
