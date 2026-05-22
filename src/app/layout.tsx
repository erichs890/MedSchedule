import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://med-schedule-seven.vercel.app";
const TITLE = "MedSchedule: Agenda Médica";
const DESCRIPTION =
  "Sistema de agenda médica para clínicas: agendamentos, pacientes, prontuário e acompanhamento de consultas em tempo real.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · MedSchedule",
  },
  description: DESCRIPTION,
  applicationName: "MedSchedule",
  keywords: [
    "agenda médica",
    "clínica",
    "agendamento de consultas",
    "prontuário",
    "gestão de pacientes",
    "software para consultório",
  ],
  authors: [{ name: "MedSchedule" }],
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title: "MedSchedule",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "MedSchedule",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  viewportFit: "cover",
};

// Aplica o tema salvo antes da primeira pintura (evita "flash" de tema claro).
const themeScript = `
(function(){try{
  var t = localStorage.getItem('medschedule-theme');
  var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
