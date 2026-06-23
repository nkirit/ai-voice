import type { SynthesizeOptions } from "../types.js";
import { InvalidApiKeyError, ProviderError } from "../errors.js";
import { clamp } from "../util/clamp.js";

const VOICES = { male: "onyx", female: "nova", neutral: "alloy" } as const;
const TTS_URL = "https://api.openai.com/v1/audio/speech";

export async function openaiStream(opts: SynthesizeOptions): Promise<ReadableStream<Uint8Array>> {
  const f = opts.fetch ?? fetch;
  const v = opts.voice ?? {};
  const voice = v.voiceId ?? VOICES[v.gender ?? "neutral"];

  const res = await f(TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      voice,
      input: opts.text,
      response_format: "mp3",
      speed: clamp(v.speed ?? 1.0, 0.25, 4.0),
    }),
    signal: opts.signal,
  });

  if (res.status === 401 || res.status === 403) throw new InvalidApiKeyError("openai");
  if (!res.ok) throw new ProviderError("openai", new Error(`HTTP ${res.status}: ${await safeText(res)}`));
  if (!res.body) throw new ProviderError("openai", new Error("empty response body"));
  return res.body;
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return res.statusText; }
}
