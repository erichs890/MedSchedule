"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarHeart,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Button, Spinner } from "@/components/ui";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Informe seu nome completo.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already")
          ? "Este e-mail já está cadastrado. Faça login."
          : "Não foi possível criar a conta. Tente novamente.",
      );
      setLoading(false);
      return;
    }

    if (data.session) {
      // Cadastro com login imediato (confirmação de e-mail desativada).
      router.replace("/");
      router.refresh();
      return;
    }

    // Confirmação de e-mail ativada no projeto.
    setDone(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-indigo-900/5">
          <div className="h-1.5 bg-primary" />
          <div className="px-8 pb-8 pt-9">
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

            {done ? (
              <div className="mt-7 flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-ink">
                  Conta criada!
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Enviamos um e-mail de confirmação para{" "}
                  <span className="font-medium text-ink">{email}</span>.
                  Confirme para ativar sua conta e fazer login.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Ir para o login
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-7 text-center">
                  <h2 className="text-lg font-semibold text-ink">
                    Criar sua conta
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Comece a gerenciar a agenda da sua clínica
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-ink"
                    >
                      Nome completo
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dra. Helena Martins"
                        className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

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
                        className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-ink"
                    >
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo de 6 caracteres"
                        className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-10 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
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

                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirm"
                      className="block text-sm font-semibold text-ink"
                    >
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repita a senha"
                        className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full"
                  >
                    {loading ? <Spinner /> : "Criar conta"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs font-medium text-ink-muted">OU</span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                <GoogleSignInButton
                  label="Cadastrar com Google"
                  onError={(m) => setError(m || null)}
                />

                <p className="mt-6 text-center text-sm text-ink-soft">
                  Já tem uma conta?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Entrar
                  </Link>
                </p>
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
