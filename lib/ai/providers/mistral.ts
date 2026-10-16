import { Mistral } from "@mistralai/mistralai";

let mistralClient: Mistral | null = null;

function getMistralClient(): Mistral {
  if (!mistralClient) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error("MISTRAL_API_KEY is not configured in environment variables.");
    }
    mistralClient = new Mistral({ apiKey });
  }
  return mistralClient;
}

export async function callMistral(
  prompt: string,
  systemInstruction?: string,
  model = "mistral-small-latest"
): Promise<string> {
  const client = getMistralClient();

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const response = await client.chat.complete({
    model,
    messages,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Mistral returned an empty response.");
  }

  // Handle case if content is string or content chunks
  if (typeof content === "string") {
    return content;
  }
  return JSON.stringify(content);
}
