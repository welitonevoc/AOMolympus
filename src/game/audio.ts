import { AgeLevel, GodPowerId, PantheonId, UnitKind, UnitVoiceAction, UnitVoiceLineInfo } from './types';

export type MusicMood = 'standard' | 'mellow';
export type MusicScene = 'title' | 'match' | 'victory' | 'defeat' | 'credits';

export interface MusicTrackSpec {
  id: string;
  title: string;
  category: 'state' | 'civilization' | 'match';
  subtitle: string;
  pantheon?: PantheonId;
  bpm: number;
  rootHz: number;
  scale: number[];
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  percussionStyle: 'orchestral' | 'nile' | 'nordic' | 'mystic' | 'eastern' | 'light';
  melody: number[];
  arp: number[];
  bass: number[];
}

export const MUSIC_TRACKS: Record<string, MusicTrackSpec> = {
  // Temas de Estado do Jogo
  cat_mittens: {
    id: 'cat_mittens',
    title: 'A Cat Named Mittens',
    category: 'state',
    subtitle: 'Tema Principal — Abertura Mitológica',
    bpm: 98,
    rootHz: 220.0,
    scale: [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'light',
    melody: [4, -1, 5, 7, 6, -1, 4, 2, 3, -1, 4, 5, 4, 2, 0, -1],
    arp: [0, 2, 4, 7, 4, 2, 0, 4, 1, 3, 5, 7, 5, 3, 2, 0],
    bass: [0, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1, 4, -1, 0, -1],
  },
  doorknob: {
    id: 'doorknob',
    title: 'If You Can Use a Doorknob',
    category: 'state',
    subtitle: 'Tema de Vitória — Triunfo dos Deuses',
    bpm: 120,
    rootHz: 261.63,
    scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19],
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    percussionStyle: 'orchestral',
    melody: [0, 2, 4, -1, 7, -1, 7, 9, 7, 5, 4, 5, 7, -1, 9, 7],
    arp: [0, 4, 7, 9, 7, 4, 0, 4, 2, 5, 7, 11, 9, 7, 4, 7],
    bass: [0, -1, 0, -1, 4, -1, 4, -1, 3, -1, 4, -1, 0, -1, 4, -1],
  },
  other_sunset: {
    id: 'other_sunset',
    title: "Ma'am... Some Other Sunset",
    category: 'state',
    subtitle: 'Tema de Derrota — Crepúsculo Melancólico',
    bpm: 74,
    rootHz: 196.0,
    scale: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19],
    leadWave: 'sine',
    bassWave: 'sine',
    percussionStyle: 'light',
    melody: [4, -1, 3, 2, 0, -1, -1, 2, 3, -1, 2, 1, 0, -1, -1, -1],
    arp: [0, -1, 4, -1, 2, -1, 4, -1, 1, -1, 5, -1, 0, -1, -1, -1],
    bass: [0, -1, -1, -1, 3, -1, -1, -1, 4, -1, -1, -1, 0, -1, -1, -1],
  },
  garys_reserve: {
    id: 'garys_reserve',
    title: "Gary's Reserve",
    category: 'state',
    subtitle: 'Créditos Finais — Epílogo do Olimpo',
    bpm: 84,
    rootHz: 246.94,
    scale: [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'light',
    melody: [0, 2, 4, -1, 6, 4, 2, -1, 4, 5, 7, -1, 6, 4, 2, 0],
    arp: [0, 4, 7, 4, 2, 6, 7, 4, 0, 4, 7, 9, 7, 4, 2, 0],
    bass: [0, -1, -1, 0, 4, -1, -1, 4, 2, -1, -1, 2, 4, -1, 0, -1],
  },

  // Temas Exclusivos por Civilização
  greek_to_me: {
    id: 'greek_to_me',
    title: 'Greek to Me',
    category: 'civilization',
    pantheon: 'greek',
    subtitle: 'Tema Grego — Orquestral Épico Mediterrâneo',
    bpm: 112,
    rootHz: 220.0,
    scale: [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19],
    leadWave: 'triangle',
    bassWave: 'triangle',
    percussionStyle: 'orchestral',
    melody: [0, 4, 5, 4, 2, 3, 4, -1, 7, 5, 4, 2, 3, 2, 0, -1],
    arp: [0, 2, 4, 7, 4, 2, 0, 4, 0, 3, 5, 7, 5, 3, 2, 0],
    bass: [0, -1, 0, 4, 2, -1, 2, 4, 3, -1, 4, -1, 0, -1, 4, -1],
  },
  nd_nile: {
    id: 'nd_nile',
    title: 'N. D. Nile',
    category: 'civilization',
    pantheon: 'egyptian',
    subtitle: 'Tema Egípcio — Cordas e Percussão do Nilo',
    bpm: 108,
    rootHz: 207.65,
    scale: [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19],
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    percussionStyle: 'nile',
    melody: [0, 1, 4, 5, 4, 1, 0, -1, 7, 5, 4, 5, 4, 1, 0, -1],
    arp: [0, 4, 5, 7, 5, 4, 1, 0, 0, 4, 7, 8, 7, 4, 1, 0],
    bass: [0, -1, 0, -1, 1, -1, 0, -1, 4, -1, 1, -1, 0, -1, 0, -1],
  },
  of_norse_not: {
    id: 'of_norse_not',
    title: 'Of Norse Not!',
    category: 'civilization',
    pantheon: 'norse',
    subtitle: 'Tema Nórdico — Metais Pesados e Tambores de Midgard',
    bpm: 104,
    rootHz: 164.81,
    scale: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 19],
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
    percussionStyle: 'nordic',
    melody: [0, -1, 3, 4, 5, -1, 4, 2, 0, 2, 3, -1, 4, 3, 2, 0],
    arp: [0, 4, 7, 4, 0, 3, 7, 3, 0, 5, 7, 5, 2, 4, 0, -1],
    bass: [0, 0, -1, 0, 3, -1, 2, -1, 0, 0, -1, 0, 4, -1, 2, -1],
  },
  hotlantis: {
    id: 'hotlantis',
    title: 'Hotlantis',
    category: 'civilization',
    pantheon: 'atlantean',
    subtitle: 'Tema Atlante (The Titans) — Atmosfera Mística de Oricalco',
    bpm: 110,
    rootHz: 246.94,
    scale: [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'mystic',
    melody: [0, 3, 4, 7, 6, 4, 2, -1, 4, 6, 7, 9, 7, 4, 3, 0],
    arp: [0, 4, 6, 7, 9, 7, 6, 4, 2, 4, 7, 9, 11, 9, 7, 4],
    bass: [0, -1, -1, 4, 3, -1, 2, -1, 0, -1, 4, -1, 5, -1, 4, -1],
  },
  kuafu_panda: {
    id: 'kuafu_panda',
    title: 'Kuafu Panda',
    category: 'civilization',
    pantheon: 'chinese',
    subtitle: 'Tema Chinês — Pentatônica Imperial e Guzheng',
    bpm: 106,
    rootHz: 261.63,
    scale: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'eastern',
    melody: [0, 2, 4, -1, 7, 5, 4, 2, 3, 4, 5, -1, 4, 2, 0, -1],
    arp: [0, 3, 4, 7, 5, 4, 3, 0, 2, 4, 5, 7, 5, 4, 2, 0],
    bass: [0, -1, 3, -1, 4, -1, 0, -1, 2, -1, 4, -1, 0, -1, 3, -1],
  },
  nori_grets: {
    id: 'nori_grets',
    title: 'Nori Grets',
    category: 'civilization',
    pantheon: 'japanese',
    subtitle: 'Tema Japonês — Koto, Sopro e Taiko',
    bpm: 104,
    rootHz: 246.94,
    scale: [0, 1, 5, 7, 8, 12, 13, 17, 19, 20],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'eastern',
    melody: [0, 1, 2, -1, 3, 4, 3, 2, 1, 0, 2, -1, 3, 2, 1, 0],
    arp: [0, 2, 3, 5, 4, 3, 2, 0, 1, 2, 3, 4, 3, 2, 1, 0],
    bass: [0, -1, -1, 2, 3, -1, 2, -1, 0, -1, 1, -1, 2, -1, 0, -1],
  },
  aztec_sun: {
    id: 'aztec_sun',
    title: 'Sol de Tenochtitlán',
    category: 'civilization',
    pantheon: 'aztec',
    subtitle: 'Tema Asteca — Tambores Solares e Flauta Mexica',
    bpm: 112,
    rootHz: 233.08,
    scale: [0, 3, 5, 7, 10, 12, 15, 17, 19],
    leadWave: 'triangle',
    bassWave: 'triangle',
    percussionStyle: 'nile',
    melody: [0, 2, 3, 4, 3, 2, 0, -1, 4, 3, 2, 1, 2, 1, 0, -1],
    arp: [0, 2, 4, 2, 0, 3, 4, 2, 0, 1, 3, 4, 3, 2, 1, 0],
    bass: [0, -1, 0, 2, 3, -1, 2, -1, 0, -1, 3, -1, 4, -1, 2, -1],
  },
  roman_legion: {
    id: 'roman_legion',
    title: 'Glória da Legião',
    category: 'civilization',
    pantheon: 'roman',
    subtitle: 'Tema Romano — Fanfarra Imperial de Bronze',
    bpm: 114,
    rootHz: 220.0,
    scale: [0, 2, 4, 5, 7, 9, 10, 12, 14, 16, 19],
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    percussionStyle: 'orchestral',
    melody: [0, 4, 4, 5, 7, -1, 5, 4, 2, 4, 5, 4, 2, 0, -1, -1],
    arp: [0, 2, 4, 7, 4, 2, 0, 4, 1, 3, 5, 7, 5, 3, 2, 0],
    bass: [0, -1, 0, -1, 4, -1, 2, -1, 3, -1, 4, -1, 0, -1, 4, -1],
  },
  eldritch_abyss: {
    id: 'eldritch_abyss',
    title: 'Ecos do Abismo',
    category: 'civilization',
    pantheon: 'eldritch',
    subtitle: 'Tema Eldritch — Ressonância Cósmica Sombria',
    bpm: 88,
    rootHz: 146.83,
    scale: [0, 1, 4, 6, 7, 8, 11, 12, 13, 18],
    leadWave: 'sine',
    bassWave: 'sawtooth',
    percussionStyle: 'mystic',
    melody: [0, -1, 1, 3, 4, -1, 6, 4, 3, -1, 1, 0, 4, 3, 1, -1],
    arp: [0, 3, 4, 6, 4, 3, 1, 0, 0, 2, 4, 7, 6, 3, 1, 0],
    bass: [0, -1, -1, 1, 3, -1, -1, 2, 0, -1, 4, -1, 1, -1, 0, -1],
  },
  celtic_mist: {
    id: 'celtic_mist',
    title: 'Brumas de Tuatha',
    category: 'civilization',
    pantheon: 'celtic',
    subtitle: 'Tema Celta — Harpa das Terras Altas',
    bpm: 106,
    rootHz: 220.0,
    scale: [0, 2, 3, 5, 7, 9, 10, 12, 14, 17],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'light',
    melody: [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 7, 5, 4, 2, 0],
    arp: [0, 4, 7, 4, 2, 5, 7, 5, 0, 3, 7, 4, 2, 4, 5, 0],
    bass: [0, -1, 2, -1, 4, -1, 3, -1, 0, -1, 4, -1, 2, -1, 0, -1],
  },
  babylon_ziggurat: {
    id: 'babylon_ziggurat',
    title: 'Zigurates do Eufrates',
    category: 'civilization',
    pantheon: 'babylonian',
    subtitle: 'Tema Babilônico — Percussão Real da Mesopotâmia',
    bpm: 105,
    rootHz: 196.0,
    scale: [0, 1, 4, 5, 7, 8, 11, 12, 13, 16],
    leadWave: 'triangle',
    bassWave: 'triangle',
    percussionStyle: 'nile',
    melody: [0, 1, 4, 5, 7, 5, 4, 1, 0, 4, 5, 4, 2, 1, 0, -1],
    arp: [0, 4, 5, 7, 5, 4, 2, 0, 1, 4, 7, 8, 7, 4, 1, 0],
    bass: [0, -1, 0, 1, 4, -1, 1, -1, 0, -1, 4, -1, 5, -1, 1, -1],
  },
  lakota_wind: {
    id: 'lakota_wind',
    title: 'Ventos da Planície',
    category: 'civilization',
    pantheon: 'lakota',
    subtitle: 'Tema Lakota — Flauta Nativa e Tambor da Terra',
    bpm: 102,
    rootHz: 220.0,
    scale: [0, 3, 5, 7, 10, 12, 15, 17, 19],
    leadWave: 'sine',
    bassWave: 'triangle',
    percussionStyle: 'light',
    melody: [4, -1, 3, 2, 0, -1, 2, 3, 4, 5, 4, 2, 1, 2, 0, -1],
    arp: [0, 2, 4, 5, 4, 2, 0, 2, 0, 3, 4, 5, 4, 3, 2, 0],
    bass: [0, -1, 0, -1, 2, -1, 0, -1, 3, -1, 2, -1, 0, -1, 0, -1],
  },
  jotunn_frost: {
    id: 'jotunn_frost',
    title: 'Fimbulvetr',
    category: 'civilization',
    pantheon: 'jotunn',
    subtitle: 'Tema Jotunn — Ecos Glaciais de Jotunheim',
    bpm: 92,
    rootHz: 146.83,
    scale: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15],
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
    percussionStyle: 'nordic',
    melody: [0, -1, 2, 3, 4, -1, 1, 0, 4, -1, 5, 4, 3, 2, 0, -1],
    arp: [0, 4, 7, 4, 1, 4, 7, 4, 0, 3, 7, 3, 2, 4, 0, -1],
    bass: [0, -1, -1, 0, 3, -1, -1, 2, 4, -1, -1, 3, 0, -1, -1, 0],
  },

  // 11 Músicas de Partida Compartilhadas (Standard & Mellow/Quiet Mix)
  eat_your_potatoes: {
    id: 'eat_your_potatoes',
    title: 'Eat Your Potatoes',
    category: 'match',
    subtitle: 'Tema de Partida Clássico I',
    bpm: 112,
    rootHz: 220.0,
    scale: [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19],
    leadWave: 'triangle',
    bassWave: 'triangle',
    percussionStyle: 'orchestral',
    melody: [0, 2, 4, -1, 5, 4, 2, 3, 4, -1, 7, 5, 4, 2, 0, -1],
    arp: [0, 4, 7, 4, 2, 5, 7, 5, 0, 3, 7, 3, 4, 2, 0, -1],
    bass: [0, -1, 0, 4, 2, -1, 2, 4, 3, -1, 5, -1, 4, -1, 0, -1],
  },
  chocolate_outline: {
    id: 'chocolate_outline',
    title: 'Chocolate Outline',
    category: 'match',
    subtitle: 'Tema de Partida Clássico II',
    bpm: 106,
    rootHz: 196.0,
    scale: [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'nile',
    melody: [4, 5, 4, 2, 1, 0, -1, 2, 4, 5, 7, 5, 4, 2, 0, -1],
    arp: [0, 2, 4, 7, 4, 2, 1, 0, 0, 4, 5, 7, 5, 4, 2, 0],
    bass: [0, -1, 4, -1, 1, -1, 0, -1, 2, -1, 4, -1, 1, -1, 0, -1],
  },
  slacks_and_bashers: {
    id: 'slacks_and_bashers',
    title: 'Never Mind the Slacks and Bashers',
    category: 'match',
    subtitle: 'Tema de Partida Clássico III',
    bpm: 118,
    rootHz: 246.94,
    scale: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 19],
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    percussionStyle: 'nordic',
    melody: [0, 4, 3, 4, 7, -1, 5, 4, 3, 2, 4, 3, 2, 0, 2, -1],
    arp: [0, 3, 4, 7, 4, 3, 2, 0, 0, 4, 5, 7, 5, 4, 3, 2],
    bass: [0, 0, -1, 4, 2, -1, 3, -1, 0, -1, 4, -1, 5, 4, 2, 0],
  },
  suture_self: {
    id: 'suture_self',
    title: 'Suture Self',
    category: 'match',
    subtitle: 'Tema de Partida Clássico IV',
    bpm: 102,
    rootHz: 220.0,
    scale: [0, 2, 4, 6, 7, 9, 11, 12, 14, 16],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'mystic',
    melody: [4, -1, 6, 7, 4, 2, 0, -1, 3, 4, 6, 4, 2, 3, 0, -1],
    arp: [0, 4, 6, 9, 7, 6, 4, 0, 2, 4, 7, 9, 7, 4, 2, 0],
    bass: [0, -1, -1, 4, 2, -1, -1, 0, 3, -1, 4, -1, 2, -1, 0, -1],
  },
  flavor_cats: {
    id: 'flavor_cats',
    title: 'Flavor Cats (In the Comfort Zone)',
    category: 'match',
    subtitle: 'Tema de Partida Clássico V',
    bpm: 100,
    rootHz: 261.63,
    scale: [0, 2, 4, 5, 7, 9, 10, 12, 14, 16],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'light',
    melody: [2, 4, 5, 4, 2, 0, 2, -1, 4, 5, 7, 5, 4, 2, 0, -1],
    arp: [0, 2, 4, 5, 4, 2, 0, 4, 1, 3, 5, 7, 5, 3, 2, 0],
    bass: [0, -1, 2, -1, 4, -1, 2, -1, 3, -1, 4, -1, 2, -1, 0, -1],
  },
  slaysenflite: {
    id: 'slaysenflite',
    title: '(Fine Layers of) Slaysenflite',
    category: 'match',
    subtitle: 'Tema de Partida Clássico VI',
    bpm: 114,
    rootHz: 196.0,
    scale: [0, 2, 3, 5, 7, 9, 10, 12, 14, 15],
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    percussionStyle: 'orchestral',
    melody: [0, 3, 4, 5, 7, 5, 4, 3, 2, 4, 5, 7, 9, 7, 4, -1],
    arp: [0, 3, 5, 7, 5, 3, 0, 4, 2, 4, 6, 7, 6, 4, 2, 0],
    bass: [0, -1, 4, -1, 3, -1, 2, -1, 0, -1, 4, -1, 5, -1, 4, -1],
  },
  real_betterness: {
    id: 'real_betterness',
    title: 'Hoping for Real Betterness',
    category: 'match',
    subtitle: 'Tema de Partida Clássico VII',
    bpm: 96,
    rootHz: 233.08,
    scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'light',
    melody: [0, -1, 4, 2, 5, 4, 2, -1, 3, 4, 6, 7, 5, 4, 2, 0],
    arp: [0, 4, 7, 4, 2, 5, 7, 5, 1, 4, 6, 4, 0, 2, 4, 7],
    bass: [0, -1, -1, 0, 2, -1, 4, -1, 3, -1, 4, -1, 0, -1, 2, -1],
  },
  adult_swim: {
    id: 'adult_swim',
    title: 'Adult Swim',
    category: 'match',
    subtitle: 'Tema de Partida Clássico VIII',
    bpm: 110,
    rootHz: 246.94,
    scale: [0, 2, 3, 6, 7, 9, 10, 12, 14, 15],
    leadWave: 'triangle',
    bassWave: 'triangle',
    percussionStyle: 'mystic',
    melody: [0, 3, 4, -1, 2, 3, 4, 6, 7, 6, 4, 3, 2, 3, 0, -1],
    arp: [0, 2, 4, 7, 6, 4, 2, 0, 1, 3, 5, 7, 5, 3, 2, 0],
    bass: [0, -1, 3, -1, 2, -1, 4, -1, 0, -1, 3, -1, 4, -1, 0, -1],
  },
  ace_lebaron: {
    id: 'ace_lebaron',
    title: 'The Ballad of Ace LeBaron',
    category: 'match',
    subtitle: 'Tema de Partida Clássico IX',
    bpm: 94,
    rootHz: 207.65,
    scale: [0, 2, 4, 5, 7, 8, 10, 12, 14, 16],
    leadWave: 'triangle',
    bassWave: 'sine',
    percussionStyle: 'orchestral',
    melody: [4, -1, 2, 3, 4, -1, 5, 4, 2, 0, 2, 4, 3, 2, 0, -1],
    arp: [0, 2, 4, 7, 4, 2, 0, 4, 1, 3, 5, 7, 5, 3, 1, 0],
    bass: [0, -1, -1, 4, 2, -1, 3, -1, 4, -1, 2, -1, 0, -1, -1, 0],
  },
  pile_of_own_good: {
    id: 'pile_of_own_good',
    title: 'In a Pile of Its Own Good',
    category: 'match',
    subtitle: 'Tema de Partida Clássico X',
    bpm: 108,
    rootHz: 220.0,
    scale: [0, 1, 3, 5, 7, 8, 10, 12, 13, 15],
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    percussionStyle: 'nile',
    melody: [0, 1, 3, 4, 5, 4, 3, 1, 0, 2, 4, 5, 4, 2, 1, 0],
    arp: [0, 3, 4, 7, 4, 3, 1, 0, 0, 2, 4, 5, 4, 2, 1, 0],
    bass: [0, -1, 1, -1, 4, -1, 3, -1, 0, -1, 2, -1, 4, -1, 1, -1],
  },
  great_science_fi: {
    id: 'great_science_fi',
    title: 'Behold the Great Science Fi',
    category: 'match',
    subtitle: 'Tema de Partida Clássico XI',
    bpm: 116,
    rootHz: 261.63,
    scale: [0, 2, 4, 6, 7, 9, 11, 12, 14, 16],
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    percussionStyle: 'mystic',
    melody: [0, 4, 6, 7, 9, 7, 6, 4, 2, 4, 6, 7, 11, 9, 7, -1],
    arp: [0, 4, 6, 9, 7, 6, 4, 2, 0, 4, 7, 11, 9, 7, 4, 2],
    bass: [0, 0, -1, 4, 3, -1, 2, -1, 0, -1, 4, -1, 5, 4, 2, 0],
  },
};

