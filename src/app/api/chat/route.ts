import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { geminiConfigured, geminiGenerate, type Content } from "@/lib/gemini";

const SYSTEM_PROMPT = `Você é a Sofia, assistente virtual da Clínica Bela Vida — uma clínica de clínica geral.
Você ajuda a equipe da recepção e também responde dúvidas de pacientes.

Sobre a clínica:
- Atendimento de segunda a sábado, das 07:00 às 19:00.
- Consultas em horários de 30 minutos.
- Convênios aceitos: Particular, Unimed, Bradesco Saúde, SulAmérica e Amil.
- Tipos de atendimento: primeira consulta, retorno, consulta de rotina,
  avaliação, exame de rotina, acompanhamento e procedimento clínico.

Como agir:
- Seja acolhedora, clara e objetiva. Responda sempre em português do Brasil.
- Pode dar orientações gerais de saúde e bem-estar, mas NUNCA forneça
  diagnóstico nem prescreva medicamentos — sempre recomende uma consulta
  com o profissional de saúde.
- Em situações de emergência, oriente a procurar atendimento imediato
  (SAMU 192).
- Se perguntarem como usar o sistema MedSchedule, ajude com um passo a passo.
- Respostas curtas (no máximo ~6 linhas), em tom profissional e gentil.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!rateLimit(`chat:${user.id}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Muitas mensagens em pouco tempo. Aguarde um instante." },
      { status: 429 },
    );
  }

  if (!geminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Assistente de IA não configurada. Defina GEMINI_API_KEY no ambiente.",
      },
      { status: 503 },
    );
  }

  let raw: unknown;
  try {
    const body = await request.json();
    raw = (body as { messages?: unknown })?.messages;
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const messages: ChatMessage[] = Array.isArray(raw)
    ? raw
        .filter(
          (m): m is ChatMessage =>
            !!m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim().length > 0,
        )
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    : [];

  if (messages.length === 0 || messages[0].role !== "user") {
    return NextResponse.json({ error: "Conversa inválida." }, { status: 400 });
  }

  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const reply = await geminiGenerate({
      system: SYSTEM_PROMPT,
      contents,
      maxOutputTokens: 600,
    });
    return NextResponse.json({
      reply: reply || "Desculpe, não consegui responder agora.",
    });
  } catch (err) {
    console.error("Erro no chat:", err);
    return NextResponse.json(
      { error: "Falha ao falar com a assistente. Tente novamente." },
      { status: 502 },
    );
  }
}
