# Fidexa search and agent discovery

Approved scope: the user requested all six improvements from the discovery audit on 12 October 2026.

## Requirements

1. Resolve the observed Cloudflare Browser Integrity Check rejection for public site reads, with a narrowly scoped rule. Preserve protection for writes, APIs, administration, and other subdomains. Inspect the dashboard before changing anything. A browser security exception needs confirmation at the final action.
2. Give the homepage, projects catalog, and SMS disclosures distinct titles, descriptions, canonical URLs, and complete Open Graph/Twitter metadata. Use a studio share image. Keep private routes out of search with explicit noindex metadata.
3. Render JSON-LD in the initial HTML. Describe the visible Organization, founder Person, WebSite, homepage WebPage, and projects CollectionPage/ItemList. Use stable entity IDs, valid internal project anchors, and facts already visible in the site. No invented ratings, prices, platform support, client outcomes, or company social profiles.
4. Strengthen existing catalog descriptions with delivery context and the operational problems supported by the current project facts. Retain the 11-project catalog, categories, product links, media order, route structure, and design. Do not add screens or service pages.
5. Serve generated `/llms.txt` and `/llms-full.txt` as UTF-8 text from shared site/project data. The concise guide links to the authoritative pages; the full guide includes the catalog descriptions and public evidence links. Neither includes operational, campaign, or administrative data. These are reading aids, not promises of ranking or citation.
6. Verify or set up Google Search Console and Bing Webmaster Tools, submit the existing sitemap, inspect representative URLs, and record indexing/traffic evidence where available. Provide optional verification environment variables, a reproducible HTTP discovery audit, and a measurement runbook. Measure available page performance without fabricating field Core Web Vitals.

## Boundaries

Implementation is on the existing workspace/branch. Preserve pre-existing changes. No visual redesign or changes to Penpot/Pencil composition. Use existing text/media frames for longer descriptions and check responsive readability. Publication must account for unrelated workspace changes; never deploy those implicitly.

## Verification

Unit-test metadata consistency, graph identities and references, catalog coverage, safe JSON serialization, text guide provenance, public sitemap coverage, and private indexing directives. Run the full existing test suite, TypeScript, and production build. Audit the production responses without JavaScript, then browser-test route/filter/contact/AI behavior, image loading, bounds, and console errors at the repository's primary Apple viewports and narrow overflow guard. A fresh independent reviewer checks the implementation and matched screenshots. Record external setup separately from verified local completion.
