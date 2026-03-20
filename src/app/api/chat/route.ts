import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildRAGPrompt, detectNavigationIntent, type ConversationMode } from "@/lib/prompts";
import { retrieveContext } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });
    const body = await req.json();
    const {
      message,
      bookId,
      currentPage,
      highlightedText,
      mode = "buddy",
      conversationHistory = [],
    } = body as {
      message: string;
      bookId: string;
      currentPage: number;
      highlightedText?: string;
      mode?: ConversationMode;
      conversationHistory?: Array<{ role: string; content: string }>;
    };

    // Check for navigation intent
    const navIntent = detectNavigationIntent(message);
    if (navIntent) {
      return NextResponse.json({
        response: navIntent === "next" ? "Turning to the next page..." : "Going back a page...",
        navigation: navIntent,
      });
    }

    // Retrieve RAG context
    let bookContext = "";
    let supplementaryContext = "";

    try {
      const context = await retrieveContext(bookId, message, currentPage, highlightedText);
      bookContext = context.bookContext;
      supplementaryContext = context.supplementaryContext;
    } catch {
      // Fallback: proceed without RAG context if DB isn't set up
      bookContext = highlightedText
        ? `The reader has highlighted: "${highlightedText}"`
        : "No specific book context available.";
    }

    // Build prompt and call LLM
    const messages = buildRAGPrompt(
      mode,
      bookContext,
      message,
      conversationHistory,
      supplementaryContext
    );

    let response = "I'm not sure how to respond to that.";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      });
      response = completion.choices[0]?.message?.content || response;
    } catch (openaiError) {
      console.warn("OpenAI failed, falling back to Gemini:", openaiError);
      
      // Fallback to Gemini
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Convert OpenAI messages format to Gemini format
      const geminiPrompt = messages.map(m => `${m.role.toUpperCase()}:\n${m.content}`).join("\n\n") + "\n\nASSISTANT:\n";
      
      const result = await model.generateContent(geminiPrompt);
      response = result.response.text() || response;
    }

    // Check if AI response contains navigation command
    const aiNavIntent = response.includes("[NAV:NEXT]")
      ? "next"
      : response.includes("[NAV:PREV]")
      ? "prev"
      : null;

    const cleanResponse = response.replace(/\[NAV:(NEXT|PREV)\]/g, "").trim();

    return NextResponse.json({
      response: cleanResponse,
      navigation: aiNavIntent,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Check your API keys." },
      { status: 500 }
    );
  }
}
