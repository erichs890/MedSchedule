"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "./supabase/client";

/**
 * Assina mudanças do banco em tempo real (Supabase Realtime) e invalida o
 * cache do React Query — fazendo a agenda, o calendário e o dashboard
 * atualizarem ao vivo quando outro usuário cria, edita ou cancela algo.
 *
 * Retorna `true` quando a conexão em tempo real está ativa.
 */
export function useRealtimeSync(): boolean {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const invalidateAppointments = () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["bookedTimes"] });
    };

    const channel = supabase
      .channel("medschedule-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        invalidateAppointments,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointment_history" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["history"] });
          queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return connected;
}
