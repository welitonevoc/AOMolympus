import { CAMPAIGN_BOOKS, CampaignScenarioDef, loadCampaignProgress, saveCampaignProgress } from './menuData';
import { AgeLevel, BuildingKind, CampaignDialogueHud, PantheonId, UnitKind } from './types';

export type CampaignObjectiveCheck =
  | { type: 'build'; kind: BuildingKind; count: number }
  | { type: 'train'; kind?: UnitKind; minCombatUnits?: number; count: number }
  | { type: 'age'; minAge: AgeLevel }
  | { type: 'relics'; count: number }
  | { type: 'kill_enemies'; count: number }
  | { type: 'survive'; seconds: number }
  | { type: 'destroy_tc'; count?: number };

export interface CampaignStageObjective {
  id: string;
  label: string;
  check: CampaignObjectiveCheck;
}

export interface CampaignWaveTrigger {
  atSeconds: number;
  announcement: CampaignDialogueHud;
  units: Array<{ kind: UnitKind; count: number }>;
}

export interface CampaignStage {
  dialogue: CampaignDialogueHud;
  objectives: CampaignStageObjective[];
  waves?: CampaignWaveTrigger[];
  reinforcements?: Array<{ kind: UnitKind; count: number }>;
}

export interface CampaignMissionScript {
  scenarioId: string;
  bookId: 'trident' | 'titans';
  scenarioIndex: number;
  title: string;
  startingBonuses?: {
    food?: number;
    wood?: number;
    gold?: number;
    favor?: number;
    heroKind?: UnitKind;
    extraUnits?: Array<{ kind: UnitKind; count: number }>;
  };
  stages: CampaignStage[];
}

