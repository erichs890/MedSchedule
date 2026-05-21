import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as respostas.
const securityHeaders = [
  // Impede o navegador de "adivinhar" o tipo de conteúdo (anti MIME-sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Bloqueia o site de ser embutido em iframes (anti clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Limita o envio do referrer entre origens.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desliga APIs sensíveis do navegador que o app não usa.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Força HTTPS em acessos futuros.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Esconde o indicador de desenvolvimento (não interfere na UI da clínica).
  devIndicators: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
