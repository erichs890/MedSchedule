"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarHeart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Button, Spinner } from "@/components/ui";

const DEMO_EMAIL = "doutor@clinica.com.br";
const DEMO_PASSWORD = "medschedule123";

type Step = "credentials" | "mfa";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function finish() {
    router.replace("/");
    router.refresh();
  }

  // Mostra erro vindo do callback do login social.
  useEffect(() => {
    const erro = new URLSearchParams(window.location.search).get("erro");
    if (erro) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o parâmetro de erro da URL uma única vez após a montagem
      setError(erro);
    }
  }, []);

  // Detecta sessão pendente de MFA (usuário voltou sem concluir a 2ª etapa).
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: aal } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp =
          factors?.totp?.find((f) => f.status === "verified") ??
          factors?.totp?.[0];
        if (totp) {
          setFactorId(totp.id);
          setStep("mfa");
        }
      }
    })();
  }, []);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError("E-mail ou senha incorretos. Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    // Senha correta — verifica se há verificação em duas etapas.
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp =
        factors?.totp?.find((f) => f.status === "verified") ??
        factors?.totp?.[0];
      if (totp) {
        setFactorId(totp.id);
        setStep("mfa");
        setLoading(false);
        return;
      }
    }
    finish();
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });
    if (verifyError) {
      setError("Código inválido ou expirado. Tente novamente.");
      setCode("");
      setLoading(false);
      return;
    }
    finish();
  }

  async function backToLogin() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setStep("credentials");
    setCode("");
    setError(null);
    setPassword("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 dark:from-canvas dark:via-sidebar dark:to-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-surface shadow-xl shadow-indigo-900/5">
          <div className="h-1.5 bg-primary" />
          <div className="px-8 pb-8 pt-9">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                <CalendarHeart className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">
                MedSchedule
              </h1>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Medical SaaS
              </p>
            </div>

            {step === "credentials" ? (
              <>
                <div className="mt-7 text-center">
                  <h2 className="text-lg font-semibold text-ink">
                    Bem-vindo de volta
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Entre na sua conta para gerenciar sua agenda
                  </p>
                </div>

                <form onSubmit={handleCredentials} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-ink"
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@clinica.com.br"
                        className="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-ink"
                      >
                        Senha
                      </label>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() =>
                          setError(
                            "Recuperação de senha indisponível no MVP. Use as credenciais de demonstração.",
                          )
                        }
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-10 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                        aria-label="Mostrar senha"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-500/15 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="h-11 w-full">
                    {loading ? <Spinner /> : "Entrar"}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setEmail(DEMO_EMAIL);
                    setPassword(DEMO_PASSWORD);
                    setError(null);
                  }}
                  className="mt-5 w-full rounded-lg border border-dashed border-line bg-muted px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Acesso de demonstração — clique para preencher
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    <span className="font-medium text-ink">{DEMO_EMAIL}</span>
                    {"  ·  "}
                    <span className="font-medium text-ink">
                      {DEMO_PASSWORD}
                    </span>
                  </p>
                </button>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs font-medium text-ink-muted">OU</span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                <GoogleSignInButton
                  label="Entrar com Google"
                  onError={(m) => setError(m || null)}
                />

                <p className="mt-6 text-center text-sm text-ink-soft">
                  Não tem uma conta?{" "}
                  <Link
                    href="/cadastro"
                    className="font-semibold text-primary hover:underline"
                  >
                    Cadastre-se
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mt-7 flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-ink">
                    Verificação em duas etapas
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Digite o código de 6 dígitos do seu aplicativo
                    autenticador.
                  </p>
                </div>

                <form onSubmit={handleMfa} className="mt-6 space-y-4">
                  <input
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="h-14 w-full rounded-lg border border-line bg-surface text-center text-2xl font-bold tracking-[0.5em] text-ink placeholder:text-ink-muted/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-500/15 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="h-11 w-full"
                  >
                    {loading ? <Spinner /> : "Verificar e entrar"}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} MedSchedule · Sistema de agenda médica
        </p>
      </div>
    </div>
  );
}
