type Props = {
  isRunning: boolean;
  mode: 'focus' | 'break';
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
};

export default function ControlButtons({ isRunning, mode, onPlay, onPause, onReset, onSkip }: Props) {
  const playPauseClass = `play-pause-btn play-pause-btn--${mode}`;

  return (
    <div className="control-buttons">
      <button className="control-btn control-btn--secondary" onClick={onReset} aria-label="Reset">
        <span className="material-symbols-outlined" aria-hidden="true">replay</span>
      </button>
      <button
        className={`control-btn ${playPauseClass}`}
        onClick={isRunning ? onPause : onPlay}
        aria-label={isRunning ? 'Pause' : 'Play'}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {isRunning ? 'pause' : 'play_arrow'}
        </span>
      </button>
      <button
        className="control-btn control-btn--secondary"
        onClick={onSkip}
        aria-label={mode === 'focus' ? 'Skip to break' : 'Skip to focus'}
      >
        <span className="material-symbols-outlined" aria-hidden="true">skip_next</span>
      </button>
    </div>
  );
}
