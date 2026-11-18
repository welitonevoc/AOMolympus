import React from 'react';
import { TechId } from '../game/types';

interface TechIconProps {
  techId: TechId;
  size?: number;
  className?: string;
}

type PaletteTheme = {
  bgTop: string;
  bgBottom: string;
  border: string;
  glow: string;
};

const THEMES: Record<string, PaletteTheme> = {
  copper: { bgTop: '#7c2d12', bgBottom: '#2b1006', border: '#d97706', glow: '#f59e0b' },
  bronze: { bgTop: '#92400e', bgBottom: '#2d1604', border: '#eab308', glow: '#fde047' },
  iron: { bgTop: '#334155', bgBottom: '#0f172a', border: '#94a3b8', glow: '#e2e8f0' },
  utility: { bgTop: '#0c4a6e', bgBottom: '#082032', border: '#38bdf8', glow: '#7dd3fc' },
  fire: { bgTop: '#991b1b', bgBottom: '#2a0808', border: '#f97316', glow: '#fdba74' },
  ares: { bgTop: '#7f1d1d', bgBottom: '#220609', border: '#ef4444', glow: '#fca5a5' },
  athena: { bgTop: '#1e3a8a', bgBottom: '#0b1536', border: '#60a5fa', glow: '#fde047' },
  apollo: { bgTop: '#854d0e', bgBottom: '#2c1704', border: '#facc15', glow: '#fef08a' },
  artemis: { bgTop: '#14532d', bgBottom: '#051f10', border: '#4ade80', glow: '#86efac' },
  hephaestus: { bgTop: '#7c2d12', bgBottom: '#240a04', border: '#fb923c', glow: '#fde047' },
  economy: { bgTop: '#3f3f1d', bgBottom: '#161a0b', border: '#a3e635', glow: '#d9f99d' },
  military: { bgTop: '#3b1d4a', bgBottom: '#14091d', border: '#c084fc', glow: '#e9d5ff' },
  temple: { bgTop: '#4c1d95', bgBottom: '#170a33', border: '#d4af37', glow: '#fef08a' },
};

function getTechTheme(techId: TechId): PaletteTheme {
  switch (techId) {
    case 'copper_weapons':
    case 'copper_mail':
    case 'copper_shields':
      return THEMES.copper;
    case 'bronze_weapons':
    case 'bronze_mail':
    case 'bronze_shields':
      return THEMES.bronze;
    case 'iron_weapons':
    case 'iron_mail':
    case 'iron_shields':
      return THEMES.iron;
    case 'ballistics':
      return THEMES.utility;
    case 'burning_pitch':
      return THEMES.fire;
    case 'phobos_spear_of_horror':
    case 'deimos_sword_of_dread':
    case 'enyo_bow_of_horror':
      return THEMES.ares;
    case 'sarissa':
    case 'aegis_shield':
      return THEMES.athena;
    case 'sun_ray':
      return THEMES.apollo;
    case 'shafts_of_plague':
      return THEMES.artemis;
    case 'forge_of_olympus':
    case 'olympian_weapons':
      return THEMES.hephaestus;
    case 'hand_axe':
    case 'pickaxe':
    case 'plow':
    case 'hunting_dogs':
    case 'husbandry':
      return THEMES.economy;
    case 'watch_tower':
    case 'engineers':
      return THEMES.bronze;
    case 'medium_soldiers':
    case 'heavy_soldiers':
    case 'champion_soldiers':
      return THEMES.military;
    case 'omniscience':
    case 'mythic_rejuvenation':
    case 'secrets_of_titans':
    case 'perception':
    case 'horns_of_consecration':
      return THEMES.temple;
    case 'golden_apples':
      return THEMES.apollo;
    case 'necropolis':
      return THEMES.military;
    case 'hammer_of_the_gods':
      return THEMES.hephaestus;
  }
}

