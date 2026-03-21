// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildRAGPrompt,
  detectNavigationIntent,
  type ConversationMode,
} from "@/lib/prompts";
import { retrieveContext } from "@/lib/rag";
import { ChatUserContext } from "@/drizzle/constants";
import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { userProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });
    const body = await req.json();

    const {
      message,
      bookId,
      bookTitle,
      pageContent,
      currentPage,
      highlightedText,
      mode = "buddy",
      conversationHistory = [],
    } = body as {
      message: string;
      bookId: string;
      bookTitle?: string;
      pageContent?: string;
      currentPage: number;
      highlightedText?: string;
      mode?: ConversationMode;
      conversationHistory?: Array<{ role: string; content: string }>;
    };

    // ── Fetch User Profile Server-Side ───────────────────────────────────────
    let userProfile: ChatUserContext | undefined = undefined;
    const session = await verifySession();
    if (session?.user?.id) {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, session.user.id),
      });
      if (profile) {
        userProfile = {
          name: session.user.name || "Reader",
          age: profile.age,
          gender: profile.gender as any,
          purposeOfUse: profile.purposeOfUse as any,
          customPurpose: profile.customPurpose,
          communicationPreference: profile.communicationPreference as any,
        };
      }
    }

    // ── Navigation intent ────────────────────────────────────────────────────
    const navIntent = detectNavigationIntent(message);
    if (navIntent) {
      return NextResponse.json({
        response: navIntent === "next" ? "Turning to the next page..." : "Going back a page...",
        navigation: navIntent,
      });
    }

    // ── RAG context retrieval ────────────────────────────────────────────────
    let bookContext = pageContent ? `Book: ${bookTitle || "Unknown"}\nPage: ${currentPage}\n\nExcerpt:\n${pageContent}` : "";
    let supplementaryContext = "";
    try {
      const context = await retrieveContext(bookId, message, currentPage, highlightedText);
      bookContext = context.bookContext || bookContext;
      supplementaryContext = context.supplementaryContext;
    } catch {
      if (highlightedText) {
        bookContext += `\n\nThe reader has highlighted: "${highlightedText}"`;
      } else if (!pageContent) {
        bookContext = "No specific book context available.";
      }
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
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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