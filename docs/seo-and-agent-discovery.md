# Fidexa search and agent discovery

Implementation and publication date: 12 October 2026. The user approved the full discovery audit scope and explicitly approved production publication, the scoped crawler rule, search ownership setup, and included analytics. All six approved improvements are deployed; search-engine processing is recorded separately from implementation completion.

## Implemented and published

- Shared public company facts in `src/data/site.ts` supply homepage, catalog, and SMS metadata, complete social cards, and generated reading guides.
- Server-rendered Organization, founder Person, WebSite, WebPage, and CollectionPage/ItemList JSON-LD. A hidden route-owned container preserves initial HTML, synchronizes the visible category, and removes stale schema on client navigation.
- A 1200×630 PNG studio share image at `/opengraph-image` replaces the Rishi screenshot in social previews.
- `/llms.txt` and `/llms-full.txt` are generated as UTF-8 text from the same public facts and 11-project catalog. A standard `rel="help"` head link advertises the concise guide.
- Existing project descriptions now give operational and delivery context, retaining platform limits and public evidence links. Historical work is not attributed to a company before its founding. No invented results, ratings, prices, or dates were added.
- Stable `/projects#project-…` links work for every record. Filters retain counts 2/1/5/3, with 11 at All. Filtering updates exactly one schema script; All clears the query string.
- The public sitemap retains only the three canonical pages. Wildcard crawler access and existing private-path robots exclusions remain. Admin and sign-in metadata explicitly specify noindex/nofollow.
- Optional issued `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` values are supported at build time. DNS verification does not require these environment variables.

## External status

| Step | Current verified state | Follow-up |
| --- | --- | --- |
| Cloudflare access | The scoped configuration rule is **active**. Basic Python public reads changed from 403/error1010 to HTTP 200. Read-only HEAD checks to `/admin-auth` and `/api/contact` still return 403. | Observe real crawler traffic; supplied crawler user agents alone do not establish real crawler-IP access. |
| Google Search Console | Domain ownership is verified by DNS. Sitemap status is **Success**, with 3 discovered pages. Homepage and SMS are indexed; the catalog was initially unknown, passed a live crawl test, and received an indexing request. Recrawl requests for all 3 public pages were accepted. | Catalog indexing and performance reporting are processed by Google; no ranking or completed catalog indexing is claimed. |
| Bing Webmaster Tools | Approved account sign-in and DNS CNAME ownership verification completed. Sitemap status is **Success**, with 3 discovered URLs and no reported errors or warnings. Inspections report all 3 public URLs indexed; recrawl requests for the updated pages were submitted. | Allow Bing to recrawl and update its index with the new markup. Existing index records are not proof that the new deployment has already been recrawled. |
| Vercel Web Analytics | The included Hobby option is **enabled**. The dashboard records 3 initial page views rather than demo charts. No paid upgrade was selected. | Use production page/referrer data as it accumulates; initial views can include verification traffic and are not an acquisition baseline. |
| Publication | SEO-only commit `3e67717bb21d33e7bd83cc4b5138808cd3921877` is on Git `main`. Vercel deployment `F7oUeEpjiefRddYraSxtjzHX3XAq` is **Ready**, assigned to production domains. Public HTTP audit passes 40/40. | Normal ongoing measurement; no publication approval remains pending. |

The Cloudflare rule disables **only Browser Integrity Check** for GET/HEAD requests to the studio hostnames, public page/guide/image paths, project-media assets, and Next static assets. It excludes APIs, administration, writes, and other subdomains. It does not alter WAF or DDoS settings. Do not turn off zone-wide protection to make the audit pass.

Search-crawler access and training consent are distinct. Existing wildcard robots permissions already allow OAI-SearchBot; no new training-consent policy was introduced. Successful requests with supplied crawler user-agent strings do not prove access from the real crawler IP ranges.

## Verification

