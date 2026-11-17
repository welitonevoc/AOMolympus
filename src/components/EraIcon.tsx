import React, { useId } from 'react';
import { AGE_NAMES, AgeLevel, PantheonId } from '../game/types';

interface EraIconProps {
  age: AgeLevel;
  pantheon?: PantheonId;
  size?: number;
  active?: boolean;
  locked?: boolean;
  className?: string;
}

interface EraTierTheme {
  roman: string;
  bgTop: string;
  bgBottom: string;
  rimOuter: string;
  rimInner: string;
  accent: string;
  accentSecondary: string;
  glow: string;
}

const ERA_TIER_THEMES: Record<AgeLevel, EraTierTheme> = {
  1: {
    roman: 'I',
    bgTop: '#4a2e1b',
    bgBottom: '#1c120a',
    rimOuter: '#b47b48',
    rimInner: '#e7c39c',
    accent: '#e2b887',
    accentSecondary: '#a16207',
    glow: '#d97706',
  },
  2: {
    roman: 'II',
    bgTop: '#713f12',
    bgBottom: '#241405',
    rimOuter: '#d97706',
    rimInner: '#fde68a',
    accent: '#f59e0b',
    accentSecondary: '#fcd34d',
    glow: '#fbbf24',
  },
  3: {
    roman: 'III',
    bgTop: '#854d0e',
    bgBottom: '#261704',
    rimOuter: '#eab308',
    rimInner: '#fef9c3',
    accent: '#fde047',
    accentSecondary: '#f59e0b',
    glow: '#fef08a',
  },
  4: {
    roman: 'IV',
    bgTop: '#4c1d95',
    bgBottom: '#16092e',
    rimOuter: '#d4af37',
    rimInner: '#e9d5ff',
    accent: '#fde047',
    accentSecondary: '#c084fc',
    glow: '#a855f7',
  },
  5: {
    roman: 'V',
    bgTop: '#0c4a6e',
    bgBottom: '#0f0a29',
    rimOuter: '#fef08a',
    rimInner: '#7dd3fc',
    accent: '#fef9c3',
    accentSecondary: '#38bdf8',
    glow: '#7dd3fc',
  },
};

const CIV_TINT_OVERRIDES: Record<PantheonId, { primary: string; secondary: string; label: string }> = {
  greek: { primary: '#fde047', secondary: '#60a5fa', label: 'Hélade & Olimpo' },
  egyptian: { primary: '#fbbf24', secondary: '#38bdf8', label: 'Nilo & Rá' },
  norse: { primary: '#93c5fd', secondary: '#f59e0b', label: 'Midgard & Asgard' },
  atlantean: { primary: '#2dd4bf', secondary: '#fcd34d', label: 'Oricalco & Atlântida' },
  chinese: { primary: '#4ade80', secondary: '#f87171', label: 'Jade & Império Celeste' },
  aztec: { primary: '#34d399', secondary: '#fbbf24', label: 'Obsidiana & Sol' },
  roman: { primary: '#f87171', secondary: '#fde047', label: 'Águia & Capitólio' },
  japanese: { primary: '#fb7185', secondary: '#fef08a', label: 'Sol Nascente & Kami' },
  eldritch: { primary: '#a78bfa', secondary: '#22d3ee', label: 'Abismo & R’lyeh' },
  celtic: { primary: '#4ade80', secondary: '#fbbf24', label: 'Bosque Sagrado & Lugh' },
  babylonian: { primary: '#60a5fa', secondary: '#fbbf24', label: 'Zigurate & Ishtar' },
  lakota: { primary: '#fb923c', secondary: '#fde047', label: 'Espírito & Trovão' },
  jotunn: { primary: '#7dd3fc', secondary: '#f97316', label: 'Gelo Eterno & Muspel' },
};

