import { GoogleGenAI, type Content } from "@google/genai";

const MODEL = "gemini-2.5-flash";

export function geminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Gera texto com o Google Gemini.
 * @param system   instrução de sistema (persona / regras)
 * @param contents string única ou histórico de turnos da conversa
 */
export async function geminiGenerate(params: {
  system: string;
  contents: string | Content[];
  maxOutputTokens?: number;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: params.contents,
    config: {
      systemInstruction: params.system,
      maxOutputTokens: params.maxOutputTokens ?? 900,
      temperature: 0.6,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  return (response.text ?? "").trim();
}

export type { Content };
