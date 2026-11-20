import { getCivBuildingSpec } from '../../game/divineData';
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
  /** True for Norse infantry combat builders (Ulfsark, Hersir, Throwing Axeman, Huskarl) */
  isCombatBuilder?: boolean;
}

export interface BuildingCommandProfile {
  title: string;
  subtitle: string;
  eraTag?: string;
  unitTabLabel: string;
  techTabLabel: string;
}

const NORSE_COMBAT_BUILDERS: ReadonlySet<UnitKind> = new Set<UnitKind>([
  'ulfsark',
  'hersir',
  'throwing_axeman',
  'huskarl',
]);

/**
 * Returns customized identity, cultural trait badge, and default tab for any selected villager/builder.
 */
export function getVillagerCultureDetails(
  pantheon: PantheonId,
  unitKind?: UnitKind,
  isHero?: boolean
): VillagerCultureDetails {
  if (pantheon === 'egyptian') {
    return {
      title: 'Operário Egípcio',
      subtitle: 'Obras sagradas do Nilo · Construção acelerada pela bênção do Faraó',
      badge: 'Bênção do Faraó',
      defaultTab: 'eco',
    };
  }

  if (pantheon === 'norse' || pantheon === 'jotunn') {
    if (unitKind === 'norse_dwarf') {
      return {
        title: 'Anão Minerador Nórdico',
        subtitle: 'Forjado em Nidavellir · Minera ouro 20% mais rápido',
        badge: '+20% Ouro',
        defaultTab: 'eco',
      };
    }
    if (unitKind && NORSE_COMBAT_BUILDERS.has(unitKind)) {
      const unitNames: Partial<Record<UnitKind, string>> = {
        ulfsark: 'Ulfsark Construtor',
        hersir: 'Hersir Construtor',
        throwing_axeman: 'Machadeiro Construtor',
        huskarl: 'Huskarl Construtor',
      };
      return {
        title: unitNames[unitKind] ?? 'Guerreiro Construtor Nórdico',
        subtitle: 'Infantaria nórdica · Ergue quartéis, torres, templos e o Forte da Colina',
        badge: 'Construtor Militar',
        defaultTab: 'military',
        isCombatBuilder: true,
      };
    }
    return {
      title: 'Coletor Nórdico',
      subtitle: 'Colheita com Carro de Boi · Infantaria ergue quartéis e fortificações',
      badge: 'Depósito Móvel',
      defaultTab: 'eco',
    };
  }

  if (pantheon === 'atlantean') {
    if (isHero) {
      return {
        title: 'Cidadão Herói Atlante ★',
        subtitle: 'Essência de Oricalco · Coleta 2.5x sem depósito e bônus contra Míticas',
        badge: 'Herói ★ · 2.5x',
        defaultTab: 'eco',
        isHero: true,
      };
    }
    return {
      title: 'Cidadão Atlante & Lhama',
      subtitle: 'Coleta autônoma 2.5x sem depósitos · Promovível a Herói ★',
      badge: 'Lhama Integrada',
      defaultTab: 'eco',
    };
  }

  if (pantheon === 'chinese') {
    if (unitKind === 'kuafu') {
      return {
        title: 'Kuafu Construtor',
        subtitle: 'Gigante trabalhador · Coleta e ergue monumentos em velocidade superior',
        badge: 'Gigante · +Construção',
        defaultTab: 'eco',
      };
    }
    return {
      title: 'Camponês Chinês',
      subtitle: 'Cultivo imperial, coleta equilibrada e expansão de Jardins & Bastiões',
      badge: 'Trabalho Imperial',
      defaultTab: 'eco',
    };
  }

  // Default: Grego
  return {
    title: 'Aldeão Helênico',
    subtitle: 'Colhe recursos, ergue a pólis e ora no Templo para gerar Favor',
    badge: 'Oração (+Favor)',
    defaultTab: 'eco',
  };
}

/**
 * Unified contextual Command Center header & subtab labels per building (shared by desktop & mobile).
 */
