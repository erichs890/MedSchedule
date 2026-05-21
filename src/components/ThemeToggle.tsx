"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";

const STORAGE_KEY = "medschedule-theme";

export function ThemeToggle() {
  const mounted = useMounted();
  // Apenas para forçar re-render após alternar (o tema vive no <html>).
  const [, bump] = useState(0);

  // Antes da hidratação renderiza um placeholder do mesmo tamanho,
  // evitando divergência de hidratação.
  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const isDark = document.documentElement.classList.contains("dark");

  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage indisponível — tudo bem */
    }
    bump((n) => n + 1);
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Tema claro" : "Tema escuro"}
      aria-label="Alternar tema"
      className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-muted"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
