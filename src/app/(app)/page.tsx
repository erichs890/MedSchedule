"use client";

import { useMemo, useState } from "react";
import { CalendarX2, Plus, Sun, Sunset, Moon } from "lucide-react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { AppointmentCard } from "@/components/AppointmentCard";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import { useUI } from "@/components/UIProvider";
import { useAppointments } from "@/lib/hooks";
import { SESSIONS, type SessionKey } from "@/lib/constants";
import {
  formatDateShort,
  getSession,
  parseDate,
  todayISO,
} from "@/lib/format";
import type { Appointment } from "@/lib/types";

const SESSION_ICON: Record<SessionKey, React.ReactNode> = {
  manha: <Sun className="h-3.5 w-3.5" />,
  tarde: <Sunset className="h-3.5 w-3.5" />,
  noite: <Moon className="h-3.5 w-3.5" />,
};

export default function DashboardPage() {
  const { data: appointments, isLoading } = useAppointments();
  const { openDetail, openNew } = useUI();

  const today = todayISO();
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => {
    const d = parseDate(today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments ?? []) {
      const arr = map.get(a.date) ?? [];
      arr.push(a);
      map.set(a.date, arr);
    }
    return map;
  }, [appointments]);

  const dayAppointments = useMemo(
    () => byDate.get(selected) ?? [],
    [byDate, selected],
  );

  const kpis = useMemo(() => {
    return {
      total: dayAppointments.length,
      confirmados: dayAppointments.filter((a) => a.status === "confirmado")
        .length,
      aguardando: dayAppointments.filter((a) => a.status === "aguardando")
        .length,
      finalizados: dayAppointments.filter((a) => a.status === "realizado")
        .length,
    };
  }, [dayAppointments]);

  function selectDay(iso: string) {
    setSelected(iso);
    const d = parseDate(iso);
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  function goToday() {
    const d = parseDate(today);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(today);
  }

  return (
    <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:p-7">
      {/* Calendar */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <Skeleton className="h-full min-h-[600px]" />
        ) : (
          <MonthCalendar
            month={month}
            selected={selected}
            appointmentsByDate={byDate}
            onSelect={selectDay}
            onPrev={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
            onNext={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
            onToday={goToday}
          />
        )}
      </div>

      {/* Side panel */}
      <div className="space-y-5">
        {/* Resumo do dia */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-ink">Resumo do dia</h2>
            <span className="text-xs font-medium text-ink-muted">
              {formatDateShort(selected)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <KpiCard
              label="Total"
              value={kpis.total}
              tone="bg-muted text-ink"
            />
            <KpiCard
              label="Confirmados"
              value={kpis.confirmados}
              tone="bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300"
            />
            <KpiCard
              label="Aguardando"
              value={kpis.aguardando}
              tone="bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300"
            />
            <KpiCard
              label="Finalizados"
              value={kpis.finalizados}
              tone="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            />
          </div>
        </div>

        {/* Consultas do dia */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">
              Consultas do dia
            </h2>
            <button
              onClick={() => openNew({ date: selected })}
              className="text-xs font-semibold text-primary hover:underline"
            >
              + Agendar
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : dayAppointments.length === 0 ? (
            <EmptyState
              icon={<CalendarX2 className="h-6 w-6" />}
              title="Nenhuma consulta"
              description="Não há agendamentos para esta data."
              action={
                <Button size="sm" onClick={() => openNew({ date: selected })}>
                  <Plus className="h-4 w-4" />
                  Novo agendamento
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {SESSIONS.map((session) => {
                const items = dayAppointments.filter(
                  (a) => getSession(a.time) === session.key,
                );
                if (items.length === 0) return null;
                return (
                  <div key={session.key}>
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      {SESSION_ICON[session.key]}
                      {session.label}
                    </div>
                    <div className="space-y-2">
                      {items.map((a) => (
                        <AppointmentCard
                          key={a.id}
                          appointment={a}
                          onClick={() => openDetail(a.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`rounded-xl px-3 py-3 ${tone}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
