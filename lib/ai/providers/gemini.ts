import { GoogleGenAI } from "@google/genai";
import { AttachmentData } from "../types";

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

const CANDIDATE_MODELS = ["gemini-3.6-flash", "gemini-3.6-pro", "gemini-3.5-flash"];

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  preferredModel = "gemini-3.6-flash",
  attachment?: AttachmentData
): Promise<string> {
  const ai = getGeminiClient();

  let contents: any;
  if (attachment && attachment.base64) {
    const cleanBase64 = attachment.base64.replace(/^data:[^;]+;base64,/, "");
    contents = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: attachment.mimeType || "application/pdf",
        },
      },
      prompt,
    ];
  } else {
    contents = prompt;
  }

  const modelsToTry = [
    preferredModel,
    ...CANDIDATE_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents,
        config: systemInstruction
          ? {
              systemInstruction,
            }
          : undefined,
      });

      const text = response.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      // If temporary overload (503), try next model
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("503") || msg.includes("high demand") || msg.includes("unavailable") || msg.includes("quota")) {
        continue;
      }
      // If other fatal error, rethrow
      throw err;
    }
  }

  throw lastError || new Error("Erick AI n'a pu générer de réponse actuellement.");
}
