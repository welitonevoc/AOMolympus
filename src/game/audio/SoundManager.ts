import {
  CULTURE_VOICE_BANK,
  CulturalVoiceEntry,
  soundEngine,
} from '../audio';
import { PantheonId, UnitKind, UnitVoiceAction, UnitVoiceLineInfo } from '../types';

export type UnitActionType = UnitVoiceAction | 'order';
export type UnitSpeakTrigger = UnitActionType;

export interface UnitAudioClip extends CulturalVoiceEntry {
  id: string;
  unitType: UnitKind;
  pantheon: PantheonId;
  trigger: UnitActionType;
}

export interface UnitAudioProfile {
  unitType: UnitKind;
  defaultPantheon: PantheonId;
  voiceRole: 'citizen' | 'infantry' | 'archer' | 'cavalry' | 'hero' | 'siege' | 'myth' | 'god' | 'titan';
  isFemale?: boolean;
  pitchScale: number;
  rateScale: number;
  isDarkTone?: boolean;
  heroTitle?: string;
}

export interface SpeakOptions {
  pantheon?: PantheonId;
  groupSize?: number;
  isPromotedHero?: boolean;
  respectCooldown?: boolean;
}

/**
 * Banco de vozes clássico dos Gregos (comandos em Grego Antigo compartilhados entre
 * unidades regulares e heróis da campanha como Arkantos, Ájax e Odisseu).
 */
export const GREEK_VOICE_BANK: Record<'select' | 'move' | 'attack' | 'work', CulturalVoiceEntry[]> = {
  select: [
    { phrase: 'Próstagma?', pt: 'Ordens? / Qual o comando?', spoken: 'Prós-tag-ma?', syllables: [1.04, 1.16, 0.96] },
    { phrase: 'Lege.', pt: 'Fale!', spoken: 'Lê-gue.', syllables: [0.98, 1.15] },
    { phrase: 'Étimos.', pt: 'Pronto.', spoken: 'É-ti-moss.', syllables: [1.12, 1.0, 0.95] },
    { phrase: 'Né.', pt: 'Sim.', spoken: 'Né?', syllables: [1.14] },
  ],
  move: [
    { phrase: 'Vúlome.', pt: 'Eu quero / Vou fazê-lo.', spoken: 'Vú-lo-me.', syllables: [1.08, 0.98, 1.05] },
    { phrase: 'Málista.', pt: 'Sim, senhor / Certamente.', spoken: 'Má-lis-ta.', syllables: [1.12, 1.02, 0.94] },
    { phrase: 'Orthós.', pt: 'Correto / Certo.', spoken: 'Or-tóss.', syllables: [0.98, 1.14] },
    { phrase: 'Kalós.', pt: 'Bem / De acordo.', spoken: 'Ka-lóss.', syllables: [1.0, 1.1] },
    { phrase: 'Páme!', pt: 'Vamos!', spoken: 'Pá-me!', syllables: [1.16, 1.02] },
  ],
  attack: [
    { phrase: 'Eis máchin!', pt: 'Para a batalha!', spoken: 'Êiss má-rrin!', syllables: [1.06, 1.26, 1.18] },
    { phrase: 'Eisvolí!', pt: 'Invasão!', spoken: 'Êiss-vo-lí!', syllables: [1.05, 1.18, 1.34] },
    { phrase: 'Páme!', pt: 'Vamos!', spoken: 'Pá-me!', syllables: [1.22, 1.08] },
    { phrase: 'Próseche!', pt: 'Cuidado!', spoken: 'Pró-se-rre!', syllables: [1.16, 1.04, 1.14] },
  ],
  work: [
    { phrase: 'Vúlome.', pt: 'Vou fazê-lo.', spoken: 'Vú-lo-me.', syllables: [1.04, 0.98, 1.0] },
    { phrase: 'Málista.', pt: 'Certamente.', spoken: 'Má-lis-ta.', syllables: [1.08, 1.0, 0.94] },
    { phrase: 'Kalós.', pt: 'Bem / De acordo.', spoken: 'Ka-lóss.', syllables: [0.98, 1.08] },
    { phrase: 'Orthós.', pt: 'Correto.', spoken: 'Or-tóss.', syllables: [0.96, 1.08] },
  ],
};

/**
 * Banco de vozes dos Atlantes (expansão The Titans — idioma atlante de Castor,
 * Cidadãos, Oráculos, Soldados Humanos, Heróis promovidos e Unidades Míticas).
 */
export const ATLANTEAN_VOICE_BANK: Record<'select' | 'move' | 'attack' | 'work', CulturalVoiceEntry[]> = {
  select: [
    { phrase: 'Yuji?', pt: 'Ordens?', spoken: 'Iú-dji?', syllables: [1.04, 1.16] },
    { phrase: 'Volat?', pt: 'Qual o comando?', spoken: 'Vô-lat?', syllables: [1.02, 1.14] },
  ],
  move: [
    { phrase: 'Scopos.', pt: 'Confirmado — avançando.', spoken: 'Ess-kó-poss.', syllables: [1.0, 1.1, 1.02] },
    { phrase: 'Echlost.', pt: 'Ordem reconhecida.', spoken: 'Ék-lost.', syllables: [1.08, 0.98] },
  ],
  attack: [
    { phrase: 'Mache!', pt: 'Para a batalha!', spoken: 'Má-rre!', syllables: [1.22, 1.14] },
    { phrase: 'Scopos!', pt: 'Alvo confirmado — atacar!', spoken: 'Ess-kó-poss!', syllables: [1.06, 1.2, 1.12] },
  ],
  work: [
    { phrase: 'Echlost.', pt: 'Ordem reconhecida.', spoken: 'Ék-lost.', syllables: [1.04, 0.96] },
    { phrase: 'Scopos.', pt: 'Confirmado.', spoken: 'Ess-kó-poss.', syllables: [0.98, 1.08, 1.0] },
  ],
};

