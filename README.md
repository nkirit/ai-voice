# ai-voice

Monorepo containing the `@nkirit/ai-voice` npm library and a Next.js demo site.

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

Publishing is automated via GitHub Actions. To release a new version:

1. Bump the version in `packages/ai-voice/package.json`
2. Commit and push, then tag the release:

```bash
git tag v0.1.1
git push --tags
```

The [`publish` workflow](./.github/workflows/publish.yml) triggers on any `v*` tag, builds the library, and publishes to npm. It requires an `NPM_TOKEN` secret configured in the repository settings.

To publish manually:

```bash
npm run build:lib
cd packages/ai-voice
npm pack --dry-run   # inspect tarball
npm publish --access public
```

## Deploying the demo

The demo site auto-deploys to Vercel on every push to `main` via Vercel's native Git integration.

### First-time setup

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo
2. Set **Root Directory** to `apps/demo`
3. Vercel auto-detects Next.js — click **Deploy**

That's it. No secrets or GitHub Actions needed.
