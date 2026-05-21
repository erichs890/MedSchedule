"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Smartphone, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Spinner } from "./ui";
import { useUI } from "./UIProvider";

type Status = "loading" | "off" | "enrolling" | "on";

export function MfaSettings() {
  const { toast } = useUI();
  const [status, setStatus] = useState<Status>("loading");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.find((f) => f.status === "verified");
      setStatus(verified ? "on" : "off");
    })();
  }, []);

  async function startEnroll() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    // Remove fatores não verificados deixados por tentativas anteriores.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.status === "unverified") {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `MedSchedule ${Date.now()}`,
    });
    if (enrollError || !data) {
      setError("Não foi possível iniciar a ativação. Tente novamente.");
      setBusy(false);
      return;
    }
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
    setStatus("enrolling");
    setBusy(false);
  }

  async function confirmEnroll() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });
    if (verifyError) {
      setError("Código inválido. Verifique no aplicativo e tente novamente.");
      setCode("");
      setBusy(false);
      return;
    }
    setCode("");
    setQr("");
    setSecret("");
    setStatus("on");
    setBusy(false);
    toast("Verificação em duas etapas ativada.");
  }

  async function cancelEnroll() {
    const supabase = createClient();
    if (factorId) await supabase.auth.mfa.unenroll({ factorId });
    setFactorId("");
    setQr("");
    setSecret("");
    setCode("");
    setError(null);
    setStatus("off");
  }

  async function disable() {
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of data?.all ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    setStatus("off");
    setBusy(false);
    toast("Verificação em duas etapas desativada.");
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Spinner className="h-4 w-4" /> Carregando...
      </div>
    );
  }

  if (status === "on") {
    return (
      <div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5">
          <Check className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">
            Verificação em duas etapas ativada.
          </p>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          A cada login será solicitado um código do seu aplicativo
          autenticador.
        </p>
        <div className="mt-3">
          <Button variant="secondary" onClick={disable} disabled={busy}>
            {busy ? <Spinner /> : "Desativar 2FA"}
          </Button>
        </div>
      </div>
    );
  }

  if (status === "enrolling") {
    return (
      <div className="space-y-4">
        <ol className="space-y-1 text-sm text-ink-soft">
          <li>
            1. Abra um app autenticador (Google Authenticator, Authy, etc.).
          </li>
          <li>2. Escaneie o QR Code abaixo.</li>
          <li>3. Digite o código de 6 dígitos gerado.</li>
        </ol>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="QR Code para verificação em duas etapas"
            className="h-44 w-44 rounded-lg border border-line bg-white"
          />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Ou insira esta chave manualmente
              </p>
              <code className="mt-1 block break-all rounded-md bg-slate-100 px-2 py-1.5 text-xs text-ink">
                {secret}
              </code>
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">
                Código de verificação
              </label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="mt-1 h-11 w-full rounded-lg border border-line bg-white text-center text-lg font-bold tracking-[0.4em] text-ink placeholder:text-ink-muted/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex gap-2">
          <Button variant="ghost" onClick={cancelEnroll} disabled={busy}>
            Cancelar
          </Button>
          <Button
            onClick={confirmEnroll}
            disabled={busy || code.length !== 6}
          >
            {busy ? <Spinner /> : "Confirmar e ativar"}
          </Button>
        </div>
      </div>
    );
  }

  // status === "off"
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-ink-soft">
          <Smartphone className="h-4.5 w-4.5" />
        </span>
        <p className="text-sm text-ink-soft">
          Adicione uma camada extra de segurança exigindo um código do seu
          celular além da senha. Recomendado para proteger dados de pacientes.
        </p>
      </div>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <div className="mt-3">
        <Button onClick={startEnroll} disabled={busy}>
          {busy ? <Spinner /> : <ShieldCheck className="h-4 w-4" />}
          Ativar verificação em duas etapas
        </Button>
      </div>
    </div>
  );
}