export const MATCH_MUSIC_PLAYLIST = [
  'eat_your_potatoes',
  'chocolate_outline',
  'slacks_and_bashers',
  'suture_self',
  'flavor_cats',
  'slaysenflite',
  'real_betterness',
  'adult_swim',
  'ace_lebaron',
  'pile_of_own_good',
  'great_science_fi',
] as const;

export const PANTHEON_THEME_TRACK: Record<PantheonId, string> = {
  greek: 'greek_to_me',
  egyptian: 'nd_nile',
  norse: 'of_norse_not',
  atlantean: 'hotlantis',
  chinese: 'kuafu_panda',
  japanese: 'nori_grets',
  aztec: 'aztec_sun',
  roman: 'roman_legion',
  eldritch: 'eldritch_abyss',
  celtic: 'celtic_mist',
  babylonian: 'babylon_ziggurat',
  lakota: 'lakota_wind',
  jotunn: 'jotunn_frost',
};

export interface CulturalVoiceEntry {
  phrase: string;
  pt: string;
  spoken: string;
  syllables: number[];
  audioUrl?: string;
}

export interface CultureVoiceProfile {
  cultureLabel: string;
  basePitch: number;
  formantF1: number;
  formantF2: number;
  hornPitch: number;
  select: CulturalVoiceEntry[];
  attack: CulturalVoiceEntry[];
  move: CulturalVoiceEntry[];
  work: CulturalVoiceEntry[];
}