export function getBuildingCommandProfile(
  kind: BuildingKind,
  pantheon: PantheonId,
  majorGodName: string,
  age: AgeLevel
): BuildingCommandProfile {
  if (kind === 'fortress' || kind === 'asgard_hill_fort') {
    if (pantheon === 'egyptian') {
      return {
        title: 'Fortaleza Migdol',
        subtitle: 'Carros de guerra, elefantes, cerco e guarnição real',
        eraTag: 'Era III+',
        unitTabLabel: 'Elite & Cerco',
        techTabLabel: 'Bastião',
      };
    }
    if (pantheon === 'norse' || pantheon === 'jotunn') {
      return {
        title: kind === 'asgard_hill_fort' ? 'Forte de Asgard' : 'Forte da Colina',
        subtitle: 'Huskarls, Jarls, armas de cerco e guarnição nórdica',
        eraTag: 'Era III+',
        unitTabLabel: 'Elite & Cerco',
        techTabLabel: 'Bastião',
      };
    }
    if (pantheon === 'atlantean') {
      return {
        title: 'Palácio Atlante',
        subtitle: 'Destruidores, Fanáticos, cerco de oricalco e cidadela',
        eraTag: 'Era III+',
        unitTabLabel: 'Elite & Cerco',
        techTabLabel: 'Cidadela',
      };
    }
    if (pantheon === 'chinese') {
      return {
        title: 'Bastião Imperial',
        subtitle: 'Tropas de elite, lanças de fogo, cerco e defesa',
        eraTag: 'Era III+',
        unitTabLabel: 'Elite & Cerco',
        techTabLabel: 'Bastião',
      };
    }
    return {
      title: 'Fortaleza Helênica',
      subtitle: `Tropa exclusiva de ${majorGodName || 'Olimpo'}, heróis, cerco e guarnição`,
      eraTag: 'Era III+',
      unitTabLabel: 'Elite & Cerco',
      techTabLabel: 'Bastião',
    };
  }

  if (kind === 'temple') {
    return {
      title: `Templo de ${majorGodName || 'Olimpo'}`,
      subtitle: 'Unidades míticas, bênçãos sagradas e Era dos Deuses',
      unitTabLabel: 'Míticas',
      techTabLabel: 'Sagradas',
    };
  }

  if (kind === 'barracks') {
    const title =
      pantheon === 'greek'
        ? 'Academia Militar'
        : pantheon === 'norse' || pantheon === 'jotunn'
        ? 'Casa Longa (Quartel)'
        : pantheon === 'atlantean'
        ? 'Quartel Militar Atlante'
        : 'Quartel de Infantaria';
    return {
      title,
      subtitle: 'Treinamento de infantaria e melhorias de combate',
      unitTabLabel: 'Tropas',
      techTabLabel: 'Melhorias',
    };
  }

  if (kind === 'counter_barracks') {
    return {
      title: 'Contra-Quartel Atlante',
      subtitle: 'Unidades anti-cavalaria, anti-arqueiro e balistas',
      unitTabLabel: 'Contra-Tropas',
      techTabLabel: 'Melhorias',
    };
  }

  if (kind === 'archery_range') {
    return {
      title: 'Campo de Arquearia',
      subtitle: 'Arqueiros, peltastas e pesquisas de precisão',
      unitTabLabel: 'Atiradores',
      techTabLabel: 'Melhorias',
    };
  }

  if (kind === 'stable') {
    return {
      title: 'Estábulo',
      subtitle: 'Cavalaria pesada, batedores e melhorias montadas',
      unitTabLabel: 'Cavalaria',
      techTabLabel: 'Melhorias',
    };
  }

  if (kind === 'great_hall') {
    return {
      title: 'Grande Salão',
      subtitle: 'Cavalaria nórdica, Jarls e heróis Hersir / Godi',
      unitTabLabel: 'Guerreiros',
      techTabLabel: 'Melhorias',
    };
  }

  if (kind === 'siege_works') {
    return {
      title: 'Oficina de Cerco',
      subtitle: 'Aríetes, catapultas e engenharia de demolição',
      unitTabLabel: 'Cerco',
      techTabLabel: 'Engenharia',
    };
  }

  if (kind === 'armory') {
    return {
      title: 'Arsenal',
      subtitle: 'Forja de armas, armaduras, escudos e tecnologias míticas',
      unitTabLabel: 'Unidades',
      techTabLabel: 'Forja',
    };
  }

  if (kind === 'town_center' || kind === 'village_center') {
    return {
      title: kind === 'village_center' ? 'Centro de Vila' : 'Centro da Cidade',
      subtitle: 'Aldeões, heróis, economia e avanço de Era',
      unitTabLabel: 'Civis & Heróis',
      techTabLabel: 'Economia',
    };
  }

  if (kind === 'market') {
    return {
      title: 'Mercado',
      subtitle: 'Caravanas comerciais e câmbio imediato de recursos',
      unitTabLabel: 'Comércio',
      techTabLabel: 'Pesquisas',
    };
  }

  if (kind === 'dock') {
    return {
      title: 'Doca Naval',
      subtitle: 'Barcos de pesca, trirremes de guerra e transportes',
      unitTabLabel: 'Navios',
      techTabLabel: 'Naval',
    };
  }

  const spec = getCivBuildingSpec(pantheon, kind, majorGodName, age);
  return {
    title: spec.name,
    subtitle: spec.role,
    unitTabLabel: 'Treinar',
    techTabLabel: 'Pesquisas',
  };
}