const ERA_CIV_SUBTITLES: Record<PantheonId, Record<AgeLevel, string>> = {
  greek: {
    1: 'Aldeia Arcaica',
    2: 'Pólis Clássica',
    3: 'Cidadela Heroica',
    4: 'Santuário Olímpico',
    5: 'Metrópole do Olimpo',
  },
  egyptian: {
    1: 'Nomos do Nilo',
    2: 'Reino dos Obeliscos',
    3: 'Olho de Hórus',
    4: 'Barca Solar de Rá',
    5: 'Dinastia Divina',
  },
  norse: {
    1: 'Salão de Madeira',
    2: 'Clã do Escudo',
    3: 'Frota Drakkar',
    4: 'Forja de Mjölnir',
    5: 'Coroa de Yggdrasil',
  },
  atlantean: {
    1: 'Porto de Oricalco',
    2: 'Arco do Tridente',
    3: 'Palácio Espelhado',
    4: 'Vórtice de Cronos',
    5: 'Cidadela Titânica',
  },
  chinese: {
    1: 'Bambu & Jade',
    2: 'Harmonia Yin-Yang',
    3: 'Dragão Imperial',
    4: 'Fênix & Bagua',
    5: 'Mandato do Céu',
  },
  aztec: {
    1: 'Templo de Pedra',
    2: 'Escudo Chimalli',
    3: 'Águia & Jaguar',
    4: 'Pedra do Sol',
    5: 'Zênite de Tonatiuh',
  },
  roman: {
    1: 'Castro Primitivo',
    2: 'Legião & Scutum',
    3: 'Águia Imperial',
    4: 'Raio Capitolino',
    5: 'Triunfo Eterno',
  },
  japanese: {
    1: 'Portal Torii',
    2: 'Elmo Kabuto',
    3: 'Crisântemo Solar',
    4: 'Espelho de Amaterasu',
    5: 'Castelo Celestial',
  },
  eldritch: {
    1: 'Monólito Submerso',
    2: 'Selo Abissal',
    3: 'Estrela Anciã',
    4: 'Fenda Cósmica',
    5: 'Coroa de R’lyeh',
  },
  celtic: {
    1: 'Menir & Triskelion',
    2: 'Nó de Bronze',
    3: 'Lança de Lugh',
    4: 'Carvalho & Corvos',
    5: 'Torque Dourado',
  },
  babylonian: {
    1: 'Tabuleta Cuneiforme',
    2: 'Porta de Ishtar',
    3: 'Guardião Lamassu',
    4: 'Estrela de Marduk',
    5: 'Jardins Celestes',
  },
  lakota: {
    1: 'Roda da Medicina',
    2: 'Escudo de Búfalo',
    3: 'Dança do Sol',
    4: 'Pássaro-Trovão',
    5: 'Grande Espírito',
  },
  jotunn: {
    1: 'Lascas de Niflheim',
    2: 'Machado Glacial',
    3: 'Trono da Geada',
    4: 'Espada de Surtr',
    5: 'Coroa de Ymir',
  },
};

export function getEraSubtitle(age: AgeLevel, pantheon: PantheonId): string {
  return ERA_CIV_SUBTITLES[pantheon]?.[age] ?? AGE_NAMES[age];
}

