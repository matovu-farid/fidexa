# Rishi Product Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated studio/review prototype in Pencil with a complete, product-led Rishi site prototype that reflects the current Apple app and omits pricing, changelog, and other obsolete routes.

**Architecture:** Keep `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` as the single Pencil source. Preserve the existing Fidexa studio/design pages (`Home`, `Work Index`, `Case Study — Rishi`, `Studio`, `Contact`, and `Site Redesign Review`) plus `Fidexa Logo` and `Design System`. Keep one self-contained `Rishi Site Redesign` page with labeled desktop/mobile route frames, and remove only the obsolete `Rishi Routes Review` board. Use a temporary Node MCP client over the existing Open Pencil Unix socket for page creation, node construction, deletion, save, and SVG export; do not modify the Apple app source.

**Tech Stack:** Open Pencil MCP JSON-RPC bridge, Figma Plugin API-compatible `eval`, Node.js, Pencil `.fig`, SVG exports, Apple app source as capability reference.

---

### Task 1: Capture the current Pencil document state

**Files:**
- Read: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig`
- Create temporarily: `/private/tmp/rishi-pencil-snapshot.mjs`
- Create temporarily: `/private/tmp/rishi-pencil-snapshot.json`

- [ ] **Step 1: Confirm the Open Pencil bridge and document inventory**

Run a temporary Node MCP client that connects to the bridge path from `/Users/faridmatovu/Library/Application Support/OpenPencil/mcp.json`, calls `list_documents`, then calls `list_pages` for the active document. Save the raw JSON snapshot to `/private/tmp/rishi-pencil-snapshot.json`.

The client must fail loudly if the bridge does not respond or if the target file is not `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig`; do not mutate the document in this task.

- [ ] **Step 2: Record page IDs by exact name**

From the snapshot, record the IDs for `Home`, `Work Index`, `Case Study — Rishi`, `Studio`, `Contact`, `Site Redesign Review`, and `Rishi Routes Review`. Treat the first six as preserved Fidexa pages. Record `Fidexa Logo` and `Design System` as preserved asset pages. If any target is absent, omit only that absent target and record the omission in the verification notes.

- [ ] **Step 3: Inspect existing file status before mutation**

Run:

```bash
git status --short -- fidexa-logo.fig public docs/superpowers
```

Do not stage or overwrite unrelated existing changes. The only intended tracked changes from this plan are the Pencil file, new redesign exports, and this plan/spec documentation.

### Task 2: Build the new Rishi product-site prototype page

**Files:**
- Modify: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` via Open Pencil MCP
- Create temporarily: `/private/tmp/rishi-pencil-redesign.mjs`

- [ ] **Step 1: Create the destination page and layout grid**

Use one MCP `eval` operation with Figma Plugin API-compatible code equivalent to:

```js
const page = figma.createPage();
page.name = "Rishi Site Redesign";
const board = figma.createFrame();
board.name = "Rishi product site — desktop + mobile prototype";
board.resizeWithoutConstraints(1600, 10400);
board.fills = [{type: "SOLID", color: {r: 0.957, g: 0.925, b: 0.847}}];
page.appendChild(board);
```

Place route frames on a consistent 80px outer grid. Use 1440px-wide desktop frames and 390px-wide mobile frames, with each frame named by route and viewport, for example `01 Home — desktop` and `01 Home — mobile`.

- [ ] **Step 2: Add the shared product-site chrome**

Create reusable visual groups or clearly labeled duplicates for:

- Rishi wordmark and folded-F product mark treatment.
- Desktop navigation: `Features`, `How it works`, `Support`, and `Download`.
- Mobile header with wordmark, menu trigger, and download action.
- Footer links to `Support`, `Privacy`, `Terms`, and the App Store CTA.

Use the verified app palette: background `#F4ECD8`, surface `#ECE2C7`, primary text `#3C2F1E`, secondary text `#6B5A3F`, muted text `#9B8B69`, accent `#7A5C2E`, and soft accent `#C2A678`. Essential copy must use primary or secondary text, never muted text alone.

- [ ] **Step 3: Construct the homepage frames**

Build desktop and mobile frames for `/` containing, in order:

1. Header and App Store CTA.
2. Hero copy `Your books, in one quiet place.` with supporting line about read, listen, ask, and sync.
3. Reader evidence panel with a book page, progress indicator, highlight treatment, and compact read-aloud controls.
4. EPUB/PDF import and Reading Now library panel.
5. Highlights/notes panel.
6. Text chat and live voice transcript panels.
7. Cross-device sync/shared-reading panel naming iPhone, iPad, Mac, and Apple Watch playback.
8. Privacy/accessibility reassurance.
9. Closing App Store CTA and footer.

Keep the feature order consistent between desktop and mobile; on mobile stack the app evidence before its explanatory copy.

- [ ] **Step 4: Construct feature and workflow frames**

Build desktop and mobile frames for `/features` and `/how-it-works`.

