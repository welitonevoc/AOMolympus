import { GOD_POWERS, MAJOR_GODS } from './divineData';
import type { MatchTimelineSample, ReplayKeyframe } from './matchAnalytics';
import {
  AgeLevel,
  DEFAULT_GAME_OPTIONS,
  DifficultyId,
  GameOptionsConfig,
  MapId,
  PantheonId,
  WorldSizeId,
} from './types';

export type PortMenuState =
  | 'SPLASH'
  | 'MAIN_MENU'
  | 'SUB_LEARN'
  | 'SUB_CAMPAIGN'
  | 'SUB_SINGLE_PLAYER'
  | 'SUB_MULTIPLAYER'
  | 'SUB_MORE'
  | 'SUB_MOVIES'
  | 'UI_CAMPAIGN'
  | 'UI_SINGLE_PLAYER_SETUP'
  | 'UI_GOD_PICKER'
  | 'UI_LOAD_SCENARIO'
  | 'UI_GAME_LIST'
  | 'UI_RECORDED_GAMES'
  | 'MULTIPLAYER_LAN'
  | 'MULTIPLAYER_LOBBY'
  | 'UI_HOST_GAME_DIALOG'
  | 'UI_MP_ESO'
  | 'UI_PROFILE_SELECT'
  | 'UI_OPTIONS_AUDIO'
  | 'UI_OPTIONS_VIDEO'
  | 'UI_OPTIONS_GAMEPLAY'
  | 'UI_OPTIONS_NETWORK'
  | 'UI_OPTIONS_CONTROLS'
  | 'UI_HOTKEYS'
  | 'UI_EDITOR'
  | 'UI_RMS_LAB'
  | 'UI_HISTORY'
  | 'UI_TECHTREE'
  | 'CREDITS'
  | 'UI_ABOUT'
  | 'UI_UPDATES'
  | 'UI_EXIT_CONFIRM';

export interface CampaignScenarioDef {
  id: string;
  index: number;
  title: string;
  region: 'Atlântida' | 'Grécia' | 'Egito' | 'Terras Nórdicas' | 'Nova Atlântida';
  briefing: string;
  pantheon: PantheonId;
  enemyPantheon: PantheonId;
  mapId: MapId;
  startingAge: AgeLevel;
  revealedMap?: boolean;
}

export interface CampaignBookDef {
  id: 'trident' | 'titans';
  title: string;
  subtitle: string;
  scenarios: CampaignScenarioDef[];
}

export interface GodPickerEntry {
  id: string;
  name: string;
  pantheon: PantheonId;
  focus: string;
  favoredPower: string;
}

export const GOD_PICKER_ENTRIES: GodPickerEntry[] = MAJOR_GODS.map((mg) => ({
  id: mg.id,
  name: mg.name,
  pantheon: mg.pantheon,
  focus: mg.focus,
  favoredPower: GOD_POWERS[mg.favoredPower].name,
}));

