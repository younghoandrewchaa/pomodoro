type Props = { mode: 'focus' | 'break' };

export default function ModeLabel({ mode }: Props) {
  return (
    <div className={`mode-label mode-label--${mode}`}>
      {mode === 'focus' ? 'FOCUS' : 'BREAK'}
    </div>
  );
}