function buildTridentAndTitansOverrides(): Record<string, CampaignMissionScript> {
  const scripts: Record<string, CampaignMissionScript> = {};

  // Detailed flagship scripted missions
  scripts['cineA_1'] = {
    scenarioId: 'cineA_1',
    bookId: 'trident',
    scenarioIndex: 1,
    title: 'Prólogo: Sono Perturbado',
    startingBonuses: { food: 180, wood: 180, gold: 120, heroKind: 'jason', extraUnits: [{ kind: 'hoplite', count: 4 }] },
    stages: [
      {
        dialogue: {
          speaker: 'Atena',
          text: 'Arkantos, desperte! Sombras nórdicas cercam as praias de Atlântida. Erga um Quartel e prepare seus hoplitas.',
        },
        objectives: [
          { id: 'c1_barracks', label: 'Construir 1 Quartel Militar', check: { type: 'build', kind: 'barracks', count: 1 } },
          { id: 'c1_army', label: 'Reunir 6 unidades militares', check: { type: 'train', minCombatUnits: 6, count: 6 } },
        ],
        waves: [
          {
            atSeconds: 35,
            announcement: { speaker: 'Arkantos', text: 'Incursão pirata na costa! Mantenham a formação!' },
            units: [{ kind: 'ulfsark', count: 3 }, { kind: 'throwing_axeman', count: 2 }],
          },
        ],
      },
      {
        dialogue: {
          speaker: 'Arkantos',
          text: 'Excelente! Agora avancem e destruam a base dos invasores antes que o alvorecer termine.',
        },
        objectives: [
          { id: 'c1_kills', label: 'Abater 8 forças invasoras', check: { type: 'kill_enemies', count: 8 } },
          { id: 'c1_tc', label: 'Destruir o Centro da Cidade inimigo', check: { type: 'destroy_tc', count: 1 } },
        ],
      },
    ],
  };

  scripts['aomsp04'] = {
    scenarioId: 'aomsp04',
    bookId: 'trident',
    scenarioIndex: 2,
    title: 'Agouros (Omens)',
    startingBonuses: { food: 220, wood: 220, gold: 160, heroKind: 'ajax', extraUnits: [{ kind: 'archer', count: 4 }] },
    stages: [
      {
        dialogue: {
          speaker: 'Ájax',
          text: 'Os navios de Kamos desembarcaram! Levante uma Torre de Vigia e proteja nosso Templo.',
        },
        objectives: [
          { id: 'o_tower', label: 'Construir 1 Torre de Defesa', check: { type: 'build', kind: 'tower', count: 1 } },
          { id: 'o_temple', label: 'Construir 1 Templo Sagrado', check: { type: 'build', kind: 'temple', count: 1 } },
          { id: 'o_survive', label: 'Resistir ao primeiro cerco (90s)', check: { type: 'survive', seconds: 90 } },
        ],
        waves: [
          {
            atSeconds: 28,
            announcement: { speaker: 'Kamos', text: 'Saqueiem os portos de Atlântida!' },
            units: [{ kind: 'raiding_cavalry', count: 3 }, { kind: 'troll', count: 1 }],
          },
          {
            atSeconds: 65,
            announcement: { speaker: 'Ájax', text: 'Mais saqueadores a caminho — segurem a linha!' },
            units: [{ kind: 'ulfsark', count: 4 }, { kind: 'throwing_axeman', count: 3 }],
          },
        ],
      },
      {
        dialogue: {
          speaker: 'Arkantos',
          text: 'As praias foram defendidas! Hora do contra-ataque até o acampamento de Kamos.',
        },
        reinforcements: [{ kind: 'hoplite', count: 4 }, { kind: 'minotaur', count: 1 }],
        objectives: [
          { id: 'o_tc', label: 'Destruir a base inimiga', check: { type: 'destroy_tc', count: 1 } },
        ],
      },
    ],
  };

  scripts['aomsp05'] = {
    scenarioId: 'aomsp05',
    bookId: 'trident',
    scenarioIndex: 3,
    title: 'Consequências',
    startingBonuses: { food: 260, wood: 260, gold: 200, heroKind: 'odysseus', extraUnits: [{ kind: 'hoplite', count: 4 }, { kind: 'archer', count: 3 }] },
    stages: [
      {
        dialogue: {
          speaker: 'Odisseu',
          text: 'Precisamos garantir uma Relíquia no Templo e lançar nossa frota ou tropa terrestre.',
        },
        objectives: [
          { id: 'c3_temple', label: 'Construir 1 Templo', check: { type: 'build', kind: 'temple', count: 1 } },
          { id: 'c3_relic', label: 'Coletar 1 Relíquia no Templo', check: { type: 'relics', count: 1 } },
        ],
      },
      {
        dialogue: {
          speaker: 'Arkantos',
          text: 'Poseidon abençoou nossas lanças. Esmaguem a cidadela pirata!',
        },
        objectives: [
          { id: 'c3_kills', label: 'Derrotar 14 defensores inimigos', check: { type: 'kill_enemies', count: 14 } },
          { id: 'c3_tc', label: 'Destruir o Centro da Cidade inimigo', check: { type: 'destroy_tc', count: 1 } },
        ],
      },
    ],
  };

  scripts['aomsp09'] = {
    scenarioId: 'aomsp09',
    bookId: 'trident',
    scenarioIndex: 7,
    title: 'Espero Que Funcione (Troia)',
    startingBonuses: { food: 400, wood: 400, gold: 320, favor: 35, heroKind: 'odysseus', extraUnits: [{ kind: 'ram', count: 2 }, { kind: 'hoplite', count: 6 }] },
    stages: [
      {
        dialogue: {
          speaker: 'Odisseu',
          text: 'Troia não cairá apenas na força bruta. Construa a Oficina de Cerco e avance à Era Heroica!',
        },
        objectives: [
          { id: 'troy_siege', label: 'Ergue 1 Oficina de Cerco ou Fortaleza', check: { type: 'build', kind: 'fortress', count: 1 } },
          { id: 'troy_age', label: 'Alcançar Era III (Heroica) ou superior', check: { type: 'age', minAge: 3 } },
        ],
      },
      {
        dialogue: {
          speaker: 'Ájax',
          text: 'Os portões estão abertos! Por Troia e pelo Olimpo, arrasem a cidadela!',
        },
        reinforcements: [{ kind: 'myrmidon', count: 4 }, { kind: 'siege', count: 2 }],
        objectives: [
          { id: 'troy_tc', label: 'Destruir o Centro da Cidade de Troia', check: { type: 'destroy_tc', count: 1 } },
        ],
      },
    ],
  };

  scripts['aomsp13'] = {
    scenarioId: 'aomsp13',
    bookId: 'trident',
    scenarioIndex: 11,
    title: 'Estranhos no Egito',
    startingBonuses: { food: 280, wood: 240, gold: 260, heroKind: 'pharaoh', extraUnits: [{ kind: 'egypt_spearman', count: 5 }, { kind: 'priest', count: 2 }] },
    stages: [
      {
        dialogue: {
          speaker: 'Amanra',
          text: 'Bem-vindos ao Egito! Erga um Monumento aos Deuses e expanda nosso acampamento no vale do Nilo.',
        },
        objectives: [
          { id: 'eg_mon', label: 'Construir 1 Monumento ou Templo', check: { type: 'build', kind: 'temple', count: 1 } },
          { id: 'eg_army', label: 'Treinar 10 guerreiros do deserto', check: { type: 'train', minCombatUnits: 10, count: 10 } },
        ],
        waves: [
          {
            atSeconds: 45,
            announcement: { speaker: 'Sacerdote de Set', text: 'Os seguidores de Set marcham sobre nossas dunas!' },
            units: [{ kind: 'raiding_cavalry', count: 4 }, { kind: 'valkyrie', count: 1 }],
          },
        ],
      },
      {
        dialogue: {
          speaker: 'Faraó',
          text: 'Pela luz de Rá, varram os invasores de nossas fronteiras!',
        },
        objectives: [{ id: 'eg_tc', label: 'Destruir o acampamento inimigo', check: { type: 'destroy_tc', count: 1 } }],
      },
    ],
  };

  scripts['aomx00'] = {
    scenarioId: 'aomx00',
    bookId: 'titans',
    scenarioIndex: 1,
    title: 'Prólogo: O Velho Observa',
    startingBonuses: { food: 260, wood: 260, gold: 220, heroKind: 'oracle', extraUnits: [{ kind: 'murmillo', count: 4 }, { kind: 'turma', count: 2 }] },
    stages: [
      {
        dialogue: {
          speaker: 'Kastor',
          text: 'Nosso povo sobreviveu à queda de Atlântida. Reconstrua nossa base nas terras do norte!',
        },
        objectives: [
          { id: 'x0_house', label: 'Construir 2 Casas ou Mansões', check: { type: 'build', kind: 'house', count: 2 } },
          { id: 'x0_barracks', label: 'Construir 1 Quartel Militar', check: { type: 'build', kind: 'barracks', count: 1 } },
        ],
      },
      {
        dialogue: {
          speaker: 'Oráculo Atlante',
          text: 'O Servo de Cronos sussurra nas sombras... Derrote os saqueadores que bloqueiam o vale!',
        },
        objectives: [
          { id: 'x0_kills', label: 'Abater 10 inimigos', check: { type: 'kill_enemies', count: 10 } },
          { id: 'x0_tc', label: 'Destruir a base inimiga', check: { type: 'destroy_tc', count: 1 } },
        ],
      },
    ],
  };

  scripts['aomx12'] = {
    scenarioId: 'aomx12',
    bookId: 'titans',
    scenarioIndex: 13,
    title: 'Guerra dos Titãs',
    startingBonuses: { food: 600, wood: 600, gold: 550, favor: 80, heroKind: 'destroyer', extraUnits: [{ kind: 'arcus', count: 6 }, { kind: 'behemoth', count: 2 }] },
    stages: [
      {
        dialogue: {
          speaker: 'Kastor',
          text: 'É o confronto final pela soberania do mundo antigo! Reúnam todo o poder atlante!',
        },
        objectives: [
          { id: 'x12_army', label: 'Comandar ao menos 14 tropas de elite', check: { type: 'train', minCombatUnits: 14, count: 14 } },
          { id: 'x12_kills', label: 'Derrotar 18 forças de Cronos', check: { type: 'kill_enemies', count: 18 } },
        ],
        waves: [
          {
            atSeconds: 40,
            announcement: { speaker: 'Arauto de Cronos', text: 'Os imortais do Tártaro marcham para esmagar vocês!' },
            units: [{ kind: 'chariot_archer', count: 4 }, { kind: 'war_elephant', count: 2 }, { kind: 'sphinx', count: 2 }],
          },
        ],
      },
      {
        dialogue: {
          speaker: 'Gaia',
          text: 'Ergam o Portão Titânico ou derrubem o bastião inimigo para selar o destino do mundo!',
        },
        reinforcements: [{ kind: 'hekagigantes', count: 2 }, { kind: 'fanatic', count: 4 }],
        objectives: [{ id: 'x12_tc', label: 'Destruir o Centro da Cidade inimigo', check: { type: 'destroy_tc', count: 1 } }],
      },
    ],
  };

  // Auto-generate structured 2-stage scripted missions for every remaining scenario in CAMPAIGN_BOOKS
  for (const book of CAMPAIGN_BOOKS) {
    for (const sc of book.scenarios) {
      if (scripts[sc.id]) continue;
      const heroByPantheon: Record<PantheonId, UnitKind> = {
        greek: 'jason',
        egyptian: 'pharaoh',
        norse: 'hersir',
        atlantean: 'oracle',
        chinese: 'nezha',
        japanese: 'hero',
        aztec: 'hero',
        roman: 'hero',
        eldritch: 'hero',
        celtic: 'hero',
        babylonian: 'hero',
        lakota: 'hero',
        jotunn: 'hersir',
      };
      const baseCombatCount = Math.min(14, 5 + Math.floor(sc.index / 3));
      const killQuota = Math.min(20, 8 + Math.floor(sc.index / 2));
      const nextAge = Math.min(4, Math.max(2, sc.startingAge + (sc.startingAge < 3 ? 1 : 0))) as AgeLevel;

      scripts[sc.id] = {
        scenarioId: sc.id,
        bookId: book.id,
        scenarioIndex: sc.index,
        title: sc.title,
        startingBonuses: {
          food: 180 + sc.index * 10,
          wood: 180 + sc.index * 10,
          gold: 140 + sc.index * 8,
          heroKind: heroByPantheon[sc.pantheon] ?? 'hero',
          extraUnits:
            sc.pantheon === 'egyptian'
              ? [{ kind: 'egypt_spearman', count: 4 }]
              : sc.pantheon === 'norse'
              ? [{ kind: 'ulfsark', count: 4 }]
              : sc.pantheon === 'atlantean'
              ? [{ kind: 'murmillo', count: 4 }]
              : sc.pantheon === 'chinese'
              ? [{ kind: 'halberdier', count: 4 }]
              : [{ kind: 'hoplite', count: 4 }],
        },
        stages: [
          {
            dialogue: {
              speaker: sc.region,
              text: sc.briefing,
            },
            objectives: [
              { id: `${sc.id}_age`, label: `Avançar para a Era ${nextAge} ou erguer Templo`, check: { type: 'build', kind: 'temple', count: 1 } },
              { id: `${sc.id}_army`, label: `Mobilizar ${baseCombatCount} unidades de combate`, check: { type: 'train', minCombatUnits: baseCombatCount, count: baseCombatCount } },
            ],
            waves: [
              {
                atSeconds: 42,
                announcement: {
                  speaker: 'Batedor',
                  text: 'Vanguarda inimiga detectada avançando rumo à nossa base!',
                },
                units:
                  sc.enemyPantheon === 'norse'
                    ? [{ kind: 'ulfsark', count: 3 }, { kind: 'raiding_cavalry', count: 2 }]
                    : sc.enemyPantheon === 'egyptian'
                    ? [{ kind: 'egypt_spearman', count: 3 }, { kind: 'chariot_archer', count: 2 }]
                    : sc.enemyPantheon === 'atlantean'
                    ? [{ kind: 'murmillo', count: 3 }, { kind: 'turma', count: 2 }]
                    : [{ kind: 'hoplite', count: 3 }, { kind: 'archer', count: 2 }],
              },
            ],
          },
          {
            dialogue: {
              speaker: 'Comando Aliado',
              text: `Forças prontas! Quebrem as linhas inimigas em ${sc.region} e conquistem a vitória.`,
            },
            reinforcements:
              sc.pantheon === 'egyptian'
                ? [{ kind: 'chariot_archer', count: 3 }]
                : sc.pantheon === 'norse'
                ? [{ kind: 'raiding_cavalry', count: 3 }]
                : sc.pantheon === 'atlantean'
                ? [{ kind: 'arcus', count: 3 }]
                : sc.pantheon === 'chinese'
                ? [{ kind: 'chu_ko_nu', count: 3 }]
                : [{ kind: 'archer', count: 3 }],
            objectives: [
              { id: `${sc.id}_kills`, label: `Abater ${killQuota} inimigos em combate`, check: { type: 'kill_enemies', count: killQuota } },
              { id: `${sc.id}_tc`, label: 'Destruir todos os Centros da Cidade inimigos', check: { type: 'destroy_tc', count: 1 } },
            ],
          },
        ],
      };
    }
  }

  return scripts;
}

const CAMPAIGN_SCRIPTS: Record<string, CampaignMissionScript> = buildTridentAndTitansOverrides();

export function getCampaignMissionScript(scenarioId: string): CampaignMissionScript | null {
  return CAMPAIGN_SCRIPTS[scenarioId] ?? null;
}

export function findCampaignScenarioDef(scenarioId: string): { bookId: 'trident' | 'titans'; def: CampaignScenarioDef } | null {
  for (const book of CAMPAIGN_BOOKS) {
    const found = book.scenarios.find((s) => s.id === scenarioId);
    if (found) return { bookId: book.id, def: found };
  }
  return null;
}

export function unlockNextCampaignScenario(scenarioId: string): void {
  const found = findCampaignScenarioDef(scenarioId);
  if (!found) return;
  const prog = loadCampaignProgress();
  const nextIdx = found.def.index + 1;
  if (nextIdx > (prog[found.bookId] ?? 1)) {
    saveCampaignProgress({
      ...prog,
      [found.bookId]: nextIdx,
    });
  }
}
