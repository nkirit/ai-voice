export type Provider = "openai" | "elevenlabs" | "google";

export interface VoiceParams {
  /** Provider-specific voice identifier. If omitted, a gender-based default is used. */
  voiceId?: string;
  /** Playback rate. Clamped per-provider; canonical input range 0.25–4.0. */
  speed?: number;
  /** Semitones; Google only. -20.0 to +20.0. Silently ignored by OpenAI and ElevenLabs. */
  pitch?: number;
  /** BCP-47 language tag (e.g. "en-US"). Google uses this; OpenAI/ElevenLabs ignore it. */
  language?: string;
  /** Fallback for default voice selection when voiceId is absent. */
  gender?: "male" | "female" | "neutral";
}

export interface SynthesizeOptions {
  provider: Provider;
  /** User-supplied provider API key (sk-... for OpenAI, xi-... for ElevenLabs, AIza... for Google). */
  apiKey: string;
  /** Text to synthesize. Must be non-empty after trim. */
  text: string;
  /** Voice configuration. Provider-specific defaults applied when omitted. */
  voice?: VoiceParams;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
  /** Override the fetch implementation (useful for testing or custom runtimes). */
  fetch?: typeof fetch;
}
