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

Deployment is automated via GitHub Actions on every push to `main`. First-time setup:

### 1. Get your Vercel credentials

**VERCEL_TOKEN** — go to `vercel.com/account/tokens` → **Create** → copy the token.

**VERCEL_ORG_ID + VERCEL_PROJECT_ID** — link the project locally (no global install needed):

```bash
npx vercel login
npx vercel link
```

This creates `.vercel/project.json` with both IDs:

```json
{
  "orgId": "...",
  "projectId": "..."
}
```

### 2. Add secrets to GitHub

Go to your repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | token from step 1 |
| `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

### 3. Deploy

Push to `main` — the [`deploy-demo` workflow](./.github/workflows/deploy-demo.yml) will build and deploy automatically. You can also trigger it manually from the Actions tab.
