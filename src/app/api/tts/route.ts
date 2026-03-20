// import { NextRequest, NextResponse } from "next/server";

// src/app/api/tts/route.ts
export async function POST(req: Request) {
  const { text } = await req.json();
  
  console.log("🔑 ElevenLabs API Key present:", !!process.env.ELEVENLABS_API_KEY);
  console.log("🎤 Voice ID:", process.env.ELEVENLABS_VOICE_ID);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  console.log("📡 ElevenLabs API response:", response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error("❌ ElevenLabs API error:", error);
    return new Response(error, { status: response.status });
  }

  const audioBuffer = await response.arrayBuffer();
  console.log("📦 Returning audio bytes:", audioBuffer.byteLength);

  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}