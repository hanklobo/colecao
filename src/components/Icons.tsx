// Lightweight inline SVG icon set — stroke-based, inherits currentColor.
// Replaces emoji throughout the UI for a more professional look.

interface IconProps {
  className?: string;
  filled?: boolean;
}

const base = (className = '') =>
  `inline-block flex-shrink-0 ${className}`;

export function AlbumIcon({ className, filled }: IconProps) {
  // Open album / sticker book with a sticker card peeking out
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)}>
      {filled ? (
        <>
          {/* Book body */}
          <path
            d="M5 3.5A2.5 2.5 0 0 1 7.5 1H19a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H7.5A2.5 2.5 0 0 1 5 17.5z"
            fill="currentColor"
          />
          {/* Spine / bottom shadow */}
          <path
            d="M5 17.5A2.5 2.5 0 0 1 7.5 15H20"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Sticker card tab */}
          <rect x="9" y="4" width="7" height="9" rx="1.5" fill="white" opacity="0.9" />
          {/* Card inner detail */}
          <rect x="10.5" y="5.5" width="4" height="3.5" rx="0.5" fill="currentColor" opacity="0.4" />
          <line x1="10.5" y1="10.5" x2="14.5" y2="10.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="10.5" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </>
      ) : (
        <>
          <path
            d="M5 3.5A2.5 2.5 0 0 1 7.5 1H19a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H7.5A2.5 2.5 0 0 1 5 17.5z"
            stroke="currentColor"
            strokeWidth={1.8}
          />
          <path
            d="M5 17.5A2.5 2.5 0 0 1 7.5 15H20"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          {/* Sticker card outline */}
          <rect x="9" y="4" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth={1.5} />
          <line x1="10.5" y1="10.5" x2="14.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="10.5" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function StatsIcon({ className, filled }: IconProps) {
  // Trophy with a progress fill inside
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)}>
      {filled ? (
        <>
          {/* Trophy cup body */}
          <path
            d="M8 3h8v7a4 4 0 0 1-8 0V3z"
            fill="currentColor"
          />
          {/* Handles */}
          <path d="M8 5H5a2 2 0 0 0 0 4h3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M16 5h3a2 2 0 0 1 0 4h-3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          {/* Stem */}
          <path d="M12 14v3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          {/* Base */}
          <path d="M8 20h8" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
          {/* Star inside cup */}
          <path d="M12 5.5l.6 1.8h1.9l-1.5 1.1.6 1.8L12 9.1l-1.6 1.1.6-1.8-1.5-1.1h1.9z" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          <path
            d="M8 3h8v7a4 4 0 0 1-8 0V3z"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <path d="M8 5H5a2 2 0 0 0 0 4h3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M16 5h3a2 2 0 0 1 0 4h-3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M12 14v3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M8 20h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          <path d="M12 5.5l.6 1.8h1.9l-1.5 1.1.6 1.8L12 9.1l-1.6 1.1.6-1.8-1.5-1.1h1.9z" stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function TradeIcon({ className, filled }: IconProps) {
  // Two sticker cards swapping hands
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)}>
      {filled ? (
        <>
          {/* Left card going right-up */}
          <rect x="2" y="9" width="8" height="10" rx="1.5" fill="currentColor" transform="rotate(-12 6 14)" />
          {/* Right card going left-up */}
          <rect x="14" y="5" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.6" transform="rotate(12 18 10)" />
          {/* Swap arrows */}
          <path d="M9 6l3-3 3 3" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 18l-3 3-3-3" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <rect x="2" y="9" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth={1.7} transform="rotate(-12 6 14)" />
          <rect x="14" y="5" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth={1.7} transform="rotate(12 18 10)" />
          <path d="M9 6l3-3 3 3" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 18l-3 3-3-3" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
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
    <img
      src="/logo-packs.png"
      alt="Coleção Copa 2026"
      width={56}
      height={56}
      className={`${base(className)} object-cover`}
    />
  );
}

export function ShopIcon({ className, filled }: IconProps) {
  // Shopping bag with a price tag
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)}>
      {filled ? (
        <>
          {/* Bag body */}
          <path
            d="M4 9h16l-1.5 11a1 1 0 0 1-1 .9H6.5a1 1 0 0 1-1-.9z"
            fill="currentColor"
          />
          {/* Handles */}
          <path
            d="M9 9V7a3 3 0 0 1 6 0v2"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Price tag on bag */}
          <circle cx="12" cy="15" r="2" fill="white" opacity="0.9" />
          <line x1="12" y1="13" x2="12" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        </>
      ) : (
        <>
          <path
            d="M4 9h16l-1.5 11a1 1 0 0 1-1 .9H6.5a1 1 0 0 1-1-.9z"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <path
            d="M9 9V7a3 3 0 0 1 6 0v2"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <circle cx="12" cy="15" r="1.8" stroke="currentColor" strokeWidth={1.3} />
          <line x1="12" y1="13.2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
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
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
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
