import type {
  FaunaKind,
  GodPowerId,
  UnitKind,
} from '../types';
import type { MythSpecialEffectKind } from '../matchAnalytics';

export type UnderAttackCategory = 'unit' | 'villager' | 'building' | 'town_center';
export type FaunaSoundEvent = 'select' | 'attack' | 'flee' | 'death' | 'capture';
export type BattleWeaponClass =
  | 'blade'
  | 'axe'
  | 'spear'
  | 'cavalry'
  | 'siege'
  | 'myth'
  | 'divine'
  | 'building';

interface SfxBus {
  ctx: AudioContext;
  input: GainNode;
  compressor: DynamicsCompressorNode;
  whiteBuffer: AudioBuffer;
  pinkBuffer: AudioBuffer;
}

/**
 * Mastering-grade WebAudio SFX Engine for Age of Mythology: Retold combat,
 * under-attack warnings, wildlife vocalizations, God Powers (cast & impact),
 * and Myth Creature signature abilities.
 *
 * Zero network dependencies -> strict <2ms synchronous execution.
 */
export class BattleSfxEngine {
  private bus: SfxBus | null = null;
  private cooldowns = new Map<string, number>();

  private canPlay(key: string, minIntervalMs: number): boolean {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const prev = this.cooldowns.get(key) ?? 0;
    if (now - prev < minIntervalMs) return false;
    this.cooldowns.set(key, now);
    return true;
  }

