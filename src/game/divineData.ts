import { getXmbNumber, XMB_GOD_POWERS } from '../god powers';
import {
  AgeLevel,
  BUILDING_STATS,
  BuildingKind,
  BuildingStats,
  CIVILIZATION_UNITS,
  GodPowerId,
  GodPowerSpec,
  MajorGodSpec,
  MapId,
  MinorGodSpec,
  PANTHEONS,
  PantheonId,
  ResourceCost,
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
    secondaryBuildings: ['storehouse', 'lumber_camp', 'economic_guild', 'village_center'],
    cost: { food: 100, gold: 50 },
    researchTime: 10,
    category: 'economy',
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'Picareta',
    description: '+20% na velocidade de mineração de Ouro pelos aldeões.',
    minAge: 1,
    building: 'town_center',
    secondaryBuildings: ['storehouse', 'mining_camp', 'economic_guild', 'village_center'],
    cost: { food: 100, wood: 50 },
    researchTime: 10,
    category: 'economy',
  },
  plow: {
    id: 'plow',
    name: 'Arado',
    description: '+20% na coleta de Alimento (arbustos, caça e fazendas).',
    minAge: 2,
    building: 'town_center',
    secondaryBuildings: ['granary', 'economic_guild', 'village_center'],
    cost: { wood: 75, gold: 100 },
    researchTime: 11,
    category: 'economy',
  },
  // ── 11 TECNOLOGIAS PADRÃO DO ARSENAL (ARMORY) ──
  copper_weapons: {
    id: 'copper_weapons',
    name: 'Armas de Cobre',
    description: '+10% de ataque para soldados humanos, heróis, navios e construções defensivas.',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['barracks', 'fortress'],
    cost: { food: 120, gold: 120 },
    researchTime: 12,
    category: 'armory_weapon',
  },
  bronze_weapons: {
    id: 'bronze_weapons',
    name: 'Armas de Bronze',
    description: '+10% de ataque adicional para soldados humanos, heróis, navios e construções defensivas (acumulativo).',
    minAge: 3,
    building: 'armory',
    secondaryBuildings: ['barracks', 'fortress'],
    cost: { food: 220, gold: 220 },
    researchTime: 14,
    requires: 'copper_weapons',
    category: 'armory_weapon',
  },
  iron_weapons: {
    id: 'iron_weapons',
    name: 'Armas de Ferro',
    description: '+10% de ataque adicional para soldados humanos, heróis, navios e construções defensivas (acumulativo).',
    minAge: 4,
    building: 'armory',
    secondaryBuildings: ['fortress'],
    cost: { food: 360, gold: 360 },
    researchTime: 16,
    requires: 'bronze_weapons',
    category: 'armory_weapon',
  },
  copper_mail: {
    id: 'copper_mail',
    name: 'Armadura de Cobre',
    description: 'Reduz a vulnerabilidade a corte em -10% (humanos/navios) e -15% (heróis); -10% vulnerabilidade a esmagamento para navios.',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['barracks', 'fortress'],
    cost: { food: 110, gold: 130 },
    researchTime: 12,
    category: 'armory_armor',
  },
  bronze_mail: {
    id: 'bronze_mail',
    name: 'Armadura de Bronze',
    description: 'Reduz a vulnerabilidade a corte em -10% (humanos/navios) e -15% (heróis); acumulativo com Armadura de Cobre.',
    minAge: 3,
    building: 'armory',
    secondaryBuildings: ['barracks', 'fortress'],
    cost: { food: 210, gold: 240 },
    researchTime: 14,
    requires: 'copper_mail',
    category: 'armory_armor',
  },
  iron_mail: {
    id: 'iron_mail',
    name: 'Armadura de Ferro',
    description: 'Reduz a vulnerabilidade a corte em -10% (humanos/navios) e -15% (heróis); acumulativo com Armadura de Bronze.',
    minAge: 4,
    building: 'armory',
    secondaryBuildings: ['fortress'],
    cost: { food: 350, gold: 390 },
    researchTime: 16,
    requires: 'bronze_mail',
    category: 'armory_armor',
  },
  copper_shields: {
    id: 'copper_shields',
    name: 'Escudos de Cobre',
    description: 'Reduz a vulnerabilidade a perfuração (flechas) em -10% (humanos/navios) e -15% (heróis).',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['barracks', 'fortress'],
    cost: { wood: 110, gold: 130 },
    researchTime: 12,
    category: 'armory_shield',
  },
  bronze_shields: {
    id: 'bronze_shields',
    name: 'Escudos de Bronze',
    description: 'Reduz a vulnerabilidade a perfuração em -10% (humanos/navios) e -15% (heróis); acumulativo com Escudos de Cobre.',
    minAge: 3,
    building: 'armory',
    secondaryBuildings: ['barracks', 'fortress'],
    cost: { wood: 210, gold: 240 },
    researchTime: 14,
    requires: 'copper_shields',
    category: 'armory_shield',
  },
  iron_shields: {
    id: 'iron_shields',
    name: 'Escudos de Ferro',
    description: 'Reduz a vulnerabilidade a perfuração em -10% (humanos/navios) e -15% (heróis); acumulativo com Escudos de Bronze.',
    minAge: 4,
    building: 'armory',
    secondaryBuildings: ['fortress'],
    cost: { wood: 350, gold: 390 },
    researchTime: 16,
    requires: 'bronze_shields',
    category: 'armory_shield',
  },
  ballistics: {
    id: 'ballistics',
    name: 'Balística',
    description: 'Aumenta a precisão e velocidade de unidades à distância, navios e construções contra alvos em movimento.',
    minAge: 3,
    building: 'armory',
    secondaryBuildings: ['fortress', 'tower'],
    cost: { wood: 200, gold: 200 },
    researchTime: 14,
    category: 'armory_utility',
  },
  burning_pitch: {
    id: 'burning_pitch',
    name: 'Piche Flamejante',
    description: 'Unidades à distância causam 3x de dano contra construções e 1,5x contra navios; defesas e navios arqueiros ganham +15% de ataque.',
    minAge: 4,
    building: 'armory',
    secondaryBuildings: ['fortress', 'tower', 'asgard_hill_fort'],
    cost: { wood: 240, gold: 220 },
    researchTime: 15,
    category: 'armory_utility',
  },
  // ── 9 TECNOLOGIAS MÍTICAS DO ARSENAL GREGO (DEUSES MENORES) ──
  phobos_spear_of_horror: {
    id: 'phobos_spear_of_horror',
    name: 'Lança de Horror de Fobos',
    description: 'Ares (Clássica): Aumenta em +20% o ataque dos Hoplitas com lanças aterrorizantes.',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['barracks'],
    cost: { food: 125, favor: 12 },
    researchTime: 12,
    requiresMinorGod: ['Ares'],
    requiresMinorGodLabel: 'Ares',
    pantheons: ['greek'],
    category: 'mythic',
  },
  deimos_sword_of_dread: {
    id: 'deimos_sword_of_dread',
    name: 'Espada do Pavor de Deimos',
    description: 'Ares (Clássica): Aumenta em +20% o ataque dos Hipaspistas e reforça seu dano contra infantaria.',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['barracks'],
    cost: { food: 125, favor: 12 },
    researchTime: 12,
    requiresMinorGod: ['Ares'],
    requiresMinorGodLabel: 'Ares',
    pantheons: ['greek'],
    category: 'mythic',
  },
  enyo_bow_of_horror: {
    id: 'enyo_bow_of_horror',
    name: 'Arco do Horror de Ênio',
    description: 'Ares (Clássica): Aumenta em +20% o ataque dos arqueiros Toxotes.',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['archery_range'],
    cost: { wood: 125, favor: 12 },
    researchTime: 12,
    requiresMinorGod: ['Ares'],
    requiresMinorGodLabel: 'Ares',
    pantheons: ['greek'],
    category: 'mythic',
  },
  sarissa: {
    id: 'sarissa',
    name: 'Sarissa',
    description: 'Atena (Clássica): Aumenta o alcance (+0.9), o dano corpo a corpo (+12%) e reduz em -10% a vulnerabilidade a corte dos Hoplitas.',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['barracks'],
    cost: { wood: 120, favor: 12 },
    researchTime: 12,
    requiresMinorGod: ['Athena'],
    requiresMinorGodLabel: 'Atena',
    pantheons: ['greek'],
    category: 'mythic',
  },
  aegis_shield: {
    id: 'aegis_shield',
    name: 'Escudo Égide',
    description: 'Atena (Clássica): Reduz em -20% a vulnerabilidade da infantaria grega contra ataques de perfuração (flechas).',
    minAge: 2,
    building: 'armory',
    secondaryBuildings: ['barracks'],
    cost: { gold: 135, favor: 14 },
    researchTime: 12,
    requiresMinorGod: ['Athena'],
    requiresMinorGodLabel: 'Atena',
    pantheons: ['greek'],
    category: 'mythic',
  },
  sun_ray: {
    id: 'sun_ray',
    name: 'Raio de Sol',
    description: 'Apolo (Heroica): Aumenta em +20% o ataque de arqueiros, Centauros e Mantícoras.',
    minAge: 3,
    building: 'armory',
    secondaryBuildings: ['archery_range', 'temple'],
    cost: { wood: 180, favor: 18 },
    researchTime: 14,
    requiresMinorGod: ['Apollo'],
    requiresMinorGodLabel: 'Apolo',
    pantheons: ['greek'],
    category: 'mythic',
  },
  shafts_of_plague: {
    id: 'shafts_of_plague',
    name: 'Flechas da Praga',
    description: 'Ártemis (Mítica): +15% de dano aos arqueiros e adiciona veneno contínuo nos alvos atingidos.',
    minAge: 4,
    building: 'armory',
    secondaryBuildings: ['archery_range'],
    cost: { wood: 240, favor: 24 },
    researchTime: 15,
    requiresMinorGod: ['Artemis'],
    requiresMinorGodLabel: 'Ártemis',
    pantheons: ['greek'],
    category: 'mythic',
  },
  forge_of_olympus: {
    id: 'forge_of_olympus',
    name: 'Forja do Olimpo',
    description: 'Hefesto (Mítica): Reduz em 75% o custo de recursos das tecnologias do Arsenal e dobra a velocidade de pesquisa delas.',
    minAge: 4,
    building: 'armory',
    cost: { gold: 250, favor: 22 },
    researchTime: 13,
    requiresMinorGod: ['Hephaestus'],
    requiresMinorGodLabel: 'Hefesto',
    pantheons: ['greek'],
    category: 'mythic',
  },
  olympian_weapons: {
    id: 'olympian_weapons',
    name: 'Armas Olímpicas',
    description: 'Hefesto (Mítica): +20% de ataque para Mirmidão, Hetairoi (Hippikon) e Gastrafetes e +40% de bônus contra Unidades Míticas.',
    minAge: 4,
    building: 'armory',
    secondaryBuildings: ['fortress'],
    cost: { food: 220, gold: 220, favor: 25 },
    researchTime: 15,
    requiresMinorGod: ['Hephaestus'],
    requiresMinorGodLabel: 'Hefesto',
    pantheons: ['greek'],
    category: 'mythic',
  },
  // ── MELHORIAS GERAIS DE QUARTEL, CERCO E TEMPLO ──
  medium_soldiers: {
    id: 'medium_soldiers',
    name: 'Soldados Médios',
    description: '+15% de Vida Máxima e +10% de ataque para Infantaria, Arqueiros e Cavalaria.',
    minAge: 2,
    building: 'barracks',
    secondaryBuildings: ['great_hall', 'counter_barracks', 'archery_range', 'stable'],
    cost: { food: 150, gold: 150 },
    researchTime: 12,
    category: 'military',
  },
  heavy_soldiers: {
    id: 'heavy_soldiers',
    name: 'Soldados Pesados',
    description: '+15% de Vida e +12% de ataque para soldados humanos.',
    minAge: 3,
    building: 'barracks',
    secondaryBuildings: ['great_hall', 'counter_barracks', 'archery_range', 'stable'],
    cost: { food: 260, gold: 260 },
    researchTime: 14,
    requires: 'medium_soldiers',
    category: 'military',
  },
  champion_soldiers: {
    id: 'champion_soldiers',
    name: 'Soldados Campeões',
    description: '+20% de Vida e +15% de ataque para soldados humanos de elite.',
    minAge: 4,
    building: 'barracks',
    secondaryBuildings: ['great_hall', 'counter_barracks', 'archery_range', 'stable'],
    cost: { food: 420, gold: 420 },
    researchTime: 16,
    requires: 'heavy_soldiers',
    category: 'military',
  },
  watch_tower: {
    id: 'watch_tower',
    name: 'Torres Fortificadas',
    description: '+35% de Vida e +30% de ataque para Torres e Fortalezas.',
    minAge: 2,
    building: 'town_center',
    secondaryBuildings: ['tower', 'fortress', 'asgard_hill_fort', 'village_center'],
    cost: { wood: 180, gold: 120 },
    researchTime: 12,
    category: 'military',
  },
  engineers: {
    id: 'engineers',
    name: 'Engenheiros de Cerco',
    description: '+30% de Vida e +20% de dano contra construções para Armas de Cerco e Heróis.',
    minAge: 4,
    building: 'fortress',
    secondaryBuildings: ['siege_works', 'asgard_hill_fort'],
    cost: { wood: 300, gold: 320 },
    researchTime: 15,
    category: 'military',
  },
  omniscience: {
    id: 'omniscience',
    name: 'Devoção Mítica',
    description: '+20% de Vida e +15% de ataque para todas as Unidades Míticas.',
    minAge: 2,
    building: 'temple',
    cost: { gold: 150, favor: 15 },
    researchTime: 12,
    category: 'temple',
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
    category: 'temple',
  },
  secrets_of_titans: {
    id: 'secrets_of_titans',
    name: 'Era V: Despertar dos Deuses',
    description: 'Avança para a Era V (Era dos Deuses), habilitando a convocação de Deuses Maiores e Menores no Templo e o Portão do Titã.',
    minAge: 4,
    building: 'temple',
    cost: { food: 1200, wood: 800, gold: 1200, favor: 60 },
    researchTime: 24,
    category: 'temple',
  },
  // ── TECNOLOGIAS DE FAVOR DIVINO POR CIVILIZAÇÃO ──
  golden_apples: {
    id: 'golden_apples',
    name: 'Maçãs de Ouro',
    description: 'Afrodite (Heroica): Aumenta em +20% a taxa de geração de Favor Divino dos Aldeões orando nos Templos.',
    minAge: 3,
    building: 'temple',
    cost: { food: 180, favor: 10 },
    researchTime: 12,
    requiresMinorGod: ['Aphrodite'],
    requiresMinorGodLabel: 'Afrodite',
    pantheons: ['greek'],
    category: 'temple',
  },
  necropolis: {
    id: 'necropolis',
    name: 'Necrópole',
    description: 'Anúbis (Clássica): Aumenta em +25% a geração de Favor Divino de todos os Monumentos Egípcios.',
    minAge: 2,
    building: 'temple',
    cost: { wood: 140, gold: 140 },
    researchTime: 12,
    requiresMinorGod: ['Anubis'],
    requiresMinorGodLabel: 'Anúbis',
    pantheons: ['egyptian'],
    category: 'temple',
  },
  hammer_of_the_gods: {
    id: 'hammer_of_the_gods',
    name: 'Martelo dos Deuses',
    description: 'Thor (Era Arcaica): Faz com que os heróis Hersir gerem Favor Divino automaticamente (+0,48/s), mesmo fora de combate.',
    minAge: 1,
    building: 'temple',
    secondaryBuildings: ['town_center', 'great_hall'],
    cost: { food: 100, gold: 80 },
    researchTime: 10,
    requiresMajorGod: ['Thor'],
    requiresMajorGodLabel: 'Thor',
    pantheons: ['norse'],
    category: 'temple',
  },
  perception: {
    id: 'perception',
    name: 'Percepção',
    description: 'Leto (Clássica): Amplia o alcance de visão dos Oráculos (+4 LOS) e aumenta em +15% a geração de Favor.',
    minAge: 2,
    building: 'temple',
    cost: { food: 120, gold: 90 },
    researchTime: 11,
    requiresMinorGod: ['Leto'],
    requiresMinorGodLabel: 'Leto',
    pantheons: ['atlantean'],
    category: 'temple',
  },
  horns_of_consecration: {
    id: 'horns_of_consecration',
    name: 'Chifres da Consagração',
    description: 'Réia (Heroica): Aumenta em +25% a taxa de geração de Favor Divino dos Oráculos Atlantes.',
    minAge: 3,
    building: 'temple',
    cost: { wood: 180, gold: 160 },
    researchTime: 13,
    requiresMinorGod: ['Rheia'],
    requiresMinorGodLabel: 'Réia',
    pantheons: ['atlantean'],
    category: 'temple',
  },
};

