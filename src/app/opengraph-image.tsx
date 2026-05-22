import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MedSchedule — Sistema de Agenda Médica";

// Imagem usada ao compartilhar o link (WhatsApp, LinkedIn, etc.).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #7c3aed 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 28,
              background: "rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 70,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            Medical SaaS
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 86,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          MedSchedule
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 38,
            fontWeight: 400,
            maxWidth: 880,
            opacity: 0.92,
          }}
        >
          Agenda médica, pacientes e prontuário em tempo real.
        </div>
      </div>
    ),
    size,
  );
}