export const CAMPAIGN_BOOKS: CampaignBookDef[] = [
  {
    id: 'trident',
    title: 'A Queda do Tridente',
    subtitle: 'Campanha Original · 32 Cenários (Atlântida, Grécia, Egito e Terras Nórdicas)',
    scenarios: [
      { id: 'cineA_1', index: 1, title: 'Prólogo: Sono Perturbado', region: 'Atlântida', briefing: 'Atena surge em sonho para Arkantos e alerta que Atlântida corre perigo iminente.', pantheon: 'greek', enemyPantheon: 'norse', mapId: 'mediterranean', startingAge: 1, revealedMap: true },
      { id: 'aomsp04', index: 2, title: 'Agouros (Omens)', region: 'Atlântida', briefing: 'Defenda as praias e a cidadela de Atlântida contra o ataque repentino dos piratas sob o comando de Kamos.', pantheon: 'greek', enemyPantheon: 'norse', mapId: 'mediterranean', startingAge: 1 },
      { id: 'aomsp05', index: 3, title: 'Consequências', region: 'Atlântida', briefing: 'Persiga os invasores sobreviventes para proteger o porto e recuperar as relíquias sagradas de Poseidon.', pantheon: 'greek', enemyPantheon: 'norse', mapId: 'mediterranean', startingAge: 2 },
      { id: 'aomsp06', index: 4, title: 'Arranhando a Superfície', region: 'Grécia', briefing: 'Rompa as defesas externas de Troia e estabeleça uma cabeça de ponte para os aliados gregos.', pantheon: 'greek', enemyPantheon: 'egyptian', mapId: 'acropolis', startingAge: 2 },
      { id: 'aomsp07', index: 5, title: 'Um Belo Plano', region: 'Grécia', briefing: 'Os gregos e atlantes estão prontos para sitiar o poderoso portão de Troia.', pantheon: 'greek', enemyPantheon: 'egyptian', mapId: 'acropolis', startingAge: 2 },
      { id: 'aomsp08', index: 6, title: 'Corda Suficiente', region: 'Grécia', briefing: 'Troia contra-ataca Ajax e seus homens. Resgate Ajax e retome o controle do campo de batalha.', pantheon: 'greek', enemyPantheon: 'egyptian', mapId: 'acropolis', startingAge: 2 },
      { id: 'aomsp09', index: 7, title: 'Espero Que Funcione', region: 'Grécia', briefing: 'Construa secretamente o Cavalo de Troia, abra os portões internos e derrube o império troiano.', pantheon: 'greek', enemyPantheon: 'egyptian', mapId: 'acropolis', startingAge: 3 },
      { id: 'aomsp10', index: 8, title: 'Mais Bandidos', region: 'Grécia', briefing: 'Lóklos está em apuros. Empurre os bandidos para trás e liberte o herói centauro Quíron.', pantheon: 'greek', enemyPantheon: 'norse', mapId: 'mediterranean', startingAge: 2 },
      { id: 'aomsp11', index: 9, title: 'Más Notícias', region: 'Grécia', briefing: 'As forças foram divididas. Comande cada destacamento e tome a entrada do Submundo.', pantheon: 'greek', enemyPantheon: 'norse', mapId: 'acropolis', startingAge: 3 },
      { id: 'aomsp12', index: 10, title: 'Revelação', region: 'Grécia', briefing: 'Destrua o grande aríete que Gargarensis está usando para forçar o portão de Hades.', pantheon: 'greek', enemyPantheon: 'norse', mapId: 'acropolis', startingAge: 3 },
      { id: 'aomsp13', index: 11, title: 'Estranhos', region: 'Egito', briefing: 'Guiados pelas visões divinas, Arkantos e Amanra atravessam as fronteiras do deserto egípcio.', pantheon: 'egyptian', enemyPantheon: 'norse', mapId: 'nile', startingAge: 2 },
      { id: 'aomsp14', index: 12, title: 'A Relíquia Perdida', region: 'Egito', briefing: 'Recupere a relíquia sagrada de Osíris antes que os seguidores de Set tomem os templos do Nilo.', pantheon: 'egyptian', enemyPantheon: 'greek', mapId: 'nile', startingAge: 2 },
      { id: 'aomsp15', index: 13, title: 'Sono Leve', region: 'Egito', briefing: 'Proteja os sacerdotes e monumentos enquanto o guardião do templo desperta nas dunas.', pantheon: 'egyptian', enemyPantheon: 'greek', mapId: 'nile', startingAge: 2 },
      { id: 'aomsp16', index: 14, title: 'Cabo de Guerra', region: 'Egito', briefing: 'Dispute os assentamentos ao longo do vale e assegure as caravanas de ouro.', pantheon: 'egyptian', enemyPantheon: 'norse', mapId: 'nile', startingAge: 2 },
      { id: 'aomsp17', index: 15, title: 'Ísis Ouve Minha Súplica', region: 'Egito', briefing: 'Invoque a bênção de Ísis e resgate as forças presas na fortaleza de Kemsyt.', pantheon: 'egyptian', enemyPantheon: 'norse', mapId: 'nile', startingAge: 3 },
      { id: 'aomsp18', index: 16, title: 'Vamos Lá', region: 'Egito', briefing: 'Prepare o cerco ao acampamento de Set com tropas míticas e escaravelhos.', pantheon: 'egyptian', enemyPantheon: 'greek', mapId: 'nile', startingAge: 3 },
      { id: 'aomsp19', index: 17, title: 'Bom Conselho', region: 'Egito', briefing: 'Consolide as três cidadelas do delta antes do avanço noturno.', pantheon: 'egyptian', enemyPantheon: 'greek', mapId: 'nile', startingAge: 3 },
      { id: 'aomsp20', index: 18, title: 'A Fortaleza dos Chacais', region: 'Egito', briefing: 'Ataque a cidadela de Kemsyt e liberte os prisioneiros.', pantheon: 'egyptian', enemyPantheon: 'norse', mapId: 'nile', startingAge: 3 },
      { id: 'aomsp21', index: 19, title: 'Muito Longe de Casa', region: 'Egito', briefing: 'Atravesse o oásis sitiado rumo aos portos do norte.', pantheon: 'egyptian', enemyPantheon: 'norse', mapId: 'nile', startingAge: 3 },
      { id: 'aomsp22', index: 20, title: 'Cuidado com o Primeiro Passo', region: 'Egito', briefing: 'Reúna os fragmentos da estátua de Osíris entre templos e ruínas.', pantheon: 'egyptian', enemyPantheon: 'greek', mapId: 'nile', startingAge: 3 },
      { id: 'aomsp23', index: 21, title: 'Onde Pertencem', region: 'Egito', briefing: 'Enfrente a frota pirata e devolva o corpo de Osíris ao santuário.', pantheon: 'egyptian', enemyPantheon: 'greek', mapId: 'nile', startingAge: 4 },
      { id: 'aomsp24', index: 22, title: 'Velhos Amigos', region: 'Egito', briefing: 'Enquanto Osíris renasce, Odisseu retorna com reforços gregos para a batalha decisiva.', pantheon: 'greek', enemyPantheon: 'egyptian', mapId: 'nile', startingAge: 4 },
      { id: 'aomsp25', index: 23, title: 'Norte', region: 'Terras Nórdicas', briefing: 'Desembarque nas costas gélidas de Midgard ao encontro dos clãs de Odin e Thor.', pantheon: 'norse', enemyPantheon: 'greek', mapId: 'alfheim', startingAge: 2 },
      { id: 'aomsp26', index: 24, title: 'A Forja dos Anões', region: 'Terras Nórdicas', briefing: 'Proteja os ferreiros Brokk e Eitri enquanto reforjam o martelo sagrado.', pantheon: 'norse', enemyPantheon: 'egyptian', mapId: 'alfheim', startingAge: 2 },
      { id: 'aomsp27', index: 25, title: 'Não É Daqui', region: 'Terras Nórdicas', briefing: 'Atravesse os desfiladeiros nevados e derrote os gigantes de gelo enviados por Loki.', pantheon: 'norse', enemyPantheon: 'atlantean', mapId: 'alfheim', startingAge: 3 },
      { id: 'aomsp28', index: 26, title: 'Comitê de Boas-Vindas', region: 'Terras Nórdicas', briefing: 'Reúna os estandartes nórdicos e contenha a vanguarda de Gargarensis.', pantheon: 'norse', enemyPantheon: 'atlantean', mapId: 'alfheim', startingAge: 3 },
      { id: 'aomsp29', index: 27, title: 'União', region: 'Terras Nórdicas', briefing: 'Una os três clãs nórdicos para romper as muralhas da fortaleza invernal.', pantheon: 'norse', enemyPantheon: 'greek', mapId: 'alfheim', startingAge: 3 },
      { id: 'aomsp30', index: 28, title: 'O Poço de Urd', region: 'Terras Nórdicas', briefing: 'Guarde o santuário ancestral enquanto o poder rúnico é restaurado.', pantheon: 'norse', enemyPantheon: 'greek', mapId: 'alfheim', startingAge: 3 },
      { id: 'aomsp31', index: 29, title: 'Abaixo da Superfície', region: 'Terras Nórdicas', briefing: 'Impeça a escavação final nos portões subterrâneos antes do crepúsculo.', pantheon: 'norse', enemyPantheon: 'egyptian', mapId: 'alfheim', startingAge: 4 },
      { id: 'aomsp32', index: 30, title: 'Heróis Improváveis', region: 'Terras Nórdicas', briefing: 'Lidere Reginleif e Arkantos contra as hordas de gigantes.', pantheon: 'norse', enemyPantheon: 'atlantean', mapId: 'alfheim', startingAge: 4 },
      { id: 'aomsp33', index: 31, title: 'Nem Tudo Está Perdido', region: 'Terras Nórdicas', briefing: 'Resista ao cerco até que o martelo de Thor sele o portão do submundo.', pantheon: 'norse', enemyPantheon: 'atlantean', mapId: 'alfheim', startingAge: 4 },
      { id: 'aomsp34', index: 32, title: 'Bem-Vindo de Volta / Um Lugar em Meus Sonhos', region: 'Atlântida', briefing: 'Batalha final em Atlântida: enfrente a estátua viva de Poseidon com a bênção de Zeus.', pantheon: 'greek', enemyPantheon: 'atlantean', mapId: 'mediterranean', startingAge: 4 },
    ],
  },
  {
    id: 'titans',
    title: 'A Nova Atlântida',
    subtitle: 'Campanha dos Titãs · 13 Cenários (Kastor e o Retorno dos Titãs)',
    scenarios: [
      { id: 'aomx00', index: 1, title: 'Prólogo: O Velho Observa', region: 'Nova Atlântida', briefing: 'Dez anos após a queda de Atlântida, o povo sobrevivente busca reconstruir sua civilização sob o comando de Kastor.', pantheon: 'atlantean', enemyPantheon: 'norse', mapId: 'alfheim', startingAge: 1, revealedMap: true },
      { id: 'aomx01', index: 2, title: 'Um Povo Perdido', region: 'Nova Atlântida', briefing: 'Os atlantes exilados nas terras gélidas encontram um antigo templo de Kronos e precisam sobreviver ao inverno.', pantheon: 'atlantean', enemyPantheon: 'norse', mapId: 'alfheim', startingAge: 1 },
      { id: 'aomx02', index: 3, title: 'Atlântida Renascida', region: 'Nova Atlântida', briefing: 'Utilize as Passagens Celestes para reerguer os Centros da Cidade atlantes na nova ilha.', pantheon: 'atlantean', enemyPantheon: 'greek', mapId: 'mediterranean', startingAge: 2 },
      { id: 'aomx03', index: 4, title: 'Saudações da Grécia', region: 'Nova Atlântida', briefing: 'Contenha os ataques gregos instigados pelo Servo e defenda os portos da Nova Atlântida.', pantheon: 'atlantean', enemyPantheon: 'greek', mapId: 'mediterranean', startingAge: 2 },
      { id: 'aomx04', index: 5, title: 'A Torre de Odin', region: 'Nova Atlântida', briefing: 'Destrua os santuários nórdicos profanados antes que o exército invernal receba reforços.', pantheon: 'atlantean', enemyPantheon: 'norse', mapId: 'alfheim', startingAge: 3 },
      { id: 'aomx05', index: 6, title: 'As Relíquias Antigas', region: 'Nova Atlântida', briefing: 'Recupere as relíquias perdidas nas terras do Nilo para fortalecer os heróis atlantes.', pantheon: 'atlantean', enemyPantheon: 'egyptian', mapId: 'nile', startingAge: 3 },
      { id: 'aomx06', index: 7, title: 'Monte Olimpo', region: 'Nova Atlântida', briefing: 'Conquiste os templos nas encostas sagradas do Monte Olimpo.', pantheon: 'atlantean', enemyPantheon: 'greek', mapId: 'acropolis', startingAge: 3 },
      { id: 'aomx07', index: 8, title: 'Traição em Sikyos', region: 'Nova Atlântida', briefing: 'Descubra a traição do Servo de Kronos e escape da armadilha nas muralhas gregas.', pantheon: 'atlantean', enemyPantheon: 'greek', mapId: 'acropolis', startingAge: 3 },
      { id: 'aomx08', index: 9, title: 'Cérbero', region: 'Nova Atlântida', briefing: 'Derrote as bestas colossais que ameaçam destruir as cidades do sul.', pantheon: 'atlantean', enemyPantheon: 'egyptian', mapId: 'nile', startingAge: 4 },
      { id: 'aomx09', index: 10, title: 'Fúria', region: 'Nova Atlântida', briefing: 'Enquanto os Titãs despertam, proteja os três santuários de Gaia.', pantheon: 'atlantean', enemyPantheon: 'norse', mapId: 'alfheim', startingAge: 4 },
      { id: 'aomx10', index: 11, title: 'Fazer as Pazes', region: 'Nova Atlântida', briefing: 'Sele a aliança entre gregos, egípcios, nórdicos e atlantes contra Kronos.', pantheon: 'atlantean', enemyPantheon: 'greek', mapId: 'mediterranean', startingAge: 4 },
      { id: 'aomx11', index: 12, title: 'Atlântida Traída', region: 'Nova Atlântida', briefing: 'Retome a cidadela ancestral tomada pelos seguidores de Kronos.', pantheon: 'atlantean', enemyPantheon: 'greek', mapId: 'acropolis', startingAge: 4 },
      { id: 'aomx12', index: 13, title: 'Guerra dos Titãs', region: 'Nova Atlântida', briefing: 'Confronto supremo pela soberania do mundo antigo com todo o panteão em guerra.', pantheon: 'atlantean', enemyPantheon: 'egyptian', mapId: 'acropolis', startingAge: 4 },
    ],
  },
];

