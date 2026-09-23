# Fidexa conversion Penpot milestone

Date: 2026-09-23
Status: Design milestone pinned; implementation and public release still pending

## Scope and decision

The owner approved the focused conversion revision, the frame, and all subsequent design work. The cloud Penpot file `fidexa` (`c828d3cf-7d4e-8145-8008-9b77dfa39008`) remains the collaborative visual source, on page `Fidexa Site Redesign` (`faac668c-bc72-80b1-8008-8d1cb989eb4d`). The historical `Fidexa redesign / organized review board` and every other page were preserved. The new version is named `Fidexa conversion revision / approved design / 2026-09-23` in Penpot history.

The revision uses the existing Editorial direction and topbar landing skeleton: full-bleed navy proposition, genuine product proof, Client Solutions / Innovation Lab, a real inquiry form, and a closing footer. The primary action is `Tell us about your project`; `Send inquiry` is the only action that transmits the project brief. The design makes no booking, client-logo, metric, testimonial, or fabricated-dashboard claim.

## New boards

- Desktop home `c1f274cf-fd09-8021-8008-ae0e6f799493` (1512px wide, complete scroll composition).
- iPhone 393×852 first fold `4bfe5d7b-4e0b-80ff-8008-ae1580940a69`, work scroll 1 `4bfe5d7b-4e0b-80ff-8008-ae15d778791d`, work scroll 2 `be99e719-f0b6-8030-8008-ae1726ac2893`, and contact scroll `be99e719-f0b6-8030-8008-ae178912119b`. These are viewport-sized scroll states of one homepage, not separate route concepts.
- iPad portrait `be99e719-f0b6-8030-8008-ae183a1222e4` (834×1194) and landscape `be99e719-f0b6-8030-8008-ae18d630ab78` (1194×834).
- Projects All `be99e719-f0b6-8030-8008-ae19b16727b0` (1512×982) and AI filter state `be99e719-f0b6-8030-8008-ae1a465ab75f` (two entries; All returns eleven).
- SMS desktop `be99e719-f0b6-8030-8008-ae1a7987ea3f` (1512×982) and iPhone `be99e719-f0b6-8030-8008-ae1f4c08f43d` (393×852).
- Contact success/error state annotations `4bfe5d7b-4e0b-80ff-8008-ae15639e6fcb`.

## Review record

Every home section and viewport board above was exported and visually inspected. The complete desktop board was exported and checked for section flow. Rishi, Kaks Credit, and Inventory use the existing verified product-image fills; no synthetic UI was introduced. A transient Penpot network save failure was recovered by reopening the saved version and rebuilding only the unsaved card work, then verifying its export. A later mobile work-header overflow of 4px was corrected and re-exported.

The structural scan covered twelve new top-level boards, 124 layout boards, 210 text layers, and fifteen placed image fills. Every layout board uses flex or grid. No child overflow remains. Six sibling intersections are the intentional shapes within the cloned Fidexa logo; no content siblings collide. Edited color pairings checked at 4.73:1 or better (`content.muted` on warm paper 4.73:1; violet on white 5.37:1; mint on navy and navy on mint 7.14:1). The existing Fidexa semantic and typography token sets were used; no token was added. Four hero body styles use bound size/weight/fill tokens instead of a composite typography token so the body can remain 16px. The inherited Manrope family remains unchanged.

Design-quality self-critique (1–5, against the reviewed exports): hierarchy 4 (one primary inquiry action at each first fold), composition 4 (full-bleed hero and real proof), typography 4 (clear page/section/body ladder), color 4 (mint CTA on navy, restrained violet labels), spacing 3 (consistent 4px-derived gap ladder, with deliberate generous white space in form/SMS cards), content 4 (factual project and consent copy; explicit submit/error states), distinctiveness 3 (recognizable Fidexa mark/palette with conventional catalog/form patterns). No axis is below 3; no material design finding remains open. This self-critique is not the later independent adversarial review of the rendered app.

## Implementation contract

Align existing reusable components and data to the design; do not replace the app wholesale. Preserve all eleven projects, exact category counts, real media order, substantive descriptions, SMS language, and functional contact/AI paths. Verify a production build at 1512×982, 834×1194, 1194×834, 393×852, plus 390×844 overflow guard. A fresh adversarial reviewer must inspect matched design/rendered-site captures and pass before push/deploy.
