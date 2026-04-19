import { verifySession } from "@/dal/verifySession";
import { QUIZ_GENERATION_PROMPT } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

// AI generation — admin only

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = (await req.json()) as {
      bookId: string;
      chapterNumber: number;
      pageContent: string;
      count: number;
      questionTypes: string[];
    };

    const { pageContent, count, questionTypes } = body;

    if (!pageContent || !count) {
      return NextResponse.json({ error: "Missing pageContent or count" }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(count, 1), 10);
    const prompt = QUIZ_GENERATION_PROMPT(pageContent, safeCount, questionTypes);
    let responseText = "";
    let provider = "";

    // Try OpenAI first
    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_completion_tokens: 3000,
      });

      responseText = completion.choices[0]?.message?.content || "";
      provider = "openai";
    } catch (openaiError) {
      console.warn("[quiz/generate] OpenAI failed, falling back to Gemini:", openaiError);

      // Gemini fallback
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(prompt);
      responseText = result.response.text() || "";
      provider = "gemini";
    }

    // Parse the JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI did not return valid JSON", raw: responseText },
        { status: 500 },
      );
    }

    const questions = JSON.parse(jsonMatch[0]);
    console.log(`[quiz/generate] Generated ${questions.length} questions via ${provider}`);

    return NextResponse.json({ questions, provider });
  } catch (error) {
    console.error("[POST /api/quiz/generate] Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
