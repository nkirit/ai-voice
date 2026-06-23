import type { SynthesizeOptions } from "../types.js";
import { InvalidApiKeyError, ProviderError } from "../errors.js";
import { clamp } from "../util/clamp.js";

const DEFAULT_VOICES = {
  male:    "TxGEqnHWrfWFTfGW9XjX", // Josh
  female:  "EXAVITQu4vr4xnSDxMaL", // Bella
  neutral: "21m00Tcm4TlvDq8ikWAM", // Rachel
} as const;

export async function elevenlabsStream(opts: SynthesizeOptions): Promise<ReadableStream<Uint8Array>> {
  const f = opts.fetch ?? fetch;
  const v = opts.voice ?? {};
  const voiceId = v.voiceId ?? DEFAULT_VOICES[v.gender ?? "neutral"];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`;

  const res = await f(url, {
    method: "POST",
    headers: {
      "xi-api-key": opts.apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: opts.text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        speed: clamp(v.speed ?? 1.0, 0.7, 1.2),
      },
    }),
    signal: opts.signal,
  });

  if (res.status === 401 || res.status === 403) throw new InvalidApiKeyError("elevenlabs");
  if (!res.ok) throw new ProviderError("elevenlabs", new Error(`HTTP ${res.status}: ${await safeText(res)}`));
  if (!res.body) throw new ProviderError("elevenlabs", new Error("empty response body"));
  return res.body;
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return res.statusText; }
}
