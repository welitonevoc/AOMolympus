import * as THREE from 'three';
import { createBiomeTreeMesh, FAUNA_TEXTURA_CATALOG } from '../TEXTURA';
import {
  BiomeTreeStyle,
  buildMapResourceProfile,
  getEffectiveMapConfig,
  getMapBiomeVisuals,
  groundHeightAt,
} from '../game/mapGeography';
import {
  createFaunaMesh,
  createPlentyVaultMesh,
  createRelicMesh,
  createResourceMesh,
  createSettlementMesh,
  MaterialPalette,
} from '../game/models';
import {
  BuildingKind,
  FAUNA_STATS,
  FaunaKind,
  MapConfig,
  MapId,
  MAPS,
  PantheonId,
  ResourceNodeKind,
  UnitKind,
} from '../game/types';

export type InspectableUnitId = UnitKind;

export interface CivEntityOption {
  id: InspectableUnitId;
  name: string;
  role: string;
  category: 'god' | 'hero' | 'troop' | 'myth';
}

export interface MajorGodOption {
  id: string;
  name: string;
  title: string;
  color: string;
  titanName: string;
  titanRole: string;
}

export const MAJOR_GODS_BY_CIV: Partial<Record<PantheonId, MajorGodOption[]>> = {
  greek: [
    {
      id: 'Zeus',
      name: 'Zeus',
      title: 'Pai dos Deuses (Céus & Tempestades)',
      color: '#eab308',
      titanName: 'Titã Tifão — Senhor dos Furacões',
      titanRole: 'Colosso tempestuoso dos céus com asas monumentais de tempestade, vórtice de tornados e relâmpagos apocalípticos.',
    },
    {
      id: 'Poseidon',
      name: 'Poseidon',
      title: 'Senhor dos Mares (Oceanos & Terremotos)',
      color: '#2dd4bf',
      titanName: 'Titã Caríbdis — Colosso das Profundezas',
      titanRole: 'Colosso abissal emergido sobre redemoinho devorador, com carapaça de coral negro, pinça titânica e tentáculos dorsais.',
    },
    {
      id: 'Hades',
      name: 'Hades',
      title: 'Soberano do Submundo (Tártaro & Riquezas)',
      color: '#10b981',
      titanName: 'Titã Cérbero — Guardião do Submundo',
      titanRole: 'Colosso bestial de três cabeças caninas do Tártaro, correntes de ferro negro, garras de basalto e cauda de serpente víbora.',
    },
  ],
  egyptian: [
    {
      id: 'Rá',
      name: 'Rá',
      title: 'Deus do Sol (Luz Divina & Glória)',
      color: '#f59e0b',
      titanName: 'Avatar Solar (Titã de Rá)',
      titanRole: 'Colosso solar alado em armadura de ouro reluzente com disco solar flamejante e cetro Ankh monumental.',
    },
    {
      id: 'Ísis',
      name: 'Ísis',
      title: 'Deusa da Magia (Proteção & Fertilidade)',
      color: '#06b6d4',
      titanName: 'Guardiã Celeste do Nilo (Titã de Ísis)',
      titanRole: 'Colosso alado de marfim e turquesa, coroada com o disco hathórico e cetro de lótus primordial.',
    },
    {
      id: 'Set',
      name: 'Set',
      title: 'Deus do Caos (Tempestades de Areia & Feras)',
      color: '#ef4444',
      titanName: 'Besta Titânica do Caos (Titã de Set)',
      titanRole: 'Besta colossal do deserto com orelhas rígidas e foice Khopesh rubra de basalto e chamas do deserto.',
    },
  ],
  norse: [
    {
      id: 'Thor',
      name: 'Thor',
      title: 'Deus do Trovão (Força Heroica & Tempestades)',
      color: '#38bdf8',
      titanName: 'Gigante do Trovão Mjölnir (Titã de Thor)',
      titanRole: 'Titã guerreiro com chifres maciços de bronze e um martelo monumental Mjölnir de granito rúnico.',
    },
    {
      id: 'Odin',
      name: 'Odin',
      title: 'Pai de Todos (Sabedoria & Runas de Guerra)',
      color: '#818cf8',
      titanName: 'Gigante Primordial Ymir (Titã de Odin)',
      titanRole: 'Ancestral colossal de gelo eterno com runas brilhantes, asas de corvo e a lança sagrada Gungnir.',
    },
    {
      id: 'Loki',
      name: 'Loki',
      title: 'Mestre da Trapaça (Chamas & Mudança de Forma)',
      color: '#f97316',
      titanName: 'Titã Ymir — Gigante de Gelo Primordial',
      titanRole: 'O gigantesco Ymir, gigante de gelo primordial armado com um machado colossal.',
    },
    {
      id: 'Freyr',
      name: 'Freyr',
      title: 'Senhor de Alfheim (Defesa Rúnica & Prosperidade)',
      color: '#eab308',
      titanName: 'Titã Ymir — Gigante de Gelo Primordial',
      titanRole: 'O gigantesco Ymir, gigante de gelo primordial armado com um machado colossal.',
    },
  ],
  atlantean: [
    {
      id: 'Cronos',
      name: 'Cronos',
      title: 'Titã Primordial do Tempo (Oricalco & Teletransporte)',
      color: '#fbbf24',
      titanName: 'Senhor Supremo do Tempo (Titã de Cronos)',
      titanRole: 'Titã primordial com anéis de oricalco flutuantes em órbita temporal e a foice estelar da eternidade.',
    },
    {
      id: 'Urano',
      name: 'Urano',
      title: 'Titã dos Céus (Vórtices & Portais Celestiais)',
      color: '#a855f7',
      titanName: 'Vórtice Celestial (Titã de Urano)',
      titanRole: 'Titã cósmico envolto por anéis de plasma etéreo, empunhando uma lâmina luminosa transcendental.',
    },
    {
      id: 'Gaia',
      name: 'Gaia',
      title: 'Mãe Terra (Natureza Viva & Regeneração)',
      color: '#22c55e',
      titanName: 'Mãe Terra Primordial (Titã de Gaia)',
      titanRole: 'Titã vegetal de rocha viva e raízes sagradas com folhagens esmeraldas e clava florestal colossal.',
    },
  ],
};

