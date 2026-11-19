import { GoogleGenAI } from '@google/genai';
import type { Express, Request, Response } from 'express';

export type StudioVoiceRole =
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

type PrebuiltVoiceName = 'Charon' | 'Fenrir' | 'Kore' | 'Puck' | 'Zephyr';

interface VoicePersonaSpec {
  voiceName: PrebuiltVoiceName;
  style: string;
  preferDramaticModel: boolean;
}

const VOICE_PERSONAS: Record<StudioVoiceRole, VoicePersonaSpec> = {
  major_god_male: {
    voiceName: 'Charon',
    style:
      'Deep, thunderous, majestic Olympian sovereign deity speaking clear, commanding Brazilian Portuguese with theatrical studio diction, gravitas, and crisp articulation.',
    preferDramaticModel: true,
  },
  major_god_female: {
    voiceName: 'Kore',
    style:
      'Regal, luminous, authoritative mythological goddess speaking crystal-clear Brazilian Portuguese with poised studio voice acting, noble warmth, and effortless command.',
    preferDramaticModel: true,
  },
  titan: {
    voiceName: 'Charon',
    style:
      'Colossal, resonant ancient Titan speaking slow, thunderous, deeply articulated Brazilian Portuguese with monumental power and full intelligibility.',
    preferDramaticModel: true,
  },
  hero_commander: {
    voiceName: 'Fenrir',
    style:
      'Heroic, resolute battlefield commander speaking clear, confident Brazilian Portuguese with AAA video game dubbing clarity, courage, and crisp consonants.',
    preferDramaticModel: true,
  },
  hero_female: {
    voiceName: 'Kore',
    style:
      'Fierce, noble warrior queen speaking sharp, courageous, crystal-clear Brazilian Portuguese with dramatic AAA game voice-over precision.',
    preferDramaticModel: true,
  },
  warrior_male: {
    voiceName: 'Fenrir',
    style:
      'Disciplined veteran soldier giving a brisk, punchy, crystal-clear military response in natural Brazilian Portuguese, clean studio recording.',
    preferDramaticModel: false,
  },
  warrior_female: {
    voiceName: 'Zephyr',
    style:
      'Agile, confident huntress and scout giving a crisp, alert, clear military response in natural Brazilian Portuguese, clean studio recording.',
    preferDramaticModel: false,
  },
  villager_male: {
    voiceName: 'Puck',
    style:
      'Earnest, grounded citizen and craftsman speaking warm, natural, immediately intelligible Brazilian Portuguese in a clean studio recording.',
    preferDramaticModel: false,
  },
  villager_female: {
    voiceName: 'Zephyr',
    style:
      'Bright, clear, natural citizen speaking lively, crisp, easily understood Brazilian Portuguese in a clean studio recording.',
    preferDramaticModel: false,
  },
  mystic_priest: {
    voiceName: 'Charon',
    style:
      'Calm, wise ancient oracle and temple priest speaking serene, deliberate, crystal-clear Brazilian Portuguese with mystical poise.',
    preferDramaticModel: true,
  },
  myth_beast: {
    voiceName: 'Charon',
    style:
      'Powerful, gravelly mythological guardian speaking fierce yet completely clear and intelligible Brazilian Portuguese with dramatic game dubbing energy.',
    preferDramaticModel: false,
  },
  villain_dark: {
    voiceName: 'Charon',
    style:
      'Menacing, dark mythological warlord speaking sinister, razor-sharp, crystal-clear Brazilian Portuguese with intense theatrical presence.',
    preferDramaticModel: true,
  },
  narrator: {
    voiceName: 'Charon',
    style:
      'Cinematic AAA fantasy narrator speaking rich, warm, measured, crystal-clear Brazilian Portuguese with studio broadcast clarity and dramatic cadence.',
    preferDramaticModel: true,
  },
};

const ACTION_MODIFIERS: Record<string, string> = {
  attack: 'Urgent battle cry energy, fierce determination, crisp articulation, no mumbling.',
  select: 'Alert, attentive, poised readiness, crisp studio voice.',
  move: 'Confident, decisive, brisk obedience in motion.',
  work: 'Willing, steady, grounded tone of industrious duty.',
  dialogue: 'Rich dramatic screenplay delivery, well-paced pauses, broadcast studio clarity.',
  taunt: 'Expressive, playful-confident battlefield banter with crisp diction.',
};