  private ensureBus(ctx: AudioContext): SfxBus {
    if (this.bus && this.bus.ctx === ctx) {
      return this.bus;
    }

    const input = ctx.createGain();
    input.gain.setValueAtTime(1.0, ctx.currentTime);

    // Subtle high-pass clears subsonic DC mud
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(34, ctx.currentTime);

    // Subtle body warmth
    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowshelf';
    warmth.frequency.setValueAtTime(140, ctx.currentTime);
    warmth.gain.setValueAtTime(1.8, ctx.currentTime);

    // Mastering compressor prevents clipping when 80+ units & powers clash
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(5.0, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.14, ctx.currentTime);

    input.connect(highpass);
    highpass.connect(warmth);
    warmth.connect(compressor);
    compressor.connect(ctx.destination);

    // Reusable 1.8s White & Pink Noise buffers
    const rate = ctx.sampleRate;
    const len = Math.max(1, Math.floor(rate * 1.8));
    const whiteBuffer = ctx.createBuffer(1, len, rate);
    const pinkBuffer = ctx.createBuffer(1, len, rate);
    const wData = whiteBuffer.getChannelData(0);
    const pData = pinkBuffer.getChannelData(0);

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      wData[i] = white;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pData[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11));
      b6 = white * 0.115926;
    }

    this.bus = { ctx, input, compressor, whiteBuffer, pinkBuffer };
    return this.bus;
  }

  private playTone(
    bus: SfxBus,
    opts: {
      type?: OscillatorType;
      freqStart: number;
      freqEnd?: number;
      startOffset?: number;
      duration: number;
      peakGain: number;
      attack?: number;
      filterType?: BiquadFilterType;
      filterFreqStart?: number;
      filterFreqEnd?: number;
      filterQ?: number;
      bypassCompressor?: boolean;
    }
  ) {
    const { ctx, input } = bus;
    const t0 = ctx.currentTime + (opts.startOffset ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'triangle';
    osc.frequency.setValueAtTime(Math.max(20, opts.freqStart), t0);
    if (opts.freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), t0 + opts.duration);
    }

    const atk = Math.min(opts.duration * 0.4, opts.attack ?? 0.008);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, opts.peakGain), t0 + atk);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);

    let tail: AudioNode = osc;
    if (opts.filterType) {
      const filt = ctx.createBiquadFilter();
      filt.type = opts.filterType;
      filt.Q.setValueAtTime(opts.filterQ ?? 1.2, t0);
      filt.frequency.setValueAtTime(Math.max(30, opts.filterFreqStart ?? 1200), t0);
      if (opts.filterFreqEnd !== undefined) {
        filt.frequency.exponentialRampToValueAtTime(Math.max(30, opts.filterFreqEnd), t0 + opts.duration);
      }
      tail.connect(filt);
      tail = filt;
    }
    tail.connect(gain);
    gain.connect(opts.bypassCompressor ? ctx.destination : input);
    osc.start(t0);
    osc.stop(t0 + opts.duration + 0.03);
  }

  private playNoise(
    bus: SfxBus,
    opts: {
      pink?: boolean;
      startOffset?: number;
      duration: number;
      peakGain: number;
      attack?: number;
      filterType?: BiquadFilterType;
      filterFreqStart: number;
      filterFreqEnd?: number;
      filterQ?: number;
      playbackRate?: number;
      bypassCompressor?: boolean;
    }
  ) {
    const { ctx, input, whiteBuffer, pinkBuffer } = bus;
    const t0 = ctx.currentTime + (opts.startOffset ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = opts.pink ? pinkBuffer : whiteBuffer;
    src.loop = opts.duration > 1.6;
    if (opts.playbackRate) {
      src.playbackRate.setValueAtTime(opts.playbackRate, t0);
    }

    const filt = ctx.createBiquadFilter();
    filt.type = opts.filterType ?? 'bandpass';
    filt.Q.setValueAtTime(opts.filterQ ?? 1.0, t0);
    filt.frequency.setValueAtTime(Math.max(40, opts.filterFreqStart), t0);
    if (opts.filterFreqEnd !== undefined) {
      filt.frequency.exponentialRampToValueAtTime(Math.max(40, opts.filterFreqEnd), t0 + opts.duration);
    }

    const gain = ctx.createGain();
    const atk = Math.min(opts.duration * 0.4, opts.attack ?? 0.01);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, opts.peakGain), t0 + atk);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);

    src.connect(filt);
    filt.connect(gain);
    gain.connect(opts.bypassCompressor ? ctx.destination : input);
    const randStart = Math.random() * 0.65;
    src.start(t0, randStart);
    src.stop(t0 + opts.duration + 0.03);
  }

  // ============================================================================
  // 1. ZERO-LATENCY TACTICAL CLICK / ORDER ACKNOWLEDGEMENTS
  // ============================================================================
  public playInstantCommandCue(
    ctx: AudioContext,
    scale: number,
    action: 'select' | 'move' | 'attack' | 'work'
  ) {
    if (scale <= 0) return;
    const bus = this.ensureBus(ctx);
    const vol = Math.min(1.2, scale);

    if (action === 'select') {
      if (!this.canPlay('inst_select', 60)) return;
      // Crisp bronze/marble selection chime
      this.playTone(bus, {
        type: 'triangle',
        freqStart: 540,
        freqEnd: 790,
        duration: 0.065,
        peakGain: 0.065 * vol,
        attack: 0.003,
      });
      this.playTone(bus, {
        type: 'sine',
        freqStart: 1080,
        freqEnd: 1280,
        duration: 0.045,
        peakGain: 0.025 * vol,
        attack: 0.002,
      });
    } else if (action === 'attack') {
      if (!this.canPlay('inst_attack', 75)) return;
      // Instant AoM attack click: sharp blade-unsheathe ring + low martial thud
      this.playNoise(bus, {
        filterType: 'bandpass',
        filterFreqStart: 3200,
        filterFreqEnd: 5200,
        filterQ: 4.2,
        duration: 0.075,
        peakGain: 0.08 * vol,
        attack: 0.003,
      });
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: 240,
        freqEnd: 130,
        duration: 0.07,
        peakGain: 0.055 * vol,
        attack: 0.003,
        filterType: 'lowpass',
        filterFreqStart: 1100,
      });
    } else if (action === 'work') {
      if (!this.canPlay('inst_work', 75)) return;
      // Crisp wood/stone tool confirmation double-tap
      this.playTone(bus, {
        type: 'triangle',
        freqStart: 420,
        freqEnd: 290,
        duration: 0.055,
        peakGain: 0.055 * vol,
        attack: 0.003,
      });
      this.playTone(bus, {
        type: 'sine',
        freqStart: 620,
        freqEnd: 740,
        startOffset: 0.028,
        duration: 0.05,
        peakGain: 0.04 * vol,
        attack: 0.003,
      });
    } else {
      if (!this.canPlay('inst_move', 75)) return;
      // Classic RTS move confirmation thump + subtle brass click
      this.playTone(bus, {
        type: 'sine',
        freqStart: 360,
        freqEnd: 220,
        duration: 0.065,
        peakGain: 0.06 * vol,
        attack: 0.003,
      });
      this.playNoise(bus, {
        pink: true,
        filterType: 'bandpass',
        filterFreqStart: 1600,
        filterQ: 1.8,
        duration: 0.035,
        peakGain: 0.035 * vol,
        attack: 0.002,
      });
    }
  }

  // ============================================================================
  // 2. BATTLE AUDIO (WEAPONS, SHIELDS, SIEGE, PROJECTILES, DEATHS & CLASHES)
  // ============================================================================
  public playBattleHit(
    ctx: AudioContext,
    scale: number,
    weapon: BattleWeaponClass = 'blade',
    atten = 1.0,
    isHeroOrMyth = false
  ) {
    if (scale <= 0 || atten <= 0.06) return;
    if (!this.canPlay(`hit_${weapon}`, weapon === 'siege' ? 95 : 58)) return;
    const bus = this.ensureBus(ctx);
    const v = scale * Math.min(1.0, Math.max(0.1, atten)) * (isHeroOrMyth ? 1.15 : 1.0);
    const pitchJitter = 0.9 + Math.random() * 0.22;

    if (weapon === 'siege' || weapon === 'building') {
      // Heavy timber/stone smash + deep sub thump
      this.playTone(bus, {
        type: 'triangle',
        freqStart: 135 * pitchJitter,
        freqEnd: 38,
        duration: 0.26,
        peakGain: 0.18 * v,
        attack: 0.005,
      });
      this.playNoise(bus, {
        pink: true,
        filterType: 'lowpass',
        filterFreqStart: 1500,
        filterFreqEnd: 260,
        duration: 0.24,
        peakGain: 0.16 * v,
        attack: 0.006,
      });
      this.playNoise(bus, {
        filterType: 'bandpass',
        filterFreqStart: 2200 * pitchJitter,
        filterQ: 2.2,
        duration: 0.12,
        peakGain: 0.075 * v,
      });
      return;
    }

    if (weapon === 'cavalry') {
      // Heavy lance pierce + shield knock
      this.playTone(bus, {
        type: 'sine',
        freqStart: 185 * pitchJitter,
        freqEnd: 58,
        duration: 0.14,
        peakGain: 0.13 * v,
        attack: 0.004,
      });
      this.playNoise(bus, {
        filterType: 'bandpass',
        filterFreqStart: 2600 * pitchJitter,
        filterFreqEnd: 1100,
        filterQ: 2.4,
        duration: 0.11,
        peakGain: 0.09 * v,
      });
      return;
    }

    if (weapon === 'axe') {
      // Heavy cleave + wooden shield crunch
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: 210 * pitchJitter,
        freqEnd: 68,
        duration: 0.15,
        peakGain: 0.11 * v,
        filterType: 'lowpass',
        filterFreqStart: 1200,
      });
      this.playNoise(bus, {
        filterType: 'bandpass',
        filterFreqStart: 1950 * pitchJitter,
        filterFreqEnd: 780,
        filterQ: 2.8,
        duration: 0.13,
        peakGain: 0.105 * v,
      });
      return;
    }

    if (weapon === 'myth' || weapon === 'divine') {
      // Heavy resonant impact + mythic energy crackle
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: (weapon === 'divine' ? 320 : 160) * pitchJitter,
        freqEnd: 46,
        duration: 0.22,
        peakGain: 0.14 * v,
        filterType: 'lowpass',
        filterFreqStart: 1800,
      });
      this.playNoise(bus, {
        filterType: 'bandpass',
        filterFreqStart: 2900 * pitchJitter,
        filterFreqEnd: 620,
        filterQ: 1.8,
        duration: 0.18,
        peakGain: 0.11 * v,
      });
      return;
    }

    // Default 'blade' or 'spear': crisp bronze/iron sword clang + shield wood thud
    this.playNoise(bus, {
      filterType: 'bandpass',
      filterFreqStart: (weapon === 'spear' ? 3400 : 2500) * pitchJitter,
      filterFreqEnd: 1200,
      filterQ: 5.5,
      duration: 0.12,
      peakGain: 0.095 * v,
      attack: 0.002,
    });
    this.playTone(bus, {
      type: 'triangle',
      freqStart: (weapon === 'spear' ? 2400 : 1920) * pitchJitter,
      freqEnd: 1450 * pitchJitter,
      duration: 0.1,
      peakGain: 0.032 * v,
      attack: 0.002,
    });
    this.playTone(bus, {
      type: 'sine',
      freqStart: 170 * pitchJitter,
      freqEnd: 62,
      duration: 0.085,
      peakGain: 0.08 * v,
      attack: 0.003,
    });
  }

  public playProjectileLaunch(
    ctx: AudioContext,
    scale: number,
    opts: {
      isBoulder?: boolean;
      isFireball?: boolean;
      isPetrify?: boolean;
      isFireArrow?: boolean;
      isTurret?: boolean;
      atten?: number;
    } = {}
  ) {
    const atten = opts.atten ?? 1.0;
    if (scale <= 0 || atten <= 0.06) return;
    const key = opts.isBoulder
      ? 'proj_boulder'
      : opts.isFireball
      ? 'proj_fire'
      : opts.isPetrify
      ? 'proj_petrify'
      : 'proj_arrow';
    if (!this.canPlay(key, opts.isBoulder ? 110 : 65)) return;

    const bus = this.ensureBus(ctx);
    const v = scale * Math.min(1.0, Math.max(0.1, atten));
    const jitter = 0.92 + Math.random() * 0.16;

    if (opts.isBoulder) {
      // Catapult arm snap + heavy stone whoosh
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: 165 * jitter,
        freqEnd: 52,
        duration: 0.24,
        peakGain: 0.12 * v,
        filterType: 'lowpass',
        filterFreqStart: 750,
      });
      this.playNoise(bus, {
        pink: true,
        filterType: 'bandpass',
        filterFreqStart: 640,
        filterFreqEnd: 240,
        filterQ: 1.2,
        duration: 0.28,
        peakGain: 0.13 * v,
      });
      return;
    }

    if (opts.isFireball || opts.isFireArrow) {
      // Fiery ignition whoosh
      this.playNoise(bus, {
        pink: true,
        filterType: 'bandpass',
        filterFreqStart: 1100 * jitter,
        filterFreqEnd: 420,
        filterQ: 1.1,
        duration: opts.isFireball ? 0.24 : 0.14,
        peakGain: (opts.isFireball ? 0.13 : 0.08) * v,
      });
      this.playTone(bus, {
        type: 'triangle',
        freqStart: 540 * jitter,
        freqEnd: 180,
        duration: 0.1,
        peakGain: 0.045 * v,
      });
      return;
    }

    if (opts.isPetrify) {
      // Mystical beam whistle
      this.playTone(bus, {
        type: 'sine',
        freqStart: 1120 * jitter,
        freqEnd: 480,
        duration: 0.18,
        peakGain: 0.07 * v,
      });
      this.playNoise(bus, {
        filterType: 'bandpass',
        filterFreqStart: 3200,
        filterFreqEnd: 1400,
        filterQ: 3.0,
        duration: 0.14,
        peakGain: 0.045 * v,
      });
      return;
    }

    // Crisp bowstring snap + arrow air whistle
    this.playTone(bus, {
      type: 'triangle',
      freqStart: (opts.isTurret ? 560 : 720) * jitter,
      freqEnd: 210,
      duration: 0.075,
      peakGain: 0.055 * v,
      attack: 0.002,
    });
    this.playNoise(bus, {
      filterType: 'bandpass',
      filterFreqStart: 4200 * jitter,
      filterFreqEnd: 1900,
      filterQ: 2.2,
      duration: 0.085,
      peakGain: 0.048 * v,
      attack: 0.003,
    });
  }

  public playProjectileImpact(
    ctx: AudioContext,
    scale: number,
    opts: {
      isBoulder?: boolean;
      isFireball?: boolean;
      isPetrify?: boolean;
      isBuilding?: boolean;
      atten?: number;
    } = {}
  ) {
    const atten = opts.atten ?? 1.0;
    if (scale <= 0 || atten <= 0.06) return;
    const key = opts.isBoulder
      ? 'imp_boulder'
      : opts.isFireball
      ? 'imp_fire'
      : opts.isPetrify
      ? 'imp_petrify'
      : 'imp_arrow';
    if (!this.canPlay(key, opts.isBoulder || opts.isFireball ? 85 : 55)) return;

    const bus = this.ensureBus(ctx);
    const v = scale * Math.min(1.0, Math.max(0.1, atten));

    if (opts.isBoulder) {
      // Earth-shattering boulder crash + rock crumble
      this.playTone(bus, {
        type: 'sine',
        freqStart: 120,
        freqEnd: 32,
        duration: 0.34,
        peakGain: 0.22 * v,
        attack: 0.004,
      });
      this.playNoise(bus, {
        pink: true,
        filterType: 'lowpass',
        filterFreqStart: 2100,
        filterFreqEnd: 220,
        duration: 0.36,
        peakGain: 0.2 * v,
      });
      return;
    }

    if (opts.isFireball) {
      // Flame burst boom + sizzle
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: 165,
        freqEnd: 42,
        duration: 0.24,
        peakGain: 0.16 * v,
        filterType: 'lowpass',
        filterFreqStart: 620,
      });
      this.playNoise(bus, {
        filterType: 'bandpass',
        filterFreqStart: 1600,
        filterFreqEnd: 420,
        filterQ: 0.9,
        duration: 0.28,
        peakGain: 0.14 * v,
      });
      return;
    }

    if (opts.isPetrify) {
      // Stone petrification crackle
      this.playNoise(bus, {
        filterType: 'highpass',
        filterFreqStart: 1900,
        duration: 0.16,
        peakGain: 0.1 * v,
      });
      this.playTone(bus, {
        type: 'triangle',
        freqStart: 880,
        freqEnd: 310,
        duration: 0.15,
        peakGain: 0.075 * v,
      });
      return;
    }

    // Arrow impact on flesh/armor/wood
    this.playTone(bus, {
      type: 'sine',
      freqStart: opts.isBuilding ? 220 : 160,
      freqEnd: 65,
      duration: 0.07,
      peakGain: 0.068 * v,
      attack: 0.002,
    });
    this.playNoise(bus, {
      filterType: 'bandpass',
      filterFreqStart: opts.isBuilding ? 1500 : 2400,
      filterFreqEnd: 700,
      filterQ: 2.0,
      duration: 0.065,
      peakGain: 0.055 * v,
    });
  }

  public playBuildingCollapse(ctx: AudioContext, scale: number, radius = 3.0, atten = 1.0) {
    if (scale <= 0 || atten <= 0.05) return;
    if (!this.canPlay('bldg_collapse', 260)) return;
    const bus = this.ensureBus(ctx);
    const v = scale * Math.min(1.0, Math.max(0.15, atten)) * Math.min(1.25, 0.85 + radius * 0.08);

    // Deep masonry collapse rumble + falling beams
    this.playTone(bus, {
      type: 'sawtooth',
      freqStart: 95,
      freqEnd: 28,
      duration: 0.72,
      peakGain: 0.24 * v,
      filterType: 'lowpass',
      filterFreqStart: 320,
      filterFreqEnd: 90,
    });
    this.playNoise(bus, {
      pink: true,
      filterType: 'lowpass',
      filterFreqStart: 1800,
      filterFreqEnd: 190,
      duration: 0.85,
      peakGain: 0.22 * v,
    });
    // Secondary crash bursts
    for (let i = 0; i < 3; i++) {
      this.playNoise(bus, {
        startOffset: 0.12 + i * 0.16,
        filterType: 'bandpass',
        filterFreqStart: 1200 - i * 240,
        filterQ: 1.5,
        duration: 0.18,
        peakGain: 0.12 * v,
      });
    }
  }

  public playUnitDeathDetailed(
    ctx: AudioContext,
    scale: number,
    opts: { isMythic?: boolean; isNaval?: boolean; isHeroOrGod?: boolean; atten?: number } = {}
  ) {
    const atten = opts.atten ?? 1.0;
    if (scale <= 0 || atten <= 0.08) return;
    if (!this.canPlay('unit_death', 130)) return;
    const bus = this.ensureBus(ctx);
    const v = scale * Math.min(1.0, Math.max(0.12, atten));

    if (opts.isNaval) {
      // Ship hull crack + water splash sinking
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: 140,
        freqEnd: 44,
        duration: 0.36,
        peakGain: 0.15 * v,
        filterType: 'lowpass',
        filterFreqStart: 500,
      });
      this.playNoise(bus, {
        pink: true,
        filterType: 'bandpass',
        filterFreqStart: 950,
        filterFreqEnd: 280,
        duration: 0.45,
        peakGain: 0.16 * v,
      });
      return;
    }

    if (opts.isMythic || opts.isHeroOrGod) {
      // Dramatic mythic vanquish roar + ethereal shimmer
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: 220,
        freqEnd: 52,
        duration: 0.42,
        peakGain: 0.14 * v,
        filterType: 'lowpass',
        filterFreqStart: 1400,
        filterFreqEnd: 180,
      });
      this.playNoise(bus, {
        pink: true,
        filterType: 'bandpass',
        filterFreqStart: 1800,
        filterFreqEnd: 320,
        duration: 0.38,
        peakGain: 0.12 * v,
      });
      return;
    }

    // Soldier armored fall + low groan/thud
    this.playTone(bus, {
      type: 'triangle',
      freqStart: 195 + Math.random() * 40,
      freqEnd: 72,
      duration: 0.22,
      peakGain: 0.085 * v,
    });
    this.playNoise(bus, {
      filterType: 'bandpass',
      filterFreqStart: 2100,
      filterFreqEnd: 800,
      filterQ: 2.5,
      duration: 0.12,
      peakGain: 0.065 * v,
      startOffset: 0.04,
    });
  }

  public playBattleClashAmbience(ctx: AudioContext, scale: number, activeCount: number) {
    if (scale <= 0 || activeCount < 4) return;
    if (!this.canPlay('battle_clash_amb', 680)) return;
    const bus = this.ensureBus(ctx);
    const intensity = Math.min(1.0, (activeCount - 2) / 14);
    const v = scale * (0.35 + intensity * 0.65);

    // 2-3 staggered distant blade clashes + war drum pulse
    const hits = activeCount >= 10 ? 3 : 2;
    for (let i = 0; i < hits; i++) {
      const off = i * (0.09 + Math.random() * 0.08);
      this.playNoise(bus, {
        startOffset: off,
        filterType: 'bandpass',
        filterFreqStart: 2400 + Math.random() * 1400,
        filterFreqEnd: 1100,
        filterQ: 4.5,
        duration: 0.09,
        peakGain: 0.055 * v,
      });
    }
  }

  // ============================================================================
  // 3. UNDER-ATTACK WARNING ALARM (UNIDADES, ALDEÕES & CONSTRUÇÕES)
  // ============================================================================
  public playUnderAttackWarning(
    ctx: AudioContext,
    scale: number,
    category: UnderAttackCategory = 'unit'
  ) {
    if (scale <= 0) return;
    // Global minimum spacing so warnings stay clear & dignified, plus per-category cadence
    if (!this.canPlay('under_attack_global', 2600)) return;
    const catCd =
      category === 'town_center' || category === 'villager'
        ? 5200
        : category === 'building'
        ? 6200
        : 7400;
    if (!this.canPlay(`under_attack_${category}`, catCd)) return;

    const bus = this.ensureBus(ctx);
    const v = Math.min(1.25, scale);

    if (category === 'town_center' || category === 'villager') {
      // Urgent Age of Mythology Town-Under-Attack double bronze horn + sharp snare strike!
      const notes = [392.0, 523.25, 392.0, 587.33];
      notes.forEach((freq, idx) => {
        const off = idx * 0.135;
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: freq,
          freqEnd: freq * 0.99,
          startOffset: off,
          duration: idx === notes.length - 1 ? 0.36 : 0.13,
          peakGain: 0.11 * v,
          attack: 0.012,
          filterType: 'lowpass',
          filterFreqStart: 2400,
          filterFreqEnd: 1400,
        });
      });
      // Martial alert drum hits
      for (let d = 0; d < 2; d++) {
        this.playTone(bus, {
          type: 'sine',
          freqStart: 130,
          freqEnd: 46,
          startOffset: d * 0.27,
          duration: 0.16,
          peakGain: 0.15 * v,
          attack: 0.004,
        });
        this.playNoise(bus, {
          startOffset: d * 0.27,
          filterType: 'highpass',
          filterFreqStart: 1800,
          duration: 0.08,
          peakGain: 0.075 * v,
        });
      }
      return;
    }

    if (category === 'building') {
      // Deep fortress siege horn + metallic bell alarm
      [220, 293.66].forEach((freq, idx) => {
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: freq,
          freqEnd: freq * 0.985,
          startOffset: idx * 0.16,
          duration: 0.34,
          peakGain: 0.115 * v,
          attack: 0.018,
          filterType: 'lowpass',
          filterFreqStart: 1900,
        });
      });
      this.playTone(bus, {
        type: 'triangle',
        freqStart: 784,
        freqEnd: 778,
        startOffset: 0.05,
        duration: 0.4,
        peakGain: 0.06 * v,
      });
      return;
    }

    // Standard army unit skirmish warning horn (A3 -> E4 crisp brass alert)
    [220.0, 329.63].forEach((freq, idx) => {
      this.playTone(bus, {
        type: 'sawtooth',
        freqStart: freq,
        freqEnd: freq * 0.99,
        startOffset: idx * 0.11,
        duration: idx === 1 ? 0.28 : 0.11,
        peakGain: 0.095 * v,
        attack: 0.012,
        filterType: 'lowpass',
        filterFreqStart: 2000,
        filterFreqEnd: 1150,
      });
    });
    this.playTone(bus, {
      type: 'sine',
      freqStart: 120,
      freqEnd: 48,
      duration: 0.13,
      peakGain: 0.11 * v,
    });
  }

  // ============================================================================
  // 4. ALL 31 WILDLIFE / FAUNA ANIMAL SOUNDS
  // ============================================================================
  public playFaunaSound(
    ctx: AudioContext,
    scale: number,
    kind: FaunaKind,
    event: FaunaSoundEvent = 'select',
    atten = 1.0
  ) {
    if (scale <= 0 || atten <= 0.08) return;
    const cd = event === 'select' ? 180 : event === 'capture' ? 240 : 320;
    if (!this.canPlay(`fauna_${kind}_${event}`, cd)) return;

    const bus = this.ensureBus(ctx);
    const v = scale * Math.min(1.0, Math.max(0.15, atten));
    const jitter = 0.94 + Math.random() * 0.12;
    const isAggro = event === 'attack';
    const isDeath = event === 'death';

    // Capture chime overlay for herdables
    if (event === 'capture') {
      this.playTone(bus, {
        type: 'triangle',
        freqStart: 523.25,
        freqEnd: 659.25,
        duration: 0.16,
        peakGain: 0.075 * v,
      });
      this.playTone(bus, {
        type: 'sine',
        freqStart: 783.99,
        startOffset: 0.07,
        duration: 0.22,
        peakGain: 0.065 * v,
      });
    }

    switch (kind) {
      // Large bovines: deep nasal moo / bellow
      case 'cow':
      case 'aurochs':
      case 'yak':
      case 'musk_ox': {
        const base = kind === 'cow' ? 128 : 108;
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: (isDeath ? base * 0.95 : base) * jitter,
          freqEnd: (isDeath ? base * 0.62 : isAggro ? base * 1.25 : base * 0.86) * jitter,
          duration: isDeath ? 0.55 : 0.48,
          peakGain: 0.12 * v,
          attack: 0.04,
          filterType: 'bandpass',
          filterFreqStart: 420,
          filterFreqEnd: 310,
          filterQ: 2.2,
        });
        break;
      }

      // Goats / gazelle / deer / moose / reindeer: nasal bleat or bugle call
      case 'goat':
      case 'gazelle':
      case 'deer':
      case 'reindeer':
      case 'moose': {
        const base = kind === 'moose' ? 155 : kind === 'goat' ? 290 : 340;
        const pulses = kind === 'goat' ? 2 : 1;
        for (let i = 0; i < pulses; i++) {
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: i * 0.14,
            freqStart: base * jitter,
            freqEnd: (isDeath ? base * 0.65 : base * 0.88) * jitter,
            duration: kind === 'goat' ? 0.13 : 0.28,
            peakGain: 0.09 * v,
            attack: 0.015,
            filterType: 'bandpass',
            filterFreqStart: 1250,
            filterFreqEnd: 820,
            filterQ: 3.0,
          });
        }
        break;
      }

      // Pigs & fierce boars: guttural oink / angry tusk squeal
      case 'pig':
      case 'boar': {
        const base = kind === 'boar' ? 135 : 185;
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: base * jitter,
          freqEnd: (isAggro ? base * 2.1 : isDeath ? base * 2.6 : base * 1.25) * jitter,
          duration: isAggro || isDeath ? 0.32 : 0.19,
          peakGain: 0.105 * v,
          filterType: 'bandpass',
          filterFreqStart: 780,
          filterFreqEnd: isAggro ? 1550 : 650,
          filterQ: 2.6,
        });
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 600,
          filterQ: 3.5,
          duration: 0.16,
          peakGain: 0.075 * v,
        });
        break;
      }

      // Poultry: turkey gobble / chicken cluck
      case 'turkey':
      case 'chicken': {
        const steps = kind === 'turkey' ? 4 : 3;
        for (let i = 0; i < steps; i++) {
          const f = (kind === 'turkey' ? 380 : 640) * (1 + (i % 2) * 0.22) * jitter;
          this.playTone(bus, {
            type: 'triangle',
            startOffset: i * 0.068,
            freqStart: f,
            freqEnd: f * 0.78,
            duration: 0.06,
            peakGain: 0.08 * v,
            attack: 0.006,
            filterType: 'bandpass',
            filterFreqStart: 1700,
            filterQ: 2.5,
          });
        }
        break;
      }

      // Capybara: gentle wet chirp-grunt
      case 'capybara': {
        this.playTone(bus, {
          type: 'sine',
          freqStart: 420 * jitter,
          freqEnd: 290,
          duration: 0.12,
          peakGain: 0.08 * v,
        });
        this.playTone(bus, {
          type: 'triangle',
          startOffset: 0.08,
          freqStart: 210,
          freqEnd: 165,
          duration: 0.1,
          peakGain: 0.06 * v,
        });
        break;
      }

      // Zebra / camel / giraffe: equine bray or low grumble
      case 'zebra':
      case 'camel':
      case 'giraffe': {
        const f = kind === 'zebra' ? 410 : kind === 'camel' ? 145 : 120;
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: f * jitter,
          freqEnd: (kind === 'zebra' ? f * 0.7 : f * 0.85) * jitter,
          duration: 0.32,
          peakGain: 0.095 * v,
          filterType: 'bandpass',
          filterFreqStart: kind === 'zebra' ? 1350 : 520,
          filterQ: 2.2,
        });
        break;
      }

      // Giant pachyderms / rhino / hippo: brassy elephant trumpet or low earth grumble
      case 'elephant_wild':
      case 'rhino':
      case 'hippo': {
        if (kind === 'elephant_wild') {
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: 270 * jitter,
            freqEnd: (isDeath ? 140 : 620) * jitter,
            duration: 0.44,
            peakGain: 0.14 * v,
            attack: 0.035,
            filterType: 'bandpass',
            filterFreqStart: 950,
            filterFreqEnd: isDeath ? 420 : 1850,
            filterQ: 2.4,
          });
        } else {
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: 92 * jitter,
            freqEnd: 58,
            duration: 0.36,
            peakGain: 0.13 * v,
            filterType: 'lowpass',
            filterFreqStart: 480,
          });
          this.playNoise(bus, {
            pink: true,
            filterType: 'lowpass',
            filterFreqStart: 560,
            duration: 0.28,
            peakGain: 0.1 * v,
          });
        }
        break;
      }

      // Wolf & hyena: haunting howl / cackle-yip
      case 'wolf':
      case 'hyena': {
        if (kind === 'hyena') {
          for (let i = 0; i < 3; i++) {
            this.playTone(bus, {
              type: 'sawtooth',
              startOffset: i * 0.09,
              freqStart: (420 + i * 75) * jitter,
              freqEnd: 680 * jitter,
              duration: 0.08,
              peakGain: 0.09 * v,
              filterType: 'bandpass',
              filterFreqStart: 1450,
              filterQ: 3.0,
            });
          }
        } else {
          this.playTone(bus, {
            type: 'triangle',
            freqStart: (isAggro ? 340 : 280) * jitter,
            freqEnd: isDeath ? 145 : isAggro ? 520 : 440,
            duration: isAggro ? 0.28 : 0.56,
            peakGain: 0.115 * v,
            attack: 0.04,
            filterType: 'bandpass',
            filterFreqStart: 900,
            filterFreqEnd: 1150,
            filterQ: 2.5,
          });
        }
        break;
      }

      // Big cats & bears: chest roar / snarl
      case 'bear':
      case 'lion':
      case 'tiger': {
        const f0 = kind === 'bear' ? 88 : kind === 'lion' ? 112 : 126;
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: f0 * jitter,
          freqEnd: (isDeath ? f0 * 0.55 : f0 * 0.78) * jitter,
          duration: isDeath ? 0.5 : 0.38,
          peakGain: 0.145 * v,
          attack: 0.025,
          filterType: 'lowpass',
          filterFreqStart: isAggro ? 1400 : 880,
          filterFreqEnd: 320,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: isAggro ? 920 : 620,
          filterFreqEnd: 280,
          filterQ: 1.5,
          duration: 0.34,
          peakGain: 0.125 * v,
        });
        break;
      }

      // Reptiles: menacing hiss + jaw snap
      case 'crocodile':
      case 'alligator': {
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 2800,
          filterFreqEnd: 1100,
          filterQ: 2.2,
          duration: 0.28,
          peakGain: 0.1 * v,
        });
        if (isAggro) {
          // Sharp jaw snap
          this.playTone(bus, {
            type: 'triangle',
            startOffset: 0.04,
            freqStart: 260,
            freqEnd: 75,
            duration: 0.075,
            peakGain: 0.13 * v,
          });
        }
        break;
      }

      // Baboon (Set animal): sharp primate bark-bark
      case 'baboon': {
        for (let i = 0; i < 2; i++) {
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: i * 0.11,
            freqStart: 390 * jitter,
            freqEnd: 210,
            duration: 0.095,
            peakGain: 0.1 * v,
            filterType: 'bandpass',
            filterFreqStart: 1350,
            filterQ: 2.8,
          });
        }
        break;
      }

      // Aquatic creatures: dolphin whistle+clicks, whale oceanic song, turtle water splash
      case 'dolphin': {
        this.playTone(bus, {
          type: 'sine',
          freqStart: 1450 * jitter,
          freqEnd: 2450 * jitter,
          duration: 0.22,
          peakGain: 0.085 * v,
          attack: 0.02,
        });
        this.playTone(bus, {
          type: 'sine',
          startOffset: 0.14,
          freqStart: 2200 * jitter,
          freqEnd: 1750,
          duration: 0.14,
          peakGain: 0.065 * v,
        });
        break;
      }

      case 'whale': {
        this.playTone(bus, {
          type: 'sine',
          freqStart: 165 * jitter,
          freqEnd: 92,
          duration: 0.78,
          peakGain: 0.14 * v,
          attack: 0.12,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: 680,
          filterFreqEnd: 240,
          duration: 0.45,
          peakGain: 0.08 * v,
        });
        break;
      }

      case 'sea_turtle':
      default: {
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: 980,
          filterFreqEnd: 320,
          duration: 0.26,
          peakGain: 0.09 * v,
        });
        break;
      }
    }
  }

  // ============================================================================
  // 5. ALL 30 GOD POWERS — CAST & ELEMENTAL IMPACT SOUNDSCAPES
  // ============================================================================
  public playGodPowerSound(
    ctx: AudioContext,
    scale: number,
    id: GodPowerId,
    phase: 'cast' | 'impact' = 'impact'
  ) {
    if (scale <= 0) return;
    if (!this.canPlay(`gp_${id}_${phase}`, 160)) return;
    const bus = this.ensureBus(ctx);
    const v = Math.min(1.25, scale);

    if (phase === 'cast') {
      // Celestial divine summoning swell on activation
      const isDark =
        id === 'darkest_night' ||
        id === 'necromancy' ||
        id === 'black_hole' ||
        id === 'disease' ||
        id === 'pestilence' ||
        id === 'spiders' ||
        id === 'chaos';
      const chord = isDark ? [146.83, 174.61, 219.9] : [261.63, 329.63, 392.0, 523.25];
      chord.forEach((f, idx) => {
        this.playTone(bus, {
          type: isDark ? 'sawtooth' : 'triangle',
          startOffset: idx * 0.04,
          freqStart: f,
          freqEnd: f * 1.01,
          duration: 0.48,
          peakGain: 0.065 * v,
          attack: 0.025,
          filterType: 'lowpass',
          filterFreqStart: isDark ? 1200 : 2800,
        });
      });
      return;
    }

    // Impact / Elemental Resolution per God Power
    switch (id) {
      case 'lightning':
      case 'lightning_storm': {
        const bolts = id === 'lightning_storm' ? 4 : 1;
        for (let b = 0; b < bolts; b++) {
          const off = b * 0.14;
          // Electric arc crack
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: off,
            freqStart: 1900 - b * 140,
            freqEnd: 110,
            duration: 0.14,
            peakGain: 0.14 * v,
            attack: 0.002,
          });
          // Thunderclap + rolling echo
          this.playNoise(bus, {
            startOffset: off + 0.015,
            filterType: 'lowpass',
            filterFreqStart: 3600,
            filterFreqEnd: 140,
            duration: id === 'lightning_storm' ? 0.65 : 0.78,
            peakGain: 0.24 * v,
            attack: 0.004,
          });
        }
        this.playTone(bus, {
          type: 'sine',
          freqStart: 92,
          freqEnd: 30,
          duration: 0.7,
          peakGain: 0.22 * v,
        });
        break;
      }

      case 'solar_beam': {
        // Blinding Ra solar beam descent + scorching blast
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 880,
          freqEnd: 220,
          duration: 0.45,
          peakGain: 0.14 * v,
          filterType: 'bandpass',
          filterFreqStart: 2200,
          filterFreqEnd: 650,
          filterQ: 2.0,
        });
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 2400,
          filterFreqEnd: 400,
          duration: 0.55,
          peakGain: 0.19 * v,
        });
        this.playTone(bus, {
          type: 'sine',
          startOffset: 0.08,
          freqStart: 140,
          freqEnd: 42,
          duration: 0.45,
          peakGain: 0.2 * v,
        });
        break;
      }

      case 'meteor':
      case 'volcanic_eruption': {
        // Atmospheric whistle + multiple seismic detonations + bubbling lava hiss
        this.playTone(bus, {
          type: 'sine',
          freqStart: 980,
          freqEnd: 190,
          duration: 0.26,
          peakGain: 0.09 * v,
        });
        const blasts = id === 'volcanic_eruption' ? 3 : 2;
        for (let i = 0; i < blasts; i++) {
          const off = 0.14 + i * 0.2;
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: off,
            freqStart: 120 - i * 12,
            freqEnd: 26,
            duration: 0.58,
            peakGain: 0.24 * v,
            filterType: 'lowpass',
            filterFreqStart: 440,
          });
          this.playNoise(bus, {
            pink: true,
            startOffset: off,
            filterType: 'lowpass',
            filterFreqStart: 1900,
            filterFreqEnd: 160,
            duration: 0.65,
            peakGain: 0.24 * v,
          });
        }
        break;
      }

      case 'frost':
      case 'blizzard': {
        // Polar wind howl + sharp crystalline freeze shatters
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 1600,
          filterFreqEnd: 520,
          filterQ: 3.2,
          duration: id === 'blizzard' ? 0.95 : 0.7,
          peakGain: 0.16 * v,
        });
        [1760, 2349, 3136, 1396].forEach((f, i) => {
          this.playTone(bus, {
            type: 'triangle',
            startOffset: i * 0.075,
            freqStart: f,
            freqEnd: f * 0.92,
            duration: 0.24,
            peakGain: 0.075 * v,
          });
        });
        break;
      }

      case 'tornado': {
        // Roaring cyclonic wind vortex + spinning debris impacts
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: 320,
          filterFreqEnd: 1350,
          filterQ: 2.2,
          duration: 1.05,
          peakGain: 0.22 * v,
          attack: 0.08,
        });
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 95,
          freqEnd: 210,
          duration: 0.9,
          peakGain: 0.11 * v,
          filterType: 'lowpass',
          filterFreqStart: 500,
        });
        break;
      }

      case 'tremor':
      case 'undermine': {
        // Deep sub-earth fracture + collapsing foundations
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 78,
          freqEnd: 24,
          duration: 0.85,
          peakGain: 0.25 * v,
          filterType: 'lowpass',
          filterFreqStart: 280,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'lowpass',
          filterFreqStart: 1400,
          filterFreqEnd: 150,
          duration: 0.9,
          peakGain: 0.23 * v,
        });
        if (id === 'undermine') {
          for (let i = 0; i < 3; i++) {
            this.playNoise(bus, {
              startOffset: 0.15 + i * 0.18,
              filterType: 'bandpass',
              filterFreqStart: 980,
              filterQ: 1.6,
              duration: 0.2,
              peakGain: 0.14 * v,
            });
          }
        }
        break;
      }

      case 'prosperity':
      case 'create_gold': {
        // Golden shimmer arpeggio + metallic treasure clink
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, idx) => {
          this.playTone(bus, {
            type: 'triangle',
            startOffset: idx * 0.065,
            freqStart: f,
            duration: 0.36,
            peakGain: 0.08 * v,
          });
        });
        if (id === 'create_gold') {
          this.playTone(bus, {
            type: 'sine',
            freqStart: 110,
            freqEnd: 38,
            duration: 0.35,
            peakGain: 0.16 * v,
          });
        }
        break;
      }

      case 'healing':
      case 'restoration': {
        // Radiant sacred harp cascade + warm angelic pad
        [392.0, 493.88, 587.33, 783.99, 987.77].forEach((f, idx) => {
          this.playTone(bus, {
            type: 'sine',
            startOffset: idx * 0.08,
            freqStart: f,
            duration: 0.55,
            peakGain: 0.085 * v,
            attack: 0.02,
          });
        });
        break;
      }

      case 'rain': {
        // Distant thunder + gentle rainfall hiss
        this.playTone(bus, {
          type: 'sine',
          freqStart: 95,
          freqEnd: 38,
          duration: 0.65,
          peakGain: 0.14 * v,
          attack: 0.05,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: 2600,
          filterFreqEnd: 1600,
          filterQ: 0.7,
          duration: 1.1,
          peakGain: 0.13 * v,
          attack: 0.12,
        });
        break;
      }

      case 'flaming_weapons': {
        // Fire ignition blast + ringing forged blades
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 1200,
          filterFreqEnd: 420,
          duration: 0.45,
          peakGain: 0.17 * v,
        });
        [1480, 2120, 2740].forEach((f, i) => {
          this.playTone(bus, {
            type: 'triangle',
            startOffset: i * 0.07,
            freqStart: f,
            freqEnd: f * 0.96,
            duration: 0.25,
            peakGain: 0.065 * v,
          });
        });
        break;
      }

      case 'great_hunt': {
        // Hunting horn call + rhythmic hoof thumps
        [293.66, 369.99, 440.0].forEach((f, i) => {
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: i * 0.11,
            freqStart: f,
            duration: 0.24,
            peakGain: 0.085 * v,
            filterType: 'lowpass',
            filterFreqStart: 1650,
          });
        });
        break;
      }

      case 'sentinel': {
        // Stone guardians rising out of earth
        for (let i = 0; i < 4; i++) {
          this.playTone(bus, {
            type: 'triangle',
            startOffset: i * 0.1,
            freqStart: 90 + i * 16,
            freqEnd: 44,
            duration: 0.24,
            peakGain: 0.13 * v,
          });
        }
        this.playNoise(bus, {
          pink: true,
          filterType: 'lowpass',
          filterFreqStart: 900,
          duration: 0.55,
          peakGain: 0.12 * v,
        });
        break;
      }

      case 'sandstorm': {
        // Gritty sweeping desert storm + wind shift
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 750,
          filterFreqEnd: 2400,
          filterQ: 1.4,
          duration: 0.95,
          peakGain: 0.19 * v,
          attack: 0.06,
        });
        this.playTone(bus, {
          type: 'sine',
          freqStart: 220,
          freqEnd: 540,
          duration: 0.42,
          peakGain: 0.08 * v,
        });
        break;
      }

      case 'black_hole':
      case 'maelstrom': {
        const isBh = id === 'black_hole';
        // Gravity singularity warp (down->up suction then boom) or roaring ocean whirlpool
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: isBh ? 360 : 190,
          freqEnd: isBh ? 44 : 68,
          duration: 0.85,
          peakGain: 0.2 * v,
          filterType: 'lowpass',
          filterFreqStart: 1400,
          filterFreqEnd: 160,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: isBh ? 480 : 1250,
          filterFreqEnd: isBh ? 180 : 340,
          duration: 0.9,
          peakGain: 0.2 * v,
        });
        break;
      }

      case 'locust_swarm':
      case 'disease':
      case 'pestilence': {
        // Swarming locust buzz or toxic plague mist hiss
        if (id === 'locust_swarm') {
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: 168,
            freqEnd: 192,
            duration: 0.78,
            peakGain: 0.11 * v,
            filterType: 'bandpass',
            filterFreqStart: 920,
            filterFreqEnd: 1380,
            filterQ: 2.2,
          });
        }
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: id === 'locust_swarm' ? 2200 : 1400,
          filterFreqEnd: 460,
          filterQ: 1.5,
          duration: 0.75,
          peakGain: 0.16 * v,
        });
        break;
      }

      case 'darkest_night': {
        // Ominous eclipse drone + deep horn
        [110, 164.81, 207.65].forEach((f) => {
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: f,
            freqEnd: f * 0.96,
            duration: 0.85,
            peakGain: 0.08 * v,
            attack: 0.08,
            filterType: 'lowpass',
            filterFreqStart: 850,
          });
        });
        break;
      }

      case 'necromancy':
      case 'walking_woods':
      case 'spiders': {
        if (id === 'spiders') {
          // Rapid chittering spider bursts + poison hiss
          for (let i = 0; i < 5; i++) {
            this.playTone(bus, {
              type: 'square',
              startOffset: i * 0.07,
              freqStart: 1200 + (i % 2) * 380,
              freqEnd: 420,
              duration: 0.055,
              peakGain: 0.065 * v,
            });
          }
        } else if (id === 'walking_woods') {
          // Creaking ancient wood + forest chime
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: 125,
            freqEnd: 78,
            duration: 0.45,
            peakGain: 0.11 * v,
            filterType: 'bandpass',
            filterFreqStart: 420,
          });
        } else {
          // Underworld summoning rumble
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: 138.59,
            freqEnd: 92.5,
            duration: 0.65,
            peakGain: 0.12 * v,
            filterType: 'lowpass',
            filterFreqStart: 620,
          });
        }
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: 950,
          duration: 0.48,
          peakGain: 0.11 * v,
        });
        break;
      }

      case 'chaos':
      case 'traitors':
      default: {
        // Hypnotic / chaotic gong bell
        const notes = id === 'traitors' ? [329.63, 493.88, 659.25] : [233.08, 311.13, 440.0];
        notes.forEach((f, i) => {
          this.playTone(bus, {
            type: id === 'chaos' ? 'sawtooth' : 'triangle',
            startOffset: i * 0.055,
            freqStart: f,
            freqEnd: f * 0.94,
            duration: 0.52,
            peakGain: 0.095 * v,
            filterType: 'lowpass',
            filterFreqStart: 1900,
          });
        });
        break;
      }
    }
  }

  // ============================================================================
  // 6. MYTH CREATURE SPECIAL ABILITIES & SIGNATURE PASSIVE EFFECTS
  // ============================================================================
  public playMythEffectSound(
    ctx: AudioContext,
    scale: number,
    unitKind: UnitKind,
    effectHint?: MythSpecialEffectKind | 'cyclops_throw' | 'chain_lightning' | 'acid_burst' | 'solar_laser' | 'scarab_explode' | 'promethean_split' | 'titan_stomp',
    atten = 1.0
  ) {
    if (scale <= 0 || atten <= 0.06) return;
    if (!this.canPlay(`myth_${unitKind}_${effectHint ?? 'def'}`, 140)) return;
    const bus = this.ensureBus(ctx);
    const v = scale * Math.min(1.0, Math.max(0.12, atten));

    switch (unitKind) {
      case 'medusa': {
        // Serpent hiss + stone petrify lock
        this.playNoise(bus, {
          filterType: 'highpass',
          filterFreqStart: 2400,
          duration: 0.28,
          peakGain: 0.11 * v,
        });
        this.playTone(bus, {
          type: 'triangle',
          startOffset: 0.08,
          freqStart: 940,
          freqEnd: 280,
          duration: 0.25,
          peakGain: 0.1 * v,
        });
        break;
      }

      case 'cyclops': {
        // Giant club/throw grunt + earthshaking landing thud
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 92,
          freqEnd: 42,
          duration: 0.36,
          peakGain: 0.18 * v,
          filterType: 'lowpass',
          filterFreqStart: 420,
        });
        this.playNoise(bus, {
          pink: true,
          startOffset: 0.1,
          filterType: 'lowpass',
          filterFreqStart: 1100,
          filterFreqEnd: 180,
          duration: 0.32,
          peakGain: 0.16 * v,
        });
        break;
      }

      case 'minotaur':
      case 'battle_boar': {
        // Bull bellow + heavy horn ram smash
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 115,
          freqEnd: 68,
          duration: 0.34,
          peakGain: 0.15 * v,
          filterType: 'bandpass',
          filterFreqStart: 460,
          filterQ: 2.0,
        });
        this.playBattleHit(ctx, scale, 'siege', atten, true);
        break;
      }

      case 'centaur': {
        // Radiant solar arrow shimmer + bow twang
        this.playTone(bus, {
          type: 'triangle',
          freqStart: 960,
          freqEnd: 340,
          duration: 0.22,
          peakGain: 0.1 * v,
        });
        this.playTone(bus, {
          type: 'sine',
          freqStart: 1320,
          freqEnd: 1760,
          duration: 0.24,
          peakGain: 0.06 * v,
        });
        break;
      }

      case 'hydra': {
        // Triple-head screech + rapid multi-bite + heal shimmer
        for (let h = 0; h < 3; h++) {
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: h * 0.065,
            freqStart: 280 - h * 35,
            freqEnd: 120,
            duration: 0.16,
            peakGain: 0.095 * v,
            filterType: 'bandpass',
            filterFreqStart: 1100,
          });
        }
        this.playTone(bus, {
          type: 'sine',
          startOffset: 0.14,
          freqStart: 587.33,
          freqEnd: 880,
          duration: 0.26,
          peakGain: 0.055 * v,
        });
        break;
      }

      case 'manticore':
      case 'stymphalian_bird': {
        // Spray of venomous tail quills / bronze feathers
        for (let q = 0; q < 4; q++) {
          this.playNoise(bus, {
            startOffset: q * 0.045,
            filterType: 'bandpass',
            filterFreqStart: 3600 - q * 320,
            filterQ: 3.0,
            duration: 0.075,
            peakGain: 0.085 * v,
          });
        }
        break;
      }

      case 'colossus':
      case 'automaton':
      case 'iron_dwarf': {
        // Metallic bronze anvil clang + clockwork/electrical surge
        this.playTone(bus, {
          type: 'triangle',
          freqStart: unitKind === 'colossus' ? 110 : 320,
          freqEnd: 46,
          duration: 0.34,
          peakGain: 0.16 * v,
        });
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 2600,
          filterQ: 5.5,
          duration: 0.18,
          peakGain: 0.11 * v,
        });
        if (unitKind === 'automaton') {
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: 0.06,
            freqStart: 1150,
            freqEnd: 480,
            duration: 0.14,
            peakGain: 0.075 * v,
          });
        }
        break;
      }

      case 'avenger': {
        // Falcon screech + whirlwind twin-blade slash
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 1450,
          freqEnd: 780,
          duration: 0.2,
          peakGain: 0.09 * v,
          filterType: 'bandpass',
          filterFreqStart: 2200,
          filterQ: 3.2,
        });
        this.playNoise(bus, {
          startOffset: 0.06,
          filterType: 'bandpass',
          filterFreqStart: 2800,
          filterFreqEnd: 1100,
          filterQ: 3.5,
          duration: 0.18,
          peakGain: 0.11 * v,
        });
        break;
      }

      case 'sphinx': {
        // Whirling desert sand vortex + leonine roar
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 900,
          filterFreqEnd: 2200,
          filterQ: 1.8,
          duration: 0.42,
          peakGain: 0.14 * v,
        });
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 130,
          freqEnd: 78,
          duration: 0.28,
          peakGain: 0.1 * v,
          filterType: 'lowpass',
          filterFreqStart: 620,
        });
        break;
      }

      case 'scarab': {
        // Chitin burst + sizzling corrosive acid splash
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 160,
          freqEnd: 38,
          duration: 0.34,
          peakGain: 0.18 * v,
          filterType: 'lowpass',
          filterFreqStart: 560,
        });
        this.playNoise(bus, {
          filterType: 'highpass',
          filterFreqStart: 1900,
          duration: 0.36,
          peakGain: 0.15 * v,
        });
        break;
      }

      case 'argus':
      case 'mummy':
      case 'lampades': {
        // Bubbling acid / necrotic sand curse / dark arcane burst
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 1650,
          filterFreqEnd: 480,
          filterQ: 2.0,
          duration: 0.34,
          peakGain: 0.13 * v,
        });
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 310,
          freqEnd: 95,
          duration: 0.28,
          peakGain: 0.095 * v,
          filterType: 'lowpass',
          filterFreqStart: 900,
        });
        break;
      }

      case 'phoenix':
      case 'fire_giant':
      case 'tartarian_spawn': {
        // Fiery roar / Muspel magma fireball detonation
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: unitKind === 'phoenix' ? 680 : 140,
          freqEnd: unitKind === 'phoenix' ? 320 : 40,
          duration: 0.36,
          peakGain: 0.16 * v,
          filterType: 'lowpass',
          filterFreqStart: 1200,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: 1300,
          filterFreqEnd: 360,
          duration: 0.42,
          peakGain: 0.17 * v,
        });
        break;
      }

      case 'petsuchos': {
        // Focused solar laser ray + sizzling strike
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 1080,
          freqEnd: 460,
          duration: 0.26,
          peakGain: 0.1 * v,
          filterType: 'bandpass',
          filterFreqStart: 1900,
          filterQ: 2.8,
        });
        this.playNoise(bus, {
          filterType: 'highpass',
          filterFreqStart: 2200,
          duration: 0.2,
          peakGain: 0.085 * v,
        });
        break;
      }

      case 'son_of_osiris':
      case 'zeus':
      case 'hermes': {
        // Chain-arc lightning crackle
        for (let c = 0; c < 3; c++) {
          this.playTone(bus, {
            type: 'sawtooth',
            startOffset: c * 0.055,
            freqStart: 1750 - c * 260,
            freqEnd: 160,
            duration: 0.12,
            peakGain: 0.12 * v,
          });
        }
        this.playNoise(bus, {
          filterType: 'lowpass',
          filterFreqStart: 2800,
          filterFreqEnd: 240,
          duration: 0.36,
          peakGain: 0.15 * v,
        });
        break;
      }

      case 'valkyrie':
      case 'qilin':
      case 'caladria':
      case 'nymph':
      case 'dryad': {
        // Heavenly healing aura harp & crystalline chime
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
          this.playTone(bus, {
            type: 'sine',
            startOffset: idx * 0.055,
            freqStart: f,
            duration: 0.38,
            peakGain: 0.075 * v,
          });
        });
        break;
      }

      case 'frost_giant': {
        // Glacial ice roar + shattering crystal freeze
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: 105,
          freqEnd: 48,
          duration: 0.38,
          peakGain: 0.15 * v,
          filterType: 'lowpass',
          filterFreqStart: 520,
        });
        [1980, 2640].forEach((f, idx) => {
          this.playTone(bus, {
            type: 'triangle',
            startOffset: 0.04 + idx * 0.06,
            freqStart: f,
            freqEnd: f * 0.85,
            duration: 0.22,
            peakGain: 0.08 * v,
          });
        });
        break;
      }

      case 'fenris_wolf': {
        // Primal pack howl + snapping jaw bite
        this.playTone(bus, {
          type: 'triangle',
          freqStart: 320,
          freqEnd: 540,
          duration: 0.28,
          peakGain: 0.12 * v,
          filterType: 'bandpass',
          filterFreqStart: 1100,
          filterQ: 2.5,
        });
        this.playTone(bus, {
          type: 'sine',
          startOffset: 0.12,
          freqStart: 210,
          freqEnd: 75,
          duration: 0.1,
          peakGain: 0.12 * v,
        });
        break;
      }

      case 'troll':
      case 'rock_troll':
      case 'mountain_giant':
      case 'behemoth':
      case 'hekagigantes':
      case 'titan': {
        // Colossal tectonic stomp / rock shatter
        this.playTone(bus, {
          type: 'sawtooth',
          freqStart: unitKind === 'titan' ? 68 : 88,
          freqEnd: 26,
          duration: unitKind === 'titan' ? 0.55 : 0.38,
          peakGain: (unitKind === 'titan' ? 0.24 : 0.18) * v,
          filterType: 'lowpass',
          filterFreqStart: 320,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'lowpass',
          filterFreqStart: 1300,
          filterFreqEnd: 160,
          duration: 0.4,
          peakGain: 0.16 * v,
        });
        break;
      }

      case 'promethean':
      case 'promethean_offspring': {
        // Clay fission crack + earthen thud
        this.playTone(bus, {
          type: 'triangle',
          freqStart: 145,
          freqEnd: 54,
          duration: 0.26,
          peakGain: 0.14 * v,
        });
        this.playNoise(bus, {
          filterType: 'bandpass',
          filterFreqStart: 1350,
          filterFreqEnd: 380,
          duration: 0.22,
          peakGain: 0.11 * v,
        });
        break;
      }

      case 'kraken': {
        // Abyssal tentacle slap + deep water splash
        this.playTone(bus, {
          type: 'sine',
          freqStart: 135,
          freqEnd: 36,
          duration: 0.3,
          peakGain: 0.17 * v,
        });
        this.playNoise(bus, {
          pink: true,
          filterType: 'bandpass',
          filterFreqStart: 1200,
          filterFreqEnd: 280,
          duration: 0.4,
          peakGain: 0.15 * v,
        });
        break;
      }

      case 'nidhogg':
      case 'jormungand':
      case 'fafnir':
      case 'azure_dragon':
      case 'yazi':
      case 'taotie':
      case 'carnivora':
      case 'roc':
      case 'wadjet':
      case 'einherjar':
      case 'pegasus':
      case 'satyr':
      default: {
        // Dramatic mythic ability roar/whoosh tailored to effectHint
        if (effectHint === 'heal_aura') {
          [440, 554.37, 659.25].forEach((f, idx) => {
            this.playTone(bus, {
              type: 'sine',
              startOffset: idx * 0.06,
              freqStart: f,
              duration: 0.34,
              peakGain: 0.075 * v,
            });
          });
        } else if (effectHint === 'flame_cone') {
          this.playNoise(bus, {
            pink: true,
            filterType: 'bandpass',
            filterFreqStart: 1500,
            filterFreqEnd: 320,
            duration: 0.42,
            peakGain: 0.16 * v,
          });
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: 130,
            freqEnd: 48,
            duration: 0.34,
            peakGain: 0.14 * v,
            filterType: 'lowpass',
            filterFreqStart: 520,
          });
        } else {
          this.playTone(bus, {
            type: 'sawtooth',
            freqStart: 195,
            freqEnd: 62,
            duration: 0.3,
            peakGain: 0.14 * v,
            filterType: 'lowpass',
            filterFreqStart: 950,
          });
          this.playNoise(bus, {
            filterType: 'bandpass',
            filterFreqStart: 1700,
            filterFreqEnd: 460,
            duration: 0.25,
            peakGain: 0.12 * v,
          });
        }
        break;
      }
    }
  }
}
