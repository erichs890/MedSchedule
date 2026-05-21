"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarHeart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Spinner } from "@/components/ui";

const DEMO_EMAIL = "doutor@clinica.com.br";
const DEMO_PASSWORD = "medschedule123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("E-mail ou senha incorretos. Verifique e tente novamente.");
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-indigo-900/5">
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

            <div className="mt-7 text-center">
              <h2 className="text-lg font-semibold text-ink">
                Bem-vindo de volta
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Entre na sua conta para gerenciar sua agenda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                {loading ? <Spinner /> : "Entrar"}
              </Button>
            </form>

            {/* Demo credentials */}
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_EMAIL);
                setPassword(DEMO_PASSWORD);
                setError(null);
              }}
              className="mt-5 w-full rounded-lg border border-dashed border-line bg-slate-50 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Acesso de demonstração — clique para preencher
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                <span className="font-medium text-ink">{DEMO_EMAIL}</span>
                {"  ·  "}
                <span className="font-medium text-ink">{DEMO_PASSWORD}</span>
              </p>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} MedSchedule · Sistema de agenda médica
        </p>
      </div>
    </div>
  );
}