const VALID_ROLES = new Set<StudioVoiceRole>(Object.keys(VOICE_PERSONAS) as StudioVoiceRole[]);

type TtsModelId = 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';

const MAX_CACHE_ENTRIES = 360;
const wavCache = new Map<string, Buffer>();
const inFlight = new Map<string, Promise<Buffer>>();

const modelCooldownUntil = new Map<TtsModelId, number>();
const modelRecentRequests = new Map<TtsModelId, number[]>();

let sharedAiClient: GoogleGenAI | null = null;
let sharedAiKeySnapshot = '';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  if (!apiKey) return null;
  if (!sharedAiClient || sharedAiKeySnapshot !== apiKey) {
    sharedAiKeySnapshot = apiKey;
    sharedAiClient = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return sharedAiClient;
}

function sanitizeSpokenText(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);
}

function sanitizeRole(raw: unknown): StudioVoiceRole {
  if (typeof raw === 'string' && VALID_ROLES.has(raw as StudioVoiceRole)) {
    return raw as StudioVoiceRole;
  }
  return 'warrior_male';
}

function touchCache(key: string, buf: Buffer) {
  if (wavCache.has(key)) {
    wavCache.delete(key);
  }
  wavCache.set(key, buf);
  while (wavCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = wavCache.keys().next().value;
    if (!oldestKey) break;
    wavCache.delete(oldestKey);
  }
}

function recordModelRequest(model: TtsModelId) {
  const now = Date.now();
  const list = (modelRecentRequests.get(model) ?? []).filter((ts) => now - ts < 62_000);
  list.push(now);
  modelRecentRequests.set(model, list);
}

function getRecentModelRequestCount(model: TtsModelId): number {
  const now = Date.now();
  const list = (modelRecentRequests.get(model) ?? []).filter((ts) => now - ts < 62_000);
  modelRecentRequests.set(model, list);
  return list.length;
}

function getModelCooldownRemainingSec(model: TtsModelId): number {
  const until = modelCooldownUntil.get(model) ?? 0;
  const remainingMs = until - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

function extractRateLimitInfo(err: unknown): { isRateLimited: boolean; retryAfterSec: number } {
  const rawStatus =
    (err as { status?: number; statusCode?: number; code?: number })?.status ??
    (err as { statusCode?: number })?.statusCode ??
    (err as { code?: number })?.code;
  const msg = err instanceof Error ? err.message : String(err ?? '');

  const isRateLimited =
    rawStatus === 429 ||
    /"code"\s*:\s*429/.test(msg) ||
    /RESOURCE_EXHAUSTED/i.test(msg) ||
    /quota exceeded|rate[- ]?limit/i.test(msg);

  if (!isRateLimited) {
    return { isRateLimited: false, retryAfterSec: 0 };
  }

  let parsedSec = 60;
  const retryDelayMatch =
    msg.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i) ??
    msg.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  if (retryDelayMatch?.[1]) {
    const num = Number.parseFloat(retryDelayMatch[1]);
    if (Number.isFinite(num) && num > 0) {
      parsedSec = Math.ceil(num) + 2;
    }
  }

  return {
    isRateLimited: true,
    retryAfterSec: Math.max(15, Math.min(120, parsedSec)),
  };
}

export interface SynthesizeVoiceRequest {
  text: string;
  role: StudioVoiceRole;
  action?: string;
  pantheon?: string;
  speaker?: string;
  dramatic?: boolean;
  isPrewarm?: boolean;
}

async function generateWithModel(
  ai: GoogleGenAI,
  model: TtsModelId,
  text: string,
  styleDirection: string,
  voiceName: PrebuiltVoiceName
): Promise<Buffer> {
  const cooldownSec = getModelCooldownRemainingSec(model);
  if (cooldownSec > 0) {
    throw Object.assign(
      new Error(`Limite temporário do modelo ${model}. Tente novamente em ${cooldownSec}s.`),
      { statusCode: 429, retryAfterSec: cooldownSec, fromCooldown: true }
    );
  }

  recordModelRequest(model);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: styleDirection,
              },
            } as unknown as { text: string },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio || typeof base64Audio !== 'string') {
      throw Object.assign(new Error('Modelo de voz não retornou áudio WAV válido.'), {
        statusCode: 502,
      });
    }

    // Unary Gemini 3.8 TTS returns a complete 24kHz 16-bit mono WAV file directly
    return Buffer.from(base64Audio, 'base64');
  } catch (err) {
    const rateLimit = extractRateLimitInfo(err);
    if (rateLimit.isRateLimited) {
      const wasCoolingDown = getModelCooldownRemainingSec(model) > 0;
      modelCooldownUntil.set(model, Date.now() + rateLimit.retryAfterSec * 1000);
      if (!wasCoolingDown) {
        console.warn(
          `[VoiceStudio] Cota temporária atingida em ${model}; pausando chamadas por ${rateLimit.retryAfterSec}s.`
        );
      }
      throw Object.assign(
        new Error(
          `Limite temporário de requisições TTS atingido. Aguarde ${rateLimit.retryAfterSec}s ou selecione uma chave API com faturamento ativo.`
        ),
        { statusCode: 429, retryAfterSec: rateLimit.retryAfterSec, fromCooldown: false }
      );
    }
    throw err;
  }
}

