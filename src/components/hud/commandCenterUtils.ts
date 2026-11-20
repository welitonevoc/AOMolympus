import {
  AgeLevel,
  BuildingKind,
  PantheonId,
  TechSpec,
  UnitKind,
  UnitStats,
} from '../../game/types';

export type VillagerBuildCategory = 'all' | 'eco' | 'military' | 'defense' | 'divine';

export interface VillagerCultureDetails {
  title: string;
  subtitle: string;
  badge: string;
  defaultTab: VillagerBuildCategory;
  isHero?: boolean;
}

/**
 * Returns customized identity, cultural trait badge, and default tab for any selected villager.
 */
export function getVillagerCultureDetails(
  pantheon: PantheonId,
  unitKind?: UnitKind,
  isHero?: boolean
): VillagerCultureDetails {
  if (pantheon === 'egyptian') {
    return {
      title: 'Operário Egípcio',
      subtitle: 'Mão de obra sagrada do Nilo • Construção acelerada com bênção do Faraó',
      badge: 'Bênção do Faraó (+Eficiência)',
      defaultTab: 'eco',
    };
  }

  if (pantheon === 'norse') {
    if (unitKind === 'dwarf') {
      return {
        title: 'Anão Minerador Nórdico',
        subtitle: 'Forjado em Nidavellir • Minera jazidas de ouro 20% mais rápido',
        badge: '+20% Mineração de Ouro',
        defaultTab: 'eco',
      };
    }
    return {
      title: 'Coletor Nórdico',
      subtitle: 'Colheita e depósitos móveis • Estruturas militares são erguidas pela Infantaria (Ulfsark)',
      badge: 'Infantaria ergue Quartéis',
      defaultTab: 'eco',
    };
  }

  if (pantheon === 'atlantean') {
    if (isHero) {
      return {
        title: 'Cidadão Herói Atlante ★',
        subtitle: 'Elevado com essência de Oricalco • Coleta ultra-rápida, defesa heroica e bônus vs Míticas',
        badge: 'Herói ★ • Coleta 2.5x',
        defaultTab: 'eco',
        isHero: true,
      };
    }
    return {
      title: 'Cidadão Atlante & Lhama',
      subtitle: 'Coleta 2.5x mais rápida sem necessidade de depósitos • Promovível a Herói ★',
      badge: 'Lhama Integrada (Sem Depósito)',
      defaultTab: 'eco',
    };
  }

  // Default: Grego
  return {
    title: 'Aldeão Helênico',
    subtitle: 'Cultiva fazendas, colhe recursos e edifica templos e monumentos do Olimpo',
    badge: 'Oração no Templo (+Favor)',
    defaultTab: 'all',
  };
}

/**
 * Classifies a building into one of 4 intuitive Retold command categories:
 * - eco: Houses, Granary, Storehouse, Farm, Market, Camps
 * - military: Barracks, Archery, Stable, Fortress, Hill Fort, Siege Works, Armory
 * - defense: Towers, Walls, Gate, Sky Passage, Obelisk
 * - divine: Temple, Monuments, Wonder, Titan Gate, Lighthouse
 */
export function getBuildingCategory(kind: BuildingKind): 'eco' | 'military' | 'defense' | 'divine' {
  switch (kind) {
    case 'house':
    case 'granary':
    case 'storehouse':
    case 'farm':
    case 'market':
    case 'lumber_camp':
    case 'mining_camp':
    case 'dock':
      return 'eco';

    case 'barracks':
    case 'counter_barracks':
    case 'archery_range':
    case 'stable':
    case 'great_hall':
    case 'fortress':
    case 'asgard_hill_fort':
    case 'siege_works':
    case 'armory':
      return 'military';

    case 'tower':
    case 'mirror_tower':
    case 'wall':
    case 'gate':
    case 'obelisk':
    case 'sky_passage':
      return 'defense';

    case 'temple':
    case 'monument':
    case 'wonder':
    case 'titan_gate':
    case 'lighthouse':
    default:
      return 'divine';
  }
}

