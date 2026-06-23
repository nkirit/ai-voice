import { describe, it, expect, vi } from "vitest";
import { synthesize, InvalidApiKeyError, ProviderError } from "../src/index.js";

function googleResponse(audioBase64: string) {
  return new Response(JSON.stringify({ audioContent: audioBase64 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// "ABC" in base64 is QUJD
const TEST_B64 = btoa("ABC");

describe("google provider", () => {
  it("sends key in query param, correct body, and decodes base64 response", async () => {
    const mockFetch = vi.fn(async () => googleResponse(TEST_B64));
    const bytes = await synthesize({
      provider: "google",
      apiKey: "AIza-test",
      text: "Hello",
      voice: { language: "en-US", gender: "female", speed: 1.2, pitch: 2.5 },
      fetch: mockFetch as unknown as typeof fetch,
    });

    expect(bytes).toEqual(new Uint8Array([65, 66, 67])); // "ABC"
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("key=AIza-test");
    expect(url).toContain("texttospeech.googleapis.com");
    const body = JSON.parse(init.body as string);
    expect(body.input.text).toBe("Hello");
    expect(body.voice.languageCode).toBe("en-US");
    expect(body.voice.ssmlGender).toBe("FEMALE");
    expect(body.audioConfig.speakingRate).toBe(1.2);
    expect(body.audioConfig.pitch).toBe(2.5);
    expect(body.audioConfig.audioEncoding).toBe("MP3");
  });

  it("uses voice.name when voiceId provided (no ssmlGender)", async () => {
    const mockFetch = vi.fn(async () => googleResponse(TEST_B64));
    await synthesize({
      provider: "google", apiKey: "AIza-test", text: "hi",
      voice: { voiceId: "en-US-Neural2-A" },
      fetch: mockFetch as unknown as typeof fetch,
    });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.voice.name).toBe("en-US-Neural2-A");
    expect(body.voice.ssmlGender).toBeUndefined();
  });

  it("clamps pitch to -20..+20", async () => {
    const mockFetch = vi.fn(async () => googleResponse(TEST_B64));
    await synthesize({
      provider: "google", apiKey: "AIza-test", text: "hi",
      voice: { pitch: 999 },
      fetch: mockFetch as unknown as typeof fetch,
    });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.audioConfig.pitch).toBe(20);
  });

  it("throws InvalidApiKeyError on 403", async () => {
    const mockFetch = vi.fn(async () => new Response("denied", { status: 403 }));
    await expect(
      synthesize({ provider: "google", apiKey: "bad", text: "hi", fetch: mockFetch as unknown as typeof fetch })
    ).rejects.toBeInstanceOf(InvalidApiKeyError);
  });

  it("throws ProviderError when audioContent missing", async () => {
    const mockFetch = vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }));
    await expect(
      synthesize({ provider: "google", apiKey: "AIza-test", text: "hi", fetch: mockFetch as unknown as typeof fetch })
    ).rejects.toBeInstanceOf(ProviderError);
  });
});