function renderCivMotif(
  age: AgeLevel,
  pantheon: PantheonId,
  primary: string,
  secondary: string
): React.ReactNode {
  switch (pantheon) {
    case 'greek': {
      if (age === 1) {
        return (
          <g>
            {/* Rustic Doric stone plinth + archaic olive & spear */}
            <path d="M9 23H23V25.5H9V23Z" fill={primary} opacity="0.88" />
            <path d="M11 23V16H13.5V23M18.5 23V16H21V23" stroke={primary} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M16 7L18.4 13.5L16 12.2L13.6 13.5L16 7Z" fill={primary} />
            <line x1="16" y1="12.2" x2="16" y2="23" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Classical Greek temple pediment + Corinthian crest */}
            <polygon points="16,7.5 24,13 8,13" fill={primary} stroke="#1f2937" strokeWidth="0.6" />
            <rect x="9.5" y="13.5" width="13" height="1.5" fill={secondary} />
            <path d="M11.5 15V22.5M16 15V22.5M20.5 15V22.5" stroke={primary} strokeWidth="1.8" strokeLinecap="round" />
            <rect x="9" y="22.5" width="14" height="2" rx="0.5" fill={primary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Hoplon shield + crossed spears + laurel wreath */}
            <path d="M9.5 21C7.5 17 8.5 12 11.5 9.5M22.5 21C24.5 17 23.5 12 20.5 9.5" stroke={primary} strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <line x1="9" y1="23" x2="23" y2="9" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
            <line x1="23" y1="23" x2="9" y2="9" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="16" cy="16" r="4.8" fill={primary} stroke="#1e293b" strokeWidth="0.9" />
            <path d="M14.2 18.5L16 12.5L17.8 18.5" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Aegis Wings + Olympus Thunderbolt */}
            <path d="M6.5 13C9 10.5 12 11.5 14 14.5M25.5 13C23 10.5 20 11.5 18 14.5" stroke={secondary} strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M8 17.5C10.5 16.5 12.5 17 13.5 18.5M24 17.5C21.5 16.5 19.5 17 18.5 18.5" stroke={primary} strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <path d="M17.2 7L12 16.5H16.2L14.5 25L20.5 14.8H16.2L17.2 7Z" fill={primary} stroke="#1e1b4b" strokeWidth="0.7" strokeLinejoin="round" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Olympus Divine Crown + Celestial Acropolis */}
          <path d="M8.5 21.5L10.5 12.5L14 16L16 9L18 16L21.5 12.5L23.5 21.5Z" fill={primary} stroke="#0f172a" strokeWidth="0.7" strokeLinejoin="round" />
          <rect x="9" y="22" width="14" height="2.2" rx="0.8" fill={secondary} />
          <circle cx="16" cy="7.2" r="1.4" fill="#ffffff" />
          <circle cx="10.2" cy="11.2" r="1" fill={secondary} />
          <circle cx="21.8" cy="11.2" r="1" fill={secondary} />
        </g>
      );
    }

    case 'egyptian': {
      if (age === 1) {
        return (
          <g>
            {/* Early step pyramid + rising Nile sun */}
            <circle cx="16" cy="11.5" r="3.4" fill={primary} />
            <polygon points="8,24 16,13.5 24,24" fill={secondary} stroke="#1f2937" strokeWidth="0.7" />
            <line x1="11.5" y1="20" x2="20.5" y2="20" stroke={primary} strokeWidth="1" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Classical Ankh + twin obelisk silhouettes */}
            <path d="M9.5 24L10.5 12L11.5 24M20.5 24L21.5 12L22.5 24" fill={secondary} opacity="0.85" />
            <circle cx="16" cy="11" r="2.9" fill="none" stroke={primary} strokeWidth="2.1" />
            <path d="M16 14V24M12.2 17H19.8" stroke={primary} strokeWidth="2.1" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Eye of Horus (Wedjat) over golden crest */}
            <path d="M8.5 14.5C11.5 10.5 20.5 10.5 23.5 14.5C20.5 18 11.5 18 8.5 14.5Z" fill="none" stroke={primary} strokeWidth="1.9" strokeLinejoin="round" />
            <circle cx="16" cy="14.5" r="2.4" fill={secondary} />
            <path d="M16 17.5V22.5L13 24M19.5 17.5L22.5 22" stroke={primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Winged Solar Scarab / Ra Disk */}
            <path d="M6 15.5C9.5 11.5 12.5 13 14 15.5C11.5 17 9 18 6 15.5ZM26 15.5C22.5 11.5 19.5 13 18 15.5C20.5 17 23 18 26 15.5Z" fill={primary} />
            <circle cx="16" cy="14" r="3.6" fill={secondary} stroke="#1e1b4b" strokeWidth="0.7" />
            <path d="M13 20.5C14.5 23 17.5 23 19 20.5" stroke={primary} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Pharaoh Nemes & Double Solar Crown */}
          <path d="M9 22L11 12L16 8L21 12L23 22L19.5 23.5H12.5L9 22Z" fill={secondary} stroke="#0f172a" strokeWidth="0.7" />
          <circle cx="16" cy="13.5" r="3" fill={primary} />
          <path d="M12 11.5L16 6.5L20 11.5" stroke={primary} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    }

    case 'norse': {
      if (age === 1) {
        return (
          <g>
            {/* Longhouse timber roof & carved stone battleaxe */}
            <path d="M8.5 18L16 10.5L23.5 18" stroke={primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M11 23.5V17.5H21V23.5" stroke={secondary} strokeWidth="1.6" fill="none" />
            <line x1="16" y1="8.5" x2="16" y2="23.5" stroke={primary} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Viking Round Shield & crossed bearded axes */}
            <line x1="8.5" y1="23.5" x2="23.5" y2="8.5" stroke={secondary} strokeWidth="1.7" strokeLinecap="round" />
            <line x1="23.5" y1="23.5" x2="8.5" y2="8.5" stroke={secondary} strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="16" cy="16" r="5.5" fill={primary} stroke="#1f2937" strokeWidth="1" />
            <circle cx="16" cy="16" r="2" fill={secondary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Drakkar Dragon Prow + Valknut */}
            <path d="M8 19.5C11.5 23 20.5 23 24 19.5L22.5 17H9.5L8 19.5Z" fill={secondary} />
            <path d="M16 17V8.5M16 9.5L21 12.5L16 15.5" stroke={primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M8.5 17C8 14 9 11.5 11.5 10.5" stroke={primary} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Mjölnir Hammer + Runic Lightning */}
            <rect x="9.5" y="10" width="13" height="6.5" rx="1.5" fill={primary} stroke="#1e1b4b" strokeWidth="0.8" />
            <rect x="14.4" y="16.5" width="3.2" height="7.5" rx="1" fill={secondary} />
            <path d="M7 10.5L9.5 13M25 10.5L22.5 13" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Yggdrasil World Tree & Bifrost Crown */}
          <path d="M16 23.5V13.5M16 17L11 12M16 15L21 11M16 13.5L13 8.5M16 13.5L19 8.5" stroke={primary} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <circle cx="16" cy="10.5" r="4.8" fill="none" stroke={secondary} strokeWidth="1.3" strokeDasharray="2.5 1.5" />
          <path d="M11 24C13 22 19 22 21 24" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    case 'atlantean': {
      if (age === 1) {
        return (
          <g>
            {/* Orichalcum crystal & harbor wave */}
            <polygon points="16,7.5 20.5,14.5 16,21.5 11.5,14.5" fill={primary} stroke="#0f172a" strokeWidth="0.7" />
            <path d="M8.5 23C11 21 13.5 24 16 22.5C18.5 21 21 24 23.5 22.5" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Atlantean Trident + Orichalcum Shield Arch */}
            <path d="M16 24V8.5M11.5 10.5V15.5C11.5 17.5 20.5 17.5 20.5 15.5V10.5" stroke={primary} strokeWidth="1.9" strokeLinecap="round" fill="none" />
            <polygon points="16,6.5 17.8,10 14.2,10" fill={secondary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Mirrored Palace Dome & Astrolabe */}
            <circle cx="16" cy="15.5" r="6.5" fill="none" stroke={secondary} strokeWidth="1.4" />
            <path d="M11 22V16C11 12.5 21 12.5 21 16V22Z" fill={primary} opacity="0.9" />
            <circle cx="16" cy="9" r="1.6" fill={secondary} />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Chronos Star-Vortex */}
            <ellipse cx="16" cy="16" rx="7.8" ry="3.4" transform="rotate(-30 16 16)" fill="none" stroke={primary} strokeWidth="1.6" />
            <ellipse cx="16" cy="16" rx="7.8" ry="3.4" transform="rotate(30 16 16)" fill="none" stroke={secondary} strokeWidth="1.6" />
            <circle cx="16" cy="16" r="2.6" fill={primary} />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Titan Crown of Atlantis */}
          <polygon points="16,7 20,13 16,19 12,13" fill={primary} />
          <path d="M8.5 19.5L11 13L16 17.5L21 13L23.5 19.5L21 23.5H11Z" fill="none" stroke={secondary} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="16" cy="13" r="1.4" fill="#ffffff" />
        </g>
      );
    }

    case 'chinese': {
      if (age === 1) {
        return (
          <g>
            {/* Bamboo pavilion roof & jade Bi-disc */}
            <path d="M8.5 15C11.5 13 13.5 10.5 16 8.5C18.5 10.5 20.5 13 23.5 15" stroke={secondary} strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="16" cy="18.5" r="4.2" fill="none" stroke={primary} strokeWidth="2.2" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Yin-Yang & Classical Jian Sword */}
            <circle cx="16" cy="16" r="6.2" fill={secondary} stroke={primary} strokeWidth="1.4" />
            <path d="M16 9.8A6.2 6.2 0 0 1 16 22.2A3.1 3.1 0 0 1 16 16A3.1 3.1 0 0 0 16 9.8Z" fill={primary} />
            <circle cx="16" cy="12.9" r="1" fill={secondary} />
            <circle cx="16" cy="19.1" r="1" fill={primary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Imperial Pagoda Tier */}
            <path d="M9.5 13.5Q16 10.5 22.5 13.5L20 15.5H12Z" fill={primary} />
            <path d="M8 18.5Q16 15.5 24 18.5L21 20.5H11Z" fill={secondary} />
            <rect x="13" y="20.5" width="6" height="3.5" fill={primary} />
            <line x1="16" y1="7.5" x2="16" y2="11.5" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Bagua Octagon & Dragon-Pearl */}
            <polygon points="16,8 21.5,10.5 24,16 21.5,21.5 16,24 10.5,21.5 8,16 10.5,10.5" fill="none" stroke={primary} strokeWidth="1.7" />
            <circle cx="16" cy="16" r="3.4" fill={secondary} />
            <circle cx="16" cy="16" r="1.4" fill="#fef08a" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Mandate of Heaven Dragon Crown */}
          <path d="M8.5 19.5Q12 10 16 13Q20 10 23.5 19.5L21 23H11Z" fill={primary} stroke="#0f172a" strokeWidth="0.7" />
          <circle cx="16" cy="9.5" r="2.3" fill={secondary} />
          <path d="M12 20.5H20" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    }

    case 'aztec': {
      if (age === 1) {
        return (
          <g>
            {/* Stepped earthen Teocalli & obsidian point */}
            <polygon points="8.5,23.5 11.5,15.5 20.5,15.5 23.5,23.5" fill={secondary} />
            <rect x="12.8" y="11" width="6.4" height="4.5" fill={primary} />
            <polygon points="16,7 18.2,11 13.8,11" fill={primary} />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Chimalli Feather Shield & Macuahuitl */}
            <line x1="9" y1="23" x2="23" y2="9" stroke={secondary} strokeWidth="2.1" strokeLinecap="round" />
            <circle cx="16" cy="16" r="5.2" fill={primary} stroke="#1f2937" strokeWidth="0.9" />
            <circle cx="16" cy="16" r="2.2" fill={secondary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Eagle-Jaguar Plumed Crest */}
            <path d="M8.5 19.5C8.5 12 12 8.5 16 8.5C20 8.5 23.5 12 23.5 19.5" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" />
            <polygon points="16,11.5 20.5,19.5 11.5,19.5" fill={secondary} />
            <circle cx="16" cy="16.5" r="1.6" fill="#1f2937" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Aztec Sun Stone */}
            <circle cx="16" cy="16" r="6.4" fill="none" stroke={secondary} strokeWidth="1.8" strokeDasharray="2 1.2" />
            <circle cx="16" cy="16" r="3.6" fill={primary} />
            <path d="M16 7.5V10.5M16 21.5V24.5M7.5 16H10.5M21.5 16H24.5" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Tonatiuh Radiant Quetzal Crown */}
          <path d="M7.5 18L10 9.5L13.5 14L16 7.5L18.5 14L22 9.5L24.5 18L20 22.5H12Z" fill={primary} />
          <circle cx="16" cy="16.5" r="2.8" fill={secondary} />
        </g>
      );
    }

    case 'roman': {
      if (age === 1) {
        return (
          <g>
            {/* Roman arch & gladius */}
            <path d="M10 23.5V16A6 6 0 0 1 22 16V23.5" fill="none" stroke={primary} strokeWidth="2.1" />
            <line x1="16" y1="11" x2="16" y2="23.5" stroke={secondary} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="13" y1="20" x2="19" y2="20" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Scutum Shield & Centurion Crest */}
            <rect x="11" y="10" width="10" height="13" rx="2" fill={primary} stroke={secondary} strokeWidth="1.3" />
            <circle cx="16" cy="16.5" r="2" fill={secondary} />
            <path d="M11 16.5H21M16 10V23" stroke={secondary} strokeWidth="1" opacity="0.8" />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Imperial Legionary Aquila Eagle */}
            <path d="M7.5 13C10.5 10.5 13.5 12 16 14.5C18.5 12 21.5 10.5 24.5 13L21.5 17.5H10.5Z" fill={secondary} />
            <circle cx="16" cy="11.2" r="2.1" fill={primary} />
            <line x1="16" y1="17.5" x2="16" y2="24" stroke={secondary} strokeWidth="1.9" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Jupiter Capitoline Winged Thunderbolt */}
            <path d="M8 14L13 12L14 16L8 18ZM24 14L19 12L18 16L24 18Z" fill={primary} />
            <path d="M17.5 7.5L13.5 16H17L14.5 24.5L19.5 15H16.5Z" fill={secondary} />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Triumphal Laurel & Imperial Dome */}
          <path d="M10 21C7.5 17.5 8 12.5 11.5 9.5M22 21C24.5 17.5 24 12.5 20.5 9.5" stroke={secondary} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M11.5 19.5V15A4.5 4.5 0 0 1 20.5 15V19.5Z" fill={primary} />
          <circle cx="16" cy="8.5" r="1.5" fill="#ffffff" />
        </g>
      );
    }

    case 'japanese': {
      if (age === 1) {
        return (
          <g>
            {/* Wooden Torii Shrine Gate */}
            <path d="M8.5 11.5Q16 13 23.5 11.5" stroke={primary} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <line x1="10" y1="15" x2="22" y2="15" stroke={secondary} strokeWidth="1.5" />
            <path d="M12 12V23.5M20 12V23.5" stroke={primary} strokeWidth="1.9" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Samurai Kabuto Crescent & Katana */}
            <path d="M10.5 19A5.5 5.5 0 0 1 21.5 19H10.5Z" fill={primary} />
            <path d="M10.5 10.5L16 14.5L21.5 10.5" stroke={secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M9.5 22.5H22.5" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Rising Sun & Chrysanthemum Emblem */}
            <circle cx="16" cy="16" r="4" fill={primary} />
            <path d="M16 7.5V10.5M16 21.5V24.5M7.5 16H10.5M21.5 16H24.5M10 10L12.2 12.2M19.8 19.8L22 22M22 10L19.8 12.2M12.2 19.8L10 22" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Sacred Yata Mirror of Amaterasu */}
            <circle cx="16" cy="16" r="6" fill="none" stroke={secondary} strokeWidth="2" />
            <circle cx="16" cy="16" r="3" fill={primary} />
            <path d="M16 8.5L17.4 10H14.6ZM23.5 16L22 17.4V14.6ZM16 23.5L14.6 22H17.4ZM8.5 16L10 14.6V17.4Z" fill={secondary} />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Imperial Tenshu Spire & Kami Sun Halo */}
          <circle cx="16" cy="13.5" r="5.2" fill="none" stroke={secondary} strokeWidth="1.4" />
          <polygon points="16,7.5 20.5,14 11.5,14" fill={primary} />
          <polygon points="9.5,20.5 22.5,20.5 20,15 12,15" fill={secondary} />
          <rect x="11" y="20.5" width="10" height="3" fill={primary} />
        </g>
      );
    }

    case 'eldritch': {
      if (age === 1) {
        return (
          <g>
            {/* Sunken Monolith & Abyssal Ripple */}
            <polygon points="16,7.5 19.5,22 12.5,22" fill={primary} />
            <path d="M8.5 23.5Q16 20.5 23.5 23.5" stroke={secondary} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Abyssal Tentacle Spiral Sigil */}
            <path d="M16 16C16 13.5 19 13.5 19 16C19 19.5 13 20 12 16C11 11.5 16 9 20.5 11.5" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="16" r="1.8" fill={secondary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Elder Star & Abyssal Eye */}
            <polygon points="16,8 18.2,14 24,14 19.4,17.8 21,23.5 16,20 11,23.5 12.6,17.8 8,14 13.8,14" fill="none" stroke={primary} strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="16" cy="16" r="2.4" fill={secondary} />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Cosmic Void Rift */}
            <ellipse cx="16" cy="16" rx="7.2" ry="4.2" fill="none" stroke={secondary} strokeWidth="1.8" />
            <ellipse cx="16" cy="16" rx="2" ry="4.2" fill={primary} />
            <circle cx="16" cy="16" r="1.2" fill="#ffffff" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Crown of R'lyeh */}
          <path d="M8.5 20L10.5 10.5L13.5 15L16 8L18.5 15L21.5 10.5L23.5 20Z" fill={primary} stroke={secondary} strokeWidth="1.1" strokeLinejoin="round" />
          <circle cx="16" cy="16.5" r="2.1" fill={secondary} />
          <path d="M10 23C13 21.5 19 21.5 22 23" stroke={secondary} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      );
    }

    case 'celtic': {
      if (age === 1) {
        return (
          <g>
            {/* Standing Menhir & Triskelion */}
            <rect x="13" y="9" width="6" height="14.5" rx="2" fill={primary} />
            <circle cx="16" cy="14.5" r="1.8" fill={secondary} />
            <path d="M9.5 23.5H22.5" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Celtic Knotwork Triquetra Shield */}
            <path d="M16 9.5C19 13.5 19 18.5 16 22.5C13 18.5 13 13.5 16 9.5Z" fill="none" stroke={primary} strokeWidth="1.7" />
            <path d="M10.5 19.5C13 15 17 13 21.5 13.5C20 18 16 20 10.5 19.5Z" fill="none" stroke={secondary} strokeWidth="1.6" />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Stag Antlers & Spear of Lugh */}
            <path d="M14 16C10.5 14 9 11 9.5 8.5M11 12.5L8.5 11.5M18 16C21.5 14 23 11 22.5 8.5M21 12.5L23.5 11.5" stroke={secondary} strokeWidth="1.7" strokeLinecap="round" fill="none" />
            <path d="M16 7.5L18 13.5H14Z" fill={primary} />
            <line x1="16" y1="13.5" x2="16" y2="24" stroke={primary} strokeWidth="1.7" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Sacred Oak & Moon Crescent */}
            <circle cx="16" cy="13.5" r="5" fill={primary} opacity="0.88" />
            <rect x="14.8" y="17.5" width="2.4" height="6" fill={secondary} />
            <path d="M19.5 8.5A3.5 3.5 0 1 0 23 12A2.6 2.6 0 1 1 19.5 8.5Z" fill="#fef08a" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Sovereign Gold Torc Crown */}
          <path d="M11 19A6 6 0 1 1 21 19" fill="none" stroke={secondary} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="11" cy="19.5" r="1.8" fill={primary} />
          <circle cx="21" cy="19.5" r="1.8" fill={primary} />
          <circle cx="16" cy="13" r="2.2" fill={primary} />
        </g>
      );
    }

    case 'babylonian': {
      if (age === 1) {
        return (
          <g>
            {/* Cuneiform Clay Tablet */}
            <rect x="10.5" y="9.5" width="11" height="13.5" rx="1.8" fill={secondary} stroke={primary} strokeWidth="1.2" />
            <path d="M13 13H19M13 16H18M13 19H19" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Stepped Ziggurat Gate */}
            <rect x="8.5" y="19.5" width="15" height="3.5" fill={primary} />
            <rect x="10.8" y="15.5" width="10.4" height="4" fill={secondary} />
            <rect x="13" y="11" width="6" height="4.5" fill={primary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Winged Lamassu Emblem */}
            <path d="M8.5 14.5C11 10.5 14 11.5 16 14.5C18 11.5 21 10.5 23.5 14.5L21 19.5H11Z" fill={primary} />
            <circle cx="16" cy="12" r="2.2" fill={secondary} />
            <rect x="12" y="19.5" width="8" height="3.5" fill={secondary} />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic 8-Pointed Star of Ishtar */}
            <path d="M16 7.5L17.8 14.2L24.5 16L17.8 17.8L16 24.5L14.2 17.8L7.5 16L14.2 14.2Z" fill={secondary} />
            <path d="M10.5 10.5L15 15L10.5 21.5M21.5 10.5L17 15L21.5 21.5" stroke={primary} strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <circle cx="16" cy="16" r="2" fill="#ffffff" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Astral Crown of Marduk */}
          <path d="M9 22V13L12.5 16L16 9L19.5 16L23 13V22Z" fill={primary} stroke={secondary} strokeWidth="1" strokeLinejoin="round" />
          <circle cx="16" cy="16.5" r="2.3" fill={secondary} />
        </g>
      );
    }

    case 'lakota': {
      if (age === 1) {
        return (
          <g>
            {/* Tipi & Medicine Wheel */}
            <polygon points="16,8.5 22.5,23 9.5,23" fill={secondary} />
            <line x1="14" y1="7" x2="18" y2="11" stroke={primary} strokeWidth="1.4" strokeLinecap="round" />
            <line x1="18" y1="7" x2="14" y2="11" stroke={primary} strokeWidth="1.4" strokeLinecap="round" />
            <path d="M14.5 23L16 19L17.5 23Z" fill="#1e293b" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* War Shield & Eagle Feathers */}
            <circle cx="16" cy="14.5" r="5" fill={primary} stroke={secondary} strokeWidth="1.5" />
            <path d="M16 9.5V19.5M11 14.5H21" stroke="#1e293b" strokeWidth="1.1" />
            <path d="M13 19.5L11.5 24M16 19.5V24.5M19 19.5L20.5 24" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Sun Dance Eagle Staff */}
            <line x1="16" y1="8" x2="16" y2="24" stroke={secondary} strokeWidth="1.9" strokeLinecap="round" />
            <circle cx="16" cy="12" r="3.4" fill="none" stroke={primary} strokeWidth="1.7" />
            <path d="M12.5 16.5L10 21M19.5 16.5L22 21" stroke={primary} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Thunderbird Wings & Lightning */}
            <path d="M6.5 13.5L13 13.5L16 10.5L19 13.5L25.5 13.5L21 17.5H11Z" fill={primary} />
            <path d="M16 17.5L14 21.5H17L15 24.5" stroke={secondary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Sacred Spirit Hoop Halo */}
          <circle cx="16" cy="16" r="6" fill="none" stroke={secondary} strokeWidth="1.9" />
          <path d="M16 9.5V22.5M9.5 16H22.5" stroke={primary} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2.3" fill={primary} />
        </g>
      );
    }

    case 'jotunn': {
      if (age === 1) {
        return (
          <g>
            {/* Glacial Ice Shard */}
            <polygon points="16,7.5 21,15.5 18,23.5 14,23.5 11,15.5" fill={primary} stroke="#0f172a" strokeWidth="0.7" />
            <line x1="16" y1="8" x2="16" y2="23" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          </g>
        );
      }
      if (age === 2) {
        return (
          <g>
            {/* Giant Frost Battleaxe */}
            <line x1="10" y1="23.5" x2="21.5" y2="9.5" stroke={secondary} strokeWidth="1.9" strokeLinecap="round" />
            <path d="M14.5 10C18.5 9 22 12 22 16.5C19 16 16.5 14.5 14.5 10Z" fill={primary} />
          </g>
        );
      }
      if (age === 3) {
        return (
          <g>
            {/* Heroic Rimed Iceberg Citadel */}
            <polygon points="9,22.5 12.5,12 16,15 19.5,10 23,22.5" fill={primary} stroke="#0f172a" strokeWidth="0.7" />
            <path d="M11 22.5H21" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      }
      if (age === 4) {
        return (
          <g>
            {/* Mythic Surtr Flame & Niflheim Ice */}
            <path d="M12.5 22C9.5 19.5 9.5 15 13 11.5C13 14.5 15 15 16 10.5C19.5 13.5 21.5 18 19 22Z" fill={secondary} />
            <polygon points="16,13.5 18.5,18.5 16,22.5 13.5,18.5" fill={primary} />
          </g>
        );
      }
      return (
        <g>
          {/* Era V Crown of Ymir & Eternal Ice-Flame */}
          <path d="M8.5 20.5L11 10.5L14 15.5L16 8L18 15.5L21 10.5L23.5 20.5Z" fill={primary} stroke="#0f172a" strokeWidth="0.7" strokeLinejoin="round" />
          <circle cx="16" cy="17.5" r="2.2" fill={secondary} />
        </g>
      );
    }
  }
}

