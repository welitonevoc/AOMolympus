import { getXmbNumber, XMB_GOD_POWERS } from '../god powers';
import {
  BUILDING_STATS,
  BuildingKind,
  BuildingStats,
  GodPowerId,
  GodPowerSpec,
  MajorGodSpec,
  MapId,
  MinorGodSpec,
  PANTHEONS,
  PantheonId,
  TechId,
  TechSpec,
  UNIT_STATS,
  UnitKind,
  UnitStats,
} from './types';

export const GOD_POWERS: Record<GodPowerId, GodPowerSpec> = {
  prosperity: {
    id: 'prosperity',
    name: 'Prosperidade',
    category: 'Econômico',
    description: 'Concede +200 Alimento, +160 Madeira e +140 Ouro imediatamente.',
    minAge: 1,
    favorCost: 15,
    cooldown: 35,
    radius: 8,
    targeted: false,
  },
  rain: {
    id: 'rain',
    name: 'Chuva de Rá (Rain)',
    category: 'Econômico',
    description: `XMB Rain (${getXmbNumber(XMB_GOD_POWERS.rain, 'activetime', 60)}s): Abençoa fazendas e concede +260 Alimento e +140 Madeira.`,
    minAge: 1,
    favorCost: 16,
    cooldown: 40,
    radius: Math.min(14, getXmbNumber(XMB_GOD_POWERS.rain, 'radius', 12)),
    targeted: false,
  },
  create_gold: {
    id: 'create_gold',
    name: 'Mina Anã (Dwarven Mine)',
    category: 'Econômico',
    description: 'XMB DwarvenMine: Faz emergir uma rica Mina de Ouro Anã (1000 Ouro) diretamente no ponto escolhido.',
    minAge: 1,
    favorCost: 18,
    cooldown: 45,
    radius: 6,
    targeted: true,
  },
  great_hunt: {
    id: 'great_hunt',
    name: 'Grande Caçada (Great Hunt)',
    category: 'Econômico',
    description: `XMB GreatHunt: Multiplica a fauna de caça na área alvo (até ${getXmbNumber(XMB_GOD_POWERS.great_hunt, 'maxfood', 600)} Alimento extra).`,
    minAge: 1,
    favorCost: 16,
    cooldown: 42,
    radius: getXmbNumber(XMB_GOD_POWERS.great_hunt, 'radius', 10),
    targeted: true,
  },
  healing: {
    id: 'healing',
    name: 'Fonte Curativa',
    category: 'Defensivo',
    description: 'Restaura 220 de vida de todas as unidades aliadas na área alvo.',
    minAge: 1,
    favorCost: 20,
    cooldown: 38,
    radius: 10.5,
    targeted: true,
  },
  restoration: {
    id: 'restoration',
    name: 'Restauração (Restoration)',
    category: 'Defensivo',
    description: `XMB Restoration (${getXmbNumber(XMB_GOD_POWERS.restoration, 'activetime', 6)}s): Cura tropas e edificações aliadas em ampla área (${getXmbNumber(XMB_GOD_POWERS.restoration, 'healspeed', 30)} HP/s).`,
    minAge: 2,
    favorCost: 22,
    cooldown: 42,
    radius: 13,
    targeted: true,
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinelas (Sentinel)',
    category: 'Defensivo',
    description: 'XMB Sentinel: Ergue 4 Sentinelas Guardiãs de argila para defender seu Centro da Cidade ou posição alvo.',
    minAge: 1,
    favorCost: 20,
    cooldown: 45,
    radius: 8.5,
    targeted: true,
  },
  frost: {
    id: 'frost',
    name: 'Congelamento (Frost)',
    category: 'Defensivo',
    description: `XMB Frost: Tempestade glacial que congela inimigos na área alvo por ${Math.min(12, Math.round(getXmbNumber(XMB_GOD_POWERS.frost, 'freezeholdtime', 45) / 5))}s e reduz armadura.`,
    minAge: 2,
    favorCost: 24,
    cooldown: 44,
    radius: 10.5,
    targeted: true,
  },
  flaming_weapons: {
    id: 'flaming_weapons',
    name: 'Armas Flamejantes (Flaming Weapons)',
    category: 'Ofensivo',
    description: `XMB FlamingWeapons (${getXmbNumber(XMB_GOD_POWERS.flaming_weapons, 'activetime', 60)}s): Incendeia as armas de todos os guerreiros aliados (+60% de ataque).`,
    minAge: 3,
    favorCost: 34,
    cooldown: 55,
    radius: 14,
    targeted: false,
  },
  lightning: {
    id: 'lightning',
    name: 'Raio de Zeus (Bolt)',
    category: 'Ofensivo',
    description: 'Fulmina inimigos com descargas ramificadas do céu e onda de choque.',
    minAge: 1,
    favorCost: 22,
    cooldown: 38,
    radius: 8.5,
    targeted: true,
  },
  lightning_storm: {
    id: 'lightning_storm',
    name: 'Tempestade de Raios (Lightning Storm)',
    category: 'Ofensivo',
    description: `XMB LightningStorm (${getXmbNumber(XMB_GOD_POWERS.lightning_storm, 'activetime', 15)}s): Nuvens elétricas que fulminam tropas inimigas repetidamente.`,
    minAge: 4,
    favorCost: 44,
    cooldown: 64,
    radius: 13.5,
    targeted: true,
  },
  meteor: {
    id: 'meteor',
    name: 'Chuva de Meteoros (Meteor)',
    category: 'Ofensivo',
    description: `XMB Meteor (${getXmbNumber(XMB_GOD_POWERS.meteor, 'activetime', 15)}s): Invoca meteoros flamejantes que devastam e arremessam exércitos.`,
    minAge: 4,
    favorCost: 45,
    cooldown: 65,
    radius: 12.5,
    targeted: true,
  },
  tornado: {
    id: 'tornado',
    name: 'Tornado',
    category: 'Ofensivo',
    description: `XMB Tornado (${getXmbNumber(XMB_GOD_POWERS.tornado, 'activetime', 20)}s): Ciclone colossal que arremessa soldados inimigos e destrói estruturas.`,
    minAge: 4,
    favorCost: 44,
    cooldown: 62,
    radius: getXmbNumber(XMB_GOD_POWERS.tornado, 'radius', 10),
    targeted: true,
  },
  tremor: {
    id: 'tremor',
    name: 'Tremor Sísmico (Tremor)',
    category: 'Ofensivo',
    description: `XMB Tremor: Onda de choque sísmica que arremessa tropas (${getXmbNumber(XMB_GOD_POWERS.tremor, 'stunlength', 2)}s atordoamento) e abala muralhas.`,
    minAge: 2,
    favorCost: 24,
    cooldown: 42,
    radius: Math.max(8.5, getXmbNumber(XMB_GOD_POWERS.tremor, 'radius', 5)),
    targeted: true,
  },
  undermine: {
    id: 'undermine',
    name: 'Solapar (Undermine)',
    category: 'Ofensivo',
    description: `XMB Undermine: Abre fendas subterrâneas que causam até ${getXmbNumber(XMB_GOD_POWERS.undermine, 'totaldamage', 10000)} de dano estrutural contra torres e bases.`,
    minAge: 2,
    favorCost: 28,
    cooldown: 48,
    radius: 10,
    targeted: true,
  },
  pestilence: {
    id: 'pestilence',
    name: 'Pestilência (Pestilence)',
    category: 'Ofensivo',
    description: `XMB Pestilence (${getXmbNumber(XMB_GOD_POWERS.pestilence, 'activetime', 50)}s): Empesteia quartéis e tropas inimigas, drenando vida e bloqueando produção.`,
    minAge: 2,
    favorCost: 25,
    cooldown: 45,
    radius: 11.5,
    targeted: true,
  },
  locust_swarm: {
    id: 'locust_swarm',
    name: 'Nuvem de Gafanhotos (Locust Swarm)',
    category: 'Ofensivo',
    description: `XMB LocustSwarm (${getXmbNumber(XMB_GOD_POWERS.locust_swarm, 'activetime', 28)}s): Enxame devorador que destrói fazendas inimigas e fere coletores.`,
    minAge: 3,
    favorCost: 30,
    cooldown: 50,
    radius: 10,
    targeted: true,
  },
  sandstorm: {
    id: 'sandstorm',
    name: 'Areias Movediças (Shifting Sands)',
    category: 'Defensivo',
    description: 'XMB ShiftingSands: Redemoinho de areia que transporta guerreiros aliados ou fustiga inimigos no alvo.',
    minAge: 2,
    favorCost: 26,
    cooldown: 46,
    radius: getXmbNumber(XMB_GOD_POWERS.sandstorm, 'radius', 10),
    targeted: true,
  },
  spiders: {
    id: 'spiders',
    name: 'Covil de Aranhas (Spiders)',
    category: 'Ofensivo',
    description: `XMB Spiders: Implanta ${getXmbNumber(XMB_GOD_POWERS.spiders, 'numbertocreate', 4)} armadilhas aracnídeas que eclodem e devoram tropas inimigas.`,
    minAge: 2,
    favorCost: 24,
    cooldown: 42,
    radius: getXmbNumber(XMB_GOD_POWERS.spiders, 'radius', 10),
    targeted: true,
  },
  chaos: {
    id: 'chaos',
    name: 'Caos (Chaos)',
    category: 'Ofensivo',
    description: 'XMB Chaos: Enlouquece unidades inimigas na área alvo, fazendo-as atacar umas às outras.',
    minAge: 3,
    favorCost: 34,
    cooldown: 54,
    radius: 11,
    targeted: true,
  },
  traitors: {
    id: 'traitors',
    name: 'Traidores (Traitors)',
    category: 'Ofensivo',
    description: 'XMB Traitors: Converte guerreiros inimigos na área selecionada para lutarem pelo seu panteão.',
    minAge: 3,
    favorCost: 32,
    cooldown: 52,
    radius: 7.5,
    targeted: true,
  },
  volcanic_eruption: {
    id: 'volcanic_eruption',
    name: 'Erupção Vulcânica',
    category: 'Ofensivo',
    description: 'Abre uma cratera de lava que explode inimigos e incendeia construções.',
    minAge: 3,
    favorCost: 42,
    cooldown: 62,
    radius: 11,
    targeted: true,
  },
  blizzard: {
    id: 'blizzard',
    name: 'Nevasca (Blizzard)',
    category: 'Ofensivo',
    description: 'Tempestade glacial que congela parcialmente e causa dano contínuo em área.',
    minAge: 2,
    favorCost: 30,
    cooldown: 48,
    radius: 11,
    targeted: true,
  },
  darkest_night: {
    id: 'darkest_night',
    name: 'Noite Escura (Eclipse)',
    category: 'Defensivo',
    description: 'Invoca um eclipse sagrado que fortalece unidades míticas aliadas (+35% ataque por 20s).',
    minAge: 2,
    favorCost: 26,
    cooldown: 50,
    radius: 14,
    targeted: false,
  },
  disease: {
    id: 'disease',
    name: 'Praga (Disease)',
    category: 'Ofensivo',
    description: 'Espalha uma névoa tóxica que drena a vida das tropas inimigas na área.',
    minAge: 2,
    favorCost: 26,
    cooldown: 46,
    radius: 10.5,
    targeted: true,
  },
  maelstrom: {
    id: 'maelstrom',
    name: 'Turbilhão (Maelstrom)',
    category: 'Ofensivo',
    description: 'Ciclone violento que puxa e dilacera tropas inimigas ao redor do impacto.',
    minAge: 3,
    favorCost: 38,
    cooldown: 58,
    radius: 11.5,
    targeted: true,
  },
  necromancy: {
    id: 'necromancy',
    name: 'Necromancia',
    category: 'Ofensivo',
    description: 'Erga guerreiros míticos espectrais diretamente na área alvo para lutar por você.',
    minAge: 3,
    favorCost: 36,
    cooldown: 56,
    radius: 8,
    targeted: true,
  },
  black_hole: {
    id: 'black_hole',
    name: 'Buraco Negro (Implode)',
    category: 'Ofensivo',
    description: 'Singularidade cósmica que atrai inimigos para o centro e implode com dano massivo.',
    minAge: 4,
    favorCost: 52,
    cooldown: 75,
    radius: 13.5,
    targeted: true,
  },
  solar_beam: {
    id: 'solar_beam',
    name: 'Raio Solar',
    category: 'Ofensivo',
    description: 'Feixe incandescente dos céus que vaporiza unidades e torres inimigas.',
    minAge: 2,
    favorCost: 28,
    cooldown: 44,
    radius: 7.5,
    targeted: true,
  },
  walking_woods: {
    id: 'walking_woods',
    name: 'Bosques Vivos (Walking Woods)',
    category: 'Defensivo',
    description: `XMB WalkingWoods: Anima até ${XMB_GOD_POWERS.walking_woods.children?.find((c) => c.tag === 'convertusingminmax')?.attributes?.maxswapamount ?? '6'} árvores em Guardiões Florestais para atacar seus inimigos.`,
    minAge: 2,
    favorCost: 28,
    cooldown: 50,
    radius: Math.max(9, getXmbNumber(XMB_GOD_POWERS.walking_woods, 'radius', 6)),
    targeted: true,
  },
};

