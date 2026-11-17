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
  // 6 Novos Mapas de The Titans
  | 'highland'
  | 'islands'
  | 'land_unknown'
  | 'marsh'
  | 'megalopolis'
  | 'tundra'
  // 21 Mapas Originais (Jogo Base)
  | 'acropolis'
  | 'alfheim'
  | 'anatolia'
  | 'archipelago'
  | 'erebus'
  | 'ghost_lake'
  | 'jotunheim'
  | 'king_of_the_hill'
  | 'mediterranean'
  | 'midgard'
  | 'nile'
  | 'nomad'
  | 'oasis'
  | 'savannah'
  | 'sea_of_worms'
  | 'sudden_death'
  | 'team_migration'
  | 'the_unknown'
  | 'valley_of_the_kings'
  | 'vinlandsaga'
  | 'watering_hole'
  // Mapas Bônus Preservados
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
  | 'myrmidon'
  | 'peltast'
  | 'archer'
  | 'gastraphetes'
  | 'cavalry'
  | 'prodromos'
  | 'jason'
  | 'odysseus'
  | 'perseus'
  | 'bellerophon'
  | 'hippolyta'
  | 'ajax'
  | 'theseus'
  | 'hero'
  | 'ram'
  | 'siege'
  | 'minotaur'
  | 'centaur'
  | 'cyclops'
  | 'manticore'
  | 'medusa'
  | 'hydra'
  | 'colossus'
  | 'nymph'
  | 'pegasus'
  | 'satyr'
  | 'automaton'
  | 'iron_dwarf'
  | 'phoenix'
  | 'titan'
  | 'zeus'
  | 'poseidon'
  | 'hades'
  | 'atena'
  | 'ares'
  | 'hermes'
  | 'apolo'
  | 'dionisio'
  | 'afrodite'
  | 'hefesto'
  | 'artemis'
  | 'isis'
  | 'set'
  | 'ra'
  | 'priest'
  | 'pharaoh'
  | 'son_of_osiris'
  | 'egypt_spearman'
  | 'slinger'
  | 'axeman'
  | 'chariot_archer'
  | 'camel_rider'
  | 'war_elephant'
  | 'siege_tower'
  | 'egypt_catapult'
  | 'sphinx'
  | 'wadjet'
  | 'roc'
  | 'petsuchos'
  | 'scarab'
  | 'avenger'
  | 'mummy'
  | 'norse_dwarf'
  | 'ox_cart'
  | 'hersir'
  | 'godi'
  | 'ulfsark'
  | 'throwing_axeman'
  | 'raiding_cavalry'
  | 'huskarl'
  | 'jarl'
  | 'portable_ram'
  | 'norse_ballista'
  | 'troll'
  | 'valkyrie'
  | 'einherjar'
  | 'frost_giant'
  | 'mountain_giant'
  | 'battle_boar'
  | 'kraken'
  | 'rock_troll'
  | 'fire_giant'
  | 'fenris_wolf'
  | 'nidhogg'
  | 'jormungand'
  | 'fafnir'
  | 'citizen'
  | 'oracle'
  | 'llama_caravan'
  | 'murmillo'
  | 'katapeltes'
  | 'turma'
  | 'cheiroballista'
  | 'arcus'
  | 'contarius'
  | 'destroyer'
  | 'fanatic'
  | 'fire_siphon'
  | 'onager'
  | 'promethean'
  | 'promethean_offspring'
  | 'caladria'
  | 'behemoth'
  | 'stymphalian_bird'
  | 'dryad'
  | 'hekagigantes'
  | 'argus'
  | 'lampades'
  | 'carnivora'
  | 'tartarian_spawn';

export type BuildingKind =
  | 'town_center'
  | 'house'
  | 'farm'
  | 'barracks'
  | 'archery_range'
  | 'stable'
  | 'siege_works'
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
  mythUnit: UnitKind;
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

export type MapExpansion = 'titans' | 'base' | 'bonus';
export type MapSpecialRule =
  | 'koth_vault'
  | 'nomad'
  | 'sudden_death'
  | 'megalopolis'
  | 'valley_guardians'
  | 'land_unknown'
  | 'the_unknown'
  | 'sea_of_worms';
export type MapWeatherKind = 'clear' | 'rain' | 'snow' | 'sandstorm';

export interface MapConfig {
  id: MapId;
  name: string;
  subtitle: string;
  expansion: MapExpansion;
  biomeLabel: string;
  floraLabel: string;
  faunaLabel: string;
  specialRule?: MapSpecialRule;
  weatherPool: MapWeatherKind[];
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
  // ── OS 6 NOVOS MAPAS DE THE TITANS ──
  highland: {
    id: 'highland',
    name: 'Terras Altas',
    subtitle: 'Rio central caudaloso dividindo platôs e duas pontes de pedra',
    expansion: 'titans',
    biomeLabel: 'Montanha & Rio',
    floraLabel: 'Carvalhos e Bétulas Alpinas',
    faunaLabel: 'Cabra Montesa, Cervo e Urso',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x165f82,
    skyColorHex: 0xb7cde0,
    foliageHex: 0x3b6f3b,
    foliageDarkHex: 0x264b29,
    cliffHex: 0x736f65,
    terrainTint: '#4f6d43',
    terrainPatchA: 'rgba(98, 128, 72, 0.24)',
    terrainPatchB: 'rgba(110, 102, 86, 0.22)',
  },
  islands: {
    id: 'islands',
    name: 'Ilhas',
    subtitle: 'Bases em ilhas separadas conectadas por recifes e passagens costeiras',
    expansion: 'titans',
    biomeLabel: 'Arquipélago Egeu',
    floraLabel: 'Palmeiras e Carvalhos Costeiros',
    faunaLabel: 'Javali, Cabra Montesa e Cervo',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x0f7490,
    skyColorHex: 0xbae6fd,
    foliageHex: 0x3b7a3c,
    foliageDarkHex: 0x235229,
    cliffHex: 0xb09e79,
    terrainTint: '#597848',
    terrainPatchA: 'rgba(182, 166, 118, 0.22)',
    terrainPatchB: 'rgba(54, 96, 52, 0.22)',
  },
  land_unknown: {
    id: 'land_unknown',
    name: 'Terra Desconhecida',
    subtitle: 'Roleta continental aleatória a cada partida (sem grandes oceanos)',
    expansion: 'titans',
    biomeLabel: 'Aleatório Terrestre',
    floraLabel: 'Flora Variável por Semente',
    faunaLabel: 'Fauna Aleatória do Bioma',
    specialRule: 'land_unknown',
    weatherPool: ['clear', 'rain', 'sandstorm'],
    waterColorHex: 0x1a6885,
    skyColorHex: 0xcbd5e1,
    foliageHex: 0x4b7438,
    foliageDarkHex: 0x2d4d24,
    cliffHex: 0x78716c,
    terrainTint: '#63754d',
    terrainPatchA: 'rgba(145, 138, 104, 0.24)',
    terrainPatchB: 'rgba(62, 84, 52, 0.22)',
  },
  marsh: {
    id: 'marsh',
    name: 'Pântano',
    subtitle: 'Terras alagadas com águas rasas navegáveis, florestas densas e emboscadas',
    expansion: 'titans',
    biomeLabel: 'Brejo Denso',
    floraLabel: 'Ciprestes e Salgueiros do Brejo',
    faunaLabel: 'Crocodilo, Hipopótamo e Javali',
    weatherPool: ['rain', 'rain', 'clear'],
    waterColorHex: 0x2f5a44,
    skyColorHex: 0x99b1a3,
    foliageHex: 0x2e5e38,
    foliageDarkHex: 0x1b3b23,
    cliffHex: 0x4b5548,
    terrainTint: '#3e593e',
    terrainPatchA: 'rgba(72, 104, 62, 0.26)',
    terrainPatchB: 'rgba(42, 62, 46, 0.28)',
  },
  megalopolis: {
    id: 'megalopolis',
    name: 'Megalópole',
    subtitle: 'Início com cidade avançada, torres de vigia, quartéis e múltiplos Centros',
    expansion: 'titans',
    biomeLabel: 'Metrópole Antiga',
    floraLabel: 'Carvalhos Imperiais e Ciprestes',
    faunaLabel: 'Cervo, Auroque e Javali',
    specialRule: 'megalopolis',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x1b6382,
    skyColorHex: 0xc8daf0,
    foliageHex: 0x3b7137,
    foliageDarkHex: 0x264c26,
    cliffHex: 0x9c9282,
    terrainTint: '#5d7346',
    terrainPatchA: 'rgba(176, 166, 144, 0.24)',
    terrainPatchB: 'rgba(66, 94, 54, 0.22)',
  },
  tundra: {
    id: 'tundra',
    name: 'Tundra',
    subtitle: 'Estepe congelada aberta com madeira escassa, nevascas e rebanhos árticos',
    expansion: 'titans',
    biomeLabel: 'Estepe Ártica',
    floraLabel: 'Pinheiros Nevados Esparsos',
    faunaLabel: 'Rena Ártica, Boi-Almiscarado e Lobo',
    weatherPool: ['snow', 'snow', 'clear'],
    waterColorHex: 0x3b6e8c,
    skyColorHex: 0xdbeafe,
    foliageHex: 0x2b4d44,
    foliageDarkHex: 0xe2e8f0,
    cliffHex: 0x64748b,
    terrainTint: '#a6b5c4',
    terrainPatchA: 'rgba(241, 245, 249, 0.34)',
    terrainPatchB: 'rgba(100, 116, 139, 0.24)',
  },

  // ── OS 21 MAPAS ORIGINAIS (JOGO BASE) ──
  acropolis: {
    id: 'acropolis',
    name: 'Acrópole',
    subtitle: 'Platôs elevados defensáveis com ouro disputado nas planícies centrais',
    expansion: 'base',
    biomeLabel: 'Colina Helênica',
    floraLabel: 'Carvalhos e Oliveiras da Arcádia',
    faunaLabel: 'Cabra Montesa, Cervo e Javali',
    weatherPool: ['clear', 'clear', 'rain'],
    waterColorHex: 0x18587a,
    skyColorHex: 0xc2d4e4,
    foliageHex: 0x366938,
    foliageDarkHex: 0x254d27,
    cliffHex: 0x78716c,
    terrainTint: '#596b45',
    terrainPatchA: 'rgba(136, 132, 118, 0.22)',
    terrainPatchB: 'rgba(65, 92, 52, 0.20)',
  },
  alfheim: {
    id: 'alfheim',
    name: 'Alfheim',
    subtitle: 'Florestas nórdicas exuberantes cercadas por cadeias de montanhas e neve',
    expansion: 'base',
    biomeLabel: 'Bosque Nórdico',
    floraLabel: 'Pinheiros Nórdicos e Bétulas',
    faunaLabel: 'Cervo, Auroque, Urso e Javali',
    weatherPool: ['clear', 'snow', 'rain'],
    waterColorHex: 0x1e4a6b,
    skyColorHex: 0xcbd5e1,
    foliageHex: 0x2b5344,
    foliageDarkHex: 0xdbeafe,
    cliffHex: 0x64748b,
    terrainTint: '#5b6c5a',
    terrainPatchA: 'rgba(195, 210, 224, 0.22)',
    terrainPatchB: 'rgba(52, 74, 62, 0.22)',
  },
  anatolia: {
    id: 'anatolia',
    name: 'Anatólia',
    subtitle: 'Corredor central árido flanqueado por dois mares piscosos nos extremos',
    expansion: 'base',
    biomeLabel: 'Planalto Costeiro',
    floraLabel: 'Acácias e Carvalhos Secos',
    faunaLabel: 'Cabra Montesa, Gazela e Javali',
    weatherPool: ['clear', 'sandstorm'],
    waterColorHex: 0x0e7490,
    skyColorHex: 0xe9d8bc,
    foliageHex: 0x5c7432,
    foliageDarkHex: 0x3f5222,
    cliffHex: 0x9a7b56,
    terrainTint: '#9a8455',
    terrainPatchA: 'rgba(196, 168, 112, 0.24)',
    terrainPatchB: 'rgba(110, 108, 62, 0.22)',
  },
  archipelago: {
    id: 'archipelago',
    name: 'Arquipélago',
    subtitle: 'Conjunto fragmentado de ilhotas rasas e passagens costeiras estratégicas',
    expansion: 'base',
    biomeLabel: 'Ilhotas Tropicais',
    floraLabel: 'Palmeiras e Arbustos Marinhos',
    faunaLabel: 'Javali, Gazela e Crocodilo',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x0284c7,
    skyColorHex: 0xbae6fd,
    foliageHex: 0x3c7d3b,
    foliageDarkHex: 0x1f522c,
    cliffHex: 0xbfa87e,
    terrainTint: '#657e4a',
    terrainPatchA: 'rgba(218, 198, 142, 0.26)',
    terrainPatchB: 'rgba(54, 102, 54, 0.20)',
  },
  erebus: {
    id: 'erebus',
    name: 'Érebo',
    subtitle: 'Terras vulcânicas do submundo com rios de lava e vegetação carbonizada',
    expansion: 'base',
    biomeLabel: 'Submundo Vulcânico',
    floraLabel: 'Árvores Petrificadas e Cinzas',
    faunaLabel: 'Lobo das Colinas e Javali',
    weatherPool: ['clear', 'sandstorm'],
    waterColorHex: 0x991b1b,
    skyColorHex: 0x2e1f27,
    foliageHex: 0x451a03,
    foliageDarkHex: 0x292524,
    cliffHex: 0x3f3f46,
    terrainTint: '#362c2b',
    terrainPatchA: 'rgba(120, 53, 15, 0.25)',
    terrainPatchB: 'rgba(24, 24, 27, 0.32)',
  },
  ghost_lake: {
    id: 'ghost_lake',
    name: 'Lago Fantasma',
    subtitle: 'Grande lago congelado plano no centro cercado por pinheiros gélidos',
    expansion: 'base',
    biomeLabel: 'Glaciar Congelado',
    floraLabel: 'Pinheiros Nevados do Norte',
    faunaLabel: 'Rena Ártica, Lobo e Urso',
    weatherPool: ['snow', 'clear'],
    waterColorHex: 0x7dd3fc,
    skyColorHex: 0xdbeafe,
    foliageHex: 0x29483e,
    foliageDarkHex: 0xe2e8f0,
    cliffHex: 0x94a3b8,
    terrainTint: '#7e8f9c',
    terrainPatchA: 'rgba(226, 232, 240, 0.28)',
    terrainPatchB: 'rgba(64, 84, 96, 0.22)',
  },
  jotunheim: {
    id: 'jotunheim',
    name: 'Jotunheim',
    subtitle: 'Desfiladeiros estreitos entre muralhas glaciais propícios à fortificação',
    expansion: 'base',
    biomeLabel: 'Cordilheira Glacial',
    floraLabel: 'Pinheiros Nevados e Abetos',
    faunaLabel: 'Urso Polar, Boi-Almiscarado e Lobo',
    weatherPool: ['snow', 'snow', 'clear'],
    waterColorHex: 0x0c4a6e,
    skyColorHex: 0x94a3b8,
    foliageHex: 0x1e3a34,
    foliageDarkHex: 0xf1f5f9,
    cliffHex: 0x475569,
    terrainTint: '#9aa7b4',
    terrainPatchA: 'rgba(241, 245, 249, 0.30)',
    terrainPatchB: 'rgba(71, 85, 105, 0.24)',
  },
  king_of_the_hill: {
    id: 'king_of_the_hill',
    name: 'Rei da Colina',
    subtitle: 'Colina central coroada por um Cofre da Abundância que decide a vitória',
    expansion: 'base',
    biomeLabel: 'Planalto Monumental',
    floraLabel: 'Carvalhos Olímpicos',
    faunaLabel: 'Auroque, Cervo e Javali',
    specialRule: 'koth_vault',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x1c5d7d,
    skyColorHex: 0xcfe0f2,
    foliageHex: 0x356934,
    foliageDarkHex: 0x224924,
    cliffHex: 0x8c8273,
    terrainTint: '#557042',
    terrainPatchA: 'rgba(164, 152, 114, 0.22)',
    terrainPatchB: 'rgba(58, 86, 46, 0.22)',
  },
  mediterranean: {
    id: 'mediterranean',
    name: 'Mediterrâneo',
    subtitle: 'Planície fértil cercada pelas águas cristalinas do Mar Egeu',
    expansion: 'base',
    biomeLabel: 'Costa Mediterrânea',
    floraLabel: 'Carvalhos Gregos e Oliveiras',
    faunaLabel: 'Cervo, Cabra Montesa e Javali',
    weatherPool: ['clear', 'clear', 'rain'],
    waterColorHex: 0x1a6885,
    skyColorHex: 0xbcd0e2,
    foliageHex: 0x2e5e32,
    foliageDarkHex: 0x204726,
    cliffHex: 0x6b7c4f,
    terrainTint: '#4e6b3b',
    terrainPatchA: 'rgba(98, 128, 62, 0.22)',
    terrainPatchB: 'rgba(56, 82, 42, 0.22)',
  },
  midgard: {
    id: 'midgard',
    name: 'Midgard',
    subtitle: 'Grande massa continental cercada por fiordes e águas costeiras',
    expansion: 'base',
    biomeLabel: 'Terra Média Nórdica',
    floraLabel: 'Pinheiros Nórdicos e Bétulas',
    faunaLabel: 'Auroque, Cervo, Rena e Lobo',
    weatherPool: ['clear', 'rain', 'snow'],
    waterColorHex: 0x174e6d,
    skyColorHex: 0xbfd0de,
    foliageHex: 0x2f5b43,
    foliageDarkHex: 0x1e3f2d,
    cliffHex: 0x64748b,
    terrainTint: '#526b54',
    terrainPatchA: 'rgba(138, 154, 134, 0.22)',
    terrainPatchB: 'rgba(48, 72, 54, 0.24)',
  },
  nile: {
    id: 'nile',
    name: 'Rio Nilo',
    subtitle: 'Dunas douradas divididas por um vale fértil de palmeiras e águas turquesa',
    expansion: 'base',
    biomeLabel: 'Deserto & Vale Fluvial',
    floraLabel: 'Palmeiras do Nilo e Tamareiras',
    faunaLabel: 'Crocodilo, Hipopótamo, Gazela e Camelo',
    weatherPool: ['clear', 'sandstorm'],
    waterColorHex: 0x0e8da8,
    skyColorHex: 0xe6d5b8,
    foliageHex: 0x4d7c2b,
    foliageDarkHex: 0x3b6121,
    cliffHex: 0xb48a5a,
    terrainTint: '#b9935a',
    terrainPatchA: 'rgba(222, 186, 122, 0.24)',
    terrainPatchB: 'rgba(138, 102, 54, 0.20)',
  },
  nomad: {
    id: 'nomad',
    name: 'Nômade',
    subtitle: 'Sem Centro da Cidade inicial — explore com aldeões dispersos e funde sua capital',
    expansion: 'base',
    biomeLabel: 'Fronteira Selvagem',
    floraLabel: 'Bétulas e Carvalhos Dispersos',
    faunaLabel: 'Gazela, Cervo, Javali e Lobo',
    specialRule: 'nomad',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x1e6b85,
    skyColorHex: 0xcddde8,
    foliageHex: 0x427038,
    foliageDarkHex: 0x2c4f26,
    cliffHex: 0x857866,
    terrainTint: '#6b7749',
    terrainPatchA: 'rgba(156, 148, 106, 0.24)',
    terrainPatchB: 'rgba(72, 92, 54, 0.20)',
  },
  oasis: {
    id: 'oasis',
    name: 'Oásis',
    subtitle: 'Deserto árido com madeira concentrada ao redor do lago sagrado central',
    expansion: 'base',
    biomeLabel: 'Deserto com Oásis',
    floraLabel: 'Palmeiras Concentradas no Centro',
    faunaLabel: 'Camelo, Gazela, Leão e Elefante',
    weatherPool: ['clear', 'sandstorm', 'sandstorm'],
    waterColorHex: 0x0ea5e9,
    skyColorHex: 0xf3d9b1,
    foliageHex: 0x4d7c2b,
    foliageDarkHex: 0x365314,
    cliffHex: 0xa16207,
    terrainTint: '#c2995d',
    terrainPatchA: 'rgba(234, 194, 130, 0.25)',
    terrainPatchB: 'rgba(146, 105, 52, 0.20)',
  },
  savannah: {
    id: 'savannah',
    name: 'Savana',
    subtitle: 'Planícies douradas abertas e poucas colinas — foco total em caça e cavalaria',
    expansion: 'base',
    biomeLabel: 'Savana Africana',
    floraLabel: 'Acácias de Copa Larga',
    faunaLabel: 'Elefante Selvagem, Gazela, Leão e Hipopótamo',
    weatherPool: ['clear', 'sandstorm'],
    waterColorHex: 0x267580,
    skyColorHex: 0xf6deb5,
    foliageHex: 0x65802d,
    foliageDarkHex: 0x455a1d,
    cliffHex: 0xa16f3b,
    terrainTint: '#b48c4c',
    terrainPatchA: 'rgba(218, 182, 104, 0.26)',
    terrainPatchB: 'rgba(124, 114, 52, 0.22)',
  },
  sea_of_worms: {
    id: 'sea_of_worms',
    name: 'Mar de Vermes',
    subtitle: 'Início protegido por Fortaleza próxima e lagoas sinuosas no centro',
    expansion: 'base',
    biomeLabel: 'Lagoa Serpenteante',
    floraLabel: 'Ciprestes e Carvalhos Costeiros',
    faunaLabel: 'Crocodilo, Cabra Montesa e Javali',
    specialRule: 'sea_of_worms',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x0d7a8c,
    skyColorHex: 0xb7dbe8,
    foliageHex: 0x346b3c,
    foliageDarkHex: 0x20472a,
    cliffHex: 0x877b68,
    terrainTint: '#557249',
    terrainPatchA: 'rgba(154, 148, 108, 0.22)',
    terrainPatchB: 'rgba(54, 88, 52, 0.22)',
  },
  sudden_death: {
    id: 'sudden_death',
    name: 'Morte Súbita',
    subtitle: 'Apenas uma Cidadela central reforçada por jogador — perdeu o Centro, perdeu!',
    expansion: 'base',
    biomeLabel: 'Cidadela Única',
    floraLabel: 'Carvalhos e Pinheiros Antigos',
    faunaLabel: 'Auroque, Javali e Lobo',
    specialRule: 'sudden_death',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x195370,
    skyColorHex: 0xc7d2e0,
    foliageHex: 0x346233,
    foliageDarkHex: 0x214223,
    cliffHex: 0x736e67,
    terrainTint: '#566945',
    terrainPatchA: 'rgba(130, 128, 110, 0.24)',
    terrainPatchB: 'rgba(58, 76, 48, 0.22)',
  },
  team_migration: {
    id: 'team_migration',
    name: 'Migração em Equipe',
    subtitle: 'Ilha inicial pobre em ouro — atravesse os bancos de areia rumo ao continente rico',
    expansion: 'base',
    biomeLabel: 'Costa & Continente Rico',
    floraLabel: 'Bétulas e Palmeiras Costeiras',
    faunaLabel: 'Gazela, Cervo e Urso',
    weatherPool: ['clear', 'rain'],
    waterColorHex: 0x0f7694,
    skyColorHex: 0xc2e2f2,
    foliageHex: 0x3c763a,
    foliageDarkHex: 0x254f28,
    cliffHex: 0x998e75,
    terrainTint: '#5c7848',
    terrainPatchA: 'rgba(196, 178, 128, 0.24)',
    terrainPatchB: 'rgba(60, 96, 52, 0.22)',
  },
  the_unknown: {
    id: 'the_unknown',
    name: 'O Desconhecido',
    subtitle: 'Mapa imprevisível: gera geografias, mares, ilhas e biomas surpresa por partida',
    expansion: 'base',
    biomeLabel: 'Caos Procedural',
    floraLabel: 'Mistura Imprevista de Biomas',
    faunaLabel: 'Fauna Surpresa a Cada Partida',
    specialRule: 'the_unknown',
    weatherPool: ['clear', 'rain', 'snow', 'sandstorm'],
    waterColorHex: 0x166b8a,
    skyColorHex: 0xc7d2fe,
    foliageHex: 0x3b6f45,
    foliageDarkHex: 0x24472d,
    cliffHex: 0x78716c,
    terrainTint: '#5b7256',
    terrainPatchA: 'rgba(148, 152, 134, 0.24)',
    terrainPatchB: 'rgba(58, 78, 62, 0.24)',
  },
  valley_of_the_kings: {
    id: 'valley_of_the_kings',
    name: 'Vale dos Reis',
    subtitle: 'Ricas minas de ouro no desfiladeiro central protegidas por feras guardiãs',
    expansion: 'base',
    biomeLabel: 'Cânion Dourado Egípcio',
    floraLabel: 'Palmeiras do Deserto',
    faunaLabel: 'Leão, Crocodilo e Camelo',
    specialRule: 'valley_guardians',
    weatherPool: ['clear', 'sandstorm'],
    waterColorHex: 0x168099,
    skyColorHex: 0xf1d29e,
    foliageHex: 0x527d2e,
    foliageDarkHex: 0x38591e,
    cliffHex: 0xa86c32,
    terrainTint: '#c89b56',
    terrainPatchA: 'rgba(232, 190, 118, 0.26)',
    terrainPatchB: 'rgba(140, 88, 38, 0.24)',
  },
  vinlandsaga: {
    id: 'vinlandsaga',
    name: 'Vinlandsaga',
    subtitle: 'Comece numa ilha nórdica pequena e marche até o rico continente de Vinland',
    expansion: 'base',
    biomeLabel: 'Fiorde & Vinland',
    floraLabel: 'Bétulas e Pinheiros Nórdicos',
    faunaLabel: 'Urso, Rena Ártica e Boi-Almiscarado',
    weatherPool: ['clear', 'snow', 'rain'],
    waterColorHex: 0x145070,
    skyColorHex: 0xc6d8e8,
    foliageHex: 0x2f6142,
    foliageDarkHex: 0x1e402b,
    cliffHex: 0x64748b,
    terrainTint: '#587255',
    terrainPatchA: 'rgba(182, 198, 208, 0.24)',
    terrainPatchB: 'rgba(48, 78, 52, 0.22)',
  },
  watering_hole: {
    id: 'watering_hole',
    name: "Poço d'Água",
    subtitle: 'Planalto seco pontilhado por lagoas rasas ricas em vida selvagem e caça',
    expansion: 'base',
    biomeLabel: 'Savana & Lagoas',
    floraLabel: 'Acácias e Palmeiras nas Lagoas',
    faunaLabel: 'Elefante Selvagem, Hipopótamo, Gazela e Leão',
    weatherPool: ['clear', 'sandstorm'],
    waterColorHex: 0x1c8da6,
    skyColorHex: 0xf0d6a8,
    foliageHex: 0x5d7d30,
    foliageDarkHex: 0x3f591f,
    cliffHex: 0x9c6e3d,
    terrainTint: '#b88f52',
    terrainPatchA: 'rgba(222, 184, 116, 0.24)',
    terrainPatchB: 'rgba(110, 120, 56, 0.22)',
  },

