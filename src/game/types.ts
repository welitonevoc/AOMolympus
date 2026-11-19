import type { AiPersonality, MultiplayerMatchRoster } from './multiplayerTypes';
export type { AiPersonality };

export type CombatStance = 'aggressive' | 'defensive' | 'stand_ground';
export type VillagerPriorityPreset = 'manual' | 'balanced' | 'food' | 'wood' | 'gold' | 'wonder';

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

export type ArchStyleId = 'greek' | 'egyptian' | 'norse' | 'atlantean' | 'chinese';

export type DifficultyId = 'easy' | 'normal' | 'hard' | 'titan';

import type { MapId, WorldSizeId } from '../maps/mapCatalog';
export type { MapId, WorldSizeId } from '../maps/mapCatalog';

export type TeamId = 'player' | 'enemy';
export type ResourceType = 'food' | 'wood' | 'gold' | 'favor';
export type AgeLevel = 1 | 2 | 3 | 4 | 5;
export type DamageType = 'hack' | 'pierce' | 'crush';

export type GameTypeId = 'supremacy' | 'conquest' | 'lightning' | 'deathmatch' | 'regicide';
export type VisibilityMode = 'normal' | 'explored' | 'revealed';

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
  | 'tartarian_spawn'
  | 'fishing_ship'
  | 'war_trireme'
  | 'transport_ship'
  | 'chinese_peasant'
  | 'kuafu'
  | 'halberdier'
  | 'chu_ko_nu'
  | 'tiger_cavalry'
  | 'fire_lance'
  | 'nezha'
  | 'jiang_ziya'
  | 'qilin'
  | 'taotie'
  | 'yazi'
  | 'azure_dragon';

export type BuildingKind =
  | 'town_center'
  | 'village_center'
  | 'house'
  | 'farm'
  | 'granary'
  | 'storehouse'
  | 'lumber_camp'
  | 'mining_camp'
  | 'economic_guild'
  | 'barracks'
  | 'archery_range'
  | 'counter_barracks'
  | 'stable'
  | 'great_hall'
  | 'siege_works'
  | 'armory'
  | 'market'
  | 'temple'
  | 'dock'
  | 'monument'
  | 'obelisk'
  | 'lighthouse'
  | 'wall'
  | 'gate'
  | 'tower'
  | 'mirror_tower'
  | 'fortress'
  | 'asgard_hill_fort'
  | 'sky_passage'
  | 'titan_gate'
  | 'wonder';

export type ResourceNodeKind = 'berry' | 'tree' | 'gold_mine' | 'fish_spot';

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
export type FormationId = 'box' | 'line' | 'staggered' | 'phalanx' | 'wedge';

export type TechId =
  | 'copper_weapons'
  | 'bronze_weapons'
  | 'iron_weapons'
  | 'copper_mail'
  | 'bronze_mail'
  | 'iron_mail'
  | 'copper_shields'
  | 'bronze_shields'
  | 'iron_shields'
  | 'ballistics'
  | 'hand_axe'
  | 'pickaxe'
  | 'plow'
  | 'hunting_dogs'
  | 'husbandry'
  | 'watch_tower'
  | 'medium_soldiers'
  | 'heavy_soldiers'
  | 'champion_soldiers'
  | 'burning_pitch'
  | 'engineers'
  | 'omniscience'
  | 'mythic_rejuvenation'
  | 'secrets_of_titans'
  | 'phobos_spear_of_horror'
  | 'deimos_sword_of_dread'
  | 'enyo_bow_of_horror'
  | 'sarissa'
  | 'aegis_shield'
  | 'sun_ray'
  | 'shafts_of_plague'
  | 'forge_of_olympus'
  | 'olympian_weapons'
  | 'golden_apples'
  | 'necropolis'
  | 'hammer_of_the_gods'
  | 'perception'
  | 'horns_of_consecration';