/**
 * Filters units strictly belonging to the currently selected building.
 * Ensures the Command Center is tightly focused without leaking units into wrong buildings.
 */
export function getBuildingExclusiveUnits(
  buildingKind: BuildingKind,
  pantheon: PantheonId,
  majorGodName: string,
  unitList: UnitStats[],
  chosenMinorGods: string[] = []
): UnitStats[] {
  const godLower = (majorGodName || '').toLowerCase();

  return unitList.filter((u) => {
    // 1. Town Center & Village Center
    if (buildingKind === 'town_center' || buildingKind === 'village_center') {
      if (u.kind === 'villager' || u.kind === 'dwarf' || u.kind === 'chinese_peasant') return true;
      if (
        u.isHero &&
        u.kind !== 'priest' &&
        u.kind !== 'oracle' &&
        u.kind !== 'hersir' &&
        u.kind !== 'godi'
      ) {
        return true;
      }
      return false;
    }

    // 2. Temple: Myth units and dedicated divine casters only
    if (buildingKind === 'temple') {
      if (u.isMythic) {
        if (u.requiresMinorGod && u.requiresMinorGod.length > 0) {
          return u.requiresMinorGod.some((mg) => chosenMinorGods.includes(mg));
        }
        return true;
      }
      if (u.isMajorGod) return true;
      if (u.kind === 'priest' && pantheon === 'egyptian') return true;
      if (u.kind === 'oracle' && pantheon === 'atlantean') return true;
      if (u.kind === 'hersir' && pantheon === 'norse') return true;
      return false;
    }

    // 3. Fortress / Asgard Hill Fort (AoM Retold / Titans & Fandom standard)
    if (buildingKind === 'fortress' || buildingKind === 'asgard_hill_fort') {
      // Greeks: Petrobolos & Helepolis (siege), Unique unit per god (Zeus: Myrmidon, Poseidon: Hetairoi, Hades: Gastraphetes), or heroes in Heroic/Mythic
      if (pantheon === 'greek') {
        if (u.kind === 'myrmidon' && godLower.includes('zeus')) return true;
        if (u.kind === 'cavalry' && godLower.includes('poseidon')) return true;
        if (u.kind === 'gastraphetes' && godLower.includes('hades')) return true;
        if (u.kind === 'ram' || u.kind === 'siege') return true;
        if (u.isHero && u.minAge >= 3) return true;
        return false;
      }

      // Egyptians: Migdol Stronghold (War Elephant, Camel Rider, Chariot Archer, Siege Tower, Catapult)
      if (pantheon === 'egyptian') {
        if (u.kind === 'war_elephant' || u.kind === 'camel_rider' || u.kind === 'chariot_archer') return true;
        if (u.kind === 'siege_tower' || u.kind === 'egypt_catapult' || u.kind === 'siege') return true;
        return false;
      }

      // Norse: Hill Fort (Huskarl, Jarl, Portable Ram, Ballista, Hersir)
      if (pantheon === 'norse' || pantheon === 'jotunn') {
        if (u.kind === 'huskarl' || u.kind === 'jarl') return true;
        if (u.kind === 'portable_ram' || u.kind === 'norse_ballista' || u.kind === 'ram' || u.kind === 'siege') return true;
        if (u.kind === 'hersir') return true;
        return false;
      }

      // Atlanteans: Palace (Fanatic, Destroyer/Katapeltes, Fire Siphon, Onager, Cheiroballista)
      if (pantheon === 'atlantean') {
        if (u.kind === 'fanatic' || u.kind === 'katapeltes') return true;
        if (u.kind === 'fire_siphon' || u.kind === 'onager' || u.kind === 'cheiroballista') return true;
        return false;
      }

      // Chinese: Bastion
      if (pantheon === 'chinese') {
        if (u.kind === 'myrmidon' || u.kind === 'fire_lance' || u.kind === 'tiger_cavalry') return true;
        return false;
      }

      return false;
    }

    // 4. Barracks / Counter-Barracks
    if (buildingKind === 'barracks' || buildingKind === 'counter_barracks') {
      if (buildingKind === 'counter_barracks') {
        return (
          u.kind === 'katapeltes' ||
          u.kind === 'turma' ||
          u.kind === 'cheiroballista' ||
          u.producedAt === 'counter_barracks'
        );
      }
      if (u.kind === 'hoplite' || u.kind === 'hipaspist') return true;
      if (u.kind === 'spearman' || u.kind === 'axeman') return true;
      if (u.kind === 'ulfsark' || u.kind === 'throwing_axeman') return true;
      if (u.kind === 'murmillo' || u.kind === 'katapeltes') return true;
      if (u.kind === 'halberdier') return true;
      return false;
    }

    // 5. Archery Range
    if (buildingKind === 'archery_range') {
      if (u.kind === 'archer' || u.kind === 'peltast') return true;
      if (u.kind === 'gastraphetes') return true;
      if (u.kind === 'slinger' || u.kind === 'chariot_archer') return true;
      if (u.kind === 'arcus' || u.kind === 'turma') return true;
      if (u.kind === 'chu_ko_nu') return true;
      return false;
    }

    // 6. Stable
    if (buildingKind === 'stable') {
      if (u.kind === 'cavalry' || u.kind === 'prodromos') return true;
      if (u.kind === 'camel_rider') return true;
      if (u.kind === 'raiding_cavalry' || u.kind === 'jarl') return true;
      if (u.kind === 'contarius') return true;
      if (u.kind === 'tiger_cavalry') return true;
      return false;
    }

    // 7. Great Hall (Norse Retold)
    if (buildingKind === 'great_hall') {
      return (
        u.kind === 'raiding_cavalry' ||
        u.kind === 'jarl' ||
        u.kind === 'hersir' ||
        u.kind === 'godi'
      );
    }

    // 8. Siege Works
    if (buildingKind === 'siege_works') {
      return (
        u.kind === 'ram' ||
        u.kind === 'siege' ||
        u.kind === 'siege_tower' ||
        u.kind === 'egypt_catapult' ||
        u.kind === 'portable_ram' ||
        u.kind === 'norse_ballista' ||
        u.kind === 'fire_siphon' ||
        u.kind === 'onager' ||
        u.kind === 'fire_lance'
      );
    }

    // 9. Dock
    if (buildingKind === 'dock') {
      return (
        u.kind === 'fishing_ship' ||
        u.kind === 'war_trireme' ||
        u.kind === 'transport_ship' ||
        u.producedAt === 'dock'
      );
    }

    // 10. Market
    if (buildingKind === 'market') {
      return u.kind === 'caravan' || u.producedAt === 'market';
    }

    // Default fallback: direct match on producedAt
    return u.producedAt === buildingKind;
  });
}

