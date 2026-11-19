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

const MAX_CACHE_ENTRIES = 360;
const wavCache = new Map<string, Buffer>();
const inFlight = new Map<string, Promise<Buffer>>();

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

export interface SynthesizeVoiceRequest {
  text: string;
  role: StudioVoiceRole;
  action?: string;
  pantheon?: string;
  speaker?: string;
  dramatic?: boolean;
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
  const model = useFlagship ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

  const speakerHint = req.speaker ? ` Character: ${req.speaker}.` : '';
  const pantheonHint = req.pantheon ? ` Pantheon flavor: ${req.pantheon}.` : '';
  const styleDirection = `${persona.style} ${ACTION_MODIFIERS[actionKey]}${speakerHint}${pantheonHint}`;

  const cacheKey = `${model}|${persona.voiceName}|${req.role}|${actionKey}|${req.text.toLowerCase()}`;
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
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: req.text,
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
              voiceName: persona.voiceName,
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
    const wavBuffer = Buffer.from(base64Audio, 'base64');
    touchCache(cacheKey, wavBuffer);
    return wavBuffer;
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
    res.json({
      available: Boolean(process.env.GEMINI_API_KEY?.trim()),
      cachedClips: wavCache.size,
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
      const status =
        typeof (err as { statusCode?: number }).statusCode === 'number'
          ? (err as { statusCode: number }).statusCode
          : 502;
      const message = err instanceof Error ? err.message : 'Falha ao gerar áudio neural.';
      console.error('[VoiceStudio] Erro na síntese TTS:', message);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/tts/prewarm', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as { lines?: Array<Record<string, unknown>> };
    const rawLines = Array.isArray(body.lines) ? body.lines.slice(0, 6) : [];
    if (!process.env.GEMINI_API_KEY?.trim() || rawLines.length === 0) {
      res.json({ warmed: 0 });
      return;
    }

    let warmed = 0;
    const tasks = rawLines
      .map((item) => ({
        text: sanitizeSpokenText(item.text),
        role: sanitizeRole(item.role),
        action: typeof item.action === 'string' ? item.action.slice(0, 24) : 'select',
        pantheon: typeof item.pantheon === 'string' ? item.pantheon.slice(0, 24) : undefined,
        speaker: typeof item.speaker === 'string' ? item.speaker.slice(0, 40) : undefined,
        dramatic: Boolean(item.dramatic),
      }))
      .filter((t) => Boolean(t.text));

    // Process 2 at a time to keep server responsive and fast
    for (let i = 0; i < tasks.length; i += 2) {
      const batch = tasks.slice(i, i + 2);
      const results = await Promise.allSettled(batch.map((t) => synthesizeVoiceWav(t)));
      for (const r of results) {
        if (r.status === 'fulfilled') warmed++;
      }
    }

    res.json({ warmed, cachedClips: wavCache.size });
  });
}
