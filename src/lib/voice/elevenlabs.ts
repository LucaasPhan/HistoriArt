// ─── ElevenLabs Voice Configuration ──────────────────────────

export interface ElevenLabsConfig {
  apiKey: string;
  agentId: string;
}

// TTS via ElevenLabs REST API (fallback when not using Conversational AI)
export async function textToSpeech(
  text: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM" // Rachel - warm, calm voice
): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) throw new Error("ElevenLabs TTS failed");
    return await response.arrayBuffer();
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return null;
  }
}

// Browser-native TTS fallback
export function browserTTS(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.name.includes("Samantha") ||
      v.name.includes("Karen") ||
      v.name.includes("Google") ||
      v.lang.startsWith("en")
  );
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
