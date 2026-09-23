import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin-auth", "/api/"],
    },
    sitemap: "https://www.fidexa.org/sitemap.xml",
  };
}
