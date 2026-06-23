import type { SynthesizeOptions } from "../types.js";
import { InvalidApiKeyError, ProviderError } from "../errors.js";
import { clamp } from "../util/clamp.js";
import { base64ToBytes } from "../util/base64.js";

const GENDER_MAP = { male: "MALE", female: "FEMALE", neutral: "NEUTRAL" } as const;

export async function googleStream(opts: SynthesizeOptions): Promise<ReadableStream<Uint8Array>> {
  const f = opts.fetch ?? fetch;
  const v = opts.voice ?? {};
  const language = v.language ?? "en-US";
  const ssmlGender = GENDER_MAP[v.gender ?? "neutral"];
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(opts.apiKey)}`;

  const res = await f(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text: opts.text },
      voice: {
        languageCode: language,
        ...(v.voiceId ? { name: v.voiceId } : { ssmlGender }),
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: clamp(v.speed ?? 1.0, 0.25, 4.0),
        pitch: clamp(v.pitch ?? 0.0, -20, 20),
      },
    }),
    signal: opts.signal,
  });

  if (res.status === 401 || res.status === 403) throw new InvalidApiKeyError("google");
  if (!res.ok) throw new ProviderError("google", new Error(`HTTP ${res.status}: ${await safeText(res)}`));

  const json = (await res.json()) as { audioContent?: string };
  if (!json.audioContent) throw new ProviderError("google", new Error("missing audioContent in response"));
  const bytes = base64ToBytes(json.audioContent);

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return res.statusText; }
}
