"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./ui";
import { STATUS_META } from "@/lib/constants";
import { MONTHS_LONG, WEEKDAYS_SHORT, toISODate, todayISO } from "@/lib/format";
import type { Appointment } from "@/lib/types";

interface Props {
  month: Date;
  selected: string;
  appointmentsByDate: Map<string, Appointment[]>;
  onSelect: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthCalendar({
  month,
  selected,
  appointmentsByDate,
  onSelect,
  onPrev,
  onNext,
  onToday,
}: Props) {
  const today = todayISO();
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  // Build 6-week grid.
  const cells: { iso: string; day: number; inMonth: boolean }[] = [];
  const prevMonthDays = new Date(year, m, 0).getDate();
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({
      iso: toISODate(new Date(year, m - 1, d)),
      day: d,
      inMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: toISODate(new Date(year, m, d)), day: d, inMonth: true });
  }
  let next = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({
      iso: toISODate(new Date(year, m + 1, next)),
      day: next,
      inMonth: false,
    });
    next++;
    if (cells.length >= 42) break;
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">
          {MONTHS_LONG[m].charAt(0).toUpperCase() + MONTHS_LONG[m].slice(1)}{" "}
          {year}
        </h2>
        <div className="flex items-center gap-1 rounded-lg border border-line p-0.5">
          <button
            onClick={onPrev}
            className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-muted"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onToday}
            className="px-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
          >
            Hoje
          </button>
          <button
            onClick={onNext}
            className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-muted"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-line pb-2">
        {WEEKDAYS_SHORT.map((w) => (
          <div
            key={w}
            className="text-center text-[11px] font-semibold tracking-wide text-ink-muted"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-1 pt-1">
        {cells.map((cell) => {
          const appts = appointmentsByDate.get(cell.iso) ?? [];
          const isToday = cell.iso === today;
          const isSelected = cell.iso === selected;
          return (
            <button
              key={cell.iso}
              onClick={() => onSelect(cell.iso)}
              className={cn(
                "flex flex-col items-start rounded-lg p-1.5 text-left transition-colors",
                !cell.inMonth && "opacity-40",
                isSelected
                  ? "bg-primary-soft/60 ring-2 ring-primary"
                  : "ring-1 ring-transparent hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                  isToday
                    ? "bg-primary text-white"
                    : isSelected
                      ? "text-primary"
                      : "text-ink",
                )}
              >
                {cell.day}
              </span>
              {appts.length > 0 && (
                <div className="mt-auto w-full">
                  {isSelected ? (
                    <span className="inline-block rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {appts.length}
                      <span className="hidden sm:inline">
                        {" "}
                        {appts.length === 1 ? "consulta" : "consultas"}
                      </span>
                    </span>
                  ) : (
                    <div className="flex gap-0.5">
                      {appts.slice(0, 4).map((a) => (
                        <span
                          key={a.id}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            STATUS_META[a.status].dot,
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