/**
 * Filters technologies strictly belonging to the currently selected building.
 * Ensures the Command Center research list contains only relevant upgrades.
 */
export function getBuildingExclusiveTechs(
  buildingKind: BuildingKind,
  pantheon: PantheonId,
  majorGodName: string,
  techList: TechSpec[],
  chosenMinorGods: string[] = []
): TechSpec[] {
  const godLower = (majorGodName || '').toLowerCase();

  return techList.filter((t) => {
    // Pantheon filter
    if (t.pantheons && !t.pantheons.includes(pantheon)) return false;
    // Minor god requirements
    if (
      t.requiresMinorGod &&
      !t.requiresMinorGod.some((mg) => chosenMinorGods.includes(mg))
    ) {
      return false;
    }
    // Major god requirements
    if (
      t.requiresMajorGod &&
      !t.requiresMajorGod.some((mg) => mg.toLowerCase() === godLower)
    ) {
      return false;
    }

    // 1. Fortress / Hill Fort: Burning Pitch, Engineers, Watch Tower / Crenellations, Ballistics, Olympian Weapons
    if (buildingKind === 'fortress' || buildingKind === 'asgard_hill_fort') {
      return (
        t.id === 'burning_pitch' ||
        t.id === 'engineers' ||
        t.id === 'watch_tower' ||
        t.id === 'ballistics' ||
        t.id === 'olympian_weapons'
      );
    }

    // 2. Temple: Divine researches, favor techs, and Age V Awakening
    if (buildingKind === 'temple') {
      return (
        t.category === 'temple' ||
        t.building === 'temple' ||
        t.id === 'omniscience' ||
        t.id === 'mythic_rejuvenation' ||
        t.id === 'secrets_of_titans' ||
        t.id === 'golden_apples' ||
        t.id === 'necropolis' ||
        t.id === 'hammer_of_the_gods' ||
        t.id === 'perception' ||
        t.id === 'horns_of_consecration'
      );
    }

    // 3. Barracks / Counter-Barracks: Infantry upgrades only
    if (buildingKind === 'barracks' || buildingKind === 'counter_barracks') {
      return (
        t.id === 'medium_soldiers' ||
        t.id === 'heavy_soldiers' ||
        t.id === 'champion_soldiers' ||
        t.id === 'phobos_spear_of_horror' ||
        t.id === 'deimos_sword_of_dread' ||
        t.id === 'sarissa' ||
        t.id === 'aegis_shield'
      );
    }

    // 4. Archery Range: Ranged upgrades only
    if (buildingKind === 'archery_range') {
      return (
        t.id === 'enyo_bow_of_horror' ||
        t.id === 'sun_ray' ||
        t.id === 'shafts_of_plague' ||
        t.id === 'ballistics' ||
        t.id === 'medium_soldiers' ||
        t.id === 'heavy_soldiers' ||
        t.id === 'champion_soldiers'
      );
    }

    // 5. Stable: Mounted upgrades
    if (buildingKind === 'stable' || buildingKind === 'great_hall') {
      return (
        t.id === 'medium_soldiers' ||
        t.id === 'heavy_soldiers' ||
        t.id === 'champion_soldiers' ||
        t.id === 'hammer_of_the_gods'
      );
    }

    // 6. Siege Works: Siege upgrades
    if (buildingKind === 'siege_works') {
      return t.id === 'engineers' || t.id === 'burning_pitch';
    }

    // 7. Town Center: Economic gather techs and watch tower
    if (buildingKind === 'town_center' || buildingKind === 'village_center') {
      return (
        t.id === 'hand_axe' ||
        t.id === 'pickaxe' ||
        t.id === 'plow' ||
        t.id === 'hunting_dogs' ||
        t.id === 'husbandry' ||
        t.id === 'watch_tower'
      );
    }

    // 8. Granary / Storehouse / Camps
    if (buildingKind === 'granary') {
      return t.id === 'hunting_dogs' || t.id === 'husbandry' || t.id === 'plow';
    }
    if (buildingKind === 'storehouse' || buildingKind === 'lumber_camp' || buildingKind === 'mining_camp') {
      return t.id === 'hand_axe' || t.id === 'pickaxe';
    }

    // 9. Armory: Core metallurgical upgrades
    if (buildingKind === 'armory') {
      return (
        t.building === 'armory' ||
        t.id === 'copper_weapons' ||
        t.id === 'bronze_weapons' ||
        t.id === 'iron_weapons' ||
        t.id === 'copper_mail' ||
        t.id === 'bronze_mail' ||
        t.id === 'iron_mail' ||
        t.id === 'copper_shields' ||
        t.id === 'bronze_shields' ||
        t.id === 'iron_shields' ||
        t.id === 'ballistics' ||
        t.id === 'burning_pitch' ||
        t.id === 'forge_of_olympus' ||
        t.id === 'olympian_weapons'
      );
    }

    // 10. Tower / Mirror Tower
    if (buildingKind === 'tower' || buildingKind === 'mirror_tower') {
      return t.id === 'watch_tower' || t.id === 'burning_pitch';
    }

    // Fallback: strict match on primary building
    return t.building === buildingKind || t.secondaryBuildings?.includes(buildingKind);
  });
}