const UNIT_AUDIO_PROFILES: Record<UnitKind, UnitAudioProfile> = {
  // Gregos & Genéricos Compartilhados
  villager: { unitType: 'villager', defaultPantheon: 'greek', voiceRole: 'citizen', pitchScale: 1.0, rateScale: 1.02 },
  hoplite: { unitType: 'hoplite', defaultPantheon: 'greek', voiceRole: 'infantry', pitchScale: 0.92, rateScale: 1.04 },
  hipaspist: { unitType: 'hipaspist', defaultPantheon: 'greek', voiceRole: 'infantry', pitchScale: 0.96, rateScale: 1.05 },
  myrmidon: { unitType: 'myrmidon', defaultPantheon: 'greek', voiceRole: 'infantry', pitchScale: 0.9, rateScale: 1.04 },
  peltast: { unitType: 'peltast', defaultPantheon: 'greek', voiceRole: 'archer', pitchScale: 1.04, rateScale: 1.06 },
  archer: { unitType: 'archer', defaultPantheon: 'greek', voiceRole: 'archer', pitchScale: 1.04, rateScale: 1.05 },
  gastraphetes: { unitType: 'gastraphetes', defaultPantheon: 'greek', voiceRole: 'archer', pitchScale: 1.0, rateScale: 1.02 },
  cavalry: { unitType: 'cavalry', defaultPantheon: 'greek', voiceRole: 'cavalry', pitchScale: 0.96, rateScale: 1.06 },
  prodromos: { unitType: 'prodromos', defaultPantheon: 'greek', voiceRole: 'cavalry', pitchScale: 0.96, rateScale: 1.06 },
  jason: { unitType: 'jason', defaultPantheon: 'greek', voiceRole: 'hero', pitchScale: 0.92, rateScale: 1.02, heroTitle: 'JASÃO' },
  odysseus: { unitType: 'odysseus', defaultPantheon: 'greek', voiceRole: 'hero', pitchScale: 0.92, rateScale: 1.02, heroTitle: 'ODISSEU' },
  perseus: { unitType: 'perseus', defaultPantheon: 'greek', voiceRole: 'hero', pitchScale: 0.86, rateScale: 1.02, heroTitle: 'PERSEU' },
  bellerophon: { unitType: 'bellerophon', defaultPantheon: 'greek', voiceRole: 'hero', pitchScale: 0.92, rateScale: 1.04, heroTitle: 'BELEROFONTE' },
  hippolyta: { unitType: 'hippolyta', defaultPantheon: 'greek', voiceRole: 'hero', isFemale: true, pitchScale: 1.2, rateScale: 1.04, heroTitle: 'HIPÓLITA' },
  ajax: { unitType: 'ajax', defaultPantheon: 'greek', voiceRole: 'hero', pitchScale: 0.84, rateScale: 1.0, heroTitle: 'ÁJAX' },
  theseus: { unitType: 'theseus', defaultPantheon: 'greek', voiceRole: 'hero', pitchScale: 0.92, rateScale: 1.03, heroTitle: 'TESEU' },
  hero: { unitType: 'hero', defaultPantheon: 'greek', voiceRole: 'hero', pitchScale: 0.9, rateScale: 1.02, heroTitle: 'ARKANTOS' },
  ram: { unitType: 'ram', defaultPantheon: 'greek', voiceRole: 'siege', pitchScale: 0.75, rateScale: 0.96 },
  siege: { unitType: 'siege', defaultPantheon: 'greek', voiceRole: 'siege', pitchScale: 0.75, rateScale: 0.96 },
  minotaur: { unitType: 'minotaur', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 0.7, rateScale: 0.96, isDarkTone: true },
  centaur: { unitType: 'centaur', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 0.94, rateScale: 1.04 },
  cyclops: { unitType: 'cyclops', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 0.62, rateScale: 0.92, isDarkTone: true },
  manticore: { unitType: 'manticore', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 0.72, rateScale: 0.98, isDarkTone: true },
  medusa: { unitType: 'medusa', defaultPantheon: 'greek', voiceRole: 'myth', isFemale: true, pitchScale: 1.18, rateScale: 1.02 },
  hydra: { unitType: 'hydra', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 0.62, rateScale: 0.92, isDarkTone: true },
  colossus: { unitType: 'colossus', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 0.6, rateScale: 0.9, isDarkTone: true },
  nymph: { unitType: 'nymph', defaultPantheon: 'greek', voiceRole: 'myth', isFemale: true, pitchScale: 1.24, rateScale: 1.05 },
  pegasus: { unitType: 'pegasus', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 1.08, rateScale: 1.06 },
  satyr: { unitType: 'satyr', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 1.04, rateScale: 1.06 },
  automaton: { unitType: 'automaton', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.72, rateScale: 0.98, isDarkTone: true },
  iron_dwarf: { unitType: 'iron_dwarf', defaultPantheon: 'greek', voiceRole: 'myth', pitchScale: 0.74, rateScale: 0.98 },
  phoenix: { unitType: 'phoenix', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 1.2, rateScale: 1.06 },
  titan: { unitType: 'titan', defaultPantheon: 'greek', voiceRole: 'titan', pitchScale: 0.52, rateScale: 0.9, isDarkTone: true },
  zeus: { unitType: 'zeus', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.56, rateScale: 0.92, isDarkTone: true, heroTitle: 'ZEUS' },
  poseidon: { unitType: 'poseidon', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.56, rateScale: 0.92, isDarkTone: true, heroTitle: 'POSEIDON' },
  hades: { unitType: 'hades', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.54, rateScale: 0.9, isDarkTone: true, heroTitle: 'HADES' },
  atena: { unitType: 'atena', defaultPantheon: 'greek', voiceRole: 'god', isFemale: true, pitchScale: 1.18, rateScale: 0.98, heroTitle: 'ATENA' },
  ares: { unitType: 'ares', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.64, rateScale: 0.98, isDarkTone: true, heroTitle: 'ARES' },
  hermes: { unitType: 'hermes', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.82, rateScale: 1.06, heroTitle: 'HERMES' },
  apolo: { unitType: 'apolo', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.82, rateScale: 1.02, heroTitle: 'APOLO' },
  dionisio: { unitType: 'dionisio', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.68, rateScale: 0.98, heroTitle: 'DIONÍSIO' },
  afrodite: { unitType: 'afrodite', defaultPantheon: 'greek', voiceRole: 'god', isFemale: true, pitchScale: 1.22, rateScale: 0.98, heroTitle: 'AFRODITE' },
  hefesto: { unitType: 'hefesto', defaultPantheon: 'greek', voiceRole: 'god', pitchScale: 0.62, rateScale: 0.94, isDarkTone: true, heroTitle: 'HEFESTO' },
  artemis: { unitType: 'artemis', defaultPantheon: 'greek', voiceRole: 'god', isFemale: true, pitchScale: 1.18, rateScale: 1.02, heroTitle: 'ÁRTEMIS' },

  // Egípcios
  isis: { unitType: 'isis', defaultPantheon: 'egyptian', voiceRole: 'god', isFemale: true, pitchScale: 1.18, rateScale: 0.96, heroTitle: 'ÍSIS' },
  set: { unitType: 'set', defaultPantheon: 'egyptian', voiceRole: 'god', pitchScale: 0.56, rateScale: 0.92, isDarkTone: true, heroTitle: 'SET' },
  ra: { unitType: 'ra', defaultPantheon: 'egyptian', voiceRole: 'god', pitchScale: 0.58, rateScale: 0.92, isDarkTone: true, heroTitle: 'RÁ' },
  priest: { unitType: 'priest', defaultPantheon: 'egyptian', voiceRole: 'hero', pitchScale: 0.96, rateScale: 1.0 },
  pharaoh: { unitType: 'pharaoh', defaultPantheon: 'egyptian', voiceRole: 'hero', pitchScale: 0.86, rateScale: 0.98, heroTitle: 'FARAÓ' },
  son_of_osiris: { unitType: 'son_of_osiris', defaultPantheon: 'egyptian', voiceRole: 'hero', pitchScale: 0.78, rateScale: 0.96, heroTitle: 'FILHO DE OSÍRIS' },
  egypt_spearman: { unitType: 'egypt_spearman', defaultPantheon: 'egyptian', voiceRole: 'infantry', pitchScale: 0.98, rateScale: 1.04 },
  slinger: { unitType: 'slinger', defaultPantheon: 'egyptian', voiceRole: 'archer', pitchScale: 1.04, rateScale: 1.05 },
  axeman: { unitType: 'axeman', defaultPantheon: 'egyptian', voiceRole: 'infantry', pitchScale: 0.92, rateScale: 1.04 },
  chariot_archer: { unitType: 'chariot_archer', defaultPantheon: 'egyptian', voiceRole: 'cavalry', pitchScale: 0.96, rateScale: 1.05 },
  camel_rider: { unitType: 'camel_rider', defaultPantheon: 'egyptian', voiceRole: 'cavalry', pitchScale: 0.96, rateScale: 1.04 },
  war_elephant: { unitType: 'war_elephant', defaultPantheon: 'egyptian', voiceRole: 'cavalry', pitchScale: 0.74, rateScale: 0.94, isDarkTone: true },
  siege_tower: { unitType: 'siege_tower', defaultPantheon: 'egyptian', voiceRole: 'siege', pitchScale: 0.75, rateScale: 0.95 },
  egypt_catapult: { unitType: 'egypt_catapult', defaultPantheon: 'egyptian', voiceRole: 'siege', pitchScale: 0.75, rateScale: 0.95 },
  sphinx: { unitType: 'sphinx', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 0.8, rateScale: 0.98 },
  wadjet: { unitType: 'wadjet', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 0.94, rateScale: 1.02 },
  roc: { unitType: 'roc', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 0.88, rateScale: 1.0 },
  petsuchos: { unitType: 'petsuchos', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 0.78, rateScale: 0.96 },
  scarab: { unitType: 'scarab', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 0.72, rateScale: 0.94, isDarkTone: true },
  avenger: { unitType: 'avenger', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 0.78, rateScale: 1.0, isDarkTone: true },
  mummy: { unitType: 'mummy', defaultPantheon: 'egyptian', voiceRole: 'myth', pitchScale: 0.74, rateScale: 0.94, isDarkTone: true },

  // Nórdicos
  norse_dwarf: { unitType: 'norse_dwarf', defaultPantheon: 'norse', voiceRole: 'citizen', pitchScale: 0.82, rateScale: 1.0 },
  ox_cart: { unitType: 'ox_cart', defaultPantheon: 'norse', voiceRole: 'citizen', pitchScale: 0.84, rateScale: 0.98 },
  hersir: { unitType: 'hersir', defaultPantheon: 'norse', voiceRole: 'hero', pitchScale: 0.86, rateScale: 1.0, heroTitle: 'HERSIR' },
  godi: { unitType: 'godi', defaultPantheon: 'norse', voiceRole: 'hero', pitchScale: 0.92, rateScale: 1.0 },
  ulfsark: { unitType: 'ulfsark', defaultPantheon: 'norse', voiceRole: 'infantry', pitchScale: 0.9, rateScale: 1.04 },
  throwing_axeman: { unitType: 'throwing_axeman', defaultPantheon: 'norse', voiceRole: 'archer', pitchScale: 0.94, rateScale: 1.04 },
  raiding_cavalry: { unitType: 'raiding_cavalry', defaultPantheon: 'norse', voiceRole: 'cavalry', pitchScale: 0.94, rateScale: 1.05 },
  huskarl: { unitType: 'huskarl', defaultPantheon: 'norse', voiceRole: 'infantry', pitchScale: 0.88, rateScale: 1.02 },
  jarl: { unitType: 'jarl', defaultPantheon: 'norse', voiceRole: 'cavalry', pitchScale: 0.84, rateScale: 1.0 },
  portable_ram: { unitType: 'portable_ram', defaultPantheon: 'norse', voiceRole: 'siege', pitchScale: 0.76, rateScale: 0.96 },
  norse_ballista: { unitType: 'norse_ballista', defaultPantheon: 'norse', voiceRole: 'siege', pitchScale: 0.76, rateScale: 0.96 },
  troll: { unitType: 'troll', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.68, rateScale: 0.94, isDarkTone: true },
  valkyrie: { unitType: 'valkyrie', defaultPantheon: 'norse', voiceRole: 'myth', isFemale: true, pitchScale: 1.2, rateScale: 1.04, heroTitle: 'VALQUÍRIA' },
  einherjar: { unitType: 'einherjar', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.76, rateScale: 0.98 },
  frost_giant: { unitType: 'frost_giant', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.58, rateScale: 0.9, isDarkTone: true },
  mountain_giant: { unitType: 'mountain_giant', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.56, rateScale: 0.9, isDarkTone: true },
  battle_boar: { unitType: 'battle_boar', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.72, rateScale: 0.96, isDarkTone: true },
  kraken: { unitType: 'kraken', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.64, rateScale: 0.92, isDarkTone: true },
  rock_troll: { unitType: 'rock_troll', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.66, rateScale: 0.92, isDarkTone: true },
  fire_giant: { unitType: 'fire_giant', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.58, rateScale: 0.92, isDarkTone: true },
  fenris_wolf: { unitType: 'fenris_wolf', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.76, rateScale: 1.02, isDarkTone: true },
  nidhogg: { unitType: 'nidhogg', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.58, rateScale: 0.9, isDarkTone: true },
  jormungand: { unitType: 'jormungand', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.6, rateScale: 0.9, isDarkTone: true },
  fafnir: { unitType: 'fafnir', defaultPantheon: 'norse', voiceRole: 'myth', pitchScale: 0.62, rateScale: 0.92, isDarkTone: true },

  // Atlantes (The Titans & Retold)
  citizen: { unitType: 'citizen', defaultPantheon: 'atlantean', voiceRole: 'citizen', pitchScale: 1.0, rateScale: 1.03 },
  oracle: { unitType: 'oracle', defaultPantheon: 'atlantean', voiceRole: 'citizen', pitchScale: 1.04, rateScale: 1.02 },
  llama_caravan: { unitType: 'llama_caravan', defaultPantheon: 'atlantean', voiceRole: 'cavalry', pitchScale: 0.96, rateScale: 1.0 },
  murmillo: { unitType: 'murmillo', defaultPantheon: 'atlantean', voiceRole: 'infantry', pitchScale: 0.92, rateScale: 1.04 },
  katapeltes: { unitType: 'katapeltes', defaultPantheon: 'atlantean', voiceRole: 'infantry', pitchScale: 0.92, rateScale: 1.04 },
  turma: { unitType: 'turma', defaultPantheon: 'atlantean', voiceRole: 'cavalry', pitchScale: 0.96, rateScale: 1.06 },
  cheiroballista: { unitType: 'cheiroballista', defaultPantheon: 'atlantean', voiceRole: 'siege', pitchScale: 0.75, rateScale: 0.98 },
  arcus: { unitType: 'arcus', defaultPantheon: 'atlantean', voiceRole: 'archer', pitchScale: 1.04, rateScale: 1.04 },
  contarius: { unitType: 'contarius', defaultPantheon: 'atlantean', voiceRole: 'cavalry', pitchScale: 0.96, rateScale: 1.05 },
  destroyer: { unitType: 'destroyer', defaultPantheon: 'atlantean', voiceRole: 'infantry', pitchScale: 0.84, rateScale: 1.0 },
  fanatic: { unitType: 'fanatic', defaultPantheon: 'atlantean', voiceRole: 'infantry', pitchScale: 0.92, rateScale: 1.06 },
  fire_siphon: { unitType: 'fire_siphon', defaultPantheon: 'atlantean', voiceRole: 'siege', pitchScale: 0.75, rateScale: 0.96 },
  onager: { unitType: 'onager', defaultPantheon: 'atlantean', voiceRole: 'siege', pitchScale: 0.75, rateScale: 0.96 },
  promethean: { unitType: 'promethean', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.72, rateScale: 0.96, isDarkTone: true },
  promethean_offspring: { unitType: 'promethean_offspring', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.84, rateScale: 1.02 },
  caladria: { unitType: 'caladria', defaultPantheon: 'atlantean', voiceRole: 'myth', isFemale: true, pitchScale: 1.22, rateScale: 1.04 },
  behemoth: { unitType: 'behemoth', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.62, rateScale: 0.9, isDarkTone: true },
  stymphalian_bird: { unitType: 'stymphalian_bird', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 1.18, rateScale: 1.06 },
  dryad: { unitType: 'dryad', defaultPantheon: 'atlantean', voiceRole: 'myth', isFemale: true, pitchScale: 1.2, rateScale: 1.02 },
  hekagigantes: { unitType: 'hekagigantes', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.6, rateScale: 0.9, isDarkTone: true },
  argus: { unitType: 'argus', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.72, rateScale: 0.95, isDarkTone: true },
  lampades: { unitType: 'lampades', defaultPantheon: 'atlantean', voiceRole: 'myth', isFemale: true, pitchScale: 1.2, rateScale: 1.02 },
  carnivora: { unitType: 'carnivora', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.72, rateScale: 0.94, isDarkTone: true },
  tartarian_spawn: { unitType: 'tartarian_spawn', defaultPantheon: 'atlantean', voiceRole: 'myth', pitchScale: 0.7, rateScale: 0.94, isDarkTone: true },
};