export function getUnitsForCivAndGod(civ: PantheonId, majorGod: string): CivEntityOption[] {
  const godList = MAJOR_GODS_BY_CIV[civ] || MAJOR_GODS_BY_CIV.greek!;
  const godInfo = godList.find((g) => g.id.toLowerCase() === (majorGod || '').toLowerCase()) || godList[0];

  if (civ === 'greek') {
    const isZeus = godInfo.id.toLowerCase() === 'zeus';
    const isPoseidon = godInfo.id.toLowerCase() === 'poseidon';
    const isHades = godInfo.id.toLowerCase() === 'hades';

    const godUnit: CivEntityOption = isZeus
      ? { id: 'zeus', name: 'Zeus (Deus Maior)', role: 'Pai dos Deuses — Empunha Raios Divinos e convoca Tempestades', category: 'god' }
      : isPoseidon
      ? { id: 'poseidon', name: 'Poseidon (Deus dos Mares)', role: 'Senhor dos Mares — Conduzido por vórtices, golpeia com tridente e invoca tsunamis', category: 'god' }
      : { id: 'hades', name: 'Hades (Senhor do Submundo)', role: 'Monarca dos Mortos — Empunha o Bidente Real, invoca Chamas do Tártaro e o Portal das Almas', category: 'god' };

    return [
      godUnit,
      { id: 'artemis', name: 'Ártemis (Deusa Menor)', role: 'Deusa da Caça & da Lua — Foice Lunar, Corça de Prata e Alcateia Noturna', category: 'god' },
      { id: 'hefesto', name: 'Hefesto (Deus Menor)', role: 'Deus da Forja & do Fogo — Grande Martelo Divino e Autômato Dourado', category: 'god' },
      { id: 'dionisio', name: 'Dionísio (Deus Menor)', role: 'Deus do Vinho & do Êxtase — Tirso dourado, Cálice e Vinhas Selvagens', category: 'god' },
      { id: 'afrodite', name: 'Afrodite (Deusa Menor)', role: 'Deusa da Beleza & do Amor — Concha de nácar e Maré de Paixão', category: 'god' },
      { id: 'apolo', name: 'Apolo (Deus Menor)', role: 'Deus do Sol & da Luz — Arco Solar Recurvo, Kithara e Chama de Hélio', category: 'god' },
      { id: 'ares', name: 'Ares (Deus Menor)', role: 'Deus da Guerra Brutal — Xiphos incandescente, Hoplon (Λ) e Fúria', category: 'god' },
      { id: 'atena', name: 'Atena (Deusa Menor)', role: 'Deusa da Sabedoria — Lança Dory dourada, Égide e Coruja Glaux', category: 'god' },
      { id: 'hermes', name: 'Hermes (Deus Menor)', role: 'Mensageiro dos Deuses — Pétaso Alado, Talária e Caduceu Sagrado', category: 'god' },
      {
        id: 'hoplite',
        name: isZeus ? 'Hoplita de Zeus (T1–T4)' : isPoseidon ? 'Hoplita do Tridente (T1–T4)' : 'Hoplita do Tártaro (T1–T4)',
        role: isZeus
          ? 'Espinha dorsal da falange — Lança Dory, Hoplon (Λ) e Elmo Coríntio (+20% HP/Dano)'
          : isPoseidon
          ? 'Guerreiro costeiro com bênção das marés e falange pesada'
          : 'Guarda fúnebre com armadura de bronze escuro',
        category: 'troop',
      },
      {
        id: 'hipaspist',
        name: isZeus ? 'Hipaspista de Zeus (T1–T4)' : isPoseidon ? 'Hipaspista das Ondas (T1–T4)' : 'Hipaspista das Sombras (T1–T4)',
        role: 'Infantaria leve anti-infantaria — Espada curva Kopis e Escudo Áspis estrelado',
        category: 'troop',
      },
      ...(isZeus
        ? [
            {
              id: 'myrmidon' as UnitKind,
              name: 'Mirmidão de Zeus (Era Mítica · T1–T4)',
              role: 'Infantaria de elite exclusiva de Zeus — ganha velocidade (+35%) e ataque (+40%) em combate',
              category: 'troop' as const,
            },
          ]
        : []),
      {
        id: 'peltast',
        name: isZeus ? 'Peltasta de Zeus (T1–T4)' : isPoseidon ? 'Peltasta das Marés (T1–T4)' : 'Peltasta Sombrio (T1–T4)',
        role: 'Escaramuçador ágil — Escudo Pelta em meia-lua e dardos leves',
        category: 'troop',
      },
      {
        id: 'archer',
        name: isZeus ? 'Toxota de Zeus (T1–T4)' : isPoseidon ? 'Toxota da Correnteza (T1–T4)' : 'Toxota das Sombras (T1–T4)',
        role: 'Arqueiro grego clássico de longo alcance com arco recurvo composto',
        category: 'troop',
      },
      {
        id: 'gastraphetes',
        name: 'Gastraphetes (Apolo · T1–T4)',
        role: 'Besteiro pesado grego de longo alcance e alto dano perfurante',
        category: 'troop',
      },
      {
        id: 'cavalry',
        name: isZeus ? 'Hippikon de Zeus (T1–T4)' : isPoseidon ? 'Hetaireia de Poseidon (T1–T4)' : 'Hippikon Espectral (T1–T4)',
        role: 'Cavalaria pesada rápida — forte contra arqueiros e máquinas de cerco',
        category: 'troop',
      },
      {
        id: 'prodromos',
        name: isZeus ? 'Pródromo de Zeus (T1–T4)' : isPoseidon ? 'Pródromo das Ondas (T1–T4)' : 'Pródromo das Sombras (T1–T4)',
        role: 'Cavalaria leve veloz anti-cavalaria com lança longa Kontos',
        category: 'troop',
      },
      { id: 'ram', name: 'Aríete Coberto', role: 'Máquina blindada de cerco com cabeça de carneiro em bronze', category: 'troop' },
      { id: 'siege', name: 'Catapulta Helepolis', role: 'Artilharia pesada de torção com projéteis flamejantes em área', category: 'troop' },
      {
        id: 'villager',
        name: isZeus ? 'Aldeão Devoto de Zeus' : isPoseidon ? 'Aldeão Pescador de Poseidon' : 'Aldeão Mineiro de Hades',
        role: isHades ? 'Econômico com bônus de extração de ouro e pedras' : 'Unidade econômica de coleta e construção',
        category: 'troop',
      },
      { id: 'jason', name: 'Jasão (Herói de Zeus)', role: 'Líder dos Argonautas com Velocino de Ouro (3.5x vs Míticas)', category: 'hero' },
      { id: 'ajax', name: 'Ajax de Salamina (Herói)', role: 'Escudo Torre de 7 camadas e Lança Dory colossal (3.5x vs Míticas)', category: 'hero' },
      { id: 'odysseus', name: 'Ulisses / Odysseus (Herói)', role: 'Rei de Ítaca com Arco Recurvo letal à distância (3.6x vs Míticas)', category: 'hero' },
      { id: 'hippolyta', name: 'Hipólita (Heroína Amazona)', role: 'Rainha Amazona ágil focada em ataques à distância (3.4x vs Míticas)', category: 'hero' },
      { id: 'theseus', name: 'Teseu de Atenas (Herói)', role: 'Especialista em combate tático com Lança Dory e Hoplon', category: 'hero' },
      { id: 'perseus', name: 'Perseu (Herói)', role: 'Espada curva Harpê e Escudo Espelho da Égide (3.8x vs Míticas)', category: 'hero' },
      { id: 'bellerophon', name: 'Belerofonte em Pégaso (Herói)', role: 'Herói alado montado em Pégaso com investida aérea devastadora', category: 'hero' },
      { id: 'cyclops', name: 'Ciclope (Zeus · Templo)', role: 'Colosso de um olho com clava maciça e arremesso de inimigos', category: 'myth' },
      { id: 'minotaur', name: 'Minotauro de Creta', role: 'Criatura mítica feroz com machado Labrys e golpe esmagador', category: 'myth' },
      { id: 'centaur', name: 'Centauro (Hermes)', role: 'Arqueiro mítico veloz de longo alcance', category: 'myth' },
      { id: 'nymph', name: 'Ninfa / Dríade', role: 'Espírito da natureza ágil com ataques mágicos à média distância', category: 'myth' },
      { id: 'pegasus', name: 'Pégaso (Hermes)', role: 'Corcel alado sagrado — batedor voador extremamente veloz', category: 'myth' },
      { id: 'manticore', name: 'Mantícora (Apolo/Ártemis)', role: 'Leão alado com cauda de escorpião e rajadas de espinhos em área', category: 'myth' },
      { id: 'hydra', name: 'Hidra (Dionísio)', role: 'Monstro de cinco cabeças com regeneração contínua', category: 'myth' },
      { id: 'satyr', name: 'Sátiro (Dionísio)', role: 'Escaramuçador silvestre ágil que arremessa dardos letais', category: 'myth' },
      { id: 'phoenix', name: 'Fênix (Apolo)', role: 'Ave imortal flamejante que lança orbes de fogo em área', category: 'myth' },
      { id: 'colossus', name: 'Colosso de Bronze (Hefesto)', role: 'Gigante de bronze forjado — armadura colossal e autorreparo', category: 'myth' },
      { id: 'automaton', name: 'Autômato (Hefesto)', role: 'Constructo mecânico de bronze com engrenagem dorsal', category: 'myth' },
      { id: 'iron_dwarf', name: 'Anão de Ferro (Hefesto)', role: 'Guerreiro ferreiro blindado com martelo pesado anti-construções', category: 'myth' },
      { id: 'medusa', name: 'Medusa (Hera/Ártemis)', role: 'Górgona com flechas petrificantes que congelam inimigos', category: 'myth' },
      { id: 'titan', name: godInfo.titanName, role: godInfo.titanRole, category: 'myth' },
    ];
  }

  if (civ === 'egyptian') {
    const isRa = godInfo.id.toLowerCase() === 'rá' || godInfo.id.toLowerCase() === 'ra';
    const isIsis = godInfo.id.toLowerCase() === 'ísis' || godInfo.id.toLowerCase() === 'isis';
    const isSet = godInfo.id.toLowerCase() === 'set';

    const godOption: CivEntityOption[] = isRa
      ? [{ id: 'ra', name: 'Rá (Deus Maior do Sol)', role: 'Elmo Faraônico de Falcão, Cetro Was e Chave Ankh Flutuantes, Raio de Rá', category: 'god' }]
      : isIsis
      ? [{ id: 'isis', name: 'Ísis (Deusa Maior da Magia)', role: 'Asas Volumétricas Aladas, Magia de Heka, Sopro da Vida e Estrela de Sopdet', category: 'god' }]
      : isSet
      ? [{ id: 'set', name: 'Set (Deus Maior do Caos)', role: 'Cabeça Bestial, Cetro Was e Chave Ankh Flutuantes, Tempestade de Areia', category: 'god' }]
      : [];

    return [
      ...godOption,
      { id: 'villager', name: 'Trabalhador Egípcio', role: 'Coleta comida, madeira e ouro e ergue monumentos faraônicos', category: 'troop' },
      { id: 'priest', name: 'Sacerdote de Rá', role: 'Cura aliados, ergue Obeliscos e dispara feixes solares contra Míticas', category: 'hero' },
      { id: 'pharaoh', name: 'Faraó', role: 'Herói único que energiza estruturas, coleta relíquias e destrói Míticas', category: 'hero' },
      { id: 'son_of_osiris', name: 'Filho de Osíris (Era Mítica)', role: 'Semideus com cabeça de falcão solar que dispara raios em cadeia', category: 'hero' },
      { id: 'egypt_spearman', name: 'Lanceiro (Quartel)', role: 'Infantaria rápida especialista em derrotar cavalaria inimiga', category: 'troop' },
      { id: 'slinger', name: 'Fundeiro (Quartel)', role: 'Atirador de funda especializado contra arqueiros à distância', category: 'troop' },
      { id: 'axeman', name: 'Homem-Machado (Quartel)', role: 'Infantaria pesada com machado épsilon de bronze anti-infantaria', category: 'troop' },
      { id: 'chariot_archer', name: 'Arqueiro de Biga (Migdol)', role: 'Arqueiro montado veloz em biga solar forte contra infantaria', category: 'troop' },
      { id: 'camel_rider', name: 'Cavaleiro de Camelo (Migdol)', role: 'Cavalaria ágil com espada Khopesh contra arqueiros e cavalaria', category: 'troop' },
      { id: 'war_elephant', name: 'Elefante de Guerra (Migdol)', role: 'Unidade pesada de altíssima resistência que esmaga construções', category: 'troop' },
      { id: 'siege_tower', name: 'Torre de Cerco (Cerco)', role: 'Veículo blindado de linho e ouro que demole muralhas e fortalezas', category: 'troop' },
      { id: 'egypt_catapult', name: 'Catapulta Egípcia (Cerco)', role: 'Artilharia de longo alcance com projéteis incendiários', category: 'troop' },
      { id: 'sphinx', name: 'Esfinge (Bast · Era Clássica)', role: 'Criatura leonina com toucado Nemes e ataque giratório de areia', category: 'myth' },
      { id: 'wadjet', name: 'Wadjet (Ptá · Era Clássica)', role: 'Serpente naja alada que cospe veneno corrosivo à distância', category: 'myth' },
      { id: 'roc', name: 'Roca (Hator/Sobek · Era Heroica)', role: 'Pássaro soberano gigante de travessia aérea veloz', category: 'myth' },
      { id: 'petsuchos', name: 'Petsuchos (Sobek · Era Heroica)', role: 'Crocodilo sagrado com disco solar que dispara feixe concentrado', category: 'myth' },
      { id: 'scarab', name: 'Escaravelho (Sekhmet · Era Heroica)', role: 'Besouro blindado demolidor que explode em ácido ao cair', category: 'myth' },
      { id: 'avenger', name: 'Vingador (Hórus · Era Mítica)', role: 'Guerreiro de elite com cabeça de falcão e duas lâminas Khopesh', category: 'myth' },
      { id: 'mummy', name: 'Múmia (Osíris · Era Mítica)', role: 'Sacerdote imortal que lança maldições à distância', category: 'myth' },
      { id: 'titan', name: godInfo.titanName, role: godInfo.titanRole, category: 'myth' },
    ];
  }

  if (civ === 'norse') {
    return [
      { id: 'villager', name: 'Coletor Nórdico', role: 'Coleta alimento, madeira e ouro e cultiva fazendas', category: 'troop' },
      { id: 'norse_dwarf', name: 'Anão Minerador', role: 'Forjador de Nidavellir especialista na coleta acelerada de Ouro', category: 'troop' },
      { id: 'ox_cart', name: 'Carro de Bois', role: 'Depósito móvel de recursos que acompanha coletores e anões', category: 'troop' },
      { id: 'hersir', name: 'Hersir (Herói Nórdico)', role: 'Herói com martelo rúnico que gera Favor em combate', category: 'hero' },
      { id: 'godi', name: 'Godi (Herói à Distância)', role: 'Sacerdote-herói que arremessa lanças rúnicas contra Míticas', category: 'hero' },
      { id: 'ulfsark', name: 'Ulfsark / Berserk', role: 'Infantaria rápida de dupla lâmina que constrói edifícios nórdicos', category: 'troop' },
      { id: 'throwing_axeman', name: 'Lançador de Machado', role: 'Infantaria que arremessa machados à distância contra infantaria', category: 'troop' },
      { id: 'raiding_cavalry', name: 'Cavaleiro de Incursão', role: 'Cavalaria rápida viking para flanquear arqueiros e trabalhadores', category: 'troop' },
      { id: 'huskarl', name: 'Huskarl (Forte da Colina)', role: 'Infantaria de elite com altíssima armadura contra projéteis', category: 'troop' },
      { id: 'jarl', name: 'Jarl (Forte da Colina)', role: 'Cavalaria pesada nobre com bônus contra unidades míticas', category: 'troop' },
      { id: 'portable_ram', name: 'Aríete Portátil', role: 'Aríete viking carregado por guerreiros contra muralhas e torres', category: 'troop' },
      { id: 'norse_ballista', name: 'Balista Nórdica', role: 'Artilharia pesada de longo alcance com virotes gigantes', category: 'troop' },
      { id: 'troll', name: 'Troll (Forseti · Clássica)', role: 'Arremessa pedregulhos à distância e regenera vida ao atacar', category: 'myth' },
      { id: 'valkyrie', name: 'Valquíria (Freyja · Clássica)', role: 'Guerreira celestial montada em corcel branco que cura aliados', category: 'myth' },
      { id: 'einherjar', name: 'Einherjar (Heimdall · Clássica)', role: 'Guerreiro imortal com machado colossal e trompa Gjallarhorn', category: 'myth' },
      { id: 'frost_giant', name: 'Gigante de Gelo (Skadi/Hel)', role: 'Colosso glacial de Niflheim com sopro congelante', category: 'myth' },
      { id: 'mountain_giant', name: 'Gigante da Montanha (Njord/Hel)', role: 'Colosso de granito armado com tronco de pinheiro demolidor', category: 'myth' },
      { id: 'battle_boar', name: 'Javali de Batalha (Bragi)', role: 'Gullinbursti mecânico dourado que arremessa inimigos pelos ares', category: 'myth' },
      { id: 'kraken', name: 'Kraken (Njord)', role: 'Monstro abissal tentacular devastador em costas e mares', category: 'myth' },
      { id: 'rock_troll', name: 'Troll da Rocha (Aegir/Freyr)', role: 'Criatura blindada de rocha e cristais rúnicos', category: 'myth' },
      { id: 'fire_giant', name: 'Gigante de Fogo (Baldr/Hel)', role: 'Colosso de Muspelheim que dispara bolas de fogo em área', category: 'myth' },
      { id: 'fenris_wolf', name: 'Cria de Fenris (Tyr)', role: 'Lobo monstruoso que ganha força quando luta em matilha', category: 'myth' },
      { id: 'nidhogg', name: 'Nidhogg (Hel · Era Mítica)', role: 'Dragão gigante invocado por Hel que cospe fogo devastador', category: 'myth' },
      { id: 'jormungand', name: 'Jormungand (Njord/Hel)', role: 'Serpente marinha colossal com jatos de ácido', category: 'myth' },
      { id: 'fafnir', name: 'Fafnir (Vidar/Freyr)', role: 'Dragão terrestre encouraçado em ouro amaldiçoado e veneno', category: 'myth' },
      { id: 'titan', name: 'Titã Ymir (Fim de Jogo)', role: 'Gigante de gelo primordial armado com machado colossal', category: 'myth' },
    ];
  }

  const isCronos = godInfo.id.toLowerCase() === 'cronos';
  const isUrano = godInfo.id.toLowerCase() === 'urano';

  return [
    {
      id: 'murmillo',
      name: isCronos ? 'Murmillo do Tempo' : isUrano ? 'Murmillo Celeste' : 'Murmillo Silvestre',
      role: 'Infantaria pesada com armadura de oricalco e escudo protetor',
      category: 'troop',
    },
    {
      id: 'katapeltes',
      name: 'Katapeltes (Quartel)',
      role: 'Infantaria atlante anti-cavalaria armada com lança perfurante',
      category: 'troop',
    },
    {
      id: 'arcus',
      name: isCronos ? 'Arcus da Entropia' : isUrano ? 'Arcus do Éter' : 'Arcus da Natureza',
      role: 'Arqueiro de elite com flechas perfurantes de oricalco',
      category: 'troop',
    },
    {
      id: 'turma',
      name: 'Turma (Contra-Quartel)',
      role: 'Escaramuçador montado rápido que arremessa dardos contra arqueiros',
      category: 'troop',
    },
    {
      id: 'contarius',
      name: isCronos ? 'Contarius Temporal' : isUrano ? 'Contarius Estelar' : 'Contarius da Rocha Viva',
      role: 'Cavalaria pesada de impacto com lança longa de oricalco',
      category: 'troop',
    },
    {
      id: 'destroyer',
      name: 'Destruidor / Destroyer',
      role: 'Infantaria de cerco com escudo colossal anti-edificações',
      category: 'troop',
    },
    {
      id: 'fanatic',
      name: 'Fanático / Fanatic',
      role: 'Guerreiro de lâmina dupla com ataque giratório frenético',
      category: 'troop',
    },
    {
      id: 'cheiroballista',
      name: 'Quirrobalista',
      role: 'Balista de repetição portátil anti-infantaria',
      category: 'troop',
    },
    {
      id: 'fire_siphon',
      name: 'Sifão de Fogo (Cerco)',
      role: 'Lança-chamas de oricalco montado sobre rodas para queimar edifícios',
      category: 'troop',
    },
    {
      id: 'onager',
      name: 'Onagro Atlante (Cerco)',
      role: 'Catapulta pesada com projéteis incendiários de oricalco',
      category: 'troop',
    },
    {
      id: 'citizen',
      name: isCronos ? 'Cidadão Croniano' : isUrano ? 'Cidadão dos Céus' : 'Cidadão de Gaia',
      role: 'Trabalhador autossuficiente acompanhado de mula de carga',
      category: 'troop',
    },
    {
      id: 'oracle',
      name: 'Oráculo Atlante',
      role: 'Explorador que expande campo de visão quando parado e gera Favor',
      category: 'hero',
    },
    {
      id: 'promethean',
      name: 'Prometeico (Prometeu · Clássica)',
      role: 'Golem de argila viva que se divide em dois ao ser derrotado',
      category: 'myth',
    },
    {
      id: 'automaton',
      name: 'Autômato (Leto · Clássica)',
      role: 'Constructo metálico com engrenagem dorsal e autorreparação contínua',
      category: 'myth',
    },
    {
      id: 'caladria',
      name: 'Caládria (Oceano · Clássica)',
      role: 'Pássaro celestial de cura que regenera unidades aliadas em área',
      category: 'myth',
    },
    {
      id: 'carnivora',
      name: 'Carnívora (Oceano · Clássica)',
      role: 'Planta monstruosa fixa que devora inimigos com mordidas ferozes',
      category: 'myth',
    },
    {
      id: 'behemoth',
      name: 'Beemote (Réia · Heroica)',
      role: 'Monstro couraçado que regenera vida e demole muralhas',
      category: 'myth',
    },
    {
      id: 'satyr',
      name: 'Sátiro (Hipérion · Heroica)',
      role: 'Escaramuçador caprino com rajadas de dardos perfurantes',
      category: 'myth',
    },
    {
      id: 'stymphalian_bird',
      name: 'Ave do Estínfalo (Teia · Heroica)',
      role: 'Pássaro voador metálico que dispara penas afiadas de bronze',
      category: 'myth',
    },
    {
      id: 'dryad',
      name: 'Dríade (Teia · Heroica)',
      role: 'Espírito dos carvalhos com chicote de vinhas venenosas',
      category: 'myth',
    },
    {
      id: 'hekagigantes',
      name: 'Hecatônquiro / Centimano (Hélios · Mítica)',
      role: 'Colosso de múltiplos braços que golpeia o solo com ondas de choque',
      category: 'myth',
    },
    {
      id: 'argus',
      name: 'Argos (Atlas · Mítica)',
      role: 'Esfera flutuante de cem olhos com tentáculos e raio ácido',
      category: 'myth',
    },
    {
      id: 'lampades',
      name: 'Lâmpade (Hécate · Mítica)',
      role: 'Ninfa das trevas que arremessa esferas de loucura e caos',
      category: 'myth',
    },
    {
      id: 'tartarian_spawn',
      name: 'Cria do Tártaro (Hécate · Mítica)',
      role: 'Demônio alado de chamas sombrias emergido do abismo',
      category: 'myth',
    },
    { id: 'titan', name: godInfo.titanName, role: godInfo.titanRole, category: 'myth' },
  ];
}