export function getEffectiveTechCost(spec: TechSpec, researchedTechs: TechId[]): ResourceCost {
  if (spec.building === 'armory' && spec.id !== 'forge_of_olympus' && researchedTechs.includes('forge_of_olympus')) {
    return {
      food: spec.cost.food ? Math.max(1, Math.round(spec.cost.food * 0.25)) : undefined,
      wood: spec.cost.wood ? Math.max(1, Math.round(spec.cost.wood * 0.25)) : undefined,
      gold: spec.cost.gold ? Math.max(1, Math.round(spec.cost.gold * 0.25)) : undefined,
      favor: spec.cost.favor ? Math.max(1, Math.round(spec.cost.favor * 0.25)) : undefined,
    };
  }
  return spec.cost;
}

export function getEffectiveTechTime(spec: TechSpec, researchedTechs: TechId[]): number {
  if (spec.building === 'armory' && spec.id !== 'forge_of_olympus' && researchedTechs.includes('forge_of_olympus')) {
    return Math.max(2, Number((spec.researchTime * 0.5).toFixed(1)));
  }
  return spec.researchTime;
}

export const MINOR_GODS: Record<string, MinorGodSpec> = {
  // Greek
  Athena: { id: 'Athena', name: 'Atena', age: 2, pantheon: 'greek', godPower: 'restoration', mythUnit: 'minotaur', mythUnitTitle: 'Minotauro / Ninfa (Dríade)', passiveBonusLabel: '+15% Armadura de Infantaria', hpBonusPct: 12 },
  Ares: { id: 'Ares', name: 'Ares', age: 2, pantheon: 'greek', godPower: 'pestilence', mythUnit: 'minotaur', mythUnitTitle: 'Minotauro / Ciclope', passiveBonusLabel: '+14% Ataque Corpo a Corpo', attackBonusPct: 14 },
  Hermes: { id: 'Hermes', name: 'Hermes', age: 2, pantheon: 'greek', godPower: 'prosperity', mythUnit: 'centaur', mythUnitTitle: 'Centauro / Pégaso', passiveBonusLabel: '+15% Velocidade da Cavalaria', speedBonusPct: 15 },
  Apollo: { id: 'Apollo', name: 'Apolo', age: 3, pantheon: 'greek', godPower: 'solar_beam', mythUnit: 'manticore', mythUnitTitle: 'Mantícora / Fênix', passiveBonusLabel: '+15% Alcance & Dano à Distância · Desbloqueia Gastraphetes', attackBonusPct: 12 },
  Dionysos: { id: 'Dionysos', name: 'Dionísio', age: 3, pantheon: 'greek', godPower: 'walking_woods', mythUnit: 'hydra', mythUnitTitle: 'Hidra / Sátiro', passiveBonusLabel: '+18% Vida da Cavalaria', hpBonusPct: 15 },
  Aphrodite: { id: 'Aphrodite', name: 'Afrodite', age: 3, pantheon: 'greek', godPower: 'prosperity', mythUnit: 'nymph', mythUnitTitle: 'Ninfa (Dríade) / Minotauro', passiveBonusLabel: '+20% Coleta · Maçãs de Ouro (+20% Favor)', gatherBonusPct: 20 },
  Hephaestus: { id: 'Hephaestus', name: 'Hefesto', age: 4, pantheon: 'greek', godPower: 'volcanic_eruption', mythUnit: 'colossus', mythUnitTitle: 'Colosso / Autômato / Anão de Ferro', passiveBonusLabel: '+20% Ataque & Armadura', attackBonusPct: 18, hpBonusPct: 12 },
  Hera: { id: 'Hera', name: 'Hera', age: 4, pantheon: 'greek', godPower: 'lightning_storm', mythUnit: 'medusa', mythUnitTitle: 'Medusa / Ciclope', passiveBonusLabel: '+25% Vida Mítica', hpBonusPct: 22 },
  Artemis: { id: 'Artemis', name: 'Ártemis', age: 4, pantheon: 'greek', godPower: 'tremor', mythUnit: 'medusa', mythUnitTitle: 'Medusa / Mantícora', passiveBonusLabel: '+20% Dano Arqueiros & Cerco', attackBonusPct: 18 },

  // Egyptian
  Bast: { id: 'Bast', name: 'Bast', age: 2, pantheon: 'egyptian', godPower: 'darkest_night', mythUnit: 'sphinx', mythUnitTitle: 'Esfinge', passiveBonusLabel: '+18% Coleta de Ouro & Alimento', gatherBonusPct: 18 },
  Ptah: { id: 'Ptah', name: 'Ptá', age: 2, pantheon: 'egyptian', godPower: 'sandstorm', mythUnit: 'wadjet', mythUnitTitle: 'Wadjet', passiveBonusLabel: '+15% HP de Construções', hpBonusPct: 12 },
  Anubis: { id: 'Anubis', name: 'Anúbis', age: 2, pantheon: 'egyptian', godPower: 'disease', mythUnit: 'sphinx', mythUnitTitle: 'Anubita / Esfinge', passiveBonusLabel: '+16% Ataque Mítico · Necrópole (+25% Favor)', attackBonusPct: 16 },
  Hathor: { id: 'Hathor', name: 'Hator', age: 3, pantheon: 'egyptian', godPower: 'locust_swarm', mythUnit: 'petsuchos', mythUnitTitle: 'Roca & Petsuchos', passiveBonusLabel: '+15% HP Geral · Libera Roca & Petsuchos', hpBonusPct: 15 },
  Nephthys: { id: 'Nephthys', name: 'Néftis', age: 3, pantheon: 'egyptian', godPower: 'necromancy', mythUnit: 'petsuchos', mythUnitTitle: 'Escorpião Gigante', passiveBonusLabel: '+20% Regeneração & Favor', hpBonusPct: 14 },
  Sekhmet: { id: 'Sekhmet', name: 'Sekhmet', age: 3, pantheon: 'egyptian', godPower: 'undermine', mythUnit: 'scarab', mythUnitTitle: 'Escaravelho', passiveBonusLabel: '+18% Ataque de Cerco & Funda', attackBonusPct: 18 },
  Horus: { id: 'Horus', name: 'Hórus', age: 4, pantheon: 'egyptian', godPower: 'tornado', mythUnit: 'avenger', mythUnitTitle: 'Vingador', passiveBonusLabel: '+22% Ataque da Infantaria', attackBonusPct: 20 },
  Osiris: { id: 'Osiris', name: 'Osíris', age: 4, pantheon: 'egyptian', godPower: 'lightning_storm', mythUnit: 'mummy', mythUnitTitle: 'Múmia & Filho de Osíris', passiveBonusLabel: '+20% Coleta & Favor · Desbloqueia Filho de Osíris', gatherBonusPct: 20 },
  Thoth: { id: 'Thoth', name: 'Thoth', age: 4, pantheon: 'egyptian', godPower: 'meteor', mythUnit: 'phoenix', mythUnitTitle: 'Fênix / Elefante', passiveBonusLabel: '+20% Dano Mítico & Heróis', attackBonusPct: 20 },

  // Norse
  Forseti: { id: 'Forseti', name: 'Forseti', age: 2, pantheon: 'norse', godPower: 'healing', mythUnit: 'troll', mythUnitTitle: 'Troll', passiveBonusLabel: '+14% Velocidade & Vida Ulfsark', speedBonusPct: 14 },
  Freyja: { id: 'Freyja', name: 'Freyja', age: 2, pantheon: 'norse', godPower: 'walking_woods', mythUnit: 'valkyrie', mythUnitTitle: 'Valquíria', passiveBonusLabel: '+15% Vida Cavalaria & Valquírias', hpBonusPct: 15 },
  Heimdall: { id: 'Heimdall', name: 'Heimdall', age: 2, pantheon: 'norse', godPower: 'undermine', mythUnit: 'einherjar', mythUnitTitle: 'Einherjar', passiveBonusLabel: '+18% Dano vs Construções', attackBonusPct: 14 },
  Skadi: { id: 'Skadi', name: 'Skadi', age: 3, pantheon: 'norse', godPower: 'frost', mythUnit: 'frost_giant', mythUnitTitle: 'Gigante de Gelo', passiveBonusLabel: '+18% Coleta de Caça & Fazendas', gatherBonusPct: 18 },
  Bragi: { id: 'Bragi', name: 'Bragi', age: 3, pantheon: 'norse', godPower: 'flaming_weapons', mythUnit: 'battle_boar', mythUnitTitle: 'Javali de Batalha (Gullinbursti)', passiveBonusLabel: '+16% Ataque Ulfsark · +1 Favor por morte Berserker', attackBonusPct: 16 },
  Njord: { id: 'Njord', name: 'Njord', age: 3, pantheon: 'norse', godPower: 'walking_woods', mythUnit: 'mountain_giant', mythUnitTitle: 'Gigante da Montanha & Kraken', passiveBonusLabel: '+18% HP Mítico · Libera Gigante da Montanha & Kraken', hpBonusPct: 18 },
  Aegir: { id: 'Aegir', name: 'Aegir', age: 3, pantheon: 'norse', godPower: 'tremor', mythUnit: 'rock_troll', mythUnitTitle: 'Troll da Rocha', passiveBonusLabel: '+18% Armadura & Resistência a Projéteis (Retold)', hpBonusPct: 18 },
  Baldr: { id: 'Baldr', name: 'Baldr', age: 4, pantheon: 'norse', godPower: 'meteor', mythUnit: 'fire_giant', mythUnitTitle: 'Gigante de Fogo', passiveBonusLabel: '+20% Ataque & Cerco', attackBonusPct: 20 },
  Tyr: { id: 'Tyr', name: 'Tyr', age: 4, pantheon: 'norse', godPower: 'blizzard', mythUnit: 'fenris_wolf', mythUnitTitle: 'Cria de Fenris (Lobo Fenris)', passiveBonusLabel: '+22% Vida & Fúria Nórdica', hpBonusPct: 20 },
  Hel: { id: 'Hel', name: 'Hel', age: 4, pantheon: 'norse', godPower: 'tornado', mythUnit: 'nidhogg', mythUnitTitle: 'Nidhogg & Os 3 Gigantes (Fogo, Gelo e Montanha)', passiveBonusLabel: '+25% Poder Mítico · Libera Nidhogg, Jormungand e todos os Gigantes', attackBonusPct: 22 },
  Vidar: { id: 'Vidar', name: 'Vidar', age: 4, pantheon: 'norse', godPower: 'volcanic_eruption', mythUnit: 'fafnir', mythUnitTitle: 'Fafnir (Dragão Couraçado)', passiveBonusLabel: '+22% Ataque de Infantaria & Heróis (Retold)', attackBonusPct: 22 },

  // Atlantean
  Prometheus: { id: 'Prometheus', name: 'Prometeu', age: 2, pantheon: 'atlantean', godPower: 'necromancy', mythUnit: 'promethean', mythUnitTitle: 'Prometeico', passiveBonusLabel: '+14% Vida dos Heróis', hpBonusPct: 14 },
  Okeanus: { id: 'Okeanus', name: 'Oceano', age: 2, pantheon: 'atlantean', godPower: 'restoration', mythUnit: 'caladria', mythUnitTitle: 'Caládria & Carnívora', passiveBonusLabel: '+14% Velocidade & Coleta', speedBonusPct: 12, gatherBonusPct: 12 },
  Leto: { id: 'Leto', name: 'Leto', age: 2, pantheon: 'atlantean', godPower: 'spiders', mythUnit: 'automaton', mythUnitTitle: 'Autômato', passiveBonusLabel: '+14% Armadura Autômato · Percepção (Oráculo)', hpBonusPct: 14 },
  Hyperion: { id: 'Hyperion', name: 'Hipérion', age: 3, pantheon: 'atlantean', godPower: 'chaos', mythUnit: 'satyr', mythUnitTitle: 'Sátiro', passiveBonusLabel: '+18% Ataque Heroico · Promoção Gratuita p/ Herói', attackBonusPct: 18 },
  Theia: { id: 'Theia', name: 'Teia', age: 3, pantheon: 'atlantean', godPower: 'walking_woods', mythUnit: 'stymphalian_bird', mythUnitTitle: 'Ave do Estínfalo & Dríade', passiveBonusLabel: '+18% Vel. Cavalaria · +10% Favor (Oráculo Visão Total)', speedBonusPct: 18 },
  Rheia: { id: 'Rheia', name: 'Réia', age: 3, pantheon: 'atlantean', godPower: 'traitors', mythUnit: 'behemoth', mythUnitTitle: 'Beemote', passiveBonusLabel: '+20% Coleta · Chifres (+25% Favor Oráculo)', gatherBonusPct: 20 },
  Helios: { id: 'Helios', name: 'Hélios', age: 4, pantheon: 'atlantean', godPower: 'solar_beam', mythUnit: 'hekagigantes', mythUnitTitle: 'Hecatônquiro (Centimano)', passiveBonusLabel: '+22% Ataque de Cerco', attackBonusPct: 22 },
  Hekate: { id: 'Hekate', name: 'Hécate', age: 4, pantheon: 'atlantean', godPower: 'black_hole', mythUnit: 'lampades', mythUnitTitle: 'Lâmpade & Cria do Tártaro', passiveBonusLabel: '+22% Recarga & Poder Mítico', hpBonusPct: 20 },
  Atlas: { id: 'Atlas', name: 'Atlas', age: 4, pantheon: 'atlantean', godPower: 'tremor', mythUnit: 'argus', mythUnitTitle: 'Argos', passiveBonusLabel: '+25% Vida Mítica', hpBonusPct: 25 },

  // Chinese (Immortal Pillars)
  Chiyou: { id: 'Chiyou', name: 'Chiyou', age: 2, pantheon: 'chinese', godPower: 'flaming_weapons', mythUnit: 'qilin', mythUnitTitle: 'Qilin Sagrado / Taotie', passiveBonusLabel: '+16% Ataque de Infantaria e Cavalaria', attackBonusPct: 16 },
  Xuannu: { id: 'Xuannu', name: 'Xuannü', age: 2, pantheon: 'chinese', godPower: 'restoration', mythUnit: 'yazi', mythUnitTitle: 'Yazi / Qilin', passiveBonusLabel: '+16% Velocidade & Visão Tática', speedBonusPct: 14, hpBonusPct: 10 },
  Houtu: { id: 'Houtu', name: 'Houtu', age: 3, pantheon: 'chinese', godPower: 'walking_woods', mythUnit: 'taotie', mythUnitTitle: 'Taotie Devorador', passiveBonusLabel: '+20% Coleta & Armadura de Edifícios', gatherBonusPct: 20, hpBonusPct: 12 },
  Gonggong: { id: 'Gonggong', name: 'Gonggong', age: 3, pantheon: 'chinese', godPower: 'maelstrom', mythUnit: 'yazi', mythUnitTitle: 'Yazi / Poder das Águas', passiveBonusLabel: '+18% Dano Naval & Velocidade', attackBonusPct: 15, speedBonusPct: 10 },
  Huangdi: { id: 'Huangdi', name: 'Huangdi', age: 4, pantheon: 'chinese', godPower: 'solar_beam', mythUnit: 'azure_dragon', mythUnitTitle: 'Dragão Azul (Qinglong)', passiveBonusLabel: '+22% Dano Heroico & Chu-Ko-Nu', attackBonusPct: 22 },
  Zhurong: { id: 'Zhurong', name: 'Zhurong', age: 4, pantheon: 'chinese', godPower: 'meteor', mythUnit: 'azure_dragon', mythUnitTitle: 'Dragão Azul & Lança-Fogo', passiveBonusLabel: '+24% Ataque de Cerco & Míticos', attackBonusPct: 24, hpBonusPct: 14 },

  // Shared Divine Edition Minor Gods for Expanded Civs
  Divine_War2: { id: 'Divine_War2', name: 'Senhor da Guerra', age: 2, pantheon: 'roman', godPower: 'flaming_weapons', mythUnit: 'minotaur', mythUnitTitle: 'Guardião Mítico', passiveBonusLabel: '+15% Ataque Militar', attackBonusPct: 15 },
  Divine_Eco2: { id: 'Divine_Eco2', name: 'Divindade da Colheita', age: 2, pantheon: 'chinese', godPower: 'rain', mythUnit: 'minotaur', mythUnitTitle: 'Espírito Protetor', passiveBonusLabel: '+18% Velocidade de Coleta', gatherBonusPct: 18 },
  Divine_Storm3: { id: 'Divine_Storm3', name: 'Divindade da Tempestade', age: 3, pantheon: 'japanese', godPower: 'tornado', mythUnit: 'centaur', mythUnitTitle: 'Sentinela Alada', passiveBonusLabel: '+16% Velocidade & Ataque', speedBonusPct: 12, attackBonusPct: 12 },
  Divine_Shadow3: { id: 'Divine_Shadow3', name: 'Divindade do Crepúsculo', age: 3, pantheon: 'eldritch', godPower: 'chaos', mythUnit: 'centaur', mythUnitTitle: 'Arauto Sombrio', passiveBonusLabel: '+20% Poder Mítico', hpBonusPct: 18 },
  Divine_Apocalypse4: { id: 'Divine_Apocalypse4', name: 'Soberano do Apocalipse', age: 4, pantheon: 'aztec', godPower: 'meteor', mythUnit: 'cyclops', mythUnitTitle: 'Colosso Ancestral', passiveBonusLabel: '+22% Dano em Geral', attackBonusPct: 22 },
  Divine_Abyss4: { id: 'Divine_Abyss4', name: 'Arauto do Abismo', age: 4, pantheon: 'eldritch', godPower: 'lightning_storm', mythUnit: 'cyclops', mythUnitTitle: 'Avatar Cósmico', passiveBonusLabel: '+25% Vida & Favor', hpBonusPct: 25 },
};