/**
 * Mapeamento explícito de cada tipo de unidade (`UnitKind`) para o seu banco de vozes padrão
 * (Gregos, Atlantes ou respectiva cultura).
 */
export const UNIT_VOICE_BANK_MAP: Record<UnitKind, PantheonId> = Object.fromEntries(
  (Object.keys(UNIT_AUDIO_PROFILES) as UnitKind[]).map((kind) => [kind, UNIT_AUDIO_PROFILES[kind].defaultPantheon])
) as Record<UnitKind, PantheonId>;

const GOD_SOLO_LINES: Partial<Record<UnitKind, { select: CulturalVoiceEntry; attack: CulturalVoiceEntry; translationSelect: string; translationAttack: string }>> = {
  zeus: {
    select: { phrase: 'ZEUS: "O Rei do Olimpo atende ao chamado da Era V!"', pt: 'Zeus aguarda seu decreto divino.', spoken: 'O Rei do Olimpo atende ao chamado!', syllables: [1.0, 1.1, 0.96, 1.04] },
    attack: { phrase: 'ZEUS: "Fulminarei todos os mortais com o Trovão Supremo!"', pt: 'Trovão Supremo do Pai dos Deuses!', spoken: 'Fulminarei todos os mortais com o trovão supremo!', syllables: [1.06, 1.2, 1.32, 1.18] },
    translationSelect: 'Zeus aguarda seu decreto divino.',
    translationAttack: 'Trovão Supremo do Pai dos Deuses!',
  },
  poseidon: {
    select: { phrase: 'POSEIDON: "O Senhor dos Mares ergue seu Tridente!"', pt: 'Poseidon domina as águas.', spoken: 'O Senhor dos Mares ergue seu tridente!', syllables: [0.98, 1.12, 1.04] },
    attack: { phrase: 'POSEIDON: "Que os mares engulam suas muralhas!"', pt: 'Tsunami sísmico de Poseidon!', spoken: 'Que os mares engulam suas muralhas!', syllables: [1.08, 1.22, 1.3] },
    translationSelect: 'Poseidon domina as águas.',
    translationAttack: 'Tsunami sísmico de Poseidon!',
  },
  hades: {
    select: { phrase: 'HADES: "As sombras do Submundo obedecem."', pt: 'Hades reina sobre o campo.', spoken: 'As sombras do Submundo obedecem.', syllables: [0.94, 1.04, 0.96] },
    attack: { phrase: 'HADES: "Para as profundezas do Tártaro!"', pt: 'Chamas necróticas do Submundo!', spoken: 'Para as profundezas do Tártaro!', syllables: [1.04, 1.2, 1.28] },
    translationSelect: 'Hades reina sobre o campo.',
    translationAttack: 'Chamas necróticas do Submundo!',
  },
  atena: {
    select: { phrase: 'ATENA: "Étimi! A estratégia precede a vitória."', pt: 'Atena protege suas fileiras.', spoken: 'É-ti-mi! A estratégia precede a vitória.', syllables: [1.1, 1.04, 1.08] },
    attack: { phrase: 'ATENA: "Eis máchin! Pela Égide e Sabedoria!"', pt: 'Golpe sagrado da Égide de Atena!', spoken: 'Êiss má-rrin! Pela Égide e sabedoria!', syllables: [1.08, 1.24, 1.18] },
    translationSelect: 'Atena protege suas fileiras.',
    translationAttack: 'Golpe sagrado da Égide de Atena!',
  },
  ares: {
    select: { phrase: 'ARES: "Próstagma? Onde está o combate?!"', pt: 'Ares anseia pela batalha.', spoken: 'Prós-tag-ma? Onde está o combate?', syllables: [1.06, 1.18, 1.02] },
    attack: { phrase: 'ARES: "Eisvolí! Sangue e Guerra!"', pt: 'Fúria sísmica do Deus da Guerra!', spoken: 'Êiss-vo-lí! Sangue e guerra!', syllables: [1.1, 1.24, 1.34] },
    translationSelect: 'Ares anseia pela batalha.',
    translationAttack: 'Fúria sísmica do Deus da Guerra!',
  },
  hermes: {
    select: { phrase: 'HERMES: "Asas do Olimpo ao seu dispor."', pt: 'Mensageiro divino pronto.', spoken: 'Asas do Olimpo ao seu dispor.', syllables: [1.04, 1.12, 1.08] },
    attack: { phrase: 'HERMES: "Páme! Mais rápido que o relâmpago!"', pt: 'Rajada celeste de Hermes!', spoken: 'Pá-me! Mais rápido que o relâmpago!', syllables: [1.18, 1.22, 1.14] },
    translationSelect: 'Mensageiro divino pronto.',
    translationAttack: 'Rajada celeste de Hermes!',
  },
  apolo: {
    select: { phrase: 'APOLO: "A luz do Sol ilumina o campo."', pt: 'Apolo mira o horizonte.', spoken: 'A luz do Sol ilumina o campo.', syllables: [1.02, 1.08, 1.0] },
    attack: { phrase: 'APOLO: "Que o fogo solar reduza-os a cinzas!"', pt: 'Flechas solares de Apolo!', spoken: 'Que o fogo solar reduza-os a cinzas!', syllables: [1.06, 1.18, 1.26] },
    translationSelect: 'Apolo mira o horizonte.',
    translationAttack: 'Flechas solares de Apolo!',
  },
  dionisio: {
    select: { phrase: 'DIONÍSIO: "Kalós! Celebremos a vitória antecipada!"', pt: 'Dionísio abençoa a marcha.', spoken: 'Ka-lóss! Celebremos a vitória!', syllables: [1.0, 1.1, 1.04] },
    attack: { phrase: 'DIONÍSIO: "O frenesi dionisíaco os consumirá!"', pt: 'Onda arcana das vinhas sagradas!', spoken: 'O frenesi dionisíaco os consumirá!', syllables: [1.06, 1.18, 1.26] },
    translationSelect: 'Dionísio abençoa a marcha.',
    translationAttack: 'Onda arcana das vinhas sagradas!',
  },
  afrodite: {
    select: { phrase: 'AFRODITE: "Étimi — nascida da espuma e das estrelas."', pt: 'Afrodite flutua em graça.', spoken: 'É-ti-mi, nascida das estrelas.', syllables: [1.12, 1.04, 1.08] },
    attack: { phrase: 'AFRODITE: "Contemplem a fúria celestial da Beleza!"', pt: 'Explosão encantadora de Afrodite!', spoken: 'Contemplem a fúria celestial!', syllables: [1.08, 1.18, 1.24] },
    translationSelect: 'Afrodite flutua em graça.',
    translationAttack: 'Explosão encantadora de Afrodite!',
  },
  hefesto: {
    select: { phrase: 'HEFESTO: "Fogo e bronze moldam o destino."', pt: 'Hefesto prepara o martelo.', spoken: 'Fogo e bronze moldam o destino.', syllables: [0.96, 1.06, 0.98] },
    attack: { phrase: 'HEFESTO: "Sinta o martelo da Forja Olímpica!"', pt: 'Impacto vulcânico de Hefesto!', spoken: 'Sinta o martelo da forja olímpica!', syllables: [1.06, 1.18, 1.28] },
    translationSelect: 'Hefesto prepara o martelo.',
    translationAttack: 'Impacto vulcânico de Hefesto!',
  },
  artemis: {
    select: { phrase: 'ÁRTEMIS: "Étimi! Sob o luar, somos implacáveis."', pt: 'Ártemis vigia a floresta.', spoken: 'É-ti-mi! Sob o luar, somos implacáveis.', syllables: [1.12, 1.06, 1.02] },
    attack: { phrase: 'ÁRTEMIS: "A caçada lunar nunca erra o alvo!"', pt: 'Chuva de flechas lunares de Ártemis!', spoken: 'A caçada lunar nunca erra o alvo!', syllables: [1.08, 1.2, 1.28] },
    translationSelect: 'Ártemis vigia a floresta.',
    translationAttack: 'Chuva de flechas lunares de Ártemis!',
  },
  ra: {
    select: { phrase: 'RÁ: "O Disco Solar ilumina o Nilo."', pt: 'Rá vigia o reino.', spoken: 'O disco solar ilumina o Nilo.', syllables: [0.98, 1.08, 1.0] },
    attack: { phrase: 'RÁ: "Khepresh! Que o Sol devore nossos inimigos!"', pt: 'Fogo solar de Rá!', spoken: 'Ké-presh! Que o Sol devore nossos inimigos!', syllables: [1.12, 1.24, 1.3] },
    translationSelect: 'Rá vigia o reino.',
    translationAttack: 'Fogo solar de Rá!',
  },
  isis: {
    select: { phrase: 'ÍSIS: "Nossos monumentos resistirão a tudo."', pt: 'Ísis protege seu povo.', spoken: 'Nossos monumentos resistirão a tudo.', syllables: [1.04, 1.1, 1.02] },
    attack: { phrase: 'ÍSIS: "Pela magia eterna de Kemet!"', pt: 'Encantamento destrutivo de Ísis!', spoken: 'Pela magia eterna de Kemet!', syllables: [1.08, 1.2, 1.26] },
    translationSelect: 'Ísis protege seu povo.',
    translationAttack: 'Encantamento destrutivo de Ísis!',
  },
  set: {
    select: { phrase: 'SET: "As feras do deserto respondem ao meu chamado."', pt: 'Set comanda as sombras.', spoken: 'As feras do deserto respondem!', syllables: [0.96, 1.04, 0.94] },
    attack: { phrase: 'SET: "Tempestade de areia e caos!"', pt: 'Fúria do deserto de Set!', spoken: 'Tempestade de areia e caos!', syllables: [1.08, 1.2, 1.32] },
    translationSelect: 'Set comanda as sombras.',
    translationAttack: 'Fúria do deserto de Set!',
  },
};

