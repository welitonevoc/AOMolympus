import React from 'react';
import { PantheonId, UnitKind } from '../game/types';

interface UnitIconProps {
  kind: UnitKind;
  pantheon?: PantheonId;
  size?: number;
  className?: string;
}

type CategoryStyle = {
  bgTop: string;
  bgBottom: string;
  border: string;
  accent: string;
};

function getUnitCategory(kind: UnitKind): 'god' | 'titan' | 'myth' | 'hero' | 'naval' | 'siege' | 'econ' | 'ranged' | 'cavalry' | 'infantry' {
  if (
    kind === 'zeus' ||
    kind === 'poseidon' ||
    kind === 'hades' ||
    kind === 'ra' ||
    kind === 'isis' ||
    kind === 'set' ||
    kind === 'atena' ||
    kind === 'ares' ||
    kind === 'hermes' ||
    kind === 'apolo' ||
    kind === 'dionisio' ||
    kind === 'afrodite' ||
    kind === 'hefesto' ||
    kind === 'artemis'
  ) {
    return 'god';
  }
  if (kind === 'titan') return 'titan';
  if (kind === 'fishing_ship' || kind === 'war_trireme') return 'naval';
  if (
    kind === 'villager' ||
    kind === 'norse_dwarf' ||
    kind === 'ox_cart' ||
    kind === 'citizen' ||
    kind === 'llama_caravan'
  ) {
    return 'econ';
  }
  if (
    kind === 'hero' ||
    kind === 'jason' ||
    kind === 'odysseus' ||
    kind === 'perseus' ||
    kind === 'bellerophon' ||
    kind === 'hippolyta' ||
    kind === 'ajax' ||
    kind === 'theseus' ||
    kind === 'priest' ||
    kind === 'pharaoh' ||
    kind === 'son_of_osiris' ||
    kind === 'hersir' ||
    kind === 'godi' ||
    kind === 'oracle'
  ) {
    return 'hero';
  }
  if (
    kind === 'ram' ||
    kind === 'siege' ||
    kind === 'siege_tower' ||
    kind === 'egypt_catapult' ||
    kind === 'portable_ram' ||
    kind === 'norse_ballista' ||
    kind === 'cheiroballista' ||
    kind === 'fire_siphon' ||
    kind === 'onager'
  ) {
    return 'siege';
  }
  if (
    kind === 'minotaur' ||
    kind === 'centaur' ||
    kind === 'cyclops' ||
    kind === 'manticore' ||
    kind === 'medusa' ||
    kind === 'hydra' ||
    kind === 'colossus' ||
    kind === 'nymph' ||
    kind === 'pegasus' ||
    kind === 'satyr' ||
    kind === 'automaton' ||
    kind === 'iron_dwarf' ||
    kind === 'phoenix' ||
    kind === 'sphinx' ||
    kind === 'wadjet' ||
    kind === 'roc' ||
    kind === 'petsuchos' ||
    kind === 'scarab' ||
    kind === 'avenger' ||
    kind === 'mummy' ||
    kind === 'troll' ||
    kind === 'valkyrie' ||
    kind === 'einherjar' ||
    kind === 'frost_giant' ||
    kind === 'mountain_giant' ||
    kind === 'battle_boar' ||
    kind === 'kraken' ||
    kind === 'rock_troll' ||
    kind === 'fire_giant' ||
    kind === 'fenris_wolf' ||
    kind === 'nidhogg' ||
    kind === 'jormungand' ||
    kind === 'fafnir' ||
    kind === 'promethean' ||
    kind === 'promethean_offspring' ||
    kind === 'caladria' ||
    kind === 'behemoth' ||
    kind === 'stymphalian_bird' ||
    kind === 'dryad' ||
    kind === 'hekagigantes' ||
    kind === 'argus' ||
    kind === 'lampades' ||
    kind === 'carnivora' ||
    kind === 'tartarian_spawn'
  ) {
    return 'myth';
  }
  if (
    kind === 'archer' ||
    kind === 'peltast' ||
    kind === 'gastraphetes' ||
    kind === 'slinger' ||
    kind === 'chariot_archer' ||
    kind === 'throwing_axeman' ||
    kind === 'arcus' ||
    kind === 'turma'
  ) {
    return 'ranged';
  }
  if (
    kind === 'cavalry' ||
    kind === 'prodromos' ||
    kind === 'camel_rider' ||
    kind === 'war_elephant' ||
    kind === 'raiding_cavalry' ||
    kind === 'jarl' ||
    kind === 'contarius'
  ) {
    return 'cavalry';
  }
  return 'infantry';
}

