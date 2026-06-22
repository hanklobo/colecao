// Lightweight inline SVG icon set — stroke-based, inherits currentColor.
// Replaces emoji throughout the UI for a more professional look.

interface IconProps {
  className?: string;
  filled?: boolean;
}

const base = (className = '') =>
  `inline-block flex-shrink-0 ${className}`;

export function AlbumIcon({ className, filled }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={filled ? 2.2 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5z" />
      <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
      <path d="M9 3v9" />
    </svg>
  );
}

export function StatsIcon({ className, filled }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={filled ? 2.4 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 20V11" />
      <path d="M12 20V4" />
      <path d="M19 20v-6" />
    </svg>
  );
}

export function TradeIcon({ className, filled }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={filled ? 2.2 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4 3 8l4 4" />
      <path d="M3 8h14" />
      <path d="m17 20 4-4-4-4" />
      <path d="M21 16H7" />
    </svg>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5h18l-7 8v6l-4-2v-4z" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </svg>
  );
}

export function BallIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.18" />
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.2 9.2 9.3l1.1 3.4h3.4l1.1-3.4z"
        fill="currentColor"
      />
      <path
        d="M12 7.2 9.2 9.3l1.1 3.4h3.4l1.1-3.4zM12 7.2V4M9.2 9.3 6.4 8M14.8 9.3 17.6 8M10.3 12.7 8.3 15.6M13.7 12.7l2 2.9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
