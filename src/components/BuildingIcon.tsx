import React from 'react';
import { BuildingKind, PantheonId } from '../game/types';

interface BuildingIconProps {
  kind: BuildingKind;
  pantheon?: PantheonId;
  size?: number;
  className?: string;
}

const PANTHEON_THEME: Record<PantheonId, { stone: string; roof: string; trim: string }> = {
  greek: { stone: '#e2d9c5', roof: '#b45309', trim: '#f59e0b' },
  egyptian: { stone: '#eab308', roof: '#1d4ed8', trim: '#fef08a' },
  norse: { stone: '#9ca3af', roof: '#7c2d12', trim: '#60a5fa' },
  atlantean: { stone: '#cbd5e1', roof: '#0e7490', trim: '#22d3ee' },
  chinese: { stone: '#f59e0b', roof: '#991b1b', trim: '#fde047' },
  aztec: { stone: '#d97706', roof: '#047857', trim: '#facc15' },
  roman: { stone: '#e7e5e4', roof: '#991b1b', trim: '#fbbf24' },
  japanese: { stone: '#e5e7eb', roof: '#7f1d1d', trim: '#f43f5e' },
  eldritch: { stone: '#64748b', roof: '#4c1d95', trim: '#c084fc' },
  celtic: { stone: '#a8a29e', roof: '#15803d', trim: '#86efac' },
  babylonian: { stone: '#f59e0b', roof: '#1e40af', trim: '#fde047' },
  lakota: { stone: '#d6d3d1', roof: '#92400e', trim: '#f97316' },
  jotunn: { stone: '#94a3b8', roof: '#1e3a8a', trim: '#7dd3fc' },
};

