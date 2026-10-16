import { callGemini } from "./providers/gemini";
import { callMistral } from "./providers/mistral";
import { AIProvider, AIResponse, AttachmentData } from "./types";

export interface GenerateOptions {
  prompt: string;
  systemInstruction?: string;
  expectJson?: boolean;
  modelOverride?: string;
  attachment?: AttachmentData;
}

/**
 * Extracts clean JSON from potential Markdown wrappers like ```json ... ```
 */
export function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  // Remove markdown code blocks if present
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = jsonMatch ? jsonMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch (err) {
    // If simple parse fails, try to locate brackets
    const firstBracket = candidate.indexOf("[");
    const firstBrace = candidate.indexOf("{");
    let startIdx = -1;
    let endIdx = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket;
      endIdx = candidate.lastIndexOf("]");
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
      endIdx = candidate.lastIndexOf("}");
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const slice = candidate.substring(startIdx, endIdx + 1);
      return JSON.parse(slice);
    }
    throw new Error(`Failed to parse structured JSON from AI output: ${(err as Error).message}`);
  }
}

/**
 * Determines whether an error from Gemini qualifies for automatic fallback to Mistral.
 * e.g., Quota, Rate limit, Timeout, 500/503 service unavailable, API unavailable.
 */
function isEligibleForFallback(error: unknown): boolean {
  if (!error) return false;
  const message = (error as Error).message?.toLowerCase() || "";
  return (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted") ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("503") ||
    message.includes("timeout") ||
    message.includes("unavailable") ||
    message.includes("econnrefused") ||
    message.includes("fetch failed") ||
    message.includes("not configured")
  );
}

/**
 * Centralized AI Service:
 * 1. Executes with Google Gemini (Primary Provider)
 * 2. If eligible error occurs, seamlessly falls back to Mistral AI
 * 3. Returns standard response structure with provider used
 */
export async function executeAIRequest<T = string>(
  options: GenerateOptions
): Promise<AIResponse<T>> {
  const { prompt, systemInstruction, expectJson } = options;
  let primaryError: Error | null = null;

  // 1. Try Gemini
  try {
    const rawResult = await callGemini(
      prompt,
      systemInstruction,
      options.modelOverride || "gemini-3.8-flash",
      options.attachment
    );
    const content = expectJson ? (extractJsonFromText(rawResult) as T) : (rawResult as unknown as T);
    return {
      success: true,
      provider: "erick",
      content,
      rawText: rawResult,
    };
  } catch (err) {
    primaryError = err as Error;
    console.warn("⚠️ Gemini request failed:", primaryError.message);
  }

  // 2. Evaluate fallback to Mistral
  if (isEligibleForFallback(primaryError) && process.env.MISTRAL_API_KEY) {
    console.log("🔄 Triggering automatic fallback to Mistral AI...");
    try {
      const rawResult = await callMistral(prompt, systemInstruction);
      const content = expectJson ? (extractJsonFromText(rawResult) as T) : (rawResult as unknown as T);
      return {
        success: true,
        provider: "mistral",
        content,
        rawText: rawResult,
      };
    } catch (fallbackErr) {
      console.error("❌ Mistral fallback also failed:", (fallbackErr as Error).message);
      return {
        success: false,
        error: {
          code: "PROVIDER_AND_FALLBACK_FAILED",
          message: `Gemini error: ${primaryError?.message}. Mistral error: ${(fallbackErr as Error).message}`,
        },
        content: null as unknown as T,
      };
    }
  }

  // 3. Fallback was not triggered or Mistral not configured
  return {
    success: false,
    error: {
      code: "AI_GENERATION_ERROR",
      message: primaryError?.message || "Une erreur inconnue est survenue lors de l'appel IA.",
    },
    content: null as unknown as T,
  };
}
