import React from 'react';

export type HudResourceIconKind = 'food' | 'wood' | 'gold' | 'favor' | 'pop' | 'army' | 'relic' | 'hunt';

interface ResourceIconProps {
  kind: HudResourceIconKind;
  size?: number;
  className?: string;
}

export const ResourceIcon: React.FC<ResourceIconProps> = ({ kind, size = 20, className = '' }) => {
  const palette: Record<HudResourceIconKind, { bg: string; edge: string; accent: string }> = {
    food: { bg: '#2b1012', edge: '#dc2626', accent: '#fca5a5' },
    wood: { bg: '#0e2418', edge: '#22c55e', accent: '#86efac' },
    gold: { bg: '#2c2008', edge: '#eab308', accent: '#fef08a' },
    favor: { bg: '#0c2336', edge: '#38bdf8', accent: '#bae6fd' },
    pop: { bg: '#1a202c', edge: '#cbd5e1', accent: '#f8fafc' },
    army: { bg: '#1b1d33', edge: '#818cf8', accent: '#c7d2fe' },
    relic: { bg: '#241634', edge: '#c084fc', accent: '#f3e8ff' },
    hunt: { bg: '#2c170b', edge: '#f59e0b', accent: '#fde68a' },
  };
  const pal = palette[kind];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="22" height="22" rx="4" fill={pal.bg} stroke={pal.edge} strokeWidth="1.5" />
      <rect x="2.5" y="2.5" width="19" height="19" rx="2.8" fill="none" stroke="#c8a962" strokeOpacity="0.35" strokeWidth="0.7" />
      {kind === 'food' && (
        <g>
          <path d="M8 17c2-4 5-7 9-10-1 4-3 7-7 10z" fill="#ef4444" stroke={pal.accent} strokeWidth="0.9" />
          <path d="M6 12c2-3 5-5 8-6-1 3-3 5-6 6z" fill="#fb7185" />
          <path d="M10 18l7-11" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}
      {kind === 'wood' && (
        <g>
          <path d="M12 4l6 8h-3l4 5H5l4-5H6l6-8z" fill="#22c55e" stroke={pal.accent} strokeWidth="0.8" />
          <rect x="10.8" y="17" width="2.4" height="3.5" fill="#92400e" />
        </g>
      )}
      {kind === 'gold' && (
        <g>
          <polygon points="7,17 9,10 15,8 18,14 14,18" fill="#eab308" stroke="#fef08a" strokeWidth="1" />
          <polygon points="10,12 14,9 16,13 12,15" fill="#fef08a" fillOpacity="0.6" />
          <circle cx="7.5" cy="8.5" r="1.4" fill="#fde047" />
        </g>
      )}
      {kind === 'favor' && (
        <g>
          <path d="M12 3.5l2.1 5.4 5.4 2.1-5.4 2.1L12 18.5l-2.1-5.4L4.5 11l5.4-2.1L12 3.5z" fill="#38bdf8" stroke={pal.accent} strokeWidth="0.9" />
          <circle cx="12" cy="11" r="2" fill="#f8fafc" />
        </g>
      )}
      {kind === 'pop' && (
        <g>
          <circle cx="9.5" cy="9" r="2.6" fill="#e2e8f0" />
          <path d="M5 18c0-2.8 2-4.4 4.5-4.4S14 15.2 14 18" fill="#cbd5e1" />
          <circle cx="15.5" cy="10" r="2" fill="#94a3b8" />
          <path d="M13 18c0-2 1.2-3.4 3-3.4 1.6 0 3 1.4 3 3.4" fill="#94a3b8" />
        </g>
      )}
      {kind === 'army' && (
        <g>
          <path d="M6 17l10-10 2 2-10 10-2.5.5.5-2.5z" fill="#e2e8f0" />
          <path d="M18 17L8 7 6 9l10 10 2.5.5-.5-2.5z" fill="#93c5fd" />
          <path d="M12 5l4 2v5c0 3-2 5-4 6-2-1-4-3-4-6V7l4-2z" fill="none" stroke="#facc15" strokeWidth="1.2" />
        </g>
      )}
      {kind === 'relic' && (
        <g>
          <polygon points="12,4 18,9.5 15.5,18.5 8.5,18.5 6,9.5" fill="#a855f7" stroke="#f3e8ff" strokeWidth="1" />
          <polygon points="12,5.5 15.5,10 12,16.5 8.5,10" fill="#e9d5ff" fillOpacity="0.65" />
        </g>
      )}
      {kind === 'hunt' && (
        <g>
          <path d="M6 16c1-5 5-8 10-8 1.5 0 2.5.5 3 1.5-2 1-3 2.5-3.5 4.5-.8 2.2-2.6 3.5-5.5 3.5-1.5 0-3-.5-4-1.5z" fill="#f59e0b" />
          <path d="M15.5 8L18 5M14 8.5l1.5-3" stroke="#fef3c7" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};