export function getBuildingsForCivAndGod(civ: PantheonId, majorGod: string): { id: BuildingKind; name: string; role: string }[] {
  const god = majorGod || 'Zeus';
  if (civ === 'norse') {
    return [
      { id: 'town_center', name: `Grande Casa Longa (${god})`, role: 'Salão Comunal de madeira entalhada, pedra e proas de dragão — evolui T1–T5' },
      { id: 'barracks', name: `Salão de Hidromel (${god})`, role: 'Salão de Hidromel com escudos vikings — treina infantaria e hersires' },
      { id: 'temple', name: `Templo Nórdico Hof (${god})`, role: `Templo Stave com pedras rúnicas e proas de Drakkar — invoca míticos de ${god}` },
      { id: 'fortress', name: `Forte da Colina (${god})`, role: 'Fortaleza paliçada sobre granito — treina Huskarl, Jarl, Aríete e Balista' },
      { id: 'armory', name: `Forja Anã (${god})`, role: 'Forja rúnica de pedra e madeira — aprimora armas e armaduras dos Anões' },
      { id: 'archery_range', name: `Salão de Machados (${god})`, role: 'Pátio de combate nórdico para Lançadores de Machado' },
      { id: 'stable', name: `Estábulo de Incursão (${god})`, role: 'Salão de cavalaria nórdica para Cavalaria de Incursão e Jarls' },
      { id: 'siege_works', name: `Oficina de Cerco Viking (${god})`, role: 'Constrói Aríetes Portáteis e Balistas de precisão' },
      { id: 'house', name: `Casa Longa (${god})`, role: 'Habitação nórdica de madeira e pedra com escudo no frontão' },
      { id: 'tower', name: `Torre de Vigia Viking (${god})`, role: 'Torre defensiva de madeira e granito adornada com escudos do clã' },
      { id: 'market', name: `Mercado Nórdico (${god})`, role: 'Entreposto de trocas comerciais e caravanas de suprimentos' },
      { id: 'farm', name: `Lavoura Nórdica (${god})`, role: 'Campos cercados para produção contínua de alimento' },
      { id: 'titan_gate', name: `Portão de Ymir (${god})`, role: 'Escavação rúnica colossal da Era Mítica para invocar o Titã' },
    ];
  }
  return [
    { id: 'town_center', name: `Centro da Cidade (${god})`, role: `Sede principal consagrada a ${god} — evolui da Era Arcaica até a Metrópole Divina (T5)` },
    { id: 'barracks', name: `Quartel de ${god}`, role: `Treina infantaria sob a bênção de ${god}` },
    { id: 'archery_range', name: `Campo de Tiro (${god})`, role: 'Treina atiradores e escaramuçadores de longo alcance' },
    { id: 'stable', name: `Estábulo de ${god}`, role: 'Treina cavalaria pesada e batedores montados' },
    { id: 'siege_works', name: `Oficina de Cerco (${god})`, role: 'Constrói aríetes cobertos, torres e catapultas de cerco' },
    { id: 'armory', name: `Arsenal Divino de ${god}`, role: `Forja armas e armaduras aprimoradas com tecnologias de ${god}` },
    { id: 'temple', name: `Templo Sagrado de ${god}`, role: `Gera Favor divino e treina criaturas míticas devotas a ${god}` },
    { id: 'fortress', name: `Fortaleza de ${god}`, role: `Bastião defensivo monumental e treinamento de elite sob ${god}` },
    { id: 'house', name: `Habitação (${god})`, role: 'Abriga os povos eleitos e amplia o limite populacional' },
    { id: 'tower', name: `Torre de Vigia (${god})`, role: 'Guarda avançada que vigia fronteiras e dispara flechas abençoadas' },
    { id: 'market', name: `Mercado (${god})`, role: 'Permite câmbio de recursos e caravanas comerciais' },
    { id: 'farm', name: `Fazenda (${god})`, role: 'Fonte infinita de alimento cultivado para a economia do império' },
    { id: 'titan_gate', name: `Portão Titã (${god})`, role: 'Portal escavado na Era Mítica para despertar o Titã da civilização' },
  ];
}