const STYLE_MAP: Record<ReturnType<typeof getUnitCategory>, CategoryStyle> = {
  god: { bgTop: '#3a2a0b', bgBottom: '#191105', border: '#fde047', accent: '#fef08a' },
  titan: { bgTop: '#451408', bgBottom: '#180703', border: '#f97316', accent: '#fed7aa' },
  myth: { bgTop: '#0d2638', bgBottom: '#07131e', border: '#38bdf8', accent: '#bae6fd' },
  hero: { bgTop: '#2f2008', bgBottom: '#150e04', border: '#f59e0b', accent: '#fde68a' },
  naval: { bgTop: '#0d2236', bgBottom: '#081421', border: '#60a5fa', accent: '#dbeafe' },
  siege: { bgTop: '#2d1c12', bgBottom: '#140c08', border: '#d97706', accent: '#fed7aa' },
  econ: { bgTop: '#16281c', bgBottom: '#0b150f', border: '#4ade80', accent: '#bbf7d0' },
  ranged: { bgTop: '#1e2736', bgBottom: '#0f141e', border: '#a3e635', accent: '#ecfccb' },
  cavalry: { bgTop: '#261e34', bgBottom: '#120d1a', border: '#c084fc', accent: '#e9d5ff' },
  infantry: { bgTop: '#202634', bgBottom: '#0f131b', border: '#c8a962', accent: '#f1f5f9' },
};