export interface TechSpec {
  id: TechId;
  name: string;
  description: string;
  minAge: AgeLevel;
  building: BuildingKind;
  secondaryBuildings?: BuildingKind[];
  cost: ResourceCost;
  researchTime: number;
  requires?: TechId;
  requiresMinorGod?: string[];
  requiresMinorGodLabel?: string;
  requiresMajorGod?: string[];
  requiresMajorGodLabel?: string;
  pantheons?: PantheonId[];
  category?: 'armory_weapon' | 'armory_armor' | 'armory_shield' | 'armory_utility' | 'mythic' | 'economy' | 'military' | 'temple';
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
  title?: string;
  pantheon: PantheonId;
  focus: string;
  favoredPower: GodPowerId;
  powerDescription?: string;
  lore?: string;
  comingSoon?: boolean;
  expansionLabel?: string;
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

export { FORMATIONS } from './data/pantheonAndAgeData';

export { MAPS } from '../maps/mapCatalog';
export type { MapConfig, MapExpansion, MapSpecialRule, MapWeatherKind } from '../maps/mapCatalog';

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
  isNaval?: boolean;
  isTransport?: boolean;
  carryCapacity?: number;
  counterTags?: string[];
  canPromoteHero?: boolean;
  producedAt:
    | 'town_center'
    | 'village_center'
    | 'barracks'
    | 'archery_range'
    | 'counter_barracks'
    | 'stable'
    | 'great_hall'
    | 'siege_works'
    | 'market'
    | 'temple'
    | 'dock'
    | 'fortress'
    | 'asgard_hill_fort'
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

export {
  AGE_NAMES,
  AGE_COSTS,
  AGE_ADVANCE_TIMES,
  PANTHEONS,
  PLAYABLE_PANTHEON_IDS,
  COMING_SOON_PANTHEON_IDS,
} from './data/pantheonAndAgeData';

export type CivilizationId = 'gregos' | 'egipcios' | 'nordicos' | 'atlantes' | 'chineses';

export type GreekUnitKind = UnitKind;
export type EgyptianUnitKind = UnitKind;
export type NorseUnitKind = UnitKind;
export type AtlanteanUnitKind = UnitKind;
export type ChineseUnitKind = UnitKind;

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

export interface ChineseUnitStats extends CultureUnitStats {
  culture?: 'chineses';
}

export interface CivilizationUnitMap {
  gregos: Record<GreekUnitKind, GreekUnitStats>;
  egipcios: Record<EgyptianUnitKind, EgyptianUnitStats>;
  nordicos: Record<NorseUnitKind, NorseUnitStats>;
  atlantes: Record<AtlanteanUnitKind, AtlanteanUnitStats>;
  chineses: Record<ChineseUnitKind, ChineseUnitStats>;
}

export {
  EGYPTIAN_ROSTER_STATS,
  NORSE_ROSTER_STATS,
  ATLANTEAN_ROSTER_STATS,
  CHINESE_ROSTER_STATS,
  NAVAL_ROSTER_STATS,
  CIVILIZATION_UNITS,
  UNIT_STATS,
} from './data/unitRostersData';

export { BUILDING_STATS } from './data/buildingStatsData';

export type FaunaCategory =
  | 'herdable'
  | 'hunt_passive'
  | 'hunt_defensive'
  | 'predator'
  | 'aquatic_decor'
  | 'set_animal';

export type FaunaKind =
  // 1. Animais de Rebanho (Herdables)
  | 'cow'
  | 'goat'
  | 'pig'
  | 'turkey'
  | 'capybara'
  | 'yak'
  // 2A. Caça Mansa / Fuga (Passive Huntables)
  | 'gazelle'
  | 'deer'
  | 'moose'
  | 'reindeer'
  | 'zebra'
  | 'giraffe'
  | 'chicken'
  | 'camel'
  // 2B. Caça Defensiva / Retaliam (Defensive Huntables)
  | 'boar'
  | 'aurochs'
  | 'musk_ox'
  | 'rhino'
  | 'elephant_wild'
  | 'hippo'
  // 3. Predadores Agressivos (Predators)
  | 'wolf'
  | 'bear'
  | 'lion'
  | 'tiger'
  | 'hyena'
  | 'crocodile'
  | 'alligator'
  // 4. Fauna Aquática Decorativa
  | 'sea_turtle'
  | 'dolphin'
  | 'whale'
  // 5. Animal Especial de Set
  | 'baboon';

export interface FaunaStats {
  kind: FaunaKind;
  name: string;
  role: string;
  category: FaunaCategory;
  maxHp: number;
  foodAmount: number;
  maxFattenedFood?: number;
  attack: number;
  speed: number;
  radius: number;
  retaliates: boolean;
  fleeOnHit?: boolean;
  aggroRadius?: number;
  canFatten?: boolean;
  isAquatic?: boolean;
  nonHarvestable?: boolean;
  gatherRateMult?: number;
}


export { FAUNA_STATS } from './data/faunaData';

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
  canPrayAtTemple?: boolean;
  canCallVillagersToPray?: boolean;
  canEmpowerMonument?: boolean;
  prayingCount?: number;
  templePrayerRatePerSec?: number;
  oracleVisionPct?: number;
  oracleFavorPerSec?: number;
  isEmpowered?: boolean;
  empoweredByLabel?: string;
  garrisonedCount?: number;
  garrisonMaxCapacity?: number;
  canGarrison?: boolean;
  canUngarrison?: boolean;
  isisProtected?: boolean;
  canPromoteToHero?: boolean;
  heroPromoteIsFree?: boolean;
  heroPromoteCount?: number;
  heroPromoteCost?: ResourceCost;
  selectedCounts?: { kind: UnitKind; name: string; count: number }[];
  voiceLine?: UnitVoiceLineInfo;
  stance?: CombatStance;
  autoScout?: boolean;
  isNaval?: boolean;
  isTransport?: boolean;
  cargoCount?: number;
  cargoMax?: number;
  counterTags?: string[];
  damageType?: DamageType;
  faunaCategory?: FaunaCategory;
  faunaOwnerTeam?: TeamId | 'neutral';
  canFatten?: boolean;
  maxFattenedFood?: number;
  canConvertFauna?: boolean;
  canCommandFauna?: boolean;
  nonHarvestableFauna?: boolean;
  isInfiniteResource?: boolean;
}

