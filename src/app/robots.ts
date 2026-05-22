import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://med-schedule-seven.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas autenticadas e rotas internas não devem ser indexadas.
      disallow: ["/api/", "/auth/", "/configuracoes"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
