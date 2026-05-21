"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na aplicação:", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/15 text-rose-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-ink">
        Algo deu errado
      </h2>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">
        Não foi possível carregar esta tela. Tente novamente — se o problema
        continuar, recarregue a página.
      </p>
      <Button onClick={reset} className="mt-5">
        <RotateCcw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}
