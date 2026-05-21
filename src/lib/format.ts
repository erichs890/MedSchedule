import type { Appointment, AppointmentStatus } from "./types";
import type { SessionKey } from "./constants";
import { FINAL_STATUSES } from "./constants";

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export const WEEKDAYS_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
export const MONTHS_LONG = MONTHS;

/** Parse a 'YYYY-MM-DD' string into a local Date (no timezone shift). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Local YYYY-MM-DD for a Date. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** '21/05/2026' */
export function formatDate(iso: string): string {
  const d = parseDate(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

/** 'Quinta-feira, 21 de maio de 2026' */
export function formatDateLong(iso: string): string {
  const d = parseDate(iso);
  const weekday = WEEKDAYS[d.getDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${d.getDate()} de ${
    MONTHS[d.getMonth()]
  } de ${d.getFullYear()}`;
}

/** '21 de maio' */
export function formatDateShort(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** '09:30' from '09:30:00' */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** End time given a start time + duration in minutes. */
export function endTime(time: string, duration: number): string {
  const [h, m] = formatTime(time).split(":").map(Number);
  const total = h * 60 + m + duration;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function calcAge(birthIso: string | null): number | null {
  if (!birthIso) return null;
  const b = parseDate(birthIso);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const mdiff = now.getMonth() - b.getMonth();
  if (mdiff < 0 || (mdiff === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function getSession(time: string): SessionKey {
  const h = Number(formatTime(time).slice(0, 2));
  if (h < 12) return "manha";
  if (h < 18) return "tarde";
  return "noite";
}

/** Whether a date+time slot is in the past relative to now. */
export function isPastSlot(dateIso: string, time: string): boolean {
  const d = parseDate(dateIso);
  const [h, m] = formatTime(time).split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.getTime() < Date.now();
}

/**
 * "Atrasado" is a derived visual state: an appointment still waiting
 * (agendado/confirmado) whose slot is already in the past.
 */
export function isLate(appt: Appointment): boolean {
  return (
    (appt.status === "agendado" || appt.status === "confirmado") &&
    isPastSlot(appt.date, appt.time)
  );
}

export function isFinal(status: AppointmentStatus): boolean {
  return FINAL_STATUSES.includes(status);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
