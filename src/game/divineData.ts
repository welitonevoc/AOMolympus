import { getXmbNumber, XMB_GOD_POWERS } from "../god powers";
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
} from "./types";
import { GOD_POWERS } from "./data/divine/godPowersData";
import {
  getEffectiveTechCost,
  getEffectiveTechTime,
  TECH_SPECS,
} from "./data/divine/techSpecsData";
import { MAJOR_GODS, MINOR_GODS } from "./data/divine/godsPantheonData";
import {
  CIV_UNIT_NAMES,
  WONDER_BY_GOD,
  WonderSpec,
} from "./data/divine/civLocalizationData";

export {
  GOD_POWERS,
  TECH_SPECS,
  getEffectiveTechCost,
  getEffectiveTechTime,
  MINOR_GODS,
  MAJOR_GODS,
  CIV_UNIT_NAMES,
  WONDER_BY_GOD,
};
export type { WonderSpec };

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