export interface GalleryFloraItem {
  id: string;
  name: string;
  category: 'tree' | 'resource';
  treeStyle?: BiomeTreeStyle;
  resourceKind?: ResourceNodeKind | 'relic' | 'plenty_vault' | 'settlement';
  biomeAffinity: string;
  yieldLabel: string;
  desc: string;
  previewMapId: MapId;
}

export const GALLERY_FLORA_ITEMS: GalleryFloraItem[] = [
  {
    id: 'oak',
    name: 'Carvalho Olímpico',
    category: 'tree',
    treeStyle: 'oak',
    biomeAffinity: 'Mediterrâneo · Acrópole · Terras Altas · Megalópole',
    yieldLabel: '150–200 Madeira',
    desc: 'Árvore frondosa de copa ampla e raízes firmes, típica das planícies helênicas e colinas férteis.',
    previewMapId: 'mediterranean',
  },
  {
    id: 'nordic_pine',
    name: 'Pinheiro Nórdico',
    category: 'tree',
    treeStyle: 'nordic_pine',
    biomeAffinity: 'Alfheim · Midgard · Vinlandsaga',
    yieldLabel: '160–220 Madeira',
    desc: 'Conífera alta de agulhas densas verde-escuras adaptada aos fiordes e bosques frios do Norte.',
    previewMapId: 'alfheim',
  },
  {
    id: 'snow_pine',
    name: 'Pinheiro Nevado Ártico',
    category: 'tree',
    treeStyle: 'snow_pine',
    biomeAffinity: 'Tundra · Jotunheim · Lago Fantasma',
    yieldLabel: '120–160 Madeira',
    desc: 'Abeto coberto por camadas espessas de neve congelada; madeira rara e disputada nas estepes gélidas.',
    previewMapId: 'tundra',
  },
  {
    id: 'palm',
    name: 'Palmeira Tamareira',
    category: 'tree',
    treeStyle: 'palm',
    biomeAffinity: 'Rio Nilo · Oásis · Vale dos Reis · Ilhas · Arquipélago',
    yieldLabel: '140–180 Madeira',
    desc: 'Tronco curvado segmentado com cachos de tâmaras e seis frondes arqueadas ao redor de oásis e litorais.',
    previewMapId: 'oasis',
  },
  {
    id: 'acacia',
    name: 'Acácia da Savana',
    category: 'tree',
    treeStyle: 'acacia',
    biomeAffinity: "Savana · Poço d'Água · Anatólia",
    yieldLabel: '140–180 Madeira',
    desc: 'Copa larga em forma de guarda-sol que oferece sombra esparsa nas planícies douradas africanas.',
    previewMapId: 'savannah',
  },
  {
    id: 'marsh_cypress',
    name: 'Cipreste do Pântano',
    category: 'tree',
    treeStyle: 'marsh_cypress',
    biomeAffinity: 'Pântano · Mar de Vermes · Megalópole',
    yieldLabel: '160–210 Madeira',
    desc: 'Tronco retorcido com raízes alargadas e cipós de musgo pendentes sobre brejos e lagoas rasas.',
    previewMapId: 'marsh',
  },
  {
    id: 'jungle',
    name: 'Árvore Tropical Densa',
    category: 'tree',
    treeStyle: 'jungle',
    biomeAffinity: 'Yucatán · Arquipélago',
    yieldLabel: '190–240 Madeira',
    desc: 'Gigante de selva úmida com múltiplos patamares de folhagem esmeralda espessa.',
    previewMapId: 'yucatan',
  },
  {
    id: 'birch',
    name: 'Bétula Alpina',
    category: 'tree',
    treeStyle: 'birch',
    biomeAffinity: 'Nômade · Migração em Equipe · Vinlandsaga · Alfheim',
    yieldLabel: '140–175 Madeira',
    desc: 'Tronco claro esbranquiçado bifurcado com folhagem dourada-esverdeada de clima temperado frio.',
    previewMapId: 'nomad',
  },
  {
    id: 'oriental',
    name: 'Bambuzal & Salgueiro Oriental',
    category: 'tree',
    treeStyle: 'oriental',
    biomeAffinity: 'Rio Amarelo',
    yieldLabel: '150–200 Madeira',
    desc: 'Feixes de colmos esguios de bambu inclinados ao vento sob copas leves de vale fluvial.',
    previewMapId: 'yellow_river',
  },
  {
    id: 'erebus_ash',
    name: 'Freixo Vulcânico de Érebo',
    category: 'tree',
    treeStyle: 'erebus_ash',
    biomeAffinity: 'Érebo (Submundo)',
    yieldLabel: '130–170 Madeira',
    desc: 'Árvore carbonizada do Tártaro com galhos retorcidos e brasas incandescente nas fendas.',
    previewMapId: 'erebus',
  },
  {
    id: 'berry',
    name: 'Arbusto de Bagas / Frutas',
    category: 'resource',
    resourceKind: 'berry',
    biomeAffinity: 'Todos os Biomas (varia cor por clima)',
    yieldLabel: '250 Alimento',
    desc: 'Fonte inicial segura de alimento próximo às bases; muda para tâmaras no deserto e frutos gélidos na tundra.',
    previewMapId: 'mediterranean',
  },
  {
    id: 'gold_mine',
    name: 'Mina de Ouro Geográfica',
    category: 'resource',
    resourceKind: 'gold_mine',
    biomeAffinity: 'Afloramentos de Rocha / Arenito / Gelo / Obsidiana',
    yieldLabel: '850–1800 Ouro',
    desc: 'Afloramento mineral adaptado à rocha local do mapa com veios cristalinos dourados de alta pureza.',
    previewMapId: 'valley_of_the_kings',
  },
  {
    id: 'relic',
    name: 'Relíquia Sagrada',
    category: 'resource',
    resourceKind: 'relic',
    biomeAffinity: 'Sítios Neutros em Todo o Mapa',
    yieldLabel: 'Bônus Contínuo no Templo',
    desc: 'Cálice dourado com orbe etéreo recolhido por Heróis e depositado no Templo para conceder bênçãos permanentes.',
    previewMapId: 'acropolis',
  },
  {
    id: 'plenty_vault',
    name: 'Cofre da Abundância',
    category: 'resource',
    resourceKind: 'plenty_vault',
    biomeAffinity: 'Cume Central de Rei da Colina',
    yieldLabel: '+Alimento, Madeira e Ouro/seg',
    desc: 'Altar monumental que abastece continuamente o exército que mantiver controle do cume.',
    previewMapId: 'king_of_the_hill',
  },
  {
    id: 'settlement',
    name: 'Marco de Assentamento',
    category: 'resource',
    resourceKind: 'settlement',
    biomeAffinity: 'Territórios de Expansão Neutros',
    yieldLabel: 'Novo Centro da Cidade',
    desc: 'Terreno demarcado com estacas, toras e fogueira central pronto para erguer um novo Centro de Vila/Cidade.',
    previewMapId: 'mediterranean',
  },
];

