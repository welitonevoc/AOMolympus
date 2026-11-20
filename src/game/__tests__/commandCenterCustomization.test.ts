import { describe, expect, it } from 'vitest';
import {
  getBuildingCategory,
  getBuildingCommandProfile,
  getBuildingExclusiveTechs,
  getBuildingExclusiveUnits,
  getVillagerCultureDetails,
} from '../../components/hud/commandCenterUtils';
import { getUnitKindsForPantheon } from '../../components/hud/hudTypes';
import { getAvailableBuildingKinds, getCivUnitSpec, TECH_SPECS } from '../divineData';
import { matchesUnitProducer } from '../engine/buildingsAndProductionSystem';
import { BuildingKind, PantheonId } from '../types';

describe('Customized Command Center (CM) & Retold Fortress Architecture', () => {
  it('customizes villager & builder culture details for every worker and Norse combat builder type', () => {
    const greek = getVillagerCultureDetails('greek', 'villager', false);
    expect(greek.title).toBe('Aldeão Helênico');
    expect(greek.badge).toContain('Oração');
    expect(greek.isCombatBuilder).toBeFalsy();

    const egyptian = getVillagerCultureDetails('egyptian', 'villager', false);
    expect(egyptian.title).toBe('Operário Egípcio');
    expect(egyptian.badge).toContain('Faraó');

    const norseGatherer = getVillagerCultureDetails('norse', 'villager', false);
    expect(norseGatherer.title).toBe('Coletor Nórdico');
    expect(norseGatherer.defaultTab).toBe('eco');
    expect(norseGatherer.isCombatBuilder).toBeFalsy();

    const norseDwarf = getVillagerCultureDetails('norse', 'norse_dwarf', false);
    expect(norseDwarf.title).toBe('Anão Minerador Nórdico');
    expect(norseDwarf.badge).toContain('+20% Ouro');

    const norseUlfsark = getVillagerCultureDetails('norse', 'ulfsark', false);
    expect(norseUlfsark.title).toBe('Ulfsark Construtor');
    expect(norseUlfsark.defaultTab).toBe('military');
    expect(norseUlfsark.isCombatBuilder).toBe(true);

    const atlanteanCitizen = getVillagerCultureDetails('atlantean', 'citizen', false);
    expect(atlanteanCitizen.title).toContain('Cidadão Atlante');
    expect(atlanteanCitizen.badge).toContain('Lhama Integrada');

    const atlanteanHero = getVillagerCultureDetails('atlantean', 'citizen', true);
    expect(atlanteanHero.title).toBe('Cidadão Herói Atlante ★');
    expect(atlanteanHero.isHero).toBe(true);

    const chinesePeasant = getVillagerCultureDetails('chinese', 'chinese_peasant', false);
    expect(chinesePeasant.title).toBe('Camponês Chinês');

    const kuafu = getVillagerCultureDetails('chinese', 'kuafu', false);
    expect(kuafu.title).toBe('Kuafu Construtor');
  });

  it('categorizes buildings into clean tabs (eco, military, defense, divine) to enxugar a barra', () => {
    expect(getBuildingCategory('house')).toBe('eco');
    expect(getBuildingCategory('granary')).toBe('eco');
    expect(getBuildingCategory('storehouse')).toBe('eco');
    expect(getBuildingCategory('economic_guild')).toBe('eco');
    expect(getBuildingCategory('farm')).toBe('eco');
    expect(getBuildingCategory('market')).toBe('eco');
    expect(getBuildingCategory('town_center')).toBe('eco');
    expect(getBuildingCategory('village_center')).toBe('eco');

    expect(getBuildingCategory('barracks')).toBe('military');
    expect(getBuildingCategory('counter_barracks')).toBe('military');
    expect(getBuildingCategory('archery_range')).toBe('military');
    expect(getBuildingCategory('stable')).toBe('military');
    expect(getBuildingCategory('great_hall')).toBe('military');
    expect(getBuildingCategory('fortress')).toBe('military');
    expect(getBuildingCategory('asgard_hill_fort')).toBe('military');
    expect(getBuildingCategory('siege_works')).toBe('military');

    expect(getBuildingCategory('tower')).toBe('defense');
    expect(getBuildingCategory('mirror_tower')).toBe('defense');
    expect(getBuildingCategory('wall')).toBe('defense');
    expect(getBuildingCategory('gate')).toBe('defense');
    expect(getBuildingCategory('sky_passage')).toBe('defense');

    expect(getBuildingCategory('temple')).toBe('divine');
    expect(getBuildingCategory('monument')).toBe('divine');
    expect(getBuildingCategory('wonder')).toBe('divine');
    expect(getBuildingCategory('titan_gate')).toBe('divine');
  });

  it('returns tailored building command profiles for Fortress, Temple, Barracks, and cultural variants', () => {
    expect(getBuildingCommandProfile('fortress', 'greek', 'Zeus', 3).title).toBe('Fortaleza Helênica');
    expect(getBuildingCommandProfile('fortress', 'egyptian', 'Ra', 3).title).toBe('Fortaleza Migdol');
    expect(getBuildingCommandProfile('fortress', 'norse', 'Thor', 3).title).toBe('Forte da Colina');
    expect(getBuildingCommandProfile('fortress', 'atlantean', 'Kronos', 3).title).toBe('Palácio Atlante');
    expect(getBuildingCommandProfile('temple', 'greek', 'Hades', 2).title).toBe('Templo de Hades');
  });

  it('filters Fortress units exclusively per civilization and Major God according to Retold & Titans', () => {
    const greekKinds = getUnitKindsForPantheon('greek', 'Zeus');
    const greekUnits = greekKinds.map((k) => getCivUnitSpec('greek', k));

    // Zeus Fortress: Myrmidon + Siege (ram/siege)
    const zeusUnitKinds = getBuildingExclusiveUnits('fortress', 'greek', 'Zeus', greekUnits).map((u) => u.kind);
    expect(zeusUnitKinds).toContain('myrmidon');
    expect(zeusUnitKinds).toContain('ram');
    expect(zeusUnitKinds).toContain('siege');
    expect(zeusUnitKinds).not.toContain('hoplite');
    expect(zeusUnitKinds).not.toContain('archer');
    expect(zeusUnitKinds).not.toContain('minotaur');

    // Poseidon Fortress: Hetairoi (cavalry) + Siege
    const posUnitKinds = getBuildingExclusiveUnits('fortress', 'greek', 'Poseidon', greekUnits).map((u) => u.kind);
    expect(posUnitKinds).toContain('cavalry');
    expect(posUnitKinds).not.toContain('myrmidon');

    // Hades Fortress: Gastraphetes + Siege
    const hadesUnitKinds = getBuildingExclusiveUnits('fortress', 'greek', 'Hades', greekUnits).map((u) => u.kind);
    expect(hadesUnitKinds).toContain('gastraphetes');
    expect(hadesUnitKinds).not.toContain('myrmidon');

    // Egyptian Migdol Stronghold: War Elephant, Camel Rider, Chariot Archer, Siege Tower, Catapult
    const egUnits = getUnitKindsForPantheon('egyptian', 'Ra').map((k) => getCivUnitSpec('egyptian', k));
    const egFortressKinds = getBuildingExclusiveUnits('fortress', 'egyptian', 'Ra', egUnits).map((u) => u.kind);
    expect(egFortressKinds).toContain('war_elephant');
    expect(egFortressKinds).toContain('camel_rider');
    expect(egFortressKinds).toContain('chariot_archer');
    expect(egFortressKinds).toContain('siege_tower');
    expect(egFortressKinds).toContain('egypt_catapult');
    expect(egFortressKinds).not.toContain('villager');
    expect(egFortressKinds).not.toContain('anubite');

    // Norse Hill Fort: Huskarl, Jarl, Portable Ram, Ballista
    const norseUnits = getUnitKindsForPantheon('norse', 'Thor').map((k) => getCivUnitSpec('norse', k));
    const norseHillFortKinds = getBuildingExclusiveUnits('fortress', 'norse', 'Thor', norseUnits).map((u) => u.kind);
    expect(norseHillFortKinds).toContain('huskarl');
    expect(norseHillFortKinds).toContain('jarl');
    expect(norseHillFortKinds).toContain('portable_ram');
    expect(norseHillFortKinds).toContain('norse_ballista');
    expect(norseHillFortKinds).not.toContain('villager');
    expect(norseHillFortKinds).not.toContain('valkyrie');

    // Atlantean Palace: Destroyer, Fanatic, Fire Siphon, Onager, Cheiroballista
    const atlUnits = getUnitKindsForPantheon('atlantean', 'Kronos').map((k) => getCivUnitSpec('atlantean', k));
    const atlPalaceKinds = getBuildingExclusiveUnits('fortress', 'atlantean', 'Kronos', atlUnits).map((u) => u.kind);
    expect(atlPalaceKinds).toContain('destroyer');
    expect(atlPalaceKinds).toContain('fanatic');
    expect(atlPalaceKinds).toContain('fire_siphon');
    expect(atlPalaceKinds).toContain('onager');
    expect(atlPalaceKinds).not.toContain('citizen');
    expect(atlPalaceKinds).not.toContain('promethean');
  });

  it('filters Temple, Barracks, Counter-Barracks, Archery Range, TC, and Market exclusively per pantheon', () => {
    const greekUnits = getUnitKindsForPantheon('greek', 'Zeus').map((k) => getCivUnitSpec('greek', k));
    const templeUnits = getBuildingExclusiveUnits('temple', 'greek', 'Zeus', greekUnits);
    for (const u of templeUnits) {
      expect(u.isMythic || u.isMajorGod || u.isGod).toBe(true);
    }
    expect(templeUnits.map((u) => u.kind)).not.toContain('hoplite');

    const greekBarracks = getBuildingExclusiveUnits('barracks', 'greek', 'Zeus', greekUnits).map((u) => u.kind);
    expect(greekBarracks).toEqual(expect.arrayContaining(['hoplite', 'hipaspist']));
    expect(greekBarracks).not.toContain('archer');

    const greekArchery = getBuildingExclusiveUnits('archery_range', 'greek', 'Zeus', greekUnits).map((u) => u.kind);
    expect(greekArchery).toEqual(expect.arrayContaining(['archer', 'peltast']));
    expect(greekArchery).not.toContain('hoplite');

    // Egyptian Barracks: Spearman, Slinger, Axeman
    const egUnits = getUnitKindsForPantheon('egyptian', 'Ra').map((k) => getCivUnitSpec('egyptian', k));
    const egBarracks = getBuildingExclusiveUnits('barracks', 'egyptian', 'Ra', egUnits).map((u) => u.kind);
    expect(egBarracks).toEqual(expect.arrayContaining(['egypt_spearman', 'slinger', 'axeman']));
    expect(egBarracks).not.toContain('war_elephant');

    // Atlantean Barracks vs Counter-Barracks vs Market
    const atlUnits = getUnitKindsForPantheon('atlantean', 'Kronos').map((k) => getCivUnitSpec('atlantean', k));
    const atlBarracks = getBuildingExclusiveUnits('barracks', 'atlantean', 'Kronos', atlUnits).map((u) => u.kind);
    expect(atlBarracks).toEqual(expect.arrayContaining(['murmillo', 'arcus', 'contarius']));
    expect(atlBarracks).not.toContain('katapeltes');

    const atlCounter = getBuildingExclusiveUnits('counter_barracks', 'atlantean', 'Kronos', atlUnits).map((u) => u.kind);
    expect(atlCounter).toEqual(expect.arrayContaining(['katapeltes', 'turma', 'cheiroballista']));

    const atlMarket = getBuildingExclusiveUnits('market', 'atlantean', 'Kronos', atlUnits).map((u) => u.kind);
    expect(atlMarket).toContain('llama_caravan');

    // Norse Town Center: Villager, Dwarf, Ox Cart
    const norseUnits = getUnitKindsForPantheon('norse', 'Thor').map((k) => getCivUnitSpec('norse', k));
    const norseTc = getBuildingExclusiveUnits('town_center', 'norse', 'Thor', norseUnits).map((u) => u.kind);
    expect(norseTc).toEqual(expect.arrayContaining(['villager', 'norse_dwarf', 'ox_cart']));
  });

  it('filters Fortress and Temple technologies cleanly', () => {
    const allTechs = Object.values(TECH_SPECS);
    const fortressTechIds = getBuildingExclusiveTechs('fortress', 'greek', 'Zeus', allTechs).map((t) => t.id);
    expect(fortressTechIds).toEqual(
      expect.arrayContaining(['burning_pitch', 'engineers', 'watch_tower', 'ballistics'])
    );
    expect(fortressTechIds).not.toContain('hand_axe');
    expect(fortressTechIds).not.toContain('omniscience');

    const templeTechIds = getBuildingExclusiveTechs('temple', 'greek', 'Zeus', allTechs).map((t) => t.id);
    expect(templeTechIds).toEqual(
      expect.arrayContaining(['omniscience', 'mythic_rejuvenation', 'secrets_of_titans'])
    );
    expect(templeTechIds).not.toContain('hand_axe');
    expect(templeTechIds).not.toContain('engineers');
  });

  it('guarantees 100% engine parity: every unit shown in CM is trainable via matchesUnitProducer', () => {
    const setups: { pantheon: PantheonId; god: string }[] = [
      { pantheon: 'greek', god: 'Zeus' },
      { pantheon: 'greek', god: 'Poseidon' },
      { pantheon: 'greek', god: 'Hades' },
      { pantheon: 'egyptian', god: 'Ra' },
      { pantheon: 'norse', god: 'Thor' },
      { pantheon: 'atlantean', god: 'Kronos' },
      { pantheon: 'chinese', god: 'Fuxi' },
    ];
    for (const { pantheon, god } of setups) {
      const unitList = getUnitKindsForPantheon(pantheon, god).map((k) => getCivUnitSpec(pantheon, k));
      const civBuildings = new Set<BuildingKind>(getAvailableBuildingKinds(pantheon, god, [], true));
      if (pantheon === 'norse') civBuildings.add('asgard_hill_fort');
      for (const bKind of civBuildings) {
        const shown = getBuildingExclusiveUnits(bKind, pantheon, god, unitList);
        for (const u of shown) {
          expect(
            matchesUnitProducer(u.kind, u, bKind),
            `Unit "${u.kind}" shown in CM for ${pantheon}/${god} "${bKind}" must pass matchesUnitProducer`
          ).toBe(true);
        }
      }
    }
  });

  it('guarantees 100% engine parity: every tech shown in CM is researchable at that building', () => {
    const allTechs = Object.values(TECH_SPECS);
    const setups: { pantheon: PantheonId; god: string; minors: string[] }[] = [
      { pantheon: 'greek', god: 'Zeus', minors: ['Ares', 'Athena', 'Apollo', 'Aphrodite', 'Artemis', 'Hephaestus'] },
      { pantheon: 'egyptian', god: 'Ra', minors: ['Anubis'] },
      { pantheon: 'norse', god: 'Thor', minors: [] },
      { pantheon: 'atlantean', god: 'Kronos', minors: ['Leto', 'Rheia'] },
      { pantheon: 'chinese', god: 'Fuxi', minors: [] },
    ];
    const buildings: BuildingKind[] = [
      'town_center',
      'village_center',
      'granary',
      'storehouse',
      'lumber_camp',
      'mining_camp',
      'economic_guild',
      'armory',
      'barracks',
      'counter_barracks',
      'archery_range',
      'stable',
      'great_hall',
      'siege_works',
      'fortress',
      'asgard_hill_fort',
      'tower',
      'mirror_tower',
      'temple',
    ];

    for (const { pantheon, god, minors } of setups) {
      for (const bKind of buildings) {
        const shown = getBuildingExclusiveTechs(bKind, pantheon, god, allTechs, minors);
        for (const t of shown) {
          const validBuildings: BuildingKind[] = [t.building, ...(t.secondaryBuildings ?? [])];
          if (validBuildings.includes('fortress') && !validBuildings.includes('asgard_hill_fort')) {
            validBuildings.push('asgard_hill_fort');
          }
          expect(
            validBuildings.includes(bKind),
            `Tech "${t.id}" shown in CM for ${pantheon}/${god} "${bKind}" must be valid in researchTech`
          ).toBe(true);
        }
      }
    }
  });
});
