import { AgeLevel, PantheonId, UnitKind, UnitVoiceAction, UnitVoiceLineInfo } from './types';

interface CulturalVoiceEntry {
  phrase: string;
  pt: string;
  syllables: number[];
}

interface CultureVoiceProfile {
  cultureLabel: string;
  basePitch: number;
  formantF1: number;
  formantF2: number;
  hornPitch: number;
  select: CulturalVoiceEntry[];
  attack: CulturalVoiceEntry[];
  move: CulturalVoiceEntry[];
  work: CulturalVoiceEntry[];
}

const CULTURE_VOICE_BANK: Record<PantheonId, CultureVoiceProfile> = {
  greek: {
    cultureLabel: 'Helenos (Grego)',
    basePitch: 132,
    formantF1: 520,
    formantF2: 1480,
    hornPitch: 293.66,
    select: [
      { phrase: 'Prostagma?', pt: 'Qual é a ordem?', syllables: [1.0, 1.12, 0.96] },
      { phrase: 'Etimos!', pt: 'Pronto para agir!', syllables: [1.08, 0.95, 1.04] },
      { phrase: 'Lege?', pt: 'Diga, comandante?', syllables: [0.98, 1.16] },
      { phrase: 'Ne?', pt: 'Sim?', syllables: [1.14] },
    ],
    attack: [
      { phrase: 'Eisvoli!', pt: 'Ao ataque!', syllables: [1.05, 1.18, 1.32] },
      { phrase: 'Katastrofi!', pt: 'Destruam os inimigos!', syllables: [1.0, 1.12, 1.24, 1.35] },
      { phrase: 'Gia tin Ellada!', pt: 'Pela Grécia, avante!', syllables: [1.08, 1.16, 1.28] },
    ],
    move: [
      { phrase: 'Vulome!', pt: 'Às suas ordens!', syllables: [1.06, 0.98, 1.08] },
      { phrase: 'Malista!', pt: 'Imediatamente!', syllables: [1.1, 1.0, 0.94] },
    ],
    work: [
      { phrase: 'Metalefs!', pt: 'Trabalhando nos recursos!', syllables: [0.96, 1.04, 1.0] },
      { phrase: 'Tekton!', pt: 'Erguendo e colhendo!', syllables: [1.02, 0.95] },
    ],
  },
  egyptian: {
    cultureLabel: 'Kemet (Egípcio)',
    basePitch: 124,
    formantF1: 480,
    formantF2: 1350,
    hornPitch: 277.18,
    select: [
      { phrase: 'Iu-airu?', pt: 'O que ordenas?', syllables: [0.96, 1.08, 1.14] },
      { phrase: 'Ha-nefer!', pt: 'Pronto para servir o Faraó!', syllables: [1.04, 0.98, 1.06] },
      { phrase: 'Em-shere?', pt: 'Suas ordens?', syllables: [0.95, 1.1, 1.02] },
    ],
    attack: [
      { phrase: 'Khepresh!', pt: 'Por Rá, ataquem!', syllables: [1.12, 1.26] },
      { phrase: 'Sema-tawy!', pt: 'Esmaguem os invasores!', syllables: [1.04, 1.15, 1.28] },
      { phrase: 'Ankh-ef-en-Sekhmet!', pt: 'Pela fúria de Sekhmet!', syllables: [1.08, 1.2, 1.34] },
    ],
    move: [
      { phrase: 'Sechem!', pt: 'Marchando com poder!', syllables: [1.02, 1.08] },
      { phrase: 'Djew!', pt: 'Avançando pelo deserto!', syllables: [1.06, 0.96] },
    ],
    work: [
      { phrase: 'Baku!', pt: 'Colhendo para o Nilo!', syllables: [0.98, 1.04] },
      { phrase: 'Kheper!', pt: 'Construindo para a eternidade!', syllables: [1.0, 1.08] },
    ],
  },
  norse: {
    cultureLabel: 'Midgard (Nórdico)',
    basePitch: 112,
    formantF1: 430,
    formantF2: 1180,
    hornPitch: 220.0,
    select: [
      { phrase: 'Hvað?', pt: 'O que queres, Jarl?', syllables: [1.08] },
      { phrase: 'Já?', pt: 'Sim, senhor?', syllables: [0.96, 1.12] },
      { phrase: 'Tilbúinn!', pt: 'Pronto para a luta!', syllables: [1.04, 0.96, 1.08] },
    ],
    attack: [
      { phrase: 'Til bardaga!', pt: 'Para a batalha!', syllables: [1.05, 1.18, 1.3, 1.24] },
      { phrase: 'Drepum þá!', pt: 'Por Odin, abatam todos!', syllables: [1.12, 1.26, 1.36] },
      { phrase: 'Valhalla!', pt: 'Por Valhalla!', syllables: [1.06, 1.22, 1.34] },
    ],
    move: [
      { phrase: 'Sammála!', pt: 'De acordo, em marcha!', syllables: [1.02, 1.08, 0.98] },
      { phrase: 'Fram!', pt: 'Avante!', syllables: [1.12] },
    ],
    work: [
      { phrase: 'Skipan!', pt: 'Ao trabalho!', syllables: [0.98, 1.06] },
      { phrase: 'Smiður!', pt: 'Forjando e colhendo!', syllables: [1.02, 0.94] },
    ],
  },
  atlantean: {
    cultureLabel: 'Atlântida (Atlante)',
    basePitch: 138,
    formantF1: 540,
    formantF2: 1560,
    hornPitch: 329.63,
    select: [
      { phrase: 'Isho?', pt: 'Ordens, cidadão?', syllables: [1.0, 1.14] },
      { phrase: 'Kastor!', pt: 'Pronto pela Atlântida!', syllables: [1.06, 0.98] },
      { phrase: 'Tera?', pt: 'O que desejas?', syllables: [0.98, 1.12] },
    ],
    attack: [
      { phrase: 'Kalitago!', pt: 'Destruam em nome dos Titãs!', syllables: [1.04, 1.14, 1.26, 1.34] },
      { phrase: 'Kronos!', pt: 'Pela fúria de Cronos!', syllables: [1.15, 1.3] },
    ],
    move: [
      { phrase: 'Venero!', pt: 'Em movimento!', syllables: [1.04, 1.0, 1.08] },
      { phrase: 'Kora!', pt: 'Seguindo rota!', syllables: [1.06, 0.98] },
    ],
    work: [
      { phrase: 'Oikos!', pt: 'Coletando recursos!', syllables: [1.0, 1.06] },
      { phrase: 'Arkhon!', pt: 'Construindo estrutura!', syllables: [1.04, 0.96] },
    ],
  },
  chinese: {
    cultureLabel: 'Reino do Meio (Chinês)',
    basePitch: 142,
    formantF1: 560,
    formantF2: 1620,
    hornPitch: 349.23,
    select: [
      { phrase: 'Zài!', pt: 'Presente e pronto!', syllables: [1.14, 0.96] },
      { phrase: 'Qǐng fēnfù?', pt: 'Qual é o seu comando?', syllables: [0.98, 1.1, 1.04] },
    ],
    attack: [
      { phrase: 'Chōngfēng!', pt: 'Carreguem contra o inimigo!', syllables: [1.1, 1.28] },
      { phrase: 'Shā!', pt: 'Ataquem sem trégua!', syllables: [1.34] },
    ],
    move: [
      { phrase: 'Zūn mìng!', pt: 'Obedecendo à ordem!', syllables: [1.06, 1.12] },
      { phrase: 'Chūfā!', pt: 'Partindo agora!', syllables: [1.02, 1.1] },
    ],
    work: [
      { phrase: 'Láodòng!', pt: 'Trabalhando pela dinastia!', syllables: [0.98, 1.06] },
      { phrase: 'Jiànzào!', pt: 'Erguendo e colhendo!', syllables: [1.04, 0.98] },
    ],
  },
  aztec: {
    cultureLabel: 'Império Mexica (Asteca)',
    basePitch: 128,
    formantF1: 510,
    formantF2: 1440,
    hornPitch: 311.13,
    select: [
      { phrase: 'Tlahtoani?', pt: 'Ordens, Grande Orador?', syllables: [1.0, 1.08, 1.16] },
      { phrase: 'Nican!', pt: 'Estou pronto!', syllables: [1.06, 1.0] },
    ],
    attack: [
      { phrase: 'Yaoyotl!', pt: 'Guerra sagrada pelo Sol!', syllables: [1.08, 1.2, 1.32] },
      { phrase: 'Huitzilopochtli!', pt: 'Sangue para o Deus Sol!', syllables: [1.04, 1.14, 1.24, 1.35] },
    ],
    move: [
      { phrase: 'Ohtli!', pt: 'Seguindo o caminho!', syllables: [1.04, 1.08] },
      { phrase: 'Nemi!', pt: 'Avançando!', syllables: [1.02, 0.98] },
    ],
    work: [
      { phrase: 'Tequitl!', pt: 'Trabalhando no tributo!', syllables: [0.98, 1.06] },
      { phrase: 'Calli!', pt: 'Construindo para Tenochtitlán!', syllables: [1.02, 1.0] },
    ],
  },
  roman: {
    cultureLabel: 'Senado e Povo (Romano)',
    basePitch: 122,
    formantF1: 490,
    formantF2: 1410,
    hornPitch: 293.66,
    select: [
      { phrase: 'Imperium?', pt: 'Qual é o comando, Legatus?', syllables: [1.0, 1.08, 1.14] },
      { phrase: 'Paratus!', pt: 'Pronto pela Legião!', syllables: [1.04, 1.1, 0.98] },
    ],
    attack: [
      { phrase: 'Ad arma!', pt: 'Às armas, legionários!', syllables: [1.06, 1.22, 1.32] },
      { phrase: 'Pro Roma!', pt: 'Pela glória de Roma, ataquem!', syllables: [1.08, 1.24, 1.3] },
    ],
    move: [
      { phrase: 'Procedite!', pt: 'Marchem em formação!', syllables: [1.02, 1.08, 1.0] },
      { phrase: 'Celeriter!', pt: 'Com rapidez!', syllables: [1.06, 1.02, 1.1] },
    ],
    work: [
      { phrase: 'Laboramus!', pt: 'Trabalhando pelo Império!', syllables: [0.98, 1.04, 1.0] },
      { phrase: 'Aedifica!', pt: 'Construindo obra romana!', syllables: [1.02, 1.08, 0.96] },
    ],
  },
  japanese: {
    cultureLabel: 'Takamagahara (Japonês)',
    basePitch: 130,
    formantF1: 500,
    formantF2: 1500,
    hornPitch: 329.63,
    select: [
      { phrase: 'Gomeirei wo?', pt: 'Qual é a sua ordem, Xogum?', syllables: [0.98, 1.06, 1.14] },
      { phrase: 'Kakugo!', pt: 'Pronto com honra!', syllables: [1.08, 1.02, 0.96] },
    ],
    attack: [
      { phrase: 'Totsugeki!', pt: 'Ataquem com honra!', syllables: [1.06, 1.18, 1.32] },
      { phrase: 'Kirifuse!', pt: 'Derrubem os inimigos!', syllables: [1.1, 1.22, 1.34] },
    ],
    move: [
      { phrase: 'Shōchi!', pt: 'Compreendido, em marcha!', syllables: [1.04, 1.1] },
      { phrase: 'Susume!', pt: 'Avancem!', syllables: [1.02, 1.08, 1.12] },
    ],
    work: [
      { phrase: 'Fushin!', pt: 'Construindo e colhendo!', syllables: [0.98, 1.04] },
      { phrase: 'Tsutome!', pt: 'Cumprindo o dever!', syllables: [1.02, 0.98] },
    ],
  },
  eldritch: {
    cultureLabel: 'Abismo Cósmico (Eldritch)',
    basePitch: 92,
    formantF1: 360,
    formantF2: 980,
    hornPitch: 164.81,
    select: [
      { phrase: "Iä! Ph'nglui?", pt: 'O vazio escuta seu chamado?', syllables: [0.92, 1.06, 0.88] },
      { phrase: "R'lyeh!", pt: 'Despertos nas profundezas!', syllables: [1.04, 0.9] },
    ],
    attack: [
      { phrase: 'Fhtagn! Obliterar!', pt: 'Devorar as mentes mortais!', syllables: [1.08, 1.22, 0.94] },
      { phrase: 'Yogg-Sothoth!', pt: 'Pelo caos abissal, destruam!', syllables: [1.02, 1.18, 1.28] },
    ],
    move: [
      { phrase: 'Nyarlath!', pt: 'Deslizando pelas sombras!', syllables: [0.96, 1.04] },
    ],
    work: [
      { phrase: 'Shoggoth!', pt: 'Canalizando matéria astral!', syllables: [0.94, 1.02] },
    ],
  },
  celtic: {
    cultureLabel: 'Tuatha Dé Danann (Celta)',
    basePitch: 126,
    formantF1: 500,
    formantF2: 1460,
    hornPitch: 261.63,
    select: [
      { phrase: 'Cén t-ordú?', pt: 'Qual é o comando dos Druidas?', syllables: [1.0, 1.12, 1.04] },
      { phrase: 'Réidh!', pt: 'Pronto pelo clã!', syllables: [1.1] },
    ],
    attack: [
      { phrase: 'Abú! Chun catha!', pt: 'Vitória! Para a batalha!', syllables: [1.06, 1.2, 1.32] },
      { phrase: 'Morrígan!', pt: 'Pela fúria de Morrígan!', syllables: [1.1, 1.24, 1.18] },
    ],
    move: [
      { phrase: 'Ar aghaidh!', pt: 'Avante pelas colinas!', syllables: [1.02, 1.1] },
    ],
    work: [
      { phrase: 'Obair!', pt: 'Colhendo nas terras sagradas!', syllables: [0.98, 1.04] },
    ],
  },
  babylonian: {
    cultureLabel: 'Mesopotâmia (Babilônico)',
    basePitch: 120,
    formantF1: 470,
    formantF2: 1320,
    hornPitch: 246.94,
    select: [
      { phrase: 'Amātu?', pt: 'Qual é a palavra real?', syllables: [0.98, 1.08, 1.12] },
      { phrase: 'Annû!', pt: 'Pronto na Babilônia!', syllables: [1.04, 1.0] },
    ],
    attack: [
      { phrase: 'Ina Marduk!', pt: 'Por Marduk, esmaguem-nos!', syllables: [1.06, 1.18, 1.3] },
      { phrase: 'Qablu!', pt: 'Ao combate!', syllables: [1.12, 1.26] },
    ],
    move: [
      { phrase: 'Alāku!', pt: 'Marchando pelo Eufrates!', syllables: [1.02, 1.08, 1.0] },
    ],
    work: [
      { phrase: 'Epēšu!', pt: 'Erguendo o zigurate!', syllables: [0.98, 1.06, 1.0] },
    ],
  },
  lakota: {
    cultureLabel: 'Grande Planície (Lakota)',
    basePitch: 125,
    formantF1: 495,
    formantF2: 1420,
    hornPitch: 293.66,
    select: [
      { phrase: 'Háu, Itancan?', pt: 'Qual é o caminho, Chefe?', syllables: [1.02, 1.1, 1.06] },
      { phrase: 'Wiyeya!', pt: 'Pronto nas planícies!', syllables: [1.06, 1.0, 1.08] },
    ],
    attack: [
      { phrase: 'Hokahey!', pt: 'É um bom dia para lutar!', syllables: [1.08, 1.2, 1.34] },
      { phrase: 'Wakinyan!', pt: 'Como o Pássaro-Trovão, ataquem!', syllables: [1.06, 1.18, 1.28] },
    ],
    move: [
      { phrase: 'Iyaya!', pt: 'Cavalgando como o vento!', syllables: [1.04, 1.1, 1.02] },
    ],
    work: [
      { phrase: 'Wóškate!', pt: 'Sustentando a tribo!', syllables: [0.98, 1.04, 1.0] },
    ],
  },
  jotunn: {
    cultureLabel: 'Jotunheim (Gigantes de Gelo)',
    basePitch: 86,
    formantF1: 340,
    formantF2: 920,
    hornPitch: 146.83,
    select: [
      { phrase: 'Kaldur rymr?', pt: 'A geada aguarda sua ordem?', syllables: [0.92, 1.02, 0.96] },
      { phrase: 'Jötunn!', pt: 'Os gigantes despertam!', syllables: [1.04, 0.94] },
    ],
    attack: [
      { phrase: 'Fimbulvetr!', pt: 'Inverno eterno sobre eles!', syllables: [1.04, 1.16, 1.24] },
      { phrase: 'Brjóta!', pt: 'Estilhacem no gelo!', syllables: [1.12, 1.26] },
    ],
    move: [
      { phrase: 'Ganga!', pt: 'Passos que tremem a terra!', syllables: [0.98, 0.92] },
    ],
    work: [
      { phrase: 'Hrímpurs!', pt: 'Moldando o gelo primordial!', syllables: [0.94, 1.0] },
    ],
  },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;
  public masterVolume = 0.85;
  public musicVolume = 0.7;
  public sfxVolume = 0.9;
  public musicEnabled = true;
  public sfxEnabled = true;
  private lastSoundAt: Record<string, number> = {};
  private voiceCycleIndex = 0;

  private get effectiveSfxScale(): number {
    if (this.muted || !this.sfxEnabled) return 0;
    return Math.max(0, Math.min(1.5, this.masterVolume * this.sfxVolume));
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || !this.sfxEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private canPlay(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const prev = this.lastSoundAt[key] ?? 0;
    if (now - prev < minIntervalMs) return false;
    this.lastSoundAt[key] = now;
    return true;
  }

  public unlock() {
    this.ensureContext();
  }

  public applySettings(opts: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    musicEnabled: boolean;
    sfxEnabled: boolean;
  }) {
    this.masterVolume = opts.masterVolume;
    this.musicVolume = opts.musicVolume;
    this.sfxVolume = opts.sfxVolume;
    this.musicEnabled = opts.musicEnabled;
    this.sfxEnabled = opts.sfxEnabled;
    this.muted = !opts.sfxEnabled && !opts.musicEnabled;
  }

  public playSelect() {
    if (!this.canPlay('select', 70)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.08);
    gain.gain.setValueAtTime(0.06 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCommand() {
    if (!this.canPlay('command', 90)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.09);
    gain.gain.setValueAtTime(0.055 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Plays a culturally localized unit voice line & formant vocal cadence
   * when a unit or group of units is selected or ordered to attack/move/work.
   */
  public playUnitVoiceLine(
    pantheon: PantheonId,
    kind: UnitKind,
    action: UnitVoiceAction,
    groupSize = 1
  ): UnitVoiceLineInfo {
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const bank = profile[action] && profile[action].length > 0 ? profile[action] : profile.select;
    const chosen = bank[this.voiceCycleIndex % bank.length];
    this.voiceCycleIndex = (this.voiceCycleIndex + 1) % 997;

    let phrase = chosen.phrase;
    let translation = chosen.pt;

    if (kind === 'zeus') {
      phrase = action === 'attack' ? 'ZEUS: "Fulminarei todos os mortais com o Trovão Supremo!"' : 'ZEUS: "O Rei do Olimpo atende ao chamado da Era V!"';
      translation = action === 'attack' ? 'Trovão Supremo do Pai dos Deuses!' : 'Zeus aguarda seu decreto divino.';
    } else if (kind === 'poseidon') {
      phrase = action === 'attack' ? 'POSEIDON: "Que os mares engulam suas muralhas!"' : 'POSEIDON: "O Senhor dos Mares ergue seu Tridente!"';
      translation = action === 'attack' ? 'Tsunami sísmico de Poseidon!' : 'Poseidon domina as águas.';
    } else if (kind === 'hades') {
      phrase = action === 'attack' ? 'HADES: "Para as profundezas do Tártaro!"' : 'HADES: "As sombras do Submundo obedecem."';
      translation = action === 'attack' ? 'Chamas necróticas do Submundo!' : 'Hades reina sobre o campo.';
    } else if (kind === 'atena') {
      phrase = action === 'attack' ? 'ATENA: "Pela Égide e pela Sabedoria Divina!"' : 'ATENA: "A estratégia precede a vitória."';
      translation = action === 'attack' ? 'Golpe sagrado da Égide de Atena!' : 'Atena protege suas fileiras.';
    } else if (kind === 'ares') {
      phrase = action === 'attack' ? 'ARES: "SANGUE E GUERRA! Esmaguem tudo!"' : 'ARES: "Onde está o combate?!"';
      translation = action === 'attack' ? 'Fúria sísmica do Deus da Guerra!' : 'Ares anseia pela batalha.';
    } else if (kind === 'hermes') {
      phrase = action === 'attack' ? 'HERMES: "Mais rápido que o relâmpago!"' : 'HERMES: "Asas do Olimpo ao seu dispor."';
      translation = action === 'attack' ? 'Rajada celeste de Hermes!' : 'Mensageiro divino pronto.';
    } else if (kind === 'apolo') {
      phrase = action === 'attack' ? 'APOLO: "Que o fogo solar reduza-os a cinzas!"' : 'APOLO: "A luz do Sol ilumina o campo."';
      translation = action === 'attack' ? 'Flechas solares de Apolo!' : 'Apolo mira o horizonte.';
    } else if (kind === 'dionisio') {
      phrase = action === 'attack' ? 'DIONÍSIO: "O frenesi dionisíaco os consumirá!"' : 'DIONÍSIO: "Celebremos a vitória antecipada!"';
      translation = action === 'attack' ? 'Onda arcana das vinhas sagradas!' : 'Dionísio abençoa a marcha.';
    } else if (kind === 'afrodite') {
      phrase = action === 'attack' ? 'AFRODITE: "Contemplem a fúria celestial da Beleza!"' : 'AFRODITE: "Nascida da espuma e das estrelas."';
      translation = action === 'attack' ? 'Explosão encantadora de Afrodite!' : 'Afrodite flutua em graça.';
    } else if (kind === 'hefesto') {
      phrase = action === 'attack' ? 'HEFESTO: "Sinta o martelo da Forja Olímpica!"' : 'HEFESTO: "Fogo e bronze moldam o destino."';
      translation = action === 'attack' ? 'Impacto vulcânico de Hefesto!' : 'Hefesto prepara o martelo.';
    } else if (kind === 'artemis') {
      phrase = action === 'attack' ? 'ÁRTEMIS: "A caçada lunar nunca erra o alvo!"' : 'ÁRTEMIS: "Sob o luar, somos implacáveis."';
      translation = action === 'attack' ? 'Chuva de flechas lunares de Ártemis!' : 'Ártemis vigia a floresta.';
    } else if (kind === 'titan') {
      phrase = action === 'attack' ? `TITÃ: "${chosen.phrase}"` : `Titã Ancestral — "${chosen.phrase}"`;
      translation = action === 'attack' ? 'Rugido Titânico de Destruição!' : 'O Titã aguarda seu comando.';
    } else if (kind === 'ajax') {
      phrase =
        action === 'attack'
          ? 'ÁJAX: "Eis Machên! Pelo Escudo de Salamina!"'
          : action === 'move'
          ? 'ÁJAX: "Ne! Avançando com a falange!"'
          : 'ÁJAX: "Prostagma? O Escudo de Salamina está pronto!"';
      translation =
        action === 'attack'
          ? 'Golpe de Escudo Colossal — Ao ataque!'
          : action === 'move'
          ? 'Ájax marcha para a posição.'
          : 'Herói Ájax Telamônio pronto para o combate.';
    } else if (kind === 'jason') {
      phrase =
        action === 'attack'
          ? 'JASÃO: "Pelos Argonautas e pelo Velocino!"'
          : action === 'move'
          ? 'JASÃO: "Em frente, rumo à glória!"'
          : 'JASÃO: "Prostagma? A tripulação de Argo aguarda!"';
      translation =
        action === 'attack'
          ? 'Ataque heroico com o Velocino de Ouro!'
          : action === 'move'
          ? 'Jasão avança com firmeza.'
          : 'Herói Jasão pronto para liderar.';
    } else if (kind === 'odysseus') {
      phrase =
        action === 'attack'
          ? 'ULISSES: "Nenhuma fera escapará do arco de Ítaca!"'
          : 'ULISSES: "Etimos! Estratégia acima da força bruta."';
      translation = action === 'attack' ? 'Flecha certeira de Ulisses!' : 'Rei de Ítaca à escuta.';
    } else if (kind === 'perseus') {
      phrase =
        action === 'attack'
          ? 'PERSEU: "Pela lâmina de Hermes e o escudo de Atena!"'
          : 'PERSEU: "Lege? Nenhum monstro resistirá."';
      translation = action === 'attack' ? 'Golpe mortal de Perseu!' : 'Matador da Górgona pronto.';
    } else if (kind === 'bellerophon') {
      phrase =
        action === 'attack'
          ? 'BELEROFONTE: "Dos céus com Pégaso — ao ataque!"'
          : 'BELEROFONTE: "Asas abertas sobre o Olimpo!"';
      translation = action === 'attack' ? 'Investida alada de Belerofonte!' : 'Cavaleiro alado pronto.';
    } else if (kind === 'hippolyta') {
      phrase =
        action === 'attack'
          ? 'HIPÓLITA: "Pelas Amazonas! Chuva de flechas!"'
          : 'HIPÓLITA: "Etimos! Ágil como o vento de Ártemis."';
      translation = action === 'attack' ? 'Rajada veloz da Rainha Amazona!' : 'Hipólita aguarda ordens.';
    } else if (kind === 'theseus') {
      phrase =
        action === 'attack'
          ? 'TESEU: "Por Atenas! Pela ordem da falange!"'
          : 'TESEU: "Prostagma? O tático de Atenas está pronto."';
      translation = action === 'attack' ? 'Avanço tático de Teseu!' : 'Herói Teseu atento ao campo.';
    } else if (kind === 'cyclops') {
      phrase = action === 'attack' ? 'CICLOPE: "GRAAAH! ESMAGAR E ARREMESSAR!"' : 'CICLOPE: "Mmmgh... Ordem?"';
      translation = action === 'attack' ? 'O Ciclope agarra e arremessa os inimigos!' : 'Ciclope de Zeus pronto.';
    }

    const result: UnitVoiceLineInfo = {
      phrase,
      translation,
      cultureLabel: profile.cultureLabel,
      action,
    };

    if (!this.canPlay('unit_voice', 170)) {
      return result;
    }

    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) {
      return result;
    }

    const now = ctx.currentTime;

    const kindPitchMult =
      kind === 'zeus' || kind === 'poseidon' || kind === 'hades'
        ? 0.42
        : kind === 'ares' || kind === 'hefesto' || kind === 'dionisio'
        ? 0.48
        : kind === 'hermes' || kind === 'apolo'
        ? 0.56
        : kind === 'atena' || kind === 'afrodite' || kind === 'artemis'
        ? 0.72
        : kind === 'titan'
        ? 0.52
        : kind === 'colossus' || kind === 'hydra' || kind === 'cyclops'
        ? 0.62
        : kind === 'minotaur' || kind === 'manticore' || kind === 'automaton' || kind === 'iron_dwarf'
        ? 0.72
        : kind === 'siege' || kind === 'ram'
        ? 0.62
        : kind === 'ajax' || kind === 'perseus'
        ? 0.84
        : kind === 'jason' || kind === 'theseus' || kind === 'odysseus' || kind === 'bellerophon' || kind === 'hero' || kind === 'hoplite' || kind === 'myrmidon'
        ? 0.92
        : kind === 'cavalry' || kind === 'prodromos' || kind === 'pegasus'
        ? 0.96
        : kind === 'hippolyta' || kind === 'nymph' || kind === 'medusa' || kind === 'phoenix'
        ? 1.12
        : kind === 'archer' || kind === 'peltast' || kind === 'gastraphetes' || kind === 'satyr'
        ? 1.06
        : 1.02;

    const baseFreq = profile.basePitch * kindPitchMult;
    const syllables = chosen.syllables;
    const voiceLayers = groupSize > 1 ? 2 : 1;

    for (let v = 0; v < voiceLayers; v++) {
      const layerDelay = v * 0.036;
      const layerDetune = v === 0 ? 1.0 : 1.045;
      const layerGainScale = v === 0 ? 1.0 : 0.65;

      let cursor = now + layerDelay;
      for (let i = 0; i < syllables.length; i++) {
        const sylPitch = baseFreq * syllables[i] * layerDetune;
        const dur = action === 'attack' ? 0.095 : 0.082;

        const osc = ctx.createOscillator();
        const f1Filter = ctx.createBiquadFilter();
        const f2Filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type =
          kind === 'titan' ||
          kind === 'zeus' ||
          kind === 'poseidon' ||
          kind === 'hades' ||
          kind === 'ares' ||
          kind === 'hefesto' ||
          kind === 'minotaur' ||
          kind === 'cyclops' ||
          kind === 'colossus' ||
          kind === 'hydra' ||
          kind === 'manticore' ||
          kind === 'automaton'
            ? 'sawtooth'
            : 'triangle';
        osc.frequency.setValueAtTime(sylPitch, cursor);
        osc.frequency.exponentialRampToValueAtTime(
          sylPitch * (action === 'select' && i === syllables.length - 1 ? 1.12 : 0.94),
          cursor + dur
        );

        f1Filter.type = 'bandpass';
        f1Filter.frequency.setValueAtTime(profile.formantF1 * (1 + i * 0.08), cursor);
        f1Filter.Q.setValueAtTime(3.2, cursor);

        f2Filter.type = 'peaking';
        f2Filter.frequency.setValueAtTime(profile.formantF2 * (1 - i * 0.05), cursor);
        f2Filter.gain.setValueAtTime(6, cursor);

        const amp = (action === 'attack' ? 0.12 : 0.095) * scale * layerGainScale;
        gain.gain.setValueAtTime(0.001, cursor);
        gain.gain.linearRampToValueAtTime(amp, cursor + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, cursor + dur);

        osc.connect(f1Filter);
        f1Filter.connect(f2Filter);
        f2Filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(cursor);
        osc.stop(cursor + dur + 0.005);

        cursor += dur + 0.018;
      }
    }

    if (action === 'attack') {
      const hornOsc = ctx.createOscillator();
      const hornGain = ctx.createGain();
      hornOsc.type = groupSize > 1 ? 'sawtooth' : 'triangle';
      const hornFreq = profile.hornPitch * (groupSize > 2 ? 1.0 : 0.85);
      hornOsc.frequency.setValueAtTime(hornFreq, now);
      hornOsc.frequency.exponentialRampToValueAtTime(hornFreq * 1.25, now + 0.22);
      hornGain.gain.setValueAtTime(0.001, now);
      hornGain.gain.linearRampToValueAtTime(0.08 * scale, now + 0.03);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      hornOsc.connect(hornGain);
      hornGain.connect(ctx.destination);
      hornOsc.start(now);
      hornOsc.stop(now + 0.26);
    } else if (action === 'select') {
      this.playSelect();
    } else {
      this.playCommand();
    }

    return result;
  }

  public playBuild() {
    if (!this.canPlay('build', 160)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.11);
    gain.gain.setValueAtTime(0.05 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playSwordHit() {
    if (!this.canPlay('hit', 110)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260 + Math.random() * 90, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.08);
    gain.gain.setValueAtTime(0.04 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playArrow() {
    if (!this.canPlay('arrow', 120)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);
    gain.gain.setValueAtTime(0.035 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playLightning() {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.55;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.16));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  public playMeteor() {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.65);
    gain.gain.setValueAtTime(0.22 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  }

  public playFanfare(isVictory = false) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const notes = isVictory ? [293.66, 369.99, 440, 587.33] : [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.11;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.09 * scale, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.48);
    });
  }

  private getCultureScaleSemitones(pantheon: PantheonId): number[] {
    switch (pantheon) {
      case 'egyptian':
        // Escala Frígia Dominante (Hijaz Real do Nilo — mística, solar e majestosa)
        return [0, 1, 4, 5, 7, 8, 11, 12, 13, 16, 17, 19, 24];
      case 'greek':
        // Modo Dórico Heroico Helênico
        return [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19, 24];
      case 'norse':
        // Modo Eólio Viking Ancestral
        return [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 19, 22, 24];
      case 'atlantean':
        // Modo Lídio Celestial de Oricalco
        return [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19, 24];
      case 'chinese':
      case 'japanese':
        // Pentatônica Imperial
        return [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 31];
      default:
        // Escala Épica Modal
        return [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 24];
    }
  }

  public getAgeThemeInfo(age: AgeLevel, pantheon: PantheonId = 'greek'): {
    title: string;
    intensityLabel: string;
    description: string;
  } {
    const civName = CULTURE_VOICE_BANK[pantheon]?.cultureLabel ?? 'Civilização';
    switch (age) {
      case 1:
        return {
          title: 'Tema I · Despertar Arcaico',
          intensityLabel: 'Intensidade I (Sutil / Tribal)',
          description: `Percussão ancestral e sopro rústico de fundação (${civName}).`,
        };
      case 2:
        return {
          title: 'Tema II · Chamado Clássico',
          intensityLabel: 'Intensidade II (Marcial / Nobre)',
          description: `Trompas de bronze em tríade ascendente e tambores de marcha (${civName}).`,
        };
      case 3:
        return {
          title: 'Tema III · Fanfarra Heroica',
          intensityLabel: 'Intensidade III (Polifônica / Forte)',
          description: `Metais em quintas paralelas, rufar de tímpanos e brilho metálico (${civName}).`,
        };
      case 4:
        return {
          title: 'Tema IV · Sinfonia Mítica',
          intensityLabel: 'Intensidade IV (Orquestral / Majestosa)',
          description: `Coro místico formante, sub-grave sísmico, gongo sagrado e fanfarra real (${civName}).`,
        };
      case 5:
      default:
        return {
          title: 'Tema V · Apoteose da Era dos Deuses',
          intensityLabel: 'Intensidade V (Máxima / Divina)',
          description: `Trovão celestial, coro divino em múltiplas oitavas, carrilhão solar e fanfarra apoteótica (${civName}).`,
        };
    }
  }

  /**
   * Notificação sonora tocada ao INICIAR a transição para uma nova Era.
   * Escala progressivamente em tensão rítmica e harmônica da Era II até a Era V.
   */
  public playAgeTransitionStart(targetAge: AgeLevel, pantheon: PantheonId = 'greek') {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const semitones = this.getCultureScaleSemitones(pantheon);
    const rootFreq = Math.max(165, Math.min(330, profile.hornPitch || 261.63));

    // Intensidade progressiva conforme a Era alvo (2 -> 5)
    const intensity = Math.max(1, Math.min(5, targetAge));
    const gainBoost = (0.48 + intensity * 0.14) * scale;
    const drumCount = intensity + 1; // Era 2: 3 toques, Era 3: 4, Era 4: 5, Era 5: 6

    // 1. Rufar de tambores cerimoniais preparatórios
    for (let i = 0; i < drumCount; i++) {
      const t = now + i * (0.11 - intensity * 0.008);
      const isLast = i === drumCount - 1;
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.type = 'sine';
      const startPitch = isLast ? 115 + intensity * 6 : 82 + i * 4;
      drumOsc.frequency.setValueAtTime(startPitch, t);
      drumOsc.frequency.exponentialRampToValueAtTime(32, t + (isLast ? 0.34 : 0.16));

      const hitVol = (isLast ? 0.18 : 0.08 + (i / drumCount) * 0.06) * gainBoost;
      drumGain.gain.setValueAtTime(0.001, t);
      drumGain.gain.linearRampToValueAtTime(hitVol, t + 0.012);
      drumGain.gain.exponentialRampToValueAtTime(0.001, t + (isLast ? 0.36 : 0.18));

      drumOsc.connect(drumGain);
      drumGain.connect(ctx.destination);
      drumOsc.start(t);
      drumOsc.stop(t + (isLast ? 0.38 : 0.2));
    }

    // 2. Motivo ascendente de trompa cultural anunciando o início da evolução
    const motifIndices =
      targetAge <= 2
        ? [0, 2, 4]
        : targetAge === 3
        ? [0, 2, 4, 6]
        : targetAge === 4
        ? [0, 2, 4, 6, 7]
        : [0, 2, 4, 6, 7, 9];

    motifIndices.forEach((degIdx, idx) => {
      const semi = semitones[degIdx % semitones.length];
      const freq = rootFreq * Math.pow(2, semi / 12);
      const noteStart = now + 0.06 + idx * 0.11;
      const isFinal = idx === motifIndices.length - 1;
      const noteDur = isFinal ? 0.45 + intensity * 0.08 : 0.18;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = pantheon === 'egyptian' || pantheon === 'greek' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900 + intensity * 380, noteStart);
      filter.Q.value = 2.2;

      const peak = (isFinal ? 0.11 : 0.075) * gainBoost;
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(peak, noteStart + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteStart);
      osc.stop(noteStart + noteDur + 0.02);
    });
  }

  /**
   * Sistema de Notificação Sonora Épica para Transição de Era (Eras I a V).
   * - Utiliza a escala musical e o timbre da civilização do jogador.
   * - Sobe progressivamente de intensidade, camadas orquestrais, graves, coro e duração
   *   conforme o jogador avança da Era I (Arcaica) até a Era V (Era dos Deuses).
   */
  public playAgeTransitionComplete(age: AgeLevel, pantheon: PantheonId = 'greek', isEnemy = false) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const semitones = this.getCultureScaleSemitones(pantheon);
    const baseRoot = Math.max(146.83, Math.min(311.13, profile.hornPitch || 261.63));
    const eraLevel = Math.max(1, Math.min(5, age)) as AgeLevel;

    // Se for o inimigo avançando de era, toca uma trompa de aviso ameaçadora e distante que escala com a Era
    if (isEnemy) {
      const warnGain = (0.35 + eraLevel * 0.12) * scale;
      const warnNotes = eraLevel >= 4 ? [4, 1, 0, -5] : [2, 1, 0];
      warnNotes.forEach((deg, idx) => {
        const semi = deg >= 0 ? semitones[deg % semitones.length] : deg;
        const freq = baseRoot * 0.75 * Math.pow(2, semi / 12);
        const start = now + idx * 0.22;
        const dur = idx === warnNotes.length - 1 ? 0.65 + eraLevel * 0.1 : 0.26;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480 + eraLevel * 140, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.09 * warnGain, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
      return;
    }

    // Parâmetros de escalada progressiva de intensidade (Era 1 -> Era 5)
    // Era 1: Sutil/Tribal | Era 2: Clássica/Marcial | Era 3: Heroica/Polifônica | Era 4: Mítica/Orquestral | Era 5: Apoteose Divina
    const intensityMult = [0, 0.52, 0.74, 0.96, 1.20, 1.48][eraLevel] * scale;
    const unisonVoices = [0, 1, 2, 3, 4, 6][eraLevel];
    const filterCutoff = [0, 1100, 1650, 2400, 3400, 4800][eraLevel];
    const sustainTail = [0, 0.45, 0.68, 0.95, 1.35, 1.85][eraLevel];

    // =========================================================================
    // CAMADA 1: Percussão de Guerra & Sub-Bass Impact (cresce em peso e número)
    // =========================================================================
    const drumPattern: { time: number; pitch: number; vol: number; dur: number }[] =
      eraLevel === 1
        ? [
            { time: 0.0, pitch: 88, vol: 0.16, dur: 0.26 },
            { time: 0.28, pitch: 98, vol: 0.22, dur: 0.38 },
          ]
        : eraLevel === 2
        ? [
            { time: 0.0, pitch: 92, vol: 0.20, dur: 0.24 },
            { time: 0.18, pitch: 96, vol: 0.18, dur: 0.22 },
            { time: 0.36, pitch: 112, vol: 0.28, dur: 0.48 },
          ]
        : eraLevel === 3
        ? [
            { time: 0.0, pitch: 96, vol: 0.24, dur: 0.24 },
            { time: 0.14, pitch: 102, vol: 0.20, dur: 0.20 },
            { time: 0.28, pitch: 108, vol: 0.24, dur: 0.22 },
            { time: 0.42, pitch: 86, vol: 0.26, dur: 0.26 },
            { time: 0.60, pitch: 124, vol: 0.34, dur: 0.62 },
          ]
        : eraLevel === 4
        ? [
            { time: 0.0, pitch: 105, vol: 0.30, dur: 0.32 },
            { time: 0.12, pitch: 95, vol: 0.22, dur: 0.20 },
            { time: 0.24, pitch: 110, vol: 0.26, dur: 0.22 },
            { time: 0.36, pitch: 98, vol: 0.24, dur: 0.22 },
            { time: 0.48, pitch: 118, vol: 0.30, dur: 0.28 },
            { time: 0.66, pitch: 82, vol: 0.34, dur: 0.35 },
            { time: 0.88, pitch: 132, vol: 0.40, dur: 0.85 },
          ]
        : [
            // Era 5: Tambores Apocalípticos da Era dos Deuses
            { time: 0.0, pitch: 118, vol: 0.38, dur: 0.40 },
            { time: 0.10, pitch: 96, vol: 0.26, dur: 0.20 },
            { time: 0.20, pitch: 108, vol: 0.28, dur: 0.20 },
            { time: 0.30, pitch: 116, vol: 0.30, dur: 0.22 },
            { time: 0.42, pitch: 88, vol: 0.34, dur: 0.28 },
            { time: 0.56, pitch: 124, vol: 0.36, dur: 0.28 },
            { time: 0.72, pitch: 92, vol: 0.36, dur: 0.32 },
            { time: 0.90, pitch: 136, vol: 0.42, dur: 0.45 },
            { time: 1.12, pitch: 148, vol: 0.48, dur: 1.15 },
          ];

    drumPattern.forEach((hit) => {
      const t = now + hit.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hit.pitch, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + hit.dur);

      const peak = Math.min(0.45, hit.vol * intensityMult);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + hit.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + hit.dur + 0.02);
    });

    // Sub-Bass Drop Sísmico para Eras III, IV e V
    if (eraLevel >= 3) {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subDur = 0.7 + (eraLevel - 2) * 0.45;
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(68 + eraLevel * 6, now);
      subOsc.frequency.exponentialRampToValueAtTime(24, now + subDur);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(Math.min(0.38, 0.14 * intensityMult), now + 0.03);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + subDur);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + subDur + 0.03);
    }

    // =========================================================================
    // CAMADA 2: Melodia Épica Cultural & Fanfarra de Metais (Escala Progressiva)
    // =========================================================================
    // Cada Era possui um tema próprio na escala da civilização, ficando mais longo,
    // mais agudo no clímax e mais rico harmonicamente a cada avanço.
    const melodyByEra: Record<AgeLevel, { deg: number; delay: number; dur: number; accent?: boolean }[]> = {
      1: [
        { deg: 0, delay: 0.02, dur: 0.24 },
        { deg: 2, delay: 0.22, dur: 0.24 },
        { deg: 4, delay: 0.44, dur: 0.52, accent: true },
      ],
      2: [
        { deg: 0, delay: 0.0, dur: 0.18 },
        { deg: 2, delay: 0.16, dur: 0.18 },
        { deg: 4, delay: 0.32, dur: 0.22 },
        { deg: 7, delay: 0.52, dur: 0.68, accent: true },
      ],
      3: [
        { deg: 0, delay: 0.0, dur: 0.16 },
        { deg: 2, delay: 0.14, dur: 0.16 },
        { deg: 4, delay: 0.28, dur: 0.18 },
        { deg: 3, delay: 0.44, dur: 0.16 },
        { deg: 6, delay: 0.58, dur: 0.22 },
        { deg: 7, delay: 0.78, dur: 0.88, accent: true },
      ],
      4: [
        { deg: 0, delay: 0.0, dur: 0.15 },
        { deg: 2, delay: 0.13, dur: 0.15 },
        { deg: 4, delay: 0.26, dur: 0.16 },
        { deg: 6, delay: 0.40, dur: 0.18 },
        { deg: 4, delay: 0.56, dur: 0.15 },
        { deg: 7, delay: 0.70, dur: 0.22 },
        { deg: 9, delay: 0.90, dur: 0.26 },
        { deg: 11, delay: 1.12, dur: 1.15, accent: true },
      ],
      5: [
        { deg: 0, delay: 0.0, dur: 0.14 },
        { deg: 2, delay: 0.12, dur: 0.14 },
        { deg: 4, delay: 0.24, dur: 0.15 },
        { deg: 7, delay: 0.38, dur: 0.18 },
        { deg: 6, delay: 0.54, dur: 0.15 },
        { deg: 7, delay: 0.68, dur: 0.16 },
        { deg: 9, delay: 0.84, dur: 0.20 },
        { deg: 11, delay: 1.02, dur: 0.24 },
        { deg: 10, delay: 1.24, dur: 0.22 },
        { deg: 12, delay: 1.44, dur: 1.55, accent: true },
      ],
    };

    const melody = melodyByEra[eraLevel];
    melody.forEach((note) => {
      const semi = semitones[note.deg % semitones.length];
      const freq = baseRoot * Math.pow(2, semi / 12);
      const start = now + note.delay;
      const totalDur = note.dur + (note.accent ? sustainTail * 0.45 : 0);

      // Empilha vozes em uníssono/oitava/quinta conforme a Era avança
      for (let v = 0; v < unisonVoices; v++) {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Alterna entre sawtooth (metais/trompas) e triangle (corpo harmônico)
        if (eraLevel === 1) {
          osc.type = 'triangle';
        } else {
          osc.type = v % 2 === 0 ? 'sawtooth' : 'triangle';
        }

        // Harmonia polifônica progressiva:
        // v=0: fundamental | v=1: levemente detuned | v=2: quinta justa (1.498x) | v=3: oitava superior (2x) | v=4: oitava inferior (0.5x) | v=5: décima segunda (3x)
        let pitchMult = 1;
        if (v === 2 && eraLevel >= 3) pitchMult = 1.4983; // Quinta heroica
        else if (v === 3 && eraLevel >= 4) pitchMult = 2.0; // Oitava brilhante
        else if (v === 4 && eraLevel >= 5) pitchMult = 0.5; // Trompa sub-oitava colossal
        else if (v === 5 && eraLevel >= 5) pitchMult = 2.9966; // Harmônico celestial

        const detuneCents = v === 0 ? 0 : (v % 2 === 0 ? 1 : -1) * (3.5 + v * 2.2);
        osc.frequency.setValueAtTime(freq * pitchMult, start);
        osc.detune.setValueAtTime(detuneCents, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterCutoff * (note.accent ? 1.25 : 0.9), start);
        filter.Q.value = note.accent ? 2.8 : 1.6;

        const voiceWeight = v === 0 ? 1.0 : v === 1 ? 0.72 : 0.48;
        const notePeak =
          Math.min(0.28, (note.accent ? 0.115 : 0.082) * intensityMult * voiceWeight) /
          Math.sqrt(unisonVoices * 0.65);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(notePeak, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, start + totalDur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + totalDur + 0.03);
      }
    });

    // =========================================================================
    // CAMADA 3: Ornamento Cultural (Lira Grega / Sistro Egípcio / Gongo / Oricalco)
    // =========================================================================
    if (eraLevel >= 2) {
      const shimmerCount = eraLevel * 2;
      const shimmerBaseStart = now + (eraLevel >= 4 ? 0.35 : 0.18);
      for (let s = 0; s < shimmerCount; s++) {
        const semi = semitones[(s * 2) % semitones.length];
        const sFreq = baseRoot * (pantheon === 'egyptian' ? 3.0 : 2.0) * Math.pow(2, semi / 12);
        const sStart = shimmerBaseStart + s * (0.095 - eraLevel * 0.008);
        const sDur = 0.22 + eraLevel * 0.06;

        const sOsc = ctx.createOscillator();
        const sGain = ctx.createGain();
        sOsc.type = pantheon === 'egyptian' ? 'sine' : 'triangle';
        sOsc.frequency.setValueAtTime(sFreq, sStart);

        const sPeak = Math.min(0.14, (0.024 + eraLevel * 0.008) * intensityMult);
        sGain.gain.setValueAtTime(0.001, sStart);
        sGain.gain.linearRampToValueAtTime(sPeak, sStart + 0.012);
        sGain.gain.exponentialRampToValueAtTime(0.001, sStart + sDur);

        sOsc.connect(sGain);
        sGain.connect(ctx.destination);
        sOsc.start(sStart);
        sOsc.stop(sStart + sDur + 0.02);
      }
    }

    // =========================================================================
    // CAMADA 4: Coro Místico Formante & Pad Celestial (Eras IV e V)
    // =========================================================================
    if (eraLevel >= 4) {
      const choirStart = now + 0.15;
      const choirDur = eraLevel === 5 ? 2.95 : 2.1;
      const choirIntervals = eraLevel === 5 ? [0, 4, 7, 12] : [0, 4, 7];

      choirIntervals.forEach((semiOffset, idx) => {
        const semi = semitones[semiOffset % semitones.length];
        const cFreq = baseRoot * Math.pow(2, semi / 12);

        const cOsc = ctx.createOscillator();
        const formant1 = ctx.createBiquadFilter();
        const formant2 = ctx.createBiquadFilter();
        const cGain = ctx.createGain();

        cOsc.type = 'sawtooth';
        cOsc.frequency.setValueAtTime(cFreq, choirStart);
        cOsc.detune.setValueAtTime((idx - 1) * 8, choirStart);

        formant1.type = 'bandpass';
        formant1.frequency.setValueAtTime(profile.formantF1 || 540, choirStart);
        formant1.Q.value = 3.5;

        formant2.type = 'peaking';
        formant2.frequency.setValueAtTime(profile.formantF2 || 1520, choirStart);
        formant2.gain.value = 8;

        const cPeak = Math.min(0.18, (eraLevel === 5 ? 0.085 : 0.055) * intensityMult);
        cGain.gain.setValueAtTime(0.001, choirStart);
        cGain.gain.linearRampToValueAtTime(cPeak, choirStart + 0.35);
        cGain.gain.exponentialRampToValueAtTime(0.001, choirStart + choirDur);

        cOsc.connect(formant1);
        formant1.connect(formant2);
        formant2.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(choirStart);
        cOsc.stop(choirStart + choirDur + 0.04);
      });
    }

    // =========================================================================
    // CAMADA 5: Apoteose da Era dos Deuses (Era V) — Trovão + Sinos Dourados
    // =========================================================================
    if (eraLevel === 5) {
      // Estrondo de trovão celestial sincronizado com o clímax da fanfarra
      this.playLightning();
      const bellNotes = [12, 16, 19, 24];
      bellNotes.forEach((semi, bIdx) => {
        const bStart = now + 1.38 + bIdx * 0.14;
        const bFreq = baseRoot * 2 * Math.pow(2, semi / 12);
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bFreq, bStart);

        bGain.gain.setValueAtTime(0.001, bStart);
        bGain.gain.linearRampToValueAtTime(Math.min(0.2, 0.075 * intensityMult), bStart + 0.015);
        bGain.gain.exponentialRampToValueAtTime(0.001, bStart + 1.25);

        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(bStart);
        bOsc.stop(bStart + 1.28);
      });
    }
  }

  public playUnitDeath() {
    if (!this.canPlay('unit_death', 100)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
    gain.gain.setValueAtTime(0.08 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playTaunt(tone = 520) {
    if (!this.canPlay('taunt', 120)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(tone, now);
    osc.frequency.exponentialRampToValueAtTime(tone * 1.35, now + 0.12);
    gain.gain.setValueAtTime(0.08 * scale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }
}

export const soundEngine = new SoundEngine();