export interface GalleryFaunaItem {
  kind: FaunaKind;
  name: string;
  labelPt: string;
  role: string;
  biome: string;
  maxHp: number;
  foodAmount: number;
  attack: number;
  speed: number;
  retaliates: boolean;
  coatHex: number;
  underbellyHex: number;
  hornOrTuskHex: number;
}

export const GALLERY_FAUNA_ITEMS: GalleryFaunaItem[] = (Object.keys(FAUNA_STATS) as FaunaKind[]).map((kind) => {
  const s = FAUNA_STATS[kind];
  const tex = FAUNA_TEXTURA_CATALOG[kind];
  return {
    kind,
    name: s.name,
    labelPt: tex?.labelPt ?? s.name,
    role: s.role,
    biome: tex?.biome ?? 'Diversos Biomas',
    maxHp: s.maxHp,
    foodAmount: s.foodAmount,
    attack: s.attack,
    speed: s.speed,
    retaliates: s.retaliates,
    coatHex: tex?.coatHex ?? 0x8b6f47,
    underbellyHex: tex?.underbellyHex ?? 0xe5dcc8,
    hornOrTuskHex: tex?.hornOrTuskHex ?? 0x3b3530,
  };
});

export const GALLERY_MAP_ITEMS: MapConfig[] = Object.values(MAPS);

