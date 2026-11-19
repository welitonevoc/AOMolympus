import type { PantheonId } from '../types';

export type ClientStudioVoiceRole =
  | 'major_god_male'
  | 'major_god_female'
  | 'titan'
  | 'hero_commander'
  | 'hero_female'
  | 'warrior_male'
  | 'warrior_female'
  | 'villager_male'
  | 'villager_female'
  | 'mystic_priest'
  | 'myth_beast'
  | 'villain_dark'
  | 'narrator';

export interface StudioSpeakRequest {
  text: string;
  role: ClientStudioVoiceRole;
  action?: 'select' | 'move' | 'attack' | 'work' | 'dialogue' | 'taunt';
  pantheon?: PantheonId | string;
  speaker?: string;
  dramatic?: boolean;
  volumeScale?: number;
  /** High-priority lines (dialogues / gods) never get preempted by regular unit barks */
  priority?: 'normal' | 'high';
}

const MAX_CLIENT_BUFFER_CACHE = 220;

const DIVINE_ROLES = new Set<ClientStudioVoiceRole>([
  'major_god_male',
  'major_god_female',
  'titan',
  'narrator',
]);

/**
 * Infers the most fitting studio voice persona for a Campaign or Scenario speaker name.
 */
export function inferVoiceRoleFromSpeaker(speaker?: string): ClientStudioVoiceRole {
  if (!speaker) return 'narrator';
  const s = speaker
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (/(atena|artemis|afrodite|isis|gaia|hera|freya|bast|neftis|deusa)/.test(s)) {
    return 'major_god_female';
  }
  if (/(zeus|poseidon|hades|ares|hefesto|apolo|hermes|dionisio|ra|odin|thor|loki|osiris|oranos|urano|cronos|kronos|deus)/.test(s)) {
    return 'major_god_male';
  }
  if (/(tita|titan|colosso|beemote|gigante)/.test(s)) {
    return 'titan';
  }
  if (/(amanra|hipolita|valquiria|reginleif|amazona|caladria|medusa)/.test(s)) {
    return 'hero_female';
  }
  if (/(kamos|arauto|sacerdote de set|set|gargarensis|tartaro|inimigo|invasor)/.test(s)) {
    return 'villain_dark';
  }
  if (/(oraculo|sacerdote|druida|jiang|sabio|profeta)/.test(s)) {
    return 'mystic_priest';
  }
  if (/(arkantos|ajax|odisseu|jasao|perseu|teseu|belerofonte|kastor|castor|farao|hersir|comando|comandante|general|heroi|rei|xogum|legatus|jarl)/.test(s)) {
    return 'hero_commander';
  }
  if (/(batedor|explorador|arqueir|sentinela)/.test(s)) {
    return 'warrior_male';
  }
  if (/(aldeao|cidadao|campones|anao)/.test(s)) {
    return 'villager_male';
  }
  return 'narrator';
}

/**
 * Strips broken syllable hyphens and excess punctuation so neural TTS speaks
 * crisp, natural, fully intelligible studio dialogue.
 */
