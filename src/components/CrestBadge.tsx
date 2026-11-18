import { getMpColorById, getMpCrestById } from '../game/multiplayerTypes';

interface CrestBadgeProps {
  crestId: string;
  colorId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  xs: 20,
  sm: 26,
  md: 34,
  lg: 44,
};

function renderCrestGlyph(crestId: string) {
  switch (crestId) {
    case 'zeus_bolt':
      return (
        <path
          d="M17.5 6.5L11.5 16H15.5L13.5 25.5L21 15H16.8L17.5 6.5Z"
          fill="#fef08a"
          stroke="#0b0f19"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      );
    case 'poseidon_trident':
      return (
        <path
          d="M16 6V25M11.5 8V13.5C11.5 15.5 13.5 17 16 17C18.5 17 20.5 15.5 20.5 13.5V8M16 6L14.5 9H17.5L16 6ZM11.5 7.5L10.3 10H12.7L11.5 7.5ZM20.5 7.5L19.3 10H21.7L20.5 7.5Z"
          stroke="#e0f2fe"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    case 'hades_helm':
      return (
        <path
          d="M10 17C10 11.5 12.6 8 16 8C19.4 8 22 11.5 22 17V23.5H19V18H13V23.5H10V17ZM13.5 14H15.2M16.8 14H18.5"
          stroke="#f8fafc"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(15,23,42,0.55)"
        />
      );
    case 'athena_owl':
      return (
        <g stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M10.5 11L13 13H19L21.5 11L20.5 18.5C20 22 18 24 16 24.5C14 24 12 22 11.5 18.5L10.5 11Z" fill="rgba(15,23,42,0.35)" />
          <circle cx="13.8" cy="15.5" r="1.2" fill="#fef08a" />
          <circle cx="18.2" cy="15.5" r="1.2" fill="#fef08a" />
          <path d="M15.2 18L16 19.5L16.8 18" />
        </g>
      );
    case 'ra_sun':
      return (
        <g stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="16" cy="16" r="4.5" fill="#fde047" />
          <path d="M16 7.5V9.5M16 22.5V24.5M7.5 16H9.5M22.5 16H24.5M10 10L11.5 11.5M20.5 20.5L22 22M22 10L20.5 11.5M11.5 20.5L10 22" />
        </g>
      );
    case 'isis_lotus':
      return (
        <path
          d="M16 8C14 12 14 16 16 19C18 16 18 12 16 8ZM16 19C13 18.5 10.5 16 9.5 12.5C12.5 13 14.8 15.2 16 19ZM16 19C19 18.5 21.5 16 22.5 12.5C19.5 13 17.2 15.2 16 19ZM11.5 22.5H20.5"
          stroke="#fef3c7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(254,240,138,0.28)"
        />
      );
    case 'set_jackal':
      return (
        <path
          d="M12 8L13.5 13.5H18.5L20 8L21 15L18.5 24H13.5L11 15L12 8ZM14 17H15.2M16.8 17H18"
          stroke="#fde68a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(15,23,42,0.45)"
        />
      );
    case 'odin_raven':
      return (
        <path
          d="M9.5 12.5C12.5 10 15.5 11.5 16 14C16.5 11.5 19.5 10 22.5 12.5C20.5 16 18 17.5 16 24.5C14 17.5 11.5 16 9.5 12.5Z"
          fill="#f1f5f9"
          stroke="#0f172a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      );
    case 'thor_hammer':
      return (
        <path
          d="M10.5 10.5H21.5V16H17.5V24.5H14.5V16H10.5V10.5Z"
          fill="#e2e8f0"
          stroke="#0f172a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      );
    case 'loki_serpent':
      return (
        <path
          d="M19.5 9.5C15 8 11.5 11 13.5 14C15.5 17 20.5 16.5 19 20.5C17.8 23.5 12.5 23.5 10.5 21.5"
          stroke="#ecfccb"
          strokeWidth="2.1"
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'kronos_hourglass':
      return (
        <path
          d="M11 9H21L16 16L21 23H11L16 16L11 9Z"
          fill="rgba(254,240,138,0.28)"
          stroke="#fef08a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    case 'gaia_tree':
    default:
      return (
        <g stroke="#dcfce7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 15V24.5M13.5 24.5H18.5" />
          <circle cx="16" cy="12.5" r="4.5" fill="rgba(187,247,208,0.32)" />
        </g>
      );
  }
}

export function CrestBadge({ crestId, colorId, size = 'md', className = '' }: CrestBadgeProps) {
  const px = SIZE_MAP[size];
  const color = getMpColorById(colorId);
  const crest = getMpCrestById(crestId);

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      aria-label={`${crest.name} (${color.name})`}
      className={`shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] ${className}`}
    >
      <path
        d="M5 4.5H27V15.5C27 22 22.2 26.8 16 29.2C9.8 26.8 5 22 5 15.5V4.5Z"
        fill={color.css}
        stroke="#e6c365"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 6.7H24.8V15.2C24.8 20.4 20.9 24.5 16 26.7C11.1 24.5 7.2 20.4 7.2 15.2V6.7Z"
        fill="rgba(8,12,22,0.34)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.8"
      />
      {renderCrestGlyph(crestId)}
    </svg>
  );
}
