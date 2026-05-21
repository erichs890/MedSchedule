"use client";

import { useState } from "react";
import { UserPlus, UserCog } from "lucide-react";
import {
  Button,
  Field,
  Modal,
  Spinner,
  TextArea,
  TextInput,
} from "@/components/ui";
import { useCreatePatient, useUpdatePatient } from "@/lib/hooks";
import { useUI } from "@/components/UIProvider";
import type { Patient, PatientInput } from "@/lib/types";

export function maskCPF(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

interface Props {
  open: boolean;
  onClose: () => void;
  patient?: Patient;
  /** Called with the newly created patient (create mode only). */
  onCreated?: (patient: Patient) => void;
  /** Called after any successful save. */
  onSaved?: () => void;
}

export function PatientModal({
  open,
  onClose,
  patient,
  onCreated,
  onSaved,
}: Props) {
  const editing = !!patient;
  const { toast } = useUI();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const [form, setForm] = useState<PatientInput>({
    full_name: patient?.full_name ?? "",
    cpf: patient?.cpf ?? "",
    phone: patient?.phone ?? "",
    birth_date: patient?.birth_date ?? "",
    email: patient?.email ?? "",
    notes: patient?.notes ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof PatientInput>(key: K, value: PatientInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Informe o nome do paciente.";
    if (form.cpf && form.cpf.replace(/\D/g, "").length !== 11)
      e.cpf = "CPF deve ter 11 dígitos.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "E-mail inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (editing) {
        await updatePatient.mutateAsync({ id: patient.id, input: form });
        toast("Paciente atualizado com sucesso.");
        onSaved?.();
      } else {
        const created = await createPatient.mutateAsync(form);
        toast("Paciente cadastrado com sucesso.");
        onCreated?.(created);
        onSaved?.();
      }
    } catch {
      toast("Não foi possível salvar o paciente.", "error");
    }
  }

  const saving = createPatient.isPending || updatePatient.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar Paciente" : "Cadastro de Paciente"}
      icon={
        editing ? (
          <UserCog className="h-5 w-5 text-primary" />
        ) : (
          <UserPlus className="h-5 w-5 text-primary" />
        )
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" form="patient-form" disabled={saving}>
            {saving ? <Spinner /> : editing ? "Salvar Alterações" : "Cadastrar Paciente"}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome completo" required htmlFor="p-name">
          <TextInput
            id="p-name"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder="Ex.: Maria Aparecida da Silva"
          />
          {errors.full_name && (
            <p className="text-xs text-rose-600">{errors.full_name}</p>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="CPF" htmlFor="p-cpf">
            <TextInput
              id="p-cpf"
              value={form.cpf}
              onChange={(e) => set("cpf", maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
            {errors.cpf && (
              <p className="text-xs text-rose-600">{errors.cpf}</p>
            )}
          </Field>
          <Field label="Telefone" htmlFor="p-phone">
            <TextInput
              id="p-phone"
              value={form.phone}
              onChange={(e) => set("phone", maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Data de nascimento" htmlFor="p-birth">
            <TextInput
              id="p-birth"
              type="date"
              value={form.birth_date}
              onChange={(e) => set("birth_date", e.target.value)}
            />
          </Field>
          <Field label="E-mail" htmlFor="p-email">
            <TextInput
              id="p-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="paciente@email.com"
            />
            {errors.email && (
              <p className="text-xs text-rose-600">{errors.email}</p>
            )}
          </Field>
        </div>

        <Field label="Observações" htmlFor="p-notes">
          <TextArea
            id="p-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Alergias, condições clínicas, preferências..."
          />
        </Field>
      </form>
    </Modal>
  );
}
