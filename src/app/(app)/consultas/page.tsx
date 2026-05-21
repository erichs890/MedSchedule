"use client";

import { useMemo, useState } from "react";
import { Search, Stethoscope } from "lucide-react";
import { Avatar, EmptyState, Skeleton, StatusBadge, cn } from "@/components/ui";
import { useUI } from "@/components/UIProvider";
import { useAppointments } from "@/lib/hooks";
import { formatDate, formatTime, isLate } from "@/lib/format";
import type { AppointmentStatus } from "@/lib/types";

type Filter = AppointmentStatus | "todos";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todas" },
  { key: "agendado", label: "Agendado" },
  { key: "confirmado", label: "Confirmado" },
  { key: "aguardando", label: "Aguardando" },
  { key: "em_atendimento", label: "Em atendimento" },
  { key: "realizado", label: "Realizado" },
  { key: "cancelado", label: "Cancelado" },
];

export default function ConsultasPage() {
  const { data: appointments, isLoading } = useAppointments();
  const { openDetail } = useUI();
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (appointments ?? [])
      .filter((a) => filter === "todos" || a.status === filter)
      .filter(
        (a) =>
          !q || (a.patient?.full_name ?? "").toLowerCase().includes(q),
      )
      .slice()
      .sort((a, b) =>
        b.date === a.date
          ? b.time.localeCompare(a.time)
          : b.date.localeCompare(a.date),
      );
  }, [appointments, filter, query]);

  return (
    <div className="space-y-5 p-5 lg:p-7">
      {/* Filters + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-surface text-ink-soft border border-line hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por paciente..."
            className="h-10 w-64 rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="h-6 w-6" />}
            title="Nenhuma consulta encontrada"
            description="Ajuste os filtros ou a busca para ver outras consultas."
          />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => openDetail(a.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <Avatar name={a.patient?.full_name ?? "?"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {a.patient?.full_name}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {a.type} · {a.insurance}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-ink">
                      {formatDate(a.date)}
                    </p>
                    <p className="text-xs tabular-nums text-ink-muted">
                      {formatTime(a.time)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} late={isLate(a)} size="md" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isLoading && list.length > 0 && (
        <p className="text-center text-xs text-ink-muted">
          {list.length} consulta{list.length === 1 ? "" : "s"} ·{" "}
          {FILTERS.find((f) => f.key === filter)?.label}
        </p>
      )}
    </div>
  );
}
