"use client";

import { useRef } from "react";
import { Paperclip, Upload, FileText, Trash2, Info } from "lucide-react";
import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "@/lib/hooks";
import { getAttachmentUrl, type PatientAttachment } from "@/lib/data";
import { useUI } from "./UIProvider";
import { Button, Spinner } from "./ui";

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentsCard({ patientId }: { patientId: string }) {
  const { toast } = useUI();
  const { data: attachments, isLoading, isError } = useAttachments(patientId);
  const upload = useUploadAttachment(patientId);
  const remove = useDeleteAttachment(patientId);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast("Arquivo muito grande (máximo 10 MB).", "error");
      return;
    }
    try {
      await upload.mutateAsync(file);
      toast("Anexo enviado com sucesso.");
    } catch {
      toast("Não foi possível enviar o anexo.", "error");
    }
  }

  async function openFile(att: PatientAttachment) {
    try {
      const url = await getAttachmentUrl(att.file_path);
      window.open(url, "_blank", "noopener");
    } catch {
      toast("Não foi possível abrir o arquivo.", "error");
    }
  }

  async function removeFile(att: PatientAttachment) {
    try {
      await remove.mutateAsync(att);
      toast("Anexo removido.");
    } catch {
      toast("Não foi possível remover o anexo.", "error");
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-ink">
            Documentos e exames
          </h3>
        </div>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={onPick}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
        >
          {upload.isPending ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Enviar arquivo
        </Button>
      </div>

      {isError ? (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/15 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Recurso de anexos não configurado. Execute{" "}
            <code className="rounded bg-amber-100 px-1">db/storage.sql</code> no
            Supabase para habilitar.
          </span>
        </div>
      ) : isLoading ? (
        <div className="py-4 text-center">
          <Spinner className="h-5 w-5 text-primary" />
        </div>
      ) : !attachments || attachments.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">
          Nenhum documento anexado. Envie exames, laudos e receitas.
        </p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-3 rounded-lg border border-line p-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <button
                onClick={() => openFile(att)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-ink hover:text-primary">
                  {att.file_name}
                </p>
                <p className="text-xs text-ink-muted">
                  {formatSize(att.file_size)} ·{" "}
                  {new Date(att.created_at).toLocaleDateString("pt-BR")}
                </p>
              </button>
              <button
                onClick={() => removeFile(att)}
                className="shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-rose-50 dark:bg-rose-500/15 hover:text-rose-600 dark:text-rose-300"
                aria-label="Remover anexo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
