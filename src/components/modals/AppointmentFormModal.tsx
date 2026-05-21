"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, CalendarCog, Search, UserPlus, X } from "lucide-react";
import {
  Button,
  Field,
  Modal,
  Select,
  Spinner,
  TextArea,
  TextInput,
  cn,
} from "@/components/ui";
import { PatientModal } from "./PatientModal";
import { useUI } from "@/components/UIProvider";
import {
  useBookedTimes,
  useCreateAppointment,
  usePatients,
  useUpdateAppointment,
} from "@/lib/hooks";
import {
  APPOINTMENT_TYPES,
  DURATIONS,
  INSURANCES,
  TIME_SLOTS,
} from "@/lib/constants";
import { isPastSlot, todayISO } from "@/lib/format";
import type { Appointment } from "@/lib/types";

interface Props {
  appointment?: Appointment;
  prefill?: { date?: string; time?: string };
  onClose: () => void;
}

export function AppointmentFormModal({ appointment, prefill, onClose }: Props) {
  const editing = !!appointment;
  const { toast } = useUI();
  const { data: patients = [] } = usePatients();
  const createAppt = useCreateAppointment();
  const updateAppt = useUpdateAppointment();

  const [patientId, setPatientId] = useState<string | null>(
    appointment?.patient_id ?? null,
  );
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  const [date, setDate] = useState(
    appointment?.date ?? prefill?.date ?? todayISO(),
  );
  const [time, setTime] = useState(
    appointment?.time?.slice(0, 5) ?? prefill?.time ?? "",
  );
  const [duration, setDuration] = useState(appointment?.duration_min ?? 30);
  const [type, setType] = useState(appointment?.type ?? APPOINTMENT_TYPES[0]);
  const [insurance, setInsurance] = useState(
    appointment?.insurance ?? INSURANCES[0],
  );
  const [price, setPrice] = useState(
    appointment ? String(appointment.price) : "",
  );
  const [notes, setNotes] = useState(appointment?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: bookedTimes = [] } = useBookedTimes(date, appointment?.id);

  const selectedPatient = patients.find((p) => p.id === patientId);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients.slice(0, 6);
    return patients
      .filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          (p.cpf ?? "").includes(q),
      )
      .slice(0, 6);
  }, [patients, query]);

  function slotState(slot: string): "free" | "booked" | "past" {
    if (editing && slot === appointment?.time?.slice(0, 5)) return "free";
    if (bookedTimes.includes(slot)) return "booked";
    if (isPastSlot(date, slot)) return "past";
    return "free";
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!patientId) e.patient = "Selecione um paciente.";
    if (!date) e.date = "Informe a data.";
    if (!time) e.time = "Selecione um horário.";
    else {
      const st = slotState(time);
      if (st === "booked") e.time = "Este horário já está ocupado.";
      if (st === "past") e.time = "Este horário já passou.";
    }
    if (!type) e.type = "Selecione o tipo.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    const input = {
      patient_id: patientId!,
      date,
      time,
      duration_min: duration,
      type,
      insurance,
      price: Number(price) || 0,
      notes,
    };
    try {
      if (editing) {
        await updateAppt.mutateAsync({ id: appointment.id, input });
        toast("Consulta atualizada com sucesso.");
      } else {
        await createAppt.mutateAsync(input);
        toast("Agendamento criado com sucesso.");
      }
      onClose();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "code" in err && err.code === "23505"
          ? "Já existe uma consulta neste horário."
          : "Não foi possível salvar o agendamento.";
      toast(msg, "error");
    }
  }

  const saving = createAppt.isPending || updateAppt.isPending;

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={editing ? "Editar Agendamento" : "Novo Agendamento"}
        icon={
          editing ? (
            <CalendarCog className="h-5 w-5 text-primary" />
          ) : (
            <CalendarPlus className="h-5 w-5 text-primary" />
          )
        }
        widthClass="max-w-xl"
        footer={
          <>
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" form="appt-form" disabled={saving}>
              {saving ? (
                <Spinner />
              ) : editing ? (
                "Salvar Alterações"
              ) : (
                "Salvar Agendamento"
              )}
            </Button>
          </>
        }
      >
        <form id="appt-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Patient picker */}
          <Field label="Paciente" required>
            <div className="flex items-start gap-2">
              <div className="relative flex-1">
                {selectedPatient ? (
                  <div className="flex h-10 items-center justify-between rounded-lg border border-primary/30 bg-primary-soft/50 px-3">
                    <span className="text-sm font-medium text-ink">
                      {selectedPatient.full_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPatientId(null);
                        setQuery("");
                      }}
                      className="text-ink-muted hover:text-ink"
                      aria-label="Remover paciente"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <TextInput
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowList(true);
                      }}
                      onFocus={() => setShowList(true)}
                      onBlur={() =>
                        setTimeout(() => setShowList(false), 150)
                      }
                      placeholder="Buscar paciente por nome ou CPF..."
                      className="pl-9"
                    />
                    {showList && matches.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-line bg-white py-1 shadow-lg">
                        {matches.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => {
                              setPatientId(p.id);
                              setShowList(false);
                            }}
                            className="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-slate-50"
                          >
                            <span className="text-sm font-medium text-ink">
                              {p.full_name}
                            </span>
                            {p.cpf && (
                              <span className="text-xs text-ink-muted">
                                {p.cpf}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPatientModalOpen(true)}
                className="shrink-0 text-primary"
              >
                <UserPlus className="h-4 w-4" />
                Novo
              </Button>
            </div>
            {errors.patient && (
              <p className="text-xs text-rose-600">{errors.patient}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Data" required htmlFor="a-date">
              <TextInput
                id="a-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <p className="text-xs text-rose-600">{errors.date}</p>
              )}
            </Field>
            <Field label="Horário" required htmlFor="a-time">
              <Select
                id="a-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">Selecione...</option>
                {TIME_SLOTS.map((slot) => {
                  const st = slotState(slot);
                  return (
                    <option key={slot} value={slot} disabled={st !== "free"}>
                      {slot}
                      {st === "booked"
                        ? "  — ocupado"
                        : st === "past"
                          ? "  — indisponível"
                          : ""}
                    </option>
                  );
                })}
              </Select>
              {errors.time && (
                <p className="text-xs text-rose-600">{errors.time}</p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de consulta" required htmlFor="a-type">
              <Select
                id="a-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Convênio" required htmlFor="a-ins">
              <Select
                id="a-ins"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
              >
                {INSURANCES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Duração" htmlFor="a-dur">
              <Select
                id="a-dur"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutos
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Valor da consulta" htmlFor="a-price">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
                  R$
                </span>
                <TextInput
                  id="a-price"
                  type="number"
                  min={0}
                  step={10}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className={cn("pl-9")}
                />
              </div>
            </Field>
          </div>

          <Field label="Observações" htmlFor="a-notes">
            <TextArea
              id="a-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione detalhes sobre o agendamento..."
            />
          </Field>
        </form>
      </Modal>

      <PatientModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onCreated={(p) => setPatientId(p.id)}
        onSaved={() => setPatientModalOpen(false)}
      />
    </>
  );
}
