"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CalendarDays,
  ClipboardList,
  Users,
  Stethoscope,
  BarChart3,
  History,
  Settings,
  CalendarPlus,
  UserPlus,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { usePatients } from "@/lib/hooks";
import { useUI } from "./UIProvider";
import { cn } from "./ui";
import { initials } from "@/lib/format";

const PAGES: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Calendário", href: "/", icon: CalendarDays },
  { label: "Agenda do dia", href: "/agenda", icon: ClipboardList },
  { label: "Pacientes", href: "/pacientes", icon: Users },
  { label: "Consultas", href: "/consultas", icon: Stethoscope },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Histórico", href: "/historico", icon: History },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

interface Item {
  group: string;
  label: string;
  sub?: string;
  icon?: LucideIcon;
  initials?: string;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { openNew, openPatient } = useUI();
  const { data: patients = [] } = usePatients();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onEvent = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("medschedule:command", onEvent);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("medschedule:command", onEvent);
    };
  }, []);

  // Foca o campo de busca ao abrir (foco é DOM, não estado).
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(timer);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
    setActive(0);
  }

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const list: Item[] = [];

    const actions: Item[] = [
      {
        group: "Ações",
        label: "Novo agendamento",
        icon: CalendarPlus,
        run: () => openNew(),
      },
      {
        group: "Ações",
        label: "Cadastrar paciente",
        icon: UserPlus,
        run: () => openPatient(),
      },
    ];
    for (const a of actions) {
      if (!q || a.label.toLowerCase().includes(q)) list.push(a);
    }

    for (const p of PAGES) {
      if (!q || p.label.toLowerCase().includes(q)) {
        list.push({
          group: "Navegação",
          label: p.label,
          icon: p.icon,
          run: () => router.push(p.href),
        });
      }
    }

    if (q) {
      const matches = patients
        .filter(
          (p) =>
            p.full_name.toLowerCase().includes(q) || (p.cpf ?? "").includes(q),
        )
        .slice(0, 6);
      for (const p of matches) {
        list.push({
          group: "Pacientes",
          label: p.full_name,
          sub: p.cpf ?? undefined,
          initials: initials(p.full_name),
          run: () => router.push(`/pacientes/${p.id}`),
        });
      }
    }

    return list;
  }, [query, patients, openNew, openPatient, router]);

  function run(index: number) {
    const item = items[index];
    if (!item) return;
    close();
    item.run();
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(active);
    } else if (e.key === "Escape") {
      close();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={close}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-2xl animate-slide-up">
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Buscar páginas, pacientes ou ações..."
            className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="rounded border border-line bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">
              Nenhum resultado para “{query}”.
            </p>
          ) : (
            items.map((item, i) => {
              const prev = items[i - 1];
              const showHeader = !prev || prev.group !== item.group;
              const isActive = i === active;
              const Icon = item.icon;
              return (
                <div key={`${item.group}-${item.label}-${i}`}>
                  {showHeader && (
                    <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      {item.group}
                    </p>
                  )}
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      isActive ? "bg-primary-soft" : "hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                        isActive
                          ? "bg-primary text-white"
                          : "bg-muted text-ink-soft",
                      )}
                    >
                      {Icon ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        item.initials
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      {item.sub && (
                        <span className="block truncate text-xs text-ink-muted">
                          {item.sub}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-muted/60 px-4 py-2 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1">↑</kbd>
            <kbd className="rounded border border-line bg-surface px-1">↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1">↵</kbd>
            selecionar
          </span>
        </div>
      </div>
    </div>
  );
}