/**
 * Classifies a building into one of 4 intuitive Retold command categories:
 * - eco: Houses, Granary, Storehouse, Economic Guild, Farm, Market, Camps, Dock, Town/Village Center
 * - military: Barracks, Counter-Barracks, Archery, Stable, Great Hall, Fortress, Hill Fort, Siege Works, Armory
 * - defense: Towers, Mirror Tower, Walls, Gate, Sky Passage, Obelisk
 * - divine: Temple, Monuments, Wonder, Titan Gate, Lighthouse
 */
export function getBuildingCategory(kind: BuildingKind): 'eco' | 'military' | 'defense' | 'divine' {
  switch (kind) {
    case 'house':
    case 'granary':
    case 'storehouse':
    case 'economic_guild':
    case 'farm':
    case 'market':
    case 'lumber_camp':
    case 'mining_camp':
    case 'dock':
    case 'town_center':
    case 'village_center':
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
 * Every returned unit is guaranteed to be trainable at `buildingKind` via `matchesUnitProducer`.
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
      if (
        u.kind === 'villager' ||
        u.kind === 'norse_dwarf' ||
        u.kind === 'ox_cart' ||
        u.kind === 'citizen' ||
        u.kind === 'chinese_peasant' ||
        u.kind === 'kuafu'
      ) {
        return true;
      }
      if (u.kind === 'oracle' && pantheon === 'atlantean') {
        return true;
      }
      if (
        u.isHero &&
        u.producedAt === 'town_center' &&
        u.kind !== 'priest' &&
        u.kind !== 'oracle' &&
        u.kind !== 'hersir' &&
        u.kind !== 'godi'
      ) {
        return true;
      }
      return false;
    }

    // 2. Temple: Myth units, Era V Gods, and dedicated divine casters only
    if (buildingKind === 'temple') {
      if (u.isMythic) {
        if (u.requiresMinorGod && u.requiresMinorGod.length > 0) {
          return u.requiresMinorGod.some((mg) => chosenMinorGods.includes(mg));
        }
        return true;
      }
      if (u.isMajorGod || u.isGod) return true;
      if (u.kind === 'priest' && pantheon === 'egyptian') return true;
      if (u.kind === 'oracle' && pantheon === 'atlantean') return true;
      if ((u.kind === 'hersir' || u.kind === 'godi') && (pantheon === 'norse' || pantheon === 'jotunn')) {
        return true;
      }
      return false;
    }

    // 3. Fortress / Asgard Hill Fort (AoM Retold / The Titans standard)
    if (buildingKind === 'fortress' || buildingKind === 'asgard_hill_fort') {
      // Greeks: Unique unit per Major God (Zeus: Myrmidon, Poseidon: Hetairoi/cavalry, Hades: Gastraphetes), Heroic+ Heroes, Siege
      if (pantheon === 'greek') {
        if (u.kind === 'myrmidon' && (godLower.includes('zeus') || !godLower)) return true;
        if (u.kind === 'cavalry' && godLower.includes('poseidon')) return true;
        if (u.kind === 'gastraphetes' && godLower.includes('hades')) return true;
        if (u.kind === 'ram' || u.kind === 'siege') return true;
        if (u.isHero && u.minAge >= 3) return true;
        return false;
      }

      // Egyptians: Migdol Stronghold (Chariot Archer, Camel Rider, War Elephant, Siege Tower, Catapult)
      if (pantheon === 'egyptian') {
        if (u.kind === 'chariot_archer' || u.kind === 'camel_rider' || u.kind === 'war_elephant') return true;
        if (u.kind === 'siege_tower' || u.kind === 'egypt_catapult') return true;
        return false;
      }

      // Norse: Hill Fort / Asgard Hill Fort (Huskarl, Jarl, Portable Ram, Ballista, Hersir, Godi)
      if (pantheon === 'norse' || pantheon === 'jotunn') {
        if (u.kind === 'huskarl' || u.kind === 'jarl') return true;
        if (u.kind === 'portable_ram' || u.kind === 'norse_ballista') return true;
        if (u.kind === 'hersir' || u.kind === 'godi') return true;
        return false;
      }

      // Atlanteans: Palace (Destroyer, Fanatic, Fire Siphon, Onager, Cheiroballista)
      if (pantheon === 'atlantean') {
        if (u.kind === 'destroyer' || u.kind === 'fanatic') return true;
        if (u.kind === 'fire_siphon' || u.kind === 'onager' || u.kind === 'cheiroballista') return true;
        return false;
      }

      // Chinese: Imperial Bastion (Jiang Ziya, Fire Lance, Tiger Cavalry, Ram, Siege)
      if (pantheon === 'chinese') {
        if (
          u.kind === 'jiang_ziya' ||
          u.kind === 'fire_lance' ||
          u.kind === 'tiger_cavalry' ||
          u.kind === 'ram' ||
          u.kind === 'siege'
        ) {
          return true;
        }
        return false;
      }

      return false;
    }

    // 4. Counter-Barracks (Atlantean)
    if (buildingKind === 'counter_barracks') {
      return (
        u.kind === 'katapeltes' ||
        u.kind === 'turma' ||
        u.kind === 'cheiroballista' ||
        u.producedAt === 'counter_barracks'
      );
    }

    // 5. Barracks (Pantheon-specific)
    if (buildingKind === 'barracks') {
      if (pantheon === 'greek') {
        return u.kind === 'hoplite' || u.kind === 'hipaspist';
      }
      if (pantheon === 'egyptian') {
        return u.kind === 'egypt_spearman' || u.kind === 'slinger' || u.kind === 'axeman';
      }
      if (pantheon === 'norse' || pantheon === 'jotunn') {
        return u.kind === 'ulfsark' || u.kind === 'throwing_axeman' || u.kind === 'hersir';
      }
      if (pantheon === 'atlantean') {
        return u.kind === 'murmillo' || u.kind === 'arcus' || u.kind === 'contarius';
      }
      if (pantheon === 'chinese') {
        return u.kind === 'halberdier';
      }
      return u.producedAt === 'barracks';
    }

    // 6. Archery Range
    if (buildingKind === 'archery_range') {
      if (pantheon === 'greek') {
        return u.kind === 'archer' || u.kind === 'peltast' || u.kind === 'gastraphetes';
      }
      if (pantheon === 'chinese') {
        return u.kind === 'chu_ko_nu';
      }
      return u.producedAt === 'archery_range';
    }

    // 7. Stable
    if (buildingKind === 'stable') {
      if (pantheon === 'greek') {
        return u.kind === 'cavalry' || u.kind === 'prodromos';
      }
      if (pantheon === 'chinese') {
        return u.kind === 'tiger_cavalry';
      }
      return u.producedAt === 'stable';
    }

    // 8. Great Hall (Norse Retold)
    if (buildingKind === 'great_hall') {
      return (
        u.kind === 'raiding_cavalry' ||
        u.kind === 'jarl' ||
        u.kind === 'hersir' ||
        u.kind === 'godi'
      );
    }

    // 9. Siege Works
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

    // 10. Dock
    if (buildingKind === 'dock') {
      return (
        u.kind === 'fishing_ship' ||
        u.kind === 'war_trireme' ||
        u.kind === 'transport_ship' ||
        u.producedAt === 'dock'
      );
    }

    // 11. Market
    if (buildingKind === 'market') {
      return u.kind === 'llama_caravan' || u.producedAt === 'market';
    }

    // Default fallback: direct match on producedAt
    return u.producedAt === buildingKind;
  });
}

