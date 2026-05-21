"use client";

import { useMemo } from "react";
import { History as HistoryIcon } from "lucide-react";
import { EmptyState, Skeleton, StatusBadge } from "@/components/ui";
import { useUI } from "@/components/UIProvider";
import { useActivityLog } from "@/lib/hooks";
import type { ActivityEntry } from "@/lib/data";

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoricoPage() {
  const { data: log, isLoading } = useActivityLog();
  const { openDetail } = useUI();

  const groups = useMemo(() => {
    const map = new Map<string, ActivityEntry[]>();
    for (const entry of log ?? []) {
      const key = dayKey(entry.created_at);
      const arr = map.get(key) ?? [];
      arr.push(entry);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [log]);

  return (
    <div className="space-y-5 p-5 lg:p-7">
      <div>
        <h2 className="text-lg font-semibold text-ink">
          Histórico de atendimentos
        </h2>
        <p className="text-sm text-ink-soft">
          Registro completo de todas as ações realizadas nas consultas.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState
            icon={<HistoryIcon className="h-6 w-6" />}
            title="Sem registros"
            description="As ações nas consultas aparecerão aqui."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, entries]) => (
            <div key={day}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {day}
              </h3>
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                <ul className="divide-y divide-line">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <button
                        onClick={() =>
                          entry.appointment &&
                          openDetail(entry.appointment.id)
                        }
                        disabled={!entry.appointment}
                        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors enabled:hover:bg-muted disabled:cursor-default"
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">
                            {entry.action}
                          </p>
                          {entry.appointment && (
                            <p className="truncate text-xs text-ink-soft">
                              {entry.appointment.patient?.full_name} ·{" "}
                              {entry.appointment.type}
                            </p>
                          )}
                        </div>
                        {entry.appointment && (
                          <StatusBadge status={entry.appointment.status} />
                        )}
                        <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                          {timeOf(entry.created_at)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
