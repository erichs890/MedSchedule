"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Ban,
  CalendarClock,
  Stethoscope,
  ShieldCheck,
  Wallet,
  Pencil,
  ChevronRight,
  CheckCircle2,
  FileText,
  Save,
  NotebookPen,
  Phone,
  Cake,
  Sparkles,
} from "lucide-react";
import { Avatar, Button, Spinner, StatusBadge } from "./ui";
import { useUI } from "./UIProvider";
import {
  useAppointment,
  useHistory,
  useSaveClinicalNotes,
  useSetStatus,
} from "@/lib/hooks";
import { nextStatus, STATUS_META } from "@/lib/constants";
import {
  calcAge,
  endTime,
  formatCurrency,
  formatDate,
  formatTime,
  isFinal,
  isLate,
} from "@/lib/format";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("pt-BR"),
    time: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

export function AppointmentDetailPanel({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data: appt, isLoading } = useAppointment(id);
  const { data: history = [] } = useHistory(id);
  const { openEdit, openCancel, toast } = useUI();
  const setStatus = useSetStatus();
  const saveNotes = useSaveClinicalNotes();

  const [notes, setNotes] = useState("");
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (appt) {
      /* eslint-disable react-hooks/set-state-in-effect -- inicializa o editor com os dados da consulta carregada de forma assíncrona */
      setNotes(appt.clinical_notes ?? "");
      dirty.current = false;
      setSavedLabel(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [appt?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Não fecha o painel se houver um modal aberto sobre ele.
      if (document.querySelector('[data-layer="modal"]')) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  async function persistNotes() {
    if (!appt) return;
    try {
      await saveNotes.mutateAsync({ id: appt.id, text: notes });
      dirty.current = false;
      setSavedLabel(
        "Salvo às " +
          new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      );
    } catch {
      toast("Não foi possível salvar a anotação.", "error");
    }
  }

  // Debounced autosave.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(persistNotes, 1600);
    return () => clearTimeout(t);
  }, [notes]); // eslint-disable-line react-hooks/exhaustive-deps

  async function organizeWithAI() {
    if (!notes.trim()) {
      toast("Escreva algo na anotação antes de usar a IA.", "error");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao processar.");
      setNotes(json.result);
      dirty.current = true;
      toast("Anotação organizada pela IA — revise e salve.");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Falha ao processar com a IA.",
        "error",
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function advance() {
    if (!appt) return;
    const next = nextStatus(appt.status);
    if (!next) return;
    try {
      await setStatus.mutateAsync({ id: appt.id, status: next });
      toast(`Status atualizado para ${STATUS_META[next].label}.`);
    } catch {
      toast("Não foi possível atualizar o status.", "error");
    }
  }

  async function markRealized() {
    if (!appt) return;
    try {
      await setStatus.mutateAsync({ id: appt.id, status: "realizado" });
      toast("Consulta marcada como realizada.");
    } catch {
      toast("Não foi possível atualizar o status.", "error");
    }
  }

  const final = appt ? isFinal(appt.status) : false;
  const next = appt ? nextStatus(appt.status) : null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-xl flex-col bg-canvas shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-6 py-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-ink">
              Detalhe do Agendamento
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {appt && !final && (
              <button
                onClick={() => openCancel(appt)}
                title="Cancelar consulta"
                className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 dark:bg-rose-500/15"
              >
                <Ban className="h-4.5 w-4.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-muted hover:text-ink"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading || !appt ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="h-6 w-6 text-primary" />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {/* Patient card */}
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={appt.patient?.full_name ?? "?"}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-ink">
                        {appt.patient?.full_name}
                      </h3>
                      <StatusBadge
                        status={appt.status}
                        late={isLate(appt)}
                        size="md"
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                      {appt.patient?.birth_date && (
                        <span className="flex items-center gap-1.5">
                          <Cake className="h-3.5 w-3.5" />
                          {calcAge(appt.patient.birth_date)} anos ·{" "}
                          {formatDate(appt.patient.birth_date)}
                        </span>
                      )}
                      {appt.patient?.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {appt.patient.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
                  <InfoCell
                    icon={<CalendarClock className="h-3.5 w-3.5" />}
                    label="Data e hora"
                    value={`${formatDate(appt.date)} · ${formatTime(
                      appt.time,
                    )}–${endTime(appt.time, appt.duration_min)}`}
                  />
                  <InfoCell
                    icon={<Stethoscope className="h-3.5 w-3.5" />}
                    label="Tipo de consulta"
                    value={appt.type}
                  />
                  <InfoCell
                    icon={<ShieldCheck className="h-3.5 w-3.5" />}
                    label="Convênio"
                    value={appt.insurance}
                  />
                  <InfoCell
                    icon={<Wallet className="h-3.5 w-3.5" />}
                    label="Valor"
                    value={formatCurrency(appt.price)}
                  />
                </div>

                {appt.notes && (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      Observações do agendamento
                    </p>
                    <p className="mt-1.5 rounded-lg bg-muted px-3 py-2 text-sm text-ink-soft">
                      {appt.notes}
                    </p>
                  </div>
                )}

                {appt.status === "cancelado" && appt.cancel_reason && (
                  <div className="mt-4 rounded-lg bg-rose-50 dark:bg-rose-500/15 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">
                      Motivo do cancelamento
                    </p>
                    <p className="mt-0.5 text-sm text-rose-700 dark:text-rose-300">
                      {appt.cancel_reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Clinical notes */}
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-ink">
                      Anotação Clínica
                    </h3>
                  </div>
                  <span className="text-xs text-ink-muted">
                    {saveNotes.isPending
                      ? "Salvando..."
                      : savedLabel ?? "Autosave ativo"}
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    dirty.current = true;
                  }}
                  placeholder="Registre evolução, queixas, conduta e orientações pós-consulta..."
                  className="mt-3 w-full resize-y rounded-lg border border-line bg-muted/60 px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <div className="mt-2 flex flex-wrap justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={organizeWithAI}
                    disabled={aiLoading}
                    className="text-primary"
                  >
                    {aiLoading ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Organizar com IA
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={persistNotes}
                    disabled={saveNotes.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    Salvar anotação
                  </Button>
                </div>
              </div>

              {/* History */}
              <div className="rounded-2xl border border-line bg-surface p-5">
                <h3 className="text-sm font-semibold text-ink">
                  Histórico da Consulta
                </h3>
                <ol className="mt-3 space-y-3">
                  {history.map((h) => {
                    const ts = formatTimestamp(h.created_at);
                    return (
                      <li key={h.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <span className="w-px flex-1 bg-line" />
                        </div>
                        <div className="-mt-0.5 pb-1">
                          <p className="text-sm font-medium text-ink">
                            {h.action}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {ts.date} às {ts.time}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                  {history.length === 0 && (
                    <li className="text-sm text-ink-muted">
                      Sem registros de histórico.
                    </li>
                  )}
                </ol>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex shrink-0 items-center gap-2 border-t border-line bg-surface px-6 py-4">
              {final ? (
                <p className="flex-1 text-sm text-ink-muted">
                  Consulta finalizada — não pode mais ser alterada.
                </p>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => openEdit(appt)}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar Detalhes
                  </Button>
                  {next && (
                    <Button
                      variant="secondary"
                      onClick={advance}
                      disabled={setStatus.isPending}
                      className="flex-1"
                    >
                      Avançar Status
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={markRealized}
                    disabled={setStatus.isPending}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar Realizada
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
