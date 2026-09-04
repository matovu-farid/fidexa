# Fidexa Color Principles for Modern UI

**Color handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04
**Palette status:** The principles are normative. The Fidexa values in Section 10 are a provisional starter palette, not a new brand approval.

## How to use this handbook

Color is not decoration added after the interface is solved. It is a system for directing attention, expressing personality, grouping information, communicating state, creating depth, and helping people understand what to do.

The goal is modern UI that feels alive without becoming loud. Start with a composed neutral field. Add distinctive color where it earns attention. Give every meaningful color a role, every role a tested tonal range, and every semantic meaning a non-color companion.

Use this handbook with the [Fidexa UI/UX Design Principles](./ui-ux-design-principles.md) and the [Fidexa UI/UX Design Review Checklist](./ui-ux-design-review-checklist.md). The UI/UX handbook explains the wider design reasoning; this document is the color-specific authority.

### Status markers

- **Principle** — default guidance for Fidexa work.
- **Requirement** — an accessibility, product, platform, or evidence gate. Treat failure as a defect until there is a documented exception.
- **Recipe** — a repeatable application pattern, not a universal visual law.
- **Provisional** — a useful draft value or mapping that needs visual and brand review before becoming a final token contract.
- **Inference** — a Fidexa synthesis from the cited sources and current product context, not a direct quotation or universal rule.

When guidance conflicts, preserve accessibility, user comprehension, truthful status, and product purpose first; then platform conventions; then brand expression and taste.

## 1. The Fidexa color doctrine

### Modern does not mean colorful

Modern UI feels current because its decisions are intentional: strong hierarchy, calm surfaces, controlled contrast, useful motion, precise type, and a clear point of view. More colors do not create more personality. They usually spend attention before the user knows where to look.

- **Meaning:** Modernity comes from coherent decisions and distinctive emphasis, not maximum saturation.
- **Do:** Build a restrained base, choose a recognizable accent language, and create a few memorable color moments.
- **Avoid:** Treating rainbow palettes, neon effects, gradients, or colored cards as a substitute for hierarchy.
- **Review question:** If all decorative color were removed, would the structure and purpose still make sense?

### Calm base, expressive moments

Use neutrals for most page area, reading surfaces, supporting text, borders, and layout zones. Use brand and accent colors for primary actions, selected states, focal content, product proof, meaningful status, or a deliberate editorial moment.

- **Meaning:** A quiet field makes a strong accent legible and valuable.
- **Do:** Decide where the eye should land first, second, and third; assign color only where it reinforces that sequence.
- **Avoid:** Making every card, button, label, and metric equally saturated.
- **Review question:** What is the strongest color moment in this view, and why does it deserve that attention?

### Color is an attention budget

Color is one of the fastest visual signals. A saturated or high-contrast treatment is a request for attention. Treat attention as scarce: use one dominant action color, a small number of supporting accents, and semantic colors only when the state is real.

- **Meaning:** Color emphasis should correspond to importance, urgency, interaction, or identity.
- **Do:** Spend the strongest contrast on the current task, primary action, key insight, or genuine alert.
- **Avoid:** Multiple competing focal points, permanent alert colors, and “loud by default” components.
- **Review question:** What attention request does each non-neutral color make?

### Personality must remain usable

Brand expression is valuable when it makes the product recognizable and emotionally appropriate. It must not make text, controls, data, or states harder to perceive. Use the expressive layer around content and behavior, not in place of them.

- **Meaning:** A memorable color system supports the person instead of asking the person to tolerate the brand.
- **Do:** Let color work with typography, shape, spacing, imagery, and motion as a coordinated language.
- **Avoid:** Making accessibility, cultural meaning, or task clarity subordinate to a mood board.
- **Review question:** Does this color make the product more recognizable without making the task harder?

### Source synthesis