export const TECH_SPECS: Record<TechId, TechSpec> = {
  hand_axe: {
    id: 'hand_axe',
    name: 'Machado de Mão',
    description: '+20% na velocidade de coleta de Madeira pelos aldeões.',
    minAge: 1,
    building: 'town_center',
    cost: { food: 100, gold: 50 },
    researchTime: 10,
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'Picareta',
    description: '+20% na velocidade de mineração de Ouro pelos aldeões.',
    minAge: 1,
    building: 'town_center',
    cost: { food: 100, wood: 50 },
    researchTime: 10,
  },
  plow: {
    id: 'plow',
    name: 'Arado',
    description: '+20% na coleta de Alimento (arbustos, caça e fazendas).',
    minAge: 2,
    building: 'town_center',
    cost: { wood: 75, gold: 100 },
    researchTime: 11,
  },
  copper_weapons: {
    id: 'copper_weapons',
    name: 'Armas de Cobre',
    description: '+12% de ataque para todas as unidades militares e heróis.',
    minAge: 2,
    building: 'armory',
    cost: { food: 150, gold: 150 },
    researchTime: 12,
  },
  bronze_weapons: {
    id: 'bronze_weapons',
    name: 'Armas de Bronze',
    description: '+14% adicional de ataque para todas as unidades militares.',
    minAge: 3,
    building: 'armory',
    cost: { food: 250, gold: 250 },
    researchTime: 14,
    requires: 'copper_weapons',
  },
  iron_weapons: {
    id: 'iron_weapons',
    name: 'Armas de Ferro',
    description: '+16% adicional de ataque para todas as unidades militares.',
    minAge: 4,
    building: 'armory',
    cost: { food: 400, gold: 400 },
    researchTime: 16,
    requires: 'bronze_weapons',
  },
  copper_mail: {
    id: 'copper_mail',
    name: 'Armadura de Cobre',
    description: '+10% de armadura física (Corte & Perfuração) para todas as tropas.',
    minAge: 2,
    building: 'armory',
    cost: { food: 140, gold: 160 },
    researchTime: 12,
  },
  bronze_mail: {
    id: 'bronze_mail',
    name: 'Armadura de Bronze',
    description: '+10% adicional de armadura física para todas as tropas.',
    minAge: 3,
    building: 'armory',
    cost: { food: 240, gold: 260 },
    researchTime: 14,
    requires: 'copper_mail',
  },
  iron_mail: {
    id: 'iron_mail',
    name: 'Armadura de Ferro',
    description: '+12% adicional de armadura física para todas as tropas.',
    minAge: 4,
    building: 'armory',
    cost: { food: 380, gold: 420 },
    researchTime: 16,
    requires: 'bronze_mail',
  },
  medium_soldiers: {
    id: 'medium_soldiers',
    name: 'Soldados Médios',
    description: '+15% de Vida Máxima e +10% de ataque para Infantaria, Arqueiros e Cavalaria.',
    minAge: 2,
    building: 'barracks',
    cost: { food: 150, gold: 150 },
    researchTime: 12,
  },
  heavy_soldiers: {
    id: 'heavy_soldiers',
    name: 'Soldados Pesados',
    description: '+15% de Vida e +12% de ataque para soldados humanos.',
    minAge: 3,
    building: 'barracks',
    cost: { food: 260, gold: 260 },
    researchTime: 14,
    requires: 'medium_soldiers',
  },
  champion_soldiers: {
    id: 'champion_soldiers',
    name: 'Soldados Campeões',
    description: '+20% de Vida e +15% de ataque para soldados humanos de elite.',
    minAge: 4,
    building: 'barracks',
    cost: { food: 420, gold: 420 },
    researchTime: 16,
    requires: 'heavy_soldiers',
  },
  watch_tower: {
    id: 'watch_tower',
    name: 'Torres Fortificadas',
    description: '+35% de Vida e +30% de ataque para Torres e Fortalezas.',
    minAge: 2,
    building: 'town_center',
    cost: { wood: 180, gold: 120 },
    researchTime: 12,
  },
  burning_pitch: {
    id: 'burning_pitch',
    name: 'Piche Ardente',
    description: '+25% de ataque para Armas de Cerco, Torres e Fortalezas.',
    minAge: 3,
    building: 'fortress',
    cost: { wood: 200, gold: 180 },
    researchTime: 13,
  },
  engineers: {
    id: 'engineers',
    name: 'Engenheiros de Cerco',
    description: '+30% de Vida e +20% de dano contra construções para Armas de Cerco e Heróis.',
    minAge: 4,
    building: 'fortress',
    cost: { wood: 300, gold: 320 },
    researchTime: 15,
    requires: 'burning_pitch',
  },
  omniscience: {
    id: 'omniscience',
    name: 'Devoção Mítica',
    description: '+20% de Vida e +15% de ataque para todas as Unidades Míticas.',
    minAge: 2,
    building: 'temple',
    cost: { gold: 150, favor: 15 },
    researchTime: 12,
  },
  mythic_rejuvenation: {
    id: 'mythic_rejuvenation',
    name: 'Fervor Olímpico',
    description: '+25% de Vida e +15% de velocidade para Unidades Míticas e Heróis.',
    minAge: 3,
    building: 'temple',
    cost: { gold: 240, favor: 22 },
    researchTime: 14,
    requires: 'omniscience',
  },
  secrets_of_titans: {
    id: 'secrets_of_titans',
    name: 'Era V: Despertar dos Deuses',
    description: 'Avança para a Era V (Era dos Deuses), habilitando a convocação de Deuses Maiores e Menores no Templo e o Portão do Titã.',
    minAge: 4,
    building: 'temple',
    cost: { food: 1200, wood: 800, gold: 1200, favor: 60 },
    researchTime: 24,
  },
};

