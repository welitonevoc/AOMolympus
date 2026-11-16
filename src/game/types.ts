export type PantheonId =
  | 'greek'
  | 'egyptian'
  | 'norse'
  | 'atlantean'
  | 'chinese'
  | 'aztec'
  | 'roman'
  | 'japanese'
  | 'eldritch'
  | 'celtic'
  | 'babylonian'
  | 'lakota'
  | 'jotunn';

export type ArchStyleId = 'greek' | 'egyptian' | 'norse' | 'atlantean';

export type DifficultyId = 'easy' | 'normal' | 'hard' | 'titan';

export type MapId =
  | 'mediterranean'
  | 'alfheim'
  | 'nile'
  | 'acropolis'
  | 'ghost_lake'
  | 'oasis'
  | 'jotunheim'
  | 'erebus'
  | 'yucatan'
  | 'yellow_river';

export type TeamId = 'player' | 'enemy';
export type ResourceType = 'food' | 'wood' | 'gold' | 'favor';
export type AgeLevel = 1 | 2 | 3 | 4 | 5;
export type DamageType = 'hack' | 'pierce' | 'crush';

export type GameTypeId = 'supremacy' | 'conquest' | 'lightning' | 'deathmatch' | 'regicide';
export type VisibilityMode = 'normal' | 'explored' | 'revealed';
export type WorldSizeId = 'normal' | 'large' | 'giant';

export type UnitKind =
  | 'villager'
  | 'hoplite'
  | 'hipaspist'
  | 'archer'
  | 'cavalry'
  | 'ajax'
  | 'hero'
  | 'siege'
  | 'minotaur'
  | 'centaur'
  | 'cyclops'
  | 'titan';

export type BuildingKind =
  | 'town_center'
  | 'house'
  | 'farm'
  | 'barracks'
  | 'armory'
  | 'market'
  | 'temple'
  | 'tower'
  | 'fortress'
  | 'titan_gate';

export type ResourceNodeKind = 'berry' | 'tree' | 'gold_mine';

export type GodPowerId =
  | 'prosperity'
  | 'healing'
  | 'frost'
  | 'lightning'
  | 'meteor'
  | 'volcanic_eruption'
  | 'blizzard'
  | 'darkest_night'
  | 'disease'
  | 'maelstrom'
  | 'necromancy'
  | 'black_hole'
  | 'solar_beam'
  | 'walking_woods'
  | 'chaos'
  | 'create_gold'
  | 'flaming_weapons'
  | 'great_hunt'
  | 'lightning_storm'
  | 'locust_swarm'
  | 'pestilence'
  | 'rain'
  | 'restoration'
  | 'sandstorm'
  | 'sentinel'
  | 'spiders'
  | 'tornado'
  | 'traitors'
  | 'tremor'
  | 'undermine';

export type GodPowerCategory = 'Ofensivo' | 'Econômico' | 'Defensivo';
export type FormationId = 'box' | 'line' | 'staggered';

export type TechId =
  | 'copper_weapons'
  | 'bronze_weapons'
  | 'iron_weapons'
  | 'copper_mail'
  | 'bronze_mail'
  | 'iron_mail'
  | 'hand_axe'
  | 'pickaxe'
  | 'plow'
  | 'watch_tower'
  | 'medium_soldiers'
  | 'heavy_soldiers'
  | 'champion_soldiers'
  | 'burning_pitch'
  | 'engineers'
  | 'omniscience'
  | 'mythic_rejuvenation'
  | 'secrets_of_titans';

export interface TechSpec {
  id: TechId;
  name: string;
  description: string;
  minAge: AgeLevel;
  building: 'armory' | 'barracks' | 'town_center' | 'temple' | 'fortress';
  cost: ResourceCost;
  researchTime: number;
  requires?: TechId;
}

export interface MinorGodSpec {
  id: string;
  name: string;
  age: 2 | 3 | 4;
  pantheon: PantheonId;
  godPower: GodPowerId;
  mythUnit: 'minotaur' | 'centaur' | 'cyclops';
  mythUnitTitle: string;
  passiveBonusLabel: string;
  attackBonusPct?: number;
  hpBonusPct?: number;
  gatherBonusPct?: number;
  speedBonusPct?: number;
}

export interface MajorGodSpec {
  id: string;
  name: string;
  pantheon: PantheonId;
  focus: string;
  favoredPower: GodPowerId;
  minorChoices: {
    2: [string, string];
    3: [string, string];
    4: [string, string];
  };
}

export interface FormationSpec {
  id: FormationId;
  name: string;
  description: string;
}

export const FORMATIONS: Record<FormationId, FormationSpec> = {
  box: {
    id: 'box',
    name: 'Bloco',
    description: 'Formação compacta em bloco com infantaria à frente e arqueiros atrás.',
  },
  line: {
    id: 'line',
    name: 'Linha',
    description: 'Linha de batalha estendida para maximizar a frente de combate.',
  },
  staggered: {
    id: 'staggered',
    name: 'Escalonada',
    description: 'Fileiras alternadas e espaçadas para reduzir dano em área.',
  },
};

export interface MapConfig {
  id: MapId;
  name: string;
  subtitle: string;
  waterColorHex: number;
  skyColorHex: number;
  foliageHex: number;
  foliageDarkHex: number;
  cliffHex: number;
  terrainTint: string;
  terrainPatchA: string;
  terrainPatchB: string;
}