export const EraIcon: React.FC<EraIconProps> = ({
  age,
  pantheon = 'greek',
  size = 24,
  active = false,
  locked = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const theme = ERA_TIER_THEMES[age] ?? ERA_TIER_THEMES[1];
  const civTint = CIV_TINT_OVERRIDES[pantheon] ?? CIV_TINT_OVERRIDES.greek;

  const primary = locked ? '#64748b' : civTint.primary;
  const secondary = locked ? '#475569' : civTint.secondary;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none shrink-0 ${className}`}
      aria-label={`${AGE_NAMES[age]} — ${getEraSubtitle(age, pantheon)}`}
    >
      <defs>
        <linearGradient id={`erabg-${uid}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={locked ? '#1e293b' : theme.bgTop} />
          <stop offset="100%" stopColor={locked ? '#0f172a' : theme.bgBottom} />
        </linearGradient>
        <radialGradient id={`eraglow-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={locked ? '#334155' : theme.glow} stopOpacity={age >= 4 ? '0.45' : '0.26'} />
          <stop offset="100%" stopColor={theme.bgBottom} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Era V Celestial Starburst Rays */}
      {age === 5 && !locked && (
        <g stroke={theme.rimOuter} strokeWidth="1.2" strokeLinecap="round" opacity="0.85">
          <line x1="16" y1="0.8" x2="16" y2="3.4" />
          <line x1="16" y1="28.6" x2="16" y2="31.2" />
          <line x1="0.8" y1="16" x2="3.4" y2="16" />
          <line x1="28.6" y1="16" x2="31.2" y2="16" />
          <line x1="4.8" y1="4.8" x2="6.8" y2="6.8" />
          <line x1="27.2" y1="4.8" x2="25.2" y2="6.8" />
          <line x1="4.8" y1="27.2" x2="6.8" y2="25.2" />
          <line x1="27.2" y1="27.2" x2="25.2" y2="25.2" />
        </g>
      )}

      {/* Frame Silhouette by Era Tier */}
      {age === 1 && (
        <rect
          x="2.2"
          y="2.2"
          width="27.6"
          height="27.6"
          rx="6"
          fill={`url(#erabg-${uid})`}
          stroke={locked ? '#475569' : theme.rimOuter}
          strokeWidth="1.8"
        />
      )}
      {age === 2 && (
        <polygon
          points="9.5,2.2 22.5,2.2 29.8,9.5 29.8,22.5 22.5,29.8 9.5,29.8 2.2,22.5 2.2,9.5"
          fill={`url(#erabg-${uid})`}
          stroke={locked ? '#475569' : theme.rimOuter}
          strokeWidth="1.8"
        />
      )}
      {age === 3 && (
        <path
          d="M16 1.8L28.5 6.8V16.2C28.5 23.2 22.8 28 16 30.2C9.2 28 3.5 23.2 3.5 16.2V6.8L16 1.8Z"
          fill={`url(#erabg-${uid})`}
          stroke={locked ? '#475569' : theme.rimOuter}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
      {age === 4 && (
        <>
          <polygon
            points="16,1.6 26.2,5.8 30.4,16 26.2,26.2 16,30.4 5.8,26.2 1.6,16 5.8,5.8"
            fill={`url(#erabg-${uid})`}
            stroke={locked ? '#475569' : theme.rimOuter}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle
            cx="16"
            cy="16"
            r="11.2"
            stroke={locked ? '#475569' : theme.accentSecondary}
            strokeWidth="0.9"
            strokeDasharray="2.5 2"
          />
        </>
      )}
      {age === 5 && (
        <>
          <circle
            cx="16"
            cy="16"
            r="13.2"
            fill={`url(#erabg-${uid})`}
            stroke={locked ? '#475569' : theme.rimOuter}
            strokeWidth="2"
          />
          <circle
            cx="16"
            cy="16"
            r="10.8"
            stroke={locked ? '#475569' : theme.rimInner}
            strokeWidth="1"
            opacity="0.85"
          />
        </>
      )}

      {/* Inner radial radiance */}
      <circle cx="16" cy="15.5" r="11" fill={`url(#eraglow-${uid})`} />

      {/* Active highlight ring */}
      {active && !locked && (
        <circle cx="16" cy="16" r="14.5" stroke="#fde047" strokeWidth="1" opacity="0.7" />
      )}

      {/* Civilization + Era Emblem */}
      <g opacity={locked ? 0.55 : 1}>
        {renderCivMotif(age, pantheon, primary, secondary)}
      </g>

      {/* Roman Numeral Badge in Bottom-Right */}
      <rect
        x="20.5"
        y="22.5"
        width="10.2"
        height="8.2"
        rx="2.2"
        fill="#0b0e14"
        fillOpacity="0.9"
        stroke={locked ? '#475569' : theme.rimOuter}
        strokeWidth="0.9"
      />
      <text
        x="25.6"
        y="28.3"
        textAnchor="middle"
        fill={locked ? '#94a3b8' : theme.rimInner}
        fontSize="5.4"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {theme.roman}
      </text>
    </svg>
  );
};
