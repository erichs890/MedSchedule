"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Cake,
  IdCard,
  Pencil,
  CalendarPlus,
  CalendarClock,
  Stethoscope,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Avatar, Button, EmptyState, Skeleton, StatusBadge } from "@/components/ui";
import { AttachmentsCard } from "@/components/AttachmentsCard";
import { useUI } from "@/components/UIProvider";
import { useAppointments, usePatients } from "@/lib/hooks";
import {
  calcAge,
  formatDate,
  formatTime,
  isLate,
  isPastSlot,
} from "@/lib/format";

export default function PacienteProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: patients, isLoading: loadingPatients } = usePatients();
  const { data: appointments, isLoading: loadingAppts } = useAppointments();
  const { openDetail, openPatient, openNew } = useUI();

  const patient = patients?.find((p) => p.id === id);

  const appts = useMemo(
    () =>
      (appointments ?? [])
        .filter((a) => a.patient_id === id)
        .sort((a, b) =>
          b.date === a.date
            ? b.time.localeCompare(a.time)
            : b.date.localeCompare(a.date),
        ),
    [appointments, id],
  );

  const stats = useMemo(
    () => ({
      total: appts.length,
      realizadas: appts.filter((a) => a.status === "realizado").length,
      proximas: appts.filter(
        (a) =>
          (a.status === "agendado" || a.status === "confirmado") &&
          !isPastSlot(a.date, a.time),
      ).length,
      canceladas: appts.filter((a) => a.status === "cancelado").length,
    }),
    [appts],
  );

  if (loadingPatients) {
    return (
      <div className="space-y-5 p-5 lg:p-7">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-5 lg:p-7">
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState
            icon={<Stethoscope className="h-6 w-6" />}
            title="Paciente não encontrado"
            description="O paciente que você procura não existe ou foi removido."
            action={
              <Link href="/pacientes">
                <Button size="sm">Voltar para Pacientes</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const age = calcAge(patient.birth_date);

  return (
    <div className="space-y-5 p-5 lg:p-7">
      <Link
        href="/pacientes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Pacientes
      </Link>

      {/* Cabeçalho do paciente */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={patient.full_name} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-ink">{patient.full_name}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
              {patient.birth_date && (
                <span className="flex items-center gap-1.5">
                  <Cake className="h-3.5 w-3.5" />
                  {age} anos · {formatDate(patient.birth_date)}
                </span>
              )}
              {patient.cpf && (
                <span className="flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5" />
                  {patient.cpf}
                </span>
              )}
              {patient.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {patient.phone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => openPatient(patient)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button size="sm" onClick={() => openNew()}>
              <CalendarPlus className="h-4 w-4" />
              Agendar
            </Button>
          </div>
        </div>

        {patient.notes && (
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Observações
            </p>
            <p className="mt-1 text-sm text-ink-soft">{patient.notes}</p>
          </div>
        )}

        {/* Indicadores */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
          <Stat
            icon={<CalendarClock className="h-4 w-4" />}
            label="Consultas"
            value={stats.total}
            tone="text-ink"
          />
          <Stat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Realizadas"
            value={stats.realizadas}
            tone="text-emerald-600 dark:text-emerald-300"
          />
          <Stat
            icon={<CalendarClock className="h-4 w-4" />}
            label="Próximas"
            value={stats.proximas}
            tone="text-primary"
          />
          <Stat
            icon={<XCircle className="h-4 w-4" />}
            label="Canceladas"
            value={stats.canceladas}
            tone="text-rose-600 dark:text-rose-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Histórico de consultas */}
        <section className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-ink">
              Histórico de consultas
            </h3>
          </div>
          {loadingAppts ? (
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : appts.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">
              Este paciente ainda não tem consultas.
            </p>
          ) : (
            <ul className="space-y-2">
              {appts.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => openDetail(a.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="w-20 shrink-0">
                      <p className="text-sm font-semibold text-ink">
                        {formatDate(a.date)}
                      </p>
                      <p className="text-xs tabular-nums text-ink-muted">
                        {formatTime(a.time)}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-line pl-3">
                      <p className="truncate text-sm font-medium text-ink">
                        {a.type}
                      </p>
                      <p className="truncate text-xs text-ink-soft">
                        {a.insurance}
                      </p>
                    </div>
                    <StatusBadge status={a.status} late={isLate(a)} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Anexos */}
        <AttachmentsCard patientId={patient.id} />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2.5">
      <div className={`flex items-center gap-1.5 ${tone}`}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
