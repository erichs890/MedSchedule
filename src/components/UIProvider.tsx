"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import type { Appointment, Patient } from "@/lib/types";
import { cn } from "./ui";
import { AppointmentFormModal } from "./modals/AppointmentFormModal";
import { CancelModal } from "./modals/CancelModal";
import { PatientModal } from "./modals/PatientModal";
import { AppointmentDetailPanel } from "./AppointmentDetailPanel";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

type ModalState =
  | { kind: "new"; prefill?: { date?: string; time?: string } }
  | { kind: "edit"; appointment: Appointment }
  | { kind: "cancel"; appointment: Appointment }
  | { kind: "patient"; patient?: Patient }
  | null;

interface UIContextValue {
  toast: (message: string, kind?: ToastKind) => void;
  openNew: (prefill?: { date?: string; time?: string }) => void;
  openEdit: (appointment: Appointment) => void;
  openCancel: (appointment: Appointment) => void;
  openPatient: (patient?: Patient) => void;
  openDetail: (id: string) => void;
  closeModal: () => void;
  closeDetail: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI deve ser usado dentro de UIProvider");
  return ctx;
}

const TOAST_ICON: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-rose-500" />,
  info: <Info className="h-5 w-5 text-primary" />,
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const value: UIContextValue = {
    toast,
    openNew: (prefill) => setModal({ kind: "new", prefill }),
    openEdit: (appointment) => setModal({ kind: "edit", appointment }),
    openCancel: (appointment) => setModal({ kind: "cancel", appointment }),
    openPatient: (patient) => setModal({ kind: "patient", patient }),
    openDetail: (id) => setDetailId(id),
    closeModal: () => setModal(null),
    closeDetail: () => setDetailId(null),
  };

  return (
    <UIContext.Provider value={value}>
      {children}

      {(modal?.kind === "new" || modal?.kind === "edit") && (
        <AppointmentFormModal
          appointment={modal.kind === "edit" ? modal.appointment : undefined}
          prefill={modal.kind === "new" ? modal.prefill : undefined}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "cancel" && (
        <CancelModal
          appointment={modal.appointment}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "patient" && (
        <PatientModal
          open
          patient={modal.patient}
          onClose={() => setModal(null)}
          onSaved={() => setModal(null)}
        />
      )}

      {detailId && (
        <AppointmentDetailPanel
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}

      {/* Toast viewport */}
      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-lg shadow-slate-900/5 animate-slide-up",
            )}
          >
            <div className="mt-0.5 shrink-0">{TOAST_ICON[t.kind]}</div>
            <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
            <button
              onClick={() =>
                setToasts((arr) => arr.filter((x) => x.id !== t.id))
              }
              className="shrink-0 text-ink-muted transition-colors hover:text-ink"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
}