export interface CustomScenarioPreset {
  id: string;
  title: string;
  mapId: MapId;
  pantheon: PantheonId;
  enemyPantheon: PantheonId;
  difficulty: DifficultyId;
  startingAge: AgeLevel;
  startingResources: 'standard' | 'high' | 'abundant';
  revealedMap: boolean;
  description: string;
}

export const CUSTOM_SCENARIOS: CustomScenarioPreset[] = [
  {
    id: 'omens_atlantis',
    title: 'Agouros de Atlântida (Clássico)',
    mapId: 'mediterranean',
    pantheon: 'greek',
    enemyPantheon: 'norse',
    difficulty: 'normal',
    startingAge: 1,
    startingResources: 'standard',
    revealedMap: false,
    description: 'Cenário fiel de defesa costeira no Mar Egeu com 2 assentamentos próximos.',
  },
  {
    id: 'eldritch_erebus',
    title: 'Despertar em Érebo (Divine Edition)',
    mapId: 'erebus',
    pantheon: 'eldritch',
    enemyPantheon: 'roman',
    difficulty: 'hard',
    startingAge: 2,
    startingResources: 'high',
    revealedMap: false,
    description: 'Legiões romanas de Júpiter enfrentam os horrores cósmicos de Azathoth em Érebo.',
  },
  {
    id: 'aztec_yucatan',
    title: 'Altar de Yucatán (Divine Edition)',
    mapId: 'yucatan',
    pantheon: 'aztec',
    enemyPantheon: 'chinese',
    difficulty: 'hard',
    startingAge: 2,
    startingResources: 'high',
    revealedMap: false,
    description: 'Batalha na selva tropical entre Astecas de Huitzilopochtli e os Chineses de Fu Xi.',
  },
  {
    id: 'jotunheim_clash',
    title: 'Inverno de Jotunheim (Ragnarok)',
    mapId: 'jotunheim',
    pantheon: 'jotunn',
    enemyPantheon: 'norse',
    difficulty: 'titan',
    startingAge: 3,
    startingResources: 'high',
    revealedMap: false,
    description: 'Gigantes de Surtr enfrentam Odin entre desfiladeiros congelados.',
  },
  {
    id: 'acropolis_titans',
    title: 'Guerra dos Titãs na Acrópole',
    mapId: 'acropolis',
    pantheon: 'atlantean',
    enemyPantheon: 'japanese',
    difficulty: 'titan',
    startingAge: 4,
    startingResources: 'abundant',
    revealedMap: true,
    description: 'Guerra total em platôs elevados com Segredos dos Titãs e Portões liberados.',
  },
];

