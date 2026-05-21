"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  Sunset,
  Moon,
  CalendarX2,
} from "lucide-react";
import { AppointmentCard } from "@/components/AppointmentCard";
import { Button, Skeleton } from "@/components/ui";
import { useUI } from "@/components/UIProvider";
import { useAppointments } from "@/lib/hooks";
import { SESSIONS, type SessionKey } from "@/lib/constants";
import { addDays, formatDateLong, getSession, todayISO } from "@/lib/format";

const SESSION_ICON: Record<SessionKey, React.ReactNode> = {
  manha: <Sun className="h-4 w-4 text-amber-500" />,
  tarde: <Sunset className="h-4 w-4 text-orange-500" />,
  noite: <Moon className="h-4 w-4 text-indigo-500" />,
};

export default function AgendaPage() {
  const { data: appointments, isLoading } = useAppointments();
  const { openDetail, openNew } = useUI();
  const today = todayISO();
  const [date, setDate] = useState(today);

  const dayAppts = useMemo(
    () => (appointments ?? []).filter((a) => a.date === date),
    [appointments, date],
  );

  const isToday = date === today;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-4 lg:px-7">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-ink">
            {formatDateLong(date)}
          </h2>
          {isToday && (
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              Hoje
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-line">
            <button
              onClick={() => setDate(addDays(date, -1))}
              className="p-2 text-ink-soft transition-colors hover:bg-slate-100"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value || today)}
              className="border-x border-line px-2 py-1.5 text-sm text-ink focus:outline-none"
            />
            <button
              onClick={() => setDate(addDays(date, 1))}
              className="p-2 text-ink-soft transition-colors hover:bg-slate-100"
              aria-label="Próximo dia"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {!isToday && (
            <Button variant="secondary" size="sm" onClick={() => setDate(today)}>
              Hoje
            </Button>
          )}
          <Button onClick={() => openNew({ date })}>
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Button>
        </div>
      </div>

      {/* Sessions */}
      <div className="grid flex-1 gap-4 overflow-y-auto p-5 md:grid-cols-3 lg:p-7">
        {SESSIONS.map((session) => {
          const items = dayAppts.filter(
            (a) => getSession(a.time) === session.key,
          );
          return (
            <section
              key={session.key}
              className="flex flex-col rounded-2xl border border-line bg-white"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div className="flex items-center gap-2">
                  {SESSION_ICON[session.key]}
                  <h3 className="text-sm font-semibold text-ink">
                    {session.label}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft">
                  {items.length}{" "}
                  {items.length === 1 ? "consulta" : "consultas"}
                </span>
              </div>
              <div className="flex-1 space-y-2 p-3">
                {isLoading ? (
                  <>
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CalendarX2 className="h-7 w-7 text-ink-muted/60" />
                    <p className="mt-2 text-xs text-ink-muted">
                      Nenhuma consulta neste período
                    </p>
                  </div>
                ) : (
                  items.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appointment={a}
                      onClick={() => openDetail(a.id)}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
