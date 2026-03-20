// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildRAGPrompt,
  detectNavigationIntent,
  type ConversationMode,
} from "@/lib/prompts";
import { retrieveContext } from "@/lib/rag";
import type { ChatUserContext } from "@/lib/schema";

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
      // ── User profile injected by the frontend after login/onboarding ──────
      // When auth is not yet wired up this will simply be undefined and the
      // prompt engine falls back to a generic (non-personalised) response.
      userProfile,
    } = body as {
      message: string;
      bookId: string;
      currentPage: number;
      highlightedText?: string;
      mode?: ConversationMode;
      conversationHistory?: Array<{ role: string; content: string }>;
      userProfile?: ChatUserContext;   // optional until auth is integrated
    };

    // ── Navigation intent ────────────────────────────────────────────────────
    const navIntent = detectNavigationIntent(message);
    if (navIntent) {
      return NextResponse.json({
        response: navIntent === "next" ? "Turning to the next page..." : "Going back a page...",
        navigation: navIntent,
      });
    }

    // ── RAG context retrieval ────────────────────────────────────────────────
    let bookContext = "";
    let supplementaryContext = "";
    try {
      const context = await retrieveContext(bookId, message, currentPage, highlightedText);
      bookContext = context.bookContext;
      supplementaryContext = context.supplementaryContext;
    } catch {
      bookContext = highlightedText
        ? `The reader has highlighted: "${highlightedText}"`
        : "No specific book context available.";
    }

    // ── Prompt construction ──────────────────────────────────────────────────
    // User calibration + CBT layer are both applied inside buildRAGPrompt.
    const messages = buildRAGPrompt(
      mode,
      bookContext,
      message,
      conversationHistory,
      supplementaryContext,
      userProfile,           // undefined = graceful fallback to generic prompt
    );

    // ── LLM call (OpenAI → Gemini fallback) ─────────────────────────────────
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

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-3-flash" });

      const geminiPrompt =
        messages
          .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
          .join("\n\n") + "\n\nASSISTANT:\n";

      const result = await geminiModel.generateContent(geminiPrompt);
      response = result.response.text() || response;
    }

    // ── Navigation tags emitted by the LLM ──────────────────────────────────
    const aiNavIntent = response.includes("[NAV:NEXT]")
      ? "next"
      : response.includes("[NAV:PREV]")
      ? "prev"
      : null;

    const cleanResponse = response.replace(/\[NAV:(NEXT|PREV)\]/g, "").trim();

    return NextResponse.json({
      response: cleanResponse,
      navigation: aiNavIntent,
      mode,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Check your API keys." },
      { status: 500 }
    );
  }
}