export const BuildingIcon: React.FC<BuildingIconProps> = ({
  kind,
  pantheon = 'greek',
  size = 24,
  className = '',
}) => {
  const th = PANTHEON_THEME[pantheon] ?? PANTHEON_THEME.greek;
  const isSpecial =
    kind === 'wonder' ||
    kind === 'titan_gate' ||
    kind === 'sky_passage' ||
    kind === 'asgard_hill_fort' ||
    kind === 'mirror_tower' ||
    kind === 'monument' ||
    kind === 'lighthouse';

  const renderGlyph = () => {
    switch (kind) {
      case 'town_center':
        return (
          <g>
            <rect x="6" y="15" width="24" height="14" fill={th.stone} />
            <polygon points="4,15 18,6 32,15" fill={th.roof} stroke={th.trim} strokeWidth="1" />
            <rect x="14" y="20" width="8" height="9" fill="#0f172a" />
            <rect x="8" y="18" width="4" height="8" fill={th.trim} opacity="0.7" />
            <rect x="24" y="18" width="4" height="8" fill={th.trim} opacity="0.7" />
            <circle cx="18" cy="11" r="2" fill="#fde047" />
          </g>
        );
      case 'village_center':
        return (
          <g>
            <rect x="8" y="17" width="20" height="12" fill={th.stone} />
            <polygon points="6,17 18,9 30,17" fill={th.roof} stroke={th.trim} strokeWidth="0.9" />
            <rect x="15" y="21" width="6" height="8" fill="#1e293b" />
            <path d="M18 6v3" stroke="#fde047" strokeWidth="1.5" />
          </g>
        );
      case 'house':
        return (
          <g>
            <rect x="9" y="17" width="18" height="11" fill={th.stone} />
            <polygon points="7,17 18,9 29,17" fill={th.roof} />
            <rect x="15" y="21" width="5" height="7" fill="#1e293b" />
          </g>
        );
      case 'farm':
        return (
          <g>
            <rect x="6" y="11" width="24" height="18" rx="2" fill="#78350f" stroke="#a16207" strokeWidth="1" />
            <path d="M9 14v12M14 14v12M19 14v12M24 14v12M27 14v12" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 14h20" stroke="#4ade80" strokeWidth="1.2" opacity="0.65" />
          </g>
        );
      case 'granary':
        return (
          <g>
            <ellipse cx="18" cy="15" rx="9" ry="7" fill={th.stone} stroke={th.trim} strokeWidth="1" />
            <rect x="9" y="15" width="18" height="13" fill={th.stone} />
            <path d="M14 28v-7h8v7" fill="#78350f" />
            <circle cx="18" cy="12" r="2.2" fill="#f59e0b" />
          </g>
        );
      case 'storehouse':
      case 'economic_guild':
        return (
          <g>
            <rect x="7" y="15" width="22" height="13" fill={th.stone} />
            <polygon points="6,15 18,9 30,15" fill={th.roof} />
            <rect x="10" y="21" width="6" height="7" fill="#92400e" stroke="#fde68a" strokeWidth="0.7" />
            <circle cx="23" cy="24" r="3" fill="#eab308" />
          </g>
        );
      case 'lumber_camp':
        return (
          <g>
            <rect x="8" y="16" width="16" height="12" fill="#92400e" />
            <polygon points="6,16 16,9 26,16" fill="#15803d" />
            <circle cx="26" cy="23" r="3.5" fill="#78350f" stroke="#d97706" strokeWidth="1" />
            <circle cx="26" cy="23" r="1.3" fill="#fde68a" />
          </g>
        );
      case 'mining_camp':
        return (
          <g>
            <path d="M6 28l7-14h10l7 14z" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <path d="M13 28v-8a5 5 0 0 1 10 0v8z" fill="#0f172a" />
            <polygon points="10,20 13,15 16,20" fill="#facc15" />
            <polygon points="21,21 24,16 27,21" fill="#facc15" />
          </g>
        );
      case 'barracks':
        return (
          <g>
            <rect x="7" y="14" width="22" height="14" fill={th.stone} />
            <polygon points="6,14 18,7 30,14" fill={th.roof} />
            <path d="M13 25L23 15M23 25L13 15" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="18" cy="20" r="4" fill="none" stroke={th.trim} strokeWidth="1.2" />
          </g>
        );
      case 'archery_range':
        return (
          <g>
            <rect x="7" y="16" width="22" height="12" fill={th.stone} />
            <polygon points="6,16 18,9 30,16" fill={th.roof} />
            <circle cx="18" cy="21" r="5" fill="#dc2626" stroke="#f8fafc" strokeWidth="1.2" />
            <circle cx="18" cy="21" r="2" fill="#facc15" />
          </g>
        );
      case 'stable':
      case 'great_hall':
        return (
          <g>
            <rect x="6" y="15" width="24" height="13" fill={th.stone} />
            <polygon points="5,15 18,7 31,15" fill={th.roof} stroke={th.trim} strokeWidth="0.9" />
            <path d="M14 26c0-4 2-7 5-8l2 3-2 2v3h-5z" fill="#fbbf24" />
          </g>
        );
      case 'counter_barracks':
        return (
          <g>
            <rect x="7" y="14" width="22" height="14" fill={th.stone} />
            <polygon points="6,14 18,8 30,14" fill="#0e7490" />
            <path d="M18 13l6 4v5c0 3.5-2.5 5.5-6 6.5-3.5-1-6-3-6-6.5v-5l6-4z" fill="#22d3ee" stroke="#0f172a" strokeWidth="1" />
          </g>
        );
      case 'armory':
        return (
          <g>
            <rect x="8" y="16" width="20" height="12" fill="#475569" stroke={th.trim} strokeWidth="1" />
            <path d="M11 19h14l-3 5h-8l-3-5z" fill="#cbd5e1" />
            <rect x="14" y="24" width="8" height="4" fill="#94a3b8" />
            <circle cx="24" cy="11" r="3" fill="#f97316" />
          </g>
        );
      case 'siege_works':
        return (
          <g>
            <rect x="6" y="16" width="24" height="12" fill="#78350f" stroke="#d97706" strokeWidth="1" />
            <circle cx="12" cy="26" r="3" fill="#451a03" stroke="#facc15" strokeWidth="1" />
            <circle cx="24" cy="26" r="3" fill="#451a03" stroke="#facc15" strokeWidth="1" />
            <path d="M10 18l14-8" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'market':
        return (
          <g>
            <rect x="7" y="17" width="22" height="11" fill={th.stone} />
            <path d="M6 17l4-7h16l4 7z" fill="#dc2626" />
            <path d="M12 17l2-7h8l2 7z" fill="#fef08a" />
            <circle cx="18" cy="23" r="3" fill="#eab308" />
          </g>
        );
      case 'temple':
        return (
          <g>
            <polygon points="5,14 18,5 31,14" fill={th.trim} />
            <rect x="8" y="14" width="3.5" height="13" fill={th.stone} />
            <rect x="16.2" y="14" width="3.5" height="13" fill={th.stone} />
            <rect x="24.5" y="14" width="3.5" height="13" fill={th.stone} />
            <rect x="6" y="27" width="24" height="3" fill={th.stone} />
            <circle cx="18" cy="10" r="2" fill="#38bdf8" />
          </g>
        );
      case 'dock':
        return (
          <g>
            <rect x="6" y="22" width="24" height="3" fill="#92400e" />
            <rect x="9" y="25" width="3" height="5" fill="#78350f" />
            <rect x="24" y="25" width="3" height="5" fill="#78350f" />
            <path d="M11 21c3 0 11 0 14-3l-7-10-7 13z" fill="#f8fafc" stroke={th.trim} strokeWidth="0.9" />
            <path d="M5 29c4 1 7-1 11 0s8 1 14-1" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          </g>
        );
      case 'monument':
        return (
          <g>
            <rect x="9" y="25" width="18" height="4" fill="#d97706" />
            <polygon points="13,25 15,8 18,5 21,8 23,25" fill="#facc15" stroke="#fef08a" strokeWidth="0.9" />
            <circle cx="18" cy="12" r="2.2" fill="#38bdf8" />
          </g>
        );
      case 'obelisk':
        return (
          <g>
            <rect x="12" y="25" width="12" height="4" fill="#b45309" />
            <polygon points="15,25 16.5,7 18,4.5 19.5,7 21,25" fill="#e2d9c5" stroke="#fde047" strokeWidth="1" />
            <circle cx="18" cy="10" r="2" fill="#38bdf8" />
          </g>
        );
      case 'lighthouse':
        return (
          <g>
            <polygon points="12,29 14,11 22,11 24,29" fill="#e2d9c5" stroke="#f59e0b" strokeWidth="1" />
            <rect x="14.5" y="7" width="7" height="4" fill="#fef08a" />
            <path d="M7 8l7 1M29 8l-7 1M9 5l5 3M27 5l-5 3" stroke="#fde047" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        );
      case 'wall':
        return (
          <g>
            <rect x="5" y="13" width="26" height="15" fill={th.stone} stroke="#475569" strokeWidth="1" />
            <rect x="5" y="9" width="5" height="4" fill={th.stone} />
            <rect x="15.5" y="9" width="5" height="4" fill={th.stone} />
            <rect x="26" y="9" width="5" height="4" fill={th.stone} />
            <path d="M5 20h26" stroke="#64748b" strokeWidth="1" />
          </g>
        );
      case 'gate':
        return (
          <g>
            <rect x="5" y="11" width="7" height="17" fill={th.stone} />
            <rect x="24" y="11" width="7" height="17" fill={th.stone} />
            <rect x="12" y="11" width="12" height="5" fill={th.roof} />
            <path d="M12 28V16h12v12" fill="#78350f" stroke="#fde68a" strokeWidth="1" />
            <path d="M18 16v12" stroke="#0f172a" strokeWidth="1.2" />
          </g>
        );
      case 'tower':
        return (
          <g>
            <polygon points="12,29 13,12 23,12 24,29" fill={th.stone} stroke="#475569" strokeWidth="1" />
            <rect x="11" y="9" width="14" height="4" fill={th.roof} />
            <rect x="16.5" y="16" width="3" height="6" fill="#0f172a" />
          </g>
        );
      case 'mirror_tower':
        return (
          <g>
            <polygon points="13,29 15,13 21,13 23,29" fill="#bae6fd" stroke="#facc15" strokeWidth="1" />
            <circle cx="18" cy="10" r="4.5" fill="#fef08a" stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M18 5v10M13 10h10" stroke="#f59e0b" strokeWidth="1" />
          </g>
        );
      case 'fortress':
      case 'asgard_hill_fort':
        return (
          <g>
            <rect x="6" y="14" width="24" height="15" fill={th.stone} />
            <rect x="5" y="9" width="6" height="20" fill={th.stone} stroke={th.trim} strokeWidth="0.9" />
            <rect x="25" y="9" width="6" height="20" fill={th.stone} stroke={th.trim} strokeWidth="0.9" />
            <polygon points="4,9 8,5 12,9" fill={kind === 'asgard_hill_fort' ? '#38bdf8' : th.roof} />
            <polygon points="24,9 28,5 32,9" fill={kind === 'asgard_hill_fort' ? '#38bdf8' : th.roof} />
            <path d="M14 29v-7a4 4 0 0 1 8 0v7z" fill="#0f172a" />
            {kind === 'asgard_hill_fort' && <circle cx="18" cy="17" r="2.3" fill="#fde047" />}
          </g>
        );
      case 'sky_passage':
        return (
          <g>
            <circle cx="18" cy="18" r="10" fill="#0c4a6e" stroke="#22d3ee" strokeWidth="1.6" />
            <circle cx="18" cy="18" r="5.5" fill="#38bdf8" fillOpacity="0.65" />
            <path d="M18 6v24M6 18h24" stroke="#bae6fd" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        );
      case 'titan_gate':
        return (
          <g>
            <polygon points="5,29 9,9 15,9 13,29" fill="#451a03" stroke="#f97316" strokeWidth="1" />
            <polygon points="23,29 21,9 27,9 31,29" fill="#451a03" stroke="#f97316" strokeWidth="1" />
            <rect x="9" y="7" width="18" height="4" fill="#ea580c" />
            <path d="M14 28l4-13 4 13z" fill="#fde047" />
          </g>
        );
      case 'wonder':
        return (
          <g>
            <polygon points="6,28 18,5 30,28" fill="#eab308" stroke="#fef08a" strokeWidth="1.2" />
            <polygon points="12,28 18,12 24,28" fill="#92400e" />
            <circle cx="18" cy="7" r="2.6" fill="#fde047" />
          </g>
        );
      default:
        return <rect x="8" y="10" width="20" height="18" fill={th.stone} />;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`bld-bg-${kind}-${pantheon}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isSpecial ? '#2a1f0b' : '#182030'} />
          <stop offset="100%" stopColor="#0b0f17" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="34"
        height="34"
        rx="5"
        fill={`url(#bld-bg-${kind}-${pantheon})`}
        stroke={isSpecial ? '#facc15' : '#c8a962'}
        strokeOpacity={isSpecial ? 0.9 : 0.65}
        strokeWidth="1.5"
      />
      <rect
        x="2.5"
        y="2.5"
        width="31"
        height="31"
        rx="3.5"
        fill="none"
        stroke="#fef08a"
        strokeOpacity="0.18"
        strokeWidth="0.7"
      />
      {renderGlyph()}
    </svg>
  );
};
