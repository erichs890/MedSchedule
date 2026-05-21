import type { AppointmentStatus } from "./types";

export interface StatusMeta {
  label: string;
  badge: string; // soft pill: bg + text
  dot: string; // solid dot color
  ring: string; // border accent
}

export const STATUS_META: Record<AppointmentStatus, StatusMeta> = {
  agendado: {
    label: "Agendado",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    ring: "border-blue-200",
  },
  confirmado: {
    label: "Confirmado",
    badge: "bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
    ring: "border-sky-200",
  },
  aguardando: {
    label: "Aguardando",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    ring: "border-amber-200",
  },
  em_atendimento: {
    label: "Em atendimento",
    badge: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
    ring: "border-violet-300",
  },
  realizado: {
    label: "Realizado",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    ring: "border-emerald-200",
  },
  cancelado: {
    label: "Cancelado",
    badge: "bg-rose-50 text-rose-600",
    dot: "bg-rose-400",
    ring: "border-rose-200",
  },
};

/** Cores sólidas (hex) por status — para gráficos e indicadores. */
export const STATUS_HEX: Record<AppointmentStatus, string> = {
  agendado: "#3b82f6",
  confirmado: "#0ea5e9",
  aguardando: "#f59e0b",
  em_atendimento: "#8b5cf6",
  realizado: "#10b981",
  cancelado: "#ef4444",
};

export const LATE_META: StatusMeta = {
  label: "Atrasado",
  badge: "bg-rose-50 text-rose-700",
  dot: "bg-rose-500",
  ring: "border-rose-300",
};

/** Sequential status progression. */
export const STATUS_FLOW: AppointmentStatus[] = [
  "agendado",
  "confirmado",
  "aguardando",
  "em_atendimento",
  "realizado",
];

export const FINAL_STATUSES: AppointmentStatus[] = ["realizado", "cancelado"];

export function nextStatus(
  status: AppointmentStatus,
): AppointmentStatus | null {
  const i = STATUS_FLOW.indexOf(status);
  if (i < 0 || i >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

export const APPOINTMENT_TYPES = [
  "Primeira Consulta",
  "Retorno",
  "Consulta de Rotina",
  "Avaliação",
  "Exame de Rotina",
  "Acompanhamento",
  "Procedimento Clínico",
];

export const INSURANCES = [
  "Particular",
  "Unimed",
  "Bradesco Saúde",
  "SulAmérica",
  "Amil",
];

export const DURATIONS = [30, 45, 60];

/** Clinic hours: 07:00–19:00, 30-minute slots (last start 18:30). */
export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 7; h < 19; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m === 30) {
        slots.push("18:30");
        continue;
      }
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
})();

export type SessionKey = "manha" | "tarde" | "noite";

export const SESSIONS: { key: SessionKey; label: string }[] = [
  { key: "manha", label: "Manhã" },
  { key: "tarde", label: "Tarde" },
  { key: "noite", label: "Noite" },
];
