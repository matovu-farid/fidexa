# Existing services and case-study access

The user approved improving the existing service explanation and making the existing case studies easier for search engines and AI agents to access after a live-site review. This is a focused content and rendering change, with no new routes, product claims, visual direction, or publishing step.

## Decisions

- Keep the homepage, four featured stories, catalog, categories, and stable project anchors.
- Clarify Client Solutions in its current card: web applications, native Apple apps, business systems; new products and existing systems; scope, design/build/deploy, and maintenance after launch. Keep Innovation Lab and its relationship to client work.
- Replace the Apartment Manager JavaScript-controlled disclosure with native `details`/`summary`, retaining the current button styling, closed default, workflow grid, images, captions, and privacy statement. Its content must be real initial HTML, with no duplicated or crawler-only version. It must expand by pointer and keyboard without JavaScript.
- The alternatives were forcing the existing Radix content to stay mounted (still requiring JavaScript to operate) or showing everything by default (unnecessarily lengthening the page). Native disclosure preserves the current presentation and removes the JavaScript dependency.
- Keep the existing generated agent guides consistent with the clarified services and include existing case-study facts in the full guide only if they are not already present. This is reader access, not a ranking guarantee.

## Validation

Extend the read-only discovery audit to inspect HTML outside scripts for existing stories and the deeper evidence, including headings, captions, and lazy images in a closed native disclosure. Demonstrate the access check failing on the old production build and passing on the new build. Run relevant tests, typecheck, build, and the discovery audit. Check production preview at MacBook, iPad portrait/landscape, iPhone, and the narrow overflow guard; test disclosure, filters/reset, contact/AI controls, and SMS without sending messages. Obtain a fresh independent review of matched old/new screenshots and scoped changes. Preserve unrelated changes and the current branch; do not commit or deploy unless requested.

## Implementation evidence

- Shared public copy lives in `src/data/services.ts`, used by the current service cards and both generated text guides. The full guide also includes all four existing case studies, their homepage anchors, and the deeper Apartment Manager workflows/capture links from the existing project data.
- Before implementation, the new guide test failed because case-study anchors and details were missing. The old production preview failed the three new HTML checks for deeper text, images/captions, and native disclosure; its four main case studies were already present. After implementation, 269 tests across 44 files, TypeScript, production build, and all 45 HTTP discovery checks pass. Existing Vite configuration and experimental SQLite warnings remain unrelated.
- Browser inspection confirms all three workflow headings remain in the DOM with the native disclosure closed; Enter closes and opens it. Evidence images retain lazy loading, dimensions, alt text, captions and responsive phone sources. No new claims or media were introduced.
- Exact viewport measurements cover 1512×982, 834×1194, 1194×834, 393×852, and 390×844. The home hero remains full bleed; home, catalog, SMS, and expanded evidence have no horizontal overflow. Four featured projects remain in order; category counts remain 2/1/5/3 and All restores 11 with the URL reset and one schema script.
- Contact fields and submit control are available; AI and mobile navigation dialogs open and close. The phone AI dialog fits inside the viewport. No inquiry or AI message was submitted. Browser warning/error logs are empty.
- Temporary evidence uses `/private/tmp/fidexa-media-pass-service-{old,new}-*.png` (actual PNGs). Matched hero/studio/workflow screenshots were recaptured in one active tab at the exact dimensions above after discovering that viewport changes affected only the active tab, and default captures truncated tall viewports. Explicit document-coordinate clips preserve the full requested viewport. Geometry and route results are in `/private/tmp/fidexa-service-access-{matched-viewports,layout,routes,interactions}.json`; HTTP results are in `/private/tmp/fidexa-service-access-{before,after}.json`.
- Viewport override reset. The production preview remains on port 3001. These changes are local and uncommitted; unrelated campaign/package changes are preserved.
- Fresh independent adversarial review: **PASS**, with no remaining material findings. Reviewer independently inspected built initial HTML and guide output, scoped source, exact-size PNGs and geometry/route evidence. All five expanded workflow captures and the mobile hero captures match the original presentation; service copy remains readable. Initial screenshot-evidence limitations were repaired and re-reviewed.

## Release authorization

After reviewing the verified local implementation, the user requested: “commit and push. It will auto deploy”. Release scope is limited to the service data/component, native evidence disclosure and scoped styles, generated guide and regression checks, and these implementation documents. Existing campaign, package, and unrelated untracked changes remain outside the release. The approved mechanism is the existing Git integration; no direct workspace upload or new Vercel project is required.