function renderArtwork(techId: TechId) {
  switch (techId) {
    // ── ARMAS (Copper / Bronze / Iron Weapons) ──
    case 'copper_weapons':
      return (
        <g>
          {/* Single broad copper short-sword + warm glints */}
          <path d="M10 22 L21 11" stroke="#fb923c" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M20 12 L24.5 7.5 L21.5 13.5 Z" fill="#fdba74" />
          <path d="M12.5 16.5 L16 20" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M7.5 24.5 L11.5 20.5" stroke="#92400e" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="7.5" cy="24.5" r="1.4" fill="#f59e0b" />
        </g>
      );

    case 'bronze_weapons':
      return (
        <g>
          {/* Crossed bronze blade & spear tip */}
          <path d="M8 24 L23 9" stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M21 8 L25.5 6.5 L24 11 Z" fill="#fef08a" />
          <path d="M9 9 L23 23" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M7.5 7.5 L12 8.5 L8.5 12 Z" fill="#fde68a" />
          <path d="M11 19 L14 22" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    case 'iron_weapons':
      return (
        <g>
          {/* Heavy double-edged steel sword + glowing temper edge */}
          <path d="M8 24 L24 8" stroke="#cbd5e1" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M9.5 22.5 L24 8" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M21.5 7 L26 6 L25 10.5 Z" fill="#ffffff" />
          <path d="M11 16.5 L15.5 21" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="7.5" cy="24.5" r="1.7" fill="#38bdf8" />
          <circle cx="24.5" cy="18" r="1" fill="#e2e8f0" />
          <circle cx="13" cy="8.5" r="1" fill="#e2e8f0" />
        </g>
      );

    // ── ARMADURAS (Copper / Bronze / Iron Mail) ──
    case 'copper_mail':
      return (
        <g>
          {/* Copper cuirass breastplate */}
          <path
            d="M10 8 L13.5 7 L16 9.5 L18.5 7 L22 8 L23.5 13 L21.5 15 L21 24 L11 24 L10.5 15 L8.5 13 Z"
            fill="#d97706"
            stroke="#fed7aa"
            strokeWidth="1.3"
          />
          <path d="M16 10.5 V23" stroke="#7c2d12" strokeWidth="1.2" />
          <path d="M12 14.5 Q16 16.5 20 14.5" fill="none" stroke="#fde68a" strokeWidth="1.1" />
        </g>
      );

    case 'bronze_mail':
      return (
        <g>
          {/* Sculpted bronze muscle cuirass with shoulder pauldrons */}
          <path
            d="M7.5 10 L12 6.5 L16 9 L20 6.5 L24.5 10 L23 15 L21 15.5 L20.5 24.5 L11.5 24.5 L11 15.5 L9 15 Z"
            fill="#eab308"
            stroke="#fef9c3"
            strokeWidth="1.3"
          />
          <path d="M12.5 13.5 Q16 15.5 19.5 13.5" fill="none" stroke="#78350f" strokeWidth="1.2" />
          <path d="M12.5 18.5 Q16 20 19.5 18.5" fill="none" stroke="#78350f" strokeWidth="1.2" />
          <path d="M16 9.5 V23.5" stroke="#92400e" strokeWidth="1.2" />
        </g>
      );

    case 'iron_mail':
      return (
        <g>
          {/* Heavy layered steel plate armor + rivets */}
          <path
            d="M7 10.5 L12 6.5 L16 8.5 L20 6.5 L25 10.5 L23.5 15.5 L21.5 16 L21 25 L11 25 L10.5 16 L8.5 15.5 Z"
            fill="#94a3b8"
            stroke="#f8fafc"
            strokeWidth="1.3"
          />
          <path d="M11.5 13.5 H20.5 M11.5 17.5 H20.5 M11.5 21.5 H20.5" stroke="#1e293b" strokeWidth="1.3" />
          <circle cx="16" cy="11.5" r="1.4" fill="#38bdf8" />
        </g>
      );

    // ── ESCUDOS (Copper / Bronze / Iron Shields) ──
    case 'copper_shields':
      return (
        <g>
          <circle cx="16" cy="16" r="9" fill="#b45309" stroke="#fdba74" strokeWidth="2" />
          <circle cx="16" cy="16" r="3" fill="#fbbf24" />
        </g>
      );

    case 'bronze_shields':
      return (
        <g>
          <circle cx="16" cy="16" r="9.2" fill="#ca8a04" stroke="#fef08a" strokeWidth="2.2" />
          <circle cx="16" cy="16" r="5.5" fill="none" stroke="#78350f" strokeWidth="1.2" />
          <path d="M16 11 L18.5 16 L16 21 L13.5 16 Z" fill="#fef3c7" />
        </g>
      );

    case 'iron_shields':
      return (
        <g>
          {/* Kite / Hoplon iron tower shield with central steel cross & boss */}
          <path
            d="M8.5 7.5 H23.5 V16 C23.5 21.5 16 25.5 16 25.5 C16 25.5 8.5 21.5 8.5 16 Z"
            fill="#64748b"
            stroke="#f1f5f9"
            strokeWidth="1.7"
          />
          <path d="M16 9 V23.5 M10 15 H22" stroke="#cbd5e1" strokeWidth="1.4" />
          <circle cx="16" cy="15" r="2.2" fill="#38bdf8" stroke="#f8fafc" strokeWidth="1" />
        </g>
      );

    // ── UTILITÁRIOS DE COMBATE ──
    case 'ballistics':
      return (
        <g>
          {/* Crosshair reticle + twin speeding bolts */}
          <circle cx="17" cy="15" r="7.5" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="3 2" />
          <path d="M17 5.5 V9 M17 21 V24.5 M7.5 15 H11 M23 15 H26.5" stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 23 L21 11" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 10 L23 9.5 L21.5 13.5 Z" fill="#fef08a" />
          <path d="M10 25 L23 15" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case 'burning_pitch':
      return (
        <g>
          {/* Flaming arrow & burning pitch cauldron */}
          <path d="M8 24 L21 11" stroke="#fdba74" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M19 9.5 L24.5 7.5 L22.5 13 Z" fill="#fef08a" />
          <path
            d="M19 6 C22 5.5 25 8 24 12 C27 12.5 26 17 21.5 16.5 C20 13.5 17 11 19 6 Z"
            fill="#f97316"
            opacity="0.92"
          />
          <path d="M9 21 Q13 25.5 19 23.5" fill="none" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="11" r="1.4" fill="#fde047" />
          <circle cx="24" cy="21" r="1.2" fill="#f97316" />
        </g>
      );

    // ── ARES (Era Clássica) ──
    case 'phobos_spear_of_horror':
      return (
        <g>
          {/* Jagged Spear of Phobos + crimson dread aura */}
          <path d="M7 25 L22 10" stroke="#fca5a5" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M18.5 9 L26 6 L23 13.5 L21 11 Z" fill="#fef2f2" stroke="#ef4444" strokeWidth="1" />
          <path d="M14 9 Q10 12 11 16" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M23 18 Q20 22 16 21" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case 'deimos_sword_of_dread':
      return (
        <g>
          {/* Curved Greek Kopis sword of Deimos with crimson edge */}
          <path
            d="M8.5 23.5 L13.5 18.5 C16.5 15.5 19 10 24.5 7.5 C23.5 12.5 20.5 17 16.5 20.5 L11 25 Z"
            fill="#fecaca"
            stroke="#ef4444"
            strokeWidth="1.2"
          />
          <path d="M8 22 L12.5 25.5" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="11" r="1.3" fill="#f87171" />
          <circle cx="22.5" cy="20" r="1.3" fill="#f87171" />
        </g>
      );

    case 'enyo_bow_of_horror':
      return (
        <g>
          {/* Warbow of Enyo with barbed crimson arrow */}
          <path d="M11 7 C19.5 9.5 19.5 22.5 11 25" fill="none" stroke="#f87171" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="11" y1="7" x2="11" y2="25" stroke="#fecaca" strokeWidth="1" />
          <line x1="8" y1="16" x2="24.5" y2="16" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 13.5 L26.5 16 L22 18.5 Z" fill="#ef4444" stroke="#fef2f2" strokeWidth="0.7" />
        </g>
      );

    // ── ATENA (Era Clássica) ──
    case 'sarissa':
      return (
        <g>
          {/* Extra-long Macedonian Sarissa pike + olive branch */}
          <path d="M5.5 26.5 L25.5 6.5" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
          <path d="M23 6 L27 5 L26 9 Z" fill="#e0f2fe" />
          <path d="M5 24 L8 27" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M11 9.5 C13 7.5 15.5 7.5 17 9" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M19 22 C21 20.5 23.5 19 24.5 16.5" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case 'aegis_shield':
      return (
        <g>
          {/* Ornate Aegis shield with golden Gorgoneion sun crest */}
          <circle cx="16" cy="16" r="9.5" fill="#1d4ed8" stroke="#facc15" strokeWidth="2.1" />
          <circle cx="16" cy="16" r="5" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.1" />
          <path d="M16 11.5 L17.4 14.6 L20.5 16 L17.4 17.4 L16 20.5 L14.6 17.4 L11.5 16 L14.6 14.6 Z" fill="#fde047" />
        </g>
      );

    // ── APOLO (Era Heroica) ──
    case 'sun_ray':
      return (
        <g>
          {/* Radiant sun disc + piercing golden arrow */}
          <circle cx="15" cy="16" r="5.5" fill="#facc15" stroke="#fef9c3" strokeWidth="1.2" />
          <path
            d="M15 6.5 V9 M15 23 V25.5 M5.5 16 H8 M22 16 H24.5 M8.5 9.5 L10.3 11.3 M19.7 20.7 L21.5 22.5 M21.5 9.5 L19.7 11.3 M10.3 20.7 L8.5 22.5"
            stroke="#fde047"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d="M10 22 L25 9" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M22 8.5 L26.5 7.8 L24.8 12 Z" fill="#fef08a" />
        </g>
      );

    // ── ÁRTEMIS (Era Mítica) ──
    case 'shafts_of_plague':
      return (
        <g>
          {/* Three venom-tipped arrows + glowing poison drops + crescent */}
          <path d="M7 23 L21 9" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 25 L25 11" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <path d="M19.5 8 L23 7.5 L22 11 Z" fill="#bef264" />
          <path d="M23.5 10 L27 9.5 L26 13 Z" fill="#bef264" />
          <path d="M9 11 C7 11 7 15 9.5 15.5 C8.3 14.2 8.3 12.3 9 11 Z" fill="#fde047" />
          <circle cx="22" cy="21.5" r="2.2" fill="#84cc16" />
          <path d="M22 17.5 L23.8 21.5 L20.2 21.5 Z" fill="#84cc16" />
        </g>
      );

    // ── HEFESTO (Era Mítica) ──
    case 'forge_of_olympus':
      return (
        <g>
          {/* Volcanic anvil + blacksmith hammer + sparks */}
          <path d="M8 17 H24 L22 21 H19 L21 25 H11 L13 21 H10 Z" fill="#9ca3af" stroke="#fde68a" strokeWidth="1.1" />
          <path d="M11 10 L17 7 L20 11 L14 14 Z" fill="#f97316" stroke="#fef08a" strokeWidth="1" />
          <path d="M17 12 L23 18" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="9.5" cy="13.5" r="1.2" fill="#fde047" />
          <circle cx="23.5" cy="9" r="1.2" fill="#fb923c" />
        </g>
      );

    case 'olympian_weapons':
      return (
        <g>
          {/* Radiant golden Olympian halberd/sword + lightning laurel */}
          <path d="M8 24 L24 8" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
          <path d="M21 7 L26.5 5.5 L25 11 Z" fill="#ffffff" />
          <path d="M12 10 L16 14 L13 16 L17 20" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 22 C21.5 22 24 19.5 24 16" fill="none" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );

    // ── TECNOLOGIAS GERAIS & ECONÔMICAS ──
    case 'hand_axe':
      return (
        <g>
          <path d="M9 24 L21 10" stroke="#d97706" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M17 8 C22 7 25 10 23 15 L18 12 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        </g>
      );

    case 'pickaxe':
      return (
        <g>
          <path d="M10 24 L22 12" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M11 9 C16 7 22 10 24 16" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <circle cx="22.5" cy="22" r="2.2" fill="#facc15" />
        </g>
      );

    case 'plow':
      return (
        <g>
          <path d="M7 22 H24" stroke="#84cc16" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M9 12 L18 21 L23 17" fill="none" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="20" r="2.6" fill="none" stroke="#d97706" strokeWidth="2" />
        </g>
      );

    case 'hunting_dogs':
      return (
        <g>
          {/* Hunting spear & swift hound silhouette */}
          <path d="M7 25 L24 8" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M21.5 7.5 L26 6.5 L24.5 11 Z" fill="#f8fafc" />
          <path d="M9 18 C11 14 16 14 18 16.5 L21 15 L22 18 L18.5 19.5 L17 24 H14.5 L15 20 H11.5 L10 24 H8 Z" fill="#d97706" stroke="#fef3c7" strokeWidth="0.9" />
        </g>
      );

    case 'husbandry':
      return (
        <g>
          {/* Horned herd animal & pasture */}
          <path d="M7 24 H25" stroke="#84cc16" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10 12 C9 9 11.5 8 13 10.5 H19 C20.5 8 23 9 22 12 L21 19 H11 Z" fill="#e7dac3" stroke="#78350f" strokeWidth="1.2" />
          <circle cx="14" cy="14" r="1.1" fill="#451a03" />
          <circle cx="18" cy="14" r="1.1" fill="#451a03" />
          <path d="M14 17 H18" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );

    case 'watch_tower':
      return (
        <g>
          <path d="M11 25 L12.5 11 H19.5 L21 25 Z" fill="#d97706" stroke="#fef3c7" strokeWidth="1.2" />
          <path d="M10 11 V8 H13 V10 H15 V8 H17 V10 H19 V8 H22 V11 Z" fill="#f59e0b" />
          <rect x="14.5" y="14" width="3" height="4" rx="1" fill="#1e293b" />
        </g>
      );

    case 'medium_soldiers':
      return (
        <g>
          {/* Bronze Corinthian Helmet */}
          <path d="M9 21 C9 12 12 8.5 16.5 8.5 C21 8.5 23 12 23 17 L19.5 17 V22.5 H14 L13 18 H9 Z" fill="#d97706" stroke="#fde68a" strokeWidth="1.2" />
          <path d="M14 7.5 C16 5.5 20 6 22 9" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );

    case 'heavy_soldiers':
      return (
        <g>
          {/* Crested Silver-Gold Helmet */}
          <path d="M9 21.5 C9 12 12 8.5 16.5 8.5 C21 8.5 23 12 23 17.5 L19.5 17.5 V23 H14 L13 18.5 H9 Z" fill="#cbd5e1" stroke="#facc15" strokeWidth="1.3" />
          <path d="M12 7 C16 4 21 5.5 23.5 10" fill="none" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      );

    case 'champion_soldiers':
      return (
        <g>
          {/* Royal Gold Winged Champion Crest */}
          <path d="M9.5 22 C9.5 12.5 12.5 9 16.5 9 C20.5 9 22.5 12.5 22.5 17.5 L19.5 17.5 V23 H14 L13 18.5 H9.5 Z" fill="#facc15" stroke="#fef9c3" strokeWidth="1.3" />
          <path d="M11 7.5 C15.5 3.5 22 5 24.5 11" fill="none" stroke="#c084fc" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="16.5" cy="14" r="1.4" fill="#ef4444" />
        </g>
      );

    case 'engineers':
      return (
        <g>
          {/* Gear + catapult wheel */}
          <circle cx="16" cy="16" r="6.5" fill="none" stroke="#fbbf24" strokeWidth="2.4" />
          <path d="M16 7 V11 M16 21 V25 M7 16 H11 M21 16 H25" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2.2" fill="#f97316" />
        </g>
      );

    case 'omniscience':
      return (
        <g>
          {/* All-seeing mythic eye */}
          <path d="M6.5 16 Q16 8.5 25.5 16 Q16 23.5 6.5 16 Z" fill="#312e81" stroke="#c084fc" strokeWidth="1.7" />
          <circle cx="16" cy="16" r="3.4" fill="#38bdf8" />
          <circle cx="16" cy="16" r="1.5" fill="#fef08a" />
        </g>
      );

    case 'mythic_rejuvenation':
      return (
        <g>
          {/* Radiant Olympic torch / chalice flame */}
          <path d="M12 24 H20 L18.5 16 H13.5 Z" fill="#d4af37" />
          <path d="M16 6 C19.5 9 20.5 13 16 16 C11.5 13 12.5 9 16 6 Z" fill="#38bdf8" stroke="#fef08a" strokeWidth="1" />
        </g>
      );

    case 'secrets_of_titans':
      return (
        <g>
          {/* Titan Portal Starburst */}
          <circle cx="16" cy="16" r="8.5" fill="none" stroke="#facc15" strokeWidth="1.6" strokeDasharray="3 2" />
          <path d="M16 6.5 L18.5 13.5 L25.5 16 L18.5 18.5 L16 25.5 L13.5 18.5 L6.5 16 L13.5 13.5 Z" fill="#facc15" stroke="#fffbeb" strokeWidth="1" />
        </g>
      );

    // ── TECNOLOGIAS DE FAVOR DIVINO ──
    case 'golden_apples':
      return (
        <g>
          {/* Maçã Dourada de Afrodite com folha esmeralda */}
          <path d="M16 10.5 C12.5 10.5 9.5 13 9.5 17.5 C9.5 22 12.5 25.5 16 25 C19.5 25.5 22.5 22 22.5 17.5 C22.5 13 19.5 10.5 16 10.5 Z" fill="#facc15" stroke="#fef9c3" strokeWidth="1.3" />
          <path d="M16 10.5 C16 8.5 17 7 18.5 6.5" fill="none" stroke="#a16207" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16.5 9.5 C19 7.5 22 8 22.5 10.5 C20 11 18 10.8 16.5 9.5 Z" fill="#4ade80" />
          <circle cx="13.5" cy="15" r="1.4" fill="#fef08a" />
        </g>
      );

    case 'necropolis':
      return (
        <g>
          {/* Obelisco e Ankh Dourado de Anúbis */}
          <path d="M16 5.5 L19.5 11 L20.5 25.5 H11.5 L12.5 11 Z" fill="#6b21a8" stroke="#facc15" strokeWidth="1.3" />
          <circle cx="16" cy="14" r="2.2" fill="none" stroke="#fde047" strokeWidth="1.4" />
          <path d="M16 16.2 V22.5 M13.5 18.5 H18.5" stroke="#fde047" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );

    case 'hammer_of_the_gods':
      return (
        <g>
          {/* Mjölnir — Martelo de Thor com faíscas elétricas */}
          <path d="M16 15 V26" stroke="#b45309" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M9.5 8.5 H22.5 L24 12.5 L22.5 15.5 H9.5 L8 12.5 Z" fill="#cbd5e1" stroke="#38bdf8" strokeWidth="1.3" />
          <path d="M7 10 L10 7 M25 10 L22 7 M23.5 20 L26 23" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case 'perception':
      return (
        <g>
          {/* Olho do Oráculo com anéis de visão */}
          <circle cx="16" cy="16" r="9.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2.5 2" />
          <path d="M8 16 Q16 10 24 16 Q16 22 8 16 Z" fill="#0e7490" stroke="#7dd3fc" strokeWidth="1.4" />
          <circle cx="16" cy="16" r="2.6" fill="#fef08a" />
        </g>
      );

    case 'horns_of_consecration':
      return (
        <g>
          {/* Chifres Atlantes da Consagração com chama sagrada */}
          <path d="M7.5 10 C7.5 21 12 24.5 16 24.5 C20 24.5 24.5 21 24.5 10 C22.5 16 20 19.5 16 19.5 C12 19.5 9.5 16 7.5 10 Z" fill="#d4af37" stroke="#fef3c7" strokeWidth="1.2" />
          <path d="M16 7.5 C18.5 10.5 19 13.5 16 16 C13 13.5 13.5 10.5 16 7.5 Z" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="0.9" />
        </g>
      );
  }
}

export const TechIcon: React.FC<TechIconProps> = ({ techId, size = 28, className = '' }) => {
  const theme = getTechTheme(techId);
  const gradId = `tech-grad-${techId}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={`shrink-0 rounded border shadow-inner ${className}`}
      style={{ borderColor: theme.border }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.bgTop} />
          <stop offset="100%" stopColor={theme.bgBottom} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="32" height="32" rx="4" fill={`url(#${gradId})`} />
      <rect x="1.5" y="1.5" width="29" height="29" rx="3" fill="none" stroke={theme.glow} strokeOpacity="0.22" strokeWidth="1" />
      {renderArtwork(techId)}
    </svg>
  );
};
