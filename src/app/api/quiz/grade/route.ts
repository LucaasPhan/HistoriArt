import { verifySession } from "@/dal/verifySession";
import { QUIZ_GRADING_PROMPT } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

// AI grading for short answer questions

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = (await req.json()) as {
      userAnswer: string;
      acceptedAnswers: string[];
      question: string;
      language?: "vi" | "en";
    };

    const { userAnswer, acceptedAnswers, question, language = "vi" } = body;

    if (!userAnswer || !acceptedAnswers || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = QUIZ_GRADING_PROMPT(question, userAnswer, acceptedAnswers, language);
    let responseText = "";

    // Try OpenAI first
    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_completion_tokens: 500,
      });

      responseText = completion.choices[0]?.message?.content || "";
    } catch (openaiError) {
      console.warn("[quiz/grade] OpenAI failed, falling back to Gemini:", openaiError);

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(prompt);
      responseText = result.response.text() || "";
    }

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        isCorrect: false,
        feedback: "Không thể chấm điểm. Vui lòng thử lại.",
      });
    }

    const gradeResult = JSON.parse(jsonMatch[0]) as {
      isCorrect: boolean;
      feedback: string;
    };

    return NextResponse.json(gradeResult);
  } catch (error) {
    console.error("[POST /api/quiz/grade] Error:", error);
    return NextResponse.json({ error: "Failed to grade answer" }, { status: 500 });
  }
}