export const MAPS: Record<MapId, MapConfig> = {
  mediterranean: {
    id: 'mediterranean',
    name: 'Mediterrâneo',
    subtitle: 'Ilha verdejante cercada pelo Mar Egeu',
    waterColorHex: 0x1a6885,
    skyColorHex: 0xbcd0e2,
    foliageHex: 0x2e5e32,
    foliageDarkHex: 0x204726,
    cliffHex: 0x6b7c4f,
    terrainTint: '#4e6b3b',
    terrainPatchA: 'rgba(98, 128, 62, 0.22)',
    terrainPatchB: 'rgba(56, 82, 42, 0.22)',
  },
  alfheim: {
    id: 'alfheim',
    name: 'Alfheim',
    subtitle: 'Planícies nórdicas com bosques nevados',
    waterColorHex: 0x1e4a6b,
    skyColorHex: 0xcbd5e1,
    foliageHex: 0x2b5344,
    foliageDarkHex: 0xdbeafe,
    cliffHex: 0x64748b,
    terrainTint: '#5b6c5a',
    terrainPatchA: 'rgba(195, 210, 224, 0.22)',
    terrainPatchB: 'rgba(52, 74, 62, 0.22)',
  },
  nile: {
    id: 'nile',
    name: 'Rio Nilo',
    subtitle: 'Dunas douradas divididas pelo vale turquesa',
    waterColorHex: 0x0e8da8,
    skyColorHex: 0xe6d5b8,
    foliageHex: 0x4d7c2b,
    foliageDarkHex: 0x3b6121,
    cliffHex: 0xb48a5a,
    terrainTint: '#b9935a',
    terrainPatchA: 'rgba(222, 186, 122, 0.24)',
    terrainPatchB: 'rgba(138, 102, 54, 0.20)',
  },
  acropolis: {
    id: 'acropolis',
    name: 'Acrópole',
    subtitle: 'Platôs elevados com vale central contestado',
    waterColorHex: 0x18587a,
    skyColorHex: 0xc2d4e4,
    foliageHex: 0x366938,
    foliageDarkHex: 0x254d27,
    cliffHex: 0x78716c,
    terrainTint: '#596b45',
    terrainPatchA: 'rgba(136, 132, 118, 0.22)',
    terrainPatchB: 'rgba(65, 92, 52, 0.20)',
  },
  ghost_lake: {
    id: 'ghost_lake',
    name: 'Lago Fantasma',
    subtitle: 'Lago congelado central cercado por pinheiros gélidos',
    waterColorHex: 0x7dd3fc,
    skyColorHex: 0xdbeafe,
    foliageHex: 0x29483e,
    foliageDarkHex: 0xe2e8f0,
    cliffHex: 0x94a3b8,
    terrainTint: '#7e8f9c',
    terrainPatchA: 'rgba(226, 232, 240, 0.28)',
    terrainPatchB: 'rgba(64, 84, 96, 0.22)',
  },
  oasis: {
    id: 'oasis',
    name: 'Oásis',
    subtitle: 'Deserto árido com palmeiras e água sagrada no centro',
    waterColorHex: 0x0ea5e9,
    skyColorHex: 0xf3d9b1,
    foliageHex: 0x4d7c2b,
    foliageDarkHex: 0x365314,
    cliffHex: 0xa16207,
    terrainTint: '#c2995d',
    terrainPatchA: 'rgba(234, 194, 130, 0.25)',
    terrainPatchB: 'rgba(146, 105, 52, 0.20)',
  },
  jotunheim: {
    id: 'jotunheim',
    name: 'Jotunheim',
    subtitle: 'Desfiladeiro glacial guardado por picos nevados',
    waterColorHex: 0x0c4a6e,
    skyColorHex: 0x94a3b8,
    foliageHex: 0x1e3a34,
    foliageDarkHex: 0xf1f5f9,
    cliffHex: 0x475569,
    terrainTint: '#9aa7b4',
    terrainPatchA: 'rgba(241, 245, 249, 0.30)',
    terrainPatchB: 'rgba(71, 85, 105, 0.24)',
  },
  erebus: {
    id: 'erebus',
    name: 'Érebo',
    subtitle: 'Terras vulcânicas do submundo com rios de obsidiana',
    waterColorHex: 0x991b1b,
    skyColorHex: 0x2e1f27,
    foliageHex: 0x451a03,
    foliageDarkHex: 0x292524,
    cliffHex: 0x3f3f46,
    terrainTint: '#362c2b',
    terrainPatchA: 'rgba(120, 53, 15, 0.25)',
    terrainPatchB: 'rgba(24, 24, 27, 0.32)',
  },
  yucatan: {
    id: 'yucatan',
    name: 'Yucatán',
    subtitle: 'Selva tropical densa rica em caça e templos antigos',
    waterColorHex: 0x0d9488,
    skyColorHex: 0xa7f3d0,
    foliageHex: 0x15803d,
    foliageDarkHex: 0x14532d,
    cliffHex: 0x4d7c0f,
    terrainTint: '#365e32',
    terrainPatchA: 'rgba(34, 139, 74, 0.24)',
    terrainPatchB: 'rgba(74, 92, 42, 0.22)',
  },
  yellow_river: {
    id: 'yellow_river',
    name: 'Rio Amarelo',
    subtitle: 'Planícies férteis orientais cortadas por rio dourado',
    waterColorHex: 0x856404,
    skyColorHex: 0xfde68a,
    foliageHex: 0x4d7c0f,
    foliageDarkHex: 0x3f6212,
    cliffHex: 0x854d0e,
    terrainTint: '#6b703a',
    terrainPatchA: 'rgba(161, 148, 72, 0.24)',
    terrainPatchB: 'rgba(63, 98, 18, 0.22)',
  },
};

export interface ResourceCost {
  food?: number;
  wood?: number;
  gold?: number;
  favor?: number;
}

export interface PantheonConfig {
  id: PantheonId;
  name: string;
  deity: string;
  minorGods: string;
  archStyle: ArchStyleId;
  architectureLabel: string;
  bonusLabel: string;
  primaryColor: string;
  bannerHex: number;
  accentHex: number;
  startingBonus: ResourceCost;
  favoredGodPower: GodPowerId;
}

export interface UnitStats {
  kind: UnitKind;
  name: string;
  role: string;
  minAge: AgeLevel;
  cost: ResourceCost;
  popCost: number;
  trainTime: number;
  maxHp: number;
  attack: number;
  damageType: DamageType;
  hackArmor: number;
  pierceArmor: number;
  crushArmor: number;
  bonusVsMyth?: number;
  bonusVsCavalry?: number;
  bonusVsArcher?: number;
  bonusVsInfantry?: number;
  bonusVsBuilding?: number;
  range: number;
  attackCooldown: number;
  speed: number;
  los: number;
  isMythic: boolean;
  isHero?: boolean;
  isSiege?: boolean;
  producedAt: 'town_center' | 'barracks' | 'temple' | 'fortress' | 'titan_gate';
}

export interface BuildingStats {
  kind: BuildingKind;
  name: string;
  role: string;
  minAge: AgeLevel;
  cost: ResourceCost;
  buildTime: number;
  maxHp: number;
  radius: number;
  popBonus: number;
  hackArmor: number;
  pierceArmor: number;
  crushArmor: number;
  attack?: number;
  range?: number;
}

export interface GodPowerSpec {
  id: GodPowerId;
  name: string;
  category: GodPowerCategory;
  description: string;
  minAge: AgeLevel;
  favorCost: number;
  cooldown: number;
  radius: number;
  targeted: boolean;
}

export const AGE_NAMES: Record<AgeLevel, string> = {
  1: 'Era Arcaica',
  2: 'Era Clássica',
  3: 'Era Heroica',
  4: 'Era Mítica',
  5: 'Era dos Titãs',
};

export const AGE_COSTS: Record<AgeLevel, ResourceCost> = {
  1: {},
  2: { food: 350, gold: 100 },
  3: { food: 650, gold: 350, favor: 15 },
  4: { food: 950, gold: 750, favor: 35 },
  5: { food: 800, wood: 800, gold: 800, favor: 50 },
};

