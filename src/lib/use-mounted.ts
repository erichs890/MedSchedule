"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Retorna `false` no servidor e na primeira renderização do cliente,
 * e `true` após a hidratação. Usa `useSyncExternalStore`, a forma
 * idiomática de evitar divergências de hidratação em conteúdo que
 * depende de dados disponíveis apenas no cliente.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