export interface MapDioramaHandle {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  wireframeMesh: THREE.Mesh;
  floraGroup: THREE.Group;
  faunaGroup: THREE.Group;
  floraCanopies: THREE.Object3D[];
  faunaMeshes: THREE.Group[];
  minHeight: number;
  maxHeight: number;
  waterCoveragePct: number;
  dispose: () => void;
}

const _cBase = new THREE.Color();
const _cRoad = new THREE.Color();
const _cSand = new THREE.Color();
const _cHigh = new THREE.Color();
const _cCliff = new THREE.Color();
const _cFertile = new THREE.Color();
const _cTmp = new THREE.Color();

/**
 * Constrói um diorama 3D de relevo geográfico fiel a groundHeightAt(), paleta do bioma,
 * lâmina d'água/lava/gelo, flora nativa, minas de ouro e fauna local.
 */
export function buildMapDiorama(
  mapId: MapId,
  pal: MaterialPalette,
  opts: { showFlora: boolean; showFauna: boolean; showWireframe: boolean }
): MapDioramaHandle {
  const root = new THREE.Group();
  const mapCfg = getEffectiveMapConfig(mapId);
  const bio = getMapBiomeVisuals(mapId);
  const effId = mapCfg.id === 'land_unknown' || mapCfg.id === 'the_unknown' ? mapId : mapCfg.id;

  const worldHalf = 58;
  const dioramaSize = 11.4;
  const worldToDiorama = dioramaSize / (worldHalf * 2);
  const heightScale = 0.58;
  const segs = 68;

  const terrainGeo = new THREE.PlaneGeometry(dioramaSize, dioramaSize, segs, segs);
  terrainGeo.rotateX(-Math.PI / 2);

  const pos = terrainGeo.attributes.position;
  let minH = Infinity;
  let maxH = -Infinity;
  let waterVerts = 0;

  for (let i = 0; i < pos.count; i++) {
    const dx = pos.getX(i);
    const dz = pos.getZ(i);
    const wx = dx / worldToDiorama;
    const wz = dz / worldToDiorama;
    const h = groundHeightAt(wx, wz, mapId);
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;
    if (h < -0.68) waterVerts++;
    pos.setY(i, h * heightScale);
  }
  terrainGeo.computeVertexNormals();

  const norm = terrainGeo.attributes.normal;
  const colors = new Float32Array(pos.count * 3);
  const [bHex, rHex, sHex, hHex] = bio.terrainPalette;
  _cBase.setHex(bHex);
  _cRoad.setHex(rHex);
  _cSand.setHex(sHex);
  _cHigh.setHex(hHex);
  _cCliff.setHex(mapCfg.cliffHex);
  _cFertile.setHex(bio.fertileHex);

  for (let i = 0; i < pos.count; i++) {
    const dx = pos.getX(i);
    const dz = pos.getZ(i);
    const wx = dx / worldToDiorama;
    const wz = dz / worldToDiorama;
    const y = pos.getY(i) / heightScale;
    const ny = norm.getY(i);
    const slope = Math.max(0, 1 - ny);

    const diagDist = Math.abs(wx + wz) / Math.SQRT2;
    const roadBlend = Math.max(0, 1 - diagDist / 6.5) * (Math.hypot(wx, wz) < 52 ? 0.55 : 0);

    _cTmp.copy(_cBase);
    if (effId === 'nile' || effId === 'yellow_river' || effId === 'highland') {
      const riverDist = Math.abs(wx - wz) / Math.SQRT2;
      if (riverDist < 12) {
        _cTmp.lerp(_cFertile, Math.max(0, 1 - riverDist / 12) * 0.85);
      }
    } else if (effId === 'oasis' && Math.hypot(wx, wz) < 16) {
      _cTmp.lerp(_cFertile, (1 - Math.hypot(wx, wz) / 16) * 0.85);
    } else if (effId === 'watering_hole' && y < 0.25) {
      _cTmp.lerp(_cFertile, 0.72);
    }
    if (y > 1.05) {
      _cTmp.lerp(_cHigh, Math.min(1, (y - 1.05) * 0.65));
    }
    if (roadBlend > 0) {
      _cTmp.lerp(_cRoad, roadBlend);
    }
    if (slope > 0.08) {
      _cTmp.lerp(_cCliff, Math.min(1, (slope - 0.08) * 5.2));
    }
    if (y < 0.15) {
      _cTmp.lerp(_cSand, Math.min(1, (0.15 - y) * 1.4));
    }

    colors[i * 3] = _cTmp.r;
    colors[i * 3 + 1] = _cTmp.g;
    colors[i * 3 + 2] = _cTmp.b;
  }

  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.86,
    metalness: 0.04,
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.castShadow = true;
  terrainMesh.receiveShadow = true;
  root.add(terrainMesh);

  // Wireframe contour overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  });
  const wireframeMesh = new THREE.Mesh(terrainGeo, wireMat);
  wireframeMesh.position.y = 0.012;
  wireframeMesh.visible = opts.showWireframe;
  root.add(wireframeMesh);

  // Architectural geological cutaway base & bronze rim
  const plinthGeo = new THREE.BoxGeometry(dioramaSize + 0.24, 0.56, dioramaSize + 0.24);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x121620,
    roughness: 0.65,
    metalness: 0.35,
  });
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.y = -1.62;
  plinthMesh.receiveShadow = true;
  root.add(plinthMesh);

  const rimGeo = new THREE.BoxGeometry(dioramaSize + 0.3, 0.08, dioramaSize + 0.3);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xb08a38,
    roughness: 0.32,
    metalness: 0.82,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.y = -1.32;
  root.add(rimMesh);

  // Perimeter geological walls connecting edge elevation down to -1.32
  const skirtBottomY = -1.32;
  const sidePositions: number[] = [];
  const halfD = dioramaSize / 2;
  const pushQuad = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
    sidePositions.push(
      x1, y1, z1, x2, y2, z2, x1, skirtBottomY, z1,
      x2, y2, z2, x2, skirtBottomY, z2, x1, skirtBottomY, z1
    );
  };

  for (let s = 0; s < segs; s++) {
    const t0 = -halfD + (s / segs) * dioramaSize;
    const t1 = -halfD + ((s + 1) / segs) * dioramaSize;

    // North (z = -halfD)
    pushQuad(t1, groundHeightAt(t1 / worldToDiorama, -worldHalf, mapId) * heightScale, -halfD, t0, groundHeightAt(t0 / worldToDiorama, -worldHalf, mapId) * heightScale, -halfD);
    // South (z = +halfD)
    pushQuad(t0, groundHeightAt(t0 / worldToDiorama, worldHalf, mapId) * heightScale, halfD, t1, groundHeightAt(t1 / worldToDiorama, worldHalf, mapId) * heightScale, halfD);
    // West (x = -halfD)
    pushQuad(-halfD, groundHeightAt(-worldHalf, t0 / worldToDiorama, mapId) * heightScale, t0, -halfD, groundHeightAt(-worldHalf, t1 / worldToDiorama, mapId) * heightScale, t1);
    // East (x = +halfD)
    pushQuad(halfD, groundHeightAt(worldHalf, t1 / worldToDiorama, mapId) * heightScale, t1, halfD, groundHeightAt(worldHalf, t0 / worldToDiorama, mapId) * heightScale, t0);
  }
  const skirtGeo = new THREE.BufferGeometry();
  skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(sidePositions, 3));
  skirtGeo.computeVertexNormals();
  const skirtMat = new THREE.MeshStandardMaterial({
    color: 0x2a241f,
    roughness: 0.9,
    metalness: 0.08,
  });
  const skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
  root.add(skirtMesh);

  // Water / Lava / Frozen Lake plane
  const waterGeo = new THREE.PlaneGeometry(dioramaSize - 0.04, dioramaSize - 0.04, 24, 24);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: mapCfg.waterColorHex,
    emissive: bio.waterEmissiveHex ?? 0x000000,
    emissiveIntensity: bio.waterEmissiveIntensity ?? 0,
    roughness: mapId === 'ghost_lake' || mapId === 'tundra' ? 0.1 : 0.2,
    metalness: 0.35,
    transparent: true,
    opacity: 0.86,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = -0.68 * heightScale;
  root.add(waterMesh);

  // Resource profile for authentic flora, gold mines & fauna spawns
  const profile = buildMapResourceProfile(mapId, 'normal');
  const floraGroup = new THREE.Group();
  floraGroup.visible = opts.showFlora;
  root.add(floraGroup);

  const floraCanopies: THREE.Object3D[] = [];
  const objScale = 0.21;

  // Populate representative tree clusters
  profile.treeClusters.forEach(([cx, cz, count], clusterIdx) => {
    const sampleCount = Math.min(3, Math.max(2, Math.ceil(count / 2)));
    for (let k = 0; k < sampleCount; k++) {
      const ang = clusterIdx * 1.4 + k * 2.1;
      const rad = 2.0 + k * 1.8;
      const wx = cx + Math.cos(ang) * rad;
      const wz = cz + Math.sin(ang) * rad;
      if (Math.abs(wx) > 54 || Math.abs(wz) > 54) continue;
      const wy = groundHeightAt(wx, wz, mapId);
      if (wy < -0.35) continue;

      const style = bio.secondaryTreeStyle && (clusterIdx + k) % 3 === 1 ? bio.secondaryTreeStyle : bio.treeStyle;
      const tree = createBiomeTreeMesh(style, pal, false, clusterIdx + k);
      tree.scale.setScalar(objScale);
      tree.position.set(wx * worldToDiorama, wy * heightScale, wz * worldToDiorama);
      tree.rotation.y = ang;
      floraGroup.add(tree);
      if (tree.userData.oakCanopyGroup) {
        floraCanopies.push(tree.userData.oakCanopyGroup as THREE.Object3D);
      }
    }
  });

  // Populate Gold Mines
  profile.goldSpots.slice(0, 6).forEach(([gx, gz], idx) => {
    const wy = groundHeightAt(gx, gz, mapId);
    if (wy < -0.3) return;
    const mine = createResourceMesh('gold_mine', pal, false, mapId, idx);
    mine.scale.setScalar(objScale * 0.95);
    mine.position.set(gx * worldToDiorama, wy * heightScale, gz * worldToDiorama);
    floraGroup.add(mine);
  });

  // Populate Fauna Herds
  const faunaGroup = new THREE.Group();
  faunaGroup.visible = opts.showFauna;
  root.add(faunaGroup);
  const faunaMeshes: THREE.Group[] = [];

  profile.faunaSpawns.slice(0, 8).forEach(([kind, fx, fz], idx) => {
    const wy = groundHeightAt(fx, fz, mapId);
    if (wy < -0.25) return;
    const animal = createFaunaMesh(kind, pal, false);
    animal.scale.setScalar(0.28);
    animal.position.set(fx * worldToDiorama, wy * heightScale, fz * worldToDiorama);
    animal.rotation.y = idx * 1.1;
    faunaGroup.add(animal);
    faunaMeshes.push(animal);
  });

  // Base corner settlement markers (Player SW, Enemy NE)
  const spawnMarkerMatPlayer = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7 });
  const spawnMarkerMatEnemy = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.7 });
  const spawnGeo = new THREE.ConeGeometry(0.16, 0.36, 4);

  const pY = groundHeightAt(-34, 34, mapId) * heightScale;
  const pMarker = new THREE.Mesh(spawnGeo, spawnMarkerMatPlayer);
  pMarker.position.set(-34 * worldToDiorama, pY + 0.25, 34 * worldToDiorama);
  pMarker.rotation.x = Math.PI;
  root.add(pMarker);

  const eY = groundHeightAt(34, -34, mapId) * heightScale;
  const eMarker = new THREE.Mesh(spawnGeo, spawnMarkerMatEnemy);
  eMarker.position.set(34 * worldToDiorama, eY + 0.25, -34 * worldToDiorama);
  eMarker.rotation.x = Math.PI;
  root.add(eMarker);

  const dispose = () => {
    terrainGeo.dispose();
    terrainMat.dispose();
    wireMat.dispose();
    plinthGeo.dispose();
    plinthMat.dispose();
    rimGeo.dispose();
    rimMat.dispose();
    skirtGeo.dispose();
    skirtMat.dispose();
    waterGeo.dispose();
    waterMat.dispose();
    spawnGeo.dispose();
    spawnMarkerMatPlayer.dispose();
    spawnMarkerMatEnemy.dispose();
  };

  return {
    group: root,
    waterMesh,
    wireframeMesh,
    floraGroup,
    faunaGroup,
    floraCanopies,
    faunaMeshes,
    minHeight: minH,
    maxHeight: maxH,
    waterCoveragePct: Math.round((waterVerts / pos.count) * 100),
    dispose,
  };
}

export function buildFloraOrResourceStudioMesh(
  item: GalleryFloraItem,
  pal: MaterialPalette,
  variantSeed: number
): THREE.Group {
  if (item.category === 'tree' && item.treeStyle) {
    return createBiomeTreeMesh(item.treeStyle, pal, true, variantSeed);
  }
  if (item.resourceKind === 'relic') {
    return createRelicMesh(pal, true);
  }
  if (item.resourceKind === 'plenty_vault') {
    return createPlentyVaultMesh(pal, true);
  }
  if (item.resourceKind === 'settlement') {
    return createSettlementMesh(pal, true);
  }
  if (item.resourceKind === 'berry' || item.resourceKind === 'gold_mine') {
    return createResourceMesh(item.resourceKind, pal, true, item.previewMapId, variantSeed);
  }
  return createResourceMesh('berry', pal, true, 'mediterranean', variantSeed);
}