export const PANTHEONS: Record<PantheonId, PantheonConfig> = {
  greek: {
    id: 'greek',
    name: 'Gregos',
    deity: 'Zeus',
    minorGods: 'Atena · Hermes · Apolo · Dionísio · Hefesto · Hera',
    archStyle: 'greek',
    architectureLabel: 'Mármore dórico e telhados de terracota',
    bonusLabel: 'Início com +100 Ouro e Relâmpago de Zeus fortalecido',
    primaryColor: '#2563eb',
    bannerHex: 0x2563eb,
    accentHex: 0xd4af37,
    startingBonus: { gold: 100, favor: 15 },
    favoredGodPower: 'lightning',
  },
  egyptian: {
    id: 'egyptian',
    name: 'Egípcios',
    deity: 'Rá',
    minorGods: 'Bast · Ptá · Anúbis · Hathor · Sekhmet · Osíris',
    archStyle: 'egyptian',
    architectureLabel: 'Pilones de arenito, obeliscos e discos solares',
    bonusLabel: 'Início com +120 Alimento e Chuva de Rá acelerada',
    primaryColor: '#d97706',
    bannerHex: 0xd97706,
    accentHex: 0x1e40af,
    startingBonus: { food: 120, favor: 20 },
    favoredGodPower: 'prosperity',
  },
  norse: {
    id: 'norse',
    name: 'Nórdicos',
    deity: 'Odin',
    minorGods: 'Freyja · Heimdall · Forseti · Skadi · Bragi · Baldr',
    archStyle: 'norse',
    architectureLabel: 'Salões de madeira escura, telhados íngremes e runas',
    bonusLabel: 'Início com +120 Madeira e Ragnarok Flamejante acelerado',
    primaryColor: '#0d9488',
    bannerHex: 0x0d9488,
    accentHex: 0xc0842a,
    startingBonus: { wood: 120, favor: 15 },
    favoredGodPower: 'meteor',
  },
  atlantean: {
    id: 'atlantean',
    name: 'Atlantes',
    deity: 'Cronos',
    minorGods: 'Prometeu · Oceano · Leto · Hipérion · Réia · Hélios',
    archStyle: 'atlantean',
    architectureLabel: 'Cúpulas turquesa, pedra marfim e oricalco',
    bonusLabel: 'Início com +25 Favor Divino e Fonte de Hécate acelerada',
    primaryColor: '#7c3aed',
    bannerHex: 0x7c3aed,
    accentHex: 0x38bdf8,
    startingBonus: { food: 60, wood: 60, favor: 25 },
    favoredGodPower: 'healing',
  },
  chinese: {
    id: 'chinese',
    name: 'Chineses',
    deity: 'Fu Xi',
    minorGods: 'Huangdi · Sun Wukong · Chang’e · He Bo · Zhong Kui · Ao Kuang',
    archStyle: 'atlantean',
    architectureLabel: 'Pagodes imperiais de jade e telhados curvos dourados',
    bonusLabel: 'Início com +80 Madeira, +80 Ouro e construções rápidas',
    primaryColor: '#dc2626',
    bannerHex: 0xdc2626,
    accentHex: 0xfacc15,
    startingBonus: { wood: 80, gold: 80, favor: 15 },
    favoredGodPower: 'solar_beam',
  },
  aztec: {
    id: 'aztec',
    name: 'Astecas',
    deity: 'Huitzilopochtli',
    minorGods: 'Xipe Totec · Tlaloc · Xolotl · Mictlantecuhtli · Mixcoatl',
    archStyle: 'egyptian',
    architectureLabel: 'Templos escalonados de calcário, jade e ouro solar',
    bonusLabel: 'Geração de Favor ampliada e Erupção Vulcânica fortalecida',
    primaryColor: '#16a34a',
    bannerHex: 0x16a34a,
    accentHex: 0xf59e0b,
    startingBonus: { food: 90, favor: 25 },
    favoredGodPower: 'volcanic_eruption',
  },
  roman: {
    id: 'roman',
    name: 'Romanos',
    deity: 'Júpiter',
    minorGods: 'Netuno · Apolo · Diana · Vulcano · Vênus · Marte',
    archStyle: 'greek',
    architectureLabel: 'Fóruns imperiais de mármore, arcos e estandartes púrpura',
    bonusLabel: 'Legiões blindadas (+100 Ouro) e Julgamento de Júpiter',
    primaryColor: '#991b1b',
    bannerHex: 0x991b1b,
    accentHex: 0xfbbf24,
    startingBonus: { food: 60, gold: 100, favor: 15 },
    favoredGodPower: 'lightning',
  },
  japanese: {
    id: 'japanese',
    name: 'Japoneses',
    deity: 'Izanagi',
    minorGods: 'Inari · Ebisu · Hachiman · Amaterasu · Susanoo · Raijin',
    archStyle: 'norse',
    architectureLabel: 'Santuários xintoístas de cedro, torii e armaduras laqueadas',
    bonusLabel: 'Samurais ágeis e tempestades de Raijin/Fujin',
    primaryColor: '#e11d48',
    bannerHex: 0xe11d48,
    accentHex: 0xfde047,
    startingBonus: { wood: 100, food: 60, favor: 20 },
    favoredGodPower: 'maelstrom',
  },
  eldritch: {
    id: 'eldritch',
    name: 'Eldritch',
    deity: 'Azathoth',
    minorGods: 'Ithaqua · Tsathoggua · Dagon · Yig · Cthulhu · Nyarlathotep',
    archStyle: 'atlantean',
    architectureLabel: 'Monólitos cósmicos de obsidiana e rituais abissais',
    bonusLabel: 'Início com +30 Favor e singularidade Buraco Negro',
    primaryColor: '#4c1d95',
    bannerHex: 0x4c1d95,
    accentHex: 0x2dd4bf,
    startingBonus: { favor: 30, gold: 80 },
    favoredGodPower: 'black_hole',
  },
  celtic: {
    id: 'celtic',
    name: 'Celtas',
    deity: 'Lugh',
    minorGods: 'Aengus · Brigid · Ceridwen · Cernunnos · Nuada · Taranis',
    archStyle: 'norse',
    architectureLabel: 'Fortes circulares de pedra musgosa e bosques druídicos',
    bonusLabel: 'Início com +120 Madeira e Bosques Vivos sagrados',
    primaryColor: '#15803d',
    bannerHex: 0x15803d,
    accentHex: 0xd97706,
    startingBonus: { wood: 120, food: 60, favor: 15 },
    favoredGodPower: 'walking_woods',
  },
  babylonian: {
    id: 'babylonian',
    name: 'Babilônios',
    deity: 'Marduk',
    minorGods: 'Shamash · Nergal · Ishtar · Tiamat · Nabu · Ea',
    archStyle: 'egyptian',
    architectureLabel: 'Zigurates de lápis-lazúli e tijolos esmaltados dourados',
    bonusLabel: 'Economia comercial forte e Tempestade de Maelstrom',
    primaryColor: '#1d4ed8',
    bannerHex: 0x1d4ed8,
    accentHex: 0xf59e0b,
    startingBonus: { gold: 120, food: 60, favor: 15 },
    favoredGodPower: 'maelstrom',
  },
  lakota: {
    id: 'lakota',
    name: 'Lakota',
    deity: 'Anpetu Wi',
    minorGods: 'Capa · Iktomi · Wani · Tate · Wakinyan · Unk',
    archStyle: 'norse',
    architectureLabel: 'Tendas cerimoniais, totens esculpidos e círculos sagrados',
    bonusLabel: 'Caça farta (+120 Alimento) e Fúria do Trovão Wakinyan',
    primaryColor: '#b45309',
    bannerHex: 0xb45309,
    accentHex: 0x38bdf8,
    startingBonus: { food: 120, wood: 60, favor: 20 },
    favoredGodPower: 'prosperity',
  },
  jotunn: {
    id: 'jotunn',
    name: 'Jotunn',
    deity: 'Surtr',
    minorGods: 'Skadi · Aegir · Ymir · Loki · Hel · Fenrir',
    archStyle: 'norse',
    architectureLabel: 'Bastiões glaciais de Jotunheim e forjas vulcânicas',
    bonusLabel: 'Gigantes resistentes e Nevasca Glacial',
    primaryColor: '#0284c7',
    bannerHex: 0x0284c7,
    accentHex: 0xf97316,
    startingBonus: { food: 80, wood: 80, favor: 20 },
    favoredGodPower: 'blizzard',
  },
};

export type CivilizationId = 'gregos' | 'egipcios' | 'nordicos' | 'atlantes';

export type GreekUnitKind = UnitKind;
export type EgyptianUnitKind = UnitKind;
export type NorseUnitKind = UnitKind;
export type AtlanteanUnitKind = UnitKind;

export type CultureUnitCost = ResourceCost;

export interface CultureUnitStats extends UnitStats {
  culture?: CivilizationId;
  culturalBonus?: string;
}

export interface GreekUnitStats extends CultureUnitStats {
  culture?: 'gregos';
}

export interface EgyptianUnitStats extends CultureUnitStats {
  culture?: 'egipcios';
}

export interface NorseUnitStats extends CultureUnitStats {
  culture?: 'nordicos';
}

export interface AtlanteanUnitStats extends CultureUnitStats {
  culture?: 'atlantes';
}

export interface CivilizationUnitMap {
  gregos: Record<GreekUnitKind, GreekUnitStats>;
  egipcios: Record<EgyptianUnitKind, EgyptianUnitStats>;
  nordicos: Record<NorseUnitKind, NorseUnitStats>;
  atlantes: Record<AtlanteanUnitKind, AtlanteanUnitStats>;
}

