"use client";

import { StatusBadge, cn } from "./ui";
import { formatTime, isLate } from "@/lib/format";
import type { Appointment } from "@/lib/types";

export function AppointmentCard({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick?: () => void;
}) {
  const late = isLate(appointment);
  const cancelled = appointment.status === "cancelado";
  const active = appointment.status === "em_atendimento";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-white p-3 text-left transition-all",
        "hover:-translate-y-px hover:shadow-md hover:shadow-slate-900/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active && "border-primary ring-1 ring-primary/25",
        late && !active && "border-rose-200 bg-rose-50/50",
        cancelled && "opacity-65",
        !active && !late && !cancelled && "border-line",
      )}
    >
      <div className="flex gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center justify-center">
          <span className="text-[15px] font-bold tabular-nums text-ink">
            {formatTime(appointment.time)}
          </span>
          <span className="text-[10px] font-medium text-ink-muted">
            {appointment.duration_min} min
          </span>
        </div>
        <div className="min-w-0 flex-1 border-l border-line pl-3">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "truncate text-sm font-semibold text-ink",
                cancelled && "line-through decoration-rose-300",
              )}
            >
              {appointment.patient?.full_name ?? "Paciente"}
            </p>
            <StatusBadge status={appointment.status} late={late} />
          </div>
          <p className="mt-1 truncate text-xs text-ink-soft">
            {appointment.type} · {appointment.insurance}
          </p>
        </div>
      </div>
    </button>
  );
}
