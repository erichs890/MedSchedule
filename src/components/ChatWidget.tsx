"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Stethoscope } from "lucide-react";
import { cn } from "./ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Olá! Eu sou a Sofia, assistente virtual da Clínica Bela Vida. 😊 Posso ajudar com dúvidas sobre a clínica, convênios, agendamentos ou orientações gerais. Como posso ajudar?";

const SUGGESTIONS = [
  "Quais convênios são aceitos?",
  "Qual o horário de atendimento?",
  "Como faço um novo agendamento?",
];

function SofiaAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-white"
      style={{ width: size, height: size }}
    >
      <Stethoscope style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}

function Bubble({ role, content }: Msg) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-white">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <SofiaAvatar />
      <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-line bg-white px-3 py-2 text-sm leading-relaxed text-ink">
        {content}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao responder.");
      setMessages((m) => [...m, { role: "assistant", content: json.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Não consegui responder agora.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar assistente" : "Abrir assistente virtual"}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark active:scale-95"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-30 flex h-[520px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-white">
            <SofiaAvatar size={38} />
            <div className="flex-1">
              <p className="text-sm font-semibold">Sofia</p>
              <p className="flex items-center gap-1 text-xs text-indigo-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Assistente virtual
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-canvas p-4"
          >
            <Bubble role="assistant" content={GREETING} />

            {messages.length === 0 && (
              <div className="flex flex-col items-start gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-primary/30 bg-primary-soft/60 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-soft"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}

            {loading && (
              <div className="flex gap-2">
                <SofiaAvatar />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-3 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-ink-muted"
                      style={{
                        animation: "pulse-dot 1s ease-in-out infinite",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-line bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva sua mensagem..."
              className="h-10 flex-1 rounded-lg border border-line bg-slate-50 px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-dark",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
