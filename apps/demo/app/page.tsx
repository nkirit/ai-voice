"use client";

import { useEffect, useRef, useState } from "react";
import { synthesize, VoiceAppError } from "@nkirit/ai-voice";
import type { Provider } from "@nkirit/ai-voice";

const PROVIDERS: { value: Provider; label: string; placeholder: string }[] = [
  { value: "openai",     label: "OpenAI",     placeholder: "sk-..." },
  { value: "elevenlabs", label: "ElevenLabs", placeholder: "xi-..." },
  { value: "google",     label: "Google",     placeholder: "AIza..." },
];

const GENDERS = ["neutral", "male", "female"] as const;
type Gender = (typeof GENDERS)[number];

const storageKey = (p: Provider) => `ai-voice-demo:${p}:apiKey`;

export default function DemoPage() {
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey]     = useState("");
  const [text, setText]         = useState("Hello! I'm your AI assistant. How can I help you today?");
  const [voiceId, setVoiceId]   = useState("");
  const [gender, setGender]     = useState<Gender>("neutral");
  const [language, setLanguage] = useState("en-US");
  const [speed, setSpeed]       = useState(1.0);
  const [pitch, setPitch]       = useState(0.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const prevUrlRef              = useRef<string | null>(null);

  // Load saved API key when provider changes
  useEffect(() => {
    setApiKey(localStorage.getItem(storageKey(provider)) ?? "");
  }, [provider]);

  function saveApiKey(v: string) {
    setApiKey(v);
    if (v) localStorage.setItem(storageKey(provider), v);
    else   localStorage.removeItem(storageKey(provider));
  }

  async function handleSynthesize() {
    setBusy(true);
    setError(null);
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    setAudioUrl(null);

    try {
      const bytes = await synthesize({
        provider,
        apiKey,
        text,
        voice: {
          ...(voiceId ? { voiceId } : {}),
          gender,
          language,
          speed,
          ...(provider === "google" ? { pitch } : {}),
        },
      });
      const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
      prevUrlRef.current = url;
      setAudioUrl(url);
    } catch (e) {
      if (e instanceof VoiceAppError) setError(e.message);
      else setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const providerMeta = PROVIDERS.find((p) => p.value === provider)!;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-12 px-4">
      {/* Warning banner */}
      <div className="w-full max-w-2xl mb-8 rounded-lg bg-amber-900/40 border border-amber-600/50 px-4 py-3 text-sm text-amber-200">
        <strong>Security note:</strong> Your API key is stored in your browser (localStorage) and sent
        directly to the provider from your browser. Do not paste production keys here.
      </div>

      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-white">@nkirit/ai-voice</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Isomorphic TTS library for OpenAI, ElevenLabs, and Google Cloud TTS.{" "}
          <a
            href="https://www.npmjs.com/package/@nkirit/ai-voice"
            className="underline text-blue-400 hover:text-blue-300"
            target="_blank"
            rel="noreferrer"
          >
            npm install @nkirit/ai-voice
          </a>
        </p>

        <div className="space-y-5 bg-gray-900 rounded-xl p-6 border border-gray-800">
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              {providerMeta.label} API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              placeholder={providerMeta.placeholder}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Voice ID + Gender (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Voice ID <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                placeholder="overrides gender"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Gender (default)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Language{" "}
              <span className="text-gray-500 text-xs">
                {provider !== "google" ? "(Google only)" : "(BCP-47, e.g. en-US)"}
              </span>
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={provider !== "google"}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Speed: <span className="text-blue-400">{speed.toFixed(2)}×</span>
            </label>
            <input
              type="range"
              min={0.25}
              max={4.0}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>0.25×</span><span>4.0×</span>
            </div>
          </div>

          {/* Pitch — Google only */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${provider === "google" ? "text-gray-300" : "text-gray-600"}`}>
              Pitch:{" "}
              <span className={provider === "google" ? "text-blue-400" : "text-gray-600"}>
                {pitch >= 0 ? "+" : ""}{pitch.toFixed(1)} st
              </span>
              {provider !== "google" && <span className="ml-2 text-xs">(Google only)</span>}
            </label>
            <input
              type="range"
              min={-20}
              max={20}
              step={0.5}
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              disabled={provider !== "google"}
              className="w-full accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>-20 st</span><span>+20 st</span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSynthesize}
            disabled={busy || !apiKey.trim() || !text.trim()}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {busy ? "Synthesizing…" : "Synthesize"}
          </button>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-900/40 border border-red-700/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Audio player */}
          {audioUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Output</label>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={audioUrl} className="w-full" autoPlay />
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Built with{" "}
          <a href="https://www.npmjs.com/package/@nkirit/ai-voice" className="underline hover:text-gray-400" target="_blank" rel="noreferrer">
            @nkirit/ai-voice
          </a>
        </p>
      </div>
    </main>
  );
}
