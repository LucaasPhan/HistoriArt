import "server-only";

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_AI_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run`;

const REQUEST_TIMEOUT_MS = 120000;

/**
 * Exponential backoff retry logic for AI calls
 */
async function retryAI<T>(fn: () => Promise<T>, label: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`[${label}] Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i))); // 1s, 2s, 4s delay
    }
  }
  throw new Error("unreachable");
}

type EmbeddingModelInput = {
  text: string[];
};

/**
 * Call Cloudflare AI REST API with automatic retries
 */
async function callCloudflareAI<T>(
  model: "@cf/baai/bge-base-en-v1.5",
  inputs: EmbeddingModelInput,
): Promise<T> {
  return retryAI(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const payload = JSON.stringify(inputs);
      const response = await fetch(`${CLOUDFLARE_AI_BASE_URL}/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cloudflare AI API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as {
        success: boolean;
        result: T;
        errors?: unknown[];
      };

      if (data.success === false) {
        throw new Error(`Cloudflare AI error: ${JSON.stringify(data.errors)}`);
      }

      return data.result as T;
    } catch (err) {
      clearTimeout(timeoutId);
      const error = err instanceof Error ? err : new Error(String(err));

      if (error.name === "AbortError") {
        throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      }

      throw error;
    }
  }, `Cloudflare AI ${model}`);
}

/**
 * Generate text embeddings using BGE-base model (768-dimensional)
 * We use BGE-base instead of BGE-large to match your pgvector database schema!
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID.includes("CHANGE_ME")) {
    throw new Error(
      "Missing or invalid CLOUDFLARE_ACCOUNT_ID. You forgot to replace 'CHANGE_ME' in your .env file!",
    );
  }
  if (!CLOUDFLARE_API_TOKEN) {
    throw new Error("Missing CLOUDFLARE_API_TOKEN in .env file.");
  }

  const response = await callCloudflareAI<{ data: number[][] }>("@cf/baai/bge-base-en-v1.5", {
    text: texts,
  });

  return response.data;
}

/**
 * Generate a single text embedding
 */
export async function embedText(text: string): Promise<number[]> {
  const data = await embedTexts([text]);
  return data[0];
}