export const CIVILIZATION_UNITS: CivilizationUnitMap = {
  gregos: {
    villager: {
      kind: 'villager',
      name: 'Aldeão',
      role: 'Coleta recursos, cultiva fazendas e constrói',
      minAge: 1,
      cost: { food: 50 },
      popCost: 1,
      trainTime: 5.5,
      maxHp: 75,
      attack: 6,
      damageType: 'hack',
      hackArmor: 0.1,
      pierceArmor: 0.15,
      crushArmor: 0.1,
      range: 1.6,
      attackCooldown: 1.3,
      speed: 4.8,
      los: 14,
      isMythic: false,
      producedAt: 'town_center',
    },
    hoplite: {
      kind: 'hoplite',
      name: 'Hoplita',
      role: 'Infantaria pesada forte contra Cavalaria',
      minAge: 1,
      cost: { food: 55, gold: 40 },
      popCost: 2,
      trainTime: 6.5,
      maxHp: 155,
      attack: 15,
      damageType: 'hack',
      hackArmor: 0.35,
      pierceArmor: 0.2,
      crushArmor: 0.15,
      bonusVsCavalry: 1.5,
      range: 1.9,
      attackCooldown: 1.1,
      speed: 4.5,
      los: 16,
      isMythic: false,
      producedAt: 'barracks',
    },
    hipaspist: {
      kind: 'hipaspist',
      name: 'Hipaspista',
      role: 'Infantaria de elite com escudo pequeno e espada curta, ágil e versátil',
      minAge: 2,
      cost: { food: 60, gold: 35 },
      popCost: 2,
      trainTime: 6.0,
      maxHp: 165,
      attack: 16,
      damageType: 'hack',
      hackArmor: 0.4,
      pierceArmor: 0.25,
      crushArmor: 0.2,
      bonusVsInfantry: 1.25,
      range: 1.8,
      attackCooldown: 1.0,
      speed: 4.8,
      los: 17,
      isMythic: false,
      producedAt: 'barracks',
    },
    archer: {
      kind: 'archer',
      name: 'Toxotes',
      role: 'Arqueiro de longo alcance forte contra Infantaria',
      minAge: 2,
      cost: { wood: 55, gold: 35 },
      popCost: 2,
      trainTime: 6.5,
      maxHp: 100,
      attack: 13,
      damageType: 'pierce',
      hackArmor: 0.1,
      pierceArmor: 0.3,
      crushArmor: 0.1,
      bonusVsInfantry: 1.35,
      range: 12.5,
      attackCooldown: 1.25,
      speed: 4.9,
      los: 19,
      isMythic: false,
      producedAt: 'barracks',
    },
    cavalry: {
      kind: 'cavalry',
      name: 'Hippikon',
      role: 'Cavalaria rápida letal contra Arqueiros',
      minAge: 2,
      cost: { food: 80, gold: 60 },
      popCost: 3,
      trainTime: 7.5,
      maxHp: 215,
      attack: 21,
      damageType: 'hack',
      hackArmor: 0.25,
      pierceArmor: 0.35,
      crushArmor: 0.15,
      bonusVsArcher: 1.5,
      range: 2.1,
      attackCooldown: 1.05,
      speed: 7.5,
      los: 18,
      isMythic: false,
      producedAt: 'barracks',
    },
    ajax: {
      kind: 'ajax',
      name: 'Ajax',
      role: 'Herói Grego (Hero G Ajax Standard) — Escudo Torre Colossal de 7 Camadas, Lança Dory, Elmo de Crista Heroica e Golpe de Escudo',
      minAge: 1,
      cost: { food: 110, gold: 90, favor: 6 },
      popCost: 3,
      trainTime: 7.5,
      maxHp: 420,
      attack: 30,
      damageType: 'hack',
      hackArmor: 0.45,
      pierceArmor: 0.48,
      crushArmor: 0.4,
      bonusVsMyth: 3.5,
      range: 2.3,
      attackCooldown: 0.95,
      speed: 5.5,
      los: 20,
      isMythic: false,
      isHero: true,
      producedAt: 'town_center',
    },
    hero: {
      kind: 'hero',
      name: 'Herói Campeão',
      role: 'Campeão sagrado que causa 3x de dano contra Unidades Míticas',
      minAge: 2,
      cost: { food: 120, gold: 110, favor: 10 },
      popCost: 3,
      trainTime: 8.5,
      maxHp: 380,
      attack: 28,
      damageType: 'hack',
      hackArmor: 0.4,
      pierceArmor: 0.4,
      crushArmor: 0.35,
      bonusVsMyth: 3.0,
      range: 2.2,
      attackCooldown: 1.0,
      speed: 5.4,
      los: 20,
      isMythic: false,
      isHero: true,
      producedAt: 'fortress',
    },
    siege: {
      kind: 'siege',
      name: 'Arma de Cerco',
      role: 'Catapulta de longo alcance especialista em demolir construções',
      minAge: 3,
      cost: { wood: 160, gold: 130 },
      popCost: 4,
      trainTime: 10,
      maxHp: 310,
      attack: 48,
      damageType: 'crush',
      hackArmor: 0.08,
      pierceArmor: 0.75,
      crushArmor: 0.2,
      bonusVsBuilding: 2.4,
      range: 16.5,
      attackCooldown: 2.4,
      speed: 3.3,
      los: 20,
      isMythic: false,
      isSiege: true,
      producedAt: 'fortress',
    },
    minotaur: {
      kind: 'minotaur',
      name: 'Minotauro',
      role: 'Unidade Mítica de choque (Era Clássica)',
      minAge: 2,
      cost: { food: 140, favor: 16 },
      popCost: 3,
      trainTime: 9,
      maxHp: 420,
      attack: 36,
      damageType: 'hack',
      hackArmor: 0.4,
      pierceArmor: 0.35,
      crushArmor: 0.25,
      bonusVsBuilding: 1.4,
      range: 2.4,
      attackCooldown: 1.35,
      speed: 5.2,
      los: 20,
      isMythic: true,
      producedAt: 'temple',
    },
    centaur: {
      kind: 'centaur',
      name: 'Centauro',
      role: 'Unidade Mítica de ataque à distância (Era Heroica)',
      minAge: 3,
      cost: { wood: 145, favor: 22 },
      popCost: 3,
      trainTime: 9.5,
      maxHp: 310,
      attack: 29,
      damageType: 'pierce',
      hackArmor: 0.25,
      pierceArmor: 0.4,
      crushArmor: 0.2,
      range: 14.0,
      attackCooldown: 1.15,
      speed: 7.7,
      los: 21,
      isMythic: true,
      producedAt: 'temple',
    },
    cyclops: {
      kind: 'cyclops',
      name: 'Ciclope',
      role: 'Colosso Mítico demolidor (Era Mítica)',
      minAge: 4,
      cost: { food: 220, gold: 120, favor: 30 },
      popCost: 4,
      trainTime: 12,
      maxHp: 760,
      attack: 66,
      damageType: 'crush',
      hackArmor: 0.45,
      pierceArmor: 0.55,
      crushArmor: 0.35,
      bonusVsBuilding: 2.0,
      range: 2.8,
      attackCooldown: 1.65,
      speed: 4.4,
      los: 20,
      isMythic: true,
      producedAt: 'temple',
    },
    titan: {
      kind: 'titan',
      name: 'Titã Colossal',
      role: 'Entidade suprema invocada pelo Portão do Titã',
      minAge: 5,
      cost: {},
      popCost: 12,
      trainTime: 1,
      maxHp: 3800,
      attack: 165,
      damageType: 'crush',
      hackArmor: 0.65,
      pierceArmor: 0.75,
      crushArmor: 0.5,
      bonusVsBuilding: 2.6,
      range: 3.8,
      attackCooldown: 1.75,
      speed: 4.1,
      los: 24,
      isMythic: true,
      producedAt: 'titan_gate',
    },
  },
  egipcios: {
    // Egyptian civilization unit roster
    villager: { kind: 'villager', name: 'Aldeão Egípcio', role: 'Coleta e constrói', minAge: 1, cost: { food: 50 }, popCost: 1, trainTime: 5.5, maxHp: 75, attack: 6, damageType: 'hack', hackArmor: 0.1, pierceArmor: 0.15, crushArmor: 0.1, range: 1.6, attackCooldown: 1.3, speed: 4.8, los: 14, isMythic: false, producedAt: 'town_center' },
    hoplite: { kind: 'hoplite', name: 'Lanceiro Egípcio', role: 'Infantaria antiautoritária', minAge: 1, cost: { food: 55, gold: 40 }, popCost: 2, trainTime: 6.5, maxHp: 150, attack: 14, damageType: 'pierce', hackArmor: 0.3, pierceArmor: 0.3, crushArmor: 0.1, range: 2.0, attackCooldown: 1.1, speed: 4.5, los: 16, isMythic: false, producedAt: 'barracks' },
    hipaspist: { kind: 'hipaspist', name: 'Espadachim do Nilo', role: 'Infantaria ágil', minAge: 2, cost: { food: 60, gold: 35 }, popCost: 2, trainTime: 6.0, maxHp: 160, attack: 15, damageType: 'hack', hackArmor: 0.35, pierceArmor: 0.2, crushArmor: 0.15, range: 1.8, attackCooldown: 1.0, speed: 4.8, los: 17, isMythic: false, producedAt: 'barracks' },
    archer: { kind: 'archer', name: 'Atirador de Funda', role: 'Arqueiro leve', minAge: 2, cost: { wood: 50, gold: 35 }, popCost: 2, trainTime: 6.5, maxHp: 95, attack: 12, damageType: 'pierce', hackArmor: 0.1, pierceArmor: 0.25, crushArmor: 0.1, range: 12.0, attackCooldown: 1.2, speed: 5.0, los: 18, isMythic: false, producedAt: 'barracks' },
    cavalry: { kind: 'cavalry', name: 'Cavaleiro de Camelo', role: 'Cavalaria anti-cavalaria', minAge: 2, cost: { food: 85, gold: 55 }, popCost: 3, trainTime: 7.5, maxHp: 210, attack: 20, damageType: 'hack', hackArmor: 0.2, pierceArmor: 0.3, crushArmor: 0.15, range: 2.1, attackCooldown: 1.1, speed: 7.4, los: 18, isMythic: false, producedAt: 'barracks' },
    ajax: { kind: 'ajax', name: 'Herói Faraó', role: 'Líder divino', minAge: 1, cost: { food: 110, gold: 90, favor: 6 }, popCost: 3, trainTime: 7.5, maxHp: 410, attack: 29, damageType: 'hack', hackArmor: 0.4, pierceArmor: 0.45, crushArmor: 0.35, bonusVsMyth: 3.0, range: 2.2, attackCooldown: 1.0, speed: 5.4, los: 20, isMythic: false, isHero: true, producedAt: 'town_center' },
    hero: { kind: 'hero', name: 'Sacerdote', role: 'Curandeiro e guerreiro', minAge: 2, cost: { food: 120, gold: 100, favor: 10 }, popCost: 3, trainTime: 8.5, maxHp: 350, attack: 26, damageType: 'pierce', hackArmor: 0.35, pierceArmor: 0.4, crushArmor: 0.3, bonusVsMyth: 3.0, range: 4.0, attackCooldown: 1.2, speed: 5.2, los: 20, isMythic: false, isHero: true, producedAt: 'fortress' },
    siege: { kind: 'siege', name: 'Torre de Cerco', role: 'Cerco pesado', minAge: 3, cost: { wood: 170, gold: 120 }, popCost: 4, trainTime: 10, maxHp: 320, attack: 45, damageType: 'crush', hackArmor: 0.1, pierceArmor: 0.7, crushArmor: 0.2, bonusVsBuilding: 2.5, range: 15.0, attackCooldown: 2.5, speed: 3.2, los: 20, isMythic: false, isSiege: true, producedAt: 'fortress' },
    minotaur: { kind: 'minotaur', name: 'Esfinge', role: 'Mítico ágil', minAge: 2, cost: { food: 140, favor: 16 }, popCost: 3, trainTime: 9, maxHp: 410, attack: 35, damageType: 'hack', hackArmor: 0.38, pierceArmor: 0.35, crushArmor: 0.25, range: 2.4, attackCooldown: 1.3, speed: 5.5, los: 20, isMythic: true, producedAt: 'temple' },
    centaur: { kind: 'centaur', name: 'Anúbis Mítico', role: 'Guerreiro chacal', minAge: 3, cost: { wood: 140, favor: 20 }, popCost: 3, trainTime: 9.5, maxHp: 320, attack: 30, damageType: 'hack', hackArmor: 0.3, pierceArmor: 0.35, crushArmor: 0.2, range: 2.2, attackCooldown: 1.1, speed: 7.0, los: 21, isMythic: true, producedAt: 'temple' },
    cyclops: { kind: 'cyclops', name: 'Wadjet', role: 'Serpente titânica', minAge: 4, cost: { food: 210, gold: 110, favor: 28 }, popCost: 4, trainTime: 12, maxHp: 740, attack: 64, damageType: 'pierce', hackArmor: 0.4, pierceArmor: 0.6, crushArmor: 0.3, range: 6.0, attackCooldown: 1.6, speed: 4.5, los: 22, isMythic: true, producedAt: 'temple' },
    titan: { kind: 'titan', name: 'Titã Osíris', role: 'Entidade suprema egípcia', minAge: 5, cost: {}, popCost: 12, trainTime: 1, maxHp: 3700, attack: 160, damageType: 'crush', hackArmor: 0.6, pierceArmor: 0.7, crushArmor: 0.48, bonusVsBuilding: 2.6, range: 3.8, attackCooldown: 1.75, speed: 4.1, los: 24, isMythic: true, producedAt: 'titan_gate' },
  },
  nordicos: {
    // Norse civilization unit roster
    villager: { kind: 'villager', name: 'Anão / Coletor Nórdico', role: 'Coleta minérios e madeira', minAge: 1, cost: { food: 50 }, popCost: 1, trainTime: 5.5, maxHp: 80, attack: 6, damageType: 'hack', hackArmor: 0.15, pierceArmor: 0.15, crushArmor: 0.1, range: 1.6, attackCooldown: 1.3, speed: 4.8, los: 14, isMythic: false, producedAt: 'town_center' },
    hoplite: { kind: 'hoplite', name: 'Ulfsark', role: 'Guerreiro berserker', minAge: 1, cost: { food: 50, gold: 35 }, popCost: 2, trainTime: 6.0, maxHp: 160, attack: 16, damageType: 'hack', hackArmor: 0.25, pierceArmor: 0.2, crushArmor: 0.15, bonusVsBuilding: 1.3, range: 1.8, attackCooldown: 1.0, speed: 4.8, los: 16, isMythic: false, producedAt: 'barracks' },
    hipaspist: { kind: 'hipaspist', name: 'Guerreiro com Machado', role: 'Infantaria com machado de arremesso', minAge: 2, cost: { food: 55, gold: 35 }, popCost: 2, trainTime: 6.0, maxHp: 155, attack: 17, damageType: 'hack', hackArmor: 0.3, pierceArmor: 0.2, crushArmor: 0.15, range: 3.5, attackCooldown: 1.1, speed: 4.7, los: 17, isMythic: false, producedAt: 'barracks' },
    archer: { kind: 'archer', name: 'Arremessador', role: 'Arqueiro/machadeiro', minAge: 2, cost: { wood: 50, gold: 35 }, popCost: 2, trainTime: 6.5, maxHp: 105, attack: 14, damageType: 'pierce', hackArmor: 0.1, pierceArmor: 0.25, crushArmor: 0.1, range: 11.0, attackCooldown: 1.25, speed: 4.8, los: 18, isMythic: false, producedAt: 'barracks' },
    cavalry: { kind: 'cavalry', name: 'Cavaleiro Raiding', role: 'Cavalaria nórdica rápida', minAge: 2, cost: { food: 75, gold: 55 }, popCost: 3, trainTime: 7.0, maxHp: 220, attack: 22, damageType: 'hack', hackArmor: 0.25, pierceArmor: 0.3, crushArmor: 0.15, range: 2.0, attackCooldown: 1.0, speed: 7.8, los: 18, isMythic: false, producedAt: 'barracks' },
    ajax: { kind: 'ajax', name: 'Herói Jarl', role: 'Comandante nórdico de elite', minAge: 1, cost: { food: 110, gold: 90, favor: 6 }, popCost: 3, trainTime: 7.5, maxHp: 430, attack: 32, damageType: 'hack', hackArmor: 0.45, pierceArmor: 0.45, crushArmor: 0.4, bonusVsMyth: 3.5, range: 2.2, attackCooldown: 0.95, speed: 5.6, los: 20, isMythic: false, isHero: true, producedAt: 'town_center' },
    hero: { kind: 'hero', name: 'Einherjar', role: 'Guerreiro de Valhalla', minAge: 2, cost: { food: 120, gold: 100, favor: 10 }, popCost: 3, trainTime: 8.5, maxHp: 390, attack: 29, damageType: 'hack', hackArmor: 0.4, pierceArmor: 0.4, crushArmor: 0.35, bonusVsMyth: 3.0, range: 2.1, attackCooldown: 1.0, speed: 5.3, los: 20, isMythic: false, isHero: true, producedAt: 'fortress' },
    siege: { kind: 'siege', name: 'Aríete de Batalha', role: 'Aríete blindado', minAge: 3, cost: { wood: 150, gold: 120 }, popCost: 4, trainTime: 10, maxHp: 340, attack: 52, damageType: 'crush', hackArmor: 0.15, pierceArmor: 0.8, crushArmor: 0.25, bonusVsBuilding: 2.8, range: 2.5, attackCooldown: 2.3, speed: 3.4, los: 18, isMythic: false, isSiege: true, producedAt: 'fortress' },
    minotaur: { kind: 'minotaur', name: 'Troll das Neves', role: 'Monstro glacial', minAge: 2, cost: { food: 140, favor: 16 }, popCost: 3, trainTime: 9, maxHp: 430, attack: 37, damageType: 'crush', hackArmor: 0.42, pierceArmor: 0.35, crushArmor: 0.3, range: 2.5, attackCooldown: 1.4, speed: 5.0, los: 20, isMythic: true, producedAt: 'temple' },
    centaur: { kind: 'centaur', name: 'Valquíria', role: 'Guerreira voadora/montada', minAge: 3, cost: { wood: 140, favor: 22 }, popCost: 3, trainTime: 9.5, maxHp: 330, attack: 31, damageType: 'pierce', hackArmor: 0.3, pierceArmor: 0.45, crushArmor: 0.25, range: 12.0, attackCooldown: 1.1, speed: 8.0, los: 22, isMythic: true, producedAt: 'temple' },
    cyclops: { kind: 'cyclops', name: 'Gigante de Gelo', role: 'Colosso glacial', minAge: 4, cost: { food: 220, gold: 120, favor: 30 }, popCost: 4, trainTime: 12, maxHp: 780, attack: 68, damageType: 'crush', hackArmor: 0.48, pierceArmor: 0.55, crushArmor: 0.38, range: 3.0, attackCooldown: 1.7, speed: 4.3, los: 21, isMythic: true, producedAt: 'temple' },
    titan: { kind: 'titan', name: 'Titã Ymir', role: 'Entidade suprema nórdica', minAge: 5, cost: {}, popCost: 12, trainTime: 1, maxHp: 3900, attack: 170, damageType: 'crush', hackArmor: 0.68, pierceArmor: 0.75, crushArmor: 0.52, bonusVsBuilding: 2.6, range: 3.8, attackCooldown: 1.75, speed: 4.1, los: 24, isMythic: true, producedAt: 'titan_gate' },
  },
  atlantes: {
    // Atlantean civilization unit roster
    villager: { kind: 'villager', name: 'Cidadão Atlante', role: 'Trabalhador versátil', minAge: 1, cost: { food: 70 }, popCost: 1, trainTime: 5.0, maxHp: 90, attack: 7, damageType: 'hack', hackArmor: 0.15, pierceArmor: 0.15, crushArmor: 0.1, range: 1.6, attackCooldown: 1.2, speed: 5.0, los: 15, isMythic: false, producedAt: 'town_center' },
    hoplite: { kind: 'hoplite', name: 'Mirmidão', role: 'Infantaria pesada atlante', minAge: 1, cost: { food: 60, gold: 45 }, popCost: 2, trainTime: 6.0, maxHp: 170, attack: 17, damageType: 'hack', hackArmor: 0.4, pierceArmor: 0.25, crushArmor: 0.2, bonusVsInfantry: 1.3, range: 1.9, attackCooldown: 1.0, speed: 4.7, los: 16, isMythic: false, producedAt: 'barracks' },
    hipaspist: { kind: 'hipaspist', name: 'Fanático', role: 'Infantaria de choque rápida', minAge: 2, cost: { food: 65, gold: 40 }, popCost: 2, trainTime: 5.8, maxHp: 160, attack: 18, damageType: 'hack', hackArmor: 0.35, pierceArmor: 0.2, crushArmor: 0.18, range: 1.8, attackCooldown: 0.95, speed: 5.1, los: 17, isMythic: false, producedAt: 'barracks' },
    archer: { kind: 'archer', name: 'Turma', role: 'Arqueiro a cavalo atlante', minAge: 2, cost: { wood: 60, gold: 40 }, popCost: 2, trainTime: 6.0, maxHp: 110, attack: 15, damageType: 'pierce', hackArmor: 0.15, pierceArmor: 0.35, crushArmor: 0.12, range: 13.0, attackCooldown: 1.15, speed: 6.8, los: 20, isMythic: false, producedAt: 'barracks' },
    cavalry: { kind: 'cavalry', name: 'Contarius', role: 'Cavalaria pesada com lança', minAge: 2, cost: { food: 90, gold: 65 }, popCost: 3, trainTime: 7.0, maxHp: 230, attack: 24, damageType: 'pierce', hackArmor: 0.3, pierceArmor: 0.4, crushArmor: 0.2, range: 2.4, attackCooldown: 1.1, speed: 7.6, los: 19, isMythic: false, producedAt: 'barracks' },
    ajax: { kind: 'ajax', name: 'Herói Atlante', role: 'Herói com poderes cósmicos', minAge: 1, cost: { food: 115, gold: 95, favor: 6 }, popCost: 3, trainTime: 7.5, maxHp: 440, attack: 33, damageType: 'hack', hackArmor: 0.48, pierceArmor: 0.5, crushArmor: 0.42, bonusVsMyth: 3.5, range: 2.3, attackCooldown: 0.9, speed: 5.7, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    hero: { kind: 'hero', name: 'Oráculo / Herói Sábio', role: 'Herói vidente e combatente', minAge: 2, cost: { food: 125, gold: 105, favor: 10 }, popCost: 3, trainTime: 8.5, maxHp: 370, attack: 28, damageType: 'pierce', hackArmor: 0.4, pierceArmor: 0.45, crushArmor: 0.35, bonusVsMyth: 3.0, range: 14.0, attackCooldown: 1.1, speed: 5.4, los: 24, isMythic: false, isHero: true, producedAt: 'fortress' },
    siege: { kind: 'siege', name: 'Torre de Cerco Atlante', role: 'Cerco avançado', minAge: 3, cost: { wood: 165, gold: 125 }, popCost: 4, trainTime: 10, maxHp: 330, attack: 50, damageType: 'crush', hackArmor: 0.12, pierceArmor: 0.75, crushArmor: 0.22, bonusVsBuilding: 2.5, range: 16.0, attackCooldown: 2.4, speed: 3.3, los: 20, isMythic: false, isSiege: true, producedAt: 'fortress' },
    minotaur: { kind: 'minotaur', name: 'Autômato', role: 'Soldado mecânico de bronze', minAge: 2, cost: { food: 130, favor: 15 }, popCost: 3, trainTime: 8.5, maxHp: 450, attack: 38, damageType: 'crush', hackArmor: 0.5, pierceArmor: 0.45, crushArmor: 0.4, range: 2.2, attackCooldown: 1.3, speed: 4.8, los: 19, isMythic: true, producedAt: 'temple' },
    centaur: { kind: 'centaur', name: 'Satyrs', role: 'Arjufante ágil', minAge: 3, cost: { wood: 140, favor: 20 }, popCost: 3, trainTime: 9.0, maxHp: 320, attack: 32, damageType: 'pierce', hackArmor: 0.25, pierceArmor: 0.35, crushArmor: 0.2, range: 13.0, attackCooldown: 1.05, speed: 7.5, los: 21, isMythic: true, producedAt: 'temple' },
    cyclops: { kind: 'cyclops', name: 'Behemoth', role: 'Monstro titânico de cerco', minAge: 4, cost: { food: 230, gold: 130, favor: 32 }, popCost: 4, trainTime: 12, maxHp: 820, attack: 72, damageType: 'crush', hackArmor: 0.52, pierceArmor: 0.6, crushArmor: 0.42, bonusVsBuilding: 3.0, range: 3.2, attackCooldown: 1.6, speed: 4.2, los: 22, isMythic: true, producedAt: 'temple' },
    titan: { kind: 'titan', name: 'Titã Cronos', role: 'Entidade suprema atlante', minAge: 5, cost: {}, popCost: 12, trainTime: 1, maxHp: 4000, attack: 180, damageType: 'crush', hackArmor: 0.7, pierceArmor: 0.78, crushArmor: 0.55, bonusVsBuilding: 2.8, range: 4.0, attackCooldown: 1.7, speed: 4.2, los: 25, isMythic: true, producedAt: 'titan_gate' },
  },
};

export const UNIT_STATS: Record<UnitKind, UnitStats> = CIVILIZATION_UNITS.gregos;

export const BUILDING_STATS: Record<BuildingKind, BuildingStats> = {
  town_center: {
    kind: 'town_center',
    name: 'Centro da Cidade',
    role: 'Treina aldeões, recebe recursos e avança Eras',
    minAge: 1,
    cost: { wood: 250, gold: 150 },
    buildTime: 16,
    maxHp: 1900,
    radius: 4.0,
    popBonus: 10,
    hackArmor: 0.3,
    pierceArmor: 0.85,
    crushArmor: 0.1,
    attack: 14,
    range: 14,
  },
  house: {
    kind: 'house',
    name: 'Casa',
    role: 'Aumenta limite de população em +6',
    minAge: 1,
    cost: { wood: 65 },
    buildTime: 6,
    maxHp: 450,
    radius: 1.8,
    popBonus: 6,
    hackArmor: 0.15,
    pierceArmor: 0.7,
    crushArmor: 0.05,
  },
  farm: {
    kind: 'farm',
    name: 'Fazenda',
    role: 'Fonte renovável infinita de Alimento para aldeões',
    minAge: 1,
    cost: { wood: 75 },
    buildTime: 6.5,
    maxHp: 380,
    radius: 2.2,
    popBonus: 0,
    hackArmor: 0.1,
    pierceArmor: 0.6,
    crushArmor: 0.05,
  },
  barracks: {
    kind: 'barracks',
    name: 'Quartel',
    role: 'Treina infantaria, atiradores e cavalaria',
    minAge: 1,
    cost: { wood: 130, gold: 40 },
    buildTime: 9,
    maxHp: 900,
    radius: 2.7,
    popBonus: 0,
    hackArmor: 0.25,
    pierceArmor: 0.8,
    crushArmor: 0.1,
  },
  armory: {
    kind: 'armory',
    name: 'Armaria',
    role: 'Pesquisa armas e armaduras de Cobre, Bronze e Ferro',
    minAge: 2,
    cost: { wood: 140, gold: 60 },
    buildTime: 9,
    maxHp: 780,
    radius: 2.5,
    popBonus: 0,
    hackArmor: 0.25,
    pierceArmor: 0.8,
    crushArmor: 0.1,
  },
  market: {
    kind: 'market',
    name: 'Mercado',
    role: 'Troca Alimento, Madeira e Ouro com taxas dinâmicas',
    minAge: 2,
    cost: { wood: 150, gold: 50 },
    buildTime: 8.5,
    maxHp: 750,
    radius: 2.6,
    popBonus: 0,
    hackArmor: 0.2,
    pierceArmor: 0.75,
    crushArmor: 0.1,
  },
  temple: {
    kind: 'temple',
    name: 'Templo',
    role: 'Gera Favor Divino, guarda Relíquias e invoca Unidades Míticas',
    minAge: 1,
    cost: { wood: 140, gold: 120 },
    buildTime: 11,
    maxHp: 1000,
    radius: 3.0,
    popBonus: 0,
    hackArmor: 0.25,
    pierceArmor: 0.82,
    crushArmor: 0.1,
  },
  tower: {
    kind: 'tower',
    name: 'Torre de Vigia',
    role: 'Defesa automática contra invasores',
    minAge: 2,
    cost: { wood: 110, gold: 80 },
    buildTime: 8,
    maxHp: 760,
    radius: 1.6,
    popBonus: 0,
    hackArmor: 0.3,
    pierceArmor: 0.85,
    crushArmor: 0.1,
    attack: 19,
    range: 16.5,
  },
  fortress: {
    kind: 'fortress',
    name: 'Fortaleza',
    role: 'Bastilha pesada que treina Heróis e Armas de Cerco',
    minAge: 3,
    cost: { wood: 200, gold: 220 },
    buildTime: 14,
    maxHp: 2100,
    radius: 3.6,
    popBonus: 5,
    hackArmor: 0.4,
    pierceArmor: 0.9,
    crushArmor: 0.15,
    attack: 24,
    range: 18,
  },
  titan_gate: {
    kind: 'titan_gate',
    name: 'Portão do Titã',
    role: 'Portal monumental da Era dos Titãs — ao concluir invoca um Titã',
    minAge: 5,
    cost: { wood: 350, gold: 350, favor: 50 },
    buildTime: 26,
    maxHp: 3200,
    radius: 4.0,
    popBonus: 0,
    hackArmor: 0.4,
    pierceArmor: 0.9,
    crushArmor: 0.2,
  },
};

export type FaunaKind = 'gazelle' | 'deer' | 'boar' | 'aurochs' | 'wolf';

export interface FaunaStats {
  kind: FaunaKind;
  name: string;
  role: string;
  maxHp: number;
  foodAmount: number;
  attack: number;
  speed: number;
  radius: number;
  retaliates: boolean;
}

export const FAUNA_STATS: Record<FaunaKind, FaunaStats> = {
  gazelle: {
    kind: 'gazelle',
    name: 'Gazela',
    role: 'Fauna veloz — fonte rápida de Alimento para aldeões',
    maxHp: 35,
    foodAmount: 160,
    attack: 0,
    speed: 4.8,
    radius: 0.45,
    retaliates: false,
  },
  deer: {
    kind: 'deer',
    name: 'Cervo',
    role: 'Fauna silvestre dos bosques — rica em Alimento',
    maxHp: 45,
    foodAmount: 210,
    attack: 0,
    speed: 4.4,
    radius: 0.50,
    retaliates: false,
  },
  boar: {
    kind: 'boar',
    name: 'Javali Selvagem',
    role: 'Caça agressiva que revida se atacada — alto Alimento',
    maxHp: 95,
    foodAmount: 280,
    attack: 8,
    speed: 3.9,
    radius: 0.55,
    retaliates: true,
  },
  aurochs: {
    kind: 'aurochs',
    name: 'Auroque',
    role: 'Bovino robusto — rende grande quantidade de Alimento',
    maxHp: 130,
    foodAmount: 360,
    attack: 10,
    speed: 3.5,
    radius: 0.72,
    retaliates: true,
  },
  wolf: {
    kind: 'wolf',
    name: 'Lobo das Colinas',
    role: 'Predador ágil das montanhas — pode ser caçado por alimento',
    maxHp: 55,
    foodAmount: 120,
    attack: 7,
    speed: 4.5,
    radius: 0.45,
    retaliates: true,
  },
};

export interface MinimapBlip {
  x: number;
  z: number;
  category: 'unit' | 'building' | 'node' | 'settlement' | 'fauna' | 'relic';
  team: TeamId | 'neutral';
  color: string;
  size: number;
  selected?: boolean;
  isMajor?: boolean;
  label?: string;
  subKind?: string;
  isHero?: boolean;
  isTitan?: boolean;
  isConstructed?: boolean;
}

export type UnitVoiceAction = 'select' | 'attack' | 'move' | 'work';

export interface UnitVoiceLineInfo {
  phrase: string;
  translation: string;
  cultureLabel: string;
  action: UnitVoiceAction;
}

export interface SelectionSummary {
  count: number;
  primaryType: 'unit' | 'building' | 'resource' | 'settlement' | 'fauna' | 'relic' | 'none';
  entityId?: string;
  kindLabel: string;
  roleLabel: string;
  team: TeamId | 'neutral';
  hp: number;
  maxHp: number;
  attack?: number;
  armorLabel?: string;
  taskLabel?: string;
  resourceType?: ResourceType;
  resourceAmount?: number;
  resourceMaxAmount?: number;
  isCarcass?: boolean;
  screenPos?: { x: number; y: number };
  buildingId?: string;
  buildingKind?: BuildingKind;
  settlementId?: string;
  isConstructed?: boolean;
  buildProgress?: number;
  trainingQueue?: { kind: UnitKind; progress: number; total: number }[];
  repeatTraining?: boolean;
  rallyPoint?: { x: number; z: number } | null;
  hasVillagerSelected: boolean;
  voiceLine?: UnitVoiceLineInfo;
}

export interface GameHudSnapshot {
  phase: 'title' | 'playing' | 'paused' | 'victory' | 'defeat';
  pantheon: PantheonId;
  majorGodName: string;
  enemyPantheon: PantheonId;
  difficulty: DifficultyId;
  mapId: MapId;
  gameType: GameTypeId;
  visibilityMode: VisibilityMode;
  worldSize: WorldSizeId;
  revealedMap: boolean;
  dayNightCycle: boolean;
  dayTimeLabel: string;
  titansEnabled: boolean;
  treatyRemaining: number;
  elapsedSeconds: number;
  resources: Record<ResourceType, number>;
  age: AgeLevel;
  advancingToAge: AgeLevel | null;
  ageAdvanceProgress: number;
  ageAdvanceTotal: number;
  pendingMinorGodAge: 2 | 3 | 4 | null;
  chosenMinorGods: string[];
  unlockedPowers: GodPowerId[];
  researchedTechs: TechId[];
  activeTechResearch: { id: TechId; progress: number; total: number } | null;
  relicsHeld: number;
  marketRates: { food: number; wood: number; gold: number };
  enemyAge: AgeLevel;
  population: number;
  populationCap: number;
  playerTownCenterCount: number;
  maxTownCenters: number;
  idleVillagerCount: number;
  combatUnitCount: number;
  godPowerCooldowns: Record<GodPowerId, number>;
  activeBuildMode: BuildingKind | null;
  activeGodPowerMode: GodPowerId | null;
  selection: SelectionSummary;
  statusMessage: string | null;
  minimapBlips: MinimapBlip[];
  fogGrid: number[];
  fogGridSize: number;
  cameraTarget: { x: number; z: number };
  cameraYaw: number;
  cameraDistance: number;
  cameraPanMode: 'select' | 'pan';
  formation: FormationId;
  stats: {
    unitsTrained: number;
    enemiesDefeated: number;
    buildingsBuilt: number;
    powersCast: number;
    techsResearched: number;
  };
  fps?: number;
  scenarioTitle?: string;
  projectionMode?: '2.5d' | '3d';
  hopliteRenderMode?: '3d' | 'sprite' | 'brg' | 'uv2d';
  hopliteArmorTier?: 1 | 2 | 3 | 4;
  scaleProfile?: AoMScaleProfile;
  scaleMultipliers?: {
    building: number;
    unit: number;
    fauna: number;
    resource: number;
  };
}

export interface MatchStartOptions {
  startingAge?: AgeLevel;
  startingResources?: 'standard' | 'high' | 'abundant';
  enemyPantheon?: PantheonId;
  minorGod?: string;
  majorGodName?: string;
  scenarioTitle?: string;
  gameSpeed?: number;
  gameType?: GameTypeId;
  visibilityMode?: VisibilityMode;
  worldSize?: WorldSizeId;
  dayNightCycle?: boolean;
  titansEnabled?: boolean;
  treatyMinutes?: number;
}

export type AoMScaleProfile = 'classic_aom' | 'monumental' | 'realistic' | 'compact';

export interface AoMGlobalScaleConfig {
  profile: AoMScaleProfile;
  buildingMultiplier: number;
  unitMultiplier: number;
  faunaMultiplier: number;
  resourceMultiplier: number;
  settlementMultiplier: number;
}

export const AOM_SCALE_PROFILES: Record<AoMScaleProfile, AoMGlobalScaleConfig> = {
  classic_aom: {
    profile: 'classic_aom',
    buildingMultiplier: 1.05, // Proporção perfeita entre edifícios, unidades e terreno
    unitMultiplier: 1.0,      // Escala padrão legível de unidades
    faunaMultiplier: 1.0,     // Animais com tamanho natural proporcional
    resourceMultiplier: 1.0,  // Árvores e recursos perfeitamente equilibrados
    settlementMultiplier: 1.05,
  },
  monumental: {
    profile: 'monumental',
    buildingMultiplier: 1.25, // Edificações ligeiramente maiores
    unitMultiplier: 1.0,
    faunaMultiplier: 1.0,
    resourceMultiplier: 1.12,
    settlementMultiplier: 1.12,
  },
  realistic: {
    profile: 'realistic',
    buildingMultiplier: 1.45, // Edifícios imponentes
    unitMultiplier: 0.95,
    faunaMultiplier: 0.95,
    resourceMultiplier: 1.2,
    settlementMultiplier: 1.2,
  },
  compact: {
    profile: 'compact',
    buildingMultiplier: 0.95, // Visão tática compacta
    unitMultiplier: 1.05,
    faunaMultiplier: 1.05,
    resourceMultiplier: 0.95,
    settlementMultiplier: 0.95,
  },
};

export const DEFAULT_AOM_SCALE_CONFIG: AoMGlobalScaleConfig = AOM_SCALE_PROFILES.classic_aom;

export interface GameOptionsConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  showFps: boolean;
  defaultDifficulty: DifficultyId;
  showTips: boolean;
  gameSpeed: number;
  upnpEnabled: boolean;
  networkPort: number;
  virtualJoystick: boolean;
  cameraSensitivity: number;
  playerName: string;
  projectionMode?: '2.5d' | '3d';
  hopliteRenderMode?: '3d' | 'sprite' | 'brg' | 'uv2d';
  hopliteArmorTier?: 1 | 2 | 3 | 4;
  scaleProfile?: AoMScaleProfile;
  buildingScaleMultiplier?: number;
  unitScaleMultiplier?: number;
  dayNightCycle?: boolean;
}

export const DEFAULT_GAME_OPTIONS: GameOptionsConfig = {
  masterVolume: 0.85,
  musicVolume: 0.7,
  sfxVolume: 0.9,
  musicEnabled: true,
  sfxEnabled: true,
  graphicsQuality: 'high',
  showFps: false,
  defaultDifficulty: 'normal',
  showTips: true,
  gameSpeed: 1.0,
  upnpEnabled: true,
  networkPort: 2300,
  virtualJoystick: true,
  cameraSensitivity: 1.0,
  playerName: 'Arkantos',
  projectionMode: '2.5d',
  hopliteRenderMode: '3d',
  hopliteArmorTier: 3,
  scaleProfile: 'classic_aom',
  buildingScaleMultiplier: 1.35,
  unitScaleMultiplier: 0.95,
  dayNightCycle: true,
};
