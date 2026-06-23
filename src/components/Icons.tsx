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

export function PlusIcon({ className }: IconProps) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
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
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}

export function GiveIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function ReceiveIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 7 7 17" />
      <path d="M16 17H7V8" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
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
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
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
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
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
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 1.8-2.6 2.2-2.6 4" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function TapIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11V6a2 2 0 0 1 4 0v5" />
      <path d="M13 11V8.5a2 2 0 0 1 4 0V13" />
      <path d="M17 11.5a2 2 0 0 1 4 0V16a5 5 0 0 1-5 5h-2.3a4 4 0 0 1-2.9-1.2L5 14.5a1.8 1.8 0 0 1 2.6-2.5L9 13.3" />
    </svg>
  );
}

export function LogoMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={base(className)} role="img" aria-label="Coleção Copa 2026">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8d34d" />
          <stop offset="1" stopColor="#e0890a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#logo-bg)" />
      <rect x="1.2" y="1.2" width="45.6" height="45.6" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" />
      <g stroke="#0b2e6b" fill="none" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="24" cy="24" r="13" />
      </g>
      <polygon points="24,18.8 28.95,22.4 27.06,28.2 20.94,28.2 19.05,22.4" fill="#0b2e6b" />
      <g stroke="#0b2e6b" strokeWidth="2.1" strokeLinecap="round">
        <line x1="24" y1="18.8" x2="24" y2="11" />
        <line x1="28.95" y1="22.4" x2="36.36" y2="20" />
        <line x1="27.06" y1="28.2" x2="31.64" y2="34.52" />
        <line x1="20.94" y1="28.2" x2="16.36" y2="34.52" />
        <line x1="19.05" y1="22.4" x2="11.64" y2="20" />
      </g>
    </svg>
  );
}

export function BallIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.18" />
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.2 9.2 9.3l1.1 3.4h3.4l1.1-3.4z" fill="currentColor" />
      <path
        d="M12 7.2 9.2 9.3l1.1 3.4h3.4l1.1-3.4zM12 7.2V4M9.2 9.3 6.4 8M14.8 9.3 17.6 8M10.3 12.7 8.3 15.6M13.7 12.7l2 2.9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
