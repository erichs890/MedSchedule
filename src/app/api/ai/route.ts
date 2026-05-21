import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { geminiConfigured, geminiGenerate } from "@/lib/gemini";

const SYSTEM_PROMPT = `Você é um assistente de documentação clínica de um sistema de agenda médica.
Recebe a anotação clínica de uma consulta, escrita de forma livre pelo profissional,
e a reescreve de forma organizada e profissional, em português do Brasil.

Regras:
- NÃO invente informações. Use estritamente o que está no texto recebido.
- Organize o conteúdo nestas seções, OMITINDO as que não tiverem informação:
  "Queixa principal", "Histórico / Evolução", "Exame clínico", "Conduta", "Orientações".
- Cada seção começa com o título seguido de dois-pontos.
- Seja conciso, claro e use linguagem clínica objetiva.
- Responda APENAS com a anotação reescrita, sem comentários ou introduções.`;

export async function POST(request: Request) {
  // Apenas usuários autenticados podem usar a IA.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!rateLimit(`ai:${user.id}`, 15, 60_000)) {
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um instante e tente novamente." },
      { status: 429 },
    );
  }

  if (!geminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Recurso de IA não configurado. Defina GEMINI_API_KEY no ambiente.",
      },
      { status: 503 },
    );
  }

  let notes = "";
  try {
    const body = await request.json();
    notes = typeof body?.notes === "string" ? body.notes : "";
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!notes.trim()) {
    return NextResponse.json(
      { error: "Não há conteúdo na anotação para organizar." },
      { status: 400 },
    );
  }

  try {
    const result = await geminiGenerate({
      system: SYSTEM_PROMPT,
      contents: `Reescreva e organize a seguinte anotação clínica:\n\n${notes.slice(0, 6000)}`,
      maxOutputTokens: 900,
    });
    if (!result) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo." },
        { status: 502 },
      );
    }
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Erro na IA:", err);
    return NextResponse.json(
      { error: "Falha ao processar com a IA. Tente novamente." },
      { status: 502 },
    );
  }
}
