import { verifySession } from "@/dal/verifySession";
import {
  ChatUserContext,
  CommunicationPreference,
  Gender,
  PurposeOfUse,
} from "@/drizzle/constants";
import { db } from "@/drizzle/db";
import { userProfiles } from "@/drizzle/schema";
import { buildRAGPrompt, detectNavigationIntent, type ConversationMode } from "@/lib/prompts";
import { retrieveContext } from "@/lib/rag";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to use the AI chat." },
        { status: 401 },
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });
    const body = (await req.json()) as {
      message: string;
      bookId: string;
      bookTitle?: string;
      pageContent?: string;
      currentPage: number;
      highlightedText?: string;
      mediaContext?: Array<{
        id: string;
        mediaType: "image" | "video" | "audio" | "annotation";
        passageText?: string;
        caption?: string;
        mediaUrl?: string;
        sources?: string[];
      }>;
      mode?: ConversationMode;
      conversationHistory?: Array<{ role: string; content: string }>;
    };

    const {
      message,
      bookId,
      bookTitle,
      pageContent,
      currentPage,
      highlightedText,
      mediaContext = [],
      mode = "buddy",
      conversationHistory = [],
    } = body;

    let userProfile: ChatUserContext | undefined = undefined;
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (profile) {
      userProfile = {
        firstName: profile.firstName || session.user.name?.split(" ")[0] || "Reader",
        lastName: profile.lastName || session.user.name?.split(" ").slice(1).join(" ") || "",
        age: profile.age,
        gender: profile.gender as Gender,
        purposeOfUse: profile.purposeOfUse as PurposeOfUse,
        customPurpose: profile.customPurpose,
        readingGoal: profile.readingGoal,
        personality: profile.personality,
        communicationPreference: profile.communicationPreference as CommunicationPreference,
      };
    }

    const navIntent = detectNavigationIntent(message);
    if (navIntent) {
      return NextResponse.json({
        response: navIntent === "next" ? "Turning to the next page..." : "Going back a page...",
        navigation: navIntent,
      });
    }

    let bookContext = pageContent
      ? `Book: ${bookTitle || "Unknown"}\nPage: ${currentPage}\n\nExcerpt:\n${pageContent}`
      : "";
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

    if (mediaContext.length > 0) {
      const mediaContextText = mediaContext
        .slice(0, 8)
        .map((item, index) => {
          const lines = [
            `${index + 1}. [${item.mediaType.toUpperCase()}]`,
            item.passageText ? `Passage: "${item.passageText}"` : "",
            item.caption ? `Caption: "${item.caption}"` : "",
            item.mediaUrl ? `URL: ${item.mediaUrl}` : "",
            item.sources?.length ? `Sources: ${item.sources.join(" | ")}` : "",
          ].filter(Boolean);

          return lines.join("\n");
        })
        .join("\n\n");

      if (mediaContextText) {
        bookContext += `\n\n--- Media Panel Context ---\n${mediaContextText}`;
      }
    }

    const messages = buildRAGPrompt(
      mode,
      bookContext,
      message,
      conversationHistory,
      supplementaryContext,
      userProfile,
    );

    let response = "I'm not sure how to respond to that.";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_completion_tokens: 500,
        stream: false,
      });

      response = completion.choices[0]?.message?.content || response;
    } catch (openaiError) {
      console.warn("OpenAI failed, falling back to Gemini:", openaiError);

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const geminiPrompt =
        messages.map((m) => `${m.role.toUpperCase()}:\n${m.content}`).join("\n\n") +
        "\n\nASSISTANT:\n";

      const result = await geminiModel.generateContent(geminiPrompt);
      response = result.response.text() || response;
    }

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
      { status: 500 },
    );
  }
}