export const MINOR_GODS: Record<string, MinorGodSpec> = {
  // Greek
  Athena: { id: 'Athena', name: 'Atena', age: 2, pantheon: 'greek', godPower: 'restoration', mythUnit: 'minotaur', mythUnitTitle: 'Minotauro / Ninfa (Dríade)', passiveBonusLabel: '+15% Armadura de Infantaria', hpBonusPct: 12 },
  Ares: { id: 'Ares', name: 'Ares', age: 2, pantheon: 'greek', godPower: 'pestilence', mythUnit: 'minotaur', mythUnitTitle: 'Minotauro / Ciclope', passiveBonusLabel: '+14% Ataque Corpo a Corpo', attackBonusPct: 14 },
  Hermes: { id: 'Hermes', name: 'Hermes', age: 2, pantheon: 'greek', godPower: 'prosperity', mythUnit: 'centaur', mythUnitTitle: 'Centauro / Pégaso', passiveBonusLabel: '+15% Velocidade da Cavalaria', speedBonusPct: 15 },
  Apollo: { id: 'Apollo', name: 'Apolo', age: 3, pantheon: 'greek', godPower: 'solar_beam', mythUnit: 'manticore', mythUnitTitle: 'Mantícora / Fênix', passiveBonusLabel: '+15% Alcance & Dano à Distância · Desbloqueia Gastraphetes', attackBonusPct: 12 },
  Dionysos: { id: 'Dionysos', name: 'Dionísio', age: 3, pantheon: 'greek', godPower: 'walking_woods', mythUnit: 'hydra', mythUnitTitle: 'Hidra / Sátiro', passiveBonusLabel: '+18% Vida da Cavalaria', hpBonusPct: 15 },
  Aphrodite: { id: 'Aphrodite', name: 'Afrodite', age: 3, pantheon: 'greek', godPower: 'prosperity', mythUnit: 'nymph', mythUnitTitle: 'Ninfa (Dríade) / Minotauro', passiveBonusLabel: '+20% Coleta dos Aldeões', gatherBonusPct: 20 },
  Hephaestus: { id: 'Hephaestus', name: 'Hefesto', age: 4, pantheon: 'greek', godPower: 'volcanic_eruption', mythUnit: 'colossus', mythUnitTitle: 'Colosso / Autômato / Anão de Ferro', passiveBonusLabel: '+20% Ataque & Armadura', attackBonusPct: 18, hpBonusPct: 12 },
  Hera: { id: 'Hera', name: 'Hera', age: 4, pantheon: 'greek', godPower: 'lightning_storm', mythUnit: 'medusa', mythUnitTitle: 'Medusa / Ciclope', passiveBonusLabel: '+25% Vida Mítica', hpBonusPct: 22 },
  Artemis: { id: 'Artemis', name: 'Ártemis', age: 4, pantheon: 'greek', godPower: 'tremor', mythUnit: 'medusa', mythUnitTitle: 'Medusa / Mantícora', passiveBonusLabel: '+20% Dano Arqueiros & Cerco', attackBonusPct: 18 },

  // Egyptian
  Bast: { id: 'Bast', name: 'Bast', age: 2, pantheon: 'egyptian', godPower: 'darkest_night', mythUnit: 'sphinx', mythUnitTitle: 'Esfinge', passiveBonusLabel: '+18% Coleta de Ouro & Alimento', gatherBonusPct: 18 },
  Ptah: { id: 'Ptah', name: 'Ptá', age: 2, pantheon: 'egyptian', godPower: 'sandstorm', mythUnit: 'wadjet', mythUnitTitle: 'Wadjet', passiveBonusLabel: '+15% HP de Construções', hpBonusPct: 12 },
  Anubis: { id: 'Anubis', name: 'Anúbis', age: 2, pantheon: 'egyptian', godPower: 'disease', mythUnit: 'sphinx', mythUnitTitle: 'Anubita / Esfinge', passiveBonusLabel: '+16% Ataque Infantaria & Míticos', attackBonusPct: 16 },
  Hathor: { id: 'Hathor', name: 'Hator', age: 3, pantheon: 'egyptian', godPower: 'locust_swarm', mythUnit: 'petsuchos', mythUnitTitle: 'Roca & Petsuchos', passiveBonusLabel: '+15% HP Geral · Libera Roca & Petsuchos', hpBonusPct: 15 },
  Nephthys: { id: 'Nephthys', name: 'Néftis', age: 3, pantheon: 'egyptian', godPower: 'necromancy', mythUnit: 'petsuchos', mythUnitTitle: 'Escorpião Gigante', passiveBonusLabel: '+20% Regeneração & Favor', hpBonusPct: 14 },
  Sekhmet: { id: 'Sekhmet', name: 'Sekhmet', age: 3, pantheon: 'egyptian', godPower: 'undermine', mythUnit: 'scarab', mythUnitTitle: 'Escaravelho', passiveBonusLabel: '+18% Ataque de Cerco & Funda', attackBonusPct: 18 },
  Horus: { id: 'Horus', name: 'Hórus', age: 4, pantheon: 'egyptian', godPower: 'tornado', mythUnit: 'avenger', mythUnitTitle: 'Vingador', passiveBonusLabel: '+22% Ataque da Infantaria', attackBonusPct: 20 },
  Osiris: { id: 'Osiris', name: 'Osíris', age: 4, pantheon: 'egyptian', godPower: 'lightning_storm', mythUnit: 'mummy', mythUnitTitle: 'Múmia & Filho de Osíris', passiveBonusLabel: '+20% Coleta & Favor · Desbloqueia Filho de Osíris', gatherBonusPct: 20 },
  Thoth: { id: 'Thoth', name: 'Thoth', age: 4, pantheon: 'egyptian', godPower: 'meteor', mythUnit: 'phoenix', mythUnitTitle: 'Fênix / Elefante', passiveBonusLabel: '+20% Dano Mítico & Heróis', attackBonusPct: 20 },

  // Norse
  Forseti: { id: 'Forseti', name: 'Forseti', age: 2, pantheon: 'norse', godPower: 'healing', mythUnit: 'minotaur', mythUnitTitle: 'Troll', passiveBonusLabel: '+14% Velocidade & Vida Ulfsark', speedBonusPct: 14 },
  Freyja: { id: 'Freyja', name: 'Freyja', age: 2, pantheon: 'norse', godPower: 'walking_woods', mythUnit: 'minotaur', mythUnitTitle: 'Valquíria', passiveBonusLabel: '+15% Vida Cavalaria & Valquírias', hpBonusPct: 15 },
  Heimdall: { id: 'Heimdall', name: 'Heimdall', age: 2, pantheon: 'norse', godPower: 'undermine', mythUnit: 'minotaur', mythUnitTitle: 'Einherjar', passiveBonusLabel: '+18% Dano vs Construções', attackBonusPct: 14 },
  Skadi: { id: 'Skadi', name: 'Skadi', age: 3, pantheon: 'norse', godPower: 'frost', mythUnit: 'centaur', mythUnitTitle: 'Gigante de Gelo', passiveBonusLabel: '+18% Coleta de Caça & Fazendas', gatherBonusPct: 18 },
  Bragi: { id: 'Bragi', name: 'Bragi', age: 3, pantheon: 'norse', godPower: 'flaming_weapons', mythUnit: 'centaur', mythUnitTitle: 'Javali de Batalha', passiveBonusLabel: '+16% Ataque de Ulfsark', attackBonusPct: 16 },
  Njord: { id: 'Njord', name: 'Njord', age: 3, pantheon: 'norse', godPower: 'walking_woods', mythUnit: 'centaur', mythUnitTitle: 'Gigante da Montanha', passiveBonusLabel: '+18% HP Mítico', hpBonusPct: 18 },
  Baldr: { id: 'Baldr', name: 'Baldr', age: 4, pantheon: 'norse', godPower: 'meteor', mythUnit: 'cyclops', mythUnitTitle: 'Gigante de Fogo', passiveBonusLabel: '+20% Ataque & Cerco', attackBonusPct: 20 },
  Tyr: { id: 'Tyr', name: 'Tyr', age: 4, pantheon: 'norse', godPower: 'blizzard', mythUnit: 'cyclops', mythUnitTitle: 'Lobo Fenris', passiveBonusLabel: '+22% Vida & Fúria Nórdica', hpBonusPct: 20 },
  Hel: { id: 'Hel', name: 'Hel', age: 4, pantheon: 'norse', godPower: 'tornado', mythUnit: 'cyclops', mythUnitTitle: 'Nidhogg / Gigante', passiveBonusLabel: '+25% Poder das Unidades Míticas', attackBonusPct: 22 },

  // Atlantean
  Prometheus: { id: 'Prometheus', name: 'Prometeu', age: 2, pantheon: 'atlantean', godPower: 'necromancy', mythUnit: 'minotaur', mythUnitTitle: 'Prometeano', passiveBonusLabel: '+14% Vida dos Heróis', hpBonusPct: 14 },
  Okeanus: { id: 'Okeanus', name: 'Oceano', age: 2, pantheon: 'atlantean', godPower: 'restoration', mythUnit: 'minotaur', mythUnitTitle: 'Autômato', passiveBonusLabel: '+14% Velocidade & Coleta', speedBonusPct: 12, gatherBonusPct: 12 },
  Leto: { id: 'Leto', name: 'Leto', age: 2, pantheon: 'atlantean', godPower: 'spiders', mythUnit: 'minotaur', mythUnitTitle: 'Autômato', passiveBonusLabel: '+14% Armadura de Autômatos', hpBonusPct: 14 },
  Hyperion: { id: 'Hyperion', name: 'Hipérion', age: 3, pantheon: 'atlantean', godPower: 'chaos', mythUnit: 'centaur', mythUnitTitle: 'Sátiro', passiveBonusLabel: '+18% Ataque Heroico', attackBonusPct: 18 },
  Theia: { id: 'Theia', name: 'Teia', age: 3, pantheon: 'atlantean', godPower: 'walking_woods', mythUnit: 'centaur', mythUnitTitle: 'Aves do Estínfalo', passiveBonusLabel: '+18% Velocidade da Cavalaria', speedBonusPct: 18 },
  Rheia: { id: 'Rheia', name: 'Réia', age: 3, pantheon: 'atlantean', godPower: 'traitors', mythUnit: 'centaur', mythUnitTitle: 'Behemote Menor', passiveBonusLabel: '+20% Coleta Econômica', gatherBonusPct: 20 },
  Helios: { id: 'Helios', name: 'Hélios', age: 4, pantheon: 'atlantean', godPower: 'solar_beam', mythUnit: 'cyclops', mythUnitTitle: 'Hekagigante', passiveBonusLabel: '+22% Ataque de Cerco', attackBonusPct: 22 },
  Hekate: { id: 'Hekate', name: 'Hécate', age: 4, pantheon: 'atlantean', godPower: 'black_hole', mythUnit: 'cyclops', mythUnitTitle: 'Lampade', passiveBonusLabel: '+22% Recarga & Poder Mítico', hpBonusPct: 20 },
  Atlas: { id: 'Atlas', name: 'Atlas', age: 4, pantheon: 'atlantean', godPower: 'tremor', mythUnit: 'cyclops', mythUnitTitle: 'Argos', passiveBonusLabel: '+25% Vida Mítica', hpBonusPct: 25 },

  // Shared Divine Edition Minor Gods for Expanded Civs
  Divine_War2: { id: 'Divine_War2', name: 'Senhor da Guerra', age: 2, pantheon: 'roman', godPower: 'flaming_weapons', mythUnit: 'minotaur', mythUnitTitle: 'Guardião Mítico', passiveBonusLabel: '+15% Ataque Militar', attackBonusPct: 15 },
  Divine_Eco2: { id: 'Divine_Eco2', name: 'Divindade da Colheita', age: 2, pantheon: 'chinese', godPower: 'rain', mythUnit: 'minotaur', mythUnitTitle: 'Espírito Protetor', passiveBonusLabel: '+18% Velocidade de Coleta', gatherBonusPct: 18 },
  Divine_Storm3: { id: 'Divine_Storm3', name: 'Divindade da Tempestade', age: 3, pantheon: 'japanese', godPower: 'tornado', mythUnit: 'centaur', mythUnitTitle: 'Sentinela Alada', passiveBonusLabel: '+16% Velocidade & Ataque', speedBonusPct: 12, attackBonusPct: 12 },
  Divine_Shadow3: { id: 'Divine_Shadow3', name: 'Divindade do Crepúsculo', age: 3, pantheon: 'eldritch', godPower: 'chaos', mythUnit: 'centaur', mythUnitTitle: 'Arauto Sombrio', passiveBonusLabel: '+20% Poder Mítico', hpBonusPct: 18 },
  Divine_Apocalypse4: { id: 'Divine_Apocalypse4', name: 'Soberano do Apocalipse', age: 4, pantheon: 'aztec', godPower: 'meteor', mythUnit: 'cyclops', mythUnitTitle: 'Colosso Ancestral', passiveBonusLabel: '+22% Dano em Geral', attackBonusPct: 22 },
  Divine_Abyss4: { id: 'Divine_Abyss4', name: 'Arauto do Abismo', age: 4, pantheon: 'eldritch', godPower: 'lightning_storm', mythUnit: 'cyclops', mythUnitTitle: 'Avatar Cósmico', passiveBonusLabel: '+25% Vida & Favor', hpBonusPct: 25 },
};