async function synthesizeVoiceWav(req: SynthesizeVoiceRequest): Promise<Buffer> {
  const ai = getAiClient();
  if (!ai) {
    throw Object.assign(new Error('GEMINI_API_KEY não configurada no servidor de áudio.'), {
      statusCode: 503,
    });
  }

  const persona = VOICE_PERSONAS[req.role] ?? VOICE_PERSONAS.warrior_male;
  const actionKey = req.action && ACTION_MODIFIERS[req.action] ? req.action : 'select';
  const useFlagship = Boolean(req.dramatic || persona.preferDramaticModel || actionKey === 'dialogue');
  const primaryModel: TtsModelId = useFlagship ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';
  const fallbackModel: TtsModelId =
    primaryModel === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-lite-tts' : 'gemini-3.8-flash-tts';

  const speakerHint = req.speaker ? ` Character: ${req.speaker}.` : '';
  const pantheonHint = req.pantheon ? ` Pantheon flavor: ${req.pantheon}.` : '';
  const styleDirection = `${persona.style} ${ACTION_MODIFIERS[actionKey]}${speakerHint}${pantheonHint}`;

  const cacheKey = `${persona.voiceName}|${req.role}|${actionKey}|${req.text.toLowerCase()}`;
  const cached = wavCache.get(cacheKey);
  if (cached) {
    touchCache(cacheKey, cached);
    return cached;
  }

  const existingPromise = inFlight.get(cacheKey);
  if (existingPromise) {
    return existingPromise;
  }

  const generationPromise = (async () => {
    const candidateModels: TtsModelId[] = req.isPrewarm
      ? [primaryModel]
      : [primaryModel, fallbackModel];

    let lastErr: unknown = null;
    for (const model of candidateModels) {
      if (getModelCooldownRemainingSec(model) > 0) {
        lastErr = Object.assign(
          new Error(`Limite temporário do modelo ${model}.`),
          {
            statusCode: 429,
            retryAfterSec: getModelCooldownRemainingSec(model),
            fromCooldown: true,
          }
        );
        continue;
      }

      try {
        const wavBuffer = await generateWithModel(
          ai,
          model,
          req.text,
          styleDirection,
          persona.voiceName
        );
        touchCache(cacheKey, wavBuffer);
        return wavBuffer;
      } catch (err) {
        lastErr = err;
        const status = (err as { statusCode?: number })?.statusCode;
        if (status !== 429) {
          throw err;
        }
      }
    }

    const minCooldown = Math.min(
      getModelCooldownRemainingSec(primaryModel) || 60,
      getModelCooldownRemainingSec(fallbackModel) || 60
    );
    if (lastErr && (lastErr as { statusCode?: number }).statusCode === 429) {
      throw Object.assign(lastErr, { retryAfterSec: Math.max(15, minCooldown) });
    }
    throw lastErr ?? new Error('Falha ao gerar áudio neural.');
  })();

  inFlight.set(cacheKey, generationPromise);
  try {
    return await generationPromise;
  } finally {
    inFlight.delete(cacheKey);
  }
}

