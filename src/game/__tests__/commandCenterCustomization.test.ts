import { describe, expect, it } from 'vitest';
import {
  getBuildingCategory,
  getBuildingExclusiveTechs,
  getBuildingExclusiveUnits,
  getVillagerCultureDetails,
} from '../../components/hud/commandCenterUtils';
import {
  getCivUnitSpec,
  TECH_SPECS,
} from '../divineData';
import { getUnitKindsForPantheon } from '../../components/hud/hudTypes';
import { BuildingKind, PantheonId, UnitStats } from '../types';

describe('Customized Command Center (CM) & Retold Fortress Architecture', () => {
  it('customizes villager culture details and trait badges for all pantheons and worker types', () => {
    // Greek Villager
    const greek = getVillagerCultureDetails('greek', 'villager', false);
    expect(greek.title).toBe('Aldeão Helênico');
    expect(greek.badge).toContain('Oração no Templo');

    // Egyptian Laborer
    const egyptian = getVillagerCultureDetails('egyptian', 'villager', false);
    expect(egyptian.title).toBe('Operário Egípcio');
    expect(egyptian.badge).toContain('Bênção do Faraó');

    // Norse Gatherer
    const norseGatherer = getVillagerCultureDetails('norse', 'villager', false);
    expect(norseGatherer.title).toBe('Coletor Nórdico');
    expect(norseGatherer.badge).toContain('Infantaria ergue Quartéis');

    // Norse Dwarf
    const norseDwarf = getVillagerCultureDetails('norse', 'dwarf', false);
    expect(norseDwarf.title).toBe('Anão Minerador Nórdico');
    expect(norseDwarf.badge).toContain('+20% Mineração de Ouro');

    // Atlantean Citizen
    const atlanteanCitizen = getVillagerCultureDetails('atlantean', 'villager', false);
    expect(atlanteanCitizen.title).toContain('Cidadão Atlante');
    expect(atlanteanCitizen.badge).toContain('Lhama Integrada');

    // Atlantean Citizen Hero
    const atlanteanHero = getVillagerCultureDetails('atlantean', 'villager', true);
    expect(atlanteanHero.title).toBe('Cidadão Herói Atlante ★');
    expect(atlanteanHero.badge).toContain('Herói ★');
  });

  it('categorizes buildings into clean tabs (eco, military, defense, divine) to enxugar a barra', () => {
    expect(getBuildingCategory('house')).toBe('eco');
    expect(getBuildingCategory('granary')).toBe('eco');
    expect(getBuildingCategory('storehouse')).toBe('eco');
    expect(getBuildingCategory('farm')).toBe('eco');
    expect(getBuildingCategory('market')).toBe('eco');

    expect(getBuildingCategory('barracks')).toBe('military');
    expect(getBuildingCategory('archery_range')).toBe('military');
    expect(getBuildingCategory('stable')).toBe('military');
    expect(getBuildingCategory('fortress')).toBe('military');
    expect(getBuildingCategory('asgard_hill_fort')).toBe('military');
    expect(getBuildingCategory('siege_works')).toBe('military');

    expect(getBuildingCategory('tower')).toBe('defense');
    expect(getBuildingCategory('wall')).toBe('defense');
    expect(getBuildingCategory('gate')).toBe('defense');
    expect(getBuildingCategory('sky_passage')).toBe('defense');

    expect(getBuildingCategory('temple')).toBe('divine');
    expect(getBuildingCategory('monument')).toBe('divine');
    expect(getBuildingCategory('wonder')).toBe('divine');
    expect(getBuildingCategory('titan_gate')).toBe('divine');
  });

  it('filters Fortress units exclusively per civilization and Major God according to Retold & Titans', () => {
    const greekKinds = getUnitKindsForPantheon('greek', 'Zeus');
    const greekUnits = greekKinds.map((k) => getCivUnitSpec('greek', k));

    // Zeus Fortress: Myrmidon + Siege (ram/siege)
    const zeusFortressUnits = getBuildingExclusiveUnits('fortress', 'greek', 'Zeus', greekUnits);
    const zeusUnitKinds = zeusFortressUnits.map((u) => u.kind);
    expect(zeusUnitKinds).toContain('myrmidon');
    expect(zeusUnitKinds).toContain('ram');
    expect(zeusUnitKinds).toContain('siege');
    expect(zeusUnitKinds).not.toContain('hoplite');
    expect(zeusUnitKinds).not.toContain('archer');
    expect(zeusUnitKinds).not.toContain('minotaur');

    // Poseidon Fortress: Hetairoi (cavalry) + Siege
    const posFortressUnits = getBuildingExclusiveUnits('fortress', 'greek', 'Poseidon', greekUnits);
    const posUnitKinds = posFortressUnits.map((u) => u.kind);
    expect(posUnitKinds).toContain('cavalry');
    expect(posUnitKinds).not.toContain('myrmidon');

    // Hades Fortress: Gastraphetes + Siege
    const hadesFortressUnits = getBuildingExclusiveUnits('fortress', 'greek', 'Hades', greekUnits);
    const hadesUnitKinds = hadesFortressUnits.map((u) => u.kind);
    expect(hadesUnitKinds).toContain('gastraphetes');
    expect(hadesUnitKinds).not.toContain('myrmidon');

    // Egyptian Migdol Stronghold: War Elephant, Camel Rider, Chariot Archer, Siege Tower, Catapult
    const egKinds = getUnitKindsForPantheon('egyptian', 'Ra');
    const egUnits = egKinds.map((k) => getCivUnitSpec('egyptian', k));
    const egFortressUnits = getBuildingExclusiveUnits('fortress', 'egyptian', 'Ra', egUnits);
    const egFortressKinds = egFortressUnits.map((u) => u.kind);
    expect(egFortressKinds).toContain('war_elephant');
    expect(egFortressKinds).toContain('camel_rider');
    expect(egFortressKinds).toContain('chariot_archer');
    expect(egFortressKinds).not.toContain('villager');
    expect(egFortressKinds).not.toContain('anubite');

    // Norse Hill Fort: Huskarl, Jarl, Portable Ram, Ballista
    const norseKinds = getUnitKindsForPantheon('norse', 'Thor');
    const norseUnits = norseKinds.map((k) => getCivUnitSpec('norse', k));
    const norseHillFortUnits = getBuildingExclusiveUnits('fortress', 'norse', 'Thor', norseUnits);
    const norseHillFortKinds = norseHillFortUnits.map((u) => u.kind);
    expect(norseHillFortKinds).toContain('huskarl');
    expect(norseHillFortKinds).toContain('jarl');
    expect(norseHillFortKinds).not.toContain('villager');
    expect(norseHillFortKinds).not.toContain('valkyrie');

    // Atlantean Palace: Fanatic, Fire Siphon, Onager, Cheiroballista
    const atlKinds = getUnitKindsForPantheon('atlantean', 'Kronos');
    const atlUnits = atlKinds.map((k) => getCivUnitSpec('atlantean', k));
    const atlPalaceUnits = getBuildingExclusiveUnits('fortress', 'atlantean', 'Kronos', atlUnits);
    const atlPalaceKinds = atlPalaceUnits.map((u) => u.kind);
    expect(atlPalaceKinds).toContain('fanatic');
    expect(atlPalaceKinds).toContain('fire_siphon');
    expect(atlPalaceKinds).toContain('onager');
    expect(atlPalaceKinds).not.toContain('villager');
    expect(atlPalaceKinds).not.toContain('promethean');
  });

  it('filters Temple units to Myth Units only and excludes mortal soldiers', () => {
    const greekKinds = getUnitKindsForPantheon('greek', 'Zeus');
    const greekUnits = greekKinds.map((k) => getCivUnitSpec('greek', k));

    const templeUnits = getBuildingExclusiveUnits('temple', 'greek', 'Zeus', greekUnits);
    for (const u of templeUnits) {
      expect(u.isMythic || u.isMajorGod).toBe(true);
    }
    const templeKinds = templeUnits.map((u) => u.kind);
    expect(templeKinds).not.toContain('hoplite');
    expect(templeKinds).not.toContain('myrmidon');
    expect(templeKinds).not.toContain('villager');
  });

  it('filters Barracks to Infantry and Archery Range to Ranged units only', () => {
    const greekKinds = getUnitKindsForPantheon('greek', 'Zeus');
    const greekUnits = greekKinds.map((k) => getCivUnitSpec('greek', k));

    const barracksUnits = getBuildingExclusiveUnits('barracks', 'greek', 'Zeus', greekUnits);
    const barracksKinds = barracksUnits.map((u) => u.kind);
    expect(barracksKinds).toContain('hoplite');
    expect(barracksKinds).toContain('hipaspist');
    expect(barracksKinds).not.toContain('archer');
    expect(barracksKinds).not.toContain('cavalry');
    expect(barracksKinds).not.toContain('ram');

    const archeryUnits = getBuildingExclusiveUnits('archery_range', 'greek', 'Zeus', greekUnits);
    const archeryKinds = archeryUnits.map((u) => u.kind);
    expect(archeryKinds).toContain('archer');
    expect(archeryKinds).toContain('peltast');
    expect(archeryKinds).not.toContain('hoplite');
    expect(archeryKinds).not.toContain('cavalry');
  });

  it('filters Fortress technologies to Burning Pitch, Engineers, Watch Tower/Ameias, and Ballistics', () => {
    const allTechs = Object.values(TECH_SPECS);
    const fortressTechs = getBuildingExclusiveTechs('fortress', 'greek', 'Zeus', allTechs);
    const techIds = fortressTechs.map((t) => t.id);

    expect(techIds).toContain('burning_pitch');
    expect(techIds).toContain('engineers');
    expect(techIds).toContain('watch_tower');
    expect(techIds).toContain('ballistics');

    // Should NOT contain unrelated economic or temple techs
    expect(techIds).not.toContain('hand_axe');
    expect(techIds).not.toContain('hunting_dogs');
    expect(techIds).not.toContain('omniscience');
  });

  it('filters Temple technologies to divine devotion and awakening techs', () => {
    const allTechs = Object.values(TECH_SPECS);
    const templeTechs = getBuildingExclusiveTechs('temple', 'greek', 'Zeus', allTechs);
    const techIds = templeTechs.map((t) => t.id);

    expect(techIds).toContain('omniscience');
    expect(techIds).toContain('mythic_rejuvenation');
    expect(techIds).toContain('secrets_of_titans');
    expect(techIds).not.toContain('hand_axe');
    expect(techIds).not.toContain('engineers');
  });
});
