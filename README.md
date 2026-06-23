# ai-voice

Monorepo containing the `@neelkirit/ai-voice` npm library and a Next.js demo site.

## Packages

| Package | Description |
|---|---|
| [`packages/ai-voice`](./packages/ai-voice) | Isomorphic TypeScript TTS library for OpenAI, ElevenLabs, and Google Cloud TTS |
| [`apps/demo`](./apps/demo) | Next.js demo site deployed to Vercel |

## Development

```bash
# Install all workspace deps
npm install

# Build the library
npm run build:lib

# Start the demo site (builds lib first automatically)
npm run dev:demo

# Run library tests
npm test
```

## Publishing the library

```bash
npm run build:lib
cd packages/ai-voice
npm pack --dry-run   # inspect tarball
npm publish --access public
```
