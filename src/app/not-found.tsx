import Link from "next/link";
import { CalendarSearch, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 px-4">
      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {/* Faded 404 watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 select-none text-[180px] font-black leading-none text-primary/5"
        >
          404
        </span>

        {/* Illustration */}
        <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-violet-500 shadow-xl shadow-primary/25">
          <CalendarSearch className="h-16 w-16 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="relative mt-8 text-2xl font-bold text-ink">
          Página não encontrada
        </h1>
        <p className="relative mt-2 text-sm text-ink-soft">
          A consulta ou página que você está procurando parece não existir ou
          foi movida. Verifique o endereço ou retorne ao início.
        </p>

        <Link
          href="/"
          className="relative mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a agenda
        </Link>
      </div>
    </div>
  );
}
