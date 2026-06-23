import { describe, it, expect, vi } from "vitest";
import { synthesize, InvalidApiKeyError, ProviderError } from "../src/index.js";

function mp3Response() {
  const body = new ReadableStream<Uint8Array>({
    start(c) { c.enqueue(new Uint8Array([1, 2, 3])); c.close(); },
  });
  return new Response(body, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
}

describe("openai provider", () => {
  it("sends correct URL, headers, and body", async () => {
    const mockFetch = vi.fn(async () => mp3Response());
    const bytes = await synthesize({
      provider: "openai",
      apiKey: "sk-test",
      text: "Hello",
      voice: { gender: "female", speed: 1.5 },
      fetch: mockFetch as unknown as typeof fetch,
    });

    expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/audio/speech");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer sk-test");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      model: "tts-1-hd",
      voice: "nova",
      input: "Hello",
      response_format: "mp3",
      speed: 1.5,
    });
  });

  it("defaults to neutral voice (alloy)", async () => {
    const mockFetch = vi.fn(async () => mp3Response());
    await synthesize({ provider: "openai", apiKey: "sk-test", text: "Hi", fetch: mockFetch as unknown as typeof fetch });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.voice).toBe("alloy");
  });

  it("uses voiceId when provided", async () => {
    const mockFetch = vi.fn(async () => mp3Response());
    await synthesize({
      provider: "openai", apiKey: "sk-test", text: "Hi",
      voice: { voiceId: "shimmer" },
      fetch: mockFetch as unknown as typeof fetch,
    });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.voice).toBe("shimmer");
  });

  it("clamps speed to 0.25–4.0", async () => {
    const mockFetch = vi.fn(async () => mp3Response());
    await synthesize({
      provider: "openai", apiKey: "sk-test", text: "Hi",
      voice: { speed: 10 },
      fetch: mockFetch as unknown as typeof fetch,
    });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.speed).toBe(4.0);
  });

  it("throws InvalidApiKeyError on 401", async () => {
    const mockFetch = vi.fn(async () => new Response("Unauthorized", { status: 401 }));
    await expect(
      synthesize({ provider: "openai", apiKey: "bad", text: "hi", fetch: mockFetch as unknown as typeof fetch })
    ).rejects.toBeInstanceOf(InvalidApiKeyError);
  });

  it("throws ProviderError on 500", async () => {
    const mockFetch = vi.fn(async () => new Response("Server Error", { status: 500 }));
    await expect(
      synthesize({ provider: "openai", apiKey: "sk-test", text: "hi", fetch: mockFetch as unknown as typeof fetch })
    ).rejects.toBeInstanceOf(ProviderError);
  });
});