export class SoundManager {
  private unitProfiles = new Map<UnitKind, UnitAudioProfile>();
  private unitClipRegistry = new Map<UnitKind, Map<UnitActionType, UnitAudioClip[]>>();
  private lastSpokenPhraseByUnit = new Map<string, string>();

  constructor() {
    this.registerAllDefaultUnits();
  }

  public getVoiceBankForPantheon(pantheon: PantheonId): Record<'select' | 'move' | 'attack' | 'work', CulturalVoiceEntry[]> {
    if (pantheon === 'greek') return GREEK_VOICE_BANK;
    if (pantheon === 'atlantean') return ATLANTEAN_VOICE_BANK;
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    return {
      select: profile.select,
      move: profile.move,
      attack: profile.attack,
      work: profile.work,
    };
  }

  public getVoiceBankForUnit(unitType: UnitKind, overridePantheon?: PantheonId): {
    pantheon: PantheonId;
    bank: Record<'select' | 'move' | 'attack' | 'work', CulturalVoiceEntry[]>;
  } {
    const pantheon = overridePantheon ?? UNIT_VOICE_BANK_MAP[unitType] ?? 'greek';
    return {
      pantheon,
      bank: this.getVoiceBankForPantheon(pantheon),
    };
  }

  private registerAllDefaultUnits() {
    const allKinds = Object.keys(UNIT_AUDIO_PROFILES) as UnitKind[];
    for (const unitType of allKinds) {
      this.registerUnitType(UNIT_AUDIO_PROFILES[unitType]);
    }
  }