export interface HotkeyEntry {
  key: string;
  action: string;
  category: 'Câmera' | 'Unidades' | 'HUD & Menu';
}

export const HOTKEYS_LIST: HotkeyEntry[] = [
  { key: 'WASD / Setas', action: 'Mover a câmera pelo mapa', category: 'Câmera' },
  { key: 'Q / E', action: 'Rotacionar câmera à esquerda / direita', category: 'Câmera' },
  { key: 'Roda do Mouse / +/-', action: 'Aproximar ou afastar o zoom', category: 'Câmera' },
  { key: 'Home', action: 'Centralizar câmera na base principal', category: 'Câmera' },
  { key: 'Clique Esquerdo / Arrastar', action: 'Selecionar unidade ou caixa de seleção', category: 'Unidades' },
  { key: 'Clique Duplo', action: 'Selecionar todas as unidades visíveis do mesmo tipo', category: 'Unidades' },
  { key: 'Botão Direito / Arraste Tático', action: 'Mover, coletar, caçar, construir ou atacar', category: 'Unidades' },
  { key: 'F', action: 'Alternar formação (Bloco / Linha / Escalonada)', category: 'Unidades' },
  { key: 'H', action: 'Recolher ou expandir o painel inferior', category: 'HUD & Menu' },
  { key: 'Esc / F10', action: 'Abrir ou fechar o Menu do Jogo (Pausa)', category: 'HUD & Menu' },
];

