#!/usr/bin/env node
import { synthesize } from "@neelkirit/ai-voice";
import { writeFileSync } from "node:fs";

const [, , provider, apiKey, ...textParts] = process.argv;
if (!provider || !apiKey || textParts.length === 0) {
  console.error("usage: node node-cli.mjs <openai|elevenlabs|google> <apiKey> <text...>");
  process.exit(1);
}

const bytes = await synthesize({ provider, apiKey, text: textParts.join(" ") });
writeFileSync("out.mp3", bytes);
console.log(`wrote out.mp3 (${bytes.byteLength} bytes)`);