  // ── MAPAS BÔNUS PRESERVADOS ──
  yucatan: {
    id: 'yucatan',
    name: 'Yucatán',
    subtitle: 'Selva tropical densa rica em caça, jaguares e templos antigos',
    expansion: 'bonus',
    biomeLabel: 'Selva Mesoamericana',
    floraLabel: 'Árvores Tropicais e Palmeiral',
    faunaLabel: 'Crocodilo, Javali e Cervo',
    weatherPool: ['rain', 'clear'],
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
    subtitle: 'Planícies férteis orientais cortadas por rio dourado e bambuzais',
    expansion: 'bonus',
    biomeLabel: 'Vale Oriental',
    floraLabel: 'Salgueiros e Bambus Orientais',
    faunaLabel: 'Cervo, Javali e Auroque',
    weatherPool: ['clear', 'rain'],
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
  bonusVsSiege?: number;
  splashRadius?: number;
  requiresMinorGod?: string[];
  requiresMinorGodLabel?: string;
  range: number;
  attackCooldown: number;
  speed: number;
  los: number;
  isMythic: boolean;
  isHero?: boolean;
  isSiege?: boolean;
  isGod?: boolean;
  isMajorGod?: boolean;
  canPromoteHero?: boolean;
  producedAt:
    | 'town_center'
    | 'barracks'
    | 'archery_range'
    | 'stable'
    | 'siege_works'
    | 'market'
    | 'temple'
    | 'fortress'
    | 'titan_gate';
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
  5: 'Era V: Era dos Deuses',
};

export const AGE_COSTS: Record<AgeLevel, ResourceCost> = {
  1: {},
  2: { food: 350, gold: 100 },
  3: { food: 650, gold: 350, favor: 15 },
  4: { food: 950, gold: 750, favor: 35 },
  5: { food: 1200, wood: 800, gold: 1200, favor: 60 },
};

export const AGE_ADVANCE_TIMES: Record<AgeLevel, number> = {
  1: 0,
  2: 10,
  3: 14,
  4: 18,
  5: 24,
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

export const EGYPTIAN_ROSTER_STATS = {
  ra: {
    kind: 'ra' as const,
    name: 'Rá — Deus Maior do Sol',
    role: 'Deus Maior (Era V) — Soberano Solar de Heliópolis; Raio Solar e Chuva Abençoada devastadora em área',
    minAge: 5 as AgeLevel,
    cost: { food: 950, gold: 1050, favor: 95 },
    popCost: 16,
    trainTime: 20,
    maxHp: 7250,
    attack: 280,
    damageType: 'crush' as DamageType,
    hackArmor: 0.78,
    pierceArmor: 0.85,
    crushArmor: 0.65,
    bonusVsBuilding: 3.3,
    bonusVsMyth: 1.5,
    splashRadius: 6.5,
    range: 14.0,
    attackCooldown: 1.55,
    speed: 4.6,
    los: 32,
    isMythic: true,
    isGod: true,
    isMajorGod: true,
    producedAt: 'temple' as const,
  },
  isis: {
    kind: 'isis' as const,
    name: 'Ísis — Deusa Maior da Magia',
    role: 'Deusa Maior (Era V) — Soberana Alada do Nilo; Magia de Heka e Estrela de Sopdet em área',
    minAge: 5 as AgeLevel,
    cost: { food: 950, gold: 1050, favor: 95 },
    popCost: 16,
    trainTime: 20,
    maxHp: 7000,
    attack: 265,
    damageType: 'crush' as DamageType,
    hackArmor: 0.78,
    pierceArmor: 0.84,
    crushArmor: 0.64,
    bonusVsBuilding: 3.4,
    bonusVsMyth: 1.5,
    splashRadius: 6.2,
    range: 13.0,
    attackCooldown: 1.55,
    speed: 4.7,
    los: 31,
    isMythic: true,
    isGod: true,
    isMajorGod: true,
    producedAt: 'temple' as const,
  },
  set: {
    kind: 'set' as const,
    name: 'Set — Deus Maior do Caos',
    role: 'Deus Maior (Era V) — Senhor das Tempestades de Areia; Fúria Vermelha do Deserto em área',
    minAge: 5 as AgeLevel,
    cost: { food: 950, gold: 1050, favor: 95 },
    popCost: 16,
    trainTime: 20,
    maxHp: 6950,
    attack: 270,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.76,
    pierceArmor: 0.86,
    crushArmor: 0.62,
    bonusVsBuilding: 3.1,
    bonusVsMyth: 1.5,
    splashRadius: 6.0,
    range: 13.5,
    attackCooldown: 1.5,
    speed: 4.6,
    los: 31,
    isMythic: true,
    isGod: true,
    isMajorGod: true,
    producedAt: 'temple' as const,
  },
  priest: {
    kind: 'priest' as const,
    name: 'Sacerdote',
    role: 'Unidade heroica básica (Templo/Centro) — cura tropas aliadas, constrói Obeliscos e é forte contra Míticas (3.2x)',
    minAge: 1 as AgeLevel,
    cost: { gold: 100 },
    popCost: 1,
    trainTime: 6.0,
    maxHp: 135,
    attack: 12,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.15,
    pierceArmor: 0.3,
    crushArmor: 0.15,
    bonusVsMyth: 3.2,
    range: 12.0,
    attackCooldown: 1.25,
    speed: 4.6,
    los: 20,
    isMythic: false,
    isHero: true,
    producedAt: 'temple' as const,
  },
  pharaoh: {
    kind: 'pharaoh' as const,
    name: 'Faraó',
    role: 'Herói único e gratuito que renasce caso morra — empodera edifícios (+35% prod/pesquisa), coleta relíquias e destrói Míticas',
    minAge: 1 as AgeLevel,
    cost: {},
    popCost: 2,
    trainTime: 8.0,
    maxHp: 390,
    attack: 24,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.35,
    pierceArmor: 0.48,
    crushArmor: 0.3,
    bonusVsMyth: 3.6,
    range: 13.5,
    attackCooldown: 1.1,
    speed: 5.2,
    los: 22,
    isMythic: false,
    isHero: true,
    producedAt: 'town_center' as const,
  },
  son_of_osiris: {
    kind: 'son_of_osiris' as const,
    name: 'Filho de Osíris',
    role: 'Semideus do Faraó (Era Mítica — Osíris) — dispara raios em cadeia que saltam entre múltiplos inimigos',
    minAge: 4 as AgeLevel,
    cost: { gold: 320, favor: 45 },
    popCost: 4,
    trainTime: 11.0,
    maxHp: 680,
    attack: 62,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.5,
    pierceArmor: 0.65,
    crushArmor: 0.45,
    bonusVsMyth: 4.2,
    bonusVsInfantry: 1.5,
    requiresMinorGod: ['Osiris'],
    requiresMinorGodLabel: 'Osíris',
    splashRadius: 3.8,
    range: 14.5,
    attackCooldown: 1.25,
    speed: 5.5,
    los: 24,
    isMythic: false,
    isHero: true,
    producedAt: 'town_center' as const,
  },
  egypt_spearman: {
    kind: 'egypt_spearman' as const,
    name: 'Lanceiro',
    role: 'Infantaria rápida e barata do Quartel — especialista em derrotar cavalaria inimiga',
    minAge: 2 as AgeLevel,
    cost: { food: 50, gold: 30 },
    popCost: 2,
    trainTime: 5.2,
    maxHp: 135,
    attack: 13,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.28,
    pierceArmor: 0.2,
    crushArmor: 0.1,
    bonusVsCavalry: 1.95,
    range: 2.0,
    attackCooldown: 1.0,
    speed: 5.4,
    los: 16,
    isMythic: false,
    producedAt: 'barracks' as const,
  },
  slinger: {
    kind: 'slinger' as const,
    name: 'Fundeiro',
    role: 'Atirador de funda de baixo custo do Quartel — especializado em eliminar outros arqueiros à distância',
    minAge: 2 as AgeLevel,
    cost: { wood: 45, gold: 25 },
    popCost: 2,
    trainTime: 5.4,
    maxHp: 105,
    attack: 11,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.12,
    pierceArmor: 0.45,
    crushArmor: 0.1,
    bonusVsArcher: 1.9,
    range: 13.0,
    attackCooldown: 1.05,
    speed: 5.1,
    los: 18,
    isMythic: false,
    producedAt: 'barracks' as const,
  },
  axeman: {
    kind: 'axeman' as const,
    name: 'Homem-Machado',
    role: 'Infantaria pesada do Quartel com machado épsilon — letal contra outras unidades de infantaria',
    minAge: 2 as AgeLevel,
    cost: { food: 60, gold: 40 },
    popCost: 2,
    trainTime: 6.0,
    maxHp: 165,
    attack: 18,
    damageType: 'hack' as DamageType,
    hackArmor: 0.42,
    pierceArmor: 0.22,
    crushArmor: 0.18,
    bonusVsInfantry: 2.0,
    range: 1.85,
    attackCooldown: 1.0,
    speed: 4.7,
    los: 16,
    isMythic: false,
    producedAt: 'barracks' as const,
  },
  chariot_archer: {
    kind: 'chariot_archer' as const,
    name: 'Arqueiro de Biga',
    role: 'Arqueiro montado muito rápido da Fortaleza Migdol — forte contra infantaria (Recebe bônus de +HP e +Vel de Rá)',
    minAge: 3 as AgeLevel,
    cost: { wood: 90, gold: 55 },
    popCost: 3,
    trainTime: 7.2,
    maxHp: 185,
    attack: 18,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.2,
    pierceArmor: 0.38,
    crushArmor: 0.15,
    bonusVsInfantry: 1.7,
    range: 14.0,
    attackCooldown: 1.1,
    speed: 8.1,
    los: 21,
    isMythic: false,
    producedAt: 'fortress' as const,
  },
  camel_rider: {
    kind: 'camel_rider' as const,
    name: 'Cavaleiro de Camelo',
    role: 'Cavalaria ágil de dromedário (Fortaleza Migdol) — excelente contra arqueiros e cavalaria (Recebe bônus de Rá)',
    minAge: 3 as AgeLevel,
    cost: { food: 75, gold: 65 },
    popCost: 3,
    trainTime: 7.0,
    maxHp: 220,
    attack: 21,
    damageType: 'hack' as DamageType,
    hackArmor: 0.28,
    pierceArmor: 0.38,
    crushArmor: 0.18,
    bonusVsCavalry: 1.85,
    bonusVsArcher: 1.65,
    range: 2.1,
    attackCooldown: 1.0,
    speed: 8.3,
    los: 20,
    isMythic: false,
    producedAt: 'fortress' as const,
  },
  war_elephant: {
    kind: 'war_elephant' as const,
    name: 'Elefante de Guerra',
    role: 'Colosso de guerra blindado da Fortaleza Migdol — altíssima resistência para absorver dano e demolir construções',
    minAge: 3 as AgeLevel,
    cost: { food: 170, gold: 100 },
    popCost: 5,
    trainTime: 10.5,
    maxHp: 640,
    attack: 44,
    damageType: 'crush' as DamageType,
    hackArmor: 0.52,
    pierceArmor: 0.65,
    crushArmor: 0.4,
    bonusVsBuilding: 2.7,
    splashRadius: 2.4,
    range: 2.5,
    attackCooldown: 1.45,
    speed: 3.8,
    los: 18,
    isMythic: false,
    producedAt: 'fortress' as const,
  },
  siege_tower: {
    kind: 'siege_tower' as const,
    name: 'Torre de Cerco',
    role: 'Veículo blindado da Oficina de Cerco — avança sob flechas e destrói edifícios de perto com aríete solar',
    minAge: 3 as AgeLevel,
    cost: { wood: 160, gold: 100 },
    popCost: 3,
    trainTime: 9.0,
    maxHp: 460,
    attack: 58,
    damageType: 'crush' as DamageType,
    hackArmor: 0.22,
    pierceArmor: 0.88,
    crushArmor: 0.32,
    bonusVsBuilding: 3.6,
    range: 2.5,
    attackCooldown: 1.85,
    speed: 3.7,
    los: 17,
    isMythic: false,
    isSiege: true,
    producedAt: 'siege_works' as const,
  },
  egypt_catapult: {
    kind: 'egypt_catapult' as const,
    name: 'Catapulta',
    role: 'Artilharia de longo alcance da Oficina de Cerco — devastadora contra construções e grupos lentos de tropas',
    minAge: 3 as AgeLevel,
    cost: { wood: 175, gold: 135 },
    popCost: 4,
    trainTime: 10.0,
    maxHp: 310,
    attack: 58,
    damageType: 'crush' as DamageType,
    hackArmor: 0.1,
    pierceArmor: 0.78,
    crushArmor: 0.22,
    bonusVsBuilding: 2.9,
    splashRadius: 3.6,
    range: 17.5,
    attackCooldown: 2.4,
    speed: 3.3,
    los: 21,
    isMythic: false,
    isSiege: true,
    producedAt: 'siege_works' as const,
  },
  sphinx: {
    kind: 'sphinx' as const,
    name: 'Esfinge',
    role: 'Criatura mítica veloz de Bast (Era Clássica) — ataque giratório de areia em área, letal contra aldeões e arqueiros',
    minAge: 2 as AgeLevel,
    cost: { food: 135, favor: 16 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 410,
    attack: 34,
    damageType: 'hack' as DamageType,
    hackArmor: 0.4,
    pierceArmor: 0.45,
    crushArmor: 0.28,
    bonusVsArcher: 1.5,
    bonusVsBuilding: 1.6,
    requiresMinorGod: ['Bast'],
    requiresMinorGodLabel: 'Bast',
    splashRadius: 2.6,
    range: 2.3,
    attackCooldown: 1.25,
    speed: 6.6,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  wadjet: {
    kind: 'wadjet' as const,
    name: 'Wadjet',
    role: 'Serpente gigante alada de Ptá (Era Clássica) — cospe jatos de veneno corrosivo à distância e regenera vida',
    minAge: 2 as AgeLevel,
    cost: { wood: 130, favor: 15 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 350,
    attack: 29,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.3,
    pierceArmor: 0.42,
    crushArmor: 0.22,
    bonusVsInfantry: 1.4,
    requiresMinorGod: ['Ptah'],
    requiresMinorGodLabel: 'Ptá',
    range: 12.5,
    attackCooldown: 1.2,
    speed: 5.4,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  roc: {
    kind: 'roc' as const,
    name: 'Roca',
    role: 'Pássaro gigante sagrado de Hator / Sobek (Era Heroica) — domina os céus sobre rios e montanhas com rasantes velozes',
    minAge: 3 as AgeLevel,
    cost: { gold: 140, favor: 15 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 440,
    attack: 30,
    damageType: 'hack' as DamageType,
    hackArmor: 0.35,
    pierceArmor: 0.55,
    crushArmor: 0.3,
    requiresMinorGod: ['Hathor', 'Sekhmet'],
    requiresMinorGodLabel: 'Hator ou Sobek',
    splashRadius: 2.2,
    range: 2.6,
    attackCooldown: 1.2,
    speed: 8.8,
    los: 26,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  petsuchos: {
    kind: 'petsuchos' as const,
    name: 'Petsuchos',
    role: 'Crocodilo sagrado adornado em ouro de Hator / Sobek (Era Heroica) — dispara um raio solar concentrado de longo alcance',
    minAge: 3 as AgeLevel,
    cost: { gold: 180, favor: 22 },
    popCost: 4,
    trainTime: 10.0,
    maxHp: 460,
    attack: 48,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.42,
    pierceArmor: 0.52,
    crushArmor: 0.32,
    bonusVsInfantry: 1.45,
    requiresMinorGod: ['Hathor'],
    requiresMinorGodLabel: 'Hator / Sobek',
    range: 16.5,
    attackCooldown: 1.55,
    speed: 4.5,
    los: 23,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  scarab: {
    kind: 'scarab' as const,
    name: 'Escaravelho',
    role: 'Besouro gigante blindado de Sekhmet (Era Heroica) — aríete vivo demolidor de edifícios que explode em ácido ao morrer',
    minAge: 3 as AgeLevel,
    cost: { food: 185, favor: 20 },
    popCost: 4,
    trainTime: 10.0,
    maxHp: 680,
    attack: 52,
    damageType: 'crush' as DamageType,
    hackArmor: 0.52,
    pierceArmor: 0.72,
    crushArmor: 0.45,
    bonusVsBuilding: 3.4,
    requiresMinorGod: ['Sekhmet'],
    requiresMinorGodLabel: 'Sekhmet',
    splashRadius: 2.5,
    range: 2.4,
    attackCooldown: 1.45,
    speed: 4.6,
    los: 19,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  avenger: {
    kind: 'avenger' as const,
    name: 'Vingador',
    role: 'Guerreiro de elite com cabeça de falcão de Hórus (Era Mítica) — redemoinho de lâminas Khopesh duplas em área contra tropas',
    minAge: 4 as AgeLevel,
    cost: { food: 210, favor: 26 },
    popCost: 4,
    trainTime: 11.0,
    maxHp: 660,
    attack: 56,
    damageType: 'hack' as DamageType,
    hackArmor: 0.5,
    pierceArmor: 0.48,
    crushArmor: 0.36,
    bonusVsInfantry: 1.65,
    requiresMinorGod: ['Horus'],
    requiresMinorGodLabel: 'Hórus',
    splashRadius: 3.0,
    range: 2.4,
    attackCooldown: 1.1,
    speed: 6.2,
    los: 21,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  mummy: {
    kind: 'mummy' as const,
    name: 'Múmia',
    role: 'Sacerdote imortal de Osíris (Era Mítica) — lança maldições ancestrais à distância que drenam e convertem inimigos',
    minAge: 4 as AgeLevel,
    cost: { gold: 200, favor: 26 },
    popCost: 4,
    trainTime: 11.0,
    maxHp: 540,
    attack: 48,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.42,
    pierceArmor: 0.56,
    crushArmor: 0.35,
    bonusVsInfantry: 1.5,
    requiresMinorGod: ['Osiris'],
    requiresMinorGodLabel: 'Osíris',
    splashRadius: 2.2,
    range: 13.5,
    attackCooldown: 1.35,
    speed: 5.0,
    los: 22,
    isMythic: true,
    producedAt: 'temple' as const,
  },
};

export const NORSE_ROSTER_STATS = {
  norse_dwarf: {
    kind: 'norse_dwarf' as const,
    name: 'Anão Minerador',
    role: 'Forjador anão de Nidavellir treinado no Centro da Cidade — custa Ouro e coleta Ouro muito mais rápido que coletores comuns',
    minAge: 1 as AgeLevel,
    cost: { gold: 60 },
    popCost: 1,
    trainTime: 5.5,
    maxHp: 85,
    attack: 7,
    damageType: 'hack' as DamageType,
    hackArmor: 0.18,
    pierceArmor: 0.18,
    crushArmor: 0.12,
    range: 1.6,
    attackCooldown: 1.2,
    speed: 4.7,
    los: 15,
    isMythic: false,
    producedAt: 'town_center' as const,
  },
  ox_cart: {
    kind: 'ox_cart' as const,
    name: 'Carro de Bois',
    role: 'Depósito móvel de recursos nórdico — acompanha os coletores e anões até florestas, minas de ouro e áreas de caça',
    minAge: 1 as AgeLevel,
    cost: { food: 40, wood: 40 },
    popCost: 1,
    trainTime: 5.0,
    maxHp: 210,
    attack: 4,
    damageType: 'crush' as DamageType,
    hackArmor: 0.25,
    pierceArmor: 0.55,
    crushArmor: 0.2,
    range: 1.5,
    attackCooldown: 1.5,
    speed: 5.2,
    los: 16,
    isMythic: false,
    producedAt: 'town_center' as const,
  },
  hersir: {
    kind: 'hersir' as const,
    name: 'Hersir',
    role: 'Herói nórdico corpo a corpo (Salão Comunal / Templo) — gera Favor em combate, coleta relíquias e esmaga criaturas míticas',
    minAge: 1 as AgeLevel,
    cost: { food: 80, gold: 45 },
    popCost: 2,
    trainTime: 6.5,
    maxHp: 340,
    attack: 22,
    damageType: 'hack' as DamageType,
    hackArmor: 0.38,
    pierceArmor: 0.4,
    crushArmor: 0.3,
    bonusVsMyth: 4.0,
    range: 2.0,
    attackCooldown: 1.0,
    speed: 5.3,
    los: 20,
    isMythic: false,
    isHero: true,
    producedAt: 'temple' as const,
  },
  godi: {
    kind: 'godi' as const,
    name: 'Godi',
    role: 'Sacerdote-herói nórdico de longo alcance (Retold) — arremessa lanças rúnicas contra unidades míticas terrestres e voadoras',
    minAge: 2 as AgeLevel,
    cost: { wood: 75, gold: 50 },
    popCost: 2,
    trainTime: 6.8,
    maxHp: 250,
    attack: 18,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.24,
    pierceArmor: 0.42,
    crushArmor: 0.2,
    bonusVsMyth: 3.8,
    range: 13.5,
    attackCooldown: 1.15,
    speed: 5.0,
    los: 21,
    isMythic: false,
    isHero: true,
    producedAt: 'temple' as const,
  },
  ulfsark: {
    kind: 'ulfsark' as const,
    name: 'Ulfsark (Berserk)',
    role: 'Infantaria rápida viking de dupla lâmina que constrói todos os edifícios nórdicos — versátil em combate e incursões',
    minAge: 1 as AgeLevel,
    cost: { food: 50, gold: 30 },
    popCost: 2,
    trainTime: 5.5,
    maxHp: 155,
    attack: 16,
    damageType: 'hack' as DamageType,
    hackArmor: 0.28,
    pierceArmor: 0.2,
    crushArmor: 0.15,
    bonusVsCavalry: 1.45,
    range: 1.85,
    attackCooldown: 0.95,
    speed: 5.4,
    los: 17,
    isMythic: false,
    producedAt: 'barracks' as const,
  },
  throwing_axeman: {
    kind: 'throwing_axeman' as const,
    name: 'Lançador de Machado',
    role: 'Infantaria nórdica que arremessa machados à distância causando dano cortante — especialista em dizimar infantaria inimiga',
    minAge: 2 as AgeLevel,
    cost: { wood: 50, gold: 35 },
    popCost: 2,
    trainTime: 5.8,
    maxHp: 130,
    attack: 15,
    damageType: 'hack' as DamageType,
    hackArmor: 0.26,
    pierceArmor: 0.24,
    crushArmor: 0.15,
    bonusVsInfantry: 2.1,
    range: 10.5,
    attackCooldown: 1.15,
    speed: 4.8,
    los: 18,
    isMythic: false,
    producedAt: 'barracks' as const,
  },
  raiding_cavalry: {
    kind: 'raiding_cavalry' as const,
    name: 'Cavaleiro de Incursão',
    role: 'Cavalaria rápida de saqueadores vikings — excelente para flanquear arqueiros, armas de cerco e trabalhadores',
    minAge: 2 as AgeLevel,
    cost: { food: 70, gold: 45 },
    popCost: 2,
    trainTime: 6.2,
    maxHp: 195,
    attack: 19,
    damageType: 'hack' as DamageType,
    hackArmor: 0.24,
    pierceArmor: 0.36,
    crushArmor: 0.15,
    bonusVsArcher: 1.8,
    bonusVsSiege: 1.5,
    range: 2.1,
    attackCooldown: 1.0,
    speed: 8.2,
    los: 19,
    isMythic: false,
    producedAt: 'stable' as const,
  },
  huskarl: {
    kind: 'huskarl' as const,
    name: 'Huskarl',
    role: 'Infantaria de elite do Forte da Colina com escudo pesado — altíssima proteção contra projéteis, letal contra arqueiros',
    minAge: 3 as AgeLevel,
    cost: { food: 75, gold: 55 },
    popCost: 2,
    trainTime: 6.8,
    maxHp: 215,
    attack: 23,
    damageType: 'hack' as DamageType,
    hackArmor: 0.32,
    pierceArmor: 0.68,
    crushArmor: 0.22,
    bonusVsArcher: 2.1,
    bonusVsBuilding: 1.35,
    range: 1.95,
    attackCooldown: 0.95,
    speed: 5.1,
    los: 18,
    isMythic: false,
    producedAt: 'fortress' as const,
  },
  jarl: {
    kind: 'jarl' as const,
    name: 'Jarl',
    role: 'Cavalaria pesada nobre do Forte da Colina — altíssima vida e bônus poderoso contra unidades míticas',
    minAge: 3 as AgeLevel,
    cost: { food: 95, gold: 75 },
    popCost: 3,
    trainTime: 7.5,
    maxHp: 310,
    attack: 26,
    damageType: 'hack' as DamageType,
    hackArmor: 0.38,
    pierceArmor: 0.42,
    crushArmor: 0.25,
    bonusVsMyth: 2.2,
    range: 2.2,
    attackCooldown: 1.05,
    speed: 7.5,
    los: 20,
    isMythic: false,
    producedAt: 'fortress' as const,
  },
  portable_ram: {
    kind: 'portable_ram' as const,
    name: 'Aríete Portátil',
    role: 'Aríete viking rápido carregado por guerreiros (Forte da Colina) — esmaga muralhas, torres e edifícios de perto',
    minAge: 3 as AgeLevel,
    cost: { wood: 135, gold: 85 },
    popCost: 3,
    trainTime: 8.0,
    maxHp: 410,
    attack: 56,
    damageType: 'crush' as DamageType,
    hackArmor: 0.2,
    pierceArmor: 0.86,
    crushArmor: 0.3,
    bonusVsBuilding: 3.6,
    range: 2.4,
    attackCooldown: 1.8,
    speed: 4.1,
    los: 17,
    isMythic: false,
    isSiege: true,
    producedAt: 'siege_works' as const,
  },
  norse_ballista: {
    kind: 'norse_ballista' as const,
    name: 'Balista Nórdica',
    role: 'Artilharia pesada de longo alcance (Forte da Colina) — dispara virotes gigantes contra tropas e fortificações',
    minAge: 4 as AgeLevel,
    cost: { wood: 165, gold: 130 },
    popCost: 4,
    trainTime: 9.5,
    maxHp: 320,
    attack: 56,
    damageType: 'crush' as DamageType,
    hackArmor: 0.14,
    pierceArmor: 0.78,
    crushArmor: 0.24,
    bonusVsBuilding: 2.8,
    bonusVsInfantry: 1.5,
    splashRadius: 3.4,
    range: 17.5,
    attackCooldown: 2.2,
    speed: 3.5,
    los: 21,
    isMythic: false,
    isSiege: true,
    producedAt: 'siege_works' as const,
  },
  troll: {
    kind: 'troll' as const,
    name: 'Troll',
    role: 'Criatura de caverna de Forseti (Era Clássica) — arremessa pedregulhos à distância e regenera vida ao causar dano',
    minAge: 2 as AgeLevel,
    cost: { wood: 140, favor: 15 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 380,
    attack: 31,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.38,
    pierceArmor: 0.42,
    crushArmor: 0.28,
    requiresMinorGod: ['Forseti'],
    requiresMinorGodLabel: 'Forseti',
    range: 12.5,
    attackCooldown: 1.3,
    speed: 4.7,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  valkyrie: {
    kind: 'valkyrie' as const,
    name: 'Valquíria',
    role: 'Guerreira celestial montada de Freyja (Era Clássica) — cavalga na vanguarda e cura tropas aliadas feridas',
    minAge: 2 as AgeLevel,
    cost: { food: 150, favor: 16 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 430,
    attack: 32,
    damageType: 'hack' as DamageType,
    hackArmor: 0.4,
    pierceArmor: 0.48,
    crushArmor: 0.3,
    requiresMinorGod: ['Freyja'],
    requiresMinorGodLabel: 'Freyja',
    range: 2.3,
    attackCooldown: 1.15,
    speed: 7.4,
    los: 21,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  einherjar: {
    kind: 'einherjar' as const,
    name: 'Einherjar',
    role: 'Guerreiro de Valhalla de Heimdall (Era Clássica) — sopra a trompa Gjallarhorn inspirando o ataque aliado e demole defesas',
    minAge: 2 as AgeLevel,
    cost: { gold: 145, favor: 16 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 460,
    attack: 38,
    damageType: 'hack' as DamageType,
    hackArmor: 0.5,
    pierceArmor: 0.44,
    crushArmor: 0.35,
    bonusVsBuilding: 2.2,
    requiresMinorGod: ['Heimdall'],
    requiresMinorGodLabel: 'Heimdall',
    splashRadius: 2.2,
    range: 2.2,
    attackCooldown: 1.25,
    speed: 4.5,
    los: 19,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  frost_giant: {
    kind: 'frost_giant' as const,
    name: 'Gigante de Gelo',
    role: 'Colosso glacial de Skadi / Hel (Era Heroica) — esmaga inimigos com clava de gelo e congela alvos com sopro ártico',
    minAge: 3 as AgeLevel,
    cost: { food: 200, favor: 22 },
    popCost: 4,
    trainTime: 10.5,
    maxHp: 740,
    attack: 54,
    damageType: 'crush' as DamageType,
    hackArmor: 0.5,
    pierceArmor: 0.6,
    crushArmor: 0.42,
    bonusVsBuilding: 2.2,
    requiresMinorGod: ['Skadi', 'Hel'],
    requiresMinorGodLabel: 'Skadi ou Hel',
    splashRadius: 2.6,
    range: 2.5,
    attackCooldown: 1.45,
    speed: 4.4,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  mountain_giant: {
    kind: 'mountain_giant' as const,
    name: 'Gigante da Montanha',
    role: 'Titã de granito de Njord / Hel (Era Heroica) — brande uma árvore inteira para pulverizar fortalezas e centros',
    minAge: 3 as AgeLevel,
    cost: { food: 220, favor: 24 },
    popCost: 4,
    trainTime: 11.0,
    maxHp: 880,
    attack: 66,
    damageType: 'crush' as DamageType,
    hackArmor: 0.56,
    pierceArmor: 0.68,
    crushArmor: 0.48,
    bonusVsBuilding: 3.4,
    requiresMinorGod: ['Njord', 'Hel'],
    requiresMinorGodLabel: 'Njord ou Hel',
    splashRadius: 2.8,
    range: 2.6,
    attackCooldown: 1.55,
    speed: 4.1,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  battle_boar: {
    kind: 'battle_boar' as const,
    name: 'Javali de Batalha',
    role: 'Javali mecânico dourado de Bragi (Era Heroica) — blindagem metálica pesada que arremessa tropas inimigas em área',
    minAge: 3 as AgeLevel,
    cost: { gold: 185, favor: 21 },
    popCost: 3,
    trainTime: 9.5,
    maxHp: 610,
    attack: 46,
    damageType: 'crush' as DamageType,
    hackArmor: 0.54,
    pierceArmor: 0.62,
    crushArmor: 0.44,
    bonusVsInfantry: 1.6,
    bonusVsBuilding: 2.1,
    requiresMinorGod: ['Bragi'],
    requiresMinorGodLabel: 'Bragi',
    splashRadius: 2.7,
    range: 2.3,
    attackCooldown: 1.3,
    speed: 6.2,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  kraken: {
    kind: 'kraken' as const,
    name: 'Kraken',
    role: 'Monstro abissal tentacular de Njord (Era Heroica) — afunda embarcações instantaneamente e esmaga tropas com tentáculos',
    minAge: 3 as AgeLevel,
    cost: { food: 210, favor: 22 },
    popCost: 4,
    trainTime: 10.5,
    maxHp: 780,
    attack: 62,
    damageType: 'crush' as DamageType,
    hackArmor: 0.5,
    pierceArmor: 0.64,
    crushArmor: 0.45,
    bonusVsBuilding: 2.5,
    requiresMinorGod: ['Njord', 'Skadi'],
    requiresMinorGodLabel: 'Njord',
    splashRadius: 3.0,
    range: 2.8,
    attackCooldown: 1.4,
    speed: 5.0,
    los: 21,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  rock_troll: {
    kind: 'rock_troll' as const,
    name: 'Troll da Rocha',
    role: 'Criatura blindada de Aegir / Freyr (Era Heroica — Retold) — bloqueia ataques de frente e resiste fortemente a projéteis',
    minAge: 3 as AgeLevel,
    cost: { gold: 175, favor: 20 },
    popCost: 3,
    trainTime: 9.5,
    maxHp: 690,
    attack: 48,
    damageType: 'crush' as DamageType,
    hackArmor: 0.58,
    pierceArmor: 0.78,
    crushArmor: 0.5,
    bonusVsBuilding: 2.4,
    requiresMinorGod: ['Aegir', 'Bragi', 'Njord'],
    requiresMinorGodLabel: 'Aegir (Freyr)',
    splashRadius: 2.4,
    range: 2.4,
    attackCooldown: 1.35,
    speed: 4.5,
    los: 19,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  fire_giant: {
    kind: 'fire_giant' as const,
    name: 'Gigante de Fogo',
    role: 'Colosso de Muspelheim de Baldr / Hel (Era Mítica) — armado com espada flamejante que dispara bolas de fogo em área',
    minAge: 4 as AgeLevel,
    cost: { gold: 240, favor: 28 },
    popCost: 4,
    trainTime: 11.5,
    maxHp: 820,
    attack: 68,
    damageType: 'crush' as DamageType,
    hackArmor: 0.52,
    pierceArmor: 0.62,
    crushArmor: 0.46,
    bonusVsBuilding: 2.8,
    bonusVsInfantry: 1.5,
    requiresMinorGod: ['Baldr', 'Hel'],
    requiresMinorGodLabel: 'Baldr ou Hel',
    splashRadius: 3.4,
    range: 12.5,
    attackCooldown: 1.5,
    speed: 4.5,
    los: 22,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  fenris_wolf: {
    kind: 'fenris_wolf' as const,
    name: 'Cria de Fenris',
    role: 'Lobo monstruoso de Tyr (Era Mítica) — fúria predatória veloz que rasga exércitos inimigos em matilha',
    minAge: 4 as AgeLevel,
    cost: { food: 185, favor: 22 },
    popCost: 3,
    trainTime: 9.5,
    maxHp: 560,
    attack: 54,
    damageType: 'hack' as DamageType,
    hackArmor: 0.44,
    pierceArmor: 0.46,
    crushArmor: 0.34,
    bonusVsInfantry: 1.6,
    bonusVsArcher: 1.6,
    requiresMinorGod: ['Tyr'],
    requiresMinorGodLabel: 'Tyr',
    range: 2.2,
    attackCooldown: 1.0,
    speed: 7.8,
    los: 22,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  nidhogg: {
    kind: 'nidhogg' as const,
    name: 'Nidhogg',
    role: 'Dragão gigante alado de Hel (Era Mítica) — sobrevoa o campo de batalha cuspindo fogo devastador sobre exércitos e bases',
    minAge: 4 as AgeLevel,
    cost: { gold: 320, favor: 40 },
    popCost: 5,
    trainTime: 13.5,
    maxHp: 1350,
    attack: 88,
    damageType: 'crush' as DamageType,
    hackArmor: 0.58,
    pierceArmor: 0.65,
    crushArmor: 0.5,
    bonusVsBuilding: 3.0,
    bonusVsInfantry: 1.7,
    requiresMinorGod: ['Hel'],
    requiresMinorGodLabel: 'Hel',
    splashRadius: 4.0,
    range: 13.5,
    attackCooldown: 1.45,
    speed: 6.8,
    los: 25,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  jormungand: {
    kind: 'jormungand' as const,
    name: 'Prole de Jormungand',
    role: 'Serpente marinha colosal de Njord / Hel (Era Mítica) — dispara jatos de ácido corrosivo contra navios e unidades costeiras',
    minAge: 4 as AgeLevel,
    cost: { food: 220, favor: 26 },
    popCost: 4,
    trainTime: 11.0,
    maxHp: 760,
    attack: 60,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.46,
    pierceArmor: 0.58,
    crushArmor: 0.4,
    bonusVsBuilding: 2.2,
    requiresMinorGod: ['Njord', 'Hel'],
    requiresMinorGodLabel: 'Njord ou Hel',
    splashRadius: 2.8,
    range: 14.5,
    attackCooldown: 1.35,
    speed: 5.4,
    los: 22,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  fafnir: {
    kind: 'fafnir' as const,
    name: 'Fafnir',
    role: 'Dragão terrestre couraçado de Vidar / Freyr (Era Mítica — Retold) — cospe fogo e emana névoa tóxica venenosa em área',
    minAge: 4 as AgeLevel,
    cost: { gold: 300, favor: 32 },
    popCost: 5,
    trainTime: 12.5,
    maxHp: 1180,
    attack: 76,
    damageType: 'crush' as DamageType,
    hackArmor: 0.62,
    pierceArmor: 0.7,
    crushArmor: 0.52,
    bonusVsBuilding: 2.9,
    bonusVsInfantry: 1.6,
    requiresMinorGod: ['Vidar', 'Baldr', 'Tyr'],
    requiresMinorGodLabel: 'Vidar (Freyr) ou Baldr',
    splashRadius: 3.6,
    range: 9.5,
    attackCooldown: 1.4,
    speed: 4.8,
    los: 22,
    isMythic: true,
    producedAt: 'temple' as const,
  },
};

export const ATLANTEAN_ROSTER_STATS = {
  citizen: {
    kind: 'citizen' as const,
    name: 'Cidadão',
    role: 'Aldeão atlante — coleta recursos muito rápido sem precisar depositar em edifícios; pode ser promovido a Herói',
    minAge: 1 as AgeLevel,
    cost: { food: 105, wood: 25 },
    popCost: 2,
    trainTime: 7.5,
    maxHp: 115,
    attack: 8,
    damageType: 'hack' as DamageType,
    hackArmor: 0.2,
    pierceArmor: 0.2,
    crushArmor: 0.14,
    range: 1.65,
    attackCooldown: 1.15,
    speed: 5.0,
    los: 16,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'town_center' as const,
  },
  oracle: {
    kind: 'oracle' as const,
    name: 'Oráculo',
    role: 'Batedor vidente — amplia sua visão (+10) e gera Favor Divino passivo quando imóvel; pode ser promovido a Herói',
    minAge: 1 as AgeLevel,
    cost: { gold: 75 },
    popCost: 2,
    trainTime: 6.5,
    maxHp: 120,
    attack: 0,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.15,
    pierceArmor: 0.28,
    crushArmor: 0.12,
    range: 11.0,
    attackCooldown: 1.15,
    speed: 5.6,
    los: 20,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'town_center' as const,
  },
  llama_caravan: {
    kind: 'llama_caravan' as const,
    name: 'Caravana de Lhama',
    role: 'Unidade comercial do Mercado — gera Ouro continuamente em rotas comerciais entre Mercado e Centro da Cidade',
    minAge: 2 as AgeLevel,
    cost: { food: 65, gold: 45 },
    popCost: 1,
    trainTime: 6.5,
    maxHp: 135,
    attack: 0,
    damageType: 'hack' as DamageType,
    hackArmor: 0.2,
    pierceArmor: 0.35,
    crushArmor: 0.15,
    range: 1.5,
    attackCooldown: 1.5,
    speed: 6.4,
    los: 14,
    isMythic: false,
    producedAt: 'market' as const,
  },
  murmillo: {
    kind: 'murmillo' as const,
    name: 'Murmillo',
    role: 'Quartel Militar (Clássica) — infantaria padrão corpo a corpo versátil e resistente; promovível a Herói',
    minAge: 2 as AgeLevel,
    cost: { food: 60, gold: 40 },
    popCost: 2,
    trainTime: 6.0,
    maxHp: 165,
    attack: 16,
    damageType: 'hack' as DamageType,
    hackArmor: 0.38,
    pierceArmor: 0.26,
    crushArmor: 0.18,
    range: 1.9,
    attackCooldown: 1.0,
    speed: 4.8,
    los: 16,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'barracks' as const,
  },
  katapeltes: {
    kind: 'katapeltes' as const,
    name: 'Katapeltes',
    role: 'Contra-Quartel (Clássica) — infantaria especialista em derrotar cavalaria inimiga; promovível a Herói',
    minAge: 2 as AgeLevel,
    cost: { food: 55, gold: 45 },
    popCost: 2,
    trainTime: 5.8,
    maxHp: 148,
    attack: 14,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.3,
    pierceArmor: 0.24,
    crushArmor: 0.15,
    bonusVsCavalry: 2.25,
    range: 2.15,
    attackCooldown: 1.0,
    speed: 5.0,
    los: 17,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'archery_range' as const,
  },
  turma: {
    kind: 'turma' as const,
    name: 'Turma',
    role: 'Contra-Quartel (Clássica) — cavalaria à distância rápida com dardos, letal contra arqueiros; promovível a Herói',
    minAge: 2 as AgeLevel,
    cost: { wood: 55, gold: 50 },
    popCost: 2,
    trainTime: 6.2,
    maxHp: 155,
    attack: 13,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.18,
    pierceArmor: 0.44,
    crushArmor: 0.14,
    bonusVsArcher: 1.8,
    range: 11.5,
    attackCooldown: 1.05,
    speed: 8.1,
    los: 20,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'archery_range' as const,
  },
  cheiroballista: {
    kind: 'cheiroballista' as const,
    name: 'Cheiroballista',
    role: 'Contra-Quartel (Clássica) — arma de cerco leve que dispara virotes perfurantes contra infantaria e construções',
    minAge: 2 as AgeLevel,
    cost: { wood: 115, gold: 85 },
    popCost: 3,
    trainTime: 8.0,
    maxHp: 175,
    attack: 26,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.12,
    pierceArmor: 0.68,
    crushArmor: 0.16,
    bonusVsInfantry: 2.0,
    bonusVsBuilding: 1.5,
    range: 16.0,
    attackCooldown: 1.7,
    speed: 3.7,
    los: 20,
    isMythic: false,
    isSiege: true,
    producedAt: 'archery_range' as const,
  },
  arcus: {
    kind: 'arcus' as const,
    name: 'Arcus',
    role: 'Quartel Militar (Heroica) — arqueiro de longo alcance de oricalco letal contra infantaria; promovível a Herói',
    minAge: 3 as AgeLevel,
    cost: { wood: 65, gold: 50 },
    popCost: 2,
    trainTime: 6.2,
    maxHp: 120,
    attack: 17,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.14,
    pierceArmor: 0.36,
    crushArmor: 0.12,
    bonusVsInfantry: 1.55,
    range: 15.0,
    attackCooldown: 1.15,
    speed: 5.1,
    los: 21,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'barracks' as const,
  },
  contarius: {
    kind: 'contarius' as const,
    name: 'Contarius',
    role: 'Quartel Militar (Heroica) — cavalaria pesada blindada contra arqueiros e cerco; promovível a Herói',
    minAge: 3 as AgeLevel,
    cost: { food: 90, gold: 70 },
    popCost: 3,
    trainTime: 7.2,
    maxHp: 245,
    attack: 25,
    damageType: 'hack' as DamageType,
    hackArmor: 0.32,
    pierceArmor: 0.42,
    crushArmor: 0.22,
    bonusVsArcher: 1.7,
    bonusVsSiege: 1.6,
    range: 2.3,
    attackCooldown: 1.05,
    speed: 7.8,
    los: 20,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'barracks' as const,
  },
  destroyer: {
    kind: 'destroyer' as const,
    name: 'Destruidor',
    role: 'Palácio (Heroica) — infantaria pesada com escudo torre especialista em demolir construções; promovível a Herói',
    minAge: 3 as AgeLevel,
    cost: { food: 80, gold: 60 },
    popCost: 3,
    trainTime: 7.0,
    maxHp: 240,
    attack: 21,
    damageType: 'crush' as DamageType,
    hackArmor: 0.36,
    pierceArmor: 0.62,
    crushArmor: 0.26,
    bonusVsBuilding: 2.7,
    range: 2.0,
    attackCooldown: 1.15,
    speed: 4.3,
    los: 17,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'fortress' as const,
  },
  fanatic: {
    kind: 'fanatic' as const,
    name: 'Fanático',
    role: 'Palácio (Mítica) — infantaria de elite com lâminas duplas letal contra soldados humanos; promovível a Herói',
    minAge: 4 as AgeLevel,
    cost: { food: 85, gold: 75 },
    popCost: 3,
    trainTime: 7.2,
    maxHp: 225,
    attack: 26,
    damageType: 'hack' as DamageType,
    hackArmor: 0.44,
    pierceArmor: 0.38,
    crushArmor: 0.25,
    bonusVsInfantry: 1.75,
    bonusVsCavalry: 1.5,
    range: 2.0,
    attackCooldown: 0.85,
    speed: 5.5,
    los: 19,
    isMythic: false,
    canPromoteHero: true,
    producedAt: 'fortress' as const,
  },
  fire_siphon: {
    kind: 'fire_siphon' as const,
    name: 'Sifão de Fogo',
    role: 'Palácio (Mítica) — arma de cerco lança-chamas devastadora a curta/média distância contra construções',
    minAge: 4 as AgeLevel,
    cost: { wood: 175, gold: 135 },
    popCost: 4,
    trainTime: 9.5,
    maxHp: 390,
    attack: 52,
    damageType: 'crush' as DamageType,
    hackArmor: 0.16,
    pierceArmor: 0.84,
    crushArmor: 0.28,
    bonusVsBuilding: 3.4,
    splashRadius: 2.6,
    range: 8.5,
    attackCooldown: 1.55,
    speed: 3.6,
    los: 18,
    isMythic: false,
    isSiege: true,
    producedAt: 'fortress' as const,
  },
  onager: {
    kind: 'onager' as const,
    name: 'Onagro',
    role: 'Palácio (Mítica — Retold) — catapulta pesada de longo alcance com pedregulhos devastadores em área',
    minAge: 4 as AgeLevel,
    cost: { wood: 190, gold: 150 },
    popCost: 4,
    trainTime: 10.5,
    maxHp: 340,
    attack: 62,
    damageType: 'crush' as DamageType,
    hackArmor: 0.12,
    pierceArmor: 0.78,
    crushArmor: 0.22,
    bonusVsBuilding: 2.9,
    splashRadius: 3.6,
    range: 18.0,
    attackCooldown: 2.4,
    speed: 3.2,
    los: 22,
    isMythic: false,
    isSiege: true,
    producedAt: 'fortress' as const,
  },
  promethean: {
    kind: 'promethean' as const,
    name: 'Prometeico',
    role: 'Templo (Clássica — Prometeu) — criatura de barro que se divide em dois Prometeicos Menores ao morrer',
    minAge: 2 as AgeLevel,
    cost: { food: 130, favor: 14 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 400,
    attack: 32,
    damageType: 'hack' as DamageType,
    hackArmor: 0.42,
    pierceArmor: 0.48,
    crushArmor: 0.3,
    requiresMinorGod: ['Prometheus'],
    requiresMinorGodLabel: 'Prometeu',
    range: 2.2,
    attackCooldown: 1.25,
    speed: 5.0,
    los: 19,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  promethean_offspring: {
    kind: 'promethean_offspring' as const,
    name: 'Cria Prometeica',
    role: 'Fragmento de Prometeico gerado ao morrer — ágil e implacável em combate corpo a corpo',
    minAge: 2 as AgeLevel,
    cost: { food: 65, favor: 7 },
    popCost: 1,
    trainTime: 5.0,
    maxHp: 175,
    attack: 18,
    damageType: 'hack' as DamageType,
    hackArmor: 0.32,
    pierceArmor: 0.38,
    crushArmor: 0.22,
    range: 1.9,
    attackCooldown: 1.1,
    speed: 5.5,
    los: 16,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  caladria: {
    kind: 'caladria' as const,
    name: 'Caládria',
    role: 'Templo (Clássica — Oceano) — espírito alado pacífico que cura continuamente tropas aliadas próximas',
    minAge: 2 as AgeLevel,
    cost: { wood: 110, favor: 12 },
    popCost: 2,
    trainTime: 7.5,
    maxHp: 260,
    attack: 0,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.22,
    pierceArmor: 0.42,
    crushArmor: 0.2,
    requiresMinorGod: ['Okeanus'],
    requiresMinorGodLabel: 'Oceano',
    range: 11.0,
    attackCooldown: 1.1,
    speed: 7.8,
    los: 24,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  behemoth: {
    kind: 'behemoth' as const,
    name: 'Beemote',
    role: 'Templo (Heroica — Réia) — fera colossal demolidora de construções com regeneração contínua de vida',
    minAge: 3 as AgeLevel,
    cost: { food: 215, favor: 22 },
    popCost: 4,
    trainTime: 10.5,
    maxHp: 840,
    attack: 56,
    damageType: 'crush' as DamageType,
    hackArmor: 0.52,
    pierceArmor: 0.66,
    crushArmor: 0.42,
    bonusVsBuilding: 3.1,
    splashRadius: 2.5,
    requiresMinorGod: ['Rheia'],
    requiresMinorGodLabel: 'Réia',
    range: 2.6,
    attackCooldown: 1.55,
    speed: 4.3,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  stymphalian_bird: {
    kind: 'stymphalian_bird' as const,
    name: 'Ave do Estínfalo',
    role: 'Templo (Heroica — Teia) — ave metálica voadora que dispara penas de bronze perfurantes à distância',
    minAge: 3 as AgeLevel,
    cost: { gold: 145, favor: 20 },
    popCost: 3,
    trainTime: 9.0,
    maxHp: 390,
    attack: 34,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.3,
    pierceArmor: 0.52,
    crushArmor: 0.26,
    bonusVsInfantry: 1.4,
    requiresMinorGod: ['Theia'],
    requiresMinorGodLabel: 'Teia',
    range: 14.5,
    attackCooldown: 1.2,
    speed: 7.6,
    los: 25,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  dryad: {
    kind: 'dryad' as const,
    name: 'Dríade',
    role: 'Templo / Hespérides (Heroica — Teia) — ninfa guerreira da floresta com alta resistência a flechas',
    minAge: 3 as AgeLevel,
    cost: { wood: 115, favor: 14 },
    popCost: 2,
    trainTime: 7.5,
    maxHp: 340,
    attack: 29,
    damageType: 'hack' as DamageType,
    hackArmor: 0.34,
    pierceArmor: 0.54,
    crushArmor: 0.24,
    requiresMinorGod: ['Theia'],
    requiresMinorGodLabel: 'Teia',
    range: 2.2,
    attackCooldown: 1.05,
    speed: 5.9,
    los: 20,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  hekagigantes: {
    kind: 'hekagigantes' as const,
    name: 'Hecatônquiro (Centimano)',
    role: 'Templo (Mítica — Hélios) — gigante de múltiplos braços que golpeia múltiplos inimigos em área com ondas de choque',
    minAge: 4 as AgeLevel,
    cost: { food: 245, favor: 30 },
    popCost: 5,
    trainTime: 12.0,
    maxHp: 1140,
    attack: 74,
    damageType: 'crush' as DamageType,
    hackArmor: 0.58,
    pierceArmor: 0.65,
    crushArmor: 0.45,
    bonusVsBuilding: 2.6,
    splashRadius: 3.6,
    requiresMinorGod: ['Helios'],
    requiresMinorGodLabel: 'Hélios',
    range: 2.9,
    attackCooldown: 1.5,
    speed: 4.4,
    los: 22,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  argus: {
    kind: 'argus' as const,
    name: 'Argos',
    role: 'Templo (Mítica — Atlas) — criatura de múltiplos olhos que dispara jatos de ácido capazes de dissolver tropas',
    minAge: 4 as AgeLevel,
    cost: { gold: 225, favor: 28 },
    popCost: 4,
    trainTime: 11.0,
    maxHp: 740,
    attack: 58,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.48,
    pierceArmor: 0.55,
    crushArmor: 0.38,
    bonusVsInfantry: 1.6,
    splashRadius: 3.0,
    requiresMinorGod: ['Atlas'],
    requiresMinorGodLabel: 'Atlas',
    range: 7.5,
    attackCooldown: 1.35,
    speed: 5.2,
    los: 24,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  lampades: {
    kind: 'lampades' as const,
    name: 'Lâmpade',
    role: 'Templo (Mítica — Hécate) — ninfa do submundo cuja chama caótica atordoa e confunde exércitos à distância',
    minAge: 4 as AgeLevel,
    cost: { gold: 210, favor: 26 },
    popCost: 4,
    trainTime: 10.5,
    maxHp: 520,
    attack: 46,
    damageType: 'pierce' as DamageType,
    hackArmor: 0.36,
    pierceArmor: 0.48,
    crushArmor: 0.28,
    splashRadius: 2.5,
    requiresMinorGod: ['Hekate'],
    requiresMinorGodLabel: 'Hécate',
    range: 13.5,
    attackCooldown: 1.35,
    speed: 5.5,
    los: 22,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  carnivora: {
    kind: 'carnivora' as const,
    name: 'Carnívora',
    role: 'Templo / Oceano — planta devoradora gigante com mandíbulas vorazes contra tropas próximas',
    minAge: 2 as AgeLevel,
    cost: { food: 150, favor: 16 },
    popCost: 3,
    trainTime: 8.5,
    maxHp: 560,
    attack: 45,
    damageType: 'hack' as DamageType,
    hackArmor: 0.44,
    pierceArmor: 0.55,
    crushArmor: 0.32,
    requiresMinorGod: ['Okeanus'],
    requiresMinorGodLabel: 'Oceano',
    range: 3.4,
    attackCooldown: 1.25,
    speed: 2.6,
    los: 18,
    isMythic: true,
    producedAt: 'temple' as const,
  },
  tartarian_spawn: {
    kind: 'tartarian_spawn' as const,
    name: 'Cria do Tártaro',
    role: 'Templo / Portal do Tártaro (Hécate) — demônio alado feroz do abismo letal contra tropas e estruturas',
    minAge: 4 as AgeLevel,
    cost: { food: 180, favor: 24 },
    popCost: 4,
    trainTime: 10.0,
    maxHp: 640,
    attack: 54,
    damageType: 'hack' as DamageType,
    hackArmor: 0.46,
    pierceArmor: 0.52,
    crushArmor: 0.36,
    bonusVsBuilding: 1.8,
    requiresMinorGod: ['Hekate'],
    requiresMinorGodLabel: 'Hécate',
    range: 2.5,
    attackCooldown: 1.15,
    speed: 6.4,
    los: 21,
    isMythic: true,
    producedAt: 'temple' as const,
  },
};

export const CIVILIZATION_UNITS: CivilizationUnitMap = {
  gregos: {
    ...EGYPTIAN_ROSTER_STATS,
    ...NORSE_ROSTER_STATS,
    ...ATLANTEAN_ROSTER_STATS,
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
      role: 'Espinha dorsal da falange grega (Lança Dory & Hoplon) — forte contra Cavalaria',
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
      role: 'Infantaria leve anti-infantaria (Kopis & Áspis) — especialista contra batedores e infantaria',
      minAge: 2,
      cost: { food: 60, gold: 35 },
      popCost: 2,
      trainTime: 6.0,
      maxHp: 165,
      attack: 17,
      damageType: 'hack',
      hackArmor: 0.4,
      pierceArmor: 0.25,
      crushArmor: 0.2,
      bonusVsInfantry: 1.75,
      range: 1.8,
      attackCooldown: 0.95,
      speed: 5.0,
      los: 17,
      isMythic: false,
      producedAt: 'barracks',
    },
    myrmidon: {
      kind: 'myrmidon',
      name: 'Mirmidão',
      role: 'Infantaria de elite exclusiva de Zeus (Era Mítica) — ganha velocidade e ataque em combate',
      minAge: 4,
      cost: { food: 75, gold: 65, favor: 6 },
      popCost: 2,
      trainTime: 6.5,
      maxHp: 195,
      attack: 22,
      damageType: 'hack',
      hackArmor: 0.44,
      pierceArmor: 0.34,
      crushArmor: 0.25,
      bonusVsInfantry: 1.35,
      bonusVsMyth: 1.25,
      range: 1.9,
      attackCooldown: 0.9,
      speed: 5.0,
      los: 18,
      isMythic: false,
      producedAt: 'fortress',
    },
    peltast: {
      kind: 'peltast',
      name: 'Peltasta',
      role: 'Atirador leve ágil com dardos e escudo Pelta — excelente contra infantaria rápida e outros arqueiros',
      minAge: 2,
      cost: { wood: 45, gold: 30 },
      popCost: 2,
      trainTime: 5.5,
      maxHp: 110,
      attack: 12,
      damageType: 'pierce',
      hackArmor: 0.14,
      pierceArmor: 0.42,
      crushArmor: 0.12,
      bonusVsInfantry: 1.45,
      bonusVsArcher: 1.65,
      range: 9.5,
      attackCooldown: 1.05,
      speed: 5.7,
      los: 18,
      isMythic: false,
      producedAt: 'archery_range',
    },
    archer: {
      kind: 'archer',
      name: 'Toxotes',
      role: 'Arqueiro tradicional grego de longo alcance — forte contra infantaria e unidades míticas fracas',
      minAge: 2,
      cost: { wood: 55, gold: 35 },
      popCost: 2,
      trainTime: 6.2,
      maxHp: 105,
      attack: 14,
      damageType: 'pierce',
      hackArmor: 0.1,
      pierceArmor: 0.32,
      crushArmor: 0.1,
      bonusVsInfantry: 1.4,
      bonusVsMyth: 1.25,
      range: 13.5,
      attackCooldown: 1.2,
      speed: 4.9,
      los: 19,
      isMythic: false,
      producedAt: 'archery_range',
    },
    gastraphetes: {
      kind: 'gastraphetes',
      name: 'Fundibulário (Gastraphetes)',
      role: 'Arqueiro pesado com besta abdominal — desbloqueado por Deus Menor (Apolo/Ártemis), longo alcance e alto impacto',
      minAge: 3,
      cost: { wood: 70, gold: 55 },
      popCost: 2,
      trainTime: 7.0,
      maxHp: 125,
      attack: 21,
      damageType: 'pierce',
      hackArmor: 0.18,
      pierceArmor: 0.38,
      crushArmor: 0.15,
      bonusVsInfantry: 1.35,
      bonusVsBuilding: 1.3,
      bonusVsMyth: 1.2,
      requiresMinorGod: ['Apollo', 'Artemis', 'Sekhmet', 'Bragi', 'Hyperion', 'Divine_War2'],
      requiresMinorGodLabel: 'Apolo ou Ártemis',
      range: 14.5,
      attackCooldown: 1.45,
      speed: 4.5,
      los: 20,
      isMythic: false,
      producedAt: 'archery_range',
    },
    cavalry: {
      kind: 'cavalry',
      name: 'Hippikon',
      role: 'Cavalaria pesada rápida — letal contra arqueiros e cerco, com investida de atropelamento (hit-and-run)',
      minAge: 2,
      cost: { food: 80, gold: 60 },
      popCost: 3,
      trainTime: 7.2,
      maxHp: 225,
      attack: 22,
      damageType: 'hack',
      hackArmor: 0.28,
      pierceArmor: 0.38,
      crushArmor: 0.18,
      bonusVsArcher: 1.65,
      bonusVsSiege: 1.65,
      range: 2.1,
      attackCooldown: 1.05,
      speed: 7.7,
      los: 19,
      isMythic: false,
      producedAt: 'stable',
    },
    prodromos: {
      kind: 'prodromos',
      name: 'Pródromo',
      role: 'Cavalaria leve de lança longa — especialista implacável contra outras unidades de cavalaria',
      minAge: 2,
      cost: { food: 65, gold: 45 },
      popCost: 2,
      trainTime: 6.2,
      maxHp: 175,
      attack: 17,
      damageType: 'pierce',
      hackArmor: 0.22,
      pierceArmor: 0.3,
      crushArmor: 0.15,
      bonusVsCavalry: 2.1,
      range: 2.3,
      attackCooldown: 0.95,
      speed: 8.3,
      los: 20,
      isMythic: false,
      producedAt: 'stable',
    },
    jason: {
      kind: 'jason',
      name: 'Jasão',
      role: 'Herói Padrão de Zeus (Era Arcaica) — Velocino de Ouro, ótimo contra Míticas e coleta de Relíquias',
      minAge: 1,
      cost: { food: 95, gold: 85, favor: 4 },
      popCost: 2,
      trainTime: 6.5,
      maxHp: 390,
      attack: 29,
      damageType: 'hack',
      hackArmor: 0.42,
      pierceArmor: 0.42,
      crushArmor: 0.35,
      bonusVsMyth: 3.4,
      range: 2.2,
      attackCooldown: 0.95,
      speed: 5.7,
      los: 21,
      isMythic: false,
      isHero: true,
      producedAt: 'town_center',
    },
    odysseus: {
      kind: 'odysseus',
      name: 'Ulisses (Odysseus)',
      role: 'Herói Arqueiro de Ítaca — letal à distância contra Unidades Míticas (3.6x dano)',
      minAge: 2,
      cost: { wood: 100, gold: 100, favor: 5 },
      popCost: 3,
      trainTime: 7.5,
      maxHp: 340,
      attack: 26,
      damageType: 'pierce',
      hackArmor: 0.28,
      pierceArmor: 0.44,
      crushArmor: 0.25,
      bonusVsMyth: 3.6,
      range: 14.5,
      attackCooldown: 1.05,
      speed: 5.5,
      los: 23,
      isMythic: false,
      isHero: true,
      producedAt: 'town_center',
    },
    perseus: {
      kind: 'perseus',
      name: 'Perseu',
      role: 'Herói de Combate Corpo a Corpo — Foice Harpê e Escudo Espelhado de Atena',
      minAge: 3,
      cost: { food: 120, gold: 110, favor: 6 },
      popCost: 3,
      trainTime: 8.0,
      maxHp: 450,
      attack: 34,
      damageType: 'hack',
      hackArmor: 0.46,
      pierceArmor: 0.5,
      crushArmor: 0.38,
      bonusVsMyth: 3.6,
      range: 2.2,
      attackCooldown: 0.9,
      speed: 5.9,
      los: 21,
      isMythic: false,
      isHero: true,
      producedAt: 'town_center',
    },
    bellerophon: {
      kind: 'bellerophon',
      name: 'Belerofonte',
      role: 'Herói Montado em Pégaso — mobilidade aérea extrema e investida anti-mítica devastadora',
      minAge: 4,
      cost: { food: 140, gold: 130, favor: 8 },
      popCost: 3,
      trainTime: 9.0,
      maxHp: 470,
      attack: 36,
      damageType: 'hack',
      hackArmor: 0.44,
      pierceArmor: 0.48,
      crushArmor: 0.36,
      bonusVsMyth: 3.8,
      range: 2.4,
      attackCooldown: 0.9,
      speed: 8.6,
      los: 25,
      isMythic: false,
      isHero: true,
      producedAt: 'town_center',
    },
    hippolyta: {
      kind: 'hippolyta',
      name: 'Hipólita',
      role: 'Heroína Amazona Ágil — disparos rápidos à distância e alta velocidade',
      minAge: 2,
      cost: { wood: 95, gold: 90, favor: 5 },
      popCost: 2,
      trainTime: 7.0,
      maxHp: 325,
      attack: 22,
      damageType: 'pierce',
      hackArmor: 0.26,
      pierceArmor: 0.4,
      crushArmor: 0.22,
      bonusVsMyth: 3.2,
      range: 13.0,
      attackCooldown: 0.78,
      speed: 6.3,
      los: 22,
      isMythic: false,
      isHero: true,
      producedAt: 'town_center',
    },
    ajax: {
      kind: 'ajax',
      name: 'Ajax',
      role: 'Herói Bruto de Salamina — resistência titânica, Escudo Torre de 7 Camadas e Lança Dory',
      minAge: 1,
      cost: { food: 110, gold: 90, favor: 6 },
      popCost: 3,
      trainTime: 7.5,
      maxHp: 460,
      attack: 30,
      damageType: 'hack',
      hackArmor: 0.5,
      pierceArmor: 0.52,
      crushArmor: 0.45,
      bonusVsMyth: 3.5,
      range: 2.3,
      attackCooldown: 0.95,
      speed: 5.4,
      los: 20,
      isMythic: false,
      isHero: true,
      producedAt: 'town_center',
    },
    theseus: {
      kind: 'theseus',
      name: 'Teseu',
      role: 'Herói Tático de Atenas — especialista disciplinado com lança e escudo contra monstros',
      minAge: 2,
      cost: { food: 105, gold: 95, favor: 5 },
      popCost: 3,
      trainTime: 7.2,
      maxHp: 410,
      attack: 31,
      damageType: 'hack',
      hackArmor: 0.45,
      pierceArmor: 0.45,
      crushArmor: 0.36,
      bonusVsMyth: 3.3,
      bonusVsInfantry: 1.25,
      range: 2.3,
      attackCooldown: 0.92,
      speed: 5.7,
      los: 21,
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
    ram: {
      kind: 'ram',
      name: 'Aríete',
      role: 'Unidade mecânica de cerco blindada — avança sob flechas para derrubar muralhas e edifícios',
      minAge: 3,
      cost: { wood: 140, gold: 90 },
      popCost: 3,
      trainTime: 8.5,
      maxHp: 390,
      attack: 52,
      damageType: 'crush',
      hackArmor: 0.16,
      pierceArmor: 0.84,
      crushArmor: 0.3,
      bonusVsBuilding: 3.4,
      range: 2.3,
      attackCooldown: 1.9,
      speed: 3.6,
      los: 16,
      isMythic: false,
      isSiege: true,
      producedAt: 'siege_works',
    },
    siege: {
      kind: 'siege',
      name: 'Catapulta (Helepolis)',
      role: 'Máquina de cerco à distância de alta potência contra construções e exércitos agrupados (dano em área)',
      minAge: 3,
      cost: { wood: 165, gold: 130 },
      popCost: 4,
      trainTime: 10,
      maxHp: 320,
      attack: 54,
      damageType: 'crush',
      hackArmor: 0.08,
      pierceArmor: 0.76,
      crushArmor: 0.2,
      bonusVsBuilding: 2.6,
      splashRadius: 3.5,
      range: 17.0,
      attackCooldown: 2.4,
      speed: 3.3,
      los: 20,
      isMythic: false,
      isSiege: true,
      producedAt: 'siege_works',
    },
    minotaur: {
      kind: 'minotaur',
      name: 'Minotauro',
      role: 'Unidade Mítica de choque com machado Labrys (Atena / Ares)',
      minAge: 2,
      cost: { food: 140, favor: 16 },
      popCost: 3,
      trainTime: 9,
      maxHp: 435,
      attack: 37,
      damageType: 'hack',
      hackArmor: 0.42,
      pierceArmor: 0.36,
      crushArmor: 0.25,
      bonusVsBuilding: 1.4,
      requiresMinorGod: ['Athena', 'Ares', 'Aphrodite'],
      requiresMinorGodLabel: 'Atena ou Ares',
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
      role: 'Arqueiro mítico de alta velocidade (Hermes)',
      minAge: 2,
      cost: { wood: 145, favor: 20 },
      popCost: 3,
      trainTime: 9.0,
      maxHp: 315,
      attack: 29,
      damageType: 'pierce',
      hackArmor: 0.25,
      pierceArmor: 0.4,
      crushArmor: 0.2,
      requiresMinorGod: ['Hermes', 'Apollo', 'Dionysos'],
      requiresMinorGodLabel: 'Hermes',
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
      role: 'Unidade Mítica Exclusiva de Zeus — dano massivo em área e agarra/arremessa inimigos humanos longe',
      minAge: 2,
      cost: { food: 210, gold: 100, favor: 24 },
      popCost: 4,
      trainTime: 11,
      maxHp: 780,
      attack: 64,
      damageType: 'crush',
      hackArmor: 0.46,
      pierceArmor: 0.56,
      crushArmor: 0.36,
      bonusVsBuilding: 2.1,
      splashRadius: 3.0,
      range: 2.8,
      attackCooldown: 1.6,
      speed: 4.5,
      los: 20,
      isMythic: true,
      producedAt: 'temple',
    },
    manticore: {
      kind: 'manticore',
      name: 'Mantícora',
      role: 'Fera alada de Apolo/Ártemis — dispara espinhos venenosos à distância em rajadas',
      minAge: 3,
      cost: { wood: 155, favor: 22 },
      popCost: 3,
      trainTime: 9.5,
      maxHp: 380,
      attack: 34,
      damageType: 'pierce',
      hackArmor: 0.3,
      pierceArmor: 0.42,
      crushArmor: 0.22,
      splashRadius: 1.8,
      requiresMinorGod: ['Apollo', 'Artemis'],
      requiresMinorGodLabel: 'Apolo ou Ártemis',
      range: 14.5,
      attackCooldown: 1.25,
      speed: 6.4,
      los: 22,
      isMythic: true,
      producedAt: 'temple',
    },
    medusa: {
      kind: 'medusa',
      name: 'Medusa',
      role: 'Górgona de Hera/Ártemis — dispara flechas petrificantes que congelam inimigos no lugar',
      minAge: 4,
      cost: { gold: 165, favor: 26 },
      popCost: 4,
      trainTime: 10.5,
      maxHp: 460,
      attack: 42,
      damageType: 'pierce',
      hackArmor: 0.35,
      pierceArmor: 0.46,
      crushArmor: 0.25,
      requiresMinorGod: ['Hera', 'Artemis'],
      requiresMinorGodLabel: 'Hera ou Ártemis',
      range: 14.0,
      attackCooldown: 1.4,
      speed: 5.5,
      los: 22,
      isMythic: true,
      producedAt: 'temple',
    },
    hydra: {
      kind: 'hydra',
      name: 'Hidra',
      role: 'Monstro policéfalo de Dionísio — regenera vida e ganha poder e cabeças em combate',
      minAge: 3,
      cost: { food: 210, favor: 28 },
      popCost: 4,
      trainTime: 11.5,
      maxHp: 690,
      attack: 52,
      damageType: 'hack',
      hackArmor: 0.45,
      pierceArmor: 0.42,
      crushArmor: 0.35,
      bonusVsBuilding: 1.5,
      requiresMinorGod: ['Dionysos'],
      requiresMinorGodLabel: 'Dionísio',
      range: 2.6,
      attackCooldown: 1.25,
      speed: 4.8,
      los: 20,
      isMythic: true,
      producedAt: 'temple',
    },
    colossus: {
      kind: 'colossus',
      name: 'Colosso',
      role: 'Gigante de Bronze de Hefesto — armadura colossal, demolidor de edifícios e autorreparo',
      minAge: 4,
      cost: { gold: 240, favor: 32 },
      popCost: 5,
      trainTime: 13.0,
      maxHp: 1150,
      attack: 74,
      damageType: 'crush',
      hackArmor: 0.58,
      pierceArmor: 0.68,
      crushArmor: 0.45,
      bonusVsBuilding: 2.8,
      splashRadius: 2.6,
      requiresMinorGod: ['Hephaestus'],
      requiresMinorGodLabel: 'Hefesto',
      range: 2.8,
      attackCooldown: 1.7,
      speed: 3.9,
      los: 20,
      isMythic: true,
      producedAt: 'temple',
    },
    nymph: {
      kind: 'nymph',
      name: 'Ninfa (Dríade)',
      role: 'Espírito da natureza (Atena/Afrodite) — ágil, apoia aliados e ataca à média distância',
      minAge: 2,
      cost: { wood: 110, favor: 14 },
      popCost: 2,
      trainTime: 7.5,
      maxHp: 260,
      attack: 22,
      damageType: 'pierce',
      hackArmor: 0.25,
      pierceArmor: 0.35,
      crushArmor: 0.2,
      requiresMinorGod: ['Athena', 'Aphrodite'],
      requiresMinorGodLabel: 'Atena ou Afrodite',
      range: 10.5,
      attackCooldown: 1.05,
      speed: 6.2,
      los: 21,
      isMythic: true,
      producedAt: 'temple',
    },
    pegasus: {
      kind: 'pegasus',
      name: 'Pégaso',
      role: 'Corcel alado sagrado de Hermes — batedor voador veloz de visão ampliada e investida leve',
      minAge: 2,
      cost: { food: 90, favor: 12 },
      popCost: 2,
      trainTime: 7.0,
      maxHp: 290,
      attack: 18,
      damageType: 'hack',
      hackArmor: 0.22,
      pierceArmor: 0.42,
      crushArmor: 0.2,
      requiresMinorGod: ['Hermes'],
      requiresMinorGodLabel: 'Hermes',
      range: 2.0,
      attackCooldown: 1.1,
      speed: 9.2,
      los: 27,
      isMythic: true,
      producedAt: 'temple',
    },
    satyr: {
      kind: 'satyr',
      name: 'Sátiro',
      role: 'Lançador de dardos veloz (Dionísio) — letal contra infantaria e arqueiros',
      minAge: 3,
      cost: { wood: 135, favor: 18 },
      popCost: 3,
      trainTime: 8.5,
      maxHp: 310,
      attack: 28,
      damageType: 'pierce',
      hackArmor: 0.26,
      pierceArmor: 0.36,
      crushArmor: 0.2,
      bonusVsInfantry: 1.45,
      requiresMinorGod: ['Dionysos'],
      requiresMinorGodLabel: 'Dionísio',
      range: 12.5,
      attackCooldown: 1.05,
      speed: 6.8,
      los: 21,
      isMythic: true,
      producedAt: 'temple',
    },
    automaton: {
      kind: 'automaton',
      name: 'Autômato',
      role: 'Constructo de bronze forjado por Hefesto — resistente e com autorreparo contínuo',
      minAge: 4,
      cost: { gold: 135, favor: 16 },
      popCost: 3,
      trainTime: 8.5,
      maxHp: 460,
      attack: 39,
      damageType: 'hack',
      hackArmor: 0.52,
      pierceArmor: 0.48,
      crushArmor: 0.38,
      requiresMinorGod: ['Hephaestus'],
      requiresMinorGodLabel: 'Hefesto',
      range: 2.2,
      attackCooldown: 1.15,
      speed: 5.0,
      los: 19,
      isMythic: true,
      producedAt: 'temple',
    },
    iron_dwarf: {
      kind: 'iron_dwarf',
      name: 'Anão de Ferro',
      role: 'Guerreiro ferreiro blindado de Hefesto — martelo esmagador anti-edifícios e blindagem pesada',
      minAge: 4,
      cost: { food: 90, gold: 120, favor: 15 },
      popCost: 2,
      trainTime: 8.0,
      maxHp: 430,
      attack: 36,
      damageType: 'crush',
      hackArmor: 0.55,
      pierceArmor: 0.55,
      crushArmor: 0.42,
      bonusVsBuilding: 2.0,
      requiresMinorGod: ['Hephaestus'],
      requiresMinorGodLabel: 'Hefesto',
      range: 2.0,
      attackCooldown: 1.2,
      speed: 4.5,
      los: 18,
      isMythic: true,
      producedAt: 'temple',
    },
    phoenix: {
      kind: 'phoenix',
      name: 'Fênix',
      role: 'Ave imortal de fogo de Apolo — lança orbes flamejantes com dano em área',
      minAge: 3,
      cost: { gold: 160, favor: 25 },
      popCost: 4,
      trainTime: 10.5,
      maxHp: 480,
      attack: 44,
      damageType: 'crush',
      hackArmor: 0.32,
      pierceArmor: 0.45,
      crushArmor: 0.3,
      bonusVsBuilding: 1.8,
      splashRadius: 2.8,
      requiresMinorGod: ['Apollo'],
      requiresMinorGodLabel: 'Apolo',
      range: 11.5,
      attackCooldown: 1.45,
      speed: 7.4,
      los: 23,
      isMythic: true,
      producedAt: 'temple',
    },
    titan: {
      kind: 'titan',
      name: 'Titã Colossal',
      role: 'Entidade suprema invocada pelo Portão do Titã (Era V)',
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
      splashRadius: 5.0,
      range: 3.8,
      attackCooldown: 1.75,
      speed: 4.1,
      los: 24,
      isMythic: true,
      producedAt: 'titan_gate',
    },
    zeus: {
      kind: 'zeus',
      name: 'Zeus — Rei do Olimpo',
      role: 'Deus Maior (Era V) — Entidade suprema máxima dos céus; relâmpagos divinos devastadores em área',
      minAge: 5,
      cost: { food: 950, gold: 1050, favor: 95 },
      popCost: 16,
      trainTime: 20,
      maxHp: 7200,
      attack: 275,
      damageType: 'crush',
      hackArmor: 0.78,
      pierceArmor: 0.85,
      crushArmor: 0.65,
      bonusVsBuilding: 3.2,
      bonusVsMyth: 1.5,
      splashRadius: 6.5,
      range: 14.0,
      attackCooldown: 1.55,
      speed: 4.6,
      los: 32,
      isMythic: true,
      isGod: true,
      isMajorGod: true,
      producedAt: 'temple',
    },
    poseidon: {
      kind: 'poseidon',
      name: 'Poseidon — Senhor dos Mares',
      role: 'Deus Maior (Era V) — Entidade suprema dos oceanos; maremotos sísmicos com tridente em área',
      minAge: 5,
      cost: { food: 950, gold: 1050, favor: 95 },
      popCost: 16,
      trainTime: 20,
      maxHp: 7000,
      attack: 265,
      damageType: 'crush',
      hackArmor: 0.78,
      pierceArmor: 0.84,
      crushArmor: 0.64,
      bonusVsBuilding: 3.4,
      splashRadius: 6.2,
      range: 12.5,
      attackCooldown: 1.6,
      speed: 4.7,
      los: 31,
      isMythic: true,
      isGod: true,
      isMajorGod: true,
      producedAt: 'temple',
    },
    hades: {
      kind: 'hades',
      name: 'Hades — Soberano do Submundo',
      role: 'Deus Maior (Era V) — Entidade suprema do Tártaro; chamas espectrais e vórtices necróticos em área',
      minAge: 5,
      cost: { food: 950, gold: 1050, favor: 95 },
      popCost: 16,
      trainTime: 20,
      maxHp: 6900,
      attack: 260,
      damageType: 'pierce',
      hackArmor: 0.76,
      pierceArmor: 0.86,
      crushArmor: 0.62,
      bonusVsBuilding: 3.0,
      bonusVsMyth: 1.5,
      splashRadius: 6.0,
      range: 13.5,
      attackCooldown: 1.5,
      speed: 4.5,
      los: 31,
      isMythic: true,
      isGod: true,
      isMajorGod: true,
      producedAt: 'temple',
    },
    atena: {
      kind: 'atena',
      name: 'Atena — Deusa da Sabedoria',
      role: 'Deusa Menor (Era V) — Avatar maior que Titãs; lança da Égide com ondas sagradas em área',
      minAge: 5,
      cost: { food: 650, gold: 700, favor: 65 },
      popCost: 14,
      trainTime: 16,
      maxHp: 5200,
      attack: 215,
      damageType: 'hack',
      hackArmor: 0.74,
      pierceArmor: 0.82,
      crushArmor: 0.58,
      bonusVsBuilding: 2.8,
      splashRadius: 5.0,
      range: 10.5,
      attackCooldown: 1.55,
      speed: 4.5,
      los: 28,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
    ares: {
      kind: 'ares',
      name: 'Ares — Deus da Guerra',
      role: 'Deus Menor (Era V) — Avatar maior que Titãs; fúria sísmica brutal contra exércitos e fortalezas',
      minAge: 5,
      cost: { food: 680, gold: 680, favor: 65 },
      popCost: 14,
      trainTime: 16,
      maxHp: 5400,
      attack: 230,
      damageType: 'crush',
      hackArmor: 0.75,
      pierceArmor: 0.78,
      crushArmor: 0.60,
      bonusVsBuilding: 3.1,
      splashRadius: 5.2,
      range: 9.5,
      attackCooldown: 1.55,
      speed: 4.6,
      los: 27,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
    hermes: {
      kind: 'hermes',
      name: 'Hermes — Mensageiro Alado',
      role: 'Deus Menor (Era V) — Avatar veloz maior que Titãs; rajadas de relâmpago celeste em área',
      minAge: 5,
      cost: { food: 620, gold: 680, favor: 62 },
      popCost: 14,
      trainTime: 15,
      maxHp: 4800,
      attack: 205,
      damageType: 'pierce',
      hackArmor: 0.70,
      pierceArmor: 0.80,
      crushArmor: 0.55,
      bonusVsBuilding: 2.6,
      splashRadius: 4.6,
      range: 12.5,
      attackCooldown: 1.35,
      speed: 5.6,
      los: 30,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
    apolo: {
      kind: 'apolo',
      name: 'Apolo — Deus do Sol',
      role: 'Deus Menor (Era V) — Avatar solar maior que Titãs; flechas solares incendiárias de longo alcance',
      minAge: 5,
      cost: { food: 640, gold: 720, favor: 65 },
      popCost: 14,
      trainTime: 16,
      maxHp: 4900,
      attack: 210,
      damageType: 'pierce',
      hackArmor: 0.68,
      pierceArmor: 0.82,
      crushArmor: 0.55,
      bonusVsBuilding: 2.8,
      splashRadius: 4.8,
      range: 14.5,
      attackCooldown: 1.45,
      speed: 4.7,
      los: 30,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
    dionisio: {
      kind: 'dionisio',
      name: 'Dionísio — Senhor das Vinhas',
      role: 'Deus Menor (Era V) — Avatar mítico maior que Titãs; tirso arcano e fúria dionisíaca em área',
      minAge: 5,
      cost: { food: 650, gold: 690, favor: 64 },
      popCost: 14,
      trainTime: 16,
      maxHp: 5050,
      attack: 205,
      damageType: 'crush',
      hackArmor: 0.72,
      pierceArmor: 0.78,
      crushArmor: 0.56,
      bonusVsBuilding: 2.7,
      splashRadius: 5.0,
      range: 11.0,
      attackCooldown: 1.5,
      speed: 4.6,
      los: 28,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
    afrodite: {
      kind: 'afrodite',
      name: 'Afrodite — Deusa da Beleza',
      role: 'Deus Menor (Era V) — Avatar celeste maior que Titãs; ondas encantadoras de brilho divino em área',
      minAge: 5,
      cost: { food: 630, gold: 710, favor: 64 },
      popCost: 14,
      trainTime: 16,
      maxHp: 4950,
      attack: 200,
      damageType: 'pierce',
      hackArmor: 0.70,
      pierceArmor: 0.80,
      crushArmor: 0.56,
      bonusVsBuilding: 2.6,
      splashRadius: 5.0,
      range: 12.5,
      attackCooldown: 1.45,
      speed: 4.8,
      los: 29,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
    hefesto: {
      kind: 'hefesto',
      name: 'Hefesto — Deus da Forja',
      role: 'Deus Menor (Era V) — Avatar titânico maior que Titãs; martelo vulcânico demolidor de cidades',
      minAge: 5,
      cost: { food: 660, gold: 740, favor: 66 },
      popCost: 14,
      trainTime: 16.5,
      maxHp: 5500,
      attack: 225,
      damageType: 'crush',
      hackArmor: 0.76,
      pierceArmor: 0.82,
      crushArmor: 0.62,
      bonusVsBuilding: 3.4,
      splashRadius: 5.2,
      range: 10.0,
      attackCooldown: 1.65,
      speed: 4.3,
      los: 27,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
    artemis: {
      kind: 'artemis',
      name: 'Ártemis — Deusa da Caça',
      role: 'Deus Menor (Era V) — Avatar lunar maior que Titãs; flechas prateadas sísmicas de longo alcance',
      minAge: 5,
      cost: { food: 640, gold: 700, favor: 64 },
      popCost: 14,
      trainTime: 16,
      maxHp: 4900,
      attack: 215,
      damageType: 'pierce',
      hackArmor: 0.70,
      pierceArmor: 0.82,
      crushArmor: 0.55,
      bonusVsBuilding: 2.8,
      bonusVsMyth: 1.4,
      splashRadius: 4.8,
      range: 14.5,
      attackCooldown: 1.4,
      speed: 5.0,
      los: 30,
      isMythic: true,
      isGod: true,
      producedAt: 'temple',
    },
  },
  egipcios: {
    // Egyptian civilization unit roster
    ...EGYPTIAN_ROSTER_STATS,
    ...NORSE_ROSTER_STATS,
    ...ATLANTEAN_ROSTER_STATS,
    villager: { kind: 'villager', name: 'Trabalhador', role: 'Coleta recursos (comida, madeira e ouro) e constrói todos os edifícios', minAge: 1, cost: { food: 50 }, popCost: 1, trainTime: 5.5, maxHp: 75, attack: 6, damageType: 'hack', hackArmor: 0.1, pierceArmor: 0.15, crushArmor: 0.1, range: 1.6, attackCooldown: 1.3, speed: 4.8, los: 14, isMythic: false, producedAt: 'town_center' },
    hoplite: { kind: 'hoplite', name: 'Lanceiro Egípcio', role: 'Infantaria anti-cavalaria', minAge: 1, cost: { food: 55, gold: 40 }, popCost: 2, trainTime: 6.5, maxHp: 150, attack: 14, damageType: 'pierce', hackArmor: 0.3, pierceArmor: 0.3, crushArmor: 0.1, bonusVsCavalry: 1.5, range: 2.0, attackCooldown: 1.1, speed: 4.5, los: 16, isMythic: false, producedAt: 'barracks' },
    hipaspist: { kind: 'hipaspist', name: 'Espadachim do Nilo', role: 'Infantaria ágil', minAge: 2, cost: { food: 60, gold: 35 }, popCost: 2, trainTime: 6.0, maxHp: 160, attack: 15, damageType: 'hack', hackArmor: 0.35, pierceArmor: 0.2, crushArmor: 0.15, range: 1.8, attackCooldown: 1.0, speed: 4.8, los: 17, isMythic: false, producedAt: 'barracks' },
    myrmidon: { kind: 'myrmidon', name: 'Guarda Real do Faraó', role: 'Infantaria de elite da Era Mítica', minAge: 4, cost: { food: 75, gold: 65, favor: 6 }, popCost: 2, trainTime: 6.5, maxHp: 190, attack: 21, damageType: 'hack', hackArmor: 0.42, pierceArmor: 0.32, crushArmor: 0.22, range: 1.9, attackCooldown: 0.95, speed: 4.9, los: 18, isMythic: false, producedAt: 'fortress' },
    peltast: { kind: 'peltast', name: 'Fundeiro do Deserto', role: 'Atirador ágil contra infantaria e arqueiros', minAge: 2, cost: { wood: 45, gold: 30 }, popCost: 2, trainTime: 5.5, maxHp: 105, attack: 12, damageType: 'pierce', hackArmor: 0.12, pierceArmor: 0.38, crushArmor: 0.1, bonusVsInfantry: 1.35, bonusVsArcher: 1.5, range: 9.5, attackCooldown: 1.05, speed: 5.5, los: 18, isMythic: false, producedAt: 'archery_range' },
    archer: { kind: 'archer', name: 'Arqueiro do Nilo', role: 'Arqueiro de longo alcance', minAge: 2, cost: { wood: 50, gold: 35 }, popCost: 2, trainTime: 6.5, maxHp: 95, attack: 12, damageType: 'pierce', hackArmor: 0.1, pierceArmor: 0.25, crushArmor: 0.1, bonusVsInfantry: 1.35, range: 12.5, attackCooldown: 1.2, speed: 5.0, los: 18, isMythic: false, producedAt: 'archery_range' },
    gastraphetes: { kind: 'gastraphetes', name: 'Arqueiro de Biga Pesada', role: 'Atirador de precisão abençoado por Deus Menor', minAge: 3, cost: { wood: 70, gold: 55 }, popCost: 2, trainTime: 7.0, maxHp: 120, attack: 20, damageType: 'pierce', hackArmor: 0.15, pierceArmor: 0.35, crushArmor: 0.12, bonusVsInfantry: 1.3, requiresMinorGod: ['Sekhmet', 'Apollo', 'Artemis'], requiresMinorGodLabel: 'Sekhmet', range: 14.0, attackCooldown: 1.4, speed: 4.6, los: 20, isMythic: false, producedAt: 'archery_range' },
    cavalry: { kind: 'cavalry', name: 'Biga de Guerra', role: 'Cavalaria rápida contra arqueiros e cerco', minAge: 2, cost: { food: 85, gold: 55 }, popCost: 3, trainTime: 7.5, maxHp: 210, attack: 20, damageType: 'hack', hackArmor: 0.2, pierceArmor: 0.3, crushArmor: 0.15, bonusVsArcher: 1.5, bonusVsSiege: 1.5, range: 2.1, attackCooldown: 1.1, speed: 7.5, los: 18, isMythic: false, producedAt: 'stable' },
    prodromos: { kind: 'prodromos', name: 'Cavaleiro de Camelo', role: 'Cavalaria anti-cavalaria', minAge: 2, cost: { food: 70, gold: 45 }, popCost: 2, trainTime: 6.5, maxHp: 180, attack: 17, damageType: 'pierce', hackArmor: 0.2, pierceArmor: 0.3, crushArmor: 0.15, bonusVsCavalry: 2.0, range: 2.2, attackCooldown: 1.0, speed: 7.9, los: 19, isMythic: false, producedAt: 'stable' },
    ajax: { kind: 'ajax', name: 'Herói Faraó', role: 'Líder divino', minAge: 1, cost: { food: 110, gold: 90, favor: 6 }, popCost: 3, trainTime: 7.5, maxHp: 410, attack: 29, damageType: 'hack', hackArmor: 0.4, pierceArmor: 0.45, crushArmor: 0.35, bonusVsMyth: 3.0, range: 2.2, attackCooldown: 1.0, speed: 5.4, los: 20, isMythic: false, isHero: true, producedAt: 'town_center' },
    jason: { kind: 'jason', name: 'Campeão Real', role: 'Herói do deserto', minAge: 1, cost: { food: 100, gold: 85, favor: 4 }, popCost: 2, trainTime: 6.5, maxHp: 380, attack: 28, damageType: 'hack', hackArmor: 0.4, pierceArmor: 0.4, crushArmor: 0.32, bonusVsMyth: 3.2, range: 2.2, attackCooldown: 0.95, speed: 5.5, los: 20, isMythic: false, isHero: true, producedAt: 'town_center' },
    odysseus: { kind: 'odysseus', name: 'Arqueiro Real', role: 'Herói à distância', minAge: 2, cost: { wood: 100, gold: 100, favor: 5 }, popCost: 3, trainTime: 7.5, maxHp: 330, attack: 25, damageType: 'pierce', hackArmor: 0.25, pierceArmor: 0.4, crushArmor: 0.2, bonusVsMyth: 3.4, range: 14.0, attackCooldown: 1.05, speed: 5.4, los: 22, isMythic: false, isHero: true, producedAt: 'town_center' },
    perseus: { kind: 'perseus', name: 'Guardião Solar', role: 'Herói de combate corpo a corpo', minAge: 3, cost: { food: 120, gold: 110, favor: 6 }, popCost: 3, trainTime: 8.0, maxHp: 440, attack: 33, damageType: 'hack', hackArmor: 0.45, pierceArmor: 0.48, crushArmor: 0.36, bonusVsMyth: 3.5, range: 2.2, attackCooldown: 0.9, speed: 5.8, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    bellerophon: { kind: 'bellerophon', name: 'Cavaleiro Celestial', role: 'Herói montado de alta mobilidade', minAge: 4, cost: { food: 140, gold: 130, favor: 8 }, popCost: 3, trainTime: 9.0, maxHp: 460, attack: 35, damageType: 'hack', hackArmor: 0.42, pierceArmor: 0.46, crushArmor: 0.34, bonusVsMyth: 3.6, range: 2.4, attackCooldown: 0.9, speed: 8.4, los: 24, isMythic: false, isHero: true, producedAt: 'town_center' },
    hippolyta: { kind: 'hippolyta', name: 'Atiradora Real', role: 'Heroína ágil à distância', minAge: 2, cost: { wood: 95, gold: 90, favor: 5 }, popCost: 2, trainTime: 7.0, maxHp: 320, attack: 21, damageType: 'pierce', hackArmor: 0.25, pierceArmor: 0.38, crushArmor: 0.2, bonusVsMyth: 3.1, range: 12.5, attackCooldown: 0.8, speed: 6.1, los: 22, isMythic: false, isHero: true, producedAt: 'town_center' },
    theseus: { kind: 'theseus', name: 'Estrategista do Nilo', role: 'Herói tático de lança', minAge: 2, cost: { food: 105, gold: 95, favor: 5 }, popCost: 3, trainTime: 7.2, maxHp: 400, attack: 30, damageType: 'hack', hackArmor: 0.42, pierceArmor: 0.42, crushArmor: 0.34, bonusVsMyth: 3.2, range: 2.3, attackCooldown: 0.95, speed: 5.6, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    hero: { kind: 'hero', name: 'Sacerdote', role: 'Curandeiro e guerreiro', minAge: 2, cost: { food: 120, gold: 100, favor: 10 }, popCost: 3, trainTime: 8.5, maxHp: 350, attack: 26, damageType: 'pierce', hackArmor: 0.35, pierceArmor: 0.4, crushArmor: 0.3, bonusVsMyth: 3.0, range: 4.0, attackCooldown: 1.2, speed: 5.2, los: 20, isMythic: false, isHero: true, producedAt: 'fortress' },
    ram: { kind: 'ram', name: 'Torre de Aríete', role: 'Cerco blindado demolidor', minAge: 3, cost: { wood: 145, gold: 90 }, popCost: 3, trainTime: 8.5, maxHp: 380, attack: 50, damageType: 'crush', hackArmor: 0.15, pierceArmor: 0.82, crushArmor: 0.25, bonusVsBuilding: 3.2, range: 2.3, attackCooldown: 1.9, speed: 3.5, los: 16, isMythic: false, isSiege: true, producedAt: 'siege_works' },
    siege: { kind: 'siege', name: 'Catapulta Solar', role: 'Cerco pesado em área', minAge: 3, cost: { wood: 170, gold: 120 }, popCost: 4, trainTime: 10, maxHp: 320, attack: 48, damageType: 'crush', hackArmor: 0.1, pierceArmor: 0.72, crushArmor: 0.2, bonusVsBuilding: 2.5, splashRadius: 3.2, range: 15.5, attackCooldown: 2.5, speed: 3.2, los: 20, isMythic: false, isSiege: true, producedAt: 'siege_works' },
    minotaur: { kind: 'minotaur', name: 'Esfinge', role: 'Mítico ágil', minAge: 2, cost: { food: 140, favor: 16 }, popCost: 3, trainTime: 9, maxHp: 410, attack: 35, damageType: 'hack', hackArmor: 0.38, pierceArmor: 0.35, crushArmor: 0.25, range: 2.4, attackCooldown: 1.3, speed: 5.5, los: 20, isMythic: true, producedAt: 'temple' },
    centaur: { kind: 'centaur', name: 'Anúbis Mítico', role: 'Guerreiro chacal', minAge: 3, cost: { wood: 140, favor: 20 }, popCost: 3, trainTime: 9.5, maxHp: 320, attack: 30, damageType: 'hack', hackArmor: 0.3, pierceArmor: 0.35, crushArmor: 0.2, range: 2.2, attackCooldown: 1.1, speed: 7.0, los: 21, isMythic: true, producedAt: 'temple' },
    cyclops: { kind: 'cyclops', name: 'Wadjet', role: 'Serpente titânica', minAge: 4, cost: { food: 210, gold: 110, favor: 28 }, popCost: 4, trainTime: 12, maxHp: 740, attack: 64, damageType: 'pierce', hackArmor: 0.4, pierceArmor: 0.6, crushArmor: 0.3, range: 6.0, attackCooldown: 1.6, speed: 4.5, los: 22, isMythic: true, producedAt: 'temple' },
    manticore: { kind: 'manticore', name: 'Escorpião Solar', role: 'Fera mítica à distância', minAge: 3, cost: { wood: 155, favor: 22 }, popCost: 3, trainTime: 9.5, maxHp: 370, attack: 33, damageType: 'pierce', hackArmor: 0.3, pierceArmor: 0.4, crushArmor: 0.22, range: 13.5, attackCooldown: 1.3, speed: 6.0, los: 21, isMythic: true, producedAt: 'temple' },
    medusa: { kind: 'medusa', name: 'Múmia Real', role: 'Conjuração paralisante', minAge: 4, cost: { gold: 165, favor: 26 }, popCost: 4, trainTime: 10.5, maxHp: 450, attack: 40, damageType: 'pierce', hackArmor: 0.35, pierceArmor: 0.45, crushArmor: 0.25, range: 13.0, attackCooldown: 1.4, speed: 5.2, los: 21, isMythic: true, producedAt: 'temple' },
    hydra: { kind: 'hydra', name: 'Apep', role: 'Serpente regenerativa', minAge: 3, cost: { food: 210, favor: 28 }, popCost: 4, trainTime: 11.5, maxHp: 670, attack: 50, damageType: 'hack', hackArmor: 0.44, pierceArmor: 0.4, crushArmor: 0.32, range: 2.6, attackCooldown: 1.25, speed: 4.8, los: 20, isMythic: true, producedAt: 'temple' },
    colossus: { kind: 'colossus', name: 'Elefante de Guerra Mítico', role: 'Colosso blindado do Nilo', minAge: 4, cost: { gold: 240, favor: 32 }, popCost: 5, trainTime: 13.0, maxHp: 1120, attack: 72, damageType: 'crush', hackArmor: 0.56, pierceArmor: 0.65, crushArmor: 0.42, bonusVsBuilding: 2.8, range: 2.8, attackCooldown: 1.7, speed: 3.9, los: 20, isMythic: true, producedAt: 'temple' },
    nymph: { kind: 'nymph', name: 'Sacerdotisa do Oásis', role: 'Espírito protetor', minAge: 2, cost: { wood: 110, favor: 14 }, popCost: 2, trainTime: 7.5, maxHp: 250, attack: 21, damageType: 'pierce', hackArmor: 0.22, pierceArmor: 0.34, crushArmor: 0.18, range: 10.0, attackCooldown: 1.1, speed: 6.0, los: 20, isMythic: true, producedAt: 'temple' },
    pegasus: { kind: 'pegasus', name: 'Falcão de Hórus', role: 'Batedor alado', minAge: 2, cost: { food: 90, favor: 12 }, popCost: 2, trainTime: 7.0, maxHp: 280, attack: 18, damageType: 'hack', hackArmor: 0.22, pierceArmor: 0.4, crushArmor: 0.2, range: 2.0, attackCooldown: 1.1, speed: 9.0, los: 26, isMythic: true, producedAt: 'temple' },
    satyr: { kind: 'satyr', name: 'Atirador Chacal', role: 'Lançador veloz', minAge: 3, cost: { wood: 135, favor: 18 }, popCost: 3, trainTime: 8.5, maxHp: 300, attack: 27, damageType: 'pierce', hackArmor: 0.25, pierceArmor: 0.35, crushArmor: 0.2, range: 12.0, attackCooldown: 1.05, speed: 6.6, los: 21, isMythic: true, producedAt: 'temple' },
    automaton: { kind: 'automaton', name: 'Escaravelho de Ouro', role: 'Constructo autorreparador', minAge: 4, cost: { gold: 135, favor: 16 }, popCost: 3, trainTime: 8.5, maxHp: 450, attack: 38, damageType: 'hack', hackArmor: 0.5, pierceArmor: 0.45, crushArmor: 0.36, range: 2.2, attackCooldown: 1.15, speed: 4.9, los: 19, isMythic: true, producedAt: 'temple' },
    iron_dwarf: { kind: 'iron_dwarf', name: 'Guardião de Arenito', role: 'Mítico blindado de cerco', minAge: 4, cost: { food: 90, gold: 120, favor: 15 }, popCost: 2, trainTime: 8.0, maxHp: 420, attack: 35, damageType: 'crush', hackArmor: 0.52, pierceArmor: 0.52, crushArmor: 0.4, bonusVsBuilding: 1.9, range: 2.0, attackCooldown: 1.2, speed: 4.4, los: 18, isMythic: true, producedAt: 'temple' },
    phoenix: { kind: 'phoenix', name: 'Fênix de Rá', role: 'Ave solar em área', minAge: 3, cost: { gold: 160, favor: 25 }, popCost: 4, trainTime: 10.5, maxHp: 490, attack: 45, damageType: 'crush', hackArmor: 0.34, pierceArmor: 0.46, crushArmor: 0.32, bonusVsBuilding: 1.8, splashRadius: 2.8, range: 11.5, attackCooldown: 1.45, speed: 7.4, los: 23, isMythic: true, producedAt: 'temple' },
    titan: { kind: 'titan', name: 'Titã Osíris', role: 'Entidade suprema egípcia (Era V)', minAge: 5, cost: {}, popCost: 12, trainTime: 1, maxHp: 3700, attack: 160, damageType: 'crush', hackArmor: 0.6, pierceArmor: 0.7, crushArmor: 0.48, bonusVsBuilding: 2.6, splashRadius: 5.0, range: 3.8, attackCooldown: 1.75, speed: 4.1, los: 24, isMythic: true, producedAt: 'titan_gate' },
    zeus: { kind: 'zeus', name: 'Rá — Avatar Solar Supremo', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 7200, attack: 275, damageType: 'crush', hackArmor: 0.78, pierceArmor: 0.85, crushArmor: 0.65, bonusVsBuilding: 3.2, splashRadius: 6.5, range: 14.0, attackCooldown: 1.55, speed: 4.6, los: 32, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    poseidon: { kind: 'poseidon', name: 'Ísis — Soberana do Nilo', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 7000, attack: 265, damageType: 'crush', hackArmor: 0.78, pierceArmor: 0.84, crushArmor: 0.64, bonusVsBuilding: 3.4, splashRadius: 6.2, range: 12.5, attackCooldown: 1.6, speed: 4.7, los: 31, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    hades: { kind: 'hades', name: 'Set — Senhor das Tempestades', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 6900, attack: 260, damageType: 'pierce', hackArmor: 0.76, pierceArmor: 0.86, crushArmor: 0.62, bonusVsBuilding: 3.0, splashRadius: 6.0, range: 13.5, attackCooldown: 1.5, speed: 4.5, los: 31, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    atena: { kind: 'atena', name: 'Bastet — Guardiã Sagrada', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 650, gold: 700, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 5200, attack: 215, damageType: 'hack', hackArmor: 0.74, pierceArmor: 0.82, crushArmor: 0.58, bonusVsBuilding: 2.8, splashRadius: 5.0, range: 10.5, attackCooldown: 1.55, speed: 4.5, los: 28, isMythic: true, isGod: true, producedAt: 'temple' },
    ares: { kind: 'ares', name: 'Hórus — Vingador Celeste', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 680, gold: 680, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 5400, attack: 230, damageType: 'crush', hackArmor: 0.75, pierceArmor: 0.78, crushArmor: 0.60, bonusVsBuilding: 3.1, splashRadius: 5.2, range: 9.5, attackCooldown: 1.55, speed: 4.6, los: 27, isMythic: true, isGod: true, producedAt: 'temple' },
    hermes: { kind: 'hermes', name: 'Thoth — Arauto Arcano', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 620, gold: 680, favor: 62 }, popCost: 14, trainTime: 15, maxHp: 4800, attack: 205, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.80, crushArmor: 0.55, bonusVsBuilding: 2.6, splashRadius: 4.6, range: 12.5, attackCooldown: 1.35, speed: 5.6, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
    apolo: { kind: 'apolo', name: 'Khepri — Avatar Solar', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 640, gold: 720, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 4900, attack: 210, damageType: 'pierce', hackArmor: 0.68, pierceArmor: 0.82, crushArmor: 0.55, bonusVsBuilding: 2.8, splashRadius: 4.8, range: 14.5, attackCooldown: 1.45, speed: 4.7, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
    dionisio: { kind: 'dionisio', name: 'Osíris — Renascido', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 650, gold: 690, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 5050, attack: 205, damageType: 'crush', hackArmor: 0.72, pierceArmor: 0.78, crushArmor: 0.56, bonusVsBuilding: 2.7, splashRadius: 5.0, range: 11.0, attackCooldown: 1.5, speed: 4.6, los: 28, isMythic: true, isGod: true, producedAt: 'temple' },
    afrodite: { kind: 'afrodite', name: 'Hathor — Senhora do Céu', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 630, gold: 710, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 4950, attack: 200, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.80, crushArmor: 0.56, bonusVsBuilding: 2.6, splashRadius: 5.0, range: 12.5, attackCooldown: 1.45, speed: 4.8, los: 29, isMythic: true, isGod: true, producedAt: 'temple' },
    hefesto: { kind: 'hefesto', name: 'Ptá — Forjador de Mênfis', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 660, gold: 740, favor: 66 }, popCost: 14, trainTime: 16.5, maxHp: 5500, attack: 225, damageType: 'crush', hackArmor: 0.76, pierceArmor: 0.82, crushArmor: 0.62, bonusVsBuilding: 3.4, splashRadius: 5.2, range: 10.0, attackCooldown: 1.65, speed: 4.3, los: 27, isMythic: true, isGod: true, producedAt: 'temple' },
    artemis: { kind: 'artemis', name: 'Sekhmet — Leoa Solar', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 640, gold: 700, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 4900, attack: 215, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.82, crushArmor: 0.55, bonusVsBuilding: 2.8, splashRadius: 4.8, range: 14.5, attackCooldown: 1.4, speed: 5.0, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
  },
  nordicos: {
    // Norse civilization unit roster
    ...EGYPTIAN_ROSTER_STATS,
    ...NORSE_ROSTER_STATS,
    ...ATLANTEAN_ROSTER_STATS,
    villager: { kind: 'villager', name: 'Anão / Coletor Nórdico', role: 'Coleta minérios e madeira', minAge: 1, cost: { food: 50 }, popCost: 1, trainTime: 5.5, maxHp: 80, attack: 6, damageType: 'hack', hackArmor: 0.15, pierceArmor: 0.15, crushArmor: 0.1, range: 1.6, attackCooldown: 1.3, speed: 4.8, los: 14, isMythic: false, producedAt: 'town_center' },
    hoplite: { kind: 'hoplite', name: 'Ulfsark', role: 'Guerreiro berserker', minAge: 1, cost: { food: 50, gold: 35 }, popCost: 2, trainTime: 6.0, maxHp: 160, attack: 16, damageType: 'hack', hackArmor: 0.25, pierceArmor: 0.2, crushArmor: 0.15, bonusVsBuilding: 1.3, range: 1.8, attackCooldown: 1.0, speed: 4.8, los: 16, isMythic: false, producedAt: 'barracks' },
    hipaspist: { kind: 'hipaspist', name: 'Guerreiro com Machado', role: 'Infantaria com machado de arremesso', minAge: 2, cost: { food: 55, gold: 35 }, popCost: 2, trainTime: 6.0, maxHp: 155, attack: 17, damageType: 'hack', hackArmor: 0.3, pierceArmor: 0.2, crushArmor: 0.15, range: 3.5, attackCooldown: 1.1, speed: 4.7, los: 17, isMythic: false, producedAt: 'barracks' },
    myrmidon: { kind: 'myrmidon', name: 'Huskarl de Valhalla', role: 'Infantaria de elite da Era Mítica', minAge: 4, cost: { food: 75, gold: 65, favor: 6 }, popCost: 2, trainTime: 6.5, maxHp: 200, attack: 23, damageType: 'hack', hackArmor: 0.42, pierceArmor: 0.32, crushArmor: 0.24, range: 1.9, attackCooldown: 0.95, speed: 5.0, los: 18, isMythic: false, producedAt: 'fortress' },
    peltast: { kind: 'peltast', name: 'Escaramuçador Nórdico', role: 'Atirador leve de dardos contra arqueiros', minAge: 2, cost: { wood: 45, gold: 30 }, popCost: 2, trainTime: 5.5, maxHp: 112, attack: 13, damageType: 'pierce', hackArmor: 0.14, pierceArmor: 0.36, crushArmor: 0.1, bonusVsInfantry: 1.35, bonusVsArcher: 1.5, range: 9.0, attackCooldown: 1.05, speed: 5.5, los: 18, isMythic: false, producedAt: 'archery_range' },
    archer: { kind: 'archer', name: 'Arremessador', role: 'Arqueiro/machadeiro', minAge: 2, cost: { wood: 50, gold: 35 }, popCost: 2, trainTime: 6.5, maxHp: 105, attack: 14, damageType: 'pierce', hackArmor: 0.1, pierceArmor: 0.25, crushArmor: 0.1, bonusVsInfantry: 1.35, range: 11.5, attackCooldown: 1.25, speed: 4.8, los: 18, isMythic: false, producedAt: 'archery_range' },
    gastraphetes: { kind: 'gastraphetes', name: 'Caçador Rúnico', role: 'Besta pesada desbloqueada por Deus Menor', minAge: 3, cost: { wood: 70, gold: 55 }, popCost: 2, trainTime: 7.0, maxHp: 128, attack: 20, damageType: 'pierce', hackArmor: 0.18, pierceArmor: 0.35, crushArmor: 0.15, bonusVsInfantry: 1.3, requiresMinorGod: ['Bragi', 'Skadi', 'Apollo', 'Artemis'], requiresMinorGodLabel: 'Bragi ou Skadi', range: 13.5, attackCooldown: 1.4, speed: 4.6, los: 19, isMythic: false, producedAt: 'archery_range' },
    cavalry: { kind: 'cavalry', name: 'Cavaleiro Raiding', role: 'Cavalaria nórdica rápida contra arqueiros e cerco', minAge: 2, cost: { food: 75, gold: 55 }, popCost: 3, trainTime: 7.0, maxHp: 220, attack: 22, damageType: 'hack', hackArmor: 0.25, pierceArmor: 0.3, crushArmor: 0.15, bonusVsArcher: 1.55, bonusVsSiege: 1.55, range: 2.0, attackCooldown: 1.0, speed: 7.8, los: 18, isMythic: false, producedAt: 'stable' },
    prodromos: { kind: 'prodromos', name: 'Lanceiro Jarl', role: 'Cavalaria leve anti-cavalaria', minAge: 2, cost: { food: 65, gold: 45 }, popCost: 2, trainTime: 6.2, maxHp: 175, attack: 17, damageType: 'pierce', hackArmor: 0.22, pierceArmor: 0.28, crushArmor: 0.15, bonusVsCavalry: 2.0, range: 2.2, attackCooldown: 0.95, speed: 8.2, los: 19, isMythic: false, producedAt: 'stable' },
    ajax: { kind: 'ajax', name: 'Herói Jarl', role: 'Comandante nórdico de elite', minAge: 1, cost: { food: 110, gold: 90, favor: 6 }, popCost: 3, trainTime: 7.5, maxHp: 430, attack: 32, damageType: 'hack', hackArmor: 0.45, pierceArmor: 0.45, crushArmor: 0.4, bonusVsMyth: 3.5, range: 2.2, attackCooldown: 0.95, speed: 5.6, los: 20, isMythic: false, isHero: true, producedAt: 'town_center' },
    jason: { kind: 'jason', name: 'Hersir Campeão', role: 'Herói nórdico', minAge: 1, cost: { food: 100, gold: 85, favor: 4 }, popCost: 2, trainTime: 6.5, maxHp: 395, attack: 30, damageType: 'hack', hackArmor: 0.42, pierceArmor: 0.42, crushArmor: 0.35, bonusVsMyth: 3.3, range: 2.2, attackCooldown: 0.95, speed: 5.6, los: 20, isMythic: false, isHero: true, producedAt: 'town_center' },
    odysseus: { kind: 'odysseus', name: 'Caçador de Skadi', role: 'Herói arqueiro', minAge: 2, cost: { wood: 100, gold: 100, favor: 5 }, popCost: 3, trainTime: 7.5, maxHp: 340, attack: 26, damageType: 'pierce', hackArmor: 0.28, pierceArmor: 0.42, crushArmor: 0.22, bonusVsMyth: 3.4, range: 14.0, attackCooldown: 1.05, speed: 5.4, los: 22, isMythic: false, isHero: true, producedAt: 'town_center' },
    perseus: { kind: 'perseus', name: 'Espadachim Rúnico', role: 'Herói de combate', minAge: 3, cost: { food: 120, gold: 110, favor: 6 }, popCost: 3, trainTime: 8.0, maxHp: 455, attack: 35, damageType: 'hack', hackArmor: 0.46, pierceArmor: 0.48, crushArmor: 0.38, bonusVsMyth: 3.6, range: 2.2, attackCooldown: 0.9, speed: 5.8, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    bellerophon: { kind: 'bellerophon', name: 'Cavaleiro de Sleipnir', role: 'Herói montado veloz', minAge: 4, cost: { food: 140, gold: 130, favor: 8 }, popCost: 3, trainTime: 9.0, maxHp: 475, attack: 37, damageType: 'hack', hackArmor: 0.45, pierceArmor: 0.48, crushArmor: 0.36, bonusVsMyth: 3.7, range: 2.4, attackCooldown: 0.9, speed: 8.5, los: 24, isMythic: false, isHero: true, producedAt: 'town_center' },
    hippolyta: { kind: 'hippolyta', name: 'Valquíria Arqueira', role: 'Heroína ágil', minAge: 2, cost: { wood: 95, gold: 90, favor: 5 }, popCost: 2, trainTime: 7.0, maxHp: 330, attack: 22, damageType: 'pierce', hackArmor: 0.26, pierceArmor: 0.38, crushArmor: 0.22, bonusVsMyth: 3.2, range: 12.5, attackCooldown: 0.8, speed: 6.2, los: 22, isMythic: false, isHero: true, producedAt: 'town_center' },
    theseus: { kind: 'theseus', name: 'Thane de Odin', role: 'Herói tático', minAge: 2, cost: { food: 105, gold: 95, favor: 5 }, popCost: 3, trainTime: 7.2, maxHp: 415, attack: 31, damageType: 'hack', hackArmor: 0.44, pierceArmor: 0.44, crushArmor: 0.35, bonusVsMyth: 3.3, range: 2.3, attackCooldown: 0.95, speed: 5.6, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    hero: { kind: 'hero', name: 'Einherjar', role: 'Guerreiro de Valhalla', minAge: 2, cost: { food: 120, gold: 100, favor: 10 }, popCost: 3, trainTime: 8.5, maxHp: 390, attack: 29, damageType: 'hack', hackArmor: 0.4, pierceArmor: 0.4, crushArmor: 0.35, bonusVsMyth: 3.0, range: 2.1, attackCooldown: 1.0, speed: 5.3, los: 20, isMythic: false, isHero: true, producedAt: 'fortress' },
    ram: { kind: 'ram', name: 'Aríete Portátil', role: 'Aríete blindado nórdico', minAge: 3, cost: { wood: 140, gold: 90 }, popCost: 3, trainTime: 8.5, maxHp: 400, attack: 54, damageType: 'crush', hackArmor: 0.18, pierceArmor: 0.82, crushArmor: 0.28, bonusVsBuilding: 3.3, range: 2.4, attackCooldown: 1.9, speed: 3.5, los: 16, isMythic: false, isSiege: true, producedAt: 'siege_works' },
    siege: { kind: 'siege', name: 'Balista de Ferro', role: 'Máquina de cerco pesada em área', minAge: 3, cost: { wood: 155, gold: 120 }, popCost: 4, trainTime: 10, maxHp: 330, attack: 52, damageType: 'crush', hackArmor: 0.12, pierceArmor: 0.78, crushArmor: 0.24, bonusVsBuilding: 2.7, splashRadius: 3.2, range: 15.5, attackCooldown: 2.3, speed: 3.4, los: 19, isMythic: false, isSiege: true, producedAt: 'siege_works' },
    minotaur: { kind: 'minotaur', name: 'Troll das Neves', role: 'Monstro glacial', minAge: 2, cost: { food: 140, favor: 16 }, popCost: 3, trainTime: 9, maxHp: 430, attack: 37, damageType: 'crush', hackArmor: 0.42, pierceArmor: 0.35, crushArmor: 0.3, range: 2.5, attackCooldown: 1.4, speed: 5.0, los: 20, isMythic: true, producedAt: 'temple' },
    centaur: { kind: 'centaur', name: 'Valquíria', role: 'Guerreira voadora/montada', minAge: 3, cost: { wood: 140, favor: 22 }, popCost: 3, trainTime: 9.5, maxHp: 330, attack: 31, damageType: 'pierce', hackArmor: 0.3, pierceArmor: 0.45, crushArmor: 0.25, range: 12.0, attackCooldown: 1.1, speed: 8.0, los: 22, isMythic: true, producedAt: 'temple' },
    cyclops: { kind: 'cyclops', name: 'Gigante de Gelo', role: 'Colosso glacial', minAge: 4, cost: { food: 220, gold: 120, favor: 30 }, popCost: 4, trainTime: 12, maxHp: 780, attack: 68, damageType: 'crush', hackArmor: 0.48, pierceArmor: 0.55, crushArmor: 0.38, range: 3.0, attackCooldown: 1.7, speed: 4.3, los: 21, isMythic: true, producedAt: 'temple' },
    manticore: { kind: 'manticore', name: 'Lobo Fenris', role: 'Fera mítica de ataque', minAge: 3, cost: { wood: 155, favor: 22 }, popCost: 3, trainTime: 9.5, maxHp: 390, attack: 35, damageType: 'hack', hackArmor: 0.34, pierceArmor: 0.4, crushArmor: 0.24, range: 2.4, attackCooldown: 1.15, speed: 7.2, los: 22, isMythic: true, producedAt: 'temple' },
    medusa: { kind: 'medusa', name: 'Bruxa Glacial', role: 'Mítica paralisante', minAge: 4, cost: { gold: 165, favor: 26 }, popCost: 4, trainTime: 10.5, maxHp: 460, attack: 42, damageType: 'pierce', hackArmor: 0.35, pierceArmor: 0.45, crushArmor: 0.25, range: 13.5, attackCooldown: 1.4, speed: 5.4, los: 21, isMythic: true, producedAt: 'temple' },
    hydra: { kind: 'hydra', name: 'Serpente Jörmungandr', role: 'Fera regenerativa', minAge: 3, cost: { food: 210, favor: 28 }, popCost: 4, trainTime: 11.5, maxHp: 700, attack: 54, damageType: 'hack', hackArmor: 0.46, pierceArmor: 0.42, crushArmor: 0.34, range: 2.6, attackCooldown: 1.25, speed: 4.8, los: 20, isMythic: true, producedAt: 'temple' },
    colossus: { kind: 'colossus', name: 'Gigante da Montanha', role: 'Demolidor gigante', minAge: 4, cost: { gold: 240, favor: 32 }, popCost: 5, trainTime: 13.0, maxHp: 1160, attack: 75, damageType: 'crush', hackArmor: 0.58, pierceArmor: 0.66, crushArmor: 0.45, bonusVsBuilding: 2.8, range: 2.8, attackCooldown: 1.7, speed: 3.9, los: 20, isMythic: true, producedAt: 'temple' },
    nymph: { kind: 'nymph', name: 'Elfa de Alfheim', role: 'Espírito da floresta', minAge: 2, cost: { wood: 110, favor: 14 }, popCost: 2, trainTime: 7.5, maxHp: 260, attack: 22, damageType: 'pierce', hackArmor: 0.24, pierceArmor: 0.34, crushArmor: 0.2, range: 10.0, attackCooldown: 1.05, speed: 6.1, los: 21, isMythic: true, producedAt: 'temple' },
    pegasus: { kind: 'pegasus', name: 'Corvo de Odin', role: 'Batedor alado veloz', minAge: 2, cost: { food: 90, favor: 12 }, popCost: 2, trainTime: 7.0, maxHp: 290, attack: 18, damageType: 'hack', hackArmor: 0.22, pierceArmor: 0.42, crushArmor: 0.2, range: 2.0, attackCooldown: 1.1, speed: 9.2, los: 27, isMythic: true, producedAt: 'temple' },
    satyr: { kind: 'satyr', name: 'Javali de Batalha', role: 'Investida ágil', minAge: 3, cost: { wood: 135, favor: 18 }, popCost: 3, trainTime: 8.5, maxHp: 330, attack: 30, damageType: 'hack', hackArmor: 0.32, pierceArmor: 0.36, crushArmor: 0.24, range: 2.4, attackCooldown: 1.05, speed: 6.9, los: 21, isMythic: true, producedAt: 'temple' },
    automaton: { kind: 'automaton', name: 'Constructo Rúnico', role: 'Autômato forjado', minAge: 4, cost: { gold: 135, favor: 16 }, popCost: 3, trainTime: 8.5, maxHp: 465, attack: 39, damageType: 'hack', hackArmor: 0.52, pierceArmor: 0.48, crushArmor: 0.38, range: 2.2, attackCooldown: 1.15, speed: 4.9, los: 19, isMythic: true, producedAt: 'temple' },
    iron_dwarf: { kind: 'iron_dwarf', name: 'Anão Forjador', role: 'Guerreiro anão blindado', minAge: 4, cost: { food: 90, gold: 120, favor: 15 }, popCost: 2, trainTime: 8.0, maxHp: 440, attack: 37, damageType: 'crush', hackArmor: 0.56, pierceArmor: 0.56, crushArmor: 0.44, bonusVsBuilding: 2.0, range: 2.0, attackCooldown: 1.2, speed: 4.5, los: 18, isMythic: true, producedAt: 'temple' },
    phoenix: { kind: 'phoenix', name: 'Dragão Nidhogg', role: 'Fera ígnea em área', minAge: 3, cost: { gold: 160, favor: 25 }, popCost: 4, trainTime: 10.5, maxHp: 500, attack: 46, damageType: 'crush', hackArmor: 0.34, pierceArmor: 0.46, crushArmor: 0.32, bonusVsBuilding: 1.8, splashRadius: 2.8, range: 11.5, attackCooldown: 1.45, speed: 7.4, los: 23, isMythic: true, producedAt: 'temple' },
    titan: { kind: 'titan', name: 'Titã Ymir', role: 'Entidade suprema nórdica (Era V)', minAge: 5, cost: {}, popCost: 12, trainTime: 1, maxHp: 3900, attack: 170, damageType: 'crush', hackArmor: 0.68, pierceArmor: 0.75, crushArmor: 0.52, bonusVsBuilding: 2.6, splashRadius: 5.0, range: 3.8, attackCooldown: 1.75, speed: 4.1, los: 24, isMythic: true, producedAt: 'titan_gate' },
    zeus: { kind: 'zeus', name: 'Thor — Avatar do Trovão', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 7200, attack: 275, damageType: 'crush', hackArmor: 0.78, pierceArmor: 0.85, crushArmor: 0.65, bonusVsBuilding: 3.2, splashRadius: 6.5, range: 14.0, attackCooldown: 1.55, speed: 4.6, los: 32, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    poseidon: { kind: 'poseidon', name: 'Odin — Pai de Todos', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 7000, attack: 265, damageType: 'crush', hackArmor: 0.78, pierceArmor: 0.84, crushArmor: 0.64, bonusVsBuilding: 3.4, splashRadius: 6.2, range: 12.5, attackCooldown: 1.6, speed: 4.7, los: 31, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    hades: { kind: 'hades', name: 'Loki — Senhor das Chamas', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 6900, attack: 260, damageType: 'pierce', hackArmor: 0.76, pierceArmor: 0.86, crushArmor: 0.62, bonusVsBuilding: 3.0, splashRadius: 6.0, range: 13.5, attackCooldown: 1.5, speed: 4.5, los: 31, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    atena: { kind: 'atena', name: 'Freyja — Senhora de Folkvangr', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 650, gold: 700, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 5200, attack: 215, damageType: 'hack', hackArmor: 0.74, pierceArmor: 0.82, crushArmor: 0.58, bonusVsBuilding: 2.8, splashRadius: 5.0, range: 10.5, attackCooldown: 1.55, speed: 4.5, los: 28, isMythic: true, isGod: true, producedAt: 'temple' },
    ares: { kind: 'ares', name: 'Tyr — Deus da Batalha', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 680, gold: 680, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 5400, attack: 230, damageType: 'crush', hackArmor: 0.75, pierceArmor: 0.78, crushArmor: 0.60, bonusVsBuilding: 3.1, splashRadius: 5.2, range: 9.5, attackCooldown: 1.55, speed: 4.6, los: 27, isMythic: true, isGod: true, producedAt: 'temple' },
    hermes: { kind: 'hermes', name: 'Heimdall — Vigia de Bifrost', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 620, gold: 680, favor: 62 }, popCost: 14, trainTime: 15, maxHp: 4800, attack: 205, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.80, crushArmor: 0.55, bonusVsBuilding: 2.6, splashRadius: 4.6, range: 12.5, attackCooldown: 1.35, speed: 5.6, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
    apolo: { kind: 'apolo', name: 'Baldr — Luz de Asgard', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 640, gold: 720, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 4900, attack: 210, damageType: 'pierce', hackArmor: 0.68, pierceArmor: 0.82, crushArmor: 0.55, bonusVsBuilding: 2.8, splashRadius: 4.8, range: 14.5, attackCooldown: 1.45, speed: 4.7, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
    dionisio: { kind: 'dionisio', name: 'Njord — Senhor dos Fiordes', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 650, gold: 690, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 5050, attack: 205, damageType: 'crush', hackArmor: 0.72, pierceArmor: 0.78, crushArmor: 0.56, bonusVsBuilding: 2.7, splashRadius: 5.0, range: 11.0, attackCooldown: 1.5, speed: 4.6, los: 28, isMythic: true, isGod: true, producedAt: 'temple' },
    afrodite: { kind: 'afrodite', name: 'Forseti — Luz da Justiça', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 630, gold: 710, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 4950, attack: 200, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.80, crushArmor: 0.56, bonusVsBuilding: 2.6, splashRadius: 5.0, range: 12.5, attackCooldown: 1.45, speed: 4.8, los: 29, isMythic: true, isGod: true, producedAt: 'temple' },
    hefesto: { kind: 'hefesto', name: 'Bragi — Forjador de Runas', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 660, gold: 740, favor: 66 }, popCost: 14, trainTime: 16.5, maxHp: 5500, attack: 225, damageType: 'crush', hackArmor: 0.76, pierceArmor: 0.82, crushArmor: 0.62, bonusVsBuilding: 3.4, splashRadius: 5.2, range: 10.0, attackCooldown: 1.65, speed: 4.3, los: 27, isMythic: true, isGod: true, producedAt: 'temple' },
    artemis: { kind: 'artemis', name: 'Skadi — Caçadora Glacial', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 640, gold: 700, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 4900, attack: 215, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.82, crushArmor: 0.55, bonusVsBuilding: 2.8, splashRadius: 4.8, range: 14.5, attackCooldown: 1.4, speed: 5.0, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
  },
  atlantes: {
    // Atlantean civilization unit roster
    ...EGYPTIAN_ROSTER_STATS,
    ...NORSE_ROSTER_STATS,
    ...ATLANTEAN_ROSTER_STATS,
    villager: { ...ATLANTEAN_ROSTER_STATS.citizen, kind: 'villager', name: 'Cidadão Atlante', producedAt: 'town_center' },
    hoplite: { ...ATLANTEAN_ROSTER_STATS.murmillo, kind: 'hoplite', name: 'Murmillo' },
    hipaspist: { ...ATLANTEAN_ROSTER_STATS.katapeltes, kind: 'hipaspist', name: 'Katapeltes' },
    myrmidon: { ...ATLANTEAN_ROSTER_STATS.fanatic, kind: 'myrmidon', name: 'Fanático' },
    peltast: { ...ATLANTEAN_ROSTER_STATS.turma, kind: 'peltast', name: 'Turma' },
    archer: { ...ATLANTEAN_ROSTER_STATS.arcus, kind: 'archer', name: 'Arcus' },
    gastraphetes: { ...ATLANTEAN_ROSTER_STATS.cheiroballista, kind: 'gastraphetes', name: 'Cheiroballista' },
    cavalry: { ...ATLANTEAN_ROSTER_STATS.contarius, kind: 'cavalry', name: 'Contarius' },
    prodromos: { ...ATLANTEAN_ROSTER_STATS.turma, kind: 'prodromos', name: 'Turma' },
    ajax: { kind: 'ajax', name: 'Herói Atlante', role: 'Herói com poderes cósmicos', minAge: 1, cost: { food: 115, gold: 95, favor: 6 }, popCost: 3, trainTime: 7.5, maxHp: 440, attack: 33, damageType: 'hack', hackArmor: 0.48, pierceArmor: 0.5, crushArmor: 0.42, bonusVsMyth: 3.5, range: 2.3, attackCooldown: 0.9, speed: 5.7, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    jason: { kind: 'jason', name: 'Paladino de Oricalco', role: 'Herói atlante', minAge: 1, cost: { food: 105, gold: 90, favor: 4 }, popCost: 2, trainTime: 6.5, maxHp: 400, attack: 30, damageType: 'hack', hackArmor: 0.44, pierceArmor: 0.44, crushArmor: 0.36, bonusVsMyth: 3.3, range: 2.2, attackCooldown: 0.95, speed: 5.7, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    odysseus: { kind: 'odysseus', name: 'Arcus Heroico', role: 'Herói arqueiro', minAge: 2, cost: { wood: 105, gold: 105, favor: 5 }, popCost: 3, trainTime: 7.5, maxHp: 350, attack: 27, damageType: 'pierce', hackArmor: 0.3, pierceArmor: 0.45, crushArmor: 0.25, bonusVsMyth: 3.5, range: 14.5, attackCooldown: 1.05, speed: 5.5, los: 23, isMythic: false, isHero: true, producedAt: 'town_center' },
    perseus: { kind: 'perseus', name: 'Destruidor Real', role: 'Herói de combate', minAge: 3, cost: { food: 125, gold: 115, favor: 6 }, popCost: 3, trainTime: 8.0, maxHp: 460, attack: 35, damageType: 'hack', hackArmor: 0.48, pierceArmor: 0.5, crushArmor: 0.4, bonusVsMyth: 3.6, range: 2.2, attackCooldown: 0.9, speed: 5.9, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    bellerophon: { kind: 'bellerophon', name: 'Contarius Alado', role: 'Herói montado de impacto', minAge: 4, cost: { food: 145, gold: 135, favor: 8 }, popCost: 3, trainTime: 9.0, maxHp: 485, attack: 38, damageType: 'hack', hackArmor: 0.46, pierceArmor: 0.5, crushArmor: 0.38, bonusVsMyth: 3.8, range: 2.4, attackCooldown: 0.9, speed: 8.6, los: 25, isMythic: false, isHero: true, producedAt: 'town_center' },
    hippolyta: { kind: 'hippolyta', name: 'Sentinela de Teia', role: 'Heroína ágil à distância', minAge: 2, cost: { wood: 100, gold: 95, favor: 5 }, popCost: 2, trainTime: 7.0, maxHp: 335, attack: 23, damageType: 'pierce', hackArmor: 0.28, pierceArmor: 0.4, crushArmor: 0.24, bonusVsMyth: 3.2, range: 13.0, attackCooldown: 0.8, speed: 6.3, los: 22, isMythic: false, isHero: true, producedAt: 'town_center' },
    theseus: { kind: 'theseus', name: 'Murmillo Supremo', role: 'Herói tático atlante', minAge: 2, cost: { food: 110, gold: 100, favor: 5 }, popCost: 3, trainTime: 7.2, maxHp: 420, attack: 32, damageType: 'hack', hackArmor: 0.45, pierceArmor: 0.45, crushArmor: 0.36, bonusVsMyth: 3.3, range: 2.3, attackCooldown: 0.95, speed: 5.7, los: 21, isMythic: false, isHero: true, producedAt: 'town_center' },
    hero: { kind: 'hero', name: 'Oráculo Herói', role: 'Herói vidente e combatente', minAge: 2, cost: { food: 125, gold: 105, favor: 10 }, popCost: 3, trainTime: 8.5, maxHp: 370, attack: 28, damageType: 'pierce', hackArmor: 0.4, pierceArmor: 0.45, crushArmor: 0.35, bonusVsMyth: 3.0, range: 14.0, attackCooldown: 1.1, speed: 5.4, los: 24, isMythic: false, isHero: true, producedAt: 'fortress' },
    ram: { ...ATLANTEAN_ROSTER_STATS.fire_siphon, kind: 'ram', name: 'Sifão de Fogo', producedAt: 'siege_works' },
    siege: { ...ATLANTEAN_ROSTER_STATS.onager, kind: 'siege', name: 'Onagro Atlante', producedAt: 'siege_works' },
    minotaur: { ...ATLANTEAN_ROSTER_STATS.promethean, kind: 'minotaur' },
    centaur: { kind: 'centaur', name: 'Sátiro', role: 'Lançador de lanças ágil', minAge: 3, cost: { wood: 140, favor: 20 }, popCost: 3, trainTime: 9.0, maxHp: 330, attack: 32, damageType: 'pierce', hackArmor: 0.25, pierceArmor: 0.35, crushArmor: 0.2, range: 13.0, attackCooldown: 1.05, speed: 7.2, los: 21, isMythic: true, producedAt: 'temple' },
    cyclops: { ...ATLANTEAN_ROSTER_STATS.behemoth, kind: 'cyclops' },
    manticore: { ...ATLANTEAN_ROSTER_STATS.stymphalian_bird, kind: 'manticore' },
    medusa: { ...ATLANTEAN_ROSTER_STATS.lampades, kind: 'medusa' },
    hydra: { ...ATLANTEAN_ROSTER_STATS.argus, kind: 'hydra' },
    colossus: { ...ATLANTEAN_ROSTER_STATS.hekagigantes, kind: 'colossus' },
    nymph: { ...ATLANTEAN_ROSTER_STATS.dryad, kind: 'nymph' },
    pegasus: { ...ATLANTEAN_ROSTER_STATS.caladria, kind: 'pegasus' },
    satyr: {
      kind: 'satyr',
      name: 'Sátiro',
      role: 'Templo (Heroica — Hipérion) — atirador de lanças múltiplas eficaz contra infantaria',
      minAge: 3,
      cost: { wood: 140, favor: 18 },
      popCost: 3,
      trainTime: 8.5,
      maxHp: 350,
      attack: 32,
      damageType: 'pierce',
      hackArmor: 0.28,
      pierceArmor: 0.38,
      crushArmor: 0.22,
      bonusVsInfantry: 1.55,
      requiresMinorGod: ['Hyperion'],
      requiresMinorGodLabel: 'Hipérion',
      range: 13.0,
      attackCooldown: 1.0,
      speed: 7.0,
      los: 22,
      isMythic: true,
      producedAt: 'temple',
    },
    automaton: {
      kind: 'automaton',
      name: 'Autômato',
      role: 'Templo (Clássica — Leto) — guerreiro mecânico de bronze que se autorrepara e repara outros Autômatos caídos',
      minAge: 2,
      cost: { gold: 120, favor: 14 },
      popCost: 3,
      trainTime: 8.0,
      maxHp: 420,
      attack: 35,
      damageType: 'hack',
      hackArmor: 0.52,
      pierceArmor: 0.48,
      crushArmor: 0.38,
      requiresMinorGod: ['Leto'],
      requiresMinorGodLabel: 'Leto',
      range: 2.2,
      attackCooldown: 1.15,
      speed: 5.0,
      los: 19,
      isMythic: true,
      producedAt: 'temple',
    },
    iron_dwarf: { kind: 'iron_dwarf', name: 'Prometeano de Ferro', role: 'Constructo blindado', minAge: 4, cost: { food: 90, gold: 120, favor: 15 }, popCost: 2, trainTime: 8.0, maxHp: 440, attack: 37, damageType: 'crush', hackArmor: 0.56, pierceArmor: 0.56, crushArmor: 0.44, bonusVsBuilding: 2.0, range: 2.0, attackCooldown: 1.2, speed: 4.5, los: 18, isMythic: true, producedAt: 'temple' },
    phoenix: { kind: 'phoenix', name: 'Fênix Solar', role: 'Ave ígnea em área', minAge: 3, cost: { gold: 160, favor: 25 }, popCost: 4, trainTime: 10.5, maxHp: 495, attack: 45, damageType: 'crush', hackArmor: 0.34, pierceArmor: 0.46, crushArmor: 0.32, bonusVsBuilding: 1.8, splashRadius: 2.8, range: 11.5, attackCooldown: 1.45, speed: 7.4, los: 23, isMythic: true, producedAt: 'temple' },
    titan: { kind: 'titan', name: 'Titã Atlante', role: 'Entidade colossal invocada pelo Portão do Titã na Era Mítica', minAge: 5, cost: {}, popCost: 12, trainTime: 1, maxHp: 4000, attack: 180, damageType: 'crush', hackArmor: 0.7, pierceArmor: 0.78, crushArmor: 0.55, bonusVsBuilding: 2.8, splashRadius: 5.0, range: 4.0, attackCooldown: 1.7, speed: 4.2, los: 25, isMythic: true, producedAt: 'titan_gate' },
    zeus: { kind: 'zeus', name: 'Urano — Soberano Celeste', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 7200, attack: 275, damageType: 'crush', hackArmor: 0.78, pierceArmor: 0.85, crushArmor: 0.65, bonusVsBuilding: 3.2, splashRadius: 6.5, range: 14.0, attackCooldown: 1.55, speed: 4.6, los: 32, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    poseidon: { kind: 'poseidon', name: 'Gaia — Mãe Primordial', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 7000, attack: 265, damageType: 'crush', hackArmor: 0.78, pierceArmor: 0.84, crushArmor: 0.64, bonusVsBuilding: 3.4, splashRadius: 6.2, range: 12.5, attackCooldown: 1.6, speed: 4.7, los: 31, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    hades: { kind: 'hades', name: 'Cronos — Senhor do Tempo', role: 'Deus Maior (Era V)', minAge: 5, cost: { food: 950, gold: 1050, favor: 95 }, popCost: 16, trainTime: 20, maxHp: 6900, attack: 260, damageType: 'pierce', hackArmor: 0.76, pierceArmor: 0.86, crushArmor: 0.62, bonusVsBuilding: 3.0, splashRadius: 6.0, range: 13.5, attackCooldown: 1.5, speed: 4.5, los: 31, isMythic: true, isGod: true, isMajorGod: true, producedAt: 'temple' },
    atena: { kind: 'atena', name: 'Teia — Deusa da Luz', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 650, gold: 700, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 5200, attack: 215, damageType: 'hack', hackArmor: 0.74, pierceArmor: 0.82, crushArmor: 0.58, bonusVsBuilding: 2.8, splashRadius: 5.0, range: 10.5, attackCooldown: 1.55, speed: 4.5, los: 28, isMythic: true, isGod: true, producedAt: 'temple' },
    ares: { kind: 'ares', name: 'Atlas — Portador do Mundo', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 680, gold: 680, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 5400, attack: 230, damageType: 'crush', hackArmor: 0.75, pierceArmor: 0.78, crushArmor: 0.60, bonusVsBuilding: 3.1, splashRadius: 5.2, range: 9.5, attackCooldown: 1.55, speed: 4.6, los: 27, isMythic: true, isGod: true, producedAt: 'temple' },
    hermes: { kind: 'hermes', name: 'Prometeu — Portador do Fogo', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 620, gold: 680, favor: 62 }, popCost: 14, trainTime: 15, maxHp: 4800, attack: 205, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.80, crushArmor: 0.55, bonusVsBuilding: 2.6, splashRadius: 4.6, range: 12.5, attackCooldown: 1.35, speed: 5.6, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
    apolo: { kind: 'apolo', name: 'Hélios — Titã do Sol', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 640, gold: 720, favor: 65 }, popCost: 14, trainTime: 16, maxHp: 4900, attack: 210, damageType: 'pierce', hackArmor: 0.68, pierceArmor: 0.82, crushArmor: 0.55, bonusVsBuilding: 2.8, splashRadius: 4.8, range: 14.5, attackCooldown: 1.45, speed: 4.7, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
    dionisio: { kind: 'dionisio', name: 'Oceano — Titã das Correntes', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 650, gold: 690, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 5050, attack: 205, damageType: 'crush', hackArmor: 0.72, pierceArmor: 0.78, crushArmor: 0.56, bonusVsBuilding: 2.7, splashRadius: 5.0, range: 11.0, attackCooldown: 1.5, speed: 4.6, los: 28, isMythic: true, isGod: true, producedAt: 'temple' },
    afrodite: { kind: 'afrodite', name: 'Réia — Mãe dos Deuses', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 630, gold: 710, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 4950, attack: 200, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.80, crushArmor: 0.56, bonusVsBuilding: 2.6, splashRadius: 5.0, range: 12.5, attackCooldown: 1.45, speed: 4.8, los: 29, isMythic: true, isGod: true, producedAt: 'temple' },
    hefesto: { kind: 'hefesto', name: 'Hipérion — Titã da Vigília', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 660, gold: 740, favor: 66 }, popCost: 14, trainTime: 16.5, maxHp: 5500, attack: 225, damageType: 'crush', hackArmor: 0.76, pierceArmor: 0.82, crushArmor: 0.62, bonusVsBuilding: 3.4, splashRadius: 5.2, range: 10.0, attackCooldown: 1.65, speed: 4.3, los: 27, isMythic: true, isGod: true, producedAt: 'temple' },
    artemis: { kind: 'artemis', name: 'Hécate — Senhora das Sombras', role: 'Deus Menor (Era V)', minAge: 5, cost: { food: 640, gold: 700, favor: 64 }, popCost: 14, trainTime: 16, maxHp: 4900, attack: 215, damageType: 'pierce', hackArmor: 0.70, pierceArmor: 0.82, crushArmor: 0.55, bonusVsBuilding: 2.8, splashRadius: 4.8, range: 14.5, attackCooldown: 1.4, speed: 5.0, los: 30, isMythic: true, isGod: true, producedAt: 'temple' },
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
    radius: 1.15,
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
    role: 'Treina infantaria (Hoplita, Hipaspista e Mirmidão)',
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
  archery_range: {
    kind: 'archery_range',
    name: 'Campo de Tiro',
    role: 'Treina Peltasta, Toxota e Fundibulário (Gastraphetes)',
    minAge: 2,
    cost: { wood: 120, gold: 45 },
    buildTime: 8.5,
    maxHp: 820,
    radius: 2.6,
    popBonus: 0,
    hackArmor: 0.22,
    pierceArmor: 0.78,
    crushArmor: 0.1,
  },
  stable: {
    kind: 'stable',
    name: 'Estábulo',
    role: 'Treina Cavalaria Pesada (Hippikon) e Leve (Pródromo)',
    minAge: 2,
    cost: { wood: 135, gold: 50 },
    buildTime: 8.5,
    maxHp: 880,
    radius: 2.8,
    popBonus: 0,
    hackArmor: 0.24,
    pierceArmor: 0.78,
    crushArmor: 0.1,
  },
  siege_works: {
    kind: 'siege_works',
    name: 'Oficina de Cerco',
    role: 'Constrói máquinas de cerco (Aríete e Catapulta Helepolis)',
    minAge: 3,
    cost: { wood: 170, gold: 120 },
    buildTime: 11,
    maxHp: 1150,
    radius: 2.9,
    popBonus: 0,
    hackArmor: 0.28,
    pierceArmor: 0.82,
    crushArmor: 0.12,
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

export type FaunaKind =
  | 'gazelle'
  | 'deer'
  | 'boar'
  | 'aurochs'
  | 'wolf'
  | 'reindeer'
  | 'musk_ox'
  | 'camel'
  | 'lion'
  | 'crocodile'
  | 'goat'
  | 'hippo'
  | 'elephant_wild'
  | 'bear';

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
  reindeer: {
    kind: 'reindeer',
    name: 'Rena Ártica',
    role: 'Rebanho da tundra nevada — caça rápida abundante em Alimento',
    maxHp: 50,
    foodAmount: 215,
    attack: 0,
    speed: 4.5,
    radius: 0.52,
    retaliates: false,
  },
  musk_ox: {
    kind: 'musk_ox',
    name: 'Boi-Almiscarado',
    role: 'Bovino lanudo das terras gélidas — defende o rebanho',
    maxHp: 140,
    foodAmount: 350,
    attack: 11,
    speed: 3.4,
    radius: 0.72,
    retaliates: true,
  },
  camel: {
    kind: 'camel',
    name: 'Camelo Selvagem',
    role: 'Fauna resistente do deserto e oásis — boa reserva de Alimento',
    maxHp: 75,
    foodAmount: 240,
    attack: 0,
    speed: 4.0,
    radius: 0.62,
    retaliates: false,
  },
  lion: {
    kind: 'lion',
    name: 'Leão da Savana',
    role: 'Predador territorial feroz das planícies e cânions',
    maxHp: 90,
    foodAmount: 165,
    attack: 12,
    speed: 4.7,
    radius: 0.54,
    retaliates: true,
  },
  crocodile: {
    kind: 'crocodile',
    name: 'Crocodilo do Nilo',
    role: 'Predador anfíbio de rios, lagos e pântanos',
    maxHp: 95,
    foodAmount: 185,
    attack: 11,
    speed: 3.8,
    radius: 0.62,
    retaliates: true,
  },
  goat: {
    kind: 'goat',
    name: 'Cabra Montesa',
    role: 'Animal dócil das encostas e ilhas — abate seguro para Alimento',
    maxHp: 38,
    foodAmount: 150,
    attack: 0,
    speed: 3.6,
    radius: 0.42,
    retaliates: false,
  },
  hippo: {
    kind: 'hippo',
    name: 'Hipopótamo',
    role: 'Besta pesada de rios e brejos — rende muito Alimento',
    maxHp: 155,
    foodAmount: 365,
    attack: 13,
    speed: 3.2,
    radius: 0.78,
    retaliates: true,
  },
  elephant_wild: {
    kind: 'elephant_wild',
    name: 'Elefante Selvagem',
    role: 'Colosso da savana — maior fonte de Alimento entre toda a fauna',
    maxHp: 230,
    foodAmount: 480,
    attack: 16,
    speed: 3.1,
    radius: 0.94,
    retaliates: true,
  },
  bear: {
    kind: 'bear',
    name: 'Urso Selvagem',
    role: 'Urso forte das florestas frias e montanhas — revida ataques',
    maxHp: 135,
    foodAmount: 250,
    attack: 13,
    speed: 3.8,
    radius: 0.66,
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
  unitKind?: UnitKind;
  faunaKind?: FaunaKind;
  isHero?: boolean;
  isMythic?: boolean;
  isGod?: boolean;
  isMajorGod?: boolean;
  kindLabel: string;
  roleLabel: string;
  team: TeamId | 'neutral';
  hp: number;
  maxHp: number;
  attack?: number;
  hackArmorPct?: number;
  pierceArmorPct?: number;
  crushArmorPct?: number;
  speed?: number;
  range?: number;
  popCost?: number;
  armorLabel?: string;
  taskLabel?: string;
  resourceType?: ResourceType;
  resourceAmount?: number;
  resourceMaxAmount?: number;
  isCarcass?: boolean;
  screenPos?: { x: number; y: number };
  buildingId?: string;
  buildingKind?: BuildingKind;
  townCenterTier?: AgeLevel;
  settlementId?: string;
  isConstructed?: boolean;
  buildProgress?: number;
  trainingQueue?: { kind: UnitKind; progress: number; total: number }[];
  repeatTraining?: boolean;
  rallyPoint?: { x: number; z: number } | null;
  hasVillagerSelected: boolean;
  canPromoteToHero?: boolean;
  heroPromoteCount?: number;
  heroPromoteCost?: ResourceCost;
  selectedCounts?: { kind: UnitKind; name: string; count: number }[];
  voiceLine?: UnitVoiceLineInfo;
}

export interface TeamScoreBreakdown {
  total: number;
  economy: number;
  military: number;
  technology: number;
  society: number;
}

export interface GameHudSnapshot {
  phase: 'title' | 'playing' | 'paused' | 'victory' | 'defeat';
  pantheon: PantheonId;
  majorGodName: string;
  enemyPantheon: PantheonId;
  enemyMajorGodName: string;
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
  activeGodKinds?: UnitKind[];
  queuedGodKinds?: UnitKind[];
  relicsHeld: number;
  marketRates: { food: number; wood: number; gold: number };
  enemyAge: AgeLevel;
  playerScore: number;
  enemyScore: number;
  playerScoreBreakdown: TeamScoreBreakdown;
  enemyScoreBreakdown: TeamScoreBreakdown;
  population: number;
  populationCap: number;
  playerTownCenterCount: number;
  maxTownCenters: number;
  idleVillagerCount: number;
  idleMilitaryCount: number;
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
  kothState?: {
    owner: TeamId | 'neutral';
    playerHold: number;
    enemyHold: number;
    targetHold: number;
  };
  mapRuleTag?: string;
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
    buildingMultiplier: 1.15, // Proporção autêntica AoM: The Titans (Casa ~3.0u, Árvore 5.7u, TC ~8.4u, Soldados ~1.75u)
    unitMultiplier: 0.95,     // Soldados ~1.75u mantendo Deuses & Titãs em escala colosal fixa
    faunaMultiplier: 0.95,    // Fauna silvestre proporcional às tropas e árvores
    resourceMultiplier: 1.0,  // Árvores (~5.7u > Casas) e minas de ouro em proporção clássica
    settlementMultiplier: 1.15,
  },
  monumental: {
    profile: 'monumental',
    buildingMultiplier: 1.35, // Edificações monumentais estilo AoM
    unitMultiplier: 0.92,
    faunaMultiplier: 0.95,
    resourceMultiplier: 1.10,
    settlementMultiplier: 1.35,
  },
  realistic: {
    profile: 'realistic',
    buildingMultiplier: 1.55, // Edifícios em escala épica de cidadela
    unitMultiplier: 0.85,
    faunaMultiplier: 0.90,
    resourceMultiplier: 1.20,
    settlementMultiplier: 1.55,
  },
  compact: {
    profile: 'compact',
    buildingMultiplier: 0.98, // Visão tática compacta
    unitMultiplier: 1.0,
    faunaMultiplier: 1.0,
    resourceMultiplier: 0.95,
    settlementMultiplier: 0.98,
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
  buildingScaleMultiplier: 1.15,
  unitScaleMultiplier: 0.95,
  dayNightCycle: true,
};