Apple describes color as a way to improve communication, brand expression, continuity, status, and understanding, while also recommending consistent meanings, inclusive alternatives, and light/dark/increased-contrast testing. Material 3 formalizes expressive color through roles, tonal palettes, and primary/secondary/tertiary relationships. Linear’s product philosophy reinforces purpose, clarity, speed, and noise reduction. This handbook combines those ideas into the Fidexa rule: **be distinctive in the moments that matter, and quiet everywhere else.** [Apple Color](https://developer.apple.com/design/human-interface-guidelines/color), [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3), [Linear Method](https://linear.app/method/introduction)

## 2. Color roles and semantic tokens

### Use roles before values

A raw value answers “what color is this?” A semantic role answers “what is this color doing here?” Roles allow light and dark themes, accessibility variants, redesigns, and brand evolution without changing the meaning of every component.

- **Meaning:** The same visual value can be appropriate in one context and misleading in another; the role records intent.
- **Do:** Name tokens by purpose and state: `color.background.canvas`, `color.text.primary`, `color.action.primary`, `color.focus.ring`, `color.status.danger`.
- **Avoid:** Choosing `#7C5CFC` directly inside a card, button, alert, or chart because the swatch looks right.
- **Review question:** Can another designer understand why this color is used without seeing its hex value?

### Minimum Fidexa semantic vocabulary

| Role family | Example tokens | Use |
| --- | --- | --- |
| Canvas and surfaces | `background.canvas`, `background.surface`, `background.elevated`, `background.inverse` | Page, section, card, overlay, and reversed surfaces |
| Content | `text.primary`, `text.secondary`, `text.muted`, `text.inverse` | Reading hierarchy and content on known surfaces |
| Action | `action.primary`, `action.primary-hover`, `action.primary-pressed`, `action.secondary`, `action.ghost` | Actions with explicit emphasis and interaction states |
| Accent | `accent.brand`, `accent.secondary`, `accent.tertiary` | Personality, selection, focus support, and expressive moments without semantic alert meaning |
| Border and focus | `border.default`, `border.subtle`, `border.strong`, `focus.ring` | Separation, control recognition, and keyboard focus |
| Status | `status.information`, `status.success`, `status.warning`, `status.danger` | Truthful system or product status, never decoration |
| Data | `data.categorical.*`, `data.sequential.*`, `data.diverging.*`, `data.highlight`, `data.alert` | Chart and analytical communication |
| Effects | `overlay.scrim`, `overlay.tint`, `shadow.color`, `selection.background` | Translucency, selection, and depth effects |

Atlassian, IBM Carbon, Vercel Geist, and shadcn/ui all show variations of the same durable pattern: a semantic token maps a role to a value, and themes or states can change the value without changing the role. [Atlassian Color](https://atlassian.design/foundations/color), [IBM Carbon Color](https://carbondesignsystem.com/elements/color/overview/), [Geist Colors](https://vercel.com/geist/colors), [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)

### `on-*` pairings

Every filled or colored surface needs a known foreground pairing. For example, `action.primary` pairs with `action.primary-foreground`, and `accent.brand-container` pairs with `accent.brand-on-container`.

- **Do:** Test text, icons, focus indicators, and controls on the actual surface they sit on.
- **Avoid:** Assuming a foreground that worked on white also works on mint, violet, a gradient, an image, or a dark surface.
- **Review question:** Is the foreground explicitly paired with this surface in every supported theme and state?

### Keep primitives and semantics separate

Primitive tokens describe a palette scale (`violet.500`, `gray.100`, `mint.600`). Semantic tokens describe use (`action.primary`, `text.secondary`). Components should consume semantic tokens. Only the token definition layer should consume raw primitives.

This separation makes the design system durable: a brand value can shift, a dark theme can remap it, and a status role can become safer without rewriting every component.

## 3. Palette construction

### Build a neutral ramp first

Neutrals are not empty space. They establish the reading field, layer surfaces, separate zones, quiet secondary content, and create the contrast that makes accents meaningful. Use a ramp with enough steps for canvas, surface, elevated surface, border, secondary text, and inverse contexts.

- **Do:** Give light and dark themes their own neutral ramps; tune surface relationships by context.
- **Avoid:** Using pure black and pure white everywhere, or creating depth through dozens of nearly indistinguishable gray values.
- **Review question:** Can the user perceive the surface hierarchy without relying on heavy borders or shadows?

### Build brand and accent ramps

One brand swatch is not a system. Build usable tonal partners for brand, secondary, and optional tertiary accents. Each ramp should include roles for text or icons, solid controls, containers, subtle backgrounds, hover, pressed, and dark-theme use.

Material 3 uses key colors and tonal palettes; Radix provides purpose-built scales whose steps correspond to interface use cases; Geist separates background, component, border, high-contrast, and text/icon roles. [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3), [Radix Colors](https://www.radix-ui.com/colors), [Geist Colors](https://vercel.com/geist/colors)

### Separate semantic colors from expressive accents

An accent is interchangeable personality. A semantic color carries a promise or warning. If a purple accent can change to blue without changing meaning, it is an accent. If red means destructive or danger, it must remain consistent and must not also mean “featured.”

- **Do:** Maintain distinct roles for brand, accent, information, success, warning, and danger.
- **Avoid:** Using brand violet for an error simply because it is darker, or using red as a general “interesting” highlight.
- **Review question:** If the hue changed while the role stayed the same, would the user’s interpretation change?

### Design foreground partners, not just backgrounds

For every colored background, define the text/icon color, hover value, pressed value, focus treatment, disabled treatment, and contrast expectation. A palette is incomplete when it only contains pretty backgrounds.

- **Do:** Name pairs explicitly and test them at realistic font sizes and weights.
- **Avoid:** Sampling a text color from a screenshot or adding white text to a saturated surface without testing.
- **Review question:** Does this role have a safe foreground and state range, or only a single attractive swatch?

### Use a consistent color space for decisions

Hex values are implementation outputs, not a design method. Use a perceptually useful ramp or a documented design-system scale when creating variants. Preserve an sRGB-safe baseline for broad web delivery; consider P3 only where the product and assets are tested on compatible displays.

- **Do:** Record the source color, scale method, theme mapping, and intended use.
- **Avoid:** Comparing colors only by raw RGB numbers or assuming equal numeric steps look equally different.
- **Review question:** Does the scale remain coherent in light mode, dark mode, grayscale, and the actual supported display range?

## 4. How to make UI expressive without making it loud

### Use an accent budget

As a starting recipe, let most of a view remain neutral, let one brand or primary accent establish the visual identity, and let a small number of secondary accents create rhythm. The exact percentages are not a law; the reviewable rule is that accents must have jobs.

| Layer | Default behavior | Example Fidexa use |
| --- | --- | --- |
| Neutral field | Dominant; supports reading and structure | Cloud, paper, ink, subtle surfaces |
| Primary brand accent | One dominant identity/action signal | Violet for focus, selected emphasis, or key brand moment |
| Secondary expressive accent | Occasional contrast or warmth | Mint in proof cards, positive emphasis, or editorial highlights |
| Semantic colors | Only when the state is true | Success, warning, danger, information |
| Visual effects | Rare and localized | Gradient wash, tint, translucent overlay, or image treatment |

- **Do:** Budget accent use across the whole screen, not component by component.
- **Avoid:** Allowing each section to invent its own “hero” color.
- **Review question:** Is there enough neutral space for the accent to remain special?

### Make accent moments earn attention

Good accent moments include a primary call to action, an active navigation state, an important product result, a hero proof surface, a selected data point, or a meaningful success state. The accent should clarify what matters or make the product feel like itself.

- **Do:** Pair color with stronger type, a clear shape, spatial prominence, or a meaningful transition.
- **Avoid:** Applying accent backgrounds to passive labels, long paragraphs, every navigation item, or every dashboard card.
- **Review question:** What user decision or emotional beat does this accent support?

### Combine color with other hierarchy signals

Use color with typography, size, spacing, shape, position, imagery, and motion. A selected item might use an accent plus a marker and a label. A warning might use a warm background plus an icon and text. A primary action might use color plus placement and wording.

- **Do:** Make the meaning survive when the view is grayscale or color vision is limited.
- **Avoid:** Making color the only difference between active/inactive, valid/invalid, or series A/series B.
- **Review question:** Which non-color signal carries this meaning?

### Use gradients as atmosphere or direction

Gradients can create depth, movement, warmth, or a distinctive hero field. They are risky behind text, controls, charts, and fine lines because the least-contrasting part of the gradient is the part users encounter.

- **Do:** Keep critical content on a tested solid or controlled surface; use gradients behind decorative or non-critical areas.
- **Avoid:** Putting small text over a busy gradient, using gradients to hide weak hierarchy, or changing gradient stops without rechecking contrast.
- **Review question:** If the gradient were removed or flattened, would every meaningful element remain legible?

### Use high-contrast moments sparingly

A dark shell with a light content zone, a bright CTA on a quiet surface, or a saturated proof card can create a memorable rhythm. It should be a deliberate moment, not the default treatment of every component.

- **Do:** Use a high-contrast treatment to mark a boundary, focus, action, or story beat.
- **Avoid:** Switching contrast modes so often that the page loses a stable reading field.
- **Review question:** Does this contrast change clarify structure, or only create visual drama?

## 5. Surface, depth, and layering

### Prefer tonal depth before shadow depth

Use small, intentional changes in surface tone to establish layers. Shadows can support the relationship, but they should not be the sole evidence that an element is elevated. Material 3 uses tonal elevation, Carbon uses a theme-aware layering model, and Geist recommends the lowest elevation that still reads as elevated. [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3), [Carbon Color](https://carbondesignsystem.com/elements/color/overview/), [Geist Materials](https://vercel.com/geist/materials)

- **Do:** Define a small elevation ladder: page, surface, raised, floating, modal.
- **Avoid:** Combining thick borders, strong shadows, blur, gradients, and multiple fills on every card.
- **Review question:** What layer is this element in, and what is the minimum visual treatment that makes that clear?

### Use alpha and translucency with a stable backing

Alpha colors can blend into a background and create a lighter, more fluid system. They also change when the content behind them changes. Keep the default resting state readable and test the strongest and weakest underlying colors.

- **Do:** Use a defined backing, controlled blur, and a fallback for unsupported or high-contrast contexts.
- **Avoid:** Letting content bleed through text, toolbar controls, focus rings, or status messages.
- **Review question:** Does this translucent treatment remain legible over the actual content that can appear beneath it?

### Do not stack materials blindly

Every additional effect adds a competing explanation: surface, border, shadow, blur, tint, and contrast. Let one material treatment establish the layer, then use spacing and hierarchy to do the rest.

- **Do:** Use the lowest effective elevation and keep decorative chrome separate from semantic meaning.
- **Avoid:** Stacking two elevation treatments on one element or using a shadow to communicate focus, selection, or status.
- **Review question:** Can the layer relationship be understood without inspecting five effects at once?

## 6. Themes and environments

### Design light and dark as related systems

Dark mode is not a filter. Remap surfaces, text, borders, accents, status colors, illustrations, shadows, and imagery for the dark context. Preserve meaning while changing values.

- **Do:** Define light and dark semantic values under the same role names.
- **Avoid:** Inverting colors mechanically, using pure white body text everywhere, or carrying a light-mode border into a dark surface unchanged.
- **Review question:** Does the same semantic role remain recognizable and readable in both themes?

### Support increased contrast and user preferences

Apple recommends custom colors with light, dark, and increased-contrast variants, and dynamic system colors whose names describe purpose rather than appearance. For web UI, the equivalent is a role system with tested high-contrast values and user-controlled preferences where supported.

- **Do:** Test default, dark, increased-contrast, zoomed, reduced-motion, and grayscale-like conditions where relevant.
- **Avoid:** Treating increased contrast as an edge case that can break the brand expression.
- **Review question:** What changes when contrast is increased, and does the hierarchy become clearer rather than merely harsher?

### Test real lighting and displays

Apple notes that colors can appear darker and more muted in bright surroundings and brighter and more saturated in dark environments. Displays also vary by color profile, True Tone, P3, and sRGB behavior.

- **Do:** Review important screens in bright and dim conditions, on representative devices, and in the supported color space.
- **Avoid:** Approving a palette only from a controlled design-tool canvas.
- **Review question:** Is the product still readable and emotionally appropriate outside the design environment?

### Keep colorful content from defeating controls

Images, maps, illustrations, and gradients can create unpredictable backgrounds. Controls and labels that sit above them need a stable contrast strategy.

- **Do:** Use a backing surface, adaptive monochrome treatment, scrim, or alternate placement where needed.
- **Avoid:** Similar-colored control labels over colorful artwork or relying on hover to reveal that a control exists.
- **Review question:** Does the resting state remain legible at the top of the screen and over the most likely content?

## 7. Component and interaction states

States are part of the color contract. Use separate semantic state tokens rather than asking each component to improvise a shade.

| State | Color’s job | Required companions |
| --- | --- | --- |
| Default | Establish the normal affordance and hierarchy | Label, shape, position, or boundary |
| Hover | Confirm pointer proximity without overpowering content | Visible control identity remains intact |
| Pressed | Show the action was engaged | Motion or position change when useful |
| Selected | Show current choice or scope | Marker, label, icon, or structural change |
| Focus-visible | Show keyboard or assistive focus | Strong ring/outline and logical focus order |
| Disabled | Explain unavailable interaction without pretending it is active | Reason or helper text where necessary |
| Loading | Show progress and preserve orientation | Skeleton, status text, or progress indication |
| Success | Confirm a favorable outcome | Plain-language confirmation and next step |
| Warning | Signal risk before an error | Explanation and safe action |
| Danger/error | Identify a real problem and its recovery | Error text, icon, preserved work, retry/fix path |
| Empty/stale | Explain absence or freshness | Scope, cause, and useful next action |

- **Do:** Create a state matrix for each reusable component and verify foreground/background pairs.
- **Avoid:** Using the same accent for hover, selected, success, and focus unless each distinction remains obvious through other cues.
- **Review question:** Can a user identify the state and the next action without recognizing the exact hue?

## 8. Accessibility and inclusive color

### Contrast requirements

Use the actual foreground/background pairs from the rendered interface. WCAG 2.2 sets these Level AA thresholds:

| Content | Minimum contrast |
| --- | --- |
| Normal text | `4.5:1` |
| Large text | `3:1` |
| UI components and meaningful graphical objects | `3:1` |

These are thresholds, not a target for fragile minimum compliance. Thin type, thin lines, gradients, anti-aliasing, and variable backgrounds can reduce practical legibility. Aim above the minimum when the content is important or the visual treatment is delicate. [WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [WCAG Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

### Never make color the only cue

W3C’s Use of Color criterion requires information, action, response, or distinction to remain available without color perception. Use text, labels, icons, shapes, patterns, underlines, position, or structural changes alongside hue.

- **Do:** Mark errors with an icon and message; mark selected items with a check or marker; distinguish chart series with labels, line styles, or patterns.
- **Avoid:** Red versus green as the only valid/invalid signal, color-only required fields, or chart legends users must remember by hue alone.
- **Review question:** Does the meaning survive for a person with color-vision deficiency, a monochrome display, or a grayscale screenshot?

### Focus must be visible

Focus is not hover and must not disappear into the palette. A focus ring needs sufficient contrast against its adjacent background and must remain visible over colored or elevated surfaces.

- **Do:** Reserve a dedicated `focus.ring` role, test it on every surface, and keep it visible at keyboard zoom.
- **Avoid:** Using a subtle tint that only looks visible on a high-resolution design canvas.
- **Review question:** Can a keyboard user always see where focus is, including on a primary-colored control?

### Accessible color is not colorless design

Accessibility does not require removing personality. It requires assigning color honestly, creating enough light-dark difference, and offering alternative cues. A vivid accent can be fully expressive when it has a tested foreground partner and a clear role.

## 9. Dashboards and data visualization

### Start from the question

Choose color and chart type based on the decision the dashboard supports. Color should make comparisons, trends, thresholds, and outliers easier to understand—not simply make the dashboard look rich.

- **Do:** Name the audience, decision, scope, freshness, and intended action before choosing a palette.
- **Avoid:** Using a different hue for every metric or adding color because the dashboard feels empty.
- **Review question:** What question does each color help the viewer answer?

### Use the right palette family

| Palette family | Use | Fidexa rule |
| --- | --- | --- |
| Categorical | Distinguish unrelated categories | Keep colors distinct, labeled, and limited; do not imply ranking accidentally |
| Sequential | Show ordered magnitude | Change lightness or intensity in a predictable direction |
| Diverging | Show movement around a meaningful midpoint | Define the midpoint and use two perceptually distinct sides |
| Highlight | Bring one item forward while preserving context | Keep the rest neutral or low emphasis |
| Alert | Communicate risk, breach, or required attention | Reserve for true alerts; pair with text and action |

Tableau recommends neutral primary colors, sparse brand accents, consistent meanings, contextual titles, discoverable interactions, and accessibility checks. It also emphasizes choosing a chart for the question and preserving a sensible reading path. [Tableau Visual Best Practices](https://help.tableau.com/current/blueprint/en-us/bp_visual_best_practices.htm)

### Do not make dashboards rainbow grids

Use neutral cards, strong typography, meaningful grouping, and a few deliberate highlights. If all KPIs use saturated fills, no KPI is prioritized. If each series uses a different bright hue, comparison becomes work.

- **Do:** Let layout and scale establish the reading path; use color to clarify the important exception or comparison.
- **Avoid:** Saturated card backgrounds, unrelated colors repeated across panels, unlabeled filters, or hover-only values.
- **Review question:** Can a viewer find the important change before decoding the palette?

### Preserve truth and context

Color must not conceal missing, stale, partial, filtered, or permission-limited data. Titles, units, time windows, source notes, and active filters belong close to the visual story.

- **Do:** Pair semantic color with scope, labels, values, and a data state.
- **Avoid:** Mixing time windows or populations, letting filters silently change the story, or using green as an automatic synonym for “good.”
- **Review question:** Could a reasonable viewer misread the data because of the color treatment or missing context?

## 10. Draft Fidexa starter palette

**Provisional:** This is a documented starting point from the current production CSS and approved Folded F logo direction. It is not a final replacement for the Penpot design-system tokens or a new brand approval.

### Draft primitives

| Primitive | Value | Current evidence | Draft role |
| --- | --- | --- | --- |
| Ink | `#101828` | Production CSS and logo system | Dark canvas, primary text, high-emphasis action |
| Paper | `#FCF9F0` | Production CSS | Warm light surface and inverse content |
| Cloud | `#F7F2E8` | Production CSS and design-system context | Page/background neutral |
| Violet | `#7C5CFC` | Production CSS and Folded F logo | Brand accent, selected emphasis, expressive moment |
| Mint | `#37D6C0` | Production CSS and Folded F logo | Secondary expressive accent, positive emphasis, proof surface |
| Muted ink | `#667085` | Production CSS | Secondary content; context-dependent and requires review |
| Dark muted | `#AAB4C5` | Production CSS | Secondary content on dark surfaces |
| Sand | `#ECE2C7` | Production CSS | Warm secondary surface |
| Ring violet | `#6F55E8` | Production CSS | Focus ring and darker violet partner |

### Measured starter-pair notes

These ratios are calculated from the current sRGB hex values using the WCAG contrast formula. They are directional evidence for the palette, not approval of every rendered use.

| Pair | Approx. ratio | Draft interpretation |
| --- | ---: | --- |
| Ink on Paper | `16.86:1` | Strong primary reading and inverse action pair |
| Ink on Cloud | `15.91:1` | Strong primary reading pair |
| Muted ink on Paper | `4.73:1` | Passes normal-text AA in this pairing; still test size/weight/context |
| Muted ink on Cloud | `4.46:1` | Slightly below `4.5:1`; do not treat as approved normal body text without adjustment |
| Ring violet on Paper | `4.82:1` | Promising dark accent/focus partner; test as a ring against each surface |
| Ring violet on Cloud | `4.55:1` | Promising but close to threshold; verify rendered focus thickness and adjacent surfaces |
| Violet on Paper | `4.16:1` | Not approved for normal text; use for large text, graphics, or test a darker partner |
| Violet on Cloud | `3.93:1` | Not approved for normal text; treat as accent/background only until paired |
| Mint on Ink | `9.75:1` | Strong expressive accent on dark canvas |
| Ink on Mint | `9.75:1` | Strong foreground partner |
| Deep teal `#0C3F3D` on Mint | `6.43:1` | Strong candidate for mint surface content |

### Draft token mapping

| Semantic token | Draft value | Confidence | Notes |
| --- | --- | --- | --- |
| `background.canvas.light` | Cloud | High | Existing production role; test surface hierarchy with Paper |
| `background.surface.light` | Paper | High | Existing production role; use for readable content zones |
| `background.canvas.dark` | Ink | High | Existing production role; needs dark surface ramp for layered UI |
| `text.primary.on-light` | Ink | High | Strong measured pairs |
| `text.secondary.on-light` | Muted ink | Medium | Passes Paper but misses the rounded threshold on Cloud |
| `text.primary.on-dark` | Paper | High | Strong inverse pair |
| `action.primary` | Ink | High | Existing high-emphasis action; pair with Paper |
| `accent.brand` | Violet | Medium | Strong identity; not safe as normal-size text on current light surfaces |
| `accent.secondary` | Mint | Medium | Strong on Ink; use deep teal or Ink as foreground |
| `focus.ring` | Ring violet | Medium | Current value is promising; test all adjacent surfaces and focus thickness |
| `background.secondary` | Sand | Medium | Warm expressive surface; ensure text is chosen by role, not by proximity |
| `status.success/warning/danger/information` | Not yet assigned | Low | Requires explicit semantic colors and accessible pairs |
| `data.*` | Not yet assigned | Low | Requires a dashboard-specific, color-vision-tested palette |

### Palette decision rules

- Preserve Ink, Paper, Cloud, Violet, Mint, and Sand as recognizable Fidexa primitives unless a separate brand decision changes them.
- Add tonal partners before adding more hues.
- Add semantic status colors as separate roles; never repurpose Violet or Mint for danger or warning.
- Add dark-theme values for every semantic role before approving dark-mode screens.
- Do not expose the provisional table as a production token API until the pairs are reviewed in the actual components, themes, and supported displays.

## 11. Mistakes to always avoid

### Palette mistakes

- Choosing colors by isolated swatch appeal instead of role and context.
- Adding a new hue when a missing tonal step would solve the problem.
- Making every surface, card, button, or metric colorful.
- Using the brand accent as the only signal of hierarchy.
- Giving one color multiple semantic meanings.
- Using arbitrary raw hex values inside components.
- Approving light-mode colors without dark-mode and increased-contrast partners.

### Accessibility mistakes

- Using low-contrast muted text because it looks “premium” or quiet.
- Using red and green as the only difference between states or chart series.
- Assuming a gradient has one contrast ratio.
- Hiding focus in a subtle color shift.
- Treating disabled controls as the only state that does not need explanation.
- Relying on hover, color, or translucency to reveal critical information.

### Modern-UI mistakes

- Confusing visual novelty with design quality.
- Using gradients, glass, glow, blur, or P3 saturation everywhere.
- Creating a dark interface by inverting the light palette.
- Stacking shadows, borders, fills, blur, and overlays until surfaces become muddy.
- Letting decorative backgrounds reduce the contrast of controls or content.
- Copying a fashionable visual treatment without adapting it to the product’s purpose.

### Dashboard mistakes

- Making every KPI a different bright color.
- Using red for emphasis when there is no danger.
- Omitting units, time windows, active filters, freshness, or data-source context.
- Using a categorical palette to imply a numeric ranking.
- Making the important value available only on hover.
- Compressing a colorful desktop dashboard into tiny mobile tiles.

## 12. Color review checklist

### Principles

- [ ] The view has a clear visual hierarchy before color is added.
- [ ] Most of the surface area remains a calm, readable field.
- [ ] Each non-neutral color has a named purpose.
- [ ] Accent moments are limited and tied to action, identity, insight, or real status.
- [ ] Color works with typography, shape, spacing, position, imagery, or motion.

### Tokens and themes

- [ ] Components use semantic tokens, not raw primitive values.
- [ ] Every colored surface has a tested `on-*` foreground partner.
- [ ] Default, hover, pressed, selected, focus-visible, disabled, loading, success, warning, and error states are defined where relevant.
- [ ] Light, dark, and increased-contrast mappings exist for the roles in scope.
- [ ] Surface hierarchy reads without excessive borders or shadows.

### Accessibility

- [ ] Normal text reaches `4.5:1` and large text reaches `3:1` where applicable.
- [ ] Meaningful controls and graphical objects reach `3:1` against adjacent colors.
- [ ] No essential information relies on color alone.
- [ ] Focus remains visible on every surface and state.
- [ ] Gradients, images, translucency, and thin lines were tested at their least-contrasting areas.
- [ ] Grayscale/color-vision review preserves meaning.

### Dashboards

- [ ] Audience, decision, scope, freshness, and next action are explicit.
- [ ] Palette family matches the analytical question.
- [ ] Neutral surfaces dominate; highlights and alerts are sparse.
- [ ] Titles, units, legends, labels, filters, and data states provide context.
- [ ] Important values are not hover-only and have accessible alternatives.

### Evidence record

Record the palette version, semantic token map, exact foreground/background pairs, contrast results, tested themes, viewport/device, browser, input mode, and a link to the rendered captures. If a provisional value is used, record the owner and the evidence needed to graduate it to an approved token.

## 13. Source map

All sources below were checked on **2026-09-04**. The handbook uses them as evidence and inspiration; Fidexa-specific rules are labeled as synthesis or provisional guidance.

| Source | Used for | Link |
| --- | --- | --- |
| Apple Human Interface Guidelines — Color | Communication, brand personality, consistency, inclusive alternatives, dynamic/system colors, light/dark/increased contrast, lighting, translucency, P3, restrained emphasis | [Apple Color](https://developer.apple.com/design/human-interface-guidelines/color) |
| Material 3 in Compose | Key colors, tonal palettes, primary/secondary/tertiary roles, dynamic color, `on-*` pairings, emphasis, themes, tonal elevation | [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) |
| Atlassian Design — Color | Neutral versus saturated color, semantic roles, emphasis levels, states, tokens, themes, inverse colors | [Atlassian Color](https://atlassian.design/foundations/color) |
| IBM Carbon — Color | Neutral-dominant surfaces, layer model, themes, role-based tokens, light/dark behavior | [IBM Carbon Color](https://carbondesignsystem.com/elements/color/overview/) |
| Vercel Geist — Colors | Background/component/border/text roles, default/hover/active states, high-contrast colors, P3 scales | [Geist Colors](https://vercel.com/geist/colors) |
| Vercel Geist — Materials | Layered surfaces, lowest effective elevation, shadow restraint, focus pairing | [Geist Materials](https://vercel.com/geist/materials) |
| Radix Colors | Purpose-built scales, accessible text, alpha variants, automatic dark mode, APCA, P3 | [Radix Colors](https://www.radix-ui.com/colors) |
| shadcn/ui — Theming | Semantic CSS variables, foreground/background pairs, component roles, chart tokens, dark-mode overrides | [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) |
| W3C WAI — Contrast Minimum | `4.5:1` normal text and `3:1` large text thresholds | [WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) |
| W3C WAI — Non-text Contrast | `3:1` UI-component and meaningful-graphic contrast, focus and gradient considerations | [WCAG Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) |
| W3C WAI — Use of Color | Non-color alternatives for meaning, status, actions, and distinctions | [WCAG Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) |
| Linear Method and product surface | Purpose-built design, clarity, speed, craft, noise reduction, and modern product reference | [Linear Method](https://linear.app/method/introduction), [Linear product](https://linear.app/) |
| Tableau Blueprint — Visual Best Practices | Neutral-first dashboard palettes, semantic palette families, consistency, context, reading path, interaction, accessibility | [Tableau Visual Best Practices](https://help.tableau.com/current/blueprint/en-us/bp_visual_best_practices.htm) |

This handbook is intentionally opinionated: use color to make a product clearer and more itself, not merely more colorful.