`/features` must contain five labeled groups: `Read`, `Listen`, `Ask`, `Keep your place`, and `Read together`, each paired with a verified capability and app evidence.

`/how-it-works` must contain a numbered sequence: `1 Bring a book`, `2 Settle into the reader`, `3 Mark the passage`, `4 Start narration or ask`, and `5 Continue anywhere`, plus a `What stays with you` panel naming position, highlights, notes, and saved conversations.

- [ ] **Step 5: Construct download, support, legal, and SMS frames**

Build desktop and mobile frames for `/download`, `/support`, `/privacy`, `/terms`, and `/sms`.

- `/download`: App Store badge/CTA, supported devices, Apple Watch playback note, restore/manage-in-app note; no price.
- `/support`: import, reading/narration, chat/voice, sync, and account/subscription support categories plus `support@fidexa.org`.
- `/privacy` and `/terms`: narrow reading measure, heading hierarchy, effective-date metadata, and footer navigation.
- `/sms`: compliance utility aligned to the legal/support visual language, not primary navigation.

The text must contain no pricing table, web checkout, changelog, or blog navigation.

- [ ] **Step 6: Add prototype media notes and app-evidence labels**

Add a clearly labeled `App evidence / capture status` strip to the new page. Use source-backed static frames for library, reader, read-aloud, chat, voice, and sync states. Label them `source-backed prototype frame` until a valid simulator screenshot exists. Reserve a storyboard strip for the import → read → ask → sync flow, and do not imply that a recording exists if simulator capture remains blocked.

### Task 3: Remove only the obsolete Rishi review board and save the document

**Files:**
- Modify: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` via Open Pencil MCP
- Read: `/private/tmp/rishi-pencil-snapshot.json`

- [ ] **Step 1: Delete only the obsolete Rishi review board**

Using the exact page ID from Task 1, delete only this page:

```text
Rishi Routes Review
```

Preserve all Fidexa pages (`Home`, `Work Index`, `Case Study — Rishi`, `Studio`, `Contact`, `Site Redesign Review`) plus `Fidexa Logo`, `Design System`, and `Rishi Site Redesign`. Do not delete any page whose name does not appear in this list without stopping for user direction.

- [ ] **Step 2: Save the approved Pencil document**

Call the Open Pencil save operation for `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig`. Re-list documents and pages afterward. Expected result: `Rishi Site Redesign`, all six Fidexa pages, `Fidexa Logo`, and `Design System` remain, with no `Rishi Routes Review` page.

- [ ] **Step 3: Export reviewable SVGs**

Export the new redesign page and at least one mobile/legal crop to:

```text
/Users/faridmatovu/projects/fidexa/public/fidexa-rishi-site-redesign.svg
/Users/faridmatovu/projects/fidexa/public/fidexa-rishi-site-redesign-mobile.svg
```

If the exporter requires a node ID, obtain it from the post-save page listing rather than inventing one.

### Task 4: Verify the redesign against the specification

**Files:**
- Read: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig`
- Read: `/Users/faridmatovu/projects/fidexa/public/fidexa-rishi-site-redesign.svg`
- Read: `/Users/faridmatovu/projects/fidexa/public/fidexa-rishi-site-redesign-mobile.svg`

- [ ] **Step 1: Verify route and removal labels**

Run:

```bash
rg -n "Rishi Site Redesign|Home|Features|How it works|Download|Support|Privacy|Terms|SMS|pricing|changelog|blog" public/fidexa-rishi-site-redesign*.svg
```

Expected: all required route labels are present; `pricing`, `changelog`, and `blog` are absent from navigation/content except where the prototype explicitly says they are omitted, if that note is included.

- [ ] **Step 2: Verify export integrity and empty text**

Run:

```bash
git diff --check -- public/fidexa-rishi-site-redesign.svg public/fidexa-rishi-site-redesign-mobile.svg
rg -n "<text[^>]*>\\s*</text>|TBD|TODO|Lorem|placeholder" public/fidexa-rishi-site-redesign*.svg
```

Expected: the diff check is clean and the empty/placeholder search returns no matches.

- [ ] **Step 3: Visually inspect exported files**

Open both SVGs in the app preview and inspect: readable essential copy, consistent palette, no clipped frames, clear desktop/mobile distinction, visible footer legal links, and no accidental pricing/changelog sections.

- [ ] **Step 4: Record simulator evidence honestly**

Attempt the approved simulator capture workflow only after the Pencil prototype is complete. If the current Apple build still fails in the Watch asset catalog or `numkong/numkong.h` dependency, keep the source-backed prototype frames and record the capture limitation in the handoff; do not substitute a failed simulator PNG as app evidence.

- [ ] **Step 5: Report final state**

Report the saved Pencil file, exported SVG paths, remaining preserved asset pages, deleted obsolete pages, route coverage, and whether media is real simulator evidence or source-backed prototype content.