export interface CampaignObjectiveHud {
  id: string;
  label: string;
  done: boolean;
  progressText?: string;
}

export interface CampaignDialogueHud {
  speaker: string;
  text: string;
}

export interface CampaignMissionSnapshot {
  scenarioId: string;
  title: string;
  stageIndex: number;
  totalStages: number;
  objectives: CampaignObjectiveHud[];
  dialogue: CampaignDialogueHud | null;
}

export interface FactionScoreEntry {
  slotIndex: number;
  label: string;
  teamIndex: 1 | 2;
  team: TeamId;
  pantheon: PantheonId;
  majorGod: string;
  colorHex: string;
  crestId: string;
  age: AgeLevel;
  score: number;
  isHuman: boolean;
  isSelf: boolean;
  defeated: boolean;
  aiPersonality?: AiPersonality;
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
  skyPassageCount?: number;
  monumentCount?: number;
  wonderCount?: number;
  wonderBonusActive?: boolean;
  favorRatePerSec: number;
  favorBreakdown: { label: string; rate: number; detail?: string }[];
  prayingVillagerCount?: number;
  empoweredMonumentCount?: number;
  oracleVisionSummary?: { count: number; avgEfficiencyPct: number; fullVisionCount: number };
  playerColorHex?: number;
  playerCrestId?: string;
  multiplayerRoster?: MultiplayerMatchRoster;
  villagerPriority?: VillagerPriorityPreset;
  controlGroups?: { group: number; count: number }[];
  campaignMissionState?: CampaignMissionSnapshot | null;
  factionScores?: FactionScoreEntry[];
  aiPersonality?: AiPersonality;
  campaignScenarioId?: string;
  isSetPlayer?: boolean;
  wonderAgeActive?: boolean;
  enemyWonderAgeActive?: boolean;
  godPowerUses?: Partial<Record<GodPowerId, number>>;
  godPowerRecastCosts?: Partial<Record<GodPowerId, number>>;
  townBellActive?: boolean;
  selectedBuildingGarrison?: {
    buildingId: string;
    buildingName?: string;
    count: number;
    capacity: number;
    bonusArrows: number;
  } | null;
  selectedMythAbility?: {
    unitId: string;
    unitKind: UnitKind;
    name: string;
    description: string;
    cooldownRemaining: number;
    cooldownTotal: number;
    autoCast: boolean;
  } | null;
  dragWallPreviewCount?: number;
  replayState?: {
    active: boolean;
    playing: boolean;
    speed: 1 | 2 | 4;
    currentTime: number;
    duration: number;
    fogDisabled: boolean;
    perspective: 'all' | 'player' | 'enemy';
    title: string;
  } | null;
  timelineHistory?: {
    timeSec: number;
    playerEco: number;
    enemyEco: number;
    playerArmy: number;
    enemyArmy: number;
    playerPop: number;
    enemyPop: number;
    playerFavor: number;
    enemyFavor: number;
    playerAge: AgeLevel;
    enemyAge: AgeLevel;
  }[];
  cinematic?: {
    active: boolean;
    title: string;
    subtitle: string;
    progress: number;
  } | null;
}

export interface MatchStartOptions {
  startingAge?: AgeLevel;
  startingResources?: 'standard' | 'high' | 'abundant';
  enemyPantheon?: PantheonId;
  minorGod?: string;
  majorGodName?: string;
  scenarioTitle?: string;
  campaignScenarioId?: string;
  aiPersonality?: AiPersonality;
  matchSeed?: number;
  gameSpeed?: number;
  gameType?: GameTypeId;
  visibilityMode?: VisibilityMode;
  worldSize?: WorldSizeId;
  dayNightCycle?: boolean;
  titansEnabled?: boolean;
  treatyMinutes?: number;
  playerColorHex?: number;
  playerCrestId?: string;
  multiplayerRoster?: MultiplayerMatchRoster;
  rmsConfig?: {
    scriptId: string;
    title: string;
    xsCode: string;
    xmlCode?: string;
    seed: number;
    playerCount?: number;
  };
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

export { AOM_SCALE_PROFILES, DEFAULT_AOM_SCALE_CONFIG } from './data/pantheonAndAgeData';

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

export { DEFAULT_GAME_OPTIONS } from './data/pantheonAndAgeData';