export function registerVoiceStudioRoutes(app: Express): void {
  app.get('/api/tts/status', (_req: Request, res: Response) => {
    const liteCooldown = getModelCooldownRemainingSec('gemini-3.8-flash-lite-tts');
    const flashCooldown = getModelCooldownRemainingSec('gemini-3.8-flash-tts');
    res.json({
      available: Boolean(process.env.GEMINI_API_KEY?.trim()),
      cachedClips: wavCache.size,
      cooldownSec: Math.min(liteCooldown, flashCooldown),
      models: {
        unitBarks: 'gemini-3.8-flash-lite-tts',
        dramaticDialogue: 'gemini-3.8-flash-tts',
      },
    });
  });

  app.post('/api/tts/speak', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const text = sanitizeSpokenText(body.text);
    if (!text) {
      res.status(400).json({ error: 'Texto da fala é obrigatório.' });
      return;
    }

    const role = sanitizeRole(body.role);
    const action = typeof body.action === 'string' ? body.action.slice(0, 24) : 'select';
    const pantheon = typeof body.pantheon === 'string' ? body.pantheon.slice(0, 24) : undefined;
    const speaker = typeof body.speaker === 'string' ? body.speaker.slice(0, 40) : undefined;
    const dramatic = Boolean(body.dramatic);

    try {
      const wavBuffer = await synthesizeVoiceWav({
        text,
        role,
        action,
        pantheon,
        speaker,
        dramatic,
      });
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Voice-Role', role);
      res.send(wavBuffer);
    } catch (err) {
      const typedErr = err as { statusCode?: number; retryAfterSec?: number };
      const rateLimit = extractRateLimitInfo(err);
      const status = rateLimit.isRateLimited
        ? 429
        : typeof typedErr.statusCode === 'number'
        ? typedErr.statusCode
        : 502;
      const retryAfterSec = typedErr.retryAfterSec ?? rateLimit.retryAfterSec;
      const message = err instanceof Error ? err.message : 'Falha ao gerar áudio neural.';

      if (status === 429) {
        const waitSec = Math.max(15, retryAfterSec || 60);
        res.setHeader('Retry-After', String(waitSec));
        res.status(429).json({
          error: message,
          rateLimited: true,
          retryAfterSec: waitSec,
        });
        return;
      }

      console.error('[VoiceStudio] Erro na síntese TTS:', message);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/tts/prewarm', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as { lines?: Array<Record<string, unknown>> };
    const rawLines = Array.isArray(body.lines) ? body.lines.slice(0, 2) : [];
    if (!process.env.GEMINI_API_KEY?.trim() || rawLines.length === 0) {
      res.json({ warmed: 0, cachedClips: wavCache.size });
      return;
    }

    let warmed = 0;
    let rateLimited = false;
    let retryAfterSec = 0;

    const tasks = rawLines
      .map((item) => ({
        text: sanitizeSpokenText(item.text),
        role: sanitizeRole(item.role),
        action: typeof item.action === 'string' ? item.action.slice(0, 24) : 'select',
        pantheon: typeof item.pantheon === 'string' ? item.pantheon.slice(0, 24) : undefined,
        speaker: typeof item.speaker === 'string' ? item.speaker.slice(0, 40) : undefined,
        dramatic: Boolean(item.dramatic),
        isPrewarm: true,
      }))
      .filter((t) => Boolean(t.text));

    // Synthesize at most 1 uncached line per prewarm request and never exhaust free-tier RPM
    for (const task of tasks) {
      const persona = VOICE_PERSONAS[task.role] ?? VOICE_PERSONAS.warrior_male;
      const actionKey = task.action && ACTION_MODIFIERS[task.action] ? task.action : 'select';
      const cacheKey = `${persona.voiceName}|${task.role}|${actionKey}|${task.text.toLowerCase()}`;
      if (wavCache.has(cacheKey)) {
        warmed++;
        continue;
      }

      const model: TtsModelId =
        task.dramatic || persona.preferDramaticModel || actionKey === 'dialogue'
          ? 'gemini-3.8-flash-tts'
          : 'gemini-3.8-flash-lite-tts';

      const cooldown = getModelCooldownRemainingSec(model);
      if (cooldown > 0) {
        rateLimited = true;
        retryAfterSec = cooldown;
        break;
      }

      // Leave headroom for interactive user clicks/dialogues
      if (getRecentModelRequestCount(model) >= 2) {
        rateLimited = true;
        retryAfterSec = 30;
        break;
      }

      try {
        await synthesizeVoiceWav(task);
        warmed++;
      } catch (err) {
        const rl = extractRateLimitInfo(err);
        if (rl.isRateLimited || (err as { statusCode?: number })?.statusCode === 429) {
          rateLimited = true;
          retryAfterSec = (err as { retryAfterSec?: number })?.retryAfterSec ?? rl.retryAfterSec;
        }
      }
      break;
    }

    res.json({ warmed, cachedClips: wavCache.size, rateLimited, retryAfterSec });
  });
}