export const MAJOR_GODS: MajorGodSpec[] = [
  // Greek
  { id: 'Zeus', name: 'Zeus', pantheon: 'greek', focus: 'Infantaria e Favor acelerado', favoredPower: 'lightning', minorChoices: { 2: ['Athena', 'Hermes'], 3: ['Apollo', 'Dionysos'], 4: ['Hephaestus', 'Hera'] } },
  { id: 'Poseidon', name: 'Poseidon', pantheon: 'greek', focus: 'Cavalaria rápida e domínio territorial', favoredPower: 'tremor', minorChoices: { 2: ['Ares', 'Hermes'], 3: ['Aphrodite', 'Dionysos'], 4: ['Artemis', 'Hephaestus'] } },
  { id: 'Hades', name: 'Hades', pantheon: 'greek', focus: 'Arqueiros precisos e Sentinelas de argila', favoredPower: 'sentinel', minorChoices: { 2: ['Athena', 'Ares'], 3: ['Apollo', 'Aphrodite'], 4: ['Artemis', 'Hephaestus'] } },
  // Egyptian
  { id: 'Rá', name: 'Rá', pantheon: 'egyptian', focus: 'Chuva abençoada e sacerdotes solares', favoredPower: 'rain', minorChoices: { 2: ['Bast', 'Ptah'], 3: ['Hathor', 'Sekhmet'], 4: ['Horus', 'Osiris'] } },
  { id: 'Ísis', name: 'Ísis', pantheon: 'egyptian', focus: 'Monumentos, Favor e proteção divina', favoredPower: 'prosperity', minorChoices: { 2: ['Anubis', 'Bast'], 3: ['Hathor', 'Nephthys'], 4: ['Osiris', 'Thoth'] } },
  { id: 'Set', name: 'Set', pantheon: 'egyptian', focus: 'Caça agressiva, bestas e tempestades de areia', favoredPower: 'sandstorm', minorChoices: { 2: ['Anubis', 'Ptah'], 3: ['Nephthys', 'Sekhmet'], 4: ['Horus', 'Thoth'] } },
  // Norse
  { id: 'Thor', name: 'Thor', pantheon: 'norse', focus: 'Mina de Ouro Anã e armoria avançada', favoredPower: 'create_gold', minorChoices: { 2: ['Forseti', 'Freyja'], 3: ['Bragi', 'Skadi'], 4: ['Baldr', 'Tyr'] } },
  { id: 'Odin', name: 'Odin', pantheon: 'norse', focus: 'Grande Caçada, regeneração e força viking', favoredPower: 'great_hunt', minorChoices: { 2: ['Freyja', 'Heimdall'], 3: ['Njord', 'Skadi'], 4: ['Baldr', 'Tyr'] } },
  { id: 'Loki', name: 'Loki', pantheon: 'norse', focus: 'Unidades míticas e ataques furtivos', favoredPower: 'spiders', minorChoices: { 2: ['Forseti', 'Heimdall'], 3: ['Bragi', 'Njord'], 4: ['Hel', 'Tyr'] } },
  // Atlantean
  { id: 'Cronos', name: 'Cronos', pantheon: 'atlantean', focus: 'Solapar fortificações e armas de cerco', favoredPower: 'undermine', minorChoices: { 2: ['Prometheus', 'Leto'], 3: ['Hyperion', 'Rheia'], 4: ['Helios', 'Atlas'] } },
  { id: 'Urano', name: 'Urano', pantheon: 'atlantean', focus: 'Onda de choque sísmica e mobilidade', favoredPower: 'tremor', minorChoices: { 2: ['Okeanus', 'Prometheus'], 3: ['Hyperion', 'Theia'], 4: ['Helios', 'Hekate'] } },
  { id: 'Gaia', name: 'Gaia', pantheon: 'atlantean', focus: 'Bosques vivos e regeneração econômica', favoredPower: 'walking_woods', minorChoices: { 2: ['Okeanus', 'Leto'], 3: ['Theia', 'Rheia'], 4: ['Atlas', 'Hekate'] } },
  // Chinese (Divine Edition)
  { id: 'Fu Xi', name: 'Fu Xi', pantheon: 'chinese', focus: 'Construção célere e bênçãos imperiais', favoredPower: 'solar_beam', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Nu Wa', name: 'Nu Wa', pantheon: 'chinese', focus: 'Crescimento populacional e regeneração', favoredPower: 'restoration', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Shennong', name: 'Shennong', pantheon: 'chinese', focus: 'Agricultura fértil e chuva sagrada', favoredPower: 'rain', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  // Aztec (Divine Edition)
  { id: 'Huitzilopochtli', name: 'Huitzilopochtli', pantheon: 'aztec', focus: 'Guerreiros solares e armas flamejantes', favoredPower: 'flaming_weapons', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Quetzalcoatl', name: 'Quetzalcoatl', pantheon: 'aztec', focus: 'Sacerdotes velozes e ventos sagrados', favoredPower: 'tornado', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Tezcatlipoca', name: 'Tezcatlipoca', pantheon: 'aztec', focus: 'Espelho fumegante e discórdia no inimigo', favoredPower: 'chaos', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] } },
  // Roman (Divine Edition)
  { id: 'Júpiter', name: 'Júpiter', pantheon: 'roman', focus: 'Legiões pesadas e tempestades de raios', favoredPower: 'lightning_storm', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Juno', name: 'Juno', pantheon: 'roman', focus: 'Fortificações sólidas e sentinelas', favoredPower: 'sentinel', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Minerva', name: 'Minerva', pantheon: 'roman', focus: 'Tecnologias rápidas e restauração', favoredPower: 'restoration', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  // Japanese (Divine Edition)
  { id: 'Izanagi', name: 'Izanagi', pantheon: 'japanese', focus: 'Samurais equilibrados e ventos divinos', favoredPower: 'tornado', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Izanami', name: 'Izanami', pantheon: 'japanese', focus: 'Submundo de Yomi e pestilência', favoredPower: 'pestilence', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] } },
  { id: 'Kagu-Tsuchi', name: 'Kagu-Tsuchi', pantheon: 'japanese', focus: 'Forja de lâminas flamejantes e vulcões', favoredPower: 'flaming_weapons', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  // Eldritch (Divine Edition)
  { id: 'Azathoth', name: 'Azathoth', pantheon: 'eldritch', focus: 'Caos primordial e singularidade espacial', favoredPower: 'chaos', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] } },
  { id: 'Yog-Sothoth', name: 'Yog-Sothoth', pantheon: 'eldritch', focus: 'Rituais temporais e traição mental', favoredPower: 'traitors', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] } },
  { id: 'Shub-Niggurath', name: 'Shub-Niggurath', pantheon: 'eldritch', focus: 'Hordas abissais e ninhos aracnídeos', favoredPower: 'spiders', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] } },
  // Celtic (Divine Edition)
  { id: 'Lugh', name: 'Lugh', pantheon: 'celtic', focus: 'Heróis versáteis e lanças solares', favoredPower: 'solar_beam', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'The Dagda', name: 'The Dagda', pantheon: 'celtic', focus: 'Caldeirão da abundância e bosques vivos', favoredPower: 'walking_woods', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'The Morrigan', name: 'The Morrigan', pantheon: 'celtic', focus: 'Guerreiros ferozes e corvos da morte', favoredPower: 'pestilence', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] } },
  // Babylonian (Divine Edition)
  { id: 'Marduk', name: 'Marduk', pantheon: 'babylonian', focus: 'Cavalaria pesada e tempestades reais', favoredPower: 'lightning_storm', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Inanna', name: 'Inanna', pantheon: 'babylonian', focus: 'Prosperidade de zigurates e glória', favoredPower: 'rain', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Enlil', name: 'Enlil', pantheon: 'babylonian', focus: 'Ventos furiosos e tornados celestes', favoredPower: 'tornado', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  // Lakota (Divine Edition)
  { id: 'Anpetu Wi', name: 'Anpetu Wi', pantheon: 'lakota', focus: 'Grande Caçada e luz do meio-dia', favoredPower: 'great_hunt', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Hanwi', name: 'Hanwi', pantheon: 'lakota', focus: 'Emboscadas sob a lua e restauração', favoredPower: 'restoration', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] } },
  { id: 'Unci Makha', name: 'Unci Makha', pantheon: 'lakota', focus: 'Búfalos abundantes e força da terra', favoredPower: 'tremor', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  // Jotunn (Divine Edition)
  { id: 'Surtr', name: 'Surtr', pantheon: 'jotunn', focus: 'Gigantes flamejantes e chuva de meteoros', favoredPower: 'meteor', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Ymir', name: 'Ymir', pantheon: 'jotunn', focus: 'Colossos de gelo e congelamento eterno', favoredPower: 'frost', minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
  { id: 'Aegir', name: 'Aegir', pantheon: 'jotunn', focus: 'Tempestades do mar e frio glacial', favoredPower: 'blizzard', minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] } },
];

const CIV_UNIT_NAMES: Partial<Record<PantheonId, Partial<Record<UnitKind, { name: string; role?: string }>>>> = {
  greek: {
    villager: { name: 'Aldeão Grego' },
    hoplite: {
      name: 'Hoplita',
      role: 'Espinha dorsal do exército grego (T1–T4) — excelente contra cavalaria e fortalecido por Zeus.',
    },
    hipaspist: {
      name: 'Hipaspista',
      role: 'Infantaria leve anti-infantaria (T1–T4) — espada curva Kopis e bônus contra infantaria inimiga.',
    },
    myrmidon: {
      name: 'Mirmidão',
      role: 'Infantaria de elite exclusiva de Zeus (Era Mítica, T1–T4) — ganha velocidade e dano crescentes em combate.',
    },
    peltast: {
      name: 'Peltasta',
      role: 'Atirador leve ágil (T1–T4) — lança dardos e porta escudo Pelta em meia-lua; letal contra infantaria rápida e outros arqueiros.',
    },
    archer: {
      name: 'Toxota (Toxotes)',
      role: 'Arqueiro grego de longo alcance (T1–T4) — arco composto recurvo; forte contra infantaria e unidades míticas fracas.',
    },
    gastraphetes: {
      name: 'Fundibulário (Gastraphetes)',
      role: 'Atirador com besta abdominal grega (T1–T4) — liberado via Deus Menor (Apolo/Ártemis); alto alcance e impacto perfurante.',
    },
    cavalry: {
      name: 'Hippo (Hippikon)',
      role: 'Cavalaria pesada rápida (T1–T4) — excelente contra arqueiros e cerco; realiza ataques de atropelamento (hit-and-run).',
    },
    prodromos: {
      name: 'Pródromo (Prodromos)',
      role: 'Cavalaria leve de lança Kontos (T1–T4) — especialista veloz no combate contra outras unidades de cavalaria.',
    },
    jason: {
      name: 'Jasão',
      role: 'Herói Padrão de Zeus (Era I) — Líder dos Argonautas com Velocino de Ouro; 3.5x vs Míticas e coleta Relíquias.',
    },
    odysseus: {
      name: 'Ulisses (Odysseus)',
      role: 'Herói Arqueiro Grego (Era II) — Arco Ítaco letal à distância contra Unidades Míticas (3.6x vs Míticas).',
    },
    perseus: {
      name: 'Perseu',
      role: 'Herói Grego de Combate (Era III) — Espada curva Harpê e Escudo Espelho da Égide; devastador corpo a corpo (3.8x vs Míticas).',
    },
    bellerophon: {
      name: 'Belerofonte',
      role: 'Herói Montado em Pégaso (Era IV) — Voo veloz de longo alcance de investida aérea contra Míticas (3.6x vs Míticas).',
    },
    hippolyta: {
      name: 'Hipólita',
      role: 'Heroína Amazona Ágil (Era II) — Ataques rápidos à distância com Arco Dourado de Ártemis (3.4x vs Míticas).',
    },
    ajax: {
      name: 'Ajax',
      role: 'Herói Bruto de Salamina — Escudo Torre de 7 Camadas e alta resistência frontal (3.5x vs Míticas).',
    },
    theseus: {
      name: 'Teseu',
      role: 'Herói Tático de Atenas (Era II) — Lança Dory equilibrada e Escudo Hoplon contra monstros míticos (3.4x vs Míticas).',
    },
    hero: {
      name: 'Herói Héracles',
      role: 'Campeão Olímpico que causa 3x de dano contra Unidades Míticas.',
    },
    ram: {
      name: 'Aríete (Kriós)',
      role: 'Unidade mecânica de cerco blindada — teto reforçado e cabeça de aríete em bronze para derrubar muralhas e edifícios.',
    },
    siege: {
      name: 'Catapulta (Helepolis)',
      role: 'Máquina de cerco à distância de alta potência contra construções e exércitos agrupados (impacto em área).',
    },
    minotaur: {
      name: 'Minotauro',
      role: 'Monstro de Creta (Atena/Ares) — Chifradas brutais e machado Labrys com impacto em área.',
    },
    centaur: {
      name: 'Centauro',
      role: 'Arqueiro Mítico Veloz (Hermes) — Dispara flechas precisas em movimento.',
    },
    cyclops: {
      name: 'Ciclope',
      role: 'Unidade Mítica Exclusiva de Zeus (Templo) — Dano massivo em área; agarra humanos e os arremessa longe!',
    },
    manticore: {
      name: 'Mantícora',
      role: 'Fera Alada (Apolo/Ártemis) — Lança rajadas de espinhos venenosos em área.',
    },
    medusa: {
      name: 'Medusa',
      role: 'Górgona (Hera/Ártemis) — Flechas petrificantes que congelam inimigos temporariamente.',
    },
    hydra: {
      name: 'Hidra',
      role: 'Serpente Policéfala (Dionísio) — Regeneração contínua e fúria crescente em combate.',
    },
    colossus: {
      name: 'Colosso',
      role: 'Gigante de Bronze (Hefesto) — Armadura titânica, autorreparo e esmagamento de edifícios.',
    },
    nymph: {
      name: 'Ninfa (Dríade)',
      role: 'Espírito da Natureza (Atena/Afrodite) — Ágil com ataque mágico à média distância.',
    },
    pegasus: {
      name: 'Pégaso',
      role: 'Corcel Alado (Hermes) — Batedor voador extremamente veloz com campo de visão ampliado.',
    },
    satyr: {
      name: 'Sátiro',
      role: 'Escaramuçador Silvestre (Dionísio) — Arremessa dardos rápidos com bônus anti-infantaria.',
    },
    automaton: {
      name: 'Autômato',
      role: 'Constructo Mecânico (Hefesto) — Guerreiro de bronze articulado com autorreparo contínuo.',
    },
    iron_dwarf: {
      name: 'Anão de Ferro',
      role: 'Ferreiro Blindado (Hefesto) — Martelo pesado letal contra construções inimigas.',
    },
    phoenix: {
      name: 'Fênix',
      role: 'Ave Imortal de Fogo (Apolo) — Orbes flamejantes com dano em área sobre tropas e estruturas.',
    },
    titan: { name: 'Titã Olímpico' },
    zeus: {
      name: 'Zeus — Rei do Olimpo',
      role: 'Deus Maior (Era V) — Maior entidade do campo de batalha; tempestades de raios supremos em área.',
    },
    poseidon: {
      name: 'Poseidon — Senhor dos Mares',
      role: 'Deus Maior (Era V) — Maior entidade dos oceanos; maremotos e ondas sísmicas com tridente.',
    },
    hades: {
      name: 'Hades — Soberano do Submundo',
      role: 'Deus Maior (Era V) — Maior entidade do Tártaro; chamas espectrais e vórtices necróticos.',
    },
    atena: {
      name: 'Atena — Deusa da Sabedoria',
      role: 'Deusa Menor (Era V) — Maior que os Titãs; lança e Égide sagrada devastadora.',
    },
    ares: {
      name: 'Ares — Deus da Guerra',
      role: 'Deus Menor (Era V) — Maior que os Titãs; golpes sísmicos de guerra total.',
    },
    hermes: {
      name: 'Hermes — Mensageiro Alado',
      role: 'Deus Menor (Era V) — Maior que os Titãs; velocidade divina e relâmpagos em área.',
    },
    apolo: {
      name: 'Apolo — Deus do Sol',
      role: 'Deus Menor (Era V) — Maior que os Titãs; chuva solar de longo alcance.',
    },
    dionisio: {
      name: 'Dionísio — Senhor das Vinhas',
      role: 'Deus Menor (Era V) — Maior que os Titãs; tirso arcano e frenesi mítico.',
    },
    afrodite: {
      name: 'Afrodite — Deusa da Beleza',
      role: 'Deus Menor (Era V) — Maior que os Titãs; magia encantadora em área.',
    },
    hefesto: {
      name: 'Hefesto — Deus da Forja',
      role: 'Deus Menor (Era V) — Maior que os Titãs; martelo vulcânico contra cidades e exércitos.',
    },
    artemis: {
      name: 'Ártemis — Deusa da Caça',
      role: 'Deus Menor (Era V) — Maior que os Titãs; flechas lunares sísmicas de longo alcance.',
    },
  },
  egyptian: {
    villager: {
      name: 'Trabalhador',
      role: 'Unidade civil do Egito — coleta alimentos, madeira e ouro e ergue construções do império.',
    },
    priest: {
      name: 'Sacerdote',
      role: 'Herói do Templo/Centro — cura tropas aliadas próximas, coleta relíquias e causa 3.2x contra Míticas.',
    },
    pharaoh: {
      name: 'Faraó',
      role: 'Herói Único Gratuito — empodera construções (+35% velocidade de produção), coleta relíquias e destrói Míticas (3.6x).',
    },
    son_of_osiris: {
      name: 'Filho de Osíris',
      role: 'Semideus de Osíris (Era IV) — dispara relâmpagos sagrados que saltam em cadeia entre múltiplos inimigos!',
    },
    egypt_spearman: {
      name: 'Lanceiro',
      role: 'Infantaria rápida e econômica do Quartel — especialista letal contra cavalaria inimiga.',
    },
    slinger: {
      name: 'Fundeiro',
      role: 'Atirador ágil de baixo custo do Quartel — excelente para eliminar arqueiros à distância.',
    },
    axeman: {
      name: 'Homem-Machado',
      role: 'Infantaria pesada do Quartel com machado épsilon — devastador contra outras tropas de infantaria.',
    },
    chariot_archer: {
      name: 'Arqueiro de Biga',
      role: 'Fortaleza Migdol (Era III) — arqueiro montado muito veloz contra infantaria (Bônus Rá: +15% HP e +12% Velocidade).',
    },
    camel_rider: {
      name: 'Cavaleiro de Camelo',
      role: 'Fortaleza Migdol (Era III) — cavalaria ágil contra arqueiros e montarias (Bônus Rá: +15% HP e +12% Velocidade).',
    },
    war_elephant: {
      name: 'Elefante de Guerra',
      role: 'Fortaleza Migdol (Era III) — colosso blindado de altíssima resistência, esmaga tropas em área e derruba edifícios.',
    },
    siege_tower: {
      name: 'Torre de Cerco',
      role: 'Oficina de Cerco (Era III) — torre blindada demolidora de muralhas e fortalezas inimigas.',
    },
    egypt_catapult: {
      name: 'Catapulta',
      role: 'Oficina de Cerco (Era III) — artilharia solar de longo alcance devastadora contra construções e grupos lentos.',
    },
    sphinx: {
      name: 'Esfinge (Bast)',
      role: 'Templo (Era II) — criatura terrestre veloz com ataque giratório em área letal contra arqueiros e coletores.',
    },
    wadjet: {
      name: 'Wadjet (Ptá)',
      role: 'Templo (Era II) — serpente sagrada gigante que cospe veneno à distância.',
    },
    roc: {
      name: 'Roca (Hator)',
      role: 'Templo (Era III) — pássaro gigante dos desertos capaz de sobrevoar linhas com alta visão e ataque mergulhante.',
    },
    petsuchos: {
      name: 'Petsuchos (Hator)',
      role: 'Templo (Era III) — crocodilo sagrado que dispara um raio solar concentrado de longo alcance.',
    },
    scarab: {
      name: 'Escaravelho (Sekhmet)',
      role: 'Templo (Era III) — besouro gigante blindado demolidor de edifícios que explode em área ao morrer!',
    },
    avenger: {
      name: 'Vingador (Hórus)',
      role: 'Templo (Era IV) — guerreiro de elite com cabeça de falcão e giro duplo de khopeshes em área.',
    },
    mummy: {
      name: 'Múmia (Osíris)',
      role: 'Templo (Era IV) — conjurador amaldiçoado à distância que abate inimigos com maldições do Duat.',
    },
    ra: {
      name: 'Rá — Avatar Solar Supremo',
      role: 'Deus Maior do Egito (Era V) — Rei do Sol; lança raios solares devastadores em área.',
    },
    isis: {
      name: 'Ísis — Soberana do Nilo',
      role: 'Deusa Maior do Egito (Era V) — Senhora da Magia e da Vida.',
    },
    set: {
      name: 'Set — Senhor das Tempestades',
      role: 'Deus Maior do Egito (Era V) — Deus do Caos e das Tempestades de Areia.',
    },
    titan: {
      name: 'Titã Solar de Hórus',
      role: 'Colosso de ouro e granito de Hórus-Rá invocado pelo Portão do Titã (Era V).',
    },
  },
  norse: {
    villager: { name: 'Coletor Nórdico' },
    hoplite: { name: 'Ulfsark' },
    archer: { name: 'Lançador de Machado' },
    cavalry: { name: 'Jarl Montado' },
    hero: { name: 'Hersir' },
    siege: { name: 'Balista Portátil' },
    minotaur: { name: 'Valquíria' },
    centaur: { name: 'Troll' },
    cyclops: { name: 'Gigante de Gelo' },
    titan: { name: 'Titã de Ymir' },
  },
  atlantean: {
    villager: { name: 'Cidadão Atlante' },
    hoplite: { name: 'Murmillo' },
    archer: { name: 'Arcus' },
    cavalry: { name: 'Contarius' },
    hero: { name: 'Oráculo Herói' },
    siege: { name: 'Sifão de Fogo' },
    minotaur: { name: 'Autômato' },
    centaur: { name: 'Sátiro' },
    cyclops: { name: 'Behemote' },
    titan: { name: 'Titã Atlante' },
  },
  chinese: {
    villager: { name: 'Camponês Chinês' },
    hoplite: { name: 'Alabardeiro' },
    archer: { name: 'Chukonu' },
    cavalry: { name: 'Lanceiro Montado' },
    hero: { name: 'Imortal' },
    siege: { name: 'Canhão de Cerco' },
    minotaur: { name: 'Qilin' },
    centaur: { name: 'Pássaro Vermelho' },
    cyclops: { name: 'Leão de Guerra' },
    titan: { name: 'Dragão Titã' },
  },
  aztec: {
    villager: { name: 'Macehualtin' },
    hoplite: { name: 'Guerreiro Jaguar' },
    archer: { name: 'Atirador Atl-Atl' },
    cavalry: { name: 'Corredor Coiote' },
    hero: { name: 'Sacerdote Solar' },
    siege: { name: 'Catapulta de Obsidiana' },
    minotaur: { name: 'Ahuizotl' },
    centaur: { name: 'Camazotz' },
    cyclops: { name: 'Cipactli' },
    titan: { name: 'Quetzal Titã' },
  },
  roman: {
    villager: { name: 'Plebeu Romano' },
    hoplite: { name: 'Legionário' },
    archer: { name: 'Sagitário' },
    cavalry: { name: 'Eques Romano' },
    hero: { name: 'Centurião' },
    siege: { name: 'Onagro Romano' },
    minotaur: { name: 'Fauno' },
    centaur: { name: 'Águia Solar' },
    cyclops: { name: 'Golem de Mármore' },
    titan: { name: 'Titã Imperial' },
  },
  japanese: {
    villager: { name: 'Aldeão Nipônico' },
    hoplite: { name: 'Samurai Ashigaru' },
    archer: { name: 'Arqueiro Yumi' },
    cavalry: { name: 'Cavaleiro Samurai' },
    hero: { name: 'Mestre Onmyoji' },
    siege: { name: 'Trabuco Oni' },
    minotaur: { name: 'Oni' },
    centaur: { name: 'Tengu' },
    cyclops: { name: 'Gashadokuro' },
    titan: { name: 'Yamata Titã' },
  },
  eldritch: {
    villager: { name: 'Cultista' },
    hoplite: { name: 'Guardião Abissal' },
    archer: { name: 'Lançador do Vazio' },
    cavalry: { name: 'Caçador Dimensional' },
    hero: { name: 'Profeta Cósmico' },
    siege: { name: 'Monólito Bélico' },
    minotaur: { name: 'Deep One' },
    centaur: { name: 'Mi-Go' },
    cyclops: { name: 'Shoggoth' },
    titan: { name: 'Avatar de Cthulhu' },
  },
  celtic: {
    villager: { name: 'Camponês Celta' },
    hoplite: { name: 'Espadachim Gaélico' },
    archer: { name: 'Arqueiro dos Bosques' },
    cavalry: { name: 'Biga Celta' },
    hero: { name: 'Druida Campeão' },
    siege: { name: 'Aríete de Carvalho' },
    minotaur: { name: 'Pooka' },
    centaur: { name: 'Fomori' },
    cyclops: { name: 'Colosso de Pedra' },
    titan: { name: 'Titã de Cernunnos' },
  },
  babylonian: {
    villager: { name: 'Súdito da Babilônia' },
    hoplite: { name: 'Guarda Real' },
    archer: { name: 'Arqueiro Assírio' },
    cavalry: { name: 'Biga de Bronze' },
    hero: { name: 'Herói Gilgamesh' },
    siege: { name: 'Torre de Assalto' },
    minotaur: { name: 'Lamassu' },
    centaur: { name: 'Mushussu' },
    cyclops: { name: 'Colosso de Lápis' },
    titan: { name: 'Titã de Tiamat' },
  },
  lakota: {
    villager: { name: 'Coletor Lakota' },
    hoplite: { name: 'Lanceiro Tokala' },
    archer: { name: 'Arqueiro das Planícies' },
    cavalry: { name: 'Cavaleiro Mustang' },
    hero: { name: 'Chefe Guerreiro' },
    siege: { name: 'Quebra-Forte' },
    minotaur: { name: 'Unktehila' },
    centaur: { name: 'Pássaro Trovão' },
    cyclops: { name: 'Espírito Bisão' },
    titan: { name: 'Titã Wakinyan' },
  },
  jotunn: {
    villager: { name: 'Servo de Jotunheim' },
    hoplite: { name: 'Guerreiro Glacial' },
    archer: { name: 'Atirador de Gelo' },
    cavalry: { name: 'Montador de Lobo' },
    hero: { name: 'Campeão Rúnico' },
    siege: { name: 'Arremessador Glacial' },
    minotaur: { name: 'Troll das Neves' },
    centaur: { name: 'Hrimthurs' },
    cyclops: { name: 'Gigante de Muspel' },
    titan: { name: 'Titã Surtr' },
  },
};

export function getCivUnitSpec(pantheon: PantheonId, kind: UnitKind): UnitStats {
  const base = UNIT_STATS[kind];
  const ov = CIV_UNIT_NAMES[pantheon]?.[kind];
  if (!ov) return base;
  return { ...base, ...ov };
}

export function getCivBuildingSpec(pantheon: PantheonId, kind: BuildingKind): BuildingStats {
  const base = BUILDING_STATS[kind];
  const p = PANTHEONS[pantheon];
  if (kind === 'town_center') {
    return { ...base, name: `Cidadela (${p.name})` };
  }
  if (kind === 'temple') {
    return { ...base, name: `Templo de ${p.deity}` };
  }
  if (pantheon === 'egyptian') {
    if (kind === 'fortress') {
      return {
        ...base,
        name: 'Fortaleza Migdol',
        role: 'Cidadela do Deserto — treina Arqueiro de Biga, Cavaleiro de Camelo e Elefante de Guerra.',
      };
    }
    if (kind === 'barracks') {
      return {
        ...base,
        name: 'Quartel Egípcio',
        role: 'Treina Lanceiro, Fundeiro e Homem-Machado a partir da Era Clássica.',
      };
    }
    if (kind === 'siege_works') {
      return {
        ...base,
        name: 'Oficina de Cerco',
        role: 'Constrói Torre de Cerco e Catapulta (Era Heroica+).',
      };
    }
  }
  return base;
}

export function getCivGodPowerSpec(pantheon: PantheonId, id: GodPowerId): GodPowerSpec {
  const base = GOD_POWERS[id];
  const p = PANTHEONS[pantheon];
  if (p.favoredGodPower === id) {
    return {
      ...base,
      name: `${base.name} (${p.deity})`,
      cooldown: Math.round(base.cooldown * 0.8),
    };
  }
  return base;
}

export function getMajorGodSpec(nameOrId?: string, pantheon?: PantheonId): MajorGodSpec {
  if (nameOrId) {
    const found = MAJOR_GODS.find(
      (g) => g.id.toLowerCase() === nameOrId.toLowerCase() || g.name.toLowerCase() === nameOrId.toLowerCase()
    );
    if (found) return found;
  }
  if (pantheon) {
    const byCiv = MAJOR_GODS.find((g) => g.pantheon === pantheon);
    if (byCiv) return byCiv;
  }
  return MAJOR_GODS[0];
}

export function getMinorGodSpec(id: string): MinorGodSpec {
  return MINOR_GODS[id] ?? MINOR_GODS.Athena;
}

export function getMinorGodChoicesForAge(majorGodName: string, pantheon: PantheonId, age: 2 | 3 | 4): [MinorGodSpec, MinorGodSpec] {
  const mg = getMajorGodSpec(majorGodName, pantheon);
  const [a, b] = mg.minorChoices[age];
  return [getMinorGodSpec(a), getMinorGodSpec(b)];
}

export function getRivalPantheon(playerPantheon: PantheonId, mapId: MapId = 'mediterranean'): PantheonId {
  if (mapId === 'nile' || mapId === 'oasis') return playerPantheon === 'egyptian' ? 'greek' : 'egyptian';
  if (mapId === 'alfheim' || mapId === 'jotunheim') return playerPantheon === 'norse' ? 'jotunn' : 'norse';
  if (mapId === 'yucatan') return playerPantheon === 'aztec' ? 'roman' : 'aztec';
  if (mapId === 'yellow_river') return playerPantheon === 'chinese' ? 'japanese' : 'chinese';
  if (mapId === 'erebus') return playerPantheon === 'eldritch' ? 'greek' : 'eldritch';
  const defaultRival: Record<PantheonId, PantheonId> = {
    greek: 'egyptian',
    egyptian: 'norse',
    norse: 'atlantean',
    atlantean: 'greek',
    chinese: 'japanese',
    aztec: 'roman',
    roman: 'celtic',
    japanese: 'chinese',
    eldritch: 'babylonian',
    celtic: 'norse',
    babylonian: 'egyptian',
    lakota: 'aztec',
    jotunn: 'norse',
  };
  return defaultRival[playerPantheon];
}
