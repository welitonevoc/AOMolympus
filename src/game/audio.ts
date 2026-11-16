import { PantheonId, UnitKind, UnitVoiceAction, UnitVoiceLineInfo } from './types';

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

    if (kind === 'titan') {
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
      kind === 'titan'
        ? 0.52
        : kind === 'minotaur' || kind === 'cyclops'
        ? 0.68
        : kind === 'siege'
        ? 0.62
        : kind === 'ajax'
        ? 0.85
        : kind === 'hero' || kind === 'hoplite'
        ? 0.92
        : kind === 'cavalry'
        ? 0.96
        : kind === 'archer'
        ? 1.08
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

        osc.type = kind === 'titan' || kind === 'minotaur' || kind === 'cyclops' ? 'sawtooth' : 'triangle';
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
