import type { SynthesizeOptions, Provider } from "./types.js";
import { VoiceAppError } from "./errors.js";
import { openaiStream } from "./providers/openai.js";
import { elevenlabsStream } from "./providers/elevenlabs.js";
import { googleStream } from "./providers/google.js";

const SUPPORTED: readonly Provider[] = ["openai", "elevenlabs", "google"];

export async function synthesizeStream(opts: SynthesizeOptions): Promise<ReadableStream<Uint8Array>> {
  validate(opts);
  switch (opts.provider) {
    case "openai":     return openaiStream(opts);
    case "elevenlabs": return elevenlabsStream(opts);
    case "google":     return googleStream(opts);
  }
}

export async function synthesize(opts: SynthesizeOptions): Promise<Uint8Array<ArrayBuffer>> {
  const stream = await synthesizeStream(opts);
  return collect(stream);
}

function validate(opts: SynthesizeOptions): void {
  if (!opts.text?.trim()) throw new VoiceAppError("text is required and must be non-empty", 400);
  if (!(SUPPORTED as readonly string[]).includes(opts.provider)) {
    throw new VoiceAppError(`provider must be one of: ${SUPPORTED.join(", ")}`, 400);
  }
  if (!opts.apiKey) throw new VoiceAppError("apiKey is required", 400);
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<Uint8Array<ArrayBuffer>> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) { chunks.push(value); total += value.byteLength; }
  }
  const out = new Uint8Array(total) as Uint8Array<ArrayBuffer>;
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.byteLength; }
  return out;
}
