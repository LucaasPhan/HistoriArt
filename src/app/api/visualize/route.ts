
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { retrieveContext } from "@/lib/rag";
import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { sceneImages } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

function sanitizePrompt(prompt: string): string {
  // Strip potentially flagged terms — customize as needed
  return prompt
    .replace(/\b(blood|gore|violence|weapon|kill|death|nude|naked)\b/gi, "")
    .trim();
}

const systemPrompt = `You are a professional concept artist and AI prompt engineer.
Your task is to take a book excerpt and transform it into a highly detailed, evocative image generation prompt for GPT Image 1.5.

Guidelines:

1. **Visual Detail**: Focus on the mood, lighting, textures, and atmospheric details described in the text. Capture the emotional temperature of the scene — dread, wonder, grief, joy — through environmental cues like weather, shadows, color palette, and decay or beauty in the surroundings.

2. **Artistic Style**: Suggest a cinematic, painterly, or illustrative style that fits the book's genre. Reference lighting techniques (chiaroscuro, golden hour, moonlit, candlelit) and art movements or film aesthetics where appropriate (e.g. baroque oil painting, Studio Ghibli watercolor, noir cinematography).

3. **Action & Composition**: Describe the main subject, their posture, expression, and action. Describe the spatial relationship between figures and their environment. Specify foreground, midground, and background elements where relevant.

4. **No Text**: Explicitly state that there should be no text, letters, words, labels, or readable markings anywhere in the image.

5. **Concision**: Keep the final prompt under 100 words. Every word must earn its place — prioritize the most visually distinctive and emotionally resonant details.

6. **No Copyrighted IP**: Never use character names, franchise names, or trademarked locations (e.g. never write Harry Potter, Hermione, Hagrid, Hogwarts, Batman, Frodo, Gandalf, Katniss, Dumbledore, Voldemort, or any other named fictional IP). Describe every character purely through physical appearance — build, hair color and style, clothing, age range, expression, posture. Use descriptive details already present in the source text wherever possible. Replace named locations with generic architectural or environmental equivalents (e.g. "a vast stone castle on a hilltop" not "Hogwarts", "a volcanic mountain" not "Mount Doom"). Do NOT remove or water down any visual, atmospheric, lighting, or emotional detail — substitute names only, preserve everything else exactly.

7. **Image Safety**: Never state a child or minor's exact age numerically (e.g. never write "boy of eleven" or "12-year-old girl" — instead write "young boy", "teenage girl", "adolescent youth"). Never place a young character on a bed — substitute with floor, wooden bench, chair, stone steps, or standing. These substitutions must not change the mood, emotional tone, lighting, or any other visual element of the scene.

Return ONLY the final prompt text. No preamble, no explanation, no quotation marks.`;


// Always sanitize the prompt before generating
async function generateWithSanitization(
  openai: OpenAI,
  prompt: string,
  options: Partial<OpenAI.Images.ImageGenerateParams>
): Promise<OpenAI.ImagesResponse> {
  const safePrompt = sanitizePrompt(prompt);
  
  const response = await openai.images.generate({
    model: "gpt-image-1.5",
    prompt: safePrompt,
    n: 1,
    ...options,
  } as OpenAI.Images.ImageGenerateParams);
  
  return response as OpenAI.ImagesResponse;
}


// ── GET: Check for cached scene image ────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const page = searchParams.get("page");

    if (!bookId || !page) {
      return NextResponse.json({ error: "Missing bookId or page" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(sceneImages)
      .where(
        and(
          eq(sceneImages.userId, session.user.id),
          eq(sceneImages.bookId, bookId),
          eq(sceneImages.pageNumber, parseInt(page, 10))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        cached: true,
        prompt: existing[0].prompt,
        imageUrl: existing[0].imageUrl,
      });
    }

    return NextResponse.json({ cached: false });
  } catch (error) {
    console.error("Scene image GET error:", error);
    return NextResponse.json({ error: "Failed to check cache" }, { status: 500 });
  }
}