export interface RecordedMatchRecord {
  id: string;
  title: string;
  date: string;
  pantheon: PantheonId;
  enemyPantheon?: PantheonId;
  mapId: MapId;
  worldSize?: WorldSizeId;
  difficulty: DifficultyId;
  durationSeconds: number;
  result: 'victory' | 'defeat';
  enemiesDefeated: number;
  unitsTrained: number;
  timelineHistory?: MatchTimelineSample[];
  replayFrames?: ReplayKeyframe[];
}

export function loadSavedOptions(): GameOptionsConfig {
  try {
    const raw = localStorage.getItem('aom_port_options_v1');
    if (raw) {
      return { ...DEFAULT_GAME_OPTIONS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore storage read error
  }
  return { ...DEFAULT_GAME_OPTIONS };
}

export function saveOptionsToStorage(opts: GameOptionsConfig) {
  try {
    localStorage.setItem('aom_port_options_v1', JSON.stringify(opts));
  } catch {
    // ignore storage write error
  }
}

export function loadProfilesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem('aom_port_profiles_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return ['Arkantos', 'Kastor', 'Amanra', 'Ajax'];
}

export function saveProfilesToStorage(profiles: string[]) {
  try {
    localStorage.setItem('aom_port_profiles_v1', JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export function loadRecordedMatches(): RecordedMatchRecord[] {
  try {
    const raw = localStorage.getItem('aom_port_recorded_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [
    {
      id: 'rec-default-1',
      title: 'Defesa de Atlântida (Demo)',
      date: 'Registro Padrão',
      pantheon: 'greek',
      mapId: 'mediterranean',
      difficulty: 'normal',
      durationSeconds: 512,
      result: 'victory',
      enemiesDefeated: 24,
      unitsTrained: 31,
    },
  ];
}

export function appendRecordedMatch(rec: RecordedMatchRecord) {
  try {
    const list = loadRecordedMatches();
    const updated = [rec, ...list].slice(0, 12);
    localStorage.setItem('aom_port_recorded_v1', JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function loadCampaignProgress(): Record<'trident' | 'titans', number> {
  try {
    const raw = localStorage.getItem('aom_port_campaign_progress_v1');
    if (raw) {
      const p = JSON.parse(raw);
      return {
        trident: typeof p.trident === 'number' ? p.trident : 1,
        titans: typeof p.titans === 'number' ? p.titans : 1,
      };
    }
  } catch {
    // ignore
  }
  return { trident: 1, titans: 1 };
}

export function saveCampaignProgress(prog: Record<'trident' | 'titans', number>) {
  try {
    localStorage.setItem('aom_port_campaign_progress_v1', JSON.stringify(prog));
  } catch {
    // ignore
  }
}