Commands for the current workspace:

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm build
pnpm start -p 3001
pnpm exec tsx scripts/audit-discovery.ts http://localhost:3001
pnpm exec tsx scripts/audit-discovery.ts https://www.fidexa.org
```

The audit is read-only: it checks actual responses, metadata, initial-HTML JSON-LD/catalog coverage, guides, sitemap, private indexing directives, PNG dimensions, and public requests with basic/crawler-style user agents. It never submits a contact form, calls write APIs, or submits URLs to a search engine. Local checks retain production canonical URLs.

The production build passes. The full test suite passes 263 tests across 44 files. TypeScript passes. Browser verification covers 1512×982, 834×1194, 1194×834, 393×852, and the 390×844 overflow guard, with actual viewport dimensions checked. Hero bounds, media loading/order/crops, catalog counts, filter/schema synchronization, direct category links, reset behavior, SMS navigation, mobile navigation, and AI dialog bounds pass. No browser errors/warnings were observed. No inquiry or AI message was submitted.

A fresh independent reviewer returned PASS for the scoped local implementation, including matched screenshots and schema lifecycle checks. It explicitly found the overall goal incomplete while external setup remained pending. Review screenshots and machine-readable audit records are under `/private/tmp/fidexa-media-pass-seo-*` and `/private/tmp/fidexa-seo-*-audit.json`; these temporary files are not site assets.

After publication and external activation, the independent completion review returned PASS across all six approved requirements with no material gaps. Remaining search-engine processing and unavailable field metrics are follow-up states, not claims of completed indexing or improved rankings.

The final workspace and isolated release HTTP audits each pass 40/40 checks. The final release review found exactly 22 scoped files and no changes to other tracked files relative to the previous deployed commit. The published release also passes 40/40 response checks. Production browser checks cover all 15 page/viewport combinations, loaded media, no horizontal overflow, counts and schema of 2/1/5/3/11, one schema script, All clearing the query, homepage schema replacing catalog schema, and SMS removing schema. The live AI dialog opens and closes, and browser console checks found no warnings or errors. Temporary viewport overrides were reset. Proof is saved under `/private/tmp/fidexa-seo-production-audit.json`, `/private/tmp/fidexa-seo-live-browser-audit.json`, `/private/tmp/fidexa-seo-live-filter-audit.json`, and `/private/tmp/fidexa-media-pass-seo-live-*`.

## Release isolation

The workspace contains unrelated UI/admin/design changes. The release patch at `/private/tmp/fidexa-seo-release.patch` was applied directly to Git's index against previous production commit `835f31a`. Only the 22 reviewed SEO code, environment-example, test, and audit files were committed and pushed in the implementation commit. The specification, plan, and rollout runbook are recorded separately. This preserves the previous deployed composition and administrative implementation and leaves unrelated working files intact. A clean apply check passed before publication.

`/private/tmp/fidexa-seo-release-snapshot` is a **local verification copy**, not an upload package: it contains local environment/dependency symlinks and was never uploaded. Never stage or deploy the whole dirty workspace.

## Search measurement

`https://www.fidexa.org/sitemap.xml` is submitted to both engines. `/`, `/projects`, and `/sms` were inspected, and updated-page recrawl requests were submitted. Continue recording actual crawl/indexing outcomes rather than equating HTTP 200 or an accepted request with completed indexing.

In Search Console, compare equivalent periods for impressions, clicks, CTR, queries, and landing pages. Separate brand searches for Fidexa from service-intent searches such as custom software, business systems, native Apple apps, inventory, and lending software. Monitor both client-acquisition and product-discovery queries; Kampala/Uganda remains a factual location signal, not a restriction on remote clients.

In Web Analytics, use the **production** environment, Hostnames, Pages, and Referrers to measure visits from search and AI assistants. Referrer data measures clicks, not all citations or appearances. The current Hobby option includes page views but not custom events. Existing PostHog `contact_form_submitted`, `ai_chat_opened`, and outbound-project events are the configured inquiry/engagement measurement path; do not assume Vercel custom-event reporting is available on Hobby.

Search Console performance reporting still says processing data. Its Core Web Vitals report has insufficient mobile and desktop usage data over 90 days. No historical search/referral baseline is claimed. Analytics now has actual initial page views; they may include verification visits.

The available [PageSpeed Insights report](https://pagespeed.web.dev/analysis/https-fidexa-org/80ndsjibv6?form_factor=mobile) measures the deployed canonical homepage with Lighthouse 13.5.0. Mobile: performance 83, accessibility 96, best practices 100, SEO 100, agentic browsing 3/3, lab LCP 4.4 s, TBT 50 ms, CLS 0. Desktop: performance 98, accessibility 96, best practices 100, SEO 100, agentic browsing 3/3, lab LCP 0.6 s, TBT 140 ms, CLS 0. Mobile uses an emulated Moto G Power and slow 4G; desktop uses its separate lab profile. These are individual lab runs, not field Core Web Vitals or evidence of ranking/citation. The mobile report identifies image-delivery savings and render-blocking requests as remaining performance opportunities. The HTTP audit's timings remain request/body diagnostics, not Web Vitals. Screenshots and report text are saved under `/private/tmp/fidexa-seo-pagespeed-*`.

AI text guides and schema improve readability and identity; they do not guarantee ranking, indexing, or citation. Google's [AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features), [organization markup guidance](https://developers.google.com/search/docs/appearance/structured-data/organization), and [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) explain the underlying requirements and controls.