export const CULTURE_VOICE_BANK: Record<PantheonId, CultureVoiceProfile> = {
  greek: {
    cultureLabel: 'Helenos (Grego Antigo)',
    basePitch: 128,
    formantF1: 520,
    formantF2: 1480,
    hornPitch: 293.66,
    select: [
      { phrase: 'Próstagma?', pt: 'Ordens? / Qual o comando?', spoken: 'Prós-tag-ma?', syllables: [1.04, 1.16, 0.96] },
      { phrase: 'Lege.', pt: 'Fale!', spoken: 'Lê-gue.', syllables: [0.98, 1.15] },
      { phrase: 'Étimos.', pt: 'Pronto.', spoken: 'É-ti-moss.', syllables: [1.12, 1.0, 0.95] },
      { phrase: 'Né.', pt: 'Sim.', spoken: 'Né?', syllables: [1.14] },
    ],
    attack: [
      { phrase: 'Eis máchin!', pt: 'Para a batalha!', spoken: 'Êiss má-rrin!', syllables: [1.06, 1.26, 1.18] },
      { phrase: 'Eisvolí!', pt: 'Invasão!', spoken: 'Êiss-vo-lí!', syllables: [1.05, 1.18, 1.34] },
      { phrase: 'Páme!', pt: 'Vamos!', spoken: 'Pá-me!', syllables: [1.22, 1.08] },
      { phrase: 'Próseche!', pt: 'Cuidado!', spoken: 'Pró-se-rre!', syllables: [1.16, 1.04, 1.14] },
    ],
    move: [
      { phrase: 'Vúlome.', pt: 'Eu quero / Vou fazê-lo.', spoken: 'Vú-lo-me.', syllables: [1.08, 0.98, 1.05] },
      { phrase: 'Málista.', pt: 'Sim, senhor / Certamente.', spoken: 'Má-lis-ta.', syllables: [1.12, 1.02, 0.94] },
      { phrase: 'Orthós.', pt: 'Correto / Certo.', spoken: 'Or-tóss.', syllables: [0.98, 1.14] },
      { phrase: 'Kalós.', pt: 'Bem / De acordo.', spoken: 'Ka-lóss.', syllables: [1.0, 1.1] },
      { phrase: 'Páme!', pt: 'Vamos!', spoken: 'Pá-me!', syllables: [1.16, 1.02] },
    ],
    work: [
      { phrase: 'Vúlome.', pt: 'Vou fazê-lo.', spoken: 'Vú-lo-me.', syllables: [1.04, 0.98, 1.0] },
      { phrase: 'Málista.', pt: 'Certamente.', spoken: 'Má-lis-ta.', syllables: [1.08, 1.0, 0.94] },
      { phrase: 'Kalós.', pt: 'Bem / De acordo.', spoken: 'Ka-lóss.', syllables: [0.98, 1.08] },
      { phrase: 'Orthós.', pt: 'Correto.', spoken: 'Or-tóss.', syllables: [0.96, 1.08] },
    ],
  },
  egyptian: {
    cultureLabel: 'Kemet (Egípcio)',
    basePitch: 124,
    formantF1: 480,
    formantF2: 1350,
    hornPitch: 277.18,
    select: [
      { phrase: 'Iu-airu?', pt: 'O que ordenas?', spoken: 'Iú-ai-rú?', syllables: [0.96, 1.08, 1.14] },
      { phrase: 'Ha-nefer!', pt: 'Pronto para servir o Faraó!', spoken: 'Rá-ne-fér!', syllables: [1.04, 0.98, 1.06] },
      { phrase: 'Em-shere?', pt: 'Suas ordens?', spoken: 'Em-shê-re?', syllables: [0.95, 1.1, 1.02] },
    ],
    attack: [
      { phrase: 'Khepresh!', pt: 'Por Rá, ataquem!', spoken: 'Ké-presh!', syllables: [1.12, 1.26] },
      { phrase: 'Sema-tawy!', pt: 'Esmaguem os invasores!', spoken: 'Sê-ma-tá-ui!', syllables: [1.04, 1.15, 1.28] },
      { phrase: 'Ankh-ef-en-Sekhmet!', pt: 'Pela fúria de Sekhmet!', spoken: 'Ank-éf-en-Sék-met!', syllables: [1.08, 1.2, 1.34] },
    ],
    move: [
      { phrase: 'Sechem!', pt: 'Marchando com poder!', spoken: 'Sé-krem!', syllables: [1.02, 1.08] },
      { phrase: 'Djew!', pt: 'Avançando pelo deserto!', spoken: 'Djéu!', syllables: [1.06, 0.96] },
    ],
    work: [
      { phrase: 'Baku!', pt: 'Colhendo para o Nilo!', spoken: 'Bá-ku!', syllables: [0.98, 1.04] },
      { phrase: 'Kheper!', pt: 'Construindo para a eternidade!', spoken: 'Ké-per!', syllables: [1.0, 1.08] },
    ],
  },
  norse: {
    cultureLabel: 'Midgard (Nórdico)',
    basePitch: 112,
    formantF1: 430,
    formantF2: 1180,
    hornPitch: 220.0,
    select: [
      { phrase: 'Hvað?', pt: 'O que queres, Jarl?', spoken: 'Vádh?', syllables: [1.08] },
      { phrase: 'Já?', pt: 'Sim, senhor?', spoken: 'Iá?', syllables: [0.96, 1.12] },
      { phrase: 'Tilbúinn!', pt: 'Pronto para a luta!', spoken: 'Til-bú-in!', syllables: [1.04, 0.96, 1.08] },
    ],
    attack: [
      { phrase: 'Til bardaga!', pt: 'Para a batalha!', spoken: 'Til bar-dá-ga!', syllables: [1.05, 1.18, 1.3, 1.24] },
      { phrase: 'Drepum þá!', pt: 'Por Odin, abatam todos!', spoken: 'Drê-pum tá!', syllables: [1.12, 1.26, 1.36] },
      { phrase: 'Valhalla!', pt: 'Por Valhalla!', spoken: 'Val-rá-la!', syllables: [1.06, 1.22, 1.34] },
    ],
    move: [
      { phrase: 'Sammála!', pt: 'De acordo, em marcha!', spoken: 'Sam-má-la!', syllables: [1.02, 1.08, 0.98] },
      { phrase: 'Fram!', pt: 'Avante!', spoken: 'Fram!', syllables: [1.12] },
    ],
    work: [
      { phrase: 'Skipan!', pt: 'Ao trabalho!', spoken: 'Skí-pan!', syllables: [0.98, 1.06] },
      { phrase: 'Smiður!', pt: 'Forjando e colhendo!', spoken: 'Smí-dur!', syllables: [1.02, 0.94] },
    ],
  },
  atlantean: {
    cultureLabel: 'Atlântida (Atlante)',
    basePitch: 136,
    formantF1: 540,
    formantF2: 1560,
    hornPitch: 329.63,
    select: [
      { phrase: 'Yuji?', pt: 'Ordens?', spoken: 'Iú-dji?', syllables: [1.04, 1.16] },
      { phrase: 'Volat?', pt: 'Qual o comando?', spoken: 'Vô-lat?', syllables: [1.02, 1.14] },
    ],
    attack: [
      { phrase: 'Mache!', pt: 'Para a batalha!', spoken: 'Má-rre!', syllables: [1.22, 1.14] },
      { phrase: 'Scopos!', pt: 'Alvo confirmado — atacar!', spoken: 'Ess-kó-poss!', syllables: [1.06, 1.2, 1.12] },
    ],
    move: [
      { phrase: 'Scopos.', pt: 'Confirmado — avançando.', spoken: 'Ess-kó-poss.', syllables: [1.0, 1.1, 1.02] },
      { phrase: 'Echlost.', pt: 'Ordem reconhecida.', spoken: 'Ék-lost.', syllables: [1.08, 0.98] },
    ],
    work: [
      { phrase: 'Echlost.', pt: 'Ordem reconhecida.', spoken: 'Ék-lost.', syllables: [1.04, 0.96] },
      { phrase: 'Scopos.', pt: 'Confirmado.', spoken: 'Ess-kó-poss.', syllables: [0.98, 1.08, 1.0] },
    ],
  },
  chinese: {
    cultureLabel: 'Reino do Meio (Chinês)',
    basePitch: 142,
    formantF1: 560,
    formantF2: 1620,
    hornPitch: 349.23,
    select: [
      { phrase: 'Zài!', pt: 'Presente e pronto!', spoken: 'Tzái!', syllables: [1.14, 0.96] },
      { phrase: 'Qǐng fēnfù?', pt: 'Qual é o seu comando?', spoken: 'Tching fên-fú?', syllables: [0.98, 1.1, 1.04] },
    ],
    attack: [
      { phrase: 'Chōngfēng!', pt: 'Carreguem contra o inimigo!', spoken: 'Tchông-fêng!', syllables: [1.1, 1.28] },
      { phrase: 'Shā!', pt: 'Ataquem sem trégua!', spoken: 'Shá!', syllables: [1.34] },
    ],
    move: [
      { phrase: 'Zūn mìng!', pt: 'Obedecendo à ordem!', spoken: 'Tzun ming!', syllables: [1.06, 1.12] },
      { phrase: 'Chūfā!', pt: 'Partindo agora!', spoken: 'Tchú-fá!', syllables: [1.02, 1.1] },
    ],
    work: [
      { phrase: 'Láodòng!', pt: 'Trabalhando pela dinastia!', spoken: 'Láo-dong!', syllables: [0.98, 1.06] },
      { phrase: 'Jiànzào!', pt: 'Erguendo e colhendo!', spoken: 'Djiên-tzáo!', syllables: [1.04, 0.98] },
    ],
  },
  aztec: {
    cultureLabel: 'Império Mexica (Asteca)',
    basePitch: 128,
    formantF1: 510,
    formantF2: 1440,
    hornPitch: 311.13,
    select: [
      { phrase: 'Tlahtoani?', pt: 'Ordens, Grande Orador?', spoken: 'Tla-to-á-ni?', syllables: [1.0, 1.08, 1.16] },
      { phrase: 'Nican!', pt: 'Estou pronto!', spoken: 'Ní-kan!', syllables: [1.06, 1.0] },
    ],
    attack: [
      { phrase: 'Yaoyotl!', pt: 'Guerra sagrada pelo Sol!', spoken: 'Iáo-iótl!', syllables: [1.08, 1.2, 1.32] },
      { phrase: 'Huitzilopochtli!', pt: 'Sangue para o Deus Sol!', spoken: 'Ui-tzi-lo-pótch-tli!', syllables: [1.04, 1.14, 1.24, 1.35] },
    ],
    move: [
      { phrase: 'Ohtli!', pt: 'Seguindo o caminho!', spoken: 'Ó-tli!', syllables: [1.04, 1.08] },
      { phrase: 'Nemi!', pt: 'Avançando!', spoken: 'Nê-mi!', syllables: [1.02, 0.98] },
    ],
    work: [
      { phrase: 'Tequitl!', pt: 'Trabalhando no tributo!', spoken: 'Te-quí-tl!', syllables: [0.98, 1.06] },
      { phrase: 'Calli!', pt: 'Construindo para Tenochtitlán!', spoken: 'Cá-li!', syllables: [1.02, 1.0] },
    ],
  },
  roman: {
    cultureLabel: 'Senado e Povo (Romano)',
    basePitch: 122,
    formantF1: 490,
    formantF2: 1410,
    hornPitch: 293.66,
    select: [
      { phrase: 'Imperium?', pt: 'Qual é o comando, Legatus?', spoken: 'Im-pé-ri-um?', syllables: [1.0, 1.08, 1.14] },
      { phrase: 'Paratus!', pt: 'Pronto pela Legião!', spoken: 'Pa-rá-tuss!', syllables: [1.04, 1.1, 0.98] },
    ],
    attack: [
      { phrase: 'Ad arma!', pt: 'Às armas, legionários!', spoken: 'Ad ár-ma!', syllables: [1.06, 1.22, 1.32] },
      { phrase: 'Pro Roma!', pt: 'Pela glória de Roma, ataquem!', spoken: 'Prô Rô-ma!', syllables: [1.08, 1.24, 1.3] },
    ],
    move: [
      { phrase: 'Procedite!', pt: 'Marchem em formação!', spoken: 'Pro-cê-di-te!', syllables: [1.02, 1.08, 1.0] },
      { phrase: 'Celeriter!', pt: 'Com rapidez!', spoken: 'Ce-lé-ri-ter!', syllables: [1.06, 1.02, 1.1] },
    ],
    work: [
      { phrase: 'Laboramus!', pt: 'Trabalhando pelo Império!', spoken: 'La-bo-rá-muss!', syllables: [0.98, 1.04, 1.0] },
      { phrase: 'Aedifica!', pt: 'Construindo obra romana!', spoken: 'E-dí-fi-ca!', syllables: [1.02, 1.08, 0.96] },
    ],
  },
  japanese: {
    cultureLabel: 'Takamagahara (Japonês)',
    basePitch: 130,
    formantF1: 500,
    formantF2: 1500,
    hornPitch: 329.63,
    select: [
      { phrase: 'Gomeirei wo?', pt: 'Qual é a sua ordem, Xogum?', spoken: 'Go-mei-rei ô?', syllables: [0.98, 1.06, 1.14] },
      { phrase: 'Kakugo!', pt: 'Pronto com honra!', spoken: 'Ka-kú-go!', syllables: [1.08, 1.02, 0.96] },
    ],
    attack: [
      { phrase: 'Totsugeki!', pt: 'Ataquem com honra!', spoken: 'To-tsu-guê-ki!', syllables: [1.06, 1.18, 1.32] },
      { phrase: 'Kirifuse!', pt: 'Derrubem os inimigos!', spoken: 'Ki-ri-fú-sse!', syllables: [1.1, 1.22, 1.34] },
    ],
    move: [
      { phrase: 'Shōchi!', pt: 'Compreendido, em marcha!', spoken: 'Shô-tchi!', syllables: [1.04, 1.1] },
      { phrase: 'Susume!', pt: 'Avancem!', spoken: 'Su-sú-me!', syllables: [1.02, 1.08, 1.12] },
    ],
    work: [
      { phrase: 'Fushin!', pt: 'Construindo e colhendo!', spoken: 'Fu-shin!', syllables: [0.98, 1.04] },
      { phrase: 'Tsutome!', pt: 'Cumprindo o dever!', spoken: 'Tsu-tô-me!', syllables: [1.02, 0.98] },
    ],
  },
  eldritch: {
    cultureLabel: 'Abismo Cósmico (Eldritch)',
    basePitch: 92,
    formantF1: 360,
    formantF2: 980,
    hornPitch: 164.81,
    select: [
      { phrase: "Iä! Ph'nglui?", pt: 'O vazio escuta seu chamado?', spoken: 'Iá! Fen-glúi?', syllables: [0.92, 1.06, 0.88] },
      { phrase: "R'lyeh!", pt: 'Despertos nas profundezas!', spoken: 'Rê-li-é!', syllables: [1.04, 0.9] },
    ],
    attack: [
      { phrase: 'Fhtagn! Obliterar!', pt: 'Devorar as mentes mortais!', spoken: 'Fé-tag-n! Obliterar!', syllables: [1.08, 1.22, 0.94] },
      { phrase: 'Yogg-Sothoth!', pt: 'Pelo caos abissal, destruam!', spoken: 'Ióg-So-tót!', syllables: [1.02, 1.18, 1.28] },
    ],
    move: [
      { phrase: 'Nyarlath!', pt: 'Deslizando pelas sombras!', spoken: 'Ni-ar-lát!', syllables: [0.96, 1.04] },
    ],
    work: [
      { phrase: 'Shoggoth!', pt: 'Canalizando matéria astral!', spoken: 'Shô-got!', syllables: [0.94, 1.02] },
    ],
  },
  celtic: {
    cultureLabel: 'Tuatha Dé Danann (Celta)',
    basePitch: 126,
    formantF1: 500,
    formantF2: 1460,
    hornPitch: 261.63,
    select: [
      { phrase: 'Cén t-ordú?', pt: 'Qual é o comando dos Druidas?', spoken: 'Kên tor-dú?', syllables: [1.0, 1.12, 1.04] },
      { phrase: 'Réidh!', pt: 'Pronto pelo clã!', spoken: 'Rêid!', syllables: [1.1] },
    ],
    attack: [
      { phrase: 'Abú! Chun catha!', pt: 'Vitória! Para a batalha!', spoken: 'A-bú! Run cá-rra!', syllables: [1.06, 1.2, 1.32] },
      { phrase: 'Morrígan!', pt: 'Pela fúria de Morrígan!', spoken: 'Mo-rí-gan!', syllables: [1.1, 1.24, 1.18] },
    ],
    move: [
      { phrase: 'Ar aghaidh!', pt: 'Avante pelas colinas!', spoken: 'Ar a-gái!', syllables: [1.02, 1.1] },
    ],
    work: [
      { phrase: 'Obair!', pt: 'Colhendo nas terras sagradas!', spoken: 'Ó-bair!', syllables: [0.98, 1.04] },
    ],
  },
  babylonian: {
    cultureLabel: 'Mesopotâmia (Babilônico)',
    basePitch: 120,
    formantF1: 470,
    formantF2: 1320,
    hornPitch: 246.94,
    select: [
      { phrase: 'Amātu?', pt: 'Qual é a palavra real?', spoken: 'A-má-tu?', syllables: [0.98, 1.08, 1.12] },
      { phrase: 'Annû!', pt: 'Pronto na Babilônia!', spoken: 'A-nú!', syllables: [1.04, 1.0] },
    ],
    attack: [
      { phrase: 'Ina Marduk!', pt: 'Por Marduk, esmaguem-nos!', spoken: 'I-na Mar-duk!', syllables: [1.06, 1.18, 1.3] },
      { phrase: 'Qablu!', pt: 'Ao combate!', spoken: 'Ka-blú!', syllables: [1.12, 1.26] },
    ],
    move: [
      { phrase: 'Alāku!', pt: 'Marchando pelo Eufrates!', spoken: 'A-lá-ku!', syllables: [1.02, 1.08, 1.0] },
    ],
    work: [
      { phrase: 'Epēšu!', pt: 'Erguendo o zigurate!', spoken: 'E-pê-shu!', syllables: [0.98, 1.06, 1.0] },
    ],
  },
  lakota: {
    cultureLabel: 'Grande Planície (Lakota)',
    basePitch: 125,
    formantF1: 495,
    formantF2: 1420,
    hornPitch: 293.66,
    select: [
      { phrase: 'Háu, Itancan?', pt: 'Qual é o caminho, Chefe?', spoken: 'Ráu, I-tan-kan?', syllables: [1.02, 1.1, 1.06] },
      { phrase: 'Wiyeya!', pt: 'Pronto nas planícies!', spoken: 'Ui-ê-ia!', syllables: [1.06, 1.0, 1.08] },
    ],
    attack: [
      { phrase: 'Hokahey!', pt: 'É um bom dia para lutar!', spoken: 'Rô-ka-rêi!', syllables: [1.08, 1.2, 1.34] },
      { phrase: 'Wakinyan!', pt: 'Como o Pássaro-Trovão, ataquem!', spoken: 'Ua-kín-ian!', syllables: [1.06, 1.18, 1.28] },
    ],
    move: [
      { phrase: 'Iyaya!', pt: 'Cavalgando como o vento!', spoken: 'I-á-ia!', syllables: [1.04, 1.1, 1.02] },
    ],
    work: [
      { phrase: 'Wóškate!', pt: 'Sustentando a tribo!', spoken: 'Uôsh-ka-te!', syllables: [0.98, 1.04, 1.0] },
    ],
  },
  jotunn: {
    cultureLabel: 'Jotunheim (Gigantes de Gelo)',
    basePitch: 86,
    formantF1: 340,
    formantF2: 920,
    hornPitch: 146.83,
    select: [
      { phrase: 'Kaldur rymr?', pt: 'A geada aguarda sua ordem?', spoken: 'Kál-dur rí-mer?', syllables: [0.92, 1.02, 0.96] },
      { phrase: 'Jötunn!', pt: 'Os gigantes despertam!', spoken: 'Iô-tun!', syllables: [1.04, 0.94] },
    ],
    attack: [
      { phrase: 'Fimbulvetr!', pt: 'Inverno eterno sobre eles!', spoken: 'Fím-bul-ve-ter!', syllables: [1.04, 1.16, 1.24] },
      { phrase: 'Brjóta!', pt: 'Estilhacem no gelo!', spoken: 'Briô-ta!', syllables: [1.12, 1.26] },
    ],
    move: [
      { phrase: 'Ganga!', pt: 'Passos que tremem a terra!', spoken: 'Gán-ga!', syllables: [0.98, 0.92] },
    ],
    work: [
      { phrase: 'Hrímpurs!', pt: 'Moldando o gelo primordial!', spoken: 'Rrím-purs!', syllables: [0.94, 1.0] },
    ],
  },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;
  public masterVolume = 0.85;
  public musicVolume = 0.7;
  public sfxVolume = 0.9;
  public musicEnabled = true;
  public sfxEnabled = true;
  private lastSoundAt: Record<string, number> = {};
  private lastPhraseByKey: Record<string, string> = {};
  private audioBufferCache = new Map<string, AudioBuffer>();
  private loadingAudioUrls = new Set<string>();
  private speechQueueToken = 0;

  // Dynamic Hybrid Soundtrack State
  private musicMasterGain: GainNode | null = null;
  private musicLowpass: BiquadFilterNode | null = null;
  private musicIntervalId: number | null = null;
  private musicScene: MusicScene = 'title';
  private musicMood: MusicMood = 'standard';
  private musicPantheon: PantheonId = 'greek';
  private currentTrackId = 'cat_mittens';
  private matchPlaylistIdx = 0;
  private musicStep = 0;
  private musicNextNoteTime = 0;
  private musicTrackStartedAt = 0;
  private musicPausedDuck = false;
  private musicCueDuckUntil = 0;
  private campaignPinnedTrackId: string | null = null;
  private titleCycleIndex = 0;

  private get effectiveSfxScale(): number {
    if (this.muted || !this.sfxEnabled) return 0;
    return Math.max(0, Math.min(1.5, this.masterVolume * this.sfxVolume));
  }

  private get effectiveMusicScale(): number {
    if (this.muted || !this.musicEnabled) return 0;
    return Math.max(0, Math.min(1.5, this.masterVolume * this.musicVolume));
  }

  private getOrCreateRawContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || !this.sfxEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return null;
    return this.getOrCreateRawContext();
  }

  private ensureMusicBus(): { ctx: AudioContext; gain: GainNode; filter: BiquadFilterNode } | null {
    if (this.effectiveMusicScale <= 0) return null;
    const ctx = this.getOrCreateRawContext();
    if (!ctx) return null;
    if (!this.musicMasterGain || !this.musicLowpass) {
      this.musicLowpass = ctx.createBiquadFilter();
      this.musicLowpass.type = 'lowpass';
      this.musicLowpass.frequency.setValueAtTime(3200, ctx.currentTime);
      this.musicLowpass.Q.setValueAtTime(0.7, ctx.currentTime);

      this.musicMasterGain = ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(0.001, ctx.currentTime);

      this.musicLowpass.connect(this.musicMasterGain);
      this.musicMasterGain.connect(ctx.destination);
    }
    return { ctx, gain: this.musicMasterGain, filter: this.musicLowpass };
  }

  private updateMusicBusGain() {
    if (!this.ctx || !this.musicMasterGain || !this.musicLowpass) return;
    const now = this.ctx.currentTime;
    const scale = this.effectiveMusicScale;
    const moodFactor = this.musicScene === 'match' && this.musicMood === 'mellow' ? 0.72 : 1.0;
    const duckFactor = this.musicPausedDuck ? 0.3 : now < this.musicCueDuckUntil ? 0.42 : 1.0;
    const targetGain = scale > 0 ? Math.max(0.001, 0.24 * scale * moodFactor * duckFactor) : 0.0001;
    this.musicMasterGain.gain.setTargetAtTime(targetGain, now, 0.14);

    const targetCutoff = this.musicScene === 'match' && this.musicMood === 'mellow' ? 1150 : 3400;
    this.musicLowpass.frequency.setTargetAtTime(targetCutoff, now, 0.25);
  }

  private canPlay(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const prev = this.lastSoundAt[key] ?? 0;
    if (now - prev < minIntervalMs) return false;
    this.lastSoundAt[key] = now;
    return true;
  }

  public unlock() {
    this.getOrCreateRawContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    this.startMusicScheduler();
  }

  public applySettings(opts: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    musicEnabled: boolean;
    sfxEnabled: boolean;
  }) {
    this.masterVolume = opts.masterVolume;
    this.musicVolume = opts.musicVolume;
    this.sfxVolume = opts.sfxVolume;
    this.musicEnabled = opts.musicEnabled;
    this.sfxEnabled = opts.sfxEnabled;
    this.muted = !opts.sfxEnabled && !opts.musicEnabled;
    if ((this.muted || !this.sfxEnabled) && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechQueueToken++;
      window.speechSynthesis.cancel();
    }
    this.updateMusicBusGain();
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    } else {
      this.stopMusicScheduler();
    }
  }

  private speakSpokenText(
    spokenText: string,
    opts: { pitch: number; rate: number; isFemale?: boolean; volumeScale?: number }
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const scale = this.effectiveSfxScale;
    if (scale <= 0) return false;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (!voices || voices.length === 0) return false;

    const ptVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('pt'));
    const latinVoices =
      ptVoices.length > 0
        ? ptVoices
        : voices.filter((v) => /^(el|es|it|la)/i.test(v.lang));
    const pool = latinVoices.length > 0 ? latinVoices : voices;

    const femaleHint = /(female|maria|helena|luciana|francisca|camila|vitoria|vitória|sofia|ana|paula|zira|samantha|victoria)/i;
    const maleHint = /(male|daniel|antonio|antônio|ricardo|felipe|tiago|duarte|joao|joão|david|alex|george)/i;
    const chosenVoice = opts.isFemale
      ? pool.find((v) => femaleHint.test(v.name)) ?? pool[0]
      : pool.find((v) => maleHint.test(v.name)) ?? pool[0];

    const utterance = new SpeechSynthesisUtterance(spokenText);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = 'pt-BR';
    }
    utterance.pitch = Math.max(0.4, Math.min(1.65, opts.pitch));
    utterance.rate = Math.max(0.75, Math.min(1.35, opts.rate));
    utterance.volume = Math.max(0.05, Math.min(1, 0.92 * scale * (opts.volumeScale ?? 1)));

    const token = ++this.speechQueueToken;
    if (synth.speaking || synth.pending) {
      synth.cancel();
      window.setTimeout(() => {
        if (this.speechQueueToken !== token || this.effectiveSfxScale <= 0) return;
        synth.speak(utterance);
      }, 18);
    } else {
      synth.speak(utterance);
    }
    return true;
  }

  private playVowelFormantCadence(
    ctx: AudioContext,
    scale: number,
    spokenText: string,
    baseFreq: number,
    formantF1: number,
    formantF2: number,
    syllables: number[],
    action: UnitVoiceAction,
    groupSize: number,
    isDarkTone: boolean
  ) {
    const now = ctx.currentTime;
    const cleanVowels = spokenText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .match(/[aeiou]+/g) ?? ['a'];

    const vowelFormants: Record<string, [number, number]> = {
      a: [730, 1180],
      e: [500, 1850],
      i: [310, 2250],
      o: [480, 920],
      u: [330, 840],
    };

    const voiceLayers = groupSize > 1 ? 2 : 1;
    const sylCount = Math.max(syllables.length, Math.min(4, cleanVowels.length));

    for (let v = 0; v < voiceLayers; v++) {
      const layerDelay = v * 0.036;
      const layerDetune = v === 0 ? 1.0 : 1.042;
      const layerGainScale = v === 0 ? 1.0 : 0.6;

      let cursor = now + layerDelay;
      for (let i = 0; i < sylCount; i++) {
        const pitchMult = syllables[i % syllables.length] ?? 1.0;
        const sylPitch = baseFreq * pitchMult * layerDetune;
        const dur = action === 'attack' ? 0.11 : 0.095;
        const vChar = cleanVowels[i % cleanVowels.length][0] ?? 'a';
        const [vf1, vf2] = vowelFormants[vChar] ?? [formantF1, formantF2];

        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const f1Filter = ctx.createBiquadFilter();
        const f2Filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = isDarkTone ? 'sawtooth' : 'triangle';
        subOsc.type = 'sawtooth';
        osc.frequency.setValueAtTime(sylPitch, cursor);
        subOsc.frequency.setValueAtTime(sylPitch * 0.5, cursor);

        const endMult = action === 'select' && i === sylCount - 1 ? 1.15 : 0.93;
        osc.frequency.exponentialRampToValueAtTime(sylPitch * endMult, cursor + dur);
        subOsc.frequency.exponentialRampToValueAtTime(sylPitch * 0.5 * endMult, cursor + dur);

        f1Filter.type = 'bandpass';
        f1Filter.frequency.setValueAtTime((vf1 + formantF1) * 0.5, cursor);
        f1Filter.Q.setValueAtTime(4.2, cursor);

        f2Filter.type = 'peaking';
        f2Filter.frequency.setValueAtTime((vf2 + formantF2) * 0.5, cursor);
        f2Filter.gain.setValueAtTime(7.5, cursor);

        const amp = (action === 'attack' ? 0.13 : 0.1) * scale * layerGainScale;
        gain.gain.setValueAtTime(0.001, cursor);
        gain.gain.linearRampToValueAtTime(amp, cursor + 0.016);
        gain.gain.exponentialRampToValueAtTime(0.001, cursor + dur);

        osc.connect(f1Filter);
        subOsc.connect(f1Filter);
        f1Filter.connect(f2Filter);
        f2Filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(cursor);
        subOsc.start(cursor);
        osc.stop(cursor + dur + 0.01);
        subOsc.stop(cursor + dur + 0.01);

        cursor += dur + 0.022;
      }
    }
  }

  public playSelect() {
    if (!this.canPlay('select', 70)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.08);
    gain.gain.setValueAtTime(0.06 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCommand() {
    if (!this.canPlay('command', 90)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.09);
    gain.gain.setValueAtTime(0.055 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  private pickRandomVoiceEntry(bank: CulturalVoiceEntry[], cacheKey: string): CulturalVoiceEntry {
    if (bank.length <= 1) return bank[0];
    const lastPhrase = this.lastPhraseByKey[cacheKey];
    const candidates = lastPhrase ? bank.filter((entry) => entry.phrase !== lastPhrase) : bank;
    const pool = candidates.length > 0 ? candidates : bank;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    this.lastPhraseByKey[cacheKey] = picked.phrase;
    return picked;
  }

  public preloadAudioClip(url: string) {
    if (!url || this.audioBufferCache.has(url) || this.loadingAudioUrls.has(url)) return;
    if (typeof fetch === 'undefined') return;
    const ctx = this.getOrCreateRawContext();
    if (!ctx) return;
    this.loadingAudioUrls.add(url);
    fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('HTTP error'))))
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        this.audioBufferCache.set(url, decoded);
      })
      .catch(() => {})
      .finally(() => {
        this.loadingAudioUrls.delete(url);
      });
  }

  public performVoiceClip(opts: {
    phrase: string;
    translation: string;
    spoken: string;
    cultureLabel: string;
    action: UnitVoiceAction;
    syllables: number[];
    basePitch: number;
    formantF1: number;
    formantF2: number;
    hornPitch: number;
    kindPitchMult: number;
    speechRate: number;
    isFemale: boolean;
    isDarkTone: boolean;
    groupSize: number;
    audioUrl?: string;
    respectCooldown?: boolean;
  }): UnitVoiceLineInfo {
    const result: UnitVoiceLineInfo = {
      phrase: opts.phrase,
      translation: opts.translation,
      cultureLabel: opts.cultureLabel,
      action: opts.action,
    };

    if (opts.respectCooldown !== false && !this.canPlay('unit_voice', 220)) {
      return result;
    }

    const scale = this.effectiveSfxScale;
    if (scale <= 0) {
      return result;
    }

    // 0. Play registered real audio clip URL if decoded and cached
    let playedRegisteredClip = false;
    if (opts.audioUrl) {
      const ctx = this.ensureContext();
      const cached = this.audioBufferCache.get(opts.audioUrl);
      if (ctx && cached) {
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        src.buffer = cached;
        src.playbackRate.value = Math.max(0.75, Math.min(1.25, opts.speechRate));
        gain.gain.value = Math.min(1.0, 0.85 * scale);
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(ctx.currentTime);
        playedRegisteredClip = true;
      } else {
        this.preloadAudioClip(opts.audioUrl);
      }
    }

    // 1. Try real browser SpeechSynthesis with phonetic pronunciation
    const speechPitch = Math.max(0.45, Math.min(1.5, opts.kindPitchMult));
    const spokeLive = playedRegisteredClip
      ? true
      : this.speakSpokenText(opts.spoken, {
          pitch: speechPitch,
          rate: opts.speechRate,
          isFemale: opts.isFemale,
        });

    const ctx = this.ensureContext();
    if (!ctx) {
      return result;
    }

    const now = ctx.currentTime;
    // 2. If neither audio clip nor SpeechSynthesis is active, synthesize expressive 3-formant vocal syllables
    if (!spokeLive) {
      this.playVowelFormantCadence(
        ctx,
        scale,
        opts.spoken,
        opts.basePitch * opts.kindPitchMult,
        opts.formantF1,
        opts.formantF2,
        opts.syllables,
        opts.action,
        opts.groupSize,
        opts.isDarkTone
      );
    }

    if (opts.action === 'attack') {
      const hornOsc = ctx.createOscillator();
      const hornGain = ctx.createGain();
      hornOsc.type = opts.groupSize > 1 ? 'sawtooth' : 'triangle';
      const hornFreq = opts.hornPitch * (opts.groupSize > 2 ? 1.0 : 0.85);
      hornOsc.frequency.setValueAtTime(hornFreq, now);
      hornOsc.frequency.exponentialRampToValueAtTime(hornFreq * 1.25, now + 0.22);
      hornGain.gain.setValueAtTime(0.001, now);
      hornGain.gain.linearRampToValueAtTime((spokeLive ? 0.045 : 0.08) * scale, now + 0.03);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      hornOsc.connect(hornGain);
      hornGain.connect(ctx.destination);
      hornOsc.start(now);
      hornOsc.stop(now + 0.26);
    } else if (opts.action === 'select') {
      this.playSelect();
    } else {
      this.playCommand();
    }

    return result;
  }

  /**
   * Plays a culturally localized unit voice line (Web Speech API phonetic pronunciation
   * with multi-formant vocal cadence fallback) when units or main characters are selected or ordered.
   */
  public playUnitVoiceLine(
    pantheon: PantheonId,
    kind: UnitKind,
    action: UnitVoiceAction,
    groupSize = 1,
    isPromotedHero = false
  ): UnitVoiceLineInfo {
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const bank = profile[action] && profile[action].length > 0 ? profile[action] : profile.select;
    const chosen = this.pickRandomVoiceEntry(bank, `${pantheon}:${action}`);

    let phrase = chosen.phrase;
    let translation = chosen.pt;
    let spoken = chosen.spoken;

    const isFemaleGreek =
      kind === 'hippolyta' ||
      kind === 'atena' ||
      kind === 'afrodite' ||
      kind === 'artemis' ||
      kind === 'nymph' ||
      kind === 'medusa';
    const isFemaleAtlantean =
      kind === 'caladria' || kind === 'dryad' || kind === 'lampades';
    const isFemaleNorse = kind === 'valkyrie';
    const isFemaleUnit = isFemaleGreek || isFemaleAtlantean || isFemaleNorse;

    if (pantheon === 'greek' && isFemaleGreek && phrase === 'Étimos.') {
      phrase = 'Étimi.';
      translation = 'Pronta.';
      spoken = 'É-ti-mi.';
    }

    // Major Gods & Titans
    if (kind === 'zeus') {
      phrase =
        action === 'attack'
          ? 'ZEUS: "Fulminarei todos os mortais com o Trovão Supremo!"'
          : 'ZEUS: "O Rei do Olimpo atende ao chamado da Era V!"';
      translation = action === 'attack' ? 'Trovão Supremo do Pai dos Deuses!' : 'Zeus aguarda seu decreto divino.';
      spoken = action === 'attack' ? 'Fulminarei todos os mortais com o trovão supremo!' : 'O Rei do Olimpo atende ao chamado!';
    } else if (kind === 'poseidon') {
      phrase =
        action === 'attack'
          ? 'POSEIDON: "Que os mares engulam suas muralhas!"'
          : 'POSEIDON: "O Senhor dos Mares ergue seu Tridente!"';
      translation = action === 'attack' ? 'Tsunami sísmico de Poseidon!' : 'Poseidon domina as águas.';
      spoken = action === 'attack' ? 'Que os mares engulam suas muralhas!' : 'O Senhor dos Mares ergue seu tridente!';
    } else if (kind === 'hades') {
      phrase =
        action === 'attack'
          ? 'HADES: "Para as profundezas do Tártaro!"'
          : 'HADES: "As sombras do Submundo obedecem."';
      translation = action === 'attack' ? 'Chamas necróticas do Submundo!' : 'Hades reina sobre o campo.';
      spoken = action === 'attack' ? 'Para as profundezas do Tártaro!' : 'As sombras do Submundo obedecem.';
    } else if (kind === 'atena') {
      phrase =
        action === 'attack'
          ? 'ATENA: "Eis máchin! Pela Égide e Sabedoria!"'
          : 'ATENA: "Étimi! A estratégia precede a vitória."';
      translation = action === 'attack' ? 'Golpe sagrado da Égide de Atena!' : 'Atena protege suas fileiras.';
      spoken = action === 'attack' ? 'Êiss má-rrin! Pela Égide e sabedoria!' : 'É-ti-mi! A estratégia precede a vitória.';
    } else if (kind === 'ares') {
      phrase =
        action === 'attack'
          ? 'ARES: "Eisvolí! Sangue e Guerra!"'
          : 'ARES: "Próstagma? Onde está o combate?!"';
      translation = action === 'attack' ? 'Fúria sísmica do Deus da Guerra!' : 'Ares anseia pela batalha.';
      spoken = action === 'attack' ? 'Êiss-vo-lí! Sangue e guerra!' : 'Prós-tag-ma? Onde está o combate?';
    } else if (kind === 'hermes') {
      phrase =
        action === 'attack'
          ? 'HERMES: "Páme! Mais rápido que o relâmpago!"'
          : 'HERMES: "Asas do Olimpo ao seu dispor."';
      translation = action === 'attack' ? 'Rajada celeste de Hermes!' : 'Mensageiro divino pronto.';
      spoken = action === 'attack' ? 'Pá-me! Mais rápido que o relâmpago!' : 'Asas do Olimpo ao seu dispor.';
    } else if (kind === 'apolo') {
      phrase =
        action === 'attack'
          ? 'APOLO: "Que o fogo solar reduza-os a cinzas!"'
          : 'APOLO: "A luz do Sol ilumina o campo."';
      translation = action === 'attack' ? 'Flechas solares de Apolo!' : 'Apolo mira o horizonte.';
      spoken = action === 'attack' ? 'Que o fogo solar reduza-os a cinzas!' : 'A luz do Sol ilumina o campo.';
    } else if (kind === 'dionisio') {
      phrase =
        action === 'attack'
          ? 'DIONÍSIO: "O frenesi dionisíaco os consumirá!"'
          : 'DIONÍSIO: "Kalós! Celebremos a vitória antecipada!"';
      translation = action === 'attack' ? 'Onda arcana das vinhas sagradas!' : 'Dionísio abençoa a marcha.';
      spoken = action === 'attack' ? 'O frenesi dionisíaco os consumirá!' : 'Ka-lóss! Celebremos a vitória!';
    } else if (kind === 'afrodite') {
      phrase =
        action === 'attack'
          ? 'AFRODITE: "Contemplem a fúria celestial da Beleza!"'
          : 'AFRODITE: "Étimi — nascida da espuma e das estrelas."';
      translation = action === 'attack' ? 'Explosão encantadora de Afrodite!' : 'Afrodite flutua em graça.';
      spoken = action === 'attack' ? 'Contemplem a fúria celestial!' : 'É-ti-mi, nascida das estrelas.';
    } else if (kind === 'hefesto') {
      phrase =
        action === 'attack'
          ? 'HEFESTO: "Sinta o martelo da Forja Olímpica!"'
          : 'HEFESTO: "Fogo e bronze moldam o destino."';
      translation = action === 'attack' ? 'Impacto vulcânico de Hefesto!' : 'Hefesto prepara o martelo.';
      spoken = action === 'attack' ? 'Sinta o martelo da forja olímpica!' : 'Fogo e bronze moldam o destino.';
    } else if (kind === 'artemis') {
      phrase =
        action === 'attack'
          ? 'ÁRTEMIS: "A caçada lunar nunca erra o alvo!"'
          : 'ÁRTEMIS: "Étimi! Sob o luar, somos implacáveis."';
      translation = action === 'attack' ? 'Chuva de flechas lunares de Ártemis!' : 'Ártemis vigia a floresta.';
      spoken = action === 'attack' ? 'A caçada lunar nunca erra o alvo!' : 'É-ti-mi! Sob o luar, somos implacáveis.';
    } else if (kind === 'ra') {
      phrase =
        action === 'attack'
          ? 'RÁ: "Khepresh! Que o Sol devore nossos inimigos!"'
          : 'RÁ: "O Disco Solar ilumina o Nilo."';
      translation = action === 'attack' ? 'Fogo solar de Rá!' : 'Rá vigia o reino.';
      spoken = action === 'attack' ? 'Ké-presh! Que o Sol devore nossos inimigos!' : 'O disco solar ilumina o Nilo.';
    } else if (kind === 'isis') {
      phrase =
        action === 'attack'
          ? 'ÍSIS: "Pela magia eterna de Kemet!"'
          : 'ÍSIS: "Nossos monumentos resistirão a tudo."';
      translation = action === 'attack' ? 'Encantamento destrutivo de Ísis!' : 'Ísis protege seu povo.';
      spoken = action === 'attack' ? 'Pela magia eterna de Kemet!' : 'Nossos monumentos resistirão a tudo.';
    } else if (kind === 'set') {
      phrase =
        action === 'attack'
          ? 'SET: "Tempestade de areia e caos!"'
          : 'SET: "As feras do deserto respondem ao meu chamado."';
      translation = action === 'attack' ? 'Fúria do deserto de Set!' : 'Set comanda as sombras.';
      spoken = action === 'attack' ? 'Tempestade de areia e caos!' : 'As feras do deserto respondem!';
    } else if (kind === 'titan') {
      phrase =
        pantheon === 'atlantean'
          ? action === 'attack'
            ? `TITÃ: "Mache! — ${chosen.phrase}"`
            : `Titã Atlante — "${chosen.phrase}"`
          : action === 'attack'
          ? `TITÃ: "${chosen.phrase}"`
          : `Titã Ancestral — "${chosen.phrase}"`;
      translation = action === 'attack' ? 'Rugido Titânico de Destruição!' : 'O Titã aguarda seu comando.';
      spoken = pantheon === 'atlantean' && action === 'attack' ? 'Má-rre!' : chosen.spoken;
    } else if (pantheon === 'atlantean') {
      // Todos os Atlantes (Castor, Heróis Atlantes, Cidadão, Oráculo, Militares e Promovidos a Herói)
      // usam exclusivamente o idioma atlante fictício pedido (Yuji?, Volat?, Scopos., Echlost., Mache!)
      const isCastorHero = kind === 'hero' || kind === 'ajax' || kind === 'jason' || kind === 'odysseus' || kind === 'hippolyta';
      if (isCastorHero) {
        const speaker = kind === 'ajax' ? 'HERÓI ATLANTE' : kind === 'hero' ? 'CASTOR' : 'CAMPEÃO DE ORICALCO';
        phrase = `${speaker}: "${chosen.phrase}"`;
        translation =
          action === 'attack'
            ? `${chosen.pt} (Por Atlântida!)`
            : `${chosen.pt} — Castor comanda.`;
      } else if (kind === 'behemoth') {
        phrase = action === 'attack' ? 'BEEMOTE: "Mache! ROOOAAAR!"' : `Beemote — "${chosen.phrase}"`;
        translation = action === 'attack' ? 'Investida colossal demolidora!' : chosen.pt;
      } else if (kind === 'hekagigantes') {
        phrase = action === 'attack' ? 'HECATÔNQUIRO: "Mache!"' : `Centimano — "${chosen.phrase}"`;
        translation = action === 'attack' ? 'Golpe sísmico dos cem braços!' : chosen.pt;
      } else {
        const heroBadge = isPromotedHero ? '★ Herói · ' : '';
        phrase = `${heroBadge}${chosen.phrase}`;
        translation = chosen.pt;
      }
    } else if (kind === 'hero' && pantheon === 'greek') {
      // Arkantos & Greek Hero Champions share the iconic Ancient Greek voice bank
      phrase = `ARKANTOS: "${chosen.phrase}"`;
      translation = `${chosen.pt} (Arkantos)`;
    } else if (kind === 'ajax') {
      phrase = `ÁJAX: "${chosen.phrase}"`;
      translation =
        action === 'attack'
          ? `${chosen.pt} (Escudo de Salamina!)`
          : `${chosen.pt} — Ájax`;
    } else if (kind === 'jason') {
      phrase = `JASÃO: "${chosen.phrase}"`;
      translation =
        action === 'attack'
          ? `${chosen.pt} (Pelos Argonautas!)`
          : `${chosen.pt} — Jasão`;
    } else if (kind === 'odysseus') {
      phrase = `ODISSEU: "${chosen.phrase}"`;
      translation =
        action === 'attack'
          ? `${chosen.pt} (Arco de Ítaca!)`
          : `${chosen.pt} — Rei de Ítaca`;
    } else if (kind === 'perseus') {
      phrase = `PERSEU: "${chosen.phrase}"`;
      translation = `${chosen.pt} — Matador da Górgona`;
    } else if (kind === 'bellerophon') {
      phrase = `BELEROFONTE: "${chosen.phrase}"`;
      translation = `${chosen.pt} — Cavaleiro de Pégaso`;
    } else if (kind === 'hippolyta') {
      phrase = `HIPÓLITA: "${chosen.phrase}"`;
      translation =
        action === 'attack'
          ? `${chosen.pt} (Pelas Amazonas!)`
          : `${chosen.pt} — Rainha Amazona`;
    } else if (kind === 'theseus') {
      phrase = `TESEU: "${chosen.phrase}"`;
      translation = `${chosen.pt} — Tático de Atenas`;
    } else if (kind === 'pharaoh' || kind === 'son_of_osiris') {
      const title = kind === 'son_of_osiris' ? 'FILHO DE OSÍRIS' : 'FARAÓ';
      phrase = `${title}: "${chosen.phrase}"`;
      translation = `${chosen.pt} — Poder do Nilo`;
    } else if (kind === 'hersir' || kind === 'valkyrie') {
      const title = kind === 'valkyrie' ? 'VALQUÍRIA' : 'HERSIR';
      phrase = `${title}: "${chosen.phrase}"`;
      translation = `${chosen.pt} — Por Asgard`;
    } else if (kind === 'cyclops') {
      phrase = action === 'attack' ? 'CICLOPE: "Eis máchin! GRAAAH!"' : `Ciclope: "${chosen.phrase}"`;
      translation = action === 'attack' ? 'O Ciclope agarra e arremessa os inimigos!' : chosen.pt;
      spoken = action === 'attack' ? 'Êiss má-rrin! Esmagar!' : chosen.spoken;
    }

    const result: UnitVoiceLineInfo = {
      phrase,
      translation,
      cultureLabel: profile.cultureLabel,
      action,
    };

    if (!this.canPlay('unit_voice', 220)) {
      return result;
    }

    const scale = this.effectiveSfxScale;
    if (scale <= 0) {
      return result;
    }

    const kindPitchMult =
      kind === 'zeus' || kind === 'poseidon' || kind === 'hades' || kind === 'ra' || kind === 'set'
        ? 0.56
        : kind === 'ares' || kind === 'hefesto' || kind === 'dionisio'
        ? 0.64
        : kind === 'hermes' || kind === 'apolo'
        ? 0.78
        : kind === 'atena' || kind === 'afrodite' || kind === 'artemis' || kind === 'isis'
        ? 1.18
        : kind === 'titan'
        ? 0.52
        : kind === 'colossus' || kind === 'hydra' || kind === 'cyclops' || kind === 'hekagigantes' || kind === 'behemoth'
        ? 0.62
        : kind === 'minotaur' || kind === 'manticore' || kind === 'automaton' || kind === 'iron_dwarf' || kind === 'promethean' || kind === 'argus' || kind === 'tartarian_spawn' || kind === 'carnivora'
        ? 0.72
        : kind === 'siege' || kind === 'ram' || kind === 'fire_siphon' || kind === 'onager' || kind === 'cheiroballista'
        ? 0.75
        : kind === 'ajax' || kind === 'perseus' || kind === 'destroyer'
        ? 0.84
        : kind === 'jason' || kind === 'theseus' || kind === 'odysseus' || kind === 'bellerophon' || kind === 'hero' || kind === 'hoplite' || kind === 'myrmidon' || kind === 'murmillo' || kind === 'katapeltes' || kind === 'fanatic'
        ? 0.92
        : kind === 'cavalry' || kind === 'prodromos' || kind === 'pegasus' || kind === 'turma' || kind === 'contarius' || kind === 'llama_caravan'
        ? 0.96
        : isFemaleUnit || kind === 'phoenix' || kind === 'stymphalian_bird'
        ? 1.2
        : kind === 'archer' || kind === 'peltast' || kind === 'gastraphetes' || kind === 'satyr' || kind === 'arcus' || kind === 'oracle'
        ? 1.04
        : 1.0;

    // 1. Try real browser SpeechSynthesis with phonetic pronunciation
    const speechPitch = Math.max(0.45, Math.min(1.5, kindPitchMult * (isPromotedHero ? 0.94 : 1.0)));
    const speechRate =
      action === 'attack'
        ? 1.14
        : kind === 'titan' || kind === 'zeus' || kind === 'poseidon' || kind === 'hades'
        ? 0.92
        : 1.04;
    const spokeLive = this.speakSpokenText(spoken, {
      pitch: speechPitch,
      rate: speechRate,
      isFemale: isFemaleUnit,
    });

    const ctx = this.ensureContext();
    if (!ctx) {
      return result;
    }

    const now = ctx.currentTime;
    // 2. If SpeechSynthesis has no voices loaded, synthesize expressive 3-formant vocal syllables
    if (!spokeLive) {
      const isDarkTone =
        kind === 'titan' ||
        kind === 'zeus' ||
        kind === 'poseidon' ||
        kind === 'hades' ||
        kind === 'ares' ||
        kind === 'hefesto' ||
        kind === 'minotaur' ||
        kind === 'cyclops' ||
        kind === 'colossus' ||
        kind === 'hydra' ||
        kind === 'manticore' ||
        kind === 'automaton' ||
        kind === 'behemoth' ||
        kind === 'hekagigantes' ||
        kind === 'promethean' ||
        kind === 'argus' ||
        kind === 'tartarian_spawn' ||
        kind === 'carnivora';

      this.playVowelFormantCadence(
        ctx,
        scale,
        spoken,
        profile.basePitch * kindPitchMult,
        profile.formantF1,
        profile.formantF2,
        chosen.syllables,
        action,
        groupSize,
        isDarkTone
      );
    }

    if (action === 'attack') {
      const hornOsc = ctx.createOscillator();
      const hornGain = ctx.createGain();
      hornOsc.type = groupSize > 1 ? 'sawtooth' : 'triangle';
      const hornFreq = profile.hornPitch * (groupSize > 2 ? 1.0 : 0.85);
      hornOsc.frequency.setValueAtTime(hornFreq, now);
      hornOsc.frequency.exponentialRampToValueAtTime(hornFreq * 1.25, now + 0.22);
      hornGain.gain.setValueAtTime(0.001, now);
      hornGain.gain.linearRampToValueAtTime((spokeLive ? 0.045 : 0.08) * scale, now + 0.03);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      hornOsc.connect(hornGain);
      hornGain.connect(ctx.destination);
      hornOsc.start(now);
      hornOsc.stop(now + 0.26);
    } else if (action === 'select') {
      this.playSelect();
    } else {
      this.playCommand();
    }

    return result;
  }

  public playBuild() {
    if (!this.canPlay('build', 160)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.11);
    gain.gain.setValueAtTime(0.05 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playSwordHit() {
    if (!this.canPlay('hit', 110)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260 + Math.random() * 90, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.08);
    gain.gain.setValueAtTime(0.04 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playArrow() {
    if (!this.canPlay('arrow', 120)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);
    gain.gain.setValueAtTime(0.035 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playLightning() {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.55;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.16));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  public playMeteor() {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.65);
    gain.gain.setValueAtTime(0.22 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  }

  public playFanfare(isVictory = false) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const notes = isVictory ? [293.66, 369.99, 440, 587.33] : [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.11;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.09 * scale, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.48);
    });
  }

  private getCultureScaleSemitones(pantheon: PantheonId): number[] {
    switch (pantheon) {
      case 'egyptian':
        // Escala Frígia Dominante (Hijaz Real do Nilo — mística, solar e majestosa)
        return [0, 1, 4, 5, 7, 8, 11, 12, 13, 16, 17, 19, 24];
      case 'greek':
        // Modo Dórico Heroico Helênico
        return [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19, 24];
      case 'norse':
        // Modo Eólio Viking Ancestral
        return [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 19, 22, 24];
      case 'atlantean':
        // Modo Lídio Celestial de Oricalco
        return [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19, 24];
      case 'chinese':
      case 'japanese':
        // Pentatônica Imperial
        return [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 31];
      default:
        // Escala Épica Modal
        return [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 24];
    }
  }

  public getAgeThemeInfo(age: AgeLevel, pantheon: PantheonId = 'greek'): {
    title: string;
    intensityLabel: string;
    description: string;
  } {
    const civName = CULTURE_VOICE_BANK[pantheon]?.cultureLabel ?? 'Civilização';
    switch (age) {
      case 1:
        return {
          title: 'Tema I · Despertar Arcaico',
          intensityLabel: 'Intensidade I (Sutil / Tribal)',
          description: `Percussão ancestral e sopro rústico de fundação (${civName}).`,
        };
      case 2:
        return {
          title: 'Tema II · Chamado Clássico',
          intensityLabel: 'Intensidade II (Marcial / Nobre)',
          description: `Trompas de bronze em tríade ascendente e tambores de marcha (${civName}).`,
        };
      case 3:
        return {
          title: 'Tema III · Fanfarra Heroica',
          intensityLabel: 'Intensidade III (Polifônica / Forte)',
          description: `Metais em quintas paralelas, rufar de tímpanos e brilho metálico (${civName}).`,
        };
      case 4:
        return {
          title: 'Tema IV · Sinfonia Mítica',
          intensityLabel: 'Intensidade IV (Orquestral / Majestosa)',
          description: `Coro místico formante, sub-grave sísmico, gongo sagrado e fanfarra real (${civName}).`,
        };
      case 5:
      default:
        return {
          title: 'Tema V · Apoteose da Era dos Deuses',
          intensityLabel: 'Intensidade V (Máxima / Divina)',
          description: `Trovão celestial, coro divino em múltiplas oitavas, carrilhão solar e fanfarra apoteótica (${civName}).`,
        };
    }
  }

  /**
   * Notificação sonora tocada ao INICIAR a transição para uma nova Era.
   * Escala progressivamente em tensão rítmica e harmônica da Era II até a Era V.
   */
  public playAgeTransitionStart(targetAge: AgeLevel, pantheon: PantheonId = 'greek') {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const semitones = this.getCultureScaleSemitones(pantheon);
    const rootFreq = Math.max(165, Math.min(330, profile.hornPitch || 261.63));

    // Intensidade progressiva conforme a Era alvo (2 -> 5)
    const intensity = Math.max(1, Math.min(5, targetAge));
    const gainBoost = (0.48 + intensity * 0.14) * scale;
    const drumCount = intensity + 1; // Era 2: 3 toques, Era 3: 4, Era 4: 5, Era 5: 6

    // 1. Rufar de tambores cerimoniais preparatórios
    for (let i = 0; i < drumCount; i++) {
      const t = now + i * (0.11 - intensity * 0.008);
      const isLast = i === drumCount - 1;
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.type = 'sine';
      const startPitch = isLast ? 115 + intensity * 6 : 82 + i * 4;
      drumOsc.frequency.setValueAtTime(startPitch, t);
      drumOsc.frequency.exponentialRampToValueAtTime(32, t + (isLast ? 0.34 : 0.16));

      const hitVol = (isLast ? 0.18 : 0.08 + (i / drumCount) * 0.06) * gainBoost;
      drumGain.gain.setValueAtTime(0.001, t);
      drumGain.gain.linearRampToValueAtTime(hitVol, t + 0.012);
      drumGain.gain.exponentialRampToValueAtTime(0.001, t + (isLast ? 0.36 : 0.18));

      drumOsc.connect(drumGain);
      drumGain.connect(ctx.destination);
      drumOsc.start(t);
      drumOsc.stop(t + (isLast ? 0.38 : 0.2));
    }

    // 2. Motivo ascendente de trompa cultural anunciando o início da evolução
    const motifIndices =
      targetAge <= 2
        ? [0, 2, 4]
        : targetAge === 3
        ? [0, 2, 4, 6]
        : targetAge === 4
        ? [0, 2, 4, 6, 7]
        : [0, 2, 4, 6, 7, 9];

    motifIndices.forEach((degIdx, idx) => {
      const semi = semitones[degIdx % semitones.length];
      const freq = rootFreq * Math.pow(2, semi / 12);
      const noteStart = now + 0.06 + idx * 0.11;
      const isFinal = idx === motifIndices.length - 1;
      const noteDur = isFinal ? 0.45 + intensity * 0.08 : 0.18;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = pantheon === 'egyptian' || pantheon === 'greek' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900 + intensity * 380, noteStart);
      filter.Q.value = 2.2;

      const peak = (isFinal ? 0.11 : 0.075) * gainBoost;
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(peak, noteStart + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteStart);
      osc.stop(noteStart + noteDur + 0.02);
    });
  }

  /**
   * Sistema de Notificação Sonora Épica para Transição de Era (Eras I a V).
   * - Utiliza a escala musical e o timbre da civilização do jogador.
   * - Sobe progressivamente de intensidade, camadas orquestrais, graves, coro e duração
   *   conforme o jogador avança da Era I (Arcaica) até a Era V (Era dos Deuses).
   */
  public playAgeTransitionComplete(age: AgeLevel, pantheon: PantheonId = 'greek', isEnemy = false) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const semitones = this.getCultureScaleSemitones(pantheon);
    const baseRoot = Math.max(146.83, Math.min(311.13, profile.hornPitch || 261.63));
    const eraLevel = Math.max(1, Math.min(5, age)) as AgeLevel;

    // Se for o inimigo avançando de era, toca uma trompa de aviso ameaçadora e distante que escala com a Era
    if (isEnemy) {
      const warnGain = (0.35 + eraLevel * 0.12) * scale;
      const warnNotes = eraLevel >= 4 ? [4, 1, 0, -5] : [2, 1, 0];
      warnNotes.forEach((deg, idx) => {
        const semi = deg >= 0 ? semitones[deg % semitones.length] : deg;
        const freq = baseRoot * 0.75 * Math.pow(2, semi / 12);
        const start = now + idx * 0.22;
        const dur = idx === warnNotes.length - 1 ? 0.65 + eraLevel * 0.1 : 0.26;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480 + eraLevel * 140, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.09 * warnGain, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
      return;
    }

    // Parâmetros de escalada progressiva de intensidade (Era 1 -> Era 5)
    // Era 1: Sutil/Tribal | Era 2: Clássica/Marcial | Era 3: Heroica/Polifônica | Era 4: Mítica/Orquestral | Era 5: Apoteose Divina
    const intensityMult = [0, 0.52, 0.74, 0.96, 1.20, 1.48][eraLevel] * scale;
    const unisonVoices = [0, 1, 2, 3, 4, 6][eraLevel];
    const filterCutoff = [0, 1100, 1650, 2400, 3400, 4800][eraLevel];
    const sustainTail = [0, 0.45, 0.68, 0.95, 1.35, 1.85][eraLevel];

    // =========================================================================
    // CAMADA 1: Percussão de Guerra & Sub-Bass Impact (cresce em peso e número)
    // =========================================================================
    const drumPattern: { time: number; pitch: number; vol: number; dur: number }[] =
      eraLevel === 1
        ? [
            { time: 0.0, pitch: 88, vol: 0.16, dur: 0.26 },
            { time: 0.28, pitch: 98, vol: 0.22, dur: 0.38 },
          ]
        : eraLevel === 2
        ? [
            { time: 0.0, pitch: 92, vol: 0.20, dur: 0.24 },
            { time: 0.18, pitch: 96, vol: 0.18, dur: 0.22 },
            { time: 0.36, pitch: 112, vol: 0.28, dur: 0.48 },
          ]
        : eraLevel === 3
        ? [
            { time: 0.0, pitch: 96, vol: 0.24, dur: 0.24 },
            { time: 0.14, pitch: 102, vol: 0.20, dur: 0.20 },
            { time: 0.28, pitch: 108, vol: 0.24, dur: 0.22 },
            { time: 0.42, pitch: 86, vol: 0.26, dur: 0.26 },
            { time: 0.60, pitch: 124, vol: 0.34, dur: 0.62 },
          ]
        : eraLevel === 4
        ? [
            { time: 0.0, pitch: 105, vol: 0.30, dur: 0.32 },
            { time: 0.12, pitch: 95, vol: 0.22, dur: 0.20 },
            { time: 0.24, pitch: 110, vol: 0.26, dur: 0.22 },
            { time: 0.36, pitch: 98, vol: 0.24, dur: 0.22 },
            { time: 0.48, pitch: 118, vol: 0.30, dur: 0.28 },
            { time: 0.66, pitch: 82, vol: 0.34, dur: 0.35 },
            { time: 0.88, pitch: 132, vol: 0.40, dur: 0.85 },
          ]
        : [
            // Era 5: Tambores Apocalípticos da Era dos Deuses
            { time: 0.0, pitch: 118, vol: 0.38, dur: 0.40 },
            { time: 0.10, pitch: 96, vol: 0.26, dur: 0.20 },
            { time: 0.20, pitch: 108, vol: 0.28, dur: 0.20 },
            { time: 0.30, pitch: 116, vol: 0.30, dur: 0.22 },
            { time: 0.42, pitch: 88, vol: 0.34, dur: 0.28 },
            { time: 0.56, pitch: 124, vol: 0.36, dur: 0.28 },
            { time: 0.72, pitch: 92, vol: 0.36, dur: 0.32 },
            { time: 0.90, pitch: 136, vol: 0.42, dur: 0.45 },
            { time: 1.12, pitch: 148, vol: 0.48, dur: 1.15 },
          ];

    drumPattern.forEach((hit) => {
      const t = now + hit.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hit.pitch, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + hit.dur);

      const peak = Math.min(0.45, hit.vol * intensityMult);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + hit.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + hit.dur + 0.02);
    });

    // Sub-Bass Drop Sísmico para Eras III, IV e V
    if (eraLevel >= 3) {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subDur = 0.7 + (eraLevel - 2) * 0.45;
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(68 + eraLevel * 6, now);
      subOsc.frequency.exponentialRampToValueAtTime(24, now + subDur);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(Math.min(0.38, 0.14 * intensityMult), now + 0.03);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + subDur);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + subDur + 0.03);
    }

    // =========================================================================
    // CAMADA 2: Melodia Épica Cultural & Fanfarra de Metais (Escala Progressiva)
    // =========================================================================
    // Cada Era possui um tema próprio na escala da civilização, ficando mais longo,
    // mais agudo no clímax e mais rico harmonicamente a cada avanço.
    const melodyByEra: Record<AgeLevel, { deg: number; delay: number; dur: number; accent?: boolean }[]> = {
      1: [
        { deg: 0, delay: 0.02, dur: 0.24 },
        { deg: 2, delay: 0.22, dur: 0.24 },
        { deg: 4, delay: 0.44, dur: 0.52, accent: true },
      ],
      2: [
        { deg: 0, delay: 0.0, dur: 0.18 },
        { deg: 2, delay: 0.16, dur: 0.18 },
        { deg: 4, delay: 0.32, dur: 0.22 },
        { deg: 7, delay: 0.52, dur: 0.68, accent: true },
      ],
      3: [
        { deg: 0, delay: 0.0, dur: 0.16 },
        { deg: 2, delay: 0.14, dur: 0.16 },
        { deg: 4, delay: 0.28, dur: 0.18 },
        { deg: 3, delay: 0.44, dur: 0.16 },
        { deg: 6, delay: 0.58, dur: 0.22 },
        { deg: 7, delay: 0.78, dur: 0.88, accent: true },
      ],
      4: [
        { deg: 0, delay: 0.0, dur: 0.15 },
        { deg: 2, delay: 0.13, dur: 0.15 },
        { deg: 4, delay: 0.26, dur: 0.16 },
        { deg: 6, delay: 0.40, dur: 0.18 },
        { deg: 4, delay: 0.56, dur: 0.15 },
        { deg: 7, delay: 0.70, dur: 0.22 },
        { deg: 9, delay: 0.90, dur: 0.26 },
        { deg: 11, delay: 1.12, dur: 1.15, accent: true },
      ],
      5: [
        { deg: 0, delay: 0.0, dur: 0.14 },
        { deg: 2, delay: 0.12, dur: 0.14 },
        { deg: 4, delay: 0.24, dur: 0.15 },
        { deg: 7, delay: 0.38, dur: 0.18 },
        { deg: 6, delay: 0.54, dur: 0.15 },
        { deg: 7, delay: 0.68, dur: 0.16 },
        { deg: 9, delay: 0.84, dur: 0.20 },
        { deg: 11, delay: 1.02, dur: 0.24 },
        { deg: 10, delay: 1.24, dur: 0.22 },
        { deg: 12, delay: 1.44, dur: 1.55, accent: true },
      ],
    };

    const melody = melodyByEra[eraLevel];
    melody.forEach((note) => {
      const semi = semitones[note.deg % semitones.length];
      const freq = baseRoot * Math.pow(2, semi / 12);
      const start = now + note.delay;
      const totalDur = note.dur + (note.accent ? sustainTail * 0.45 : 0);

      // Empilha vozes em uníssono/oitava/quinta conforme a Era avança
      for (let v = 0; v < unisonVoices; v++) {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Alterna entre sawtooth (metais/trompas) e triangle (corpo harmônico)
        if (eraLevel === 1) {
          osc.type = 'triangle';
        } else {
          osc.type = v % 2 === 0 ? 'sawtooth' : 'triangle';
        }

        // Harmonia polifônica progressiva:
        // v=0: fundamental | v=1: levemente detuned | v=2: quinta justa (1.498x) | v=3: oitava superior (2x) | v=4: oitava inferior (0.5x) | v=5: décima segunda (3x)
        let pitchMult = 1;
        if (v === 2 && eraLevel >= 3) pitchMult = 1.4983; // Quinta heroica
        else if (v === 3 && eraLevel >= 4) pitchMult = 2.0; // Oitava brilhante
        else if (v === 4 && eraLevel >= 5) pitchMult = 0.5; // Trompa sub-oitava colossal
        else if (v === 5 && eraLevel >= 5) pitchMult = 2.9966; // Harmônico celestial

        const detuneCents = v === 0 ? 0 : (v % 2 === 0 ? 1 : -1) * (3.5 + v * 2.2);
        osc.frequency.setValueAtTime(freq * pitchMult, start);
        osc.detune.setValueAtTime(detuneCents, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterCutoff * (note.accent ? 1.25 : 0.9), start);
        filter.Q.value = note.accent ? 2.8 : 1.6;

        const voiceWeight = v === 0 ? 1.0 : v === 1 ? 0.72 : 0.48;
        const notePeak =
          Math.min(0.28, (note.accent ? 0.115 : 0.082) * intensityMult * voiceWeight) /
          Math.sqrt(unisonVoices * 0.65);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(notePeak, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, start + totalDur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + totalDur + 0.03);
      }
    });

    // =========================================================================
    // CAMADA 3: Ornamento Cultural (Lira Grega / Sistro Egípcio / Gongo / Oricalco)
    // =========================================================================
    if (eraLevel >= 2) {
      const shimmerCount = eraLevel * 2;
      const shimmerBaseStart = now + (eraLevel >= 4 ? 0.35 : 0.18);
      for (let s = 0; s < shimmerCount; s++) {
        const semi = semitones[(s * 2) % semitones.length];
        const sFreq = baseRoot * (pantheon === 'egyptian' ? 3.0 : 2.0) * Math.pow(2, semi / 12);
        const sStart = shimmerBaseStart + s * (0.095 - eraLevel * 0.008);
        const sDur = 0.22 + eraLevel * 0.06;

        const sOsc = ctx.createOscillator();
        const sGain = ctx.createGain();
        sOsc.type = pantheon === 'egyptian' ? 'sine' : 'triangle';
        sOsc.frequency.setValueAtTime(sFreq, sStart);

        const sPeak = Math.min(0.14, (0.024 + eraLevel * 0.008) * intensityMult);
        sGain.gain.setValueAtTime(0.001, sStart);
        sGain.gain.linearRampToValueAtTime(sPeak, sStart + 0.012);
        sGain.gain.exponentialRampToValueAtTime(0.001, sStart + sDur);

        sOsc.connect(sGain);
        sGain.connect(ctx.destination);
        sOsc.start(sStart);
        sOsc.stop(sStart + sDur + 0.02);
      }
    }

    // =========================================================================
    // CAMADA 4: Coro Místico Formante & Pad Celestial (Eras IV e V)
    // =========================================================================
    if (eraLevel >= 4) {
      const choirStart = now + 0.15;
      const choirDur = eraLevel === 5 ? 2.95 : 2.1;
      const choirIntervals = eraLevel === 5 ? [0, 4, 7, 12] : [0, 4, 7];

      choirIntervals.forEach((semiOffset, idx) => {
        const semi = semitones[semiOffset % semitones.length];
        const cFreq = baseRoot * Math.pow(2, semi / 12);

        const cOsc = ctx.createOscillator();
        const formant1 = ctx.createBiquadFilter();
        const formant2 = ctx.createBiquadFilter();
        const cGain = ctx.createGain();

        cOsc.type = 'sawtooth';
        cOsc.frequency.setValueAtTime(cFreq, choirStart);
        cOsc.detune.setValueAtTime((idx - 1) * 8, choirStart);

        formant1.type = 'bandpass';
        formant1.frequency.setValueAtTime(profile.formantF1 || 540, choirStart);
        formant1.Q.value = 3.5;

        formant2.type = 'peaking';
        formant2.frequency.setValueAtTime(profile.formantF2 || 1520, choirStart);
        formant2.gain.value = 8;

        const cPeak = Math.min(0.18, (eraLevel === 5 ? 0.085 : 0.055) * intensityMult);
        cGain.gain.setValueAtTime(0.001, choirStart);
        cGain.gain.linearRampToValueAtTime(cPeak, choirStart + 0.35);
        cGain.gain.exponentialRampToValueAtTime(0.001, choirStart + choirDur);

        cOsc.connect(formant1);
        formant1.connect(formant2);
        formant2.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(choirStart);
        cOsc.stop(choirStart + choirDur + 0.04);
      });
    }

    // =========================================================================
    // CAMADA 5: Apoteose da Era dos Deuses (Era V) — Trovão + Sinos Dourados
    // =========================================================================
    if (eraLevel === 5) {
      // Estrondo de trovão celestial sincronizado com o clímax da fanfarra
      this.playLightning();
      const bellNotes = [12, 16, 19, 24];
      bellNotes.forEach((semi, bIdx) => {
        const bStart = now + 1.38 + bIdx * 0.14;
        const bFreq = baseRoot * 2 * Math.pow(2, semi / 12);
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bFreq, bStart);

        bGain.gain.setValueAtTime(0.001, bStart);
        bGain.gain.linearRampToValueAtTime(Math.min(0.2, 0.075 * intensityMult), bStart + 0.015);
        bGain.gain.exponentialRampToValueAtTime(0.001, bStart + 1.25);

        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(bStart);
        bOsc.stop(bStart + 1.28);
      });
    }
  }

  public playUnitDeath() {
    if (!this.canPlay('unit_death', 100)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
    gain.gain.setValueAtTime(0.08 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playTaunt(tone = 520, spokenText?: string) {
    if (!this.canPlay('taunt', 120)) return;
    if (spokenText) {
      this.speakSpokenText(spokenText, { pitch: Math.max(0.75, Math.min(1.25, tone / 520)), rate: 1.04 });
    }
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(tone, now);
    osc.frequency.exponentialRampToValueAtTime(tone * 1.35, now + 0.12);
    gain.gain.setValueAtTime(0.08 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // =========================================================================
  // HYBRID DYNAMIC SOUNDTRACK ENGINE (AoM / Retold)
  // =========================================================================

  public getCurrentMusicInfo(): {
    trackId: string;
    title: string;
    displayTitle: string;
    subtitle: string;
    mood: MusicMood;
    scene: MusicScene;
    pantheon: PantheonId;
  } {
    const track = MUSIC_TRACKS[this.currentTrackId] ?? MUSIC_TRACKS.cat_mittens;
    const isMellowMix =
      this.musicScene === 'match' && this.musicMood === 'mellow' && track.category === 'match';
    return {
      trackId: track.id,
      title: track.title,
      displayTitle: isMellowMix ? `${track.title} — Quiet Mix` : track.title,
      subtitle: track.subtitle,
      mood: this.musicMood,
      scene: this.musicScene,
      pantheon: this.musicPantheon,
    };
  }

  public setMusicScene(scene: MusicScene, pantheon?: PantheonId) {
    if (pantheon) this.musicPantheon = pantheon;
    const prevScene = this.musicScene;
    this.musicScene = scene;

    if (scene === 'title') {
      this.musicPausedDuck = false;
      this.campaignPinnedTrackId = null;
      if (prevScene !== 'title') {
        this.titleCycleIndex = 0;
        this.switchMusicTrack('cat_mittens');
      }
    } else if (scene === 'credits') {
      this.musicPausedDuck = false;
      this.switchMusicTrack('garys_reserve');
    } else if (scene === 'victory') {
      this.musicPausedDuck = false;
      this.switchMusicTrack('doorknob');
    } else if (scene === 'defeat') {
      this.musicPausedDuck = false;
      this.switchMusicTrack('other_sunset');
    }

    this.updateMusicBusGain();
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    }
  }

  public previewPantheonTheme(pantheon: PantheonId) {
    this.musicPantheon = pantheon;
    if (this.musicScene === 'title') {
      const civTrackId = PANTHEON_THEME_TRACK[pantheon] ?? 'greek_to_me';
      this.switchMusicTrack(civTrackId);
    }
  }

  public startMatchMusic(pantheon: PantheonId, scenarioTitle?: string) {
    this.musicScene = 'match';
    this.musicPantheon = pantheon;
    this.musicMood = 'standard';
    this.musicPausedDuck = false;
    this.campaignPinnedTrackId = null;
    this.matchPlaylistIdx = Math.floor(Math.random() * MATCH_MUSIC_PLAYLIST.length);

    let initialTrackId = PANTHEON_THEME_TRACK[pantheon] ?? 'greek_to_me';
    if (scenarioTitle) {
      const lower = scenarioTitle.toLowerCase();
      if (lower.includes('titã') || lower.includes('atlânt')) {
        initialTrackId = 'hotlantis';
      } else if (lower.includes('egito') || lower.includes('nilo')) {
        initialTrackId = 'nd_nile';
      } else if (lower.includes('nórdic') || lower.includes('midgard') || lower.includes('gigante')) {
        initialTrackId = 'of_norse_not';
      } else if (lower.includes('prólogo') || lower.includes('olimp')) {
        initialTrackId = 'greek_to_me';
      }
      this.campaignPinnedTrackId = initialTrackId;
    }

    this.switchMusicTrack(initialTrackId);
    this.updateMusicBusGain();
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    }
  }

  public setCampaignMusicTrigger(trackId: string) {
    if (!MUSIC_TRACKS[trackId]) return;
    this.campaignPinnedTrackId = trackId;
    this.musicScene = 'match';
    this.switchMusicTrack(trackId);
  }

  public setMusicMood(mood: MusicMood) {
    if (this.musicMood === mood) return;
    this.musicMood = mood;
    this.updateMusicBusGain();
  }

  public setMusicPausedDuck(paused: boolean) {
    if (this.musicPausedDuck === paused) return;
    this.musicPausedDuck = paused;
    this.updateMusicBusGain();
  }

  public skipToNextMusicTrack() {
    if (this.musicScene === 'match') {
      this.campaignPinnedTrackId = null;
      const nextId = MATCH_MUSIC_PLAYLIST[this.matchPlaylistIdx % MATCH_MUSIC_PLAYLIST.length];
      this.matchPlaylistIdx = (this.matchPlaylistIdx + 1) % MATCH_MUSIC_PLAYLIST.length;
      this.switchMusicTrack(nextId);
    } else if (this.musicScene === 'title') {
      this.titleCycleIndex = (this.titleCycleIndex + 1) % 2;
      const civTrack = PANTHEON_THEME_TRACK[this.musicPantheon] ?? 'greek_to_me';
      this.switchMusicTrack(this.titleCycleIndex === 0 ? 'cat_mittens' : civTrack);
    }
  }

  public previewMusicTrack(trackId: string) {
    if (!MUSIC_TRACKS[trackId]) return;
    this.switchMusicTrack(trackId);
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    }
  }

  private switchMusicTrack(trackId: string) {
    if (!MUSIC_TRACKS[trackId]) return;
    this.currentTrackId = trackId;
    this.musicStep = 0;
    this.musicTrackStartedAt = performance.now();
    if (this.ctx) {
      this.musicNextNoteTime = Math.max(this.ctx.currentTime + 0.04, this.musicNextNoteTime);
    }
  }

  /**
   * Instant musical stinger when entering major combat.
   */
  public playCombatCue(pantheon: PantheonId = this.musicPantheon) {
    if (!this.canPlay('combat_cue', 18000)) return;
    const ctx = this.ensureContext();
    const scale = Math.max(this.effectiveSfxScale, this.effectiveMusicScale);
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    this.musicCueDuckUntil = Math.max(this.musicCueDuckUntil, now + 1.35);
    this.updateMusicBusGain();

    const track = MUSIC_TRACKS[PANTHEON_THEME_TRACK[pantheon] ?? 'greek_to_me'];
    const root = (track?.rootHz ?? 220) * 0.5;
    const intervals = [0, 7, 12];

    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.14;
      const drum = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(105 + i * 12, t);
      drum.frequency.exponentialRampToValueAtTime(34, t + 0.24);
      drumGain.gain.setValueAtTime(0.001, t);
      drumGain.gain.linearRampToValueAtTime(0.18 * scale, t + 0.012);
      drumGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      drum.connect(drumGain);
      drumGain.connect(ctx.destination);
      drum.start(t);
      drum.stop(t + 0.28);
    }

    intervals.forEach((semi, idx) => {
      const start = now + 0.16 + idx * 0.06;
      const freq = root * Math.pow(2, semi / 12);
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.085 * scale, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.72);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.75);
    });
  }

  /**
   * Instant divine musical cue triggered when casting a God Power.
   */
  public playGodPowerCue(id: GodPowerId, pantheon: PantheonId = this.musicPantheon) {
    if (!this.canPlay('god_power_cue', 900)) return;
    const ctx = this.ensureContext();
    const scale = Math.max(this.effectiveSfxScale, this.effectiveMusicScale);
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    this.musicCueDuckUntil = Math.max(this.musicCueDuckUntil, now + 1.5);
    this.updateMusicBusGain();

    const isAggressive =
      id === 'meteor' ||
      id === 'lightning' ||
      id === 'lightning_storm' ||
      id === 'volcanic_eruption' ||
      id === 'tremor' ||
      id === 'undermine' ||
      id === 'tornado' ||
      id === 'sandstorm' ||
      id === 'black_hole' ||
      id === 'chaos';

    const root = pantheon === 'norse' ? 196.0 : pantheon === 'atlantean' ? 246.94 : 220.0;
    const chord = isAggressive ? [0, 3, 7, 12] : [0, 4, 7, 11, 14];

    chord.forEach((semi, idx) => {
      const start = now + idx * 0.065;
      const freq = root * Math.pow(2, semi / 12);
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = isAggressive ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isAggressive ? 2200 : 2800, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime((isAggressive ? 0.075 : 0.065) * scale, start + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.95);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.98);
    });
  }

  private startMusicScheduler() {
    if (this.effectiveMusicScale <= 0 || typeof window === 'undefined') return;
    if (this.musicIntervalId !== null) return;
    const bus = this.ensureMusicBus();
    if (!bus) return;
    this.musicNextNoteTime = bus.ctx.currentTime + 0.05;
    if (this.musicTrackStartedAt <= 0) {
      this.musicTrackStartedAt = performance.now();
    }
    this.updateMusicBusGain();
    this.musicIntervalId = window.setInterval(() => this.tickMusicScheduler(), 95);
  }

  private stopMusicScheduler() {
    if (this.musicIntervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.updateMusicBusGain();
  }

  private tickMusicScheduler() {
    const bus = this.ensureMusicBus();
    if (!bus) return;
    const { ctx, filter } = bus;
    if (ctx.state === 'suspended') return;

    this.updateMusicBusGain();

    const nowPerf = performance.now();
    const elapsedTrackSec = (nowPerf - this.musicTrackStartedAt) * 0.001;
    // Rotate tracks dynamically in match (~42s per cycle) and title (~36s alternating with last pantheon)
    if (this.musicScene === 'match' && !this.campaignPinnedTrackId && elapsedTrackSec >= 42) {
      this.skipToNextMusicTrack();
    } else if (this.musicScene === 'title' && elapsedTrackSec >= 36) {
      this.skipToNextMusicTrack();
    }

    const track = MUSIC_TRACKS[this.currentTrackId] ?? MUSIC_TRACKS.cat_mittens;
    const isMellow = this.musicScene === 'match' && this.musicMood === 'mellow';
    const effectiveBpm = isMellow ? track.bpm * 0.78 : track.bpm;
    const stepDur = 60 / effectiveBpm / 2; // eighth-note pulse

    if (this.musicNextNoteTime < ctx.currentTime) {
      this.musicNextNoteTime = ctx.currentTime + 0.04;
    }

    while (this.musicNextNoteTime < ctx.currentTime + 0.22) {
      this.scheduleMusicStep(ctx, filter, track, this.musicStep, this.musicNextNoteTime, stepDur, isMellow);
      this.musicNextNoteTime += stepDur;
      this.musicStep = (this.musicStep + 1) % 32;
    }
  }

  private scheduleMusicStep(
    ctx: AudioContext,
    dest: AudioNode,
    track: MusicTrackSpec,
    step: number,
    t: number,
    stepDur: number,
    isMellow: boolean
  ) {
    const idx = step % 16;
    const scale = track.scale;

    const noteFreq = (deg: number, octaveShift = 0) => {
      const len = scale.length;
      const wrapped = ((deg % len) + len) % len;
      const oct = Math.floor(deg / len) + octaveShift;
      const semi = scale[wrapped] + oct * 12;
      return track.rootHz * Math.pow(2, semi / 12);
    };

    // 1. Warm Sustaining Pad on bar boundaries (step 0 & 16)
    if (idx === 0) {
      const padIntervals = [0, 4, 7];
      padIntervals.forEach((semi, pIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = pIdx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(track.rootHz * 0.5 * Math.pow(2, semi / 12), t);
        const dur = stepDur * 15.2;
        const peak = isMellow ? 0.11 : 0.085;
        gain.gain.setValueAtTime(0.0005, t);
        gain.gain.linearRampToValueAtTime(peak, t + stepDur * 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + dur + 0.04);
      });
    }

    // 2. Lead Melody (softer flute/strings in Mellow Quiet Mix)
    const melDeg = track.melody[idx];
    if (melDeg >= 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isMellow ? 'sine' : track.leadWave;
      osc.frequency.setValueAtTime(noteFreq(melDeg, isMellow ? 0 : 0), t);
      const dur = stepDur * (isMellow ? 2.4 : 1.75);
      const peak = isMellow ? 0.14 : track.leadWave === 'sawtooth' ? 0.095 : 0.15;
      gain.gain.setValueAtTime(0.0008, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }

    // 3. Plucked Arpeggio (Harp / Oud / Koto / Guzheng / Lyre)
    const arpDeg = track.arp[idx];
    if (arpDeg >= 0 && (!isMellow || idx % 2 === 0)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteFreq(arpDeg, isMellow ? 0 : 1), t);
      const dur = stepDur * (isMellow ? 1.4 : 0.92);
      const peak = isMellow ? 0.07 : 0.08;
      gain.gain.setValueAtTime(0.0008, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }

    // 4. Bass Foundation
    const bassDeg = track.bass[idx];
    if (bassDeg >= 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isMellow ? 'sine' : track.bassWave;
      osc.frequency.setValueAtTime(noteFreq(bassDeg, -1), t);
      const dur = stepDur * 1.9;
      const peak = isMellow ? 0.14 : 0.16;
      gain.gain.setValueAtTime(0.0008, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }

    // 5. Cultural Percussion (tamed to soft pulse in Mellow Quiet Mix)
    if (isMellow) {
      if (idx === 0 || idx === 8) {
        const drum = ctx.createOscillator();
        const dGain = ctx.createGain();
        drum.type = 'sine';
        drum.frequency.setValueAtTime(72, t);
        drum.frequency.exponentialRampToValueAtTime(34, t + 0.18);
        dGain.gain.setValueAtTime(0.0008, t);
        dGain.gain.linearRampToValueAtTime(0.075, t + 0.015);
        dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
        drum.connect(dGain);
        dGain.connect(dest);
        drum.start(t);
        drum.stop(t + 0.22);
      }
      return;
    }

    const pStyle = track.percussionStyle;
    const isDownbeat = idx % 4 === 0;
    const isSyncopated = idx === 3 || idx === 6 || idx === 11 || idx === 14;
    if (pStyle === 'orchestral' && (isDownbeat || idx === 10)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(isDownbeat ? 92 : 135, t);
      drum.frequency.exponentialRampToValueAtTime(36, t + 0.18);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(isDownbeat ? 0.16 : 0.09, t + 0.01);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.22);
    } else if (pStyle === 'nile' && (isDownbeat || isSyncopated)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = isSyncopated ? 'triangle' : 'sine';
      drum.frequency.setValueAtTime(isSyncopated ? 240 : 112, t);
      drum.frequency.exponentialRampToValueAtTime(isSyncopated ? 120 : 48, t + 0.12);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(isSyncopated ? 0.09 : 0.15, t + 0.008);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.14);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.16);
    } else if (pStyle === 'nordic' && (idx === 0 || idx === 4 || idx === 8 || idx === 12 || idx === 14)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(idx === 0 || idx === 8 ? 78 : 96, t);
      drum.frequency.exponentialRampToValueAtTime(28, t + 0.22);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(0.19, t + 0.012);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.24);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.26);
    } else if (pStyle === 'mystic' && (idx === 0 || idx === 6 || idx === 12)) {
      const chime = ctx.createOscillator();
      const cGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(noteFreq(idx === 0 ? 7 : 9, 1), t);
      cGain.gain.setValueAtTime(0.0005, t);
      cGain.gain.linearRampToValueAtTime(0.055, t + 0.015);
      cGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.45);
      chime.connect(cGain);
      cGain.connect(dest);
      chime.start(t);
      chime.stop(t + 0.48);
    } else if (pStyle === 'eastern' && (isDownbeat || idx === 6 || idx === 14)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(idx % 8 === 0 ? 88 : 210, t);
      drum.frequency.exponentialRampToValueAtTime(idx % 8 === 0 ? 38 : 140, t + 0.16);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(idx % 8 === 0 ? 0.16 : 0.075, t + 0.01);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.18);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.2);
    } else if (pStyle === 'light' && (idx === 0 || idx === 8)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(84, t);
      drum.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(0.08, t + 0.012);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.18);
    }
  }
}

export const soundEngine = new SoundEngine();
