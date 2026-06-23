import { describe, it, expect, vi } from "vitest";
import { synthesize, InvalidApiKeyError, ProviderError } from "../src/index.js";

function mp3Response() {
  const body = new ReadableStream<Uint8Array>({
    start(c) { c.enqueue(new Uint8Array([4, 5, 6])); c.close(); },
  });
  return new Response(body, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
}

describe("elevenlabs provider", () => {
  it("sends correct URL, xi-api-key header, and body", async () => {
    const mockFetch = vi.fn(async () => mp3Response());
    await synthesize({
      provider: "elevenlabs",
      apiKey: "xi-test",
      text: "Hello",
      voice: { gender: "male", speed: 1.0 },
      fetch: mockFetch as unknown as typeof fetch,
    });

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    // neutral default voice for male is Josh
    expect(url).toContain("TxGEqnHWrfWFTfGW9XjX");
    expect(url).toContain("/stream");
    const headers = init.headers as Record<string, string>;
    expect(headers["xi-api-key"]).toBe("xi-test");
    const body = JSON.parse(init.body as string);
    expect(body.model_id).toBe("eleven_turbo_v2_5");
    expect(body.voice_settings).toMatchObject({ stability: 0.5, similarity_boost: 0.75 });
  });

  it("clamps speed to 0.7–1.2", async () => {
    const mockFetch = vi.fn(async () => mp3Response());
    await synthesize({
      provider: "elevenlabs", apiKey: "xi-test", text: "hi",
      voice: { speed: 5 },
      fetch: mockFetch as unknown as typeof fetch,
    });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.voice_settings.speed).toBe(1.2);
  });

  it("uses custom voiceId in URL", async () => {
    const mockFetch = vi.fn(async () => mp3Response());
    await synthesize({
      provider: "elevenlabs", apiKey: "xi-test", text: "hi",
      voice: { voiceId: "customVoice123" },
      fetch: mockFetch as unknown as typeof fetch,
    });
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("customVoice123");
  });

  it("throws InvalidApiKeyError on 401", async () => {
    const mockFetch = vi.fn(async () => new Response("bad key", { status: 401 }));
    await expect(
      synthesize({ provider: "elevenlabs", apiKey: "bad", text: "hi", fetch: mockFetch as unknown as typeof fetch })
    ).rejects.toBeInstanceOf(InvalidApiKeyError);
  });

  it("throws ProviderError on 500", async () => {
    const mockFetch = vi.fn(async () => new Response("err", { status: 500 }));
    await expect(
      synthesize({ provider: "elevenlabs", apiKey: "xi-test", text: "hi", fetch: mockFetch as unknown as typeof fetch })
    ).rejects.toBeInstanceOf(ProviderError);
  });
});