// ── POST: Generate (or return cached) scene image ────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── Auth guard ───────────────────────────────────────────────────────────
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to use Illuminate Scene." },
        { status: 401 },
      );
    }

    const { content, bookId, bookTitle, currentPage, highlightedText } = await req.json();

    if (!content && !highlightedText) {
      return NextResponse.json({ error: "No content or highlighted text provided" }, { status: 400 });
    }

    // ── Check for existing cached image ──────────────────────────────────────
    if (bookId && currentPage != null) {
      const existing = await db
        .select()
        .from(sceneImages)
        .where(
          and(
            eq(sceneImages.userId, session.user.id),
            eq(sceneImages.bookId, bookId),
            eq(sceneImages.pageNumber, currentPage)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json({
          cached: true,
          prompt: existing[0].prompt,
          imageUrl: existing[0].imageUrl,
          success: true,
        });
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API Key is missing. Check your environment variables." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ── 0. RAG context retrieval ─────────────────────────────────────────────
    let bookContext = content || "";
    let supplementaryContext = "";
    
    if (bookId) {
      try {
        const context = await retrieveContext(
          bookId, 
          content || highlightedText || "visualize this scene", 
          currentPage || 0, 
          highlightedText
        );
        bookContext = context.bookContext || bookContext;
        supplementaryContext = context.supplementaryContext;
      } catch (e) {
        console.warn("RAG retrieval failed in visualize:", e);
      }
    }

    const userMessage = `Book: ${bookTitle || "Unknown"}
Page: ${currentPage || "Unknown"}

Context:
${bookContext}

${supplementaryContext ? `Supplementary Info:\n${supplementaryContext}` : ""}

Content to Visualize:
${content || highlightedText}`;

    let generatedPrompt = "";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5.4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
      });
      generatedPrompt = completion.choices[0]?.message?.content || "";
    } catch (openaiError) {
      console.warn("OpenAI prompt gen failed, falling back to Gemini:", openaiError);
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const geminiPrompt = `${systemPrompt}\n\nUSER MESSAGE:\n${userMessage}\n\nARTIST PROMPT:`;
      const result = await geminiModel.generateContent(geminiPrompt);
      generatedPrompt = result.response.text().trim();
    }

    if (!generatedPrompt) {
      return NextResponse.json({ error: "Failed to generate a visualization prompt." }, { status: 500 });
    }

    // ── 2. Generate the real image using GPT Image 1.5 ────────────────────────
    console.log("🎨 Calling GPT Image 1.5 with prompt:", generatedPrompt);
    
    try {
      const imageResponse = await generateWithSanitization(openai, generatedPrompt, {
        size: "1024x1024",
        quality: "medium",
      });

      // GPT Image 1.5 returns base64 image data (b64_json) by default instead of a URL.
      const b64Data = imageResponse.data?.[0]?.b64_json;
      const imageUrl = b64Data ? `data:image/png;base64,${b64Data}` : undefined;

      if (!imageUrl) {
        throw new Error("GPT Image 1.5 returned no image data.");
      }

      // ── Save to database ──────────────────────────────────────────────────
      if (bookId && currentPage != null) {
        try {
          await db.insert(sceneImages).values({
            userId: session.user.id,
            bookId,
            pageNumber: currentPage,
            imageUrl,
            prompt: generatedPrompt,
          });
        } catch (dbError) {
          // If unique constraint violation, the image already exists — that's fine
          console.warn("Failed to save scene image (may already exist):", dbError);
        }
      }

      return NextResponse.json({ 
        prompt: generatedPrompt,
        imageUrl, 
        success: true 
      });
    } catch (imageError: unknown) {
      console.error("❌ GPT Image 1.5 Error:", imageError);
      
      const errorMessage = imageError instanceof Error ? imageError.message : "Failed to generate AI image.";
      
      // If DALL-E fails (e.g., content safety or quota), we fallback to the placeholder
      // but inform the user about the error if needed.
      return NextResponse.json({ 
        error: errorMessage,
        prompt: generatedPrompt,
        imageUrl: `https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000&auto=format&fit=crop`, 
        success: false 
      });
    }

  } catch (error) {
    console.error("Visualize API overall error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during visualization." }, { status: 500 });
  }
}
