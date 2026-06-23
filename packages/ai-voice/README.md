# @neelkirit/ai-voice

Isomorphic TypeScript TTS library for OpenAI, ElevenLabs, and Google Cloud TTS. **BYOK** — bring your own API key. Works in Node 18+ and modern browsers (no vendor SDKs, just `fetch`).

## Install

```bash
npm install @neelkirit/ai-voice
```

## Quick start

```ts
import { synthesize } from "@neelkirit/ai-voice";

const bytes = await synthesize({
  provider: "openai",
  apiKey: "sk-...",
  text: "Hello, world!",
});
// bytes is a Uint8Array of MP3 audio
```

## Streaming

```ts
import { synthesizeStream } from "@neelkirit/ai-voice";

const stream = await synthesizeStream({
  provider: "elevenlabs",
  apiKey: "xi-...",
  text: "Hello from ElevenLabs!",
});
// stream is a ReadableStream<Uint8Array>
```

## Providers

### OpenAI

```ts
await synthesize({
  provider: "openai",
  apiKey: "sk-...",         // sk-...
  text: "Hello",
  voice: {
    gender: "female",       // male | female | neutral (default)
    speed: 1.2,             // 0.25–4.0
    voiceId: "shimmer",     // overrides gender
  },
});
```

Default voices: `male → onyx`, `female → nova`, `neutral → alloy`.

### ElevenLabs

```ts
await synthesize({
  provider: "elevenlabs",
  apiKey: "xi-...",
  text: "Hello",
  voice: {
    gender: "female",
    speed: 1.0,              // 0.7–1.2 (clamped per ElevenLabs limits)
    voiceId: "EXAVITQu4vr4xnSDxMaL", // overrides gender
  },
});
```

Default voices: `male → Josh`, `female → Bella`, `neutral → Rachel`.

### Google Cloud TTS

```ts
await synthesize({
  provider: "google",
  apiKey: "AIza...",         // Google API key (must have Cloud TTS enabled)
  text: "Hello",
  voice: {
    language: "en-US",       // BCP-47 tag
    gender: "female",
    speed: 1.0,              // 0.25–4.0
    pitch: 2.0,              // -20.0 to +20.0 semitones
    voiceId: "en-US-Neural2-A", // overrides gender (sets voice.name)
  },
});
```

## Voice parameters by provider

| Param | OpenAI | ElevenLabs | Google |
|---|---|---|---|
| `voiceId` | ✓ | ✓ | ✓ (mapped to `name`) |
| `gender` | ✓ (default) | ✓ (default) | ✓ (default) |
| `speed` | ✓ 0.25–4.0 | ✓ 0.7–1.2 | ✓ 0.25–4.0 |
| `pitch` | — | — | ✓ -20–+20 |
| `language` | — | — | ✓ |

## Error handling

```ts
import { synthesize, InvalidApiKeyError, ProviderError, VoiceAppError } from "@neelkirit/ai-voice";

try {
  const bytes = await synthesize({ provider: "openai", apiKey: "bad", text: "hi" });
} catch (e) {
  if (e instanceof InvalidApiKeyError) {
    console.error("Check your API key for:", e.provider);
  } else if (e instanceof ProviderError) {
    console.error("Provider returned an error:", e.message);
  } else if (e instanceof VoiceAppError) {
    console.error("Library error:", e.message);
  }
}
```

## Security note

This is a BYOK library — API keys are used directly in HTTP calls from wherever the library runs. In browser contexts (e.g. the demo site), the key is visible in DevTools network requests. **Do not use production keys in browser demos.** For server-side use (Node.js), keys stay server-side and are safe.

## License

MIT
