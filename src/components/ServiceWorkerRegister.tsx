"use client";

import { useEffect } from "react";

/** Registra o service worker para tornar o app instalável (PWA). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registro do service worker é opcional */
      });
    }
  }, []);

  return null;
}
