"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: 32, maxWidth: 380 }}>
          <h1
            style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}
          >
            Erro inesperado
          </h1>
          <p style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>
            Ocorreu um erro ao carregar o MedSchedule. Tente novamente.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              height: 40,
              padding: "0 20px",
              borderRadius: 8,
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
