"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  AlertTriangle,
  Clock,
  Activity,
  CalendarClock,
} from "lucide-react";
import { useAppointments } from "@/lib/hooks";
import { useUI } from "./UIProvider";
import { cn } from "./ui";
import { formatTime, isLate, isPastSlot, todayISO } from "@/lib/format";
import type { Appointment } from "@/lib/types";

type Kind = "late" | "waiting" | "active" | "upcoming";

const META: Record<
  Kind,
  { icon: typeof Bell; tint: string; title: string }
> = {
  late: {
    icon: AlertTriangle,
    tint: "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300",
    title: "Consulta atrasada",
  },
  waiting: {
    icon: Clock,
    tint: "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300",
    title: "Paciente aguardando",
  },
  active: {
    icon: Activity,
    tint: "bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300",
    title: "Em atendimento",
  },
  upcoming: {
    icon: CalendarClock,
    tint: "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300",
    title: "Próxima consulta",
  },
};

const ORDER: Record<Kind, number> = {
  late: 0,
  waiting: 1,
  active: 2,
  upcoming: 3,
};

export function NotificationsBell() {
  const { data: appointments = [] } = useAppointments();
  const { openDetail } = useUI();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = useMemo(() => {
    const today = todayISO();
    const list: { appt: Appointment; kind: Kind }[] = [];
    for (const a of appointments) {
      if (a.date !== today) continue;
      if (a.status === "cancelado" || a.status === "realizado") continue;
      let kind: Kind | null = null;
      if (isLate(a)) kind = "late";
      else if (a.status === "aguardando") kind = "waiting";
      else if (a.status === "em_atendimento") kind = "active";
      else if (!isPastSlot(a.date, a.time)) kind = "upcoming";
      if (kind) list.push({ appt: a, kind });
    }
    list.sort(
      (x, y) =>
        ORDER[x.kind] - ORDER[y.kind] ||
        x.appt.time.localeCompare(y.appt.time),
    );
    return list;
  }, [appointments]);

  const count = items.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-muted"
        title="Notificações"
        aria-label={`Notificações${count ? ` (${count})` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-surface">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-slate-900/10 animate-slide-up">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Notificações</h3>
            {count > 0 && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                {count}
              </span>
            )}
          </div>

          {count === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <BellOff className="h-7 w-7 text-ink-muted/60" />
              <p className="mt-2 text-sm font-medium text-ink">
                Tudo em dia
              </p>
              <p className="text-xs text-ink-soft">
                Nenhuma notificação no momento.
              </p>
            </div>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {items.map(({ appt, kind }) => {
                const meta = META[kind];
                const Icon = meta.icon;
                return (
                  <li key={appt.id}>
                    <button
                      onClick={() => {
                        openDetail(appt.id);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          meta.tint,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">
                          {meta.title}
                        </p>
                        <p className="truncate text-xs text-ink-soft">
                          {appt.patient?.full_name} · {appt.type}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
                        {formatTime(appt.time)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