  /**
   * Registers audio clips for a given unit type based on its mapped voice bank
   * (Greek, Atlantean, or cultural pantheon bank).
   */
  public registerUnitType(profile: UnitAudioProfile) {
    this.unitProfiles.set(profile.unitType, profile);
    const clipMap = new Map<UnitActionType, UnitAudioClip[]>();
    const bank = this.getVoiceBankForPantheon(profile.defaultPantheon);

    const actions: Array<'select' | 'move' | 'attack' | 'work'> = ['select', 'move', 'attack', 'work'];
    for (const action of actions) {
      const entries = bank[action] ?? bank.select;
      clipMap.set(
        action,
        entries.map((entry, idx) => ({
          id: `${profile.unitType}_${profile.defaultPantheon}_${action}_${idx}`,
          unitType: profile.unitType,
          pantheon: profile.defaultPantheon,
          trigger: action,
          ...entry,
        }))
      );
    }

    const orderClips: UnitAudioClip[] = [
      ...(clipMap.get('move') ?? []),
      ...(clipMap.get('attack') ?? []),
      ...(clipMap.get('work') ?? []),
    ];
    clipMap.set('order', orderClips);

    this.unitClipRegistry.set(profile.unitType, clipMap);
  }

  /**
   * Registers an additional custom audio clip (phrase or external audio URL) for a unit type.
   */
  public registerClip(
    unitType: UnitKind,
    actionType: UnitActionType,
    clip: Omit<UnitAudioClip, 'unitType' | 'trigger'> & { pantheon?: PantheonId }
  ) {
    const profile = this.unitProfiles.get(unitType) ?? UNIT_AUDIO_PROFILES[unitType];
    let map = this.unitClipRegistry.get(unitType);
    if (!map) {
      map = new Map<UnitActionType, UnitAudioClip[]>();
      this.unitClipRegistry.set(unitType, map);
    }
    const resolvedClip: UnitAudioClip = {
      id: clip.id,
      unitType,
      pantheon: clip.pantheon ?? profile.defaultPantheon,
      trigger: actionType,
      phrase: clip.phrase,
      pt: clip.pt,
      spoken: clip.spoken,
      syllables: clip.syllables,
      audioUrl: clip.audioUrl,
    };

    const existing = map.get(actionType) ?? [];
    map.set(actionType, [...existing, resolvedClip]);

    if (actionType === 'move' || actionType === 'attack' || actionType === 'work') {
      const existingOrder = map.get('order') ?? [];
      map.set('order', [...existingOrder, resolvedClip]);
    }

    if (resolvedClip.audioUrl) {
      soundEngine.preloadAudioClip(resolvedClip.audioUrl);
    }
  }

