import type { MetadataRoute } from "next";

const siteUrl = "https://www.fidexa.org";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/projects", "/sms"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
  }));
}