export const UnitIcon: React.FC<UnitIconProps> = ({ kind, pantheon = 'greek', size = 24, className = '' }) => {
  const cat = getUnitCategory(kind);
  const st = STYLE_MAP[cat];
  const uid = `u-${kind}-${pantheon}`;

  const renderSilhouette = () => {
    if (cat === 'naval') {
      const isWar = kind === 'war_trireme';
      return (
        <g>
          <path d="M5 24c4 3 22 3 26 0l-3 4H8l-3-4z" fill={isWar ? '#92400e' : '#b45309'} stroke={st.accent} strokeWidth="0.9" />
          <path d="M16 9l10 13H16z" fill={isWar ? '#dc2626' : '#f8fafc'} />
          <path d="M16 7v17" stroke="#fde68a" strokeWidth="1.3" />
          {isWar && <polygon points="30,24 34,23 31,27" fill="#facc15" />}
        </g>
      );
    }
    if (cat === 'econ') {
      if (kind === 'ox_cart' || kind === 'llama_caravan') {
        return (
          <g>
            <rect x="13" y="13" width="16" height="10" rx="2" fill="#92400e" stroke="#fde68a" strokeWidth="0.9" />
            <circle cx="17" cy="25" r="3" fill="#451a03" stroke="#eab308" strokeWidth="1" />
            <circle cx="26" cy="25" r="3" fill="#451a03" stroke="#eab308" strokeWidth="1" />
            <ellipse cx="9.5" cy="19" rx="3.5" ry="4" fill="#cbd5e1" />
            <path d="M7 15l-2-2M12 15l2-2" stroke="#fde68a" strokeWidth="1.2" />
          </g>
        );
      }
      return (
        <g>
          <circle cx="16" cy="11" r="4" fill="#e2e8f0" />
          <path d="M10 27c0-5 2.5-8 6-8s6 3 6 8z" fill={kind === 'norse_dwarf' ? '#d97706' : '#94a3b8'} />
          <path d="M22 10l6 15" stroke="#fde68a" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 10l6 2-2 3z" fill="#cbd5e1" />
        </g>
      );
    }
    if (cat === 'god') {
      return (
        <g>
          <circle cx="18" cy="14" r="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.2" />
          <path d="M8 28c1-5 5-8 10-8s9 3 10 8z" fill="#d97706" />
          <path d="M12 8l3-3 3 2 3-2 3 3" fill="none" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    }
    if (cat === 'titan') {
      return (
        <g>
          <path d="M10 29l2-12 6-5 6 5 2 12z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1" />
          <circle cx="18" cy="10" r="4.5" fill="#fdba74" />
          <path d="M12 7l3 3M24 7l-3 3" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    }
    if (cat === 'hero') {
      return (
        <g>
          <path d="M18 6l2.4 5 5.4.8-3.9 3.8.9 5.4L18 18.5 13.2 21l.9-5.4-3.9-3.8 5.4-.8z" fill="#facc15" stroke="#fef08a" strokeWidth="0.9" />
          <path d="M10 28c1-3.5 4-5.5 8-5.5s7 2 8 5.5z" fill="#f59e0b" />
        </g>
      );
    }
    if (cat === 'myth') {
      return (
        <g>
          <path d="M8 20c3-7 7-11 10-11s7 4 10 11l-4-2-3 8h-6l-3-8-4 2z" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1" />
          <circle cx="15.5" cy="14.5" r="1.4" fill="#0f172a" />
          <circle cx="20.5" cy="14.5" r="1.4" fill="#0f172a" />
          <path d="M13 8l-3-3M23 8l3-3" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    }
    if (cat === 'siege') {
      return (
        <g>
          <rect x="7" y="16" width="22" height="7" rx="1.5" fill="#92400e" stroke="#fde68a" strokeWidth="0.9" />
          <circle cx="12" cy="26" r="3" fill="#451a03" stroke="#f59e0b" strokeWidth="1.1" />
          <circle cx="24" cy="26" r="3" fill="#451a03" stroke="#f59e0b" strokeWidth="1.1" />
          <path d="M10 16l13-7" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    }
    if (cat === 'ranged') {
      return (
        <g>
          <path d="M13 8c6 4 6 16 0 20" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="13" y1="8" x2="13" y2="28" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="10" y1="18" x2="27" y2="18" stroke="#bef264" strokeWidth="1.8" />
          <polygon points="27,18 23,15.5 23,20.5" fill="#ecfccb" />
        </g>
      );
    }
    if (cat === 'cavalry') {
      return (
        <g>
          <path d="M8 25c2-6 5-9 10-9l5-6 4 3-3 5c2 2 2 5 2 7H8z" fill="#c084fc" stroke="#f3e8ff" strokeWidth="0.9" />
          <line x1="16" y1="10" x2="28" y2="22" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    }
    // Infantry default: helmet + crossed spear/shield
    return (
      <g>
        <path d="M12 18c0-5 2.5-8 6-8s6 3 6 8v2H12v-2z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="0.8" />
        <path d="M16 7h4v3h-4z" fill="#dc2626" />
        <path d="M10 27l16-14" stroke="#fde68a" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="15" cy="23" r="4.5" fill="#b45309" stroke="#fde047" strokeWidth="1" />
      </g>
    );
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
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={st.bgTop} />
          <stop offset="100%" stopColor={st.bgBottom} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="34" height="34" rx="5" fill={`url(#${uid})`} stroke={st.border} strokeWidth="1.5" />
      <rect x="2.6" y="2.6" width="30.8" height="30.8" rx="3.4" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="0.7" />
      {renderSilhouette()}
    </svg>
  );
};
