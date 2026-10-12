import { site } from "../src/data/site";
import { projects } from "../src/data/projects";

// Read-only HTTP audit. This does not submit URLs or exercise contact/API writes.
const base = new URL(process.argv[2] ?? "http://localhost:3001");
if (!["http:", "https:"].includes(base.protocol)) throw new Error("Use an HTTP(S) base URL");
const checks: { check: string; passed: boolean; detail?: string }[] = [];
function check(name: string, passed: boolean, detail?: string) {
  checks.push({ check: name, passed, ...(detail ? { detail } : {}) });
}
function decode(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function attributes(tag: string): Record<string, string> {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], decode(match[2])]));
}
async function read(path: string, userAgent = "Mozilla/5.0") {
  const started = performance.now();
  const response = await fetch(new URL(path, base), { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(20000) });
  return { response, body: await response.text(), elapsedMs: Math.round(performance.now() - started) };
}

async function audit() {
  for (const page of site.pages) {
    const { response, body, elapsedMs } = await read(page.path);
    check(`${page.path}: HTTP 200`, response.status === 200, `${response.status}; ${elapsedMs} ms (request + body, not Core Web Vitals)`);
    const meta = Object.fromEntries((body.match(/<meta\b[^>]*>/g) ?? []).map(attributes).map((attr) => [attr.name ?? attr.property, attr.content]));
    const canonical = (body.match(/<link\b[^>]*>/g) ?? []).map(attributes).find((attr) => attr.rel === "canonical")?.href;
    const title = decode(body.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const url = new URL(page.path, site.url).href;
    check(`${page.path}: title and description`, title === page.title && meta.description === page.description);
    // Next normalizes the root metadata URL without a trailing slash; both forms
    // resolve to the same URL. Compare parsed URLs rather than raw strings.
    check(`${page.path}: canonical and social URL`, Boolean(canonical && meta["og:url"]) && new URL(canonical!, site.url).href === url && new URL(meta["og:url"], site.url).href === url);
    check(`${page.path}: Open Graph/Twitter facts`, [meta["og:title"], meta["twitter:title"]].every((value) => value === page.title) && [meta["og:description"], meta["twitter:description"]].every((value) => value === page.description));
    check(`${page.path}: studio share image`, Boolean(meta["og:image"]?.includes("/opengraph-image")) && meta["twitter:card"] === "summary_large_image");
    check(`${page.path}: agent guide discovery`, (body.match(/<link\b[^>]*>/g) ?? []).map(attributes).some((attr) => attr.rel === "help" && attr.href === `${site.url}/llms.txt`));
    check(`${page.path}: indexable`, !/noindex/i.test(`${meta.robots ?? ""} ${response.headers.get("x-robots-tag") ?? ""}`));
    if (page.path !== "/sms") {
      const scripts = [...body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter((match) => attributes(match[1]).type === "application/ld+json");
      check(`${page.path}: initial-HTML JSON-LD`, scripts.length === 1);
      const data = scripts.length ? JSON.parse(scripts[0][2]) : { "@graph": [] };
      check(`${page.path}: Organization + Person + WebSite`, ["Organization", "Person", "WebSite"].every((type) => data["@graph"].some((entity: { "@type": string }) => entity["@type"] === type)));
      if (page.path === "/projects") {
        const list = data["@graph"].find((entity: { "@type": string }) => entity["@type"] === "ItemList");
        const visibleHtml = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
        check("/projects: 11 initial-HTML project records", projects.every((project) => visibleHtml.includes(`id="project-${project.id}"`) && visibleHtml.includes(project.name)));
        check("/projects: catalog schema and anchor coverage", list?.itemListElement?.length === 11 && projects.every((project) => list.itemListElement.some((entry: { item: { url: string; description: string } }) => entry.item.url === `${site.url}/projects#project-${project.id}` && entry.item.description === project.description)));
      }
    }
  }
  for (const path of ["/llms.txt", "/llms-full.txt"]) {
    const { response, body } = await read(path);
    check(`${path}: UTF-8 text`, response.ok && /text\/plain;\s*charset=utf-8/i.test(response.headers.get("content-type") ?? ""));
    // "Docker secrets" is a public feature description, not a credential value.
    check(`${path}: public facts only`, body.startsWith("# Fidexa") && body.includes(site.email) && !/\/admin|\/api\/|outreach|campaign|(?:DATABASE_URL|API_KEY|AUTH_SECRET)\s*[=:]/i.test(body));
    if (path === "/llms-full.txt") check(`${path}: complete current catalog`, projects.every((project) => body.includes(project.description)));
  }
  const robots = await read("/robots.txt");
  check("robots: public access and private exclusions", robots.response.ok && robots.body.includes("User-Agent: *") && robots.body.includes("Allow: /") && ["/admin", "/admin-auth", "/api/"].every((path) => robots.body.includes(`Disallow: ${path}`)));
  check("robots: sitemap discovery", robots.body.includes(`Sitemap: ${site.url}/sitemap.xml`));
  const sitemap = await read("/sitemap.xml");
  check("sitemap: all public canonical pages", sitemap.response.ok && site.pages.every((page) => sitemap.body.includes(`<loc>${new URL(page.path, site.url).href}</loc>`)) && !/\/admin|\/api\//.test(sitemap.body));
  const auth = await read("/admin-auth");
  check("admin-auth: noindex", auth.response.ok && /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(auth.body));
  const image = await fetch(new URL("/opengraph-image", base), { signal: AbortSignal.timeout(20000) });
  const imageBytes = new Uint8Array(await image.arrayBuffer());
  const dimensions = new DataView(imageBytes.buffer);
  check("share image: real 1200×630 PNG", image.ok && image.headers.get("content-type")?.includes("image/png") === true && imageBytes.length > 24 && dimensions.getUint32(16) === 1200 && dimensions.getUint32(20) === 630);
  for (const [name, agent] of [
    ["basic agent", "Python-urllib/3.14"],
    ["OAI-SearchBot-style", "Mozilla/5.0 (compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot)"],
    ["Googlebot-style", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
  ]) {
    const { response } = await read("/projects", agent);
    check(`${name}: public read`, response.ok, `HTTP ${response.status}; supplied user agent, not a verified crawler IP`);
  }
  console.log(JSON.stringify({ base: base.origin, checkedAt: new Date().toISOString(), passed: checks.every((entry) => entry.passed), checks }, null, 2));
  if (checks.some((entry) => !entry.passed)) process.exitCode = 1;
}

audit().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Discovery audit failed");
  process.exitCode = 1;
});
