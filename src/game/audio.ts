import {
  AgeLevel,
  FaunaKind,
  GodPowerId,
  PantheonId,
  UnitKind,
  UnitVoiceAction,
  UnitVoiceLineInfo,
} from './types';
import type { MythSpecialEffectKind } from './matchAnalytics';
import {
  ClientStudioVoiceRole,
  StudioVoicePlayer,
  inferVoiceRoleFromSpeaker,
} from './audio/StudioVoicePlayer';
import {
  BattleSfxEngine,
  BattleWeaponClass,
  FaunaSoundEvent,
  UnderAttackCategory,
} from './audio/BattleSfxEngine';

import {
  MATCH_MUSIC_PLAYLIST,
  MUSIC_TRACKS,
  MusicMood,
  MusicScene,
  MusicTrackSpec,
  PANTHEON_THEME_TRACK,
  PANTHEON_TRACK_POOLS,
} from "./audio/musicCatalog";
import {
  CULTURE_VOICE_BANK,
  CulturalVoiceEntry,
  CultureVoiceProfile,
} from "./audio/cultureVoiceBank";

export {
  MUSIC_TRACKS,
  MATCH_MUSIC_PLAYLIST,
  PANTHEON_THEME_TRACK,
  PANTHEON_TRACK_POOLS,
  CULTURE_VOICE_BANK,
};
export type {
  MusicMood,
  MusicScene,
  MusicTrackSpec,
  CulturalVoiceEntry,
  CultureVoiceProfile,
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
  private lastPhraseByKey: Record<string, string> = {};
  private audioBufferCache = new Map<string, AudioBuffer>();
  private loadingAudioUrls = new Set<string>();
  private studioVoice = new StudioVoicePlayer();
  private battleSfx = new BattleSfxEngine();
  private bgAudioElement: HTMLAudioElement | null = null;

  // Dynamic Hybrid Soundtrack State
  private musicMasterGain: GainNode | null = null;
  private musicLowpass: BiquadFilterNode | null = null;
  private musicIntervalId: number | null = null;
  private musicScene: MusicScene = 'title';
  private musicMood: MusicMood = 'standard';
  private musicPantheon: PantheonId = 'greek';
  private currentTrackId = 'cat_mittens';
  private matchPlaylistIdx = 0;
  private musicStep = 0;
  private musicNextNoteTime = 0;
  private musicTrackStartedAt = 0;
  private musicPausedDuck = false;
  private musicCueDuckUntil = 0;
  private musicVoiceDuckUntil = 0;
  private voiceDuckRestoreTimer: number | null = null;
  private campaignPinnedTrackId: string | null = null;
  private titleCycleIndex = 0;

  private get effectiveSfxScale(): number {
    if (this.muted || !this.sfxEnabled) return 0;
    return Math.max(0, Math.min(1.5, this.masterVolume * this.sfxVolume));
  }

  private get effectiveMusicScale(): number {
    if (this.muted || !this.musicEnabled) return 0;
    return Math.max(0, Math.min(1.5, this.masterVolume * this.musicVolume));
  }

  private getOrCreateRawContext(): AudioContext | null {
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

  private ensureContext(): AudioContext | null {
    if (this.muted || !this.sfxEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return null;
    return this.getOrCreateRawContext();
  }

  private ensureMusicBus(): { ctx: AudioContext; gain: GainNode; filter: BiquadFilterNode } | null {
    if (this.effectiveMusicScale <= 0) return null;
    const ctx = this.getOrCreateRawContext();
    if (!ctx) return null;
    if (!this.musicMasterGain || !this.musicLowpass) {
      this.musicLowpass = ctx.createBiquadFilter();
      this.musicLowpass.type = 'lowpass';
      this.musicLowpass.frequency.setValueAtTime(3200, ctx.currentTime);
      this.musicLowpass.Q.setValueAtTime(0.7, ctx.currentTime);

      this.musicMasterGain = ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(0.001, ctx.currentTime);

      this.musicLowpass.connect(this.musicMasterGain);
      this.musicMasterGain.connect(ctx.destination);
    }
    return { ctx, gain: this.musicMasterGain, filter: this.musicLowpass };
  }

  private updateMusicBusGain() {
    const nowCtx = this.ctx?.currentTime ?? 0;
    const isVoiceDucking = nowCtx < this.musicVoiceDuckUntil;
    if (this.bgAudioElement) {
      const scale = this.effectiveMusicScale;
      const duckFactor = this.musicPausedDuck ? 0.3 : isVoiceDucking ? 0.38 : 1.0;
      this.bgAudioElement.volume = Math.max(0, Math.min(1, scale * duckFactor * 0.9));
      if (scale <= 0 || !this.musicEnabled) {
        this.bgAudioElement.pause();
      } else if (this.bgAudioElement.paused && this.musicEnabled && scale > 0) {
        this.bgAudioElement.play().catch(() => {});
      }
    }
    if (!this.ctx || !this.musicMasterGain || !this.musicLowpass) return;
    const now = this.ctx.currentTime;
    const scale = this.effectiveMusicScale;
    const moodFactor = this.musicScene === 'match' && this.musicMood === 'mellow' ? 0.72 : 1.0;
    const duckFactor = this.musicPausedDuck
      ? 0.3
      : isVoiceDucking
      ? 0.36
      : now < this.musicCueDuckUntil
      ? 0.42
      : 1.0;
    const targetGain = scale > 0 ? Math.max(0.001, 0.24 * scale * moodFactor * duckFactor) : 0.0001;
    this.musicMasterGain.gain.setTargetAtTime(targetGain, now, 0.14);

    const targetCutoff = this.musicScene === 'match' && this.musicMood === 'mellow' ? 1150 : 3400;
    this.musicLowpass.frequency.setTargetAtTime(targetCutoff, now, 0.25);
  }

  private duckMusicForVoice(durationSec: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    this.musicVoiceDuckUntil = Math.max(this.musicVoiceDuckUntil, ctx.currentTime + Math.max(0.4, durationSec));
    this.updateMusicBusGain();
    if (typeof window !== 'undefined') {
      if (this.voiceDuckRestoreTimer !== null) {
        window.clearTimeout(this.voiceDuckRestoreTimer);
      }
      this.voiceDuckRestoreTimer = window.setTimeout(() => {
        this.voiceDuckRestoreTimer = null;
        this.updateMusicBusGain();
      }, Math.ceil(durationSec * 1000) + 120);
    }
  }

  private canPlay(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const prev = this.lastSoundAt[key] ?? 0;
    if (now - prev < minIntervalMs) return false;
    this.lastSoundAt[key] = now;
    return true;
  }

  public unlock() {
    this.getOrCreateRawContext();
    this.startMusicScheduler();
  }

  public stopVoice() {
    this.studioVoice.stopActiveVoice(this.ctx);
    this.musicVoiceDuckUntil = 0;
    this.updateMusicBusGain();
  }

  /**
   * Speaks a Campaign, Wave, or Scenario Cinematic character dialogue with
   * flagship Gemini 3.8 Neural Studio Voice acting and automatic music ducking.
   */
  public speakDialogue(
    speaker: string,
    text: string,
    opts?: {
      pantheon?: PantheonId;
      role?: ClientStudioVoiceRole;
      priority?: 'normal' | 'high';
    }
  ) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0 || !text.trim()) return;

    const resolvedRole = opts?.role ?? inferVoiceRoleFromSpeaker(speaker);
    this.studioVoice.speak(
      ctx,
      {
        text,
        role: resolvedRole,
        action: 'dialogue',
        pantheon: opts?.pantheon ?? this.musicPantheon,
        speaker,
        dramatic: true,
        priority: opts?.priority ?? 'high',
        volumeScale: 1.05,
      },
      scale,
      (dur) => this.duckMusicForVoice(dur)
    );
  }

  public hasCachedStudioVoice(opts: {
    text: string;
    role: ClientStudioVoiceRole;
    action?: 'select' | 'move' | 'attack' | 'work' | 'dialogue' | 'taunt';
    dramatic?: boolean;
  }): boolean {
    return this.studioVoice.hasCached({
      text: opts.text,
      role: opts.role,
      action: opts.action ?? 'select',
      dramatic: Boolean(opts.dramatic),
    });
  }

  public prefetchStudioVoice(opts: {
    text: string;
    role: ClientStudioVoiceRole;
    action?: 'select' | 'move' | 'attack' | 'work';
    pantheon?: PantheonId;
    speaker?: string;
    dramatic?: boolean;
  }) {
    const ctx = this.getOrCreateRawContext();
    if (!ctx || this.effectiveSfxScale <= 0) return;
    this.studioVoice.prefetch(ctx, {
      text: opts.text,
      role: opts.role,
      action: opts.action ?? 'select',
      pantheon: opts.pantheon,
      speaker: opts.speaker,
      dramatic: Boolean(opts.dramatic),
    });
  }

  /**
   * Silently prewarms the active pantheon's select/move/attack/work voices across primary roles
   * so interactive clicks and orders respond immediately at 0ms.
   */
  public prewarmPantheonVoices(pantheon: PantheonId) {
    const ctx = this.getOrCreateRawContext();
    if (!ctx || this.effectiveSfxScale <= 0) return;
    const bank = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const lines: Array<{
      text: string;
      role: ClientStudioVoiceRole;
      action: 'select' | 'move' | 'attack' | 'work';
      pantheon: PantheonId;
      dramatic?: boolean;
    }> = [];

    for (const entry of bank.select.slice(0, 3)) {
      lines.push({ text: entry.spoken, role: 'warrior_male', action: 'select', pantheon });
    }
    for (const entry of bank.move.slice(0, 3)) {
      lines.push({ text: entry.spoken, role: 'warrior_male', action: 'move', pantheon });
    }
    for (const entry of bank.attack.slice(0, 3)) {
      lines.push({ text: entry.spoken, role: 'warrior_male', action: 'attack', pantheon });
    }
    for (const entry of bank.work.slice(0, 3)) {
      lines.push({ text: entry.spoken, role: 'villager_male', action: 'work', pantheon });
    }
    // Primary villager select & hero select/attack lines
    if (bank.select[0]) {
      lines.push({ text: bank.select[0].spoken, role: 'villager_male', action: 'select', pantheon });
      lines.push({ text: bank.select[0].spoken, role: 'hero_commander', action: 'select', pantheon, dramatic: true });
    }
    if (bank.move[0]) {
      lines.push({ text: bank.move[0].spoken, role: 'villager_male', action: 'move', pantheon });
      lines.push({ text: bank.move[0].spoken, role: 'hero_commander', action: 'move', pantheon, dramatic: true });
    }
    if (bank.attack[0]) {
      lines.push({ text: bank.attack[0].spoken, role: 'hero_commander', action: 'attack', pantheon, dramatic: true });
    }

    this.studioVoice.prewarmLines(ctx, lines);
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
    if (this.muted || !this.sfxEnabled) {
      this.stopVoice();
    }
    this.updateMusicBusGain();
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    } else {
      this.stopMusicScheduler();
    }
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

  private pickRandomVoiceEntry(bank: CulturalVoiceEntry[], cacheKey: string): CulturalVoiceEntry {
    if (bank.length <= 1) return bank[0];
    const lastPhrase = this.lastPhraseByKey[cacheKey];
    const candidates = lastPhrase ? bank.filter((entry) => entry.phrase !== lastPhrase) : bank;
    const pool = candidates.length > 0 ? candidates : bank;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    this.lastPhraseByKey[cacheKey] = picked.phrase;
    return picked;
  }

  public preloadAudioClip(url: string) {
    if (!url || this.audioBufferCache.has(url) || this.loadingAudioUrls.has(url)) return;
    if (typeof fetch === 'undefined') return;
    const ctx = this.getOrCreateRawContext();
    if (!ctx) return;
    this.loadingAudioUrls.add(url);
    fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('HTTP error'))))
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        this.audioBufferCache.set(url, decoded);
      })
      .catch(() => {})
      .finally(() => {
        this.loadingAudioUrls.delete(url);
      });
  }

  public performVoiceClip(opts: {
    phrase: string;
    translation: string;
    spoken: string;
    cultureLabel: string;
    action: UnitVoiceAction;
    syllables: number[];
    basePitch: number;
    formantF1: number;
    formantF2: number;
    hornPitch: number;
    kindPitchMult: number;
    speechRate: number;
    isFemale: boolean;
    isDarkTone: boolean;
    groupSize: number;
    audioUrl?: string;
    respectCooldown?: boolean;
    studioRole?: ClientStudioVoiceRole;
    pantheon?: PantheonId;
    speaker?: string;
    dramatic?: boolean;
  }): UnitVoiceLineInfo {
    const result: UnitVoiceLineInfo = {
      phrase: opts.phrase,
      translation: opts.translation,
      cultureLabel: opts.cultureLabel,
      action: opts.action,
    };

    const cooldownKey = opts.action === 'select' ? 'unit_voice_select' : 'unit_voice_order';
    const cooldownMs = opts.action === 'select' ? 120 : 100;
    if (opts.respectCooldown !== false && !this.canPlay(cooldownKey, cooldownMs)) {
      return result;
    }

    const scale = this.effectiveSfxScale;
    const ctx = this.ensureContext();
    if (!ctx || scale <= 0) {
      return result;
    }

    // Immediate 0ms synchronous tactical feedback on click/order (AoM: Retold responsiveness)
    this.battleSfx.playInstantCommandCue(ctx, scale, opts.action);

    // 0. Play registered custom audio clip URL if decoded and cached
    let playedRegisteredClip = false;
    if (opts.audioUrl) {
      const cached = this.audioBufferCache.get(opts.audioUrl);
      if (cached) {
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        src.buffer = cached;
        src.playbackRate.value = Math.max(0.85, Math.min(1.15, opts.speechRate));
        gain.gain.value = Math.min(1.0, 0.9 * scale);
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(ctx.currentTime);
        playedRegisteredClip = true;
      } else {
        this.preloadAudioClip(opts.audioUrl);
      }
    }

    // 1. Studio Neural Voice Acting (Gemini 3.8 TTS + WebAudio broadcast mastering)
    if (!playedRegisteredClip) {
      const inferredRole: ClientStudioVoiceRole =
        opts.studioRole ??
        (opts.kindPitchMult <= 0.54
          ? 'titan'
          : opts.kindPitchMult <= 0.65 && opts.isDarkTone
          ? 'major_god_male'
          : opts.isFemale
          ? 'warrior_female'
          : opts.isDarkTone
          ? 'myth_beast'
          : 'warrior_male');

      const isHighPriority =
        inferredRole === 'major_god_male' ||
        inferredRole === 'major_god_female' ||
        inferredRole === 'titan';

      this.studioVoice.speak(
        ctx,
        {
          text: opts.spoken,
          role: inferredRole,
          action: opts.action,
          pantheon: opts.pantheon ?? this.musicPantheon,
          speaker: opts.speaker,
          dramatic: Boolean(opts.dramatic || isHighPriority),
          priority: isHighPriority ? 'high' : 'normal',
          volumeScale: isHighPriority ? 1.08 : 0.98,
        },
        scale,
        (dur) => this.duckMusicForVoice(dur)
      );
    }

    return result;
  }

  /**
   * Plays a studio-grade localized unit voice line when units or main characters
   * are selected or ordered.
   */
  public playUnitVoiceLine(
    pantheon: PantheonId,
    kind: UnitKind,
    action: UnitVoiceAction,
    groupSize = 1,
    isPromotedHero = false
  ): UnitVoiceLineInfo {
    const profile = CULTURE_VOICE_BANK[pantheon] ?? CULTURE_VOICE_BANK.greek;
    const bank = profile[action] && profile[action].length > 0 ? profile[action] : profile.select;
    const chosen = this.pickRandomVoiceEntry(bank, `${pantheon}:${action}`);

    let phrase = chosen.phrase;
    let translation = chosen.pt;
    let spoken = chosen.spoken;
    let studioRole: ClientStudioVoiceRole = 'warrior_male';
    let speaker: string | undefined;
    let dramatic = false;

    const isFemaleGreek =
      kind === 'hippolyta' ||
      kind === 'atena' ||
      kind === 'afrodite' ||
      kind === 'artemis' ||
      kind === 'nymph' ||
      kind === 'medusa';
    const isFemaleAtlantean = kind === 'caladria' || kind === 'dryad' || kind === 'lampades';
    const isFemaleNorse = kind === 'valkyrie';
    const isFemaleUnit = isFemaleGreek || isFemaleAtlantean || isFemaleNorse;

    if (isFemaleUnit) {
      studioRole = 'warrior_female';
    }

    if (pantheon === 'greek' && isFemaleGreek && phrase === 'Étimos.') {
      phrase = 'Étimi.';
      translation = 'Pronta.';
      spoken = 'Pronta para servir!';
    }

    // Major Gods & Titans
    if (kind === 'zeus') {
      speaker = 'Zeus';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'ZEUS: "Fulminarei todos os mortais com o Trovão Supremo!"'
          : 'ZEUS: "O Rei do Olimpo atende ao chamado da Era V!"';
      translation = action === 'attack' ? 'Trovão Supremo do Pai dos Deuses!' : 'Zeus aguarda seu decreto divino.';
      spoken = action === 'attack' ? 'Fulminarei todos os mortais com o trovão supremo!' : 'O Rei do Olimpo atende ao seu chamado!';
    } else if (kind === 'poseidon') {
      speaker = 'Poseidon';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'POSEIDON: "Que os mares engulam suas muralhas!"'
          : 'POSEIDON: "O Senhor dos Mares ergue seu Tridente!"';
      translation = action === 'attack' ? 'Tsunami sísmico de Poseidon!' : 'Poseidon domina as águas.';
      spoken = action === 'attack' ? 'Que os mares engulam suas muralhas!' : 'O Senhor dos Mares ergue seu tridente!';
    } else if (kind === 'hades') {
      speaker = 'Hades';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'HADES: "Para as profundezas do Tártaro!"'
          : 'HADES: "As sombras do Submundo obedecem."';
      translation = action === 'attack' ? 'Chamas necróticas do Submundo!' : 'Hades reina sobre o campo.';
      spoken = action === 'attack' ? 'Para as profundezas do Tártaro!' : 'As sombras do Submundo obedecem.';
    } else if (kind === 'atena') {
      speaker = 'Atena';
      studioRole = 'major_god_female';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'ATENA: "Eis máchin! Pela Égide e Sabedoria!"'
          : 'ATENA: "Étimi! A estratégia precede a vitória."';
      translation = action === 'attack' ? 'Golpe sagrado da Égide de Atena!' : 'Atena protege suas fileiras.';
      spoken = action === 'attack' ? 'Pela Égide e pela sabedoria, avancem!' : 'A estratégia sempre precede a vitória.';
    } else if (kind === 'ares') {
      speaker = 'Ares';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'ARES: "Eisvolí! Sangue e Guerra!"'
          : 'ARES: "Próstagma? Onde está o combate?!"';
      translation = action === 'attack' ? 'Fúria sísmica do Deus da Guerra!' : 'Ares anseia pela batalha.';
      spoken = action === 'attack' ? 'Sangue e guerra! Esmaguem todos!' : 'Onde está o combate? Tragam-me a batalha!';
    } else if (kind === 'hermes') {
      speaker = 'Hermes';
      studioRole = 'hero_commander';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'HERMES: "Páme! Mais rápido que o relâmpago!"'
          : 'HERMES: "Asas do Olimpo ao seu dispor."';
      translation = action === 'attack' ? 'Rajada celeste de Hermes!' : 'Mensageiro divino pronto.';
      spoken = action === 'attack' ? 'Mais rápido que o relâmpago! Avançar!' : 'As asas do Olimpo estão ao seu dispor.';
    } else if (kind === 'apolo') {
      speaker = 'Apolo';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'APOLO: "Que o fogo solar reduza-os a cinzas!"'
          : 'APOLO: "A luz do Sol ilumina o campo."';
      translation = action === 'attack' ? 'Flechas solares de Apolo!' : 'Apolo mira o horizonte.';
      spoken = action === 'attack' ? 'Que o fogo solar reduza nossos inimigos a cinzas!' : 'A luz do Sol ilumina o campo de batalha.';
    } else if (kind === 'dionisio') {
      speaker = 'Dionísio';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'DIONÍSIO: "O frenesi dionisíaco os consumirá!"'
          : 'DIONÍSIO: "Kalós! Celebremos a vitória antecipada!"';
      translation = action === 'attack' ? 'Onda arcana das vinhas sagradas!' : 'Dionísio abençoa a marcha.';
      spoken = action === 'attack' ? 'O frenesi dionisíaco os consumirá!' : 'Celebremos a vitória antecipada!';
    } else if (kind === 'afrodite') {
      speaker = 'Afrodite';
      studioRole = 'major_god_female';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'AFRODITE: "Contemplem a fúria celestial da Beleza!"'
          : 'AFRODITE: "Étimi — nascida da espuma e das estrelas."';
      translation = action === 'attack' ? 'Explosão encantadora de Afrodite!' : 'Afrodite flutua em graça.';
      spoken = action === 'attack' ? 'Contemplem a fúria celestial da beleza!' : 'Pronta, nascida da espuma e das estrelas.';
    } else if (kind === 'hefesto') {
      speaker = 'Hefesto';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'HEFESTO: "Sinta o martelo da Forja Olímpica!"'
          : 'HEFESTO: "Fogo e bronze moldam o destino."';
      translation = action === 'attack' ? 'Impacto vulcânico de Hefesto!' : 'Hefesto prepara o martelo.';
      spoken = action === 'attack' ? 'Sinta o martelo da Forja Olímpica!' : 'Fogo e bronze moldam o destino.';
    } else if (kind === 'artemis') {
      speaker = 'Ártemis';
      studioRole = 'major_god_female';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'ÁRTEMIS: "A caçada lunar nunca erra o alvo!"'
          : 'ÁRTEMIS: "Étimi! Sob o luar, somos implacáveis."';
      translation = action === 'attack' ? 'Chuva de flechas lunares de Ártemis!' : 'Ártemis vigia a floresta.';
      spoken = action === 'attack' ? 'A caçada lunar nunca erra o alvo!' : 'Sob o luar, somos implacáveis.';
    } else if (kind === 'ra') {
      speaker = 'Rá';
      studioRole = 'major_god_male';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'RÁ: "Khepresh! Que o Sol devore nossos inimigos!"'
          : 'RÁ: "O Disco Solar ilumina o Nilo."';
      translation = action === 'attack' ? 'Fogo solar de Rá!' : 'Rá vigia o reino.';
      spoken = action === 'attack' ? 'Que o fogo do Sol devore nossos inimigos!' : 'O disco solar ilumina todo o Nilo.';
    } else if (kind === 'isis') {
      speaker = 'Ísis';
      studioRole = 'major_god_female';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'ÍSIS: "Pela magia eterna de Kemet!"'
          : 'ÍSIS: "Nossos monumentos resistirão a tudo."';
      translation = action === 'attack' ? 'Encantamento destrutivo de Ísis!' : 'Ísis protege seu povo.';
      spoken = action === 'attack' ? 'Pela magia eterna de Kemet!' : 'Nossos monumentos resistirão a tudo.';
    } else if (kind === 'set') {
      speaker = 'Set';
      studioRole = 'villain_dark';
      dramatic = true;
      phrase =
        action === 'attack'
          ? 'SET: "Tempestade de areia e caos!"'
          : 'SET: "As feras do deserto respondem ao meu chamado."';
      translation = action === 'attack' ? 'Fúria do deserto de Set!' : 'Set comanda as sombras.';
      spoken = action === 'attack' ? 'Tempestade de areia e caos!' : 'As feras do deserto respondem ao meu chamado.';
    } else if (kind === 'titan') {
      speaker = 'Titã';
      studioRole = 'titan';
      dramatic = true;
      phrase =
        action === 'attack' ? `TITÃ: "${chosen.phrase}"` : `Titã Ancestral — "${chosen.phrase}"`;
      translation = action === 'attack' ? 'Rugido Titânico de Destruição!' : 'O Titã aguarda seu comando.';
      spoken = action === 'attack' ? 'A terra tremerá diante da fúria dos Titãs!' : 'O Titã desperta e aguarda seu comando.';
    } else if (kind === 'villager' || kind === 'citizen' || kind === 'norse_dwarf' || kind === 'chinese_peasant') {
      studioRole = 'villager_male';
    } else if (kind === 'oracle' || kind === 'priest' || kind === 'jiang_ziya') {
      studioRole = 'mystic_priest';
    } else if (
      kind === 'hero' ||
      kind === 'ajax' ||
      kind === 'jason' ||
      kind === 'odysseus' ||
      kind === 'perseus' ||
      kind === 'bellerophon' ||
      kind === 'theseus' ||
      kind === 'pharaoh' ||
      kind === 'son_of_osiris' ||
      kind === 'hersir' ||
      isPromotedHero
    ) {
      studioRole = isFemaleUnit ? 'hero_female' : 'hero_commander';
      dramatic = true;
    } else if (
      kind === 'cyclops' ||
      kind === 'minotaur' ||
      kind === 'hydra' ||
      kind === 'colossus' ||
      kind === 'behemoth' ||
      kind === 'hekagigantes'
    ) {
      studioRole = 'myth_beast';
    }

    return this.performVoiceClip({
      phrase,
      translation,
      spoken,
      cultureLabel: profile.cultureLabel,
      action,
      syllables: chosen.syllables,
      basePitch: profile.basePitch,
      formantF1: profile.formantF1,
      formantF2: profile.formantF2,
      hornPitch: profile.hornPitch,
      kindPitchMult: studioRole === 'titan' ? 0.52 : studioRole === 'major_god_male' ? 0.58 : 1.0,
      speechRate: 1.0,
      isFemale: isFemaleUnit,
      isDarkTone: studioRole === 'myth_beast' || studioRole === 'villain_dark' || studioRole === 'titan',
      groupSize,
      studioRole,
      pantheon,
      speaker,
      dramatic,
    });
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

  public playSwordHit(weapon: BattleWeaponClass = 'blade', atten = 1.0, isHeroOrMyth = false) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playBattleHit(ctx, scale, weapon, atten, isHeroOrMyth);
  }

  public playBattleHit(weapon: BattleWeaponClass = 'blade', atten = 1.0, isHeroOrMyth = false) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playBattleHit(ctx, scale, weapon, atten, isHeroOrMyth);
  }

  public playArrow() {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playProjectileLaunch(ctx, scale, {});
  }

  public playProjectileLaunch(opts: {
    isBoulder?: boolean;
    isFireball?: boolean;
    isPetrify?: boolean;
    isFireArrow?: boolean;
    isTurret?: boolean;
    atten?: number;
  } = {}) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playProjectileLaunch(ctx, scale, opts);
  }

  public playProjectileImpact(opts: {
    isBoulder?: boolean;
    isFireball?: boolean;
    isPetrify?: boolean;
    isBuilding?: boolean;
    atten?: number;
  } = {}) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playProjectileImpact(ctx, scale, opts);
  }

  public playBuildingCollapse(radius = 3.0, atten = 1.0) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playBuildingCollapse(ctx, scale, radius, atten);
  }

  public playUnitDeathDetailed(opts: {
    isMythic?: boolean;
    isNaval?: boolean;
    isHeroOrGod?: boolean;
    atten?: number;
  } = {}) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playUnitDeathDetailed(ctx, scale, opts);
  }

  public playBattleClashAmbience(activeFighters: number) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playBattleClashAmbience(ctx, scale, activeFighters);
  }

  public playUnderAttackWarning(category: UnderAttackCategory = 'unit') {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playUnderAttackWarning(ctx, scale, category);
  }

  public playFaunaSound(kind: FaunaKind, event: FaunaSoundEvent = 'select', atten = 1.0) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playFaunaSound(ctx, scale, kind, event, atten);
  }

  public playGodPowerSound(id: GodPowerId, phase: 'cast' | 'impact' = 'impact') {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playGodPowerSound(ctx, scale, id, phase);
  }

  public playMythEffectSound(
    unitKind: UnitKind,
    effectHint?:
      | MythSpecialEffectKind
      | 'cyclops_throw'
      | 'chain_lightning'
      | 'acid_burst'
      | 'solar_laser'
      | 'scarab_explode'
      | 'promethean_split'
      | 'titan_stomp',
    atten = 1.0
  ) {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playMythEffectSound(ctx, scale, unitKind, effectHint, atten);
  }

  public playLightning() {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playGodPowerSound(ctx, scale, 'lightning', 'impact');
  }

  public playMeteor() {
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;
    this.battleSfx.playGodPowerSound(ctx, scale, 'meteor', 'impact');
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

  public playTaunt(tone = 520, spokenText?: string) {
    if (!this.canPlay('taunt', 260)) return;
    const ctx = this.ensureContext();
    const scale = this.effectiveSfxScale;
    if (!ctx || scale <= 0) return;

    if (spokenText) {
      this.studioVoice.speak(
        ctx,
        {
          text: spokenText,
          role: 'hero_commander',
          action: 'taunt',
          pantheon: this.musicPantheon,
          dramatic: false,
          volumeScale: 1.0,
        },
        scale,
        (dur) => this.duckMusicForVoice(dur)
      );
      return;
    }

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

  // =========================================================================
  // HYBRID DYNAMIC SOUNDTRACK ENGINE (AoM / Retold)
  // =========================================================================

  public getCurrentMusicInfo(): {
    trackId: string;
    title: string;
    displayTitle: string;
    subtitle: string;
    mood: MusicMood;
    scene: MusicScene;
    pantheon: PantheonId;
  } {
    const track = MUSIC_TRACKS[this.currentTrackId] ?? MUSIC_TRACKS.cat_mittens;
    const isMellowMix =
      this.musicScene === 'match' && this.musicMood === 'mellow' && track.category === 'match';
    return {
      trackId: track.id,
      title: track.title,
      displayTitle: isMellowMix ? `${track.title} — Quiet Mix` : track.title,
      subtitle: track.subtitle,
      mood: this.musicMood,
      scene: this.musicScene,
      pantheon: this.musicPantheon,
    };
  }

  public setMusicScene(scene: MusicScene, pantheon?: PantheonId) {
    if (pantheon) this.musicPantheon = pantheon;
    const prevScene = this.musicScene;
    this.musicScene = scene;

    if (scene === 'title') {
      this.musicPausedDuck = false;
      this.campaignPinnedTrackId = null;
      if (prevScene !== 'title') {
        this.titleCycleIndex = 0;
        this.switchMusicTrack('cat_mittens');
      }
    } else if (scene === 'credits') {
      this.musicPausedDuck = false;
      this.switchMusicTrack('garys_reserve');
    } else if (scene === 'victory') {
      this.musicPausedDuck = false;
      this.switchMusicTrack('doorknob');
    } else if (scene === 'defeat') {
      this.musicPausedDuck = false;
      this.switchMusicTrack('other_sunset');
    }

    this.updateMusicBusGain();
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    }
  }

  private pickPantheonTrack(pantheon: PantheonId, avoidCurrent = false): string {
    const pool = PANTHEON_TRACK_POOLS[pantheon] ?? [PANTHEON_THEME_TRACK[pantheon] ?? 'greek_to_me'];
    const filtered = avoidCurrent && pool.length > 1 ? pool.filter((id) => id !== this.currentTrackId) : pool;
    return filtered[Math.floor(Math.random() * filtered.length)] ?? pool[0];
  }

  public previewPantheonTheme(pantheon: PantheonId) {
    this.musicPantheon = pantheon;
    if (this.musicScene === 'title') {
      const civTrackId = this.pickPantheonTrack(pantheon, true);
      this.switchMusicTrack(civTrackId);
    }
  }

  public startMatchMusic(pantheon: PantheonId, scenarioTitle?: string) {
    this.musicScene = 'match';
    this.musicPantheon = pantheon;
    this.musicMood = 'standard';
    this.musicPausedDuck = false;
    this.campaignPinnedTrackId = null;
    this.matchPlaylistIdx = Math.floor(Math.random() * MATCH_MUSIC_PLAYLIST.length);

    let initialTrackId = this.pickPantheonTrack(pantheon, false);
    if (scenarioTitle) {
      const lower = scenarioTitle.toLowerCase();
      if (lower.includes('titã') || lower.includes('atlânt')) {
        initialTrackId = this.pickPantheonTrack('atlantean', false);
      } else if (lower.includes('egito') || lower.includes('nilo')) {
        initialTrackId = this.pickPantheonTrack('egyptian', false);
      } else if (lower.includes('nórdic') || lower.includes('midgard') || lower.includes('gigante')) {
        initialTrackId = this.pickPantheonTrack('norse', false);
      } else if (lower.includes('chin') || lower.includes('pilar')) {
        initialTrackId = this.pickPantheonTrack('chinese', false);
      } else if (lower.includes('prólogo') || lower.includes('olimp')) {
        initialTrackId = this.pickPantheonTrack('greek', false);
      }
      this.campaignPinnedTrackId = initialTrackId;
    }

    this.switchMusicTrack(initialTrackId);
    this.updateMusicBusGain();
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    }
  }

  public setCampaignMusicTrigger(trackId: string) {
    if (!MUSIC_TRACKS[trackId]) return;
    this.campaignPinnedTrackId = trackId;
    this.musicScene = 'match';
    this.switchMusicTrack(trackId);
  }

  public setMusicMood(mood: MusicMood) {
    if (this.musicMood === mood) return;
    this.musicMood = mood;
    this.updateMusicBusGain();
  }

  public setMusicPausedDuck(paused: boolean) {
    if (this.musicPausedDuck === paused) return;
    this.musicPausedDuck = paused;
    this.updateMusicBusGain();
  }

  public skipToNextMusicTrack() {
    const pool = PANTHEON_TRACK_POOLS[this.musicPantheon] ?? [PANTHEON_THEME_TRACK[this.musicPantheon] ?? 'greek_to_me'];
    if (this.musicScene === 'match') {
      this.campaignPinnedTrackId = null;
      const curIdx = pool.indexOf(this.currentTrackId);
      if (curIdx >= 0 && pool.length > 1) {
        const nextIdx = (curIdx + 1) % pool.length;
        // Cycle through all 3 deity tracks first, then mix with shared match tracks occasionally
        if (nextIdx !== 0 || Math.random() < 0.55) {
          this.switchMusicTrack(pool[nextIdx]);
          return;
        }
      } else if (Math.random() < 0.7) {
        this.switchMusicTrack(this.pickPantheonTrack(this.musicPantheon, true));
        return;
      }
      const nextId = MATCH_MUSIC_PLAYLIST[this.matchPlaylistIdx % MATCH_MUSIC_PLAYLIST.length];
      this.matchPlaylistIdx = (this.matchPlaylistIdx + 1) % MATCH_MUSIC_PLAYLIST.length;
      this.switchMusicTrack(nextId);
    } else if (this.musicScene === 'title') {
      const curIdx = pool.indexOf(this.currentTrackId);
      if (pool.length > 1) {
        const nextIdx = curIdx >= 0 ? (curIdx + 1) % pool.length : 0;
        this.switchMusicTrack(pool[nextIdx]);
      } else {
        this.titleCycleIndex = (this.titleCycleIndex + 1) % 2;
        this.switchMusicTrack(this.titleCycleIndex === 0 ? 'cat_mittens' : pool[0]);
      }
    }
  }

  public previewMusicTrack(trackId: string) {
    if (!MUSIC_TRACKS[trackId]) return;
    this.switchMusicTrack(trackId);
    if (this.effectiveMusicScale > 0) {
      this.startMusicScheduler();
    }
  }

  private switchMusicTrack(trackId: string) {
    if (!MUSIC_TRACKS[trackId]) return;
    this.currentTrackId = trackId;
    this.musicStep = 0;
    this.musicTrackStartedAt = performance.now();

    if (this.bgAudioElement) {
      this.bgAudioElement.pause();
      this.bgAudioElement.currentTime = 0;
      this.bgAudioElement = null;
    }

    const track = MUSIC_TRACKS[trackId];
    if (track?.audioUrl && typeof window !== 'undefined' && this.effectiveMusicScale > 0 && this.musicEnabled) {
      const audio = new window.Audio(track.audioUrl);
      audio.loop = true;
      audio.volume = Math.max(0, Math.min(1, this.effectiveMusicScale * (this.musicPausedDuck ? 0.3 : 1.0)));
      audio.play().catch(() => {});
      this.bgAudioElement = audio;
    }

    if (this.ctx) {
      this.musicNextNoteTime = Math.max(this.ctx.currentTime + 0.04, this.musicNextNoteTime);
    }
  }

  /**
   * Instant musical stinger when entering major combat.
   */
  public playCombatCue(pantheon: PantheonId = this.musicPantheon) {
    if (!this.canPlay('combat_cue', 18000)) return;
    const ctx = this.ensureContext();
    const scale = Math.max(this.effectiveSfxScale, this.effectiveMusicScale);
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    this.musicCueDuckUntil = Math.max(this.musicCueDuckUntil, now + 1.35);
    this.updateMusicBusGain();

    const track = MUSIC_TRACKS[PANTHEON_THEME_TRACK[pantheon] ?? 'greek_to_me'];
    const root = (track?.rootHz ?? 220) * 0.5;
    const intervals = [0, 7, 12];

    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.14;
      const drum = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(105 + i * 12, t);
      drum.frequency.exponentialRampToValueAtTime(34, t + 0.24);
      drumGain.gain.setValueAtTime(0.001, t);
      drumGain.gain.linearRampToValueAtTime(0.18 * scale, t + 0.012);
      drumGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      drum.connect(drumGain);
      drumGain.connect(ctx.destination);
      drum.start(t);
      drum.stop(t + 0.28);
    }

    intervals.forEach((semi, idx) => {
      const start = now + 0.16 + idx * 0.06;
      const freq = root * Math.pow(2, semi / 12);
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.085 * scale, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.72);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.75);
    });
  }

  /**
   * Instant divine musical cue triggered when casting a God Power.
   */
  public playGodPowerCue(id: GodPowerId, pantheon: PantheonId = this.musicPantheon) {
    if (!this.canPlay('god_power_cue', 900)) return;
    const ctx = this.ensureContext();
    const scale = Math.max(this.effectiveSfxScale, this.effectiveMusicScale);
    if (!ctx || scale <= 0) return;

    const now = ctx.currentTime;
    this.musicCueDuckUntil = Math.max(this.musicCueDuckUntil, now + 1.5);
    this.updateMusicBusGain();

    const isAggressive =
      id === 'meteor' ||
      id === 'lightning' ||
      id === 'lightning_storm' ||
      id === 'volcanic_eruption' ||
      id === 'tremor' ||
      id === 'undermine' ||
      id === 'tornado' ||
      id === 'sandstorm' ||
      id === 'black_hole' ||
      id === 'chaos';

    const root = pantheon === 'norse' ? 196.0 : pantheon === 'atlantean' ? 246.94 : 220.0;
    const chord = isAggressive ? [0, 3, 7, 12] : [0, 4, 7, 11, 14];

    chord.forEach((semi, idx) => {
      const start = now + idx * 0.065;
      const freq = root * Math.pow(2, semi / 12);
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = isAggressive ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isAggressive ? 2200 : 2800, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime((isAggressive ? 0.075 : 0.065) * scale, start + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.95);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.98);
    });
  }

  private startMusicScheduler() {
    if (this.effectiveMusicScale <= 0 || typeof window === 'undefined') return;
    if (this.musicIntervalId !== null) return;
    const bus = this.ensureMusicBus();
    if (!bus) return;
    this.musicNextNoteTime = bus.ctx.currentTime + 0.05;
    if (this.musicTrackStartedAt <= 0) {
      this.musicTrackStartedAt = performance.now();
    }
    this.updateMusicBusGain();
    this.musicIntervalId = window.setInterval(() => this.tickMusicScheduler(), 95);
  }

  private stopMusicScheduler() {
    if (this.musicIntervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.updateMusicBusGain();
  }

  private tickMusicScheduler() {
    const bus = this.ensureMusicBus();
    if (!bus) return;
    const { ctx, filter } = bus;
    if (ctx.state === 'suspended') return;

    this.updateMusicBusGain();

    const nowPerf = performance.now();
    const elapsedTrackSec = (nowPerf - this.musicTrackStartedAt) * 0.001;
    // Rotate tracks dynamically in match (~42s per cycle) and title (~36s alternating with last pantheon)
    if (this.musicScene === 'match' && !this.campaignPinnedTrackId && elapsedTrackSec >= 42) {
      this.skipToNextMusicTrack();
    } else if (this.musicScene === 'title' && elapsedTrackSec >= 36) {
      this.skipToNextMusicTrack();
    }

    if (this.bgAudioElement) {
      // Skip procedural synthesizer notes while an external MP3 soundtrack is playing
      return;
    }

    const track = MUSIC_TRACKS[this.currentTrackId] ?? MUSIC_TRACKS.cat_mittens;
    const isMellow = this.musicScene === 'match' && this.musicMood === 'mellow';
    const effectiveBpm = isMellow ? track.bpm * 0.78 : track.bpm;
    const stepDur = 60 / effectiveBpm / 2; // eighth-note pulse

    if (this.musicNextNoteTime < ctx.currentTime) {
      this.musicNextNoteTime = ctx.currentTime + 0.04;
    }

    while (this.musicNextNoteTime < ctx.currentTime + 0.22) {
      this.scheduleMusicStep(ctx, filter, track, this.musicStep, this.musicNextNoteTime, stepDur, isMellow);
      this.musicNextNoteTime += stepDur;
      this.musicStep = (this.musicStep + 1) % 32;
    }
  }

  private scheduleMusicStep(
    ctx: AudioContext,
    dest: AudioNode,
    track: MusicTrackSpec,
    step: number,
    t: number,
    stepDur: number,
    isMellow: boolean
  ) {
    const idx = step % 16;
    const scale = track.scale;

    const noteFreq = (deg: number, octaveShift = 0) => {
      const len = scale.length;
      const wrapped = ((deg % len) + len) % len;
      const oct = Math.floor(deg / len) + octaveShift;
      const semi = scale[wrapped] + oct * 12;
      return track.rootHz * Math.pow(2, semi / 12);
    };

    // 1. Warm Sustaining Pad on bar boundaries (step 0 & 16)
    if (idx === 0) {
      const padIntervals = [0, 4, 7];
      padIntervals.forEach((semi, pIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = pIdx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(track.rootHz * 0.5 * Math.pow(2, semi / 12), t);
        const dur = stepDur * 15.2;
        const peak = isMellow ? 0.11 : 0.085;
        gain.gain.setValueAtTime(0.0005, t);
        gain.gain.linearRampToValueAtTime(peak, t + stepDur * 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + dur + 0.04);
      });
    }

    // 2. Lead Melody (softer flute/strings in Mellow Quiet Mix)
    const melDeg = track.melody[idx];
    if (melDeg >= 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isMellow ? 'sine' : track.leadWave;
      osc.frequency.setValueAtTime(noteFreq(melDeg, isMellow ? 0 : 0), t);
      const dur = stepDur * (isMellow ? 2.4 : 1.75);
      const peak = isMellow ? 0.14 : track.leadWave === 'sawtooth' ? 0.095 : 0.15;
      gain.gain.setValueAtTime(0.0008, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }

    // 3. Plucked Arpeggio (Harp / Oud / Koto / Guzheng / Lyre)
    const arpDeg = track.arp[idx];
    if (arpDeg >= 0 && (!isMellow || idx % 2 === 0)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteFreq(arpDeg, isMellow ? 0 : 1), t);
      const dur = stepDur * (isMellow ? 1.4 : 0.92);
      const peak = isMellow ? 0.07 : 0.08;
      gain.gain.setValueAtTime(0.0008, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }

    // 4. Bass Foundation
    const bassDeg = track.bass[idx];
    if (bassDeg >= 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isMellow ? 'sine' : track.bassWave;
      osc.frequency.setValueAtTime(noteFreq(bassDeg, -1), t);
      const dur = stepDur * 1.9;
      const peak = isMellow ? 0.14 : 0.16;
      gain.gain.setValueAtTime(0.0008, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }

    // 5. Cultural Percussion (tamed to soft pulse in Mellow Quiet Mix)
    if (isMellow) {
      if (idx === 0 || idx === 8) {
        const drum = ctx.createOscillator();
        const dGain = ctx.createGain();
        drum.type = 'sine';
        drum.frequency.setValueAtTime(72, t);
        drum.frequency.exponentialRampToValueAtTime(34, t + 0.18);
        dGain.gain.setValueAtTime(0.0008, t);
        dGain.gain.linearRampToValueAtTime(0.075, t + 0.015);
        dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
        drum.connect(dGain);
        dGain.connect(dest);
        drum.start(t);
        drum.stop(t + 0.22);
      }
      return;
    }

    const pStyle = track.percussionStyle;
    const isDownbeat = idx % 4 === 0;
    const isSyncopated = idx === 3 || idx === 6 || idx === 11 || idx === 14;
    if (pStyle === 'orchestral' && (isDownbeat || idx === 10)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(isDownbeat ? 92 : 135, t);
      drum.frequency.exponentialRampToValueAtTime(36, t + 0.18);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(isDownbeat ? 0.16 : 0.09, t + 0.01);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.22);
    } else if (pStyle === 'nile' && (isDownbeat || isSyncopated)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = isSyncopated ? 'triangle' : 'sine';
      drum.frequency.setValueAtTime(isSyncopated ? 240 : 112, t);
      drum.frequency.exponentialRampToValueAtTime(isSyncopated ? 120 : 48, t + 0.12);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(isSyncopated ? 0.09 : 0.15, t + 0.008);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.14);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.16);
    } else if (pStyle === 'nordic' && (idx === 0 || idx === 4 || idx === 8 || idx === 12 || idx === 14)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(idx === 0 || idx === 8 ? 78 : 96, t);
      drum.frequency.exponentialRampToValueAtTime(28, t + 0.22);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(0.19, t + 0.012);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.24);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.26);
    } else if (pStyle === 'mystic' && (idx === 0 || idx === 6 || idx === 12)) {
      const chime = ctx.createOscillator();
      const cGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(noteFreq(idx === 0 ? 7 : 9, 1), t);
      cGain.gain.setValueAtTime(0.0005, t);
      cGain.gain.linearRampToValueAtTime(0.055, t + 0.015);
      cGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.45);
      chime.connect(cGain);
      cGain.connect(dest);
      chime.start(t);
      chime.stop(t + 0.48);
    } else if (pStyle === 'eastern' && (isDownbeat || idx === 6 || idx === 14)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(idx % 8 === 0 ? 88 : 210, t);
      drum.frequency.exponentialRampToValueAtTime(idx % 8 === 0 ? 38 : 140, t + 0.16);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(idx % 8 === 0 ? 0.16 : 0.075, t + 0.01);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.18);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.2);
    } else if (pStyle === 'light' && (idx === 0 || idx === 8)) {
      const drum = ctx.createOscillator();
      const dGain = ctx.createGain();
      drum.type = 'sine';
      drum.frequency.setValueAtTime(84, t);
      drum.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      dGain.gain.setValueAtTime(0.0008, t);
      dGain.gain.linearRampToValueAtTime(0.08, t + 0.012);
      dGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
      drum.connect(dGain);
      dGain.connect(dest);
      drum.start(t);
      drum.stop(t + 0.18);
    }
  }
}

export const soundEngine = new SoundEngine();