export const MAJOR_GODS: MajorGodSpec[] = [
  // ── DISPONÍVEIS: GREGO ──
  {
    id: 'Zeus',
    name: 'Zeus',
    title: 'Rei do Olimpo',
    pantheon: 'greek',
    focus: 'Infantaria e Favor acelerado',
    favoredPower: 'lightning',
    powerDescription: 'Fulmina alvos estratégicos com o Raio de Zeus, gera Favor mais rápido e fortalece Hoplitas e Mirmidões.',
    lore: 'Soberano dos céus e pai dos deuses olímpicos. Seus seguidores marcham com infantaria disciplinada, heróis lendários e o poder fulminante do trovão.',
    minorChoices: { 2: ['Athena', 'Hermes'], 3: ['Apollo', 'Dionysos'], 4: ['Hephaestus', 'Hera'] },
  },
  {
    id: 'Poseidon',
    name: 'Poseidon',
    title: 'Deus dos Mares',
    pantheon: 'greek',
    focus: 'Cavalaria rápida e domínio territorial',
    favoredPower: 'tremor',
    powerDescription: 'Invoca ondas sísmicas que abalam muralhas, reduz o custo de estábulos e acelera a cavalaria helênica.',
    lore: 'Senhor dos oceanos, dos terremotos e dos corcéis. Domina vastas rotas com cargas rápidas de Hippikons, frotas e bestas marinhas.',
    minorChoices: { 2: ['Ares', 'Hermes'], 3: ['Aphrodite', 'Dionysos'], 4: ['Artemis', 'Hephaestus'] },
  },
  {
    id: 'Hades',
    name: 'Hades',
    title: 'Senhor do Submundo',
    pantheon: 'greek',
    focus: 'Arqueiros precisos e Sentinelas de argila',
    favoredPower: 'sentinel',
    powerDescription: 'Ergue Sentinelas protetoras ao redor de sua base, amplia a resistência das construções e torna arqueiros ainda mais letais.',
    lore: 'Guardião das riquezas subterrâneas e das almas antigas. Defende cidades impenetráveis enquanto dizima invasores à distância.',
    minorChoices: { 2: ['Athena', 'Ares'], 3: ['Apollo', 'Aphrodite'], 4: ['Artemis', 'Hephaestus'] },
  },
  {
    id: 'Deméter',
    name: 'Deméter',
    title: 'Deusa da Agricultura e dos Mistérios',
    pantheon: 'greek',
    focus: 'Colheita fértil, economia e regeneração',
    favoredPower: 'prosperity',
    powerDescription: 'Concede Prosperidade abundante de Alimento, Madeira e Ouro, acelerando a economia e o avanço de eras.',
    lore: 'Senhora das estações e dos mistérios de Elêusis. Abençoa campos intermináveis para sustentar exércitos gregos incansáveis em qualquer mapa.',
    minorChoices: { 2: ['Athena', 'Hermes'], 3: ['Aphrodite', 'Apollo'], 4: ['Hera', 'Artemis'] },
  },

  // ── DISPONÍVEIS: EGÍPCIO ──
  {
    id: 'Rá',
    name: 'Rá',
    title: 'Deus do Sol',
    pantheon: 'egyptian',
    focus: 'Chuva abençoada, camelos e bigas',
    favoredPower: 'rain',
    powerDescription: 'Chuva de Rá multiplica a produção agrícola e concede bônus naturais de vida e velocidade para Camelos e Arqueiros de Biga.',
    lore: 'Senhor solar de Heliópolis cujo brilho fortalece Sacerdotes e Faraós. Comanda Esfinges, Wadjets, Rocas, Petsuchos, Vingadores e Múmias sob a luz dourada do Nilo.',
    minorChoices: { 2: ['Bast', 'Ptah'], 3: ['Hathor', 'Sekhmet'], 4: ['Horus', 'Osiris'] },
  },
  {
    id: 'Ísis',
    name: 'Ísis',
    title: 'Deusa da Magia e da Vida',
    pantheon: 'egyptian',
    focus: 'Monumentos, Favor e proteção divina',
    favoredPower: 'prosperity',
    powerDescription: 'Prosperidade impulsiona a economia do Nilo enquanto seus Monumentos protegem a cidade contra poderes divinos inimigos.',
    lore: 'Padroeira da magia ancestral e da restauração. Seus obeliscos e templos geram Favor contínuo para invocar legiões míticas rapidamente.',
    minorChoices: { 2: ['Anubis', 'Bast'], 3: ['Hathor', 'Nephthys'], 4: ['Osiris', 'Thoth'] },
  },
  {
    id: 'Set',
    name: 'Set',
    title: 'Deus do Caos, da Noite e do Deserto',
    pantheon: 'egyptian',
    focus: 'Caça agressiva, bestas e tempestades',
    favoredPower: 'sandstorm',
    powerDescription: 'Areias Movediças reposiciona tropas no campo de batalha, combinada ao controle de feras do deserto e incursões rápidas.',
    lore: 'Senhor das dunas sombrias e da guerra imprevisível. Pressiona adversários desde os primeiros minutos com velocidade e ferocidade.',
    minorChoices: { 2: ['Anubis', 'Ptah'], 3: ['Nephthys', 'Sekhmet'], 4: ['Horus', 'Thoth'] },
  },

  // ── DISPONÍVEIS: NÓRDICO ──
  {
    id: 'Odin',
    name: 'Odin',
    title: 'Pai de Todos / Sabedoria e Guerra',
    pantheon: 'norse',
    focus: 'Grande Caçada, regeneração e vigor viking',
    favoredPower: 'great_hunt',
    powerDescription: 'Grande Caçada multiplica a fauna próxima enquanto guerreiros nórdicos regeneram vida fora de combate e lutam com fúria incansável.',
    lore: 'Soberano de Asgard acompanhado por seus corvos batedores. Une economia de caça ágil com ataques coordenados de Ulfsarks e Valquírias.',
    minorChoices: { 2: ['Freyja', 'Heimdall'], 3: ['Njord', 'Skadi'], 4: ['Baldr', 'Tyr'] },
  },
  {
    id: 'Thor',
    name: 'Thor',
    title: 'Deus do Trovão',
    pantheon: 'norse',
    focus: 'Mina de Ouro Anã e forja superior',
    favoredPower: 'create_gold',
    powerDescription: 'Invoca a Mina Anã com reservas ricas de ouro, potencializa Anões coletores e desbloqueia armamentos rúnicos reforçados.',
    lore: 'Defensor de Midgard armado com o martelo Mjölnir. Sua indústria anã e carros de boi móveis sustentam exércitos blindados imparáveis.',
    minorChoices: { 2: ['Forseti', 'Freyja'], 3: ['Bragi', 'Skadi'], 4: ['Baldr', 'Tyr'] },
  },
  {
    id: 'Loki',
    name: 'Loki',
    title: 'Deus da Trapaça',
    pantheon: 'norse',
    focus: 'Unidades míticas, Hel e emboscadas',
    favoredPower: 'spiders',
    powerDescription: 'Implanta Covis de Aranhas traiçoeiros e convoca criaturas míticas em combate sob a proteção sombria de Hel e Nidhogg.',
    lore: 'Mestre das ilusões e da metamorfose. Pune exércitos desprevenidos com armadilhas, Hirdmen ágeis e monstros lendários.',
    minorChoices: { 2: ['Forseti', 'Heimdall'], 3: ['Bragi', 'Njord'], 4: ['Hel', 'Tyr'] },
  },
  {
    id: 'Freyr',
    name: 'Freyr',
    title: 'Deus da Fertilidade e da Prosperidade',
    pantheon: 'norse',
    focus: 'Defesa rúnica, Troll da Rocha e Fafnir',
    favoredPower: 'prosperity',
    powerDescription: 'Prosperidade acelera o desenvolvimento nórdico e abre acesso exclusivo a Aegir (Troll da Rocha) e Vidar (Dragão Fafnir).',
    lore: 'Senhor de Alfheim que une abundância e fortificações invencíveis. Seus exércitos combinam muralhas sólidas com dragões blindados.',
    minorChoices: { 2: ['Freyja', 'Forseti'], 3: ['Aegir', 'Bragi'], 4: ['Vidar', 'Hel'] },
  },

  // ── DISPONÍVEIS: ATLANTE ──
  {
    id: 'Cronos',
    name: 'Cronos',
    title: 'Titã do Tempo',
    pantheon: 'atlantean',
    focus: 'Solapar fortificações e cerco implacável',
    favoredPower: 'undermine',
    powerDescription: 'Solapar abre fendas sísmicas sob muralhas e torres inimigas, impulsionando cercos rápidos com oricalco e Passagens Celestes.',
    lore: 'Senhor ancestral das eras que dobra o tempo ao seu favor. Permite reconstruir postos avançados e esmagar bases fortificadas cedo.',
    minorChoices: { 2: ['Prometheus', 'Leto'], 3: ['Hyperion', 'Rheia'], 4: ['Helios', 'Atlas'] },
  },
  {
    id: 'Urano',
    name: 'Urano',
    title: 'Titã dos Céus',
    pantheon: 'atlantean',
    focus: 'Mobilidade aérea e ondas de choque',
    favoredPower: 'tremor',
    powerDescription: 'Tremor arremessa formações inimigas enquanto as Passagens Celestes permitem manobras instantâneas por todo o mapa.',
    lore: 'Titã primordial do firmamento estrelado. Concede visão privilegiada e superioridade de movimento a toda a frota e cavalaria atlante.',
    minorChoices: { 2: ['Okeanus', 'Prometheus'], 3: ['Hyperion', 'Theia'], 4: ['Helios', 'Hekate'] },
  },
  {
    id: 'Gaia',
    name: 'Gaia',
    title: 'Deusa da Terra',
    pantheon: 'atlantean',
    focus: 'Bosques Vivos e regeneração natural',
    favoredPower: 'walking_woods',
    powerDescription: 'Bosques Vivos anima florestas em guardiões enquanto o solo sagrado de Gaia cura construções e sustenta a economia.',
    lore: 'Mãe primordial da terra fértil. Transforma o próprio terreno ao redor da cidade em um santuário próspero e resiliente.',
    minorChoices: { 2: ['Okeanus', 'Leto'], 3: ['Theia', 'Rheia'], 4: ['Atlas', 'Hekate'] },
  },

  // ── DISPONÍVEIS: CHINÊS (Immortal Pillars) ──
  {
    id: 'Fu Xi',
    name: 'Fu Xi',
    title: 'O Imperador Divino / Civilização',
    pantheon: 'chinese',
    expansionLabel: 'Immortal Pillars',
    focus: 'Construção célere, Kuafus e bênçãos imperiais',
    favoredPower: 'solar_beam',
    powerDescription: 'Raio Solar celestial que purifica batalhões inimigos enquanto impulsiona construções e heróis imperiais.',
    lore: 'Soberano fundador da ordem, dos trigramas Bagua e dos Pilares Imortais da China antiga.',
    minorChoices: { 2: ['Chiyou', 'Xuannu'], 3: ['Houtu', 'Gonggong'], 4: ['Huangdi', 'Zhurong'] },
  },
  {
    id: 'Nü Wa',
    name: 'Nü Wa',
    title: 'Deusa Criadora da Humanidade',
    pantheon: 'chinese',
    expansionLabel: 'Immortal Pillars',
    focus: 'Crescimento populacional, muralhas e restauração',
    favoredPower: 'restoration',
    powerDescription: 'Bênção criadora que restaura exércitos e acelera a expansão urbana do império chinês.',
    lore: 'Deusa ancestral que moldou a humanidade em barro sagrado e reparou os pilares do céu.',
    minorChoices: { 2: ['Xuannu', 'Chiyou'], 3: ['Houtu', 'Gonggong'], 4: ['Huangdi', 'Zhurong'] },
  },
  {
    id: 'Shennong',
    name: 'Shennong',
    title: 'Deus da Agricultura e da Medicina',
    pantheon: 'chinese',
    expansionLabel: 'Immortal Pillars',
    focus: 'Agricultura fértil, Qilins e cura contínua',
    favoredPower: 'rain',
    powerDescription: 'Chuva medicinal que nutre lavouras e fortalece a vitalidade das tropas e feras míticas imperiais.',
    lore: 'Sábio divino das colheitas e ervas sagradas que garante sustentabilidade incomparável ao longo da partida.',
    minorChoices: { 2: ['Chiyou', 'Xuannu'], 3: ['Gonggong', 'Houtu'], 4: ['Zhurong', 'Huangdi'] },
  },

  // ── EM BREVE: JAPONÊS (Heavenly Spear) ──
  {
    id: 'Amaterasu',
    name: 'Amaterasu',
    title: 'Deusa do Sol',
    pantheon: 'japanese',
    comingSoon: true,
    expansionLabel: 'Heavenly Spear',
    focus: 'Luz solar, samurais e disciplina imperial',
    favoredPower: 'solar_beam',
    powerDescription: 'Feixe solar sagrado que purifica o campo de batalha e inspira guerreiros sob a bandeira do sol nascente.',
    lore: 'Divindade suprema de Takamagahara cujo brilho guia santuários xintoístas, mikos e guardiões místicos.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Tsukuyomi',
    name: 'Tsukuyomi',
    title: 'Deus da Lua',
    pantheon: 'japanese',
    comingSoon: true,
    expansionLabel: 'Heavenly Spear',
    focus: 'Táticas noturnas, precisão e mistério',
    favoredPower: 'darkest_night',
    powerDescription: 'Invoca o manto lunar que fortalece unidades míticas e permite manobras furtivas decisivas.',
    lore: 'Senhor da lua e da ordem celestial noturna, trazendo equilíbrio tático e poder arcano aos exércitos japoneses.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] },
  },
  {
    id: 'Susanoo',
    name: 'Susanoo',
    title: 'Deus das Tempestades e do Mar',
    pantheon: 'japanese',
    comingSoon: true,
    expansionLabel: 'Heavenly Spear',
    focus: 'Fúria tempestuosa e ofensiva devastadora',
    favoredPower: 'tornado',
    powerDescription: 'Tempestades furiosas e ciclones marítimos que varrem exércitos inteiros e esmagam fortificações.',
    lore: 'Deus impetuoso dos vendavais e mares revoltos, matador de dragões que favorece ataques diretos e heroicos.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },

  // ── EM BREVE: ASTECA (Obsidian Mirror) ──
  {
    id: 'Huitzilopochtli',
    name: 'Huitzilopochtli',
    title: 'Deus do Sol e da Guerra',
    pantheon: 'aztec',
    comingSoon: true,
    expansionLabel: 'Obsidian Mirror',
    focus: 'Guerreiros solares e armas flamejantes',
    favoredPower: 'flaming_weapons',
    powerDescription: 'Incendeia as lâminas de obsidiana dos guerreiros astecas para ataques implacáveis.',
    lore: 'Soberano guerreiro de Tenochtitlán que exige coragem em batalha e amplia a geração de Favor em combate.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Quetzalcóatl',
    name: 'Quetzalcóatl',
    title: 'A Serpente Emplumada',
    pantheon: 'aztec',
    comingSoon: true,
    expansionLabel: 'Obsidian Mirror',
    focus: 'Sacerdotes velozes e ventos sagrados',
    favoredPower: 'tornado',
    powerDescription: 'Redemoinhos emplumados e sabedoria ritualística que aceleram avanços tecnológicos e exploração.',
    lore: 'Criador iluminado das artes e dos ventos, unindo templos de jade a criaturas aladas mesoamericanas.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Tezcatlipoca',
    name: 'Tezcatlipoca',
    title: 'Deus da Noite e do Destino',
    pantheon: 'aztec',
    comingSoon: true,
    expansionLabel: 'Obsidian Mirror',
    focus: 'Espelho fumegante e discórdia no inimigo',
    favoredPower: 'chaos',
    powerDescription: 'Lança confusão e caos através do espelho de obsidiana, virando tropas rivais umas contra as outras.',
    lore: 'Senhor imprevisível das sombras e da feitiçaria que manipula o destino das guerras.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] },
  },

  // ── EM BREVE: OUTRAS CIVILIZAÇÕES PLANEJADAS ──
  {
    id: 'Júpiter',
    name: 'Júpiter',
    title: 'Soberano do Capitólio',
    pantheon: 'roman',
    comingSoon: true,
    expansionLabel: 'Expansão Romana',
    focus: 'Legiões pesadas e tempestades de raios',
    favoredPower: 'lightning_storm',
    powerDescription: 'Descarrega tempestades elétricas sobre exércitos inimigos enquanto legiões romanas mantêm formação cerrada.',
    lore: 'Pai do panteão romano e guardião das águias imperiais.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Juno',
    name: 'Juno',
    title: 'Rainha do Fórum',
    pantheon: 'roman',
    comingSoon: true,
    expansionLabel: 'Expansão Romana',
    focus: 'Fortificações sólidas e sentinelas',
    favoredPower: 'sentinel',
    powerDescription: 'Convoca guardiões de mármore para proteger províncias e cidades fortificadas.',
    lore: 'Protetora do Estado romano, da disciplina cívica e da soberania territorial.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Minerva',
    name: 'Minerva',
    title: 'Deusa da Estratégia e Sabedoria',
    pantheon: 'roman',
    comingSoon: true,
    expansionLabel: 'Expansão Romana',
    focus: 'Tecnologias rápidas e restauração',
    favoredPower: 'restoration',
    powerDescription: 'Restaura legiões e máquinas de cerco em combate com táticas avançadas de engenharia.',
    lore: 'Patrona dos estrategistas, artesãos e engenheiros militares de Roma.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Azathoth',
    name: 'Azathoth',
    title: 'Sultão do Caos Nuclear',
    pantheon: 'eldritch',
    comingSoon: true,
    expansionLabel: 'Expansão Eldritch',
    focus: 'Caos primordial e anomalias cósmicas',
    favoredPower: 'chaos',
    powerDescription: 'Distorce a sanidade no campo de batalha, lançando forças inimigas umas contra as outras.',
    lore: 'Entidade cósmica além das estrelas cuja presença altera as leis do espaço e do tempo.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] },
  },
  {
    id: 'Yog-Sothoth',
    name: 'Yog-Sothoth',
    title: 'Guardião dos Portais',
    pantheon: 'eldritch',
    comingSoon: true,
    expansionLabel: 'Expansão Eldritch',
    focus: 'Rituais temporais e conversão mental',
    favoredPower: 'traitors',
    powerDescription: 'Dobra vontades mortais através de portais planares para recrutar inimigos.',
    lore: 'A chave e o portal de todas as eras, cultuado em monólitos de obsidiana.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] },
  },
  {
    id: 'Shub-Niggurath',
    name: 'Shub-Niggurath',
    title: 'Mãe das Florestas Negras',
    pantheon: 'eldritch',
    comingSoon: true,
    expansionLabel: 'Expansão Eldritch',
    focus: 'Hordas abissais e emboscadas',
    favoredPower: 'spiders',
    powerDescription: 'Semeia ninhos abissais que consomem destacamentos isolados.',
    lore: 'Força fértil e sombria dos bosques antigos que multiplica criaturas indescritíveis.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] },
  },
  {
    id: 'Lugh',
    name: 'Lugh',
    title: 'Mestre de Todas as Artes',
    pantheon: 'celtic',
    comingSoon: true,
    expansionLabel: 'Expansão Celta',
    focus: 'Heróis versáteis e lanças solares',
    favoredPower: 'solar_beam',
    powerDescription: 'Dispara a lança flamejante de Lugh do céu para perfurar formações adversárias.',
    lore: 'Herói radiante dos Tuatha Dé Danann, imbatível em estratégia, forja e combate.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'The Dagda',
    name: 'The Dagda',
    title: 'Senhor do Caldeirão Inesgotável',
    pantheon: 'celtic',
    comingSoon: true,
    expansionLabel: 'Expansão Celta',
    focus: 'Abundância e bosques vivos druídicos',
    favoredPower: 'walking_woods',
    powerDescription: 'Desperta carvalhos sagrados para defender clareiras e fortalezas celtas.',
    lore: 'Grande pai druida portador da clava que dá a vida e retira a força dos inimigos.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'The Morrigan',
    name: 'The Morrigan',
    title: 'Rainha Fantasma da Guerra',
    pantheon: 'celtic',
    comingSoon: true,
    expansionLabel: 'Expansão Celta',
    focus: 'Guerreiros ferozes e corvos do destino',
    favoredPower: 'pestilence',
    powerDescription: 'Lança agouros sobre quartéis inimigos, enfraquecendo a produção militar adversária.',
    lore: 'Tecelã do destino em batalha que inspira terror aos inimigos dos clãs celtas.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] },
  },
  {
    id: 'Marduk',
    name: 'Marduk',
    title: 'Rei dos Deuses da Babilônia',
    pantheon: 'babylonian',
    comingSoon: true,
    expansionLabel: 'Expansão Babilônica',
    focus: 'Cavalaria real e tempestades celestes',
    favoredPower: 'lightning_storm',
    powerDescription: 'Invoca o juízo tempestuoso de Marduk sobre cidades sitiadas.',
    lore: 'Conquistador de Tiamat e soberano dos zigurates dourados do Eufrates.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Inanna',
    name: 'Inanna',
    title: 'Estrela da Manhã e da Guerra',
    pantheon: 'babylonian',
    comingSoon: true,
    expansionLabel: 'Expansão Babilônica',
    focus: 'Prosperidade de zigurates e glória',
    favoredPower: 'rain',
    powerDescription: 'Abençoa os rios mesopotâmicos com chuvas férteis e suprimentos constantes.',
    lore: 'Deusa babilônica da soberania, do amor e da vitória em batalha.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Enlil',
    name: 'Enlil',
    title: 'Senhor dos Ventos e Decretos',
    pantheon: 'babylonian',
    comingSoon: true,
    expansionLabel: 'Expansão Babilônica',
    focus: 'Ventos furiosos e tornados',
    favoredPower: 'tornado',
    powerDescription: 'Desencadeia ciclones devastadores que dispersam exércitos e destroem muralhas.',
    lore: 'Guardião das Tábuas do Destino que domina os ares sobre a Mesopotâmia.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Anpetu Wi',
    name: 'Anpetu Wi',
    title: 'Espírito Solar do Meio-Dia',
    pantheon: 'lakota',
    comingSoon: true,
    expansionLabel: 'Expansão Lakota (Iakota)',
    focus: 'Grande Caçada e luz radiante',
    favoredPower: 'great_hunt',
    powerDescription: 'Multiplica manadas sagradas nas planícies para sustentar tribos velozes.',
    lore: 'Força solar das grandes pradarias que guia os caçadores e guerreiros montados.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Hanwi',
    name: 'Hanwi',
    title: 'Guardiã da Lua Noturna',
    pantheon: 'lakota',
    comingSoon: true,
    expansionLabel: 'Expansão Lakota (Iakota)',
    focus: 'Emboscadas sob a lua e restauração',
    favoredPower: 'restoration',
    powerDescription: 'Cura batedores e espíritos protetores sob o luar das montanhas.',
    lore: 'Serenidade lunar que protege os acampamentos e guia visões sagradas.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Shadow3', 'Divine_Storm3'], 4: ['Divine_Abyss4', 'Divine_Apocalypse4'] },
  },
  {
    id: 'Unci Makha',
    name: 'Unci Makha',
    title: 'Avó Terra das Pradarias',
    pantheon: 'lakota',
    comingSoon: true,
    expansionLabel: 'Expansão Lakota (Iakota)',
    focus: 'Búfalos abundantes e força da terra',
    favoredPower: 'tremor',
    powerDescription: 'Estremece as planícies para derrubar barreiras e proteger a terra natal.',
    lore: 'Fundação sagrada da vida que nutre cada geração das tribos das planícies.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Surtr',
    name: 'Surtr',
    title: 'Senhor de Muspelheim',
    pantheon: 'jotunn',
    comingSoon: true,
    expansionLabel: 'Expansão Jotunn',
    focus: 'Gigantes flamejantes e meteoros',
    favoredPower: 'meteor',
    powerDescription: 'Invoca chuvas de meteoros ardentes de Muspelheim sobre fortalezas inteiras.',
    lore: 'Gigante ancestral do fogo portando a espada incandescente do crepúsculo.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Ymir',
    name: 'Ymir',
    title: 'Primordial do Gelo Eterno',
    pantheon: 'jotunn',
    comingSoon: true,
    expansionLabel: 'Expansão Jotunn',
    focus: 'Colossos glaciais e congelamento',
    favoredPower: 'frost',
    powerDescription: 'Congela exércitos inteiros em blocos de gelo primordial.',
    lore: 'Primeiro dos gigantes de Niflheim, cuja essência moldou montanhas e mares gélidos.',
    minorChoices: { 2: ['Divine_War2', 'Divine_Eco2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
  {
    id: 'Aegir',
    name: 'Aegir',
    title: 'Jotunn dos Mares Tempestuosos',
    pantheon: 'jotunn',
    comingSoon: true,
    expansionLabel: 'Expansão Jotunn',
    focus: 'Tempestades oceânicas e nevasca',
    favoredPower: 'blizzard',
    powerDescription: 'Desencadeia nevascas marítimas que paralisam invasões costeiras e terrestres.',
    lore: 'Soberano abissal dos mares do norte e senhor dos gigantes marinhos.',
    minorChoices: { 2: ['Divine_Eco2', 'Divine_War2'], 3: ['Divine_Storm3', 'Divine_Shadow3'], 4: ['Divine_Apocalypse4', 'Divine_Abyss4'] },
  },
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
    fishing_ship: { name: 'Barco Pesqueiro Grego' },
    war_trireme: { name: 'Trirreme Helênico' },
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
    fishing_ship: { name: 'Barco Pesqueiro do Nilo' },
    war_trireme: { name: 'Barco de Guerra Kebent' },
  },
  norse: {
    villager: {
      name: 'Coletor Nórdico',
      role: 'Coleta alimento, madeira e ouro e cultiva fazendas. Nos Nórdicos, a infantaria constrói os edifícios.',
    },
    norse_dwarf: {
      name: 'Anão Minerador',
      role: 'Forjador anão de Nidavellir treinado no Centro da Cidade. Coleta Ouro muito mais rápido que coletores comuns.',
    },
    ox_cart: {
      name: 'Carro de Bois',
      role: 'Depósito móvel de recursos dos Nórdicos. Acompanha coletores e anões até florestas, caças e minas de ouro.',
    },
    hersir: {
      name: 'Hersir',
      role: 'Herói guerreiro nórdico que gera Favor em combate e derrota criaturas míticas.',
    },
    godi: {
      name: 'Godi',
      role: 'Sacerdote-herói nórdico de longo alcance (Retold). Arremessa lanças rúnicas contra unidades míticas terrestres e voadoras.',
    },
    ulfsark: {
      name: 'Ulfsark (Berserk)',
      role: 'Infantaria rápida de dupla lâmina que constrói todos os edifícios militares e econômicos nórdicos.',
    },
    throwing_axeman: {
      name: 'Lançador de Machado',
      role: 'Infantaria viking que arremessa machados à distância causando dano cortante, letal contra infantaria inimiga.',
    },
    raiding_cavalry: {
      name: 'Cavaleiro de Incursão',
      role: 'Cavalaria rápida nórdica excelente para flanquear arqueiros, trabalhadores e armas de cerco.',
    },
    huskarl: {
      name: 'Huskarl',
      role: 'Infantaria de elite do Forte da Colina com escudo pesado e altíssima armadura contra flechas.',
    },
    jarl: {
      name: 'Jarl',
      role: 'Cavalaria pesada nobre do Forte da Colina com grande vida e bônus de ataque contra unidades míticas.',
    },
    portable_ram: {
      name: 'Aríete Portátil',
      role: 'Aríete viking carregado por guerreiros para demolir muralhas, torres e fortalezas rapidamente.',
    },
    norse_ballista: {
      name: 'Balista Nórdica',
      role: 'Artilharia pesada de longo alcance que dispara virotes gigantes contra tropas e edificações.',
    },
    troll: {
      name: 'Troll (Forseti)',
      role: 'Criatura mítica das cavernas que arremessa pedregulhos à distância e regenera ferimentos.',
    },
    valkyrie: {
      name: 'Valquíria (Freyja)',
      role: 'Guerreira celestial montada em corcel branco que luta na linha de frente e cura tropas aliadas.',
    },
    einherjar: {
      name: 'Einherjar (Heimdall)',
      role: 'Guerreiro imortal de Valhalla com machado colossal que sopra sua trompa para inspirar o exército.',
    },
    frost_giant: {
      name: 'Gigante de Gelo (Skadi / Hel)',
      role: 'Colosso de Niflheim que congela inimigos com seu sopro glacial e esmaga tropas.',
    },
    mountain_giant: {
      name: 'Gigante da Montanha (Njord / Hel)',
      role: 'Gigante de pedra viva armado com um tronco de pinheiro colossal para pulverizar construções.',
    },
    battle_boar: {
      name: 'Javali de Batalha (Bragi)',
      role: 'Gullinbursti — javali mecânico forjado em ouro e bronze que arremessa soldados pelos ares.',
    },
    kraken: {
      name: 'Kraken (Njord)',
      role: 'Monstro abissal tentacular que afunda navios instantaneamente e esmaga tropas costeiras.',
    },
    rock_troll: {
      name: 'Troll da Rocha (Aegir - Freyr)',
      role: 'Criatura blindada de granito e cristais rúnicos que bloqueia ataques e resiste muito bem a projéteis.',
    },
    fire_giant: {
      name: 'Gigante de Fogo (Baldr / Hel)',
      role: 'Gigante de Muspelheim armado com espada flamejante que dispara bolas de fogo devastadoras em área.',
    },
    fenris_wolf: {
      name: 'Cria de Fenris (Tyr)',
      role: 'Lobo monstruoso acorrentado com Gleipnir que ganha ataque e velocidade em matilha.',
    },
    nidhogg: {
      name: 'Nidhogg (Hel)',
      role: 'Dragão alado primordial que cospe fogo devastador sobre exércitos e bases.',
    },
    jormungand: {
      name: 'Prole de Jormungand (Njord / Hel)',
      role: 'Serpente marinha colosal que dispara jatos de ácido corrosivo contra navios e unidades costeiras.',
    },
    fafnir: {
      name: 'Fafnir (Vidar - Freyr)',
      role: 'Dragão terrestre encouraçado em ouro amaldiçoado que cospe fogo e emana névoa tóxica venenosa.',
    },
    hoplite: { name: 'Ulfsark' },
    archer: { name: 'Lançador de Machado' },
    cavalry: { name: 'Cavaleiro de Incursão' },
    hero: { name: 'Hersir' },
    siege: { name: 'Balista Nórdica' },
    minotaur: { name: 'Troll' },
    centaur: { name: 'Valquíria' },
    cyclops: { name: 'Gigante de Gelo' },
    titan: {
      name: 'Titã Ymir — Gigante de Gelo Primordial',
      role: 'O colossal Ymir, o gigante de gelo primordial armado com um machado de gelo colossal, invocado após pesquisar o Segredo dos Titãs.',
    },
    fishing_ship: { name: 'Barco Pesqueiro Nórdico' },
    war_trireme: { name: 'Dracar (Longboat)' },
  },
  atlantean: {
    citizen: {
      name: 'Cidadão Atlante',
      role: 'Aldeão atlante de elite — coleta muito mais rápido e deposita recursos automaticamente sem precisar voltar a depósitos. Pode ser promovido a Herói.',
    },
    oracle: {
      name: 'Oráculo',
      role: 'Batedor atlante — ganha grande linha de visão (+10) e gera Favor passivamente quando parado. Pode ser promovido a Herói para lutar contra míticas.',
    },
    llama_caravan: {
      name: 'Caravana de Lhama',
      role: 'Unidade comercial do Mercado — percorre rotas automáticas entre seu Mercado e a Cidadela gerando Ouro contínuo.',
    },
    murmillo: {
      name: 'Murmillo',
      role: 'Quartel Militar (Clássica) — infantaria padrão corpo a corpo resistente e versátil. Pode ser promovido a Herói.',
    },
    katapeltes: {
      name: 'Katapeltes',
      role: 'Contra-Quartel (Clássica) — lanceiro especializado em destruir cavalaria inimiga (2.25x). Pode ser promovido a Herói.',
    },
    turma: {
      name: 'Turma',
      role: 'Contra-Quartel (Clássica) — cavalaria à distância veloz que arremessa dardos letais contra arqueiros (1.8x). Pode ser promovido a Herói.',
    },
    cheiroballista: {
      name: 'Cheiroballista',
      role: 'Contra-Quartel (Clássica) — arma de cerco leve portátil que dispara virotes precisos letais contra infantaria (2.0x).',
    },
    arcus: {
      name: 'Arcus',
      role: 'Quartel Militar (Heroica) — arqueiro de longo alcance devastador contra infantaria. Pode ser promovido a Herói.',
    },
    contarius: {
      name: 'Contarius',
      role: 'Quartel Militar (Heroica) — cavalaria pesada de lança longa, eficaz contra arqueiros e cerco. Pode ser promovido a Herói.',
    },
    destroyer: {
      name: 'Destruidor',
      role: 'Palácio (Heroica) — infantaria pesadamente blindada com tridente e escudão especializada em derrubar edifícios (2.7x). Pode ser promovido a Herói.',
    },
    fanatic: {
      name: 'Fanático',
      role: 'Palácio (Mítica) — infantaria de elite com espadas duplas letais contra infantaria e cavalaria humanas. Pode ser promovido a Herói.',
    },
    fire_siphon: {
      name: 'Sifão de Fogo',
      role: 'Palácio (Mítica) — arma de cerco de bronze que dispara jatos de fogo líquido devastadores contra edifícios em área.',
    },
    onager: {
      name: 'Onagro',
      role: 'Palácio (Mítica · Retold) — catapulta pesada de longo alcance que arremessa rochas em área contra muralhas e exércitos.',
    },
    promethean: {
      name: 'Prometeico (Prometeu)',
      role: 'Templo (Clássica) — criatura de barro primordial que se divide em duas Proles Prometeicas ao morrer.',
    },
    promethean_offspring: {
      name: 'Prole Prometeica',
      role: 'Fragmento ágil de barro gerado quando um Prometeico é destruído em combate.',
    },
    automaton: {
      name: 'Autômato (Leto)',
      role: 'Templo (Clássica) — guerreiro mecânico de oricalco que se auto-repara continuamente e conserta outros Autômatos próximos.',
    },
    caladria: {
      name: 'Caládria (Oceano)',
      role: 'Templo (Clássica) — ave sagrada voadora que não ataca, mas cura continuamente tropas aliadas próximas.',
    },
    behemoth: {
      name: 'Beemote (Réia)',
      role: 'Templo (Heroica) — fera quadrúpede colossal especializada em demolir construções (3.1x) com regeneração constante.',
    },
    satyr: {
      name: 'Sátiro (Hipérion)',
      role: 'Templo (Heroica) — atirador ágil que dispara rajadas de lanças letais contra infantaria inimiga.',
    },
    stymphalian_bird: {
      name: 'Ave do Estínfalo (Teia)',
      role: 'Templo (Heroica) — ave metálica voadora que dispara penas de bronze afiadas à longa distância.',
    },
    dryad: {
      name: 'Dríade (Teia)',
      role: 'Infantaria mítica ágil invocada a partir da Árvore das Hespérides (Bosques Vivos de Teia/Gaia).',
    },
    hekagigantes: {
      name: 'Hecatônquiro / Centimano (Hélios)',
      role: 'Templo (Mítica) — gigante de múltiplos braços que esmaga exércitos com golpes sísmicos em área.',
    },
    argus: {
      name: 'Argos (Atlas)',
      role: 'Templo (Mítica) — criatura flutuante de múltiplos olhos que dispara rajadas de ácido corrosivo em área letal.',
    },
    lampades: {
      name: 'Lâmpade (Hécate)',
      role: 'Templo (Mítica) — ninfa do submundo que dispara orbes de fogo do caos capazes de atordoar e confundir inimigos.',
    },
    carnivora: {
      name: 'Carnívora (Oceano)',
      role: 'Templo / Poder Divino — planta carnívora monstruosa que devora soldados próximos com suas mandíbulas.',
    },
    tartarian_spawn: {
      name: 'Cria do Tártaro (Hécate)',
      role: 'Templo / Portal do Tártaro — demônio alado infernal com ataques flamejantes ferozes.',
    },
    villager: { name: 'Cidadão Atlante' },
    hoplite: { name: 'Murmillo' },
    archer: { name: 'Arcus' },
    cavalry: { name: 'Contarius' },
    hero: { name: 'Oráculo Herói' },
    siege: { name: 'Sifão de Fogo' },
    minotaur: { name: 'Autômato' },
    centaur: { name: 'Sátiro' },
    cyclops: { name: 'Beemote' },
    titan: {
      name: 'Titã Atlante',
      role: 'Unidade colossal invocada pelo Portão do Titã na Idade Mítica (Cronos, Urano ou Gaia).',
    },
    fishing_ship: { name: 'Barco Pesqueiro de Oricalco' },
    war_trireme: { name: 'Birreme Atlante' },
  },
  chinese: {
    chinese_peasant: { name: 'Camponês Chinês' },
    kuafu: { name: 'Kuafu Gigante' },
    halberdier: { name: 'Alabardeiro Imperial' },
    chu_ko_nu: { name: 'Bestadeiro Chu-Ko-Nu' },
    tiger_cavalry: { name: 'Cavalaria Tigre' },
    fire_lance: { name: 'Lança-Fogo Imperial' },
    nezha: { name: 'Nezha — Príncipe do Lótus' },
    jiang_ziya: { name: 'Jiang Ziya — Sábio Imortal' },
    qilin: { name: 'Qilin Sagrado' },
    taotie: { name: 'Taotie Devorador' },
    yazi: { name: 'Yazi — Filho do Dragão' },
    azure_dragon: { name: 'Dragão Azul (Qinglong)' },
    villager: { name: 'Camponês Chinês' },
    hoplite: { name: 'Alabardeiro Imperial' },
    archer: { name: 'Bestadeiro Chu-Ko-Nu' },
    cavalry: { name: 'Cavalaria Tigre' },
    hero: { name: 'Jiang Ziya' },
    siege: { name: 'Lança-Fogo Imperial' },
    minotaur: { name: 'Qilin Sagrado' },
    centaur: { name: 'Yazi' },
    cyclops: { name: 'Taotie Devorador' },
    titan: { name: 'Dragão Titã Imperial' },
    fishing_ship: { name: 'Junco Pesqueiro Chinês' },
    war_trireme: { name: 'Junco de Guerra Imperial' },
    transport_ship: { name: 'Junco de Transporte' },
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
  const base =
    pantheon === 'atlantean'
      ? (CIVILIZATION_UNITS.atlantes[kind] ?? UNIT_STATS[kind])
      : pantheon === 'chinese'
        ? (CIVILIZATION_UNITS.chineses[kind] ?? UNIT_STATS[kind])
        : UNIT_STATS[kind];
  const ov = CIV_UNIT_NAMES[pantheon]?.[kind];
  if (!ov) return base;
  return { ...base, ...ov };
}

export interface WonderSpec {
  name: string;
  subtitle: string;
  bonusLabel: string;
}

const WONDER_BY_GOD: Record<string, WonderSpec> = {
  zeus: { name: 'Estátua de Zeus no Olimpo', subtitle: 'Colosso de ouro e marfim consagrado ao Rei dos Deuses', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  poseidon: { name: 'Templo de Poseidon em Súnion', subtitle: 'Santuário marítimo de colunas dóricas sobre o mar', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  hades: { name: 'Necromanteion de Hades', subtitle: 'Mausoléu sombrio de obsidiana e mármore do submundo', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  deméter: { name: 'Santuário de Elêusis (Deméter)', subtitle: 'Grande salão misterioso cercado por colheitas sagradas', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  rá: { name: 'Grande Pirâmide de Gizé (Rá)', subtitle: 'Pirâmide solar de pedra calcária com cume em ouro puro', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  ísis: { name: 'Templo de Filas (Ísis)', subtitle: 'Complexo sagrado de obeliscos e pilares de lótus de Ísis', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  set: { name: 'Monumento da Tempestade (Set)', subtitle: 'Pirâmide negra de Set entre areias e relâmpagos', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  odin: { name: 'Salão Dourado de Valhalla (Odin)', subtitle: 'Templo monumental de escudos dourados e troncos de Yggdrasil', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  thor: { name: 'Grande Forja de Mjölnir (Thor)', subtitle: 'Pedestal titânico com o martelo de Thor incandescente', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  loki: { name: 'Árvore de Yggdrasil Sombria (Loki)', subtitle: 'Monólito rúnico envolto em runas ardentes de ilusão', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  freyr: { name: 'Grande Bosque de Alfheim (Freyr)', subtitle: 'Santuário de luz dourada e runas de prosperidade', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  cronos: { name: 'Torre do Tempo de Cronos', subtitle: 'Zigurates concêntricos de oricalco com anel temporal suspenso', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  urano: { name: 'Observatório Celestial de Urano', subtitle: 'Cúpula estelar flutuante com prismas de energia cósmica', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  gaia: { name: 'Árvore-Mãe de Atlântida (Gaia)', subtitle: 'Palácio cristalino entrelaçado com raízes vivas sagradas', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  'fu xi': { name: 'Grande Pagode Imperial (Fu Xi)', subtitle: 'Torre sagrada de nove níveis em jade, laca escarlate e ouro imperial', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  'nü wa': { name: 'Pilar Celestial de Nü Wa', subtitle: 'Pagode monumental de jade vivo que sustenta o firmamento', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  shennong: { name: 'Pavilhão da Colheita Eterna (Shennong)', subtitle: 'Santuário imperial dourado cercado por jardins medicinais', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
};

export function getWonderSpec(pantheon: PantheonId, majorGodName?: string): WonderSpec {
  const key = (majorGodName ?? '').trim().toLowerCase();
  if (WONDER_BY_GOD[key]) return WONDER_BY_GOD[key];
  const p = PANTHEONS[pantheon];
  return {
    name: `Maravilha de ${p.deity}`,
    subtitle: `Monumento supremo da civilização ${p.name}`,
    bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos',
  };
}

export function getCivBuildingSpec(
  pantheon: PantheonId,
  kind: BuildingKind,
  majorGodName?: string,
  age: AgeLevel = 1
): BuildingStats {
  const base = BUILDING_STATS[kind];
  const p = PANTHEONS[pantheon];

  // Progressão comum de Torres por Era
  if (kind === 'tower') {
    const tierName =
      age >= 4 ? 'Torre de Balista' : age >= 3 ? 'Torre de Guarda' : 'Torre de Vigia';
    const hpMult = age >= 4 ? 1.55 : age >= 3 ? 1.25 : 1.0;
    const atkMult = age >= 4 ? 1.55 : age >= 3 ? 1.25 : 1.0;
    const rangeAdd = age >= 4 ? 3.5 : age >= 3 ? 1.5 : 0;
    const cultureSuffix =
      pantheon === 'norse' || pantheon === 'jotunn'
        ? ' Viking'
        : pantheon === 'egyptian'
          ? ' do Deserto'
          : pantheon === 'atlantean'
            ? ' de Oricalco'
            : '';
    return {
      ...base,
      name: `${tierName}${cultureSuffix}`,
      maxHp: Math.round(base.maxHp * hpMult),
      attack: Math.round((base.attack ?? 19) * atkMult),
      range: (base.range ?? 16.5) + rangeAdd,
      role: `Evolui automaticamente por Era (Vigia → Guarda → Balista). Atual: ${tierName}.`,
    };
  }

  // Progressão comum e cultural de Muralhas & Portões por Era
  if (kind === 'wall' || kind === 'gate') {
    const isGate = kind === 'gate';
    let tierLabel = age >= 4 ? 'Fortificada' : age >= 3 ? 'de Pedra' : 'de Madeira';
    let hpMult = age >= 4 ? 1.75 : age >= 3 ? 1.35 : 1.0;
    if (pantheon === 'egyptian' && age >= 4) {
      tierLabel = 'da Cidadela';
      hpMult = 2.05;
    } else if (pantheon === 'atlantean') {
      tierLabel = age >= 4 ? 'de Oricalco' : age >= 3 ? 'de Ferro' : 'de Bronze';
      hpMult = age >= 4 ? 2.1 : age >= 3 ? 1.55 : 1.2;
    }
    return {
      ...base,
      name: `${isGate ? 'Portão' : 'Muralha'} ${tierLabel}`,
      maxHp: Math.round(base.maxHp * hpMult),
      role: isGate
        ? `Portão ${tierLabel}: permite passagem livre de aliados e barra inimigos.`
        : `Muralha ${tierLabel}: bloqueia o avanço inimigo e evolui com sua Era.`,
    };
  }

  if (kind === 'wonder') {
    const w = getWonderSpec(pantheon, majorGodName);
    return {
      ...base,
      name: w.name,
      role: `${w.subtitle} · ${w.bonusLabel}`,
    };
  }

  // Regras econômicas de Fazenda (Egípcios na Era I)
  if (kind === 'farm') {
    if (pantheon === 'egyptian') {
      return {
        ...base,
        minAge: 1,
        cost: { gold: 65 },
        name: 'Fazenda do Nilo',
        role: 'Disponível desde a Era Arcaica para Egípcios — fonte infinita de Alimento.',
      };
    }
    return base;
  }

  if (pantheon === 'norse' || pantheon === 'jotunn') {
    if (kind === 'town_center') {
      return {
        ...base,
        name: `Casa Comunal / Longhouse (${p.name})`,
        role: 'Salão principal de madeira e pedra rúnica — treina Coletores, Anões Mineradores e Carros de Boi.',
      };
    }
    if (kind === 'village_center') {
      return {
        ...base,
        name: 'Salão da Vila Nórdica',
        role: 'Posto avançado construível fora de assentamentos — treina Coletores, Anões e Carros de Boi.',
      };
    }
    if (kind === 'armory') {
      return {
        ...base,
        minAge: 1,
        name: 'Arsenal dos Anões',
        role: 'Disponível desde a Era Arcaica — pesquisa melhorias de armas, armaduras e escudos rúnicos.',
      };
    }
    if (kind === 'barracks') {
      return {
        ...base,
        name: 'Casa Comunal (Longhouse)',
        role: 'Treina infantaria básica nórdica: Ulfsark (Berserker), Lançador de Machado e Huskarl.',
      };
    }
    if (kind === 'great_hall') {
      return {
        ...base,
        name: 'Grande Salão',
        role: 'Nova construção de Retold — treina Cavalaria de Incursão, Jarls e heróis Hersir.',
      };
    }
    if (kind === 'fortress') {
      return {
        ...base,
        name: 'Forte da Colina',
        role: 'Fortaleza da Era Heroica — treina Huskarls, Jarls, heróis Hersir e armas de cerco.',
      };
    }
    if (kind === 'asgard_hill_fort') {
      return {
        ...base,
        name: 'Forte de Asgard (Freyr)',
        role: 'Versão abençoada invocada por Freyr — maior resistência, fogo defensivo e produção nórdica.',
      };
    }
    if (kind === 'archery_range') {
      return {
        ...base,
        name: 'Salão de Lançadores',
        role: 'Treina Guerreiros de Machado de Arremesso e Caçadores Rúnicos.',
      };
    }
    if (kind === 'stable') {
      return {
        ...base,
        name: 'Estábulo de Incursão',
        role: 'Treina Cavalaria de Incursão e Jarls.',
      };
    }
    if (kind === 'temple') {
      return {
        ...base,
        name: `Templo Nórdico Hof (${p.deity})`,
        role: 'Igreja de madeira em camadas cercada por runas — invoca Hersirs, Godis e criaturas míticas.',
      };
    }
    if (kind === 'house') {
      return {
        ...base,
        name: 'Casa Nórdica',
        role: 'Habitação viking de madeira entalhada e base de pedra (+8 de população).',
        popBonus: 8,
      };
    }
  }

  if (pantheon === 'atlantean') {
    if (kind === 'town_center') {
      return {
        ...base,
        name: `Cidadela Atlante (${p.name})`,
        role: 'Centro imperial de oricalco — treina Cidadãos Atlantes (sem depósito) e Oráculos.',
      };
    }
    if (kind === 'village_center') {
      return {
        ...base,
        name: 'Centro da Vila Atlante',
        role: 'Base avançada construível em qualquer terreno livre — treina Cidadãos e Oráculos.',
      };
    }
    if (kind === 'house') {
      return {
        ...base,
        name: 'Mansão Atlante',
        role: 'Substitui a Casa comum — oferece +10 de população e estrutura reforçada em oricalco.',
        maxHp: 680,
        popBonus: 10,
      };
    }
    if (kind === 'economic_guild') {
      return {
        ...base,
        name: 'Guilda Econômica',
        role: 'Substitui pontos de coleta — pesquisa Machado de Mão, Picareta e Arado.',
      };
    }
    if (kind === 'barracks') {
      return {
        ...base,
        name: 'Quartel Militar Atlante',
        role: 'Treina soldados principais: Murmillo, Arcus e Contarius.',
      };
    }
    if (kind === 'counter_barracks') {
      return {
        ...base,
        name: 'Quartel de Contra-Ataque',
        role: 'Treina tropas especializadas: Katapeltes (vs Cavalaria), Turma (vs Arqueiros) e Cheiroballista.',
      };
    }
    if (kind === 'fortress') {
      return {
        ...base,
        name: 'Palácio Atlante',
        role: 'Fortaleza real da Era Heroica — treina Destruidor, Fanático, Sifão de Fogo e Onagro.',
      };
    }
    if (kind === 'sky_passage') {
      return {
        ...base,
        name: 'Passagem Celeste (Urano)',
        role: 'Portal exclusivo de Urano — teleporta tropas aliadas próximas para outra Passagem Celeste.',
      };
    }
    if (kind === 'mirror_tower') {
      return {
        ...base,
        name: 'Torre Espelho (Hélios)',
        role: 'Torre defensiva exclusiva de Hélios — concentra feixes de luz solar com altíssimo dano.',
      };
    }
    if (kind === 'market') {
      return {
        ...base,
        name: 'Mercado Atlante',
        role: 'Treina Caravanas de Lhama para rotas automáticas de Ouro e troca de recursos.',
      };
    }
    if (kind === 'temple') {
      return {
        ...base,
        name: `Templo dos Titãs (${p.deity})`,
        role: 'Treina Oráculos e invoca Unidades Míticas concedidas pelos Deuses Menores Atlantes.',
      };
    }
  }

  if (pantheon === 'egyptian') {
    if (kind === 'town_center') {
      return { ...base, name: `Palácio do Nilo (${p.name})` };
    }
    if (kind === 'village_center') {
      return { ...base, name: 'Centro da Vila Egípcia' };
    }
    if (kind === 'house') {
      return { ...base, cost: { gold: 55 }, name: 'Casa Egípcia' };
    }
    if (kind === 'granary') {
      return { ...base, cost: { gold: 45 }, name: 'Celeiro Egípcio', role: 'Ponto de entrega de Alimento e pesquisa de Arado.' };
    }
    if (kind === 'lumber_camp') {
      return { ...base, cost: { gold: 45 }, name: 'Campo Madeireiro', role: 'Ponto de coleta de Madeira e pesquisa de Machado de Mão.' };
    }
    if (kind === 'mining_camp') {
      return { ...base, cost: { gold: 50 }, name: 'Campo de Mineração', role: 'Ponto de coleta de Ouro e pesquisa de Picareta.' };
    }
    if (kind === 'monument') {
      return { ...base, name: 'Monumento Sagrado', role: 'Até 5 monumentos que geram Favor Divino continuamente ao serem erguidos.' };
    }
    if (kind === 'obelisk') {
      return { ...base, name: 'Obelisco Vigia', role: 'Estrutura barata de granito que revela ampla visão do mapa.' };
    }
    if (kind === 'lighthouse') {
      return { ...base, name: 'Farol do Nilo', role: 'Estrutura monumental da Era Mítica que ilumina vastas áreas do mapa.' };
    }
    if (kind === 'barracks') {
      return {
        ...base,
        minAge: 2,
        cost: { gold: 110 },
        name: 'Quartel Egípcio',
        role: 'Treina Lanceiros, Fundeiros e Homens-Machado e pesquisa melhorias militares.',
      };
    }
    if (kind === 'siege_works') {
      return {
        ...base,
        cost: { gold: 185 },
        name: 'Oficina de Cerco',
        role: 'Produz Torres de Cerco e Catapultas solares.',
      };
    }
    if (kind === 'fortress') {
      return {
        ...base,
        cost: { gold: 320 },
        name: 'Fortaleza Migdol',
        role: 'Castelo egípcio da Era Heroica — treina Arqueiros de Biga, Camelos, Elefantes e pesquisa upgrades de elite.',
      };
    }
    if (kind === 'temple') {
      return { ...base, cost: { gold: 180 }, name: `Templo Solar de ${p.deity}` };
    }
  }

  // Chineses (Immortal Pillars)
  if (pantheon === 'chinese') {
    if (kind === 'town_center') return { ...base, name: `Pagode Imperial (${p.name})`, role: 'Centro imperial chinês — treina Camponeses, Kuafus Gigantes e herói Nezha.' };
    if (kind === 'village_center') return { ...base, name: 'Pavilhão da Vila Imperial' };
    if (kind === 'house') return { ...base, name: 'Casa de Pagode', popBonus: 7 };
    if (kind === 'granary') return { ...base, name: 'Celeiro Imperial' };
    if (kind === 'storehouse') return { ...base, name: 'Armazém de Jade' };
    if (kind === 'barracks') return { ...base, name: 'Campo Militar Imperial', role: 'Treina Alabardeiros Imperiais anti-cavalaria.' };
    if (kind === 'archery_range') return { ...base, name: 'Campo de Bestas Chu-Ko-Nu', role: 'Treina Bestadeiros Chu-Ko-Nu de repetição rápida.' };
    if (kind === 'stable') return { ...base, name: 'Estábulo Imperial', role: 'Treina Cavalaria Tigre pesada.' };
    if (kind === 'siege_works') return { ...base, name: 'Oficina de Pólvora', role: 'Produz Lança-Fogos Imperiais de área.' };
    if (kind === 'fortress') return { ...base, name: 'Bastião da Grande Muralha', role: 'Fortaleza imperial — treina o Sábio Jiang Ziya e armas de pólvora.' };
    if (kind === 'temple') return { ...base, name: `Pagode Sagrado de ${p.deity}`, role: 'Gera Favor e invoca Qilin, Taotie, Yazi e Dragão Azul.' };
    if (kind === 'dock') return { ...base, name: 'Estaleiro Imperial', role: 'Constrói Juncos Pesqueiros, Trirremes e Navios de Transporte.' };
  }

  // Gregos & Padrão
  if (pantheon === 'greek') {
    if (kind === 'town_center') return { ...base, name: `Ágora / Centro Helênico (${p.name})` };
    if (kind === 'village_center') return { ...base, name: 'Centro da Vila Helênica' };
    if (kind === 'granary') return { ...base, name: 'Celeiro (Granary)' };
    if (kind === 'storehouse') return { ...base, name: 'Armazém (Storehouse)' };
    if (kind === 'barracks') return { ...base, name: 'Academia Militar', role: 'Treina infantaria grega (Hoplita e Hipaspista).' };
    if (kind === 'archery_range') return { ...base, name: 'Campo de Arquearia', role: 'Treina arqueiros e fundeiros (Toxotes, Peltasta e Gastraphetes).' };
    if (kind === 'stable') return { ...base, name: 'Estábulo', role: 'Treina cavalaria helênica (Hippikon e Pródromo).' };
    if (kind === 'fortress') return { ...base, name: 'Fortaleza Grega', role: 'Construção defensiva da Era Heroica — treina Mirmidões, Heróis e Cerco.' };
    if (kind === 'temple') return { ...base, name: `Templo de ${p.deity}` };
  }

  if (kind === 'town_center') {
    return { ...base, name: `Cidadela (${p.name})` };
  }
  if (kind === 'temple') {
    return { ...base, name: `Templo de ${p.deity}` };
  }
  return base;
}

export function getAvailableBuildingKinds(
  pantheon: PantheonId,
  majorGodName: string,
  chosenMinorGods: string[],
  titansEnabled: boolean
): BuildingKind[] {
  const godKey = (majorGodName ?? '').trim().toLowerCase();
  const list: BuildingKind[] = [];

  if (pantheon === 'greek') {
    list.push(
      'house',
      'granary',
      'storehouse',
      'farm',
      'village_center',
      'barracks',
      'archery_range',
      'stable',
      'armory',
      'market',
      'temple',
      'dock',
      'tower',
      'wall',
      'gate',
      'fortress',
      'siege_works',
      'wonder'
    );
  } else if (pantheon === 'egyptian') {
    // Egípcios não constroem Arsenal comum; usam Monumentos, Obelisco, Farol, Campos e Migdol
    list.push(
      'house',
      'farm',
      'granary',
      'lumber_camp',
      'mining_camp',
      'village_center',
      'monument',
      'obelisk',
      'barracks',
      'market',
      'temple',
      'dock',
      'tower',
      'wall',
      'gate',
      'siege_works',
      'fortress',
      'lighthouse',
      'wonder'
    );
  } else if (pantheon === 'norse' || pantheon === 'jotunn') {
    // Nórdicos usam Carro de Boi no lugar de depósitos fixos, Arsenal dos Anões na Era I, Grande Salão e Forte da Colina
    list.push(
      'house',
      'farm',
      'village_center',
      'armory',
      'barracks',
      'great_hall',
      'market',
      'temple',
      'dock',
      'tower',
      'wall',
      'gate',
      'fortress',
      ...(godKey === 'freyr' ? (['asgard_hill_fort'] as BuildingKind[]) : []),
      'siege_works',
      'wonder'
    );
  } else if (pantheon === 'atlantean') {
    // Atlantes usam Mansão, Guilda Econômica, Quartel Militar, Quartel de Contra-Ataque, Palácio + exclusivos
    list.push(
      'house',
      'economic_guild',
      'farm',
      'village_center',
      'barracks',
      'counter_barracks',
      'armory',
      'market',
      'temple',
      'dock',
      'tower',
      'wall',
      'gate',
      'fortress',
      ...(godKey === 'urano' || godKey === 'oranos' ? (['sky_passage'] as BuildingKind[]) : []),
      ...(chosenMinorGods.includes('Helios') ? (['mirror_tower'] as BuildingKind[]) : []),
      'wonder'
    );
  } else if (pantheon === 'chinese') {
    list.push(
      'house',
      'granary',
      'storehouse',
      'farm',
      'village_center',
      'barracks',
      'archery_range',
      'stable',
      'armory',
      'market',
      'temple',
      'dock',
      'tower',
      'wall',
      'gate',
      'fortress',
      'siege_works',
      'wonder'
    );
  } else {
    list.push(
      'house',
      'farm',
      'granary',
      'storehouse',
      'village_center',
      'barracks',
      'archery_range',
      'stable',
      'armory',
      'market',
      'temple',
      'dock',
      'tower',
      'wall',
      'gate',
      'fortress',
      'siege_works',
      'wonder'
    );
  }

  if (titansEnabled) {
    list.push('titan_gate');
  }
  return list;
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
  if (mapId === 'nile' || mapId === 'oasis' || mapId === 'valley_of_the_kings') {
    return playerPantheon === 'egyptian' ? 'greek' : 'egyptian';
  }
  if (mapId === 'alfheim' || mapId === 'jotunheim' || mapId === 'tundra' || mapId === 'midgard' || mapId === 'vinlandsaga' || mapId === 'ghost_lake') {
    return playerPantheon === 'norse' ? 'jotunn' : 'norse';
  }
  if (mapId === 'islands' || mapId === 'archipelago' || mapId === 'megalopolis' || mapId === 'sea_of_worms') {
    return playerPantheon === 'atlantean' ? 'greek' : 'atlantean';
  }
  if (mapId === 'yucatan') return playerPantheon === 'aztec' ? 'roman' : 'aztec';
  if (mapId === 'yellow_river') return playerPantheon === 'chinese' ? 'egyptian' : 'chinese';
  if (mapId === 'erebus') return playerPantheon === 'eldritch' ? 'greek' : 'eldritch';
  if (mapId === 'savannah' || mapId === 'watering_hole' || mapId === 'anatolia') {
    return playerPantheon === 'egyptian' ? 'babylonian' : 'egyptian';
  }
  const defaultRival: Record<PantheonId, PantheonId> = {
    greek: 'egyptian',
    egyptian: 'norse',
    norse: 'atlantean',
    atlantean: 'chinese',
    chinese: 'greek',
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