export function normalizeSpokenScript(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[“”"]/g, '')
    .trim();
}

export class StudioVoicePlayer {
  private bufferCache = new Map<string, AudioBuffer>();
  private inFlightFetch = new Map<string, Promise<AudioBuffer | null>>();

  private masteringCtx: AudioContext | null = null;
  private dryInput: BiquadFilterNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private voiceMasterGain: GainNode | null = null;

  private activeSource: AudioBufferSourceNode | null = null;
  private activeSourceGain: GainNode | null = null;
  private activePriority: 'normal' | 'high' = 'normal';
  private activeEndsAt = 0;
  private playbackToken = 0;

  private consecutiveServerFailures = 0;
  private cooldownUntilMs = 0;
  private lastPrefetchAtMs = 0;
  private prewarmTimer: ReturnType<typeof setTimeout> | null = null;
  private prewarmQueue: StudioSpeakRequest[] = [];

  private ensureMasteringBus(ctx: AudioContext): {
    dryInput: BiquadFilterNode;
    reverbConvolver: ConvolverNode;
    voiceMasterGain: GainNode;
  } {
    if (this.masteringCtx === ctx && this.dryInput && this.reverbConvolver && this.voiceMasterGain) {
      return {
        dryInput: this.dryInput,
        reverbConvolver: this.reverbConvolver,
        voiceMasterGain: this.voiceMasterGain,
      };
    }

    // 1. High-pass filter (90 Hz) removes low-frequency rumble/muddiness
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(90, ctx.currentTime);
    highpass.Q.setValueAtTime(0.7, ctx.currentTime);

    // 2. Broadcast warmth shelf (220 Hz, +1.5 dB)
    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowshelf';
    warmth.frequency.setValueAtTime(220, ctx.currentTime);
    warmth.gain.setValueAtTime(1.5, ctx.currentTime);

    // 3. Vocal presence EQ (3150 Hz, +3.4 dB) for crisp intelligibility over battle SFX
    const presence = ctx.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.setValueAtTime(3150, ctx.currentTime);
    presence.Q.setValueAtTime(1.1, ctx.currentTime);
    presence.gain.setValueAtTime(3.4, ctx.currentTime);

    // 4. Studio vocal dynamics compressor for polished, even loudness
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-16, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(3.5, ctx.currentTime);
    compressor.attack.setValueAtTime(0.005, ctx.currentTime);
    compressor.release.setValueAtTime(0.14, ctx.currentTime);

    // 5. Master vocal bus gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, ctx.currentTime);

    highpass.connect(warmth);
    warmth.connect(presence);
    presence.connect(compressor);
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 6. Subtle Olympian Temple Hall Reverb send (for Major Gods, Titans & Narrator)
    const convolver = ctx.createConvolver();
    convolver.buffer = this.createHallImpulse(ctx, 1.35, 3.2);
    const reverbFilter = ctx.createBiquadFilter();
    reverbFilter.type = 'lowpass';
    reverbFilter.frequency.setValueAtTime(2600, ctx.currentTime);
    const reverbWet = ctx.createGain();
    reverbWet.gain.setValueAtTime(0.18, ctx.currentTime);

    convolver.connect(reverbFilter);
    reverbFilter.connect(reverbWet);
    reverbWet.connect(compressor);

    this.masteringCtx = ctx;
    this.dryInput = highpass;
    this.reverbConvolver = convolver;
    this.reverbWetGain = reverbWet;
    this.voiceMasterGain = masterGain;

    return { dryInput: highpass, reverbConvolver: convolver, voiceMasterGain: masterGain };
  }

  private createHallImpulse(ctx: AudioContext, durationSec: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * durationSec));
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay);
        // Subtle early-reflection taper so initial consonants remain razor sharp
        const preDelayFade = i < rate * 0.025 ? i / (rate * 0.025) : 1;
        data[i] = (Math.random() * 2 - 1) * env * preDelayFade;
      }
    }
    return impulse;
  }

  private makeCacheKey(req: StudioSpeakRequest): string {
    const clean = normalizeSpokenScript(req.text).toLowerCase();
    return `${req.role}|${req.action ?? 'select'}|${req.dramatic ? '1' : '0'}|${clean}`;
  }

  public hasCached(req: StudioSpeakRequest): boolean {
    const clean = normalizeSpokenScript(req.text);
    if (!clean) return false;
    return this.bufferCache.has(this.makeCacheKey(req));
  }

  private async readBrowserCache(cacheKey: string): Promise<ArrayBuffer | null> {
    if (typeof window === 'undefined' || !('caches' in window)) return null;
    try {
      const cache = await window.caches.open('aom-studio-voice-v1');
      const res = await cache.match(`https://aom.voice.local/${encodeURIComponent(cacheKey)}`);
      if (!res) return null;
      return await res.arrayBuffer();
    } catch {
      return null;
    }
  }

  private async writeBrowserCache(cacheKey: string, data: ArrayBuffer): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cache = await window.caches.open('aom-studio-voice-v1');
      await cache.put(
        `https://aom.voice.local/${encodeURIComponent(cacheKey)}`,
        new Response(data.slice(0), { headers: { 'Content-Type': 'audio/wav' } })
      );
    } catch {
      // ignore quota/private-browsing cache errors
    }
  }

  private cacheBuffer(key: string, buffer: AudioBuffer) {
    if (this.bufferCache.has(key)) {
      this.bufferCache.delete(key);
    }
    this.bufferCache.set(key, buffer);
    while (this.bufferCache.size > MAX_CLIENT_BUFFER_CACHE) {
      const oldest = this.bufferCache.keys().next().value;
      if (!oldest) break;
      this.bufferCache.delete(oldest);
    }
  }

  public stopActiveVoice(ctx?: AudioContext | null) {
    this.playbackToken++;
    if (this.activeSource && this.activeSourceGain) {
      const src = this.activeSource;
      const gain = this.activeSourceGain;
      this.activeSource = null;
      this.activeSourceGain = null;
      this.activeEndsAt = 0;
      this.activePriority = 'normal';
      try {
        const now = ctx ? ctx.currentTime : 0;
        if (ctx) {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(Math.max(0.001, gain.gain.value), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
          src.stop(now + 0.05);
        } else {
          src.stop();
        }
      } catch {
        // already stopped
      }
    }
  }

  private async fetchAndDecode(
    ctx: AudioContext,
    req: StudioSpeakRequest,
    cacheKey: string
  ): Promise<AudioBuffer | null> {
    const cached = this.bufferCache.get(cacheKey);
    if (cached) {
      this.cacheBuffer(cacheKey, cached);
      return cached;
    }

    if (Date.now() < this.cooldownUntilMs) {
      return null;
    }

    const existing = this.inFlightFetch.get(cacheKey);
    if (existing) {
      return existing;
    }

    const cleanText = normalizeSpokenScript(req.text);
    if (!cleanText || typeof fetch === 'undefined') {
      return null;
    }

    const promise = (async (): Promise<AudioBuffer | null> => {
      try {
        // Check persistent browser CacheStorage first (~1ms decode, 0 network roundtrip)
        const browserHit = await this.readBrowserCache(cacheKey);
        if (browserHit && browserHit.byteLength >= 64) {
          const decoded = await ctx.decodeAudioData(browserHit.slice(0));
          this.cacheBuffer(cacheKey, decoded);
          return decoded;
        }

        const resp = await fetch('/api/tts/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            role: req.role,
            action: req.action ?? 'select',
            pantheon: req.pantheon,
            speaker: req.speaker,
            dramatic: Boolean(req.dramatic),
          }),
        });

        if (!resp.ok) {
          if (resp.status === 429) {
            const retryHeader = resp.headers.get('Retry-After');
            let retrySec = retryHeader ? Number.parseInt(retryHeader, 10) : NaN;
            if (!Number.isFinite(retrySec) || retrySec <= 0) {
              try {
                const payload = (await resp.json()) as { retryAfterSec?: number };
                if (typeof payload.retryAfterSec === 'number' && payload.retryAfterSec > 0) {
                  retrySec = payload.retryAfterSec;
                }
              } catch {
                // ignore parse failure
              }
            }
            const waitSec = Number.isFinite(retrySec) && retrySec > 0 ? Math.min(120, retrySec) : 60;
            this.cooldownUntilMs = Math.max(this.cooldownUntilMs, Date.now() + waitSec * 1000);
            return null;
          }
          if (resp.status === 503) {
            this.cooldownUntilMs = Math.max(this.cooldownUntilMs, Date.now() + 120_000);
            return null;
          }
          this.consecutiveServerFailures++;
          if (this.consecutiveServerFailures >= 3) {
            // Brief backoff (20s) if server TTS is temporarily unreachable
            this.cooldownUntilMs = Math.max(this.cooldownUntilMs, Date.now() + 20_000);
          }
          return null;
        }

        const arrayBuf = await resp.arrayBuffer();
        if (!arrayBuf || arrayBuf.byteLength < 64) {
          return null;
        }

        void this.writeBrowserCache(cacheKey, arrayBuf);
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
        this.consecutiveServerFailures = 0;
        this.cooldownUntilMs = 0;
        this.cacheBuffer(cacheKey, decoded);
        return decoded;
      } catch {
        this.consecutiveServerFailures++;
        if (this.consecutiveServerFailures >= 3) {
          this.cooldownUntilMs = Date.now() + 12_000;
        }
        return null;
      }
    })();

    this.inFlightFetch.set(cacheKey, promise);
    try {
      return await promise;
    } finally {
      this.inFlightFetch.delete(cacheKey);
    }
  }

  private playDecodedBuffer(
    ctx: AudioContext,
    buffer: AudioBuffer,
    req: StudioSpeakRequest,
    sfxScale: number,
    onVoiceDuck?: (durationSec: number) => void
  ) {
    // Do not let a regular unit bark interrupt an active high-priority Campaign/God dialogue
    const now = ctx.currentTime;
    const priority = req.priority ?? 'normal';
    if (
      priority === 'normal' &&
      this.activeSource &&
      this.activePriority === 'high' &&
      now < this.activeEndsAt
    ) {
      return;
    }

    this.stopActiveVoice(ctx);

    const { dryInput, reverbConvolver, voiceMasterGain } = this.ensureMasteringBus(ctx);
    voiceMasterGain.gain.setTargetAtTime(Math.min(1.35, 1.08 * sfxScale), now, 0.02);

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const clipGain = ctx.createGain();
    const targetVol = Math.max(0.1, Math.min(1.25, req.volumeScale ?? 1.0));
    clipGain.gain.setValueAtTime(0.001, now);
    clipGain.gain.linearRampToValueAtTime(targetVol, now + 0.014);

    src.connect(clipGain);
    clipGain.connect(dryInput);

    // Subtle temple reverb only on monumental voices (gods, titans, narrator)
    if (DIVINE_ROLES.has(req.role) && this.reverbWetGain) {
      clipGain.connect(reverbConvolver);
    }

    this.activeSource = src;
    this.activeSourceGain = clipGain;
    this.activePriority = priority;
    this.activeEndsAt = now + buffer.duration;

    if (onVoiceDuck) {
      onVoiceDuck(buffer.duration + 0.25);
    }

    src.onended = () => {
      if (this.activeSource === src) {
        this.activeSource = null;
        this.activeSourceGain = null;
        this.activeEndsAt = 0;
        this.activePriority = 'normal';
      }
    };

    src.start(now);
  }

  /**
   * Speaks a line through the Gemini 3.8 Neural Voice Studio server proxy
   * with full WebAudio broadcast vocal mastering and client caching.
   */
  public speak(
    ctx: AudioContext,
    req: StudioSpeakRequest,
    sfxScale: number,
    onVoiceDuck?: (durationSec: number) => void
  ): void {
    if (sfxScale <= 0) return;
    const cleanText = normalizeSpokenScript(req.text);
    if (!cleanText) return;

    const now = ctx.currentTime;
    const priority = req.priority ?? 'normal';
    if (
      priority === 'normal' &&
      this.activeSource &&
      this.activePriority === 'high' &&
      now < this.activeEndsAt
    ) {
      return;
    }

    const cacheKey = this.makeCacheKey(req);
    const cached = this.bufferCache.get(cacheKey);
    if (cached) {
      this.playDecodedBuffer(ctx, cached, req, sfxScale, onVoiceDuck);
      return;
    }

    const myToken = ++this.playbackToken;
    const requestedAtMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    void this.fetchAndDecode(ctx, req, cacheKey).then((decoded) => {
      if (!decoded) return;
      // Discard stale async responses if a newer line was requested while fetching
      if (this.playbackToken !== myToken) return;
      // Never play a delayed unit click/order bark long after the tap — keep it cached for 0ms next click
      const elapsedMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - requestedAtMs;
      if (priority === 'normal' && elapsedMs > 420) return;
      this.playDecodedBuffer(ctx, decoded, req, sfxScale, onVoiceDuck);
    });
  }

  public prefetch(ctx: AudioContext, req: StudioSpeakRequest): void {
    const cleanText = normalizeSpokenScript(req.text);
    if (!cleanText) return;
    const key = this.makeCacheKey(req);
    if (this.bufferCache.has(key)) return;
    const now = Date.now();
    // Respect server cooldown and avoid firing background prefetches faster than free-tier RPM
    if (now < this.cooldownUntilMs || now - this.lastPrefetchAtMs < 22_000 || this.inFlightFetch.size > 0) {
      return;
    }
    this.lastPrefetchAtMs = now;
    void this.fetchAndDecode(ctx, req, key);
  }

  private schedulePrewarmTrickle(ctx: AudioContext, delayMs: number): void {
    if (this.prewarmTimer !== null) {
      clearTimeout(this.prewarmTimer);
      this.prewarmTimer = null;
    }
    if (this.prewarmQueue.length === 0) return;

    this.prewarmTimer = setTimeout(() => {
      this.prewarmTimer = null;
      if (this.prewarmQueue.length === 0) return;

      const now = Date.now();
      if (now < this.cooldownUntilMs) {
        const waitMs = Math.max(5_000, this.cooldownUntilMs - now + 1_500);
        this.schedulePrewarmTrickle(ctx, waitMs);
        return;
      }

      // Skip already cached items without consuming quota
      let nextLine: StudioSpeakRequest | undefined;
      let nextKey = '';
      while (this.prewarmQueue.length > 0) {
        const candidate = this.prewarmQueue.shift();
        if (!candidate) break;
        const k = this.makeCacheKey(candidate);
        if (!this.bufferCache.has(k)) {
          nextLine = candidate;
          nextKey = k;
          break;
        }
      }

      if (!nextLine) return;

      void this.fetchAndDecode(ctx, nextLine, nextKey).finally(() => {
        if (this.prewarmQueue.length === 0) return;
        const afterNow = Date.now();
        const cooldownWait =
          afterNow < this.cooldownUntilMs ? this.cooldownUntilMs - afterNow + 2_000 : 24_000;
        this.schedulePrewarmTrickle(ctx, Math.max(24_000, cooldownWait));
      });
    }, delayMs);
  }

  /**
   * Hydrates persisted voice clips immediately from browser CacheStorage (~1ms), then
   * gently trickles uncached core lines one at a time so free-tier TTS quota is never exceeded.
   */
  public prewarmLines(ctx: AudioContext, lines: StudioSpeakRequest[]): void {
    if (typeof fetch === 'undefined' || lines.length === 0) return;
    const seen = new Set<string>();
    const deduped: StudioSpeakRequest[] = [];
    for (const l of lines) {
      const k = this.makeCacheKey(l);
      if (!seen.has(k) && !this.bufferCache.has(k)) {
        seen.add(k);
        deduped.push(l);
      }
    }
    const targets = deduped.slice(0, 12);
    if (targets.length === 0) return;

    // First hydrate any lines already persisted in browser CacheStorage at ~1ms speed (0 API calls)
    const pendingServer: StudioSpeakRequest[] = [];
    void Promise.all(
      targets.map(async (line) => {
        const key = this.makeCacheKey(line);
        const hit = await this.readBrowserCache(key);
        if (hit && hit.byteLength >= 64) {
          try {
            const decoded = await ctx.decodeAudioData(hit.slice(0));
            this.cacheBuffer(key, decoded);
            return;
          } catch {
            // fall back to trickle server fetch
          }
        }
        pendingServer.push(line);
      })
    ).then(() => {
      if (pendingServer.length === 0) return;
      this.prewarmQueue = pendingServer;
      const initialDelayMs =
        Date.now() < this.cooldownUntilMs ? this.cooldownUntilMs - Date.now() + 2_000 : 2_500;
      this.schedulePrewarmTrickle(ctx, initialDelayMs);
    });
  }
}