  public getRegisteredUnitTypes(): UnitKind[] {
    return Array.from(this.unitClipRegistry.keys());
  }

  public getRegisteredClips(unitType: UnitKind, actionType?: UnitActionType): UnitAudioClip[] {
    const map = this.unitClipRegistry.get(unitType);
    if (!map) return [];
    if (actionType) {
      return [...(map.get(actionType) ?? [])];
    }
    const all: UnitAudioClip[] = [];
    for (const [key, list] of map.entries()) {
      if (key === 'order') continue;
      all.push(...list);
    }
    return all;
  }

  private pickRandomClip<T extends CulturalVoiceEntry>(clips: T[], historyKey: string): T {
    if (clips.length <= 1) return clips[0];
    const lastPhrase = this.lastSpokenPhraseByUnit.get(historyKey);
    const filtered = lastPhrase ? clips.filter((c) => c.phrase !== lastPhrase) : clips;
    const pool = filtered.length > 0 ? filtered : clips;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    this.lastSpokenPhraseByUnit.set(historyKey, picked.phrase);
    return picked;
  }

  /**
   * Triggers randomized phrases from the unit's mapped Greek or Atlantean (or active
   * pantheon) voice bank when the unit is selected ('select') or ordered
   * ('order' | 'move' | 'attack' | 'work').
   */
  public speak(
    unitType: UnitKind,
    actionType: UnitActionType = 'select',
    options: SpeakOptions = {}
  ): UnitVoiceLineInfo {
    const unitProfile = this.unitProfiles.get(unitType) ?? UNIT_AUDIO_PROFILES[unitType];
    const resolvedPantheon: PantheonId = options.pantheon ?? UNIT_VOICE_BANK_MAP[unitType] ?? unitProfile.defaultPantheon;
    const effectiveAction: UnitVoiceAction =
      actionType === 'order'
        ? (['move', 'attack', 'work'][Math.floor(Math.random() * 3)] as UnitVoiceAction)
        : actionType;

    const cultureProfile = CULTURE_VOICE_BANK[resolvedPantheon] ?? CULTURE_VOICE_BANK.greek;

    const registeredForAction = this.getRegisteredClips(unitType, actionType);
    const pantheonMatchedRegistered = registeredForAction.filter((c) => c.pantheon === resolvedPantheon);

    let candidateEntries: CulturalVoiceEntry[];
    if (pantheonMatchedRegistered.length > 0) {
      candidateEntries = pantheonMatchedRegistered;
    } else if (actionType === 'order') {
      const bank = this.getVoiceBankForPantheon(resolvedPantheon);
      candidateEntries = [...bank.move, ...bank.attack, ...bank.work];
    } else {
      const bank = this.getVoiceBankForPantheon(resolvedPantheon);
      candidateEntries = bank[actionType] && bank[actionType].length > 0 ? bank[actionType] : bank.select;
    }

    const chosen = this.pickRandomClip(candidateEntries, `${unitType}:${resolvedPantheon}:${actionType}`);
    let phrase = chosen.phrase;
    let translation = chosen.pt;
    let spoken = chosen.spoken;
    let syllables = chosen.syllables;

    const isFemaleUnit = Boolean(unitProfile.isFemale);
    if (resolvedPantheon === 'greek' && isFemaleUnit && phrase === 'Étimos.') {
      phrase = 'Étimi.';
      translation = 'Pronta.';
      spoken = 'É-ti-mi.';
    }

    const godLine = GOD_SOLO_LINES[unitType];
    if (godLine) {
      const entry = effectiveAction === 'attack' ? godLine.attack : godLine.select;
      phrase = entry.phrase;
      translation = effectiveAction === 'attack' ? godLine.translationAttack : godLine.translationSelect;
      spoken = entry.spoken;
      syllables = entry.syllables;
    } else if (unitType === 'titan') {
      phrase =
        resolvedPantheon === 'atlantean'
          ? effectiveAction === 'attack'
            ? `TITÃ: "Mache! — ${chosen.phrase}"`
            : `Titã Atlante — "${chosen.phrase}"`
          : effectiveAction === 'attack'
          ? `TITÃ: "${chosen.phrase}"`
          : `Titã Ancestral — "${chosen.phrase}"`;
      translation = effectiveAction === 'attack' ? 'Rugido Titânico de Destruição!' : 'O Titã aguarda seu comando.';
      spoken = resolvedPantheon === 'atlantean' && effectiveAction === 'attack' ? 'Má-rre!' : chosen.spoken;
    } else if (resolvedPantheon === 'atlantean') {
      const isCastorOrHero =
        unitType === 'hero' || unitType === 'ajax' || unitType === 'jason' || unitType === 'odysseus' || unitType === 'hippolyta';
      if (isCastorOrHero) {
        const speaker = unitType === 'ajax' ? 'HERÓI ATLANTE' : unitType === 'hero' ? 'CASTOR' : 'CAMPEÃO DE ORICALCO';
        phrase = `${speaker}: "${chosen.phrase}"`;
        translation =
          effectiveAction === 'attack' ? `${chosen.pt} (Por Atlântida!)` : `${chosen.pt} — Castor comanda.`;
      } else if (unitType === 'behemoth') {
        phrase = effectiveAction === 'attack' ? 'BEEMOTE: "Mache! ROOOAAAR!"' : `Beemote — "${chosen.phrase}"`;
        translation = effectiveAction === 'attack' ? 'Investida colossal demolidora!' : chosen.pt;
      } else if (unitType === 'hekagigantes') {
        phrase = effectiveAction === 'attack' ? 'HECATÔNQUIRO: "Mache!"' : `Centimano — "${chosen.phrase}"`;
        translation = effectiveAction === 'attack' ? 'Golpe sísmico dos cem braços!' : chosen.pt;
      } else {
        const heroBadge = options.isPromotedHero ? '★ Herói · ' : '';
        phrase = `${heroBadge}${chosen.phrase}`;
        translation = chosen.pt;
      }
    } else if (unitProfile.heroTitle) {
      if (unitType === 'hero' && resolvedPantheon === 'greek') {
        phrase = `ARKANTOS: "${chosen.phrase}"`;
        translation = `${chosen.pt} (Arkantos)`;
      } else {
        phrase = `${unitProfile.heroTitle}: "${chosen.phrase}"`;
        translation = `${chosen.pt} (${unitProfile.heroTitle})`;
      }
    } else if (unitType === 'cyclops') {
      phrase = effectiveAction === 'attack' ? 'CICLOPE: "Eis máchin! GRAAAH!"' : `Ciclope: "${chosen.phrase}"`;
      translation = effectiveAction === 'attack' ? 'O Ciclope agarra e arremessa os inimigos!' : chosen.pt;
      spoken = effectiveAction === 'attack' ? 'Êiss má-rrin! Esmagar!' : chosen.spoken;
    }

    const speechRate =
      (effectiveAction === 'attack' ? 1.14 : unitProfile.rateScale) * (options.isPromotedHero ? 0.98 : 1.0);
    const kindPitchMult = unitProfile.pitchScale * (options.isPromotedHero ? 0.94 : 1.0);

    return soundEngine.performVoiceClip({
      phrase,
      translation,
      spoken,
      cultureLabel: cultureProfile.cultureLabel,
      action: effectiveAction,
      syllables,
      basePitch: cultureProfile.basePitch,
      formantF1: cultureProfile.formantF1,
      formantF2: cultureProfile.formantF2,
      hornPitch: cultureProfile.hornPitch,
      kindPitchMult,
      speechRate,
      isFemale: isFemaleUnit,
      isDarkTone: Boolean(unitProfile.isDarkTone),
      groupSize: options.groupSize ?? 1,
      audioUrl: chosen.audioUrl,
      respectCooldown: options.respectCooldown,
    });
  }
}

export const soundManager = new SoundManager();
