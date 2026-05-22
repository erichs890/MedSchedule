"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Modal, Spinner, TextArea } from "@/components/ui";
import { useUI } from "@/components/UIProvider";
import { useCancelAppointment } from "@/lib/hooks";
import type { Appointment } from "@/lib/types";

const MAX = 200;

export function CancelModal({
  appointment,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const { toast } = useUI();
  const cancelAppt = useCancelAppointment();
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);

  async function confirm() {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    try {
      await cancelAppt.mutateAsync({ id: appointment.id, reason: reason.trim() });
      toast("Consulta cancelada.");
      onClose();
    } catch {
      toast("Não foi possível cancelar a consulta.", "error");
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Voltar
          </Button>
          <Button
            variant="danger"
            onClick={confirm}
            disabled={cancelAppt.isPending}
          >
            {cancelAppt.isPending ? <Spinner /> : "Confirmar cancelamento"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/15">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
        </div>
        <h2 className="mt-3 text-lg font-semibold text-ink">
          Cancelar Consulta
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          A consulta de{" "}
          <span className="font-medium text-ink">
            {appointment.patient?.full_name}
          </span>{" "}
          será marcada como cancelada. Ela permanece visível no histórico.
        </p>
      </div>

      <div className="mt-5 space-y-1.5 text-left">
        <label
          htmlFor="cancel-reason"
          className="block text-sm font-semibold text-ink"
        >
          Motivo do cancelamento <span className="text-rose-500">*</span>
        </label>
        <TextArea
          id="cancel-reason"
          rows={3}
          maxLength={MAX}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError(false);
          }}
          placeholder="Descreva brevemente o motivo para registro no histórico..."
          aria-invalid={error}
          aria-describedby={error ? "cancel-reason-error" : undefined}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p
              id="cancel-reason-error"
              role="alert"
              className="text-xs text-rose-600 dark:text-rose-300"
            >
              Informe o motivo.
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-ink-muted">
            {reason.length}/{MAX}
          </span>
        </div>
      </div>
    </Modal>
  );
}
