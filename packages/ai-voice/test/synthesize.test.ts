import { describe, it, expect } from "vitest";
import { synthesize, VoiceAppError } from "../src/index.js";

describe("synthesize validation", () => {
  it("throws on empty text", async () => {
    await expect(
      synthesize({ provider: "openai", apiKey: "sk-test", text: "  " })
    ).rejects.toBeInstanceOf(VoiceAppError);
  });

  it("throws on unknown provider", async () => {
    await expect(
      // @ts-expect-error intentional bad provider
      synthesize({ provider: "unknown", apiKey: "key", text: "hi" })
    ).rejects.toBeInstanceOf(VoiceAppError);
  });

  it("throws on missing apiKey", async () => {
    await expect(
      synthesize({ provider: "openai", apiKey: "", text: "hi" })
    ).rejects.toBeInstanceOf(VoiceAppError);
  });
});
