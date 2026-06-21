type Props = {
  className?: string;
};

export default function SproutMark({ className = '' }: Props) {
  return (
    <svg
      className={`sprout-mark${className ? ` ${className}` : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="8.4" cy="11" rx="4.2" ry="2.6" transform="rotate(-38 8.4 11)" fill="#7dbe86" />
      <ellipse cx="15.6" cy="8.8" rx="4.6" ry="2.8" transform="rotate(34 15.6 8.8)" fill="currentColor" />
    </svg>
  );
}
