"use client";

import { Fragment, useMemo, useState } from "react";
import { cn } from "./ui";
import { useUI } from "./UIProvider";
import { useRescheduleAppointment } from "@/lib/hooks";
import { STATUS_HEX, STATUS_META, TIME_SLOTS } from "@/lib/constants";
import {
  addDays,
  formatTime,
  isFinal,
  isPastSlot,
  parseDate,
  todayISO,
  WEEKDAYS_SHORT,
} from "@/lib/format";
import type { Appointment } from "@/lib/types";

function WeekChip({
  appt,
  onOpen,
}: {
  appt: Appointment;
  onOpen: () => void;
}) {
  const final = isFinal(appt.status);
  const cancelled = appt.status === "cancelado";
  const meta = STATUS_META[appt.status];

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={!final}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", appt.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      title={`${formatTime(appt.time)} · ${appt.patient?.full_name}`}
      style={{ borderLeftColor: STATUS_HEX[appt.status] }}
      className={cn(
        "block w-full truncate rounded-md border-l-[3px] px-1.5 py-1 text-left text-[11px] leading-tight transition",
        meta.badge,
        !final && "cursor-grab hover:brightness-95 active:cursor-grabbing",
        cancelled && "line-through opacity-60",
      )}
    >
      <span className="font-bold tabular-nums">{formatTime(appt.time)}</span>{" "}
      <span className="font-medium">{appt.patient?.full_name}</span>
    </div>
  );
}

export function WeekView({
  anchor,
  appointments,
}: {
  anchor: string;
  appointments: Appointment[];
}) {
  const { openDetail, openNew, toast } = useUI();
  const reschedule = useRescheduleAppointment();
  const [dragOver, setDragOver] = useState<string | null>(null);

  const today = todayISO();
  const days = useMemo(() => {
    const sunday = addDays(anchor, -parseDate(anchor).getDay());
    return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
  }, [anchor]);

  const byCell = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = `${a.date}|${formatTime(a.time)}`;
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return map;
  }, [appointments]);

  async function handleDrop(
    targetDate: string,
    targetTime: string,
    e: React.DragEvent,
  ) {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    if (appt.date === targetDate && formatTime(appt.time) === targetTime) return;

    if (isPastSlot(targetDate, targetTime)) {
      toast("Não é possível reagendar para um horário passado.", "error");
      return;
    }
    const occupied = appointments.some(
      (a) =>
        a.id !== id &&
        a.status !== "cancelado" &&
        a.date === targetDate &&
        formatTime(a.time) === targetTime,
    );
    if (occupied) {
      toast("Já existe uma consulta neste horário.", "error");
      return;
    }
    try {
      await reschedule.mutateAsync({
        id,
        date: targetDate,
        time: targetTime,
      });
      toast("Consulta reagendada.");
    } catch {
      toast("Não foi possível reagendar a consulta.", "error");
    }
  }

  return (
    <div className="overflow-auto rounded-2xl border border-line bg-surface">
      <div
        className="grid min-w-[820px]"
        style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-r border-line bg-surface" />
        {days.map((d) => {
          const dd = parseDate(d);
          const isToday = d === today;
          return (
            <div
              key={d}
              className={cn(
                "sticky top-0 z-10 border-b border-l border-line bg-surface px-2 py-2 text-center",
                isToday && "bg-primary-soft/40",
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                {WEEKDAYS_SHORT[dd.getDay()]}
              </p>
              <p
                className={cn(
                  "mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold",
                  isToday ? "bg-primary text-white" : "text-ink",
                )}
              >
                {dd.getDate()}
              </p>
            </div>
          );
        })}

        {/* Time rows */}
        {TIME_SLOTS.map((slot) => (
          <Fragment key={slot}>
            <div className="border-b border-r border-line py-1 pr-1.5 text-right text-[10px] font-medium tabular-nums text-ink-muted">
              {slot}
            </div>
            {days.map((d) => {
              const key = `${d}|${slot}`;
              const cellAppts = byCell.get(key) ?? [];
              const past = isPastSlot(d, slot);
              const isOver = dragOver === key;
              return (
                <div
                  key={key}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(key);
                  }}
                  onDragLeave={() =>
                    setDragOver((c) => (c === key ? null : c))
                  }
                  onDrop={(e) => handleDrop(d, slot, e)}
                  onClick={() =>
                    cellAppts.length === 0 &&
                    !past &&
                    openNew({ date: d, time: slot })
                  }
                  className={cn(
                    "min-h-[42px] space-y-0.5 border-b border-l border-line p-1 transition-colors",
                    past && "bg-muted/70",
                    isOver && "bg-primary-soft ring-1 ring-inset ring-primary",
                    cellAppts.length === 0 &&
                      !past &&
                      "cursor-pointer hover:bg-muted",
                  )}
                >
                  {cellAppts.map((a) => (
                    <WeekChip
                      key={a.id}
                      appt={a}
                      onOpen={() => openDetail(a.id)}
                    />
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
