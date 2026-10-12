import type { Metadata } from "next";
import { site } from "../data/site";
import { projects, type Project } from "../data/projects";

type PublicPage = { path: string; title: string; description: string };
type Entity = { "@id": string; "@type": string; [key: string]: unknown };
type SchemaGraph = { "@context": "https://schema.org"; "@graph": Entity[] };

const organizationId = `${site.url}/#organization`;
const founderId = `${site.url}/#founder`;
const websiteId = `${site.url}/#website`;

export function createPageMetadata(page: PublicPage): Metadata {
  const url = new URL(page.path, site.url).href;
  const image = { url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Fidexa — independent software studio in Kampala, Uganda" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { type: "website", locale: "en_US", url, siteName: site.name, title: page.title, description: page.description, images: [image] },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [image] },
  };
}

export function siteVerification(env: Record<string, string | undefined>): Metadata["verification"] {
  const google = env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = env.BING_SITE_VERIFICATION?.trim();
  return { ...(google ? { google } : {}), ...(bing ? { other: { "msvalidate.01": bing } } : {}) };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

function identityEntities(): Entity[] {
  return [
    {
      "@type": "Organization", "@id": organizationId,
      name: site.name, url: `${site.url}/`, description: site.profile,
      logo: `${site.url}/icon.svg`, email: site.email,
      address: { "@type": "PostalAddress", addressLocality: "Kampala", addressCountry: "UG" },
      founder: { "@id": founderId },
    },
    {
      "@type": "Person", "@id": founderId,
      name: site.founder.name, jobTitle: site.founder.role,
      url: site.founder.url, sameAs: [site.founder.linkedIn],
      worksFor: { "@id": organizationId },
    },
    {
      "@type": "WebSite", "@id": websiteId,
      name: site.name, url: `${site.url}/`, inLanguage: "en",
      publisher: { "@id": organizationId },
    },
  ];
}

export function homeStructuredData(): SchemaGraph {
  const page = site.pages[0];
  return { "@context": "https://schema.org", "@graph": [
    ...identityEntities(),
    { "@type": "WebPage", "@id": `${site.url}/#webpage`, url: `${site.url}/`, name: page.title, description: page.description, inLanguage: "en", isPartOf: { "@id": websiteId }, about: { "@id": organizationId } },
  ] };
}

export function projectsStructuredData(catalog: readonly Project[] = projects): SchemaGraph {
  const page = site.pages[1];
  const listId = `${site.url}/projects#catalog`;
  return { "@context": "https://schema.org", "@graph": [
    ...identityEntities(),
    { "@type": "CollectionPage", "@id": `${site.url}/projects#webpage`, url: `${site.url}/projects`, name: page.title, description: page.description, inLanguage: "en", isPartOf: { "@id": websiteId }, about: { "@id": organizationId }, mainEntity: { "@id": listId } },
    {
      "@type": "ItemList", "@id": listId,
      name: "Fidexa software projects", numberOfItems: catalog.length,
      itemListElement: catalog.map((project, index) => ({
        "@type": "ListItem", position: index + 1,
        item: {
          "@type": "CreativeWork",
          "@id": `${site.url}/projects#project-${project.id}`,
          url: `${site.url}/projects#project-${project.id}`,
          name: project.name, description: project.description,
          ...(project.media ? { image: new URL(project.media.src, site.url).href } : {}),
        },
      })),
    },
  ] };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