/**
 * Filters technologies strictly belonging to the currently selected building.
 * Every returned tech is guaranteed to be accepted by `researchTech` at `buildingKind`.
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

    // 2. Temple: Divine researches, favor techs, Sun Ray (Apollo), and Age V Awakening
    if (buildingKind === 'temple') {
      return (
        t.building === 'temple' ||
        Boolean(t.secondaryBuildings?.includes('temple'))
      );
    }

    // 3. Barracks: Infantry upgrades + Ares/Athena infantry mythic techs
    if (buildingKind === 'barracks') {
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

    // 4. Counter-Barracks: Soldier line upgrades
    if (buildingKind === 'counter_barracks') {
      return (
        t.id === 'medium_soldiers' ||
        t.id === 'heavy_soldiers' ||
        t.id === 'champion_soldiers'
      );
    }

    // 5. Archery Range: Ranged upgrades + Ballistics + soldier line
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

    // 6. Stable: Soldier line upgrades
    if (buildingKind === 'stable') {
      return (
        t.id === 'medium_soldiers' ||
        t.id === 'heavy_soldiers' ||
        t.id === 'champion_soldiers'
      );
    }

    // 7. Great Hall (Norse): Soldier line + Hammer of the Gods (Thor)
    if (buildingKind === 'great_hall') {
      return (
        t.id === 'medium_soldiers' ||
        t.id === 'heavy_soldiers' ||
        t.id === 'champion_soldiers' ||
        t.id === 'hammer_of_the_gods'
      );
    }

    // 8. Siege Works: Siege upgrades
    if (buildingKind === 'siege_works') {
      return t.id === 'engineers' || t.id === 'burning_pitch';
    }

    // 9. Town Center / Village Center: Economic gather techs + Watch Tower (+ Hammer of the Gods on TC)
    if (buildingKind === 'town_center' || buildingKind === 'village_center') {
      return (
        t.id === 'hand_axe' ||
        t.id === 'pickaxe' ||
        t.id === 'plow' ||
        t.id === 'hunting_dogs' ||
        t.id === 'husbandry' ||
        t.id === 'watch_tower' ||
        (buildingKind === 'town_center' && t.id === 'hammer_of_the_gods')
      );
    }

    // 10. Economic drop-off & guild buildings (strictly their own domain)
    if (buildingKind === 'granary') {
      return t.id === 'hunting_dogs' || t.id === 'husbandry' || t.id === 'plow';
    }
    if (buildingKind === 'storehouse') {
      return t.id === 'hand_axe' || t.id === 'pickaxe';
    }
    if (buildingKind === 'lumber_camp') {
      return t.id === 'hand_axe';
    }
    if (buildingKind === 'mining_camp') {
      return t.id === 'pickaxe';
    }
    if (buildingKind === 'economic_guild') {
      return (
        t.id === 'hand_axe' ||
        t.id === 'pickaxe' ||
        t.id === 'plow' ||
        t.id === 'hunting_dogs' ||
        t.id === 'husbandry'
      );
    }

    // 11. Armory: All metallurgical & forge upgrades
    if (buildingKind === 'armory') {
      return t.building === 'armory';
    }

    // 12. Tower / Mirror Tower: Fortification upgrades
    if (buildingKind === 'tower' || buildingKind === 'mirror_tower') {
      return t.id === 'watch_tower' || t.id === 'ballistics' || t.id === 'burning_pitch';
    }

    // Fallback: strict match on primary or secondary building
    return t.building === buildingKind || Boolean(t.secondaryBuildings?.includes(buildingKind));
  });
}
