# Fidexa Search and Agent Discovery Implementation Plan

> Execution: work through these tasks in the current session and branch. Preserve unrelated edits. Use the verification-before-completion skill for every completion claim. The user has approved the full implementation scope.

**Goal:** Make Fidexa accessible, comprehensible, and measurable for search engines and AI agents.

**Architecture:** Shared public company facts and the existing project catalog supply route metadata, server-rendered JSON-LD, and generated text guides. Public pages retain their current composition. External crawler and indexing settings are verified independently from the app.

**Tech stack:** Next.js 16, React 19, TypeScript, Vitest, Next ImageResponse, Cloudflare, Google Search Console, Bing Webmaster Tools.

## 1. Public identity, metadata, and graph

- [x] Add `src/lib/seo.test.ts`: assert consistent route title/description across search, Open Graph, and Twitter; stable Organization/Person/WebSite references; one catalog item per project with its internal URL; safe serialization for `</script>`; no fabricated reviews/offers.
- [x] Run `pnpm exec vitest run src/lib/seo.test.ts` and confirm the missing implementation fails.
- [x] Add `src/data/site.ts` with the existing public URL, location, founder, email, and page descriptions. Add `src/lib/seo.ts` exporting `createPageMetadata`, `homeStructuredData`, `projectsStructuredData`, and `serializeJsonLd`. Use `JSON.stringify(data).replace(/</g, "\\u003c")` for script data.
- [x] Add `src/components/structured-data.tsx` and render it only in public route components/layouts. Wire full metadata into root, projects, and SMS. Add explicit noindex to admin and admin-auth. Preserve the SMS canonical literal required by its existing regression check.
- [x] Use shared public paths in sitemap and shared site URL in robots. Preserve wildcard crawler access and all existing disallows.
- [x] Add a 1200×630 studio Open Graph image with `next/og` and the shared company title.
- [x] Run the targeted tests and TypeScript.

## 2. Catalog evidence and generated reading guides

- [x] Add guide tests for all project names/descriptions, exact public evidence links, no private routes, and Rishi's current platform limitation.
- [x] Confirm tests fail before implementation.
- [x] Improve existing `src/data/projects.ts` descriptions using their current operational facts. Add stable IDs to existing index cards so JSON-LD and guides can link directly to each project.
- [x] Add `src/lib/agent-guide.ts` with `createAgentGuide(full: boolean)`. Generate concise page links and full project text from shared data.
- [x] Add statically generated `/llms.txt` and `/llms-full.txt` route handlers returning `Content-Type: text/plain; charset=utf-8`.
- [x] Run guide/catalog tests. Capture responsive catalog screenshots and fix any concrete overflow or readability regressions.

## 3. External crawler access and search registration

- [x] Inspect Cloudflare security configuration and reproduce the Python client rejection. Prepare an exact public-read exception rather than a global security change. Request action-time confirmation before publishing the exception.
- [x] Inspect existing Google/Bing ownership. Complete permitted setup and sitemap submission; prepare verification records before asking for any required final approval.
- [x] Support optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` build variables, using only issued tokens.
- [x] Record actual indexing and traffic status. Do not claim verification or indexed pages from a successful HTTP response alone.

## 4. Production verification and measurement

- [x] Add `scripts/audit-discovery.ts`, a read-only audit of actual page responses, JSON-LD, initial HTML catalog, canonical/social tags, robots/sitemap, text guides, and agent user-agent responses. Take an explicit base URL; keep production canonicals in localhost tests.
- [x] Run `pnpm test`, `pnpm exec tsc --noEmit`, and `pnpm build`. Inspect the production build on an available port; do not stop an unrelated process on 3001.
- [x] Capture matched old/new homepage, catalog, and SMS screenshots at 1512×982, 834×1194, 1194×834, 393×852, and the 390×844 overflow guard. Verify catalog filters/reset, contact and AI dialog, loaded media, bounds, and browser console.
- [x] Request a fresh independent adversarial review per AGENTS.md. Include the current-branch-only rule and prohibit edits/reverts to other work. Fix every material finding and repeat affected checks.
- [x] Save the reproducible results and search measurement runbook in `docs/seo-and-agent-discovery.md`, including external completion or blockers. Audit every requirement in the approved spec before ending the goal.

## Verified execution status

Local implementation and independent review pass. Full tests: 263/263. TypeScript and Turbopack production build pass. Current localhost:3001 response audit: 40/40. Matched screenshots and filter/navigation/dialog checks pass. The SEO-only snapshot based on deployed commit 835f31a also builds with Webpack and passes 40/40 response checks; its dependency symlink prevents Turbopack verification inside the temporary directory, not in the real workspace.

The user explicitly approved the external actions and production publication. SEO-only commit 3e67717 is published through Vercel's existing main integration; the deployment is Ready and the live response audit passes 40/40. Cloudflare's scoped rule is active, public basic-agent reads return 200, and administration/API basic-agent HEAD checks remain 403. Google and Bing ownership verification is complete and both sitemaps are submitted. Google reports sitemap Success with 3 pages; Bing also reports sitemap Success with 3 URLs. Representative URL inspections and recrawl requests are recorded in the runbook. Included Vercel analytics is enabled and records initial page views. Production responsive checks pass for all 15 page/viewport combinations, and filter/schema lifecycle checks pass.

PageSpeed Insights provides a measured homepage lab baseline: mobile performance 83, desktop 98, SEO 100 and agentic browsing 3/3 on both, accessibility 96 on both. Search Console has insufficient field Core Web Vitals data; search performance reporting is still processing. These external processing states are reported accurately and do not imply improved ranking or completed recrawling. See docs/seo-and-agent-discovery.md for the report and evidence.
