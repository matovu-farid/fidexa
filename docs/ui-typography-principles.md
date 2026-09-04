# Fidexa Typography Principles

**Typography handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

**Status:** The principles are normative. The starter contract in Section 11 is a provisional design-system direction, not a final font or brand approval.

## How to use this handbook

Typography is not the last layer of polish. It is the interface’s voice, hierarchy, pace, density, and accessibility infrastructure. Type tells people what matters, what belongs together, what they can act on, what changed, and what they can safely ignore.

Use this document with the [Fidexa UI/UX Design Principles](./ui-ux-design-principles.md), the [Fidexa Color Principles for Modern UI](./ui-color-principles.md), and the [Fidexa UI/UX Design Review Checklist](./ui-ux-design-review-checklist.md). The UI/UX handbook covers the wider product and experience decisions; this document is the typography-specific authority.

### Status markers

- **Principle** — default guidance for Fidexa work.
- **Requirement** — an accessibility, platform, or product gate. Treat failure as a defect until there is a documented exception.
- **Recipe** — a repeatable application pattern, not a universal law.
- **Provisional** — a useful starting value or mapping that needs product and visual review before becoming a final token contract.
- **Craft heuristic** — a strong typographic convention that should be tested against the content and context rather than treated as a compliance threshold.
- **Inference** — a Fidexa synthesis from the cited sources and current product context, not a direct quotation or universal rule.

When guidance conflicts, preserve legibility, comprehension, user control, truthful status, and platform behavior first; then system consistency; then brand expression and taste.

## 1. The Fidexa typography doctrine

### Legibility is the first form of beauty

Great type makes reading feel effortless. It respects visual acuity, viewing distance, lighting, device, language, content length, and the user’s chosen text settings before it tries to look distinctive.

- **Do:** Start with readable type at realistic size, weight, contrast, measure, and line-height.
- **Do:** Test the smallest meaningful text, the longest likely copy, and the least favorable surface.
- **Avoid:** Calling thin, tiny, compressed, low-contrast text “premium” when it makes the task harder.
- **Review question:** Can a person understand this content comfortably without zooming, squinting, or decoding the styling?

### Hierarchy is a promise

Type hierarchy tells people where to begin, what is related, what is secondary, and what deserves action. A heading that looks like a label or a warning that looks like metadata is not merely unattractive; it is misleading.

- **Do:** Use a small set of named roles with deliberate differences in size, weight, line-height, color, spacing, and position.
- **Do:** Keep the same role visually consistent across screens and states.
- **Avoid:** Making every element bold, large, colored, uppercase, or tightly spaced.
- **Review question:** Can a new user predict the reading order from typography alone?

### A type system beats a font collection

The goal is not to collect typefaces. The goal is to create a coherent system that covers display, headings, body, labels, data, code, and accessibility states without improvisation.

- **Do:** Define families, weights, sizes, line-heights, tracking, paragraph spacing, casing, and fallbacks as tokens.
- **Do:** Keep exceptions visible and intentional.
- **Avoid:** Solving every new component with a one-off font size or a new family.
- **Review question:** Could another designer or engineer reproduce this text style from its role rather than from a screenshot?

### Personality comes from decisions, not noise

An expressive type system can be memorable without making every sentence perform. Use a distinctive display voice, an unusual but readable scale, deliberate contrast, or confident spacing where it helps identity. Keep operational text quiet and fast to scan.

- **Do:** Concentrate personality in moments that introduce, orient, or frame the product.
- **Do:** Let body text, labels, controls, and data prioritize clarity.
- **Avoid:** Decorative type treatments in places where people must compare, enter, verify, or recover information.
- **Review question:** Does the typographic voice make the product more itself while leaving the task easier?

### Content is part of the type decision

Typography cannot be approved with placeholder copy. The words determine wrapping, density, rhythm, emphasis, localization risk, and whether the design still works when the user has something real to say.

- **Do:** Use realistic names, numbers, dates, long headings, error messages, empty states, and translated-length samples.
- **Avoid:** Designing only with short lorem ipsum, one-line labels, or idealized marketing copy.
- **Review question:** What is the longest useful version of this content, and what does the layout do with it?

## 2. Choose typefaces by job

### Start with roles, not a mood board

Choose a typeface because it performs a job: continuous reading, compact UI, editorial expression, code, numerical comparison, or brand display. A typeface may do more than one job, but each use should be named.

| Role | Default job | What to evaluate |
| --- | --- | --- |
| UI family | Navigation, controls, forms, dense product surfaces | Legibility at small sizes, clear glyphs, weight range, screen rendering, language support |
| Display or editorial family | Hero statements, campaign moments, case-study openings | Distinctive voice, large-size rhythm, restraint, pairing with the UI family |
| Mono family | Code, identifiers, technical values, tabular strings | Character disambiguation, numeric width, punctuation, scanning, copy/paste behavior |
| Numeric treatment | KPIs, prices, dates, chart labels | Tabular or proportional figures, alignment, decimal handling, locale conventions |
| System fallback | Resilience when a webfont is unavailable or a platform preference applies | Similar metrics, language coverage, loading behavior, layout stability |

- **Do:** Evaluate lowercase forms, numerals, punctuation, `I/l/1`, `O/0`, x-height, counters, terminals, and bold/italic behavior.
- **Do:** Test the font at the actual sizes used in buttons, labels, table rows, mobile body text, and dashboard metrics.
- **Do:** Check licensing, web performance, variable-font support, subset strategy, and language coverage before adoption.
- **Avoid:** Choosing a font from a large headline specimen and discovering later that its small labels, numerals, or fallback are unusable.
- **Avoid:** Using a display face for long product instructions merely because it looks distinctive.

### Prefer fewer families and more deliberate contrast

Apple advises minimizing the number of typefaces because too many can obscure hierarchy and make an interface internally inconsistent. One well-chosen family with several useful weights usually creates a stronger product system than a pile of unrelated fonts. A second family is justified when it has a clear editorial or technical role.

- **Do:** Default to one UI family; add a display or mono family only when its job is explicit.
- **Do:** Use weight, size, spacing, color, and whitespace to create hierarchy before adding another family.
- **Avoid:** Using a different font for every section, card, brand moment, or platform.
- **Review question:** What problem does this additional family solve that weight, size, or spacing cannot?

### System fonts and custom fonts

System fonts are often the strongest choice for native platform UI because they are tuned for the platform, language, rendering environment, and user accessibility settings. Custom fonts can carry brand character, but the product inherits responsibility for their legibility, loading, fallback, scaling, and language behavior.

- **Do:** Use platform text styles where platform integration and user scaling are central.
- **Do:** If using a custom family, implement the same scaling and accessibility behaviors the platform provides.
- **Do:** Provide a metrically compatible fallback and test the transition before the font loads.
- **Avoid:** Embedding a system font as a static asset when the platform already provides it dynamically.
- **Avoid:** Letting a fallback change line breaks, button width, or content order in a way that causes layout shift.

## 3. Build a named type scale

### Tokens describe intent

A typography token should answer both “how does this look?” and “why does it exist?” Define a style as a coordinated set of font family, size, weight, line-height, letter-spacing, and casing. Do not expose only `font-size` and leave the rest to local guesswork.

Recommended role families:

| Role family | Examples | Use |
| --- | --- | --- |
| Display | `display.xl`, `display.l`, `display.m` | Hero statements, editorial openings, major product moments |
| Heading | `heading.1`, `heading.2`, `heading.3`, `heading.4` | Page, section, card, and dialog hierarchy |
| Title | `title.l`, `title.m`, `title.s` | Object names, list headings, navigation groups |
| Body | `body.l`, `body.m`, `body.s` | Instructions, descriptions, messages, long-form reading |
| Label | `label.l`, `label.m`, `label.s` | Buttons, fields, tabs, chips, compact metadata |
| Caption | `caption`, `overline` | Supporting context; use sparingly and never for essential content |
| Metric | `metric.l`, `metric.m`, `metric.s` | Decision-relevant numbers with units and time context |
| Code | `code`, `code.inline` | Source, identifiers, technical values, logs |

Use role names in design files and code. HTML heading levels and accessibility semantics still need to follow document structure; a visual token does not give an element permission to change its semantic level.

### Use a small, complete scale

Material 3 groups its type scale into display, headline, title, body, and label families, each with size variants. That is a useful model: a small number of roles gives designers expressive range without creating a style for every possible number.

- **Do:** Define the smallest scale that covers the product’s real surfaces.
- **Do:** Give each role a clear use case, range, and content expectation.
- **Do:** Remove unused styles rather than keeping a giant scale “just in case.”
- **Avoid:** Choosing arbitrary pixel sizes per component.
- **Avoid:** Using the display scale for normal UI or the caption scale for content people must read.

### Starter scale for Fidexa work — provisional

This is a starting contract for web and prototype work. It should be tuned after inspecting the actual chosen family and rendered content. Values are expressed in `rem` so browser and user preferences can influence the result; the visual result, not the number alone, is the authority.

| Token | Size | Line-height | Weight direction | Default use |
| --- | ---: | ---: | --- | --- |
| `display.xl` | `clamp(3rem, 7vw, 6.5rem)` | `1.00–1.06` | Regular to semibold | Hero or campaign statement |
| `display.l` | `clamp(2.5rem, 5vw, 5rem)` | `1.02–1.08` | Regular to semibold | Major editorial heading |
| `heading.1` | `clamp(2.25rem, 4vw, 4rem)` | `1.05–1.12` | Medium to bold | Page heading |
| `heading.2` | `clamp(1.75rem, 3vw, 2.75rem)` | `1.10–1.18` | Medium to bold | Section heading |
| `heading.3` | `1.5rem–2rem` | `1.15–1.25` | Medium to semibold | Subsection or card heading |
| `heading.4` | `1.125rem–1.375rem` | `1.20–1.30` | Medium to semibold | Compact heading |
| `body.l` | `1.125rem` | `1.45–1.65` | Regular | Long-form or prominent supporting copy |
| `body.m` | `1rem` | `1.45–1.60` | Regular | Default product copy |
| `body.s` | `0.875rem` | `1.40–1.55` | Regular | Secondary copy; not for essential instructions |
| `label.l` | `1rem` | `1.20–1.35` | Medium to semibold | Primary controls and field labels |
| `label.m` | `0.875rem` | `1.20–1.40` | Medium to semibold | Compact controls and metadata |
| `caption` | `0.75rem–0.8125rem` | `1.25–1.45` | Regular to medium | Supporting context only |
| `metric.l` | `2rem–3rem` | `1.00–1.15` | Medium to bold | Primary dashboard value |
| `code` | `0.875rem–1rem` | `1.40–1.60` | Regular | Code and technical strings |

These ranges are a design recipe, not a promise that every font renders identically. Inspect the chosen family, actual browser output, and largest supported text setting before freezing values.

## 4. Set hierarchy with restraint

### Use multiple signals, but not all at once

Hierarchy is strongest when two or three signals agree. A page title might be larger, heavier, and separated by space. A secondary label might be smaller and quieter. A selected tab might use weight and color rather than size.

- **Do:** Assign each signal a job: size for level, weight for emphasis, color for importance/status, spacing for grouping, position for sequence.
- **Do:** Preserve hierarchy when text grows, wraps, or moves into a responsive layout.
- **Avoid:** Combining huge size, bold weight, all caps, saturated color, underline, and animation for one ordinary label.
- **Review question:** Which signal is doing the work, and what happens when that signal is unavailable or overridden?

### Weight is emphasis, not volume

Heavy type attracts attention and can make a dense screen feel louder than it is. Apple specifically warns against light weights, especially at small sizes, while Material shows weight as one of several emphasis tools. Use enough weight for clarity and focus, but reserve the strongest weights for genuinely important content.

- **Do:** Prefer regular, medium, semibold, or bold weights for small UI text when the family supports them cleanly.
- **Do:** Use bold or semibold to mark a decision, current item, action, or key value.
- **Avoid:** Ultralight or thin text for essential content, especially on variable surfaces or low-contrast backgrounds.
- **Avoid:** Making every label semibold until nothing appears important.

### Case and tracking

Sentence case is the default for headings, buttons, navigation, and messages because it preserves natural word shapes and supports faster reading. All caps can work for short labels, categories, or an intentionally editorial voice, but it reduces word-shape cues and often needs more tracking.

- **Do:** Use sentence case for most UI copy.
- **Do:** If using all caps, keep the phrase short, increase tracking carefully, and verify readability at small sizes.
- **Do:** Use optical judgment for display tracking; large type often needs tighter tracking, while small uppercase labels often need more.
- **Avoid:** Letter-spacing body paragraphs or using tracking as a substitute for a correct font choice.
- **Avoid:** Forced uppercase through CSS when accessible names or copy meaning may be affected.

### Semantic headings and reading order

Visual hierarchy must agree with the content structure. A screen-reader user, keyboard user, and visual reader should encounter the same conceptual order even if the layout changes.

- **Do:** Use one clear page heading, ordered subsections, descriptive labels, and meaningful landmark structure.
- **Do:** Keep DOM or document order aligned with the intended reading sequence.
- **Avoid:** Using heading levels only because a size looks right.
- **Avoid:** Reordering text visually in a way that makes the programmatic sequence misleading.

## 5. Control measure, rhythm, and density

### Give reading a comfortable measure

Line length is a craft heuristic, not a fixed law. Very long lines make it harder to return to the next line; very short lines create excessive breaks and a choppy rhythm. For continuous Latin-script reading, begin around 45–75 characters per line and tune from the actual typeface, language, viewport, and content.

- **Do:** Constrain long-form body copy with a readable maximum width.
- **Do:** Allow data tables, code, comparison views, and wide operational layouts to use a different measure when the task requires it.
- **Avoid:** Stretching prose across the full desktop viewport because there is empty space.
- **Avoid:** Applying the same narrow measure to a dashboard table or side-by-side comparison that needs horizontal context.

### Line-height is part of the typeface

Line-height controls pace, grouping, and the ability to find the next line. Body text generally needs more leading than display text; labels and compact rows need enough room for their glyphs and states without creating accidental gaps.

- **Do:** Set line-height together with font size and weight, not as a global afterthought.
- **Do:** Use more generous leading for long passages and wide columns; use tighter leading only for short, controlled labels or constrained rows.
- **Do:** Keep three or more lines from becoming cramped merely to save vertical space.
- **Avoid:** A single line-height value for display, body, labels, metrics, and code.
- **Avoid:** Fixed-height text boxes that clip descenders, wrap, or accessibility enlargement.

### Spacing creates grouping

Space before and after text tells people whether items belong together. Paragraph spacing should be larger than line spacing inside a paragraph; a heading should sit closer to its content than to the previous section.

- **Do:** Use a spacing scale and define text-style paragraph behavior.
- **Do:** Keep labels close to their fields, headings close to their content, and unrelated groups clearly separated.
- **Avoid:** Adding equal margins everywhere or using line breaks as a layout system.
- **Avoid:** Letting automatic component padding create large gaps that imply a false relationship.

### Wrapping is a designed state

A line break is not a failure. A bad, unexpected, or destructive line break is. Let text grow, wrap, and reflow; design the container around it.

- **Do:** Set a sensible maximum width, use height-growing text containers, and test one-line, two-line, and long-copy states.
- **Do:** Allow buttons, tabs, table cells, and cards to respond intentionally when labels wrap.
- **Avoid:** Hard-coded `<br>` breaks except for a deliberate editorial lockup with a tested fallback.
- **Avoid:** Fixed-height headings, clipped labels, ellipses on essential content, and buttons that silently truncate their action.

## 6. Typography in UI components

### Navigation and tabs

Navigation type should answer “where am I?” and “what can I reach?” quickly. Labels should be familiar, short, and consistent in grammatical form.

- **Do:** Use stable labels, visible current state, and enough width for localization and user-created names.
- **Do:** Differentiate current, available, disabled, and overflow states beyond a tiny color change.
- **Avoid:** Turning navigation into a display specimen or hiding essential destinations in icon-only controls.

### Buttons and actions

Button text is a commitment. It should name the action and fit the action’s importance.

- **Do:** Use verbs, sentence case, and a predictable hierarchy between primary and secondary actions.
- **Do:** Keep action labels stable through loading, success, and error states; change them only when the action actually changes.
- **Avoid:** Vague labels such as “Continue” when the consequence is unknown, or “Submit” when a more specific verb is available.
- **Avoid:** Using type size, color, or weight alone to distinguish destructive actions; pair the label with clear confirmation and recovery.

### Forms and validation

Text is part of the form’s interaction model: labels, hints, input values, errors, required status, and success feedback must remain associated.

- **Do:** Keep a persistent visible label; use placeholder text only as an example or format hint.
- **Do:** Put errors near the relevant field, explain what is wrong, and state how to recover.
- **Do:** Preserve entered values and let text expand when validation or accessibility settings require it.
- **Avoid:** Encoding required status, error, or success only with color or font weight.
- **Avoid:** Shrinking field labels or helper text until they are technically present but practically unreadable.

### Labels, metadata, and captions

Secondary text is still part of the product’s meaning. Muted does not mean disposable.

- **Do:** Use a clear hierarchy and sufficient contrast for metadata people need to interpret a value or make a decision.
- **Do:** Put units, dates, ownership, freshness, and scope next to the value they qualify.
- **Avoid:** Making all metadata tiny, uppercase, grey, or low contrast by default.
- **Avoid:** Requiring hover or a tooltip to understand a primary value.

### Tables and dense interfaces

Dense UI needs typographic discipline more than decorative styling. Use alignment, whitespace, row height, grouping, and numeric treatment to help comparison.

- **Do:** Align numbers by meaning; use tabular figures where columns are compared; distinguish headers, rows, totals, and selected states.
- **Do:** Keep units and precision consistent within a column and show exceptions explicitly.
- **Do:** Let the table support keyboard navigation, focus, sorting, selection, and responsive transformation.
- **Avoid:** Centering all table content, squeezing columns until words become puzzles, or styling every row as a card.
- **Avoid:** Using monospace for all data when only identifiers or code require it.

### Icons beside text

Icons and type form one line of meaning. Their weight, size, baseline, and spacing need to agree.

- **Do:** Match icon weight and visual density to adjacent text; align to the text’s optical center, not only its bounding box.
- **Do:** Use an accessible name and visible label for unfamiliar or high-stakes icons.
- **Avoid:** Treating a decorative icon as a substitute for a verb, status label, or error explanation.

## 7. Desktop-specific typography

Desktop gives more room for hierarchy, comparison, multi-pane work, and keyboard acceleration. It does not justify stretching text, adding more styles, or making dense content smaller.

- **Do:** Use the extra width for a clearer reading measure, side-by-side context, definitions, and meaningful comparison.
- **Do:** Define type behavior for wide, narrow, snapped, short, and tall windows.
- **Do:** Preserve the focus path and keyboard readability; visible hover is not a replacement for focus.
- **Do:** Test browser zoom, text enlargement, window movement across displays, and fallback font loading.
- **Avoid:** Filling a wide viewport with long lines, tiny dashboard labels, or empty decorative type.
- **Avoid:** Using a different type system in each pane without a shared hierarchy.
- **Avoid:** Letting a fixed-height desktop row become unusable when text grows or a user zooms.

Desktop review question: **When the window is wider, does typography make comparison and orientation easier? When it is narrower, what changes while the task remains intact?**

## 8. Mobile and responsive typography

Mobile is touch-first, interruptible, and often viewed in changing light and grip. The design must preserve the reading path and action clarity while allowing text to become larger, longer, and less predictable.

- **Do:** Keep primary body text comfortably readable and prioritize one clear job per view.
- **Do:** Let headings, buttons, labels, errors, and metadata wrap or stack when necessary.
- **Do:** Preserve safe-area spacing, focused-field visibility, and keyboard-aware layout.
- **Do:** Test portrait, landscape, rotation, interruption, resumed state, and large text settings.
- **Do:** Use a deliberate mobile scale rather than shrinking the desktop scale until everything technically fits.
- **Avoid:** Setting mobile type smaller to preserve a desktop card grid.
- **Avoid:** Making essential controls icon-only because labels no longer fit.
- **Avoid:** Hiding units, dates, status, or recovery text to protect a rigid tile height.

### Adaptive type behavior

Responsive typography may reflow, scale, stack, or change role emphasis, but it must preserve the same meaning and task priority.

- **Do:** Define what stays invariant: page purpose, content priority, label meaning, action semantics, and recovery path.
- **Do:** Move secondary metadata below a title, reduce columns, or turn a table into a prioritized list when that improves reading.
- **Avoid:** Treating every breakpoint as a new visual language.
- **Avoid:** Hard-coding line breaks or truncating content simply because the viewport is narrow.

## 9. Dashboard typography

Dashboard type should help a person make a decision, not make a screenshot look busy. Hierarchy should move from summary to explanation to action.

### Metrics

- **Do:** Pair every metric with its unit, time range, population, aggregation, comparison, target or threshold, and freshness when relevant.
- **Do:** Use a consistent metric style and tabular numerals for values that users compare.
- **Do:** Make the value prominent, then the label and context readable, then the supporting detail available.
- **Avoid:** Making every KPI huge, bold, and brightly colored.
- **Avoid:** Showing a number without telling people what it measures or when it was true.

### Charts and tables

- **Do:** Use typography for chart title, subtitle, axis labels, annotations, units, legend, and source/freshness context.
- **Do:** Keep labels close to the marks they explain and provide a non-hover path to important values.
- **Do:** Reduce columns and stack context on mobile rather than compressing labels below legibility.
- **Avoid:** Tiny legends, rotated labels as a default, unexplained abbreviations, or labels that disappear at narrow widths.
- **Avoid:** Using monospaced or tabular figures where their appearance implies a precision the data does not have.

### Dashboard states

Loading, stale, empty, partial, error, permission, and offline states need typography that explains what is known and what to do next.

- **Do:** Keep the state title, scope, timestamp, and recovery action visually associated.
- **Do:** Use stable text dimensions where possible to reduce layout shift without clipping content.
- **Avoid:** Replacing a useful error with a spinner, blank space, or a generic “Something went wrong.”

Dashboard review question: **Can a person scan the highest-priority decision, understand its scope and freshness, and reach the next action without decoding tiny type?**

## 10. Accessibility and inclusive typography

Accessibility is not a variant of the “real” design. It is evidence that the typographic system works for more people and more contexts.

### Non-negotiable web checks

- **Requirement:** Text contrast is at least `4.5:1` for normal text and `3:1` for large text under WCAG 2.2 AA, unless the applicable exception is documented. Do not round a failing ratio up.
- **Requirement:** Text can be resized to at least `200%` without loss of content or functionality.
- **Requirement:** Content reflows at the WCAG equivalent of `320 CSS px` for vertical scrolling content without requiring two-dimensional scrolling, except where the layout genuinely requires two dimensions.
- **Requirement:** The meaningful reading sequence remains correct when visual layout changes.
- **Requirement:** Do not communicate essential meaning only through font weight, size, color, italics, case, or position.
- **Requirement:** Do not use images of text when real text can do the job.

### Scaling and user preferences

Apple’s Dynamic Type guidance requires more than multiplying every value. Important content should remain prioritized, layout should adapt, icons should remain legible, and truncation should be minimized as text grows. Web designs should carry the same spirit through relative units, reflow, and content-aware adaptation.

- **Do:** Use `rem` or equivalent scalable units for web type tokens and test the actual root-size behavior.
- **Do:** Test at 200% text enlargement and the largest supported text setting on the target platform.
- **Do:** Keep primary content near the top of the reading path and stack crowded inline metadata when text grows.
- **Do:** Provide language-appropriate fonts, glyphs, punctuation, numerals, and directionality.
- **Avoid:** Treating a passing default-size screenshot as proof of accessibility.
- **Avoid:** Making the user choose between readable text and clipped or unusable controls.

### Contrast and rendering

Contrast is affected by font size, weight, anti-aliasing, background, display, and color. A thin font can be harder to perceive than its nominal contrast ratio suggests.

- **Do:** Test thin strokes, small text, muted metadata, text over imagery, gradients, translucency, and dark surfaces at their least favorable points.
- **Do:** Prefer a robust weight when text is small or the environment is uncertain.
- **Avoid:** Using a shadow or glow as the main strategy for readable text.
- **Avoid:** Assuming the same color pair works after a custom font, weight, size, or background changes.

### Internationalization and content resilience

- **Do:** Test expansion, contraction, long names, compound words, plural forms, dates, currencies, RTL layouts, and scripts with different glyph metrics.
- **Do:** Keep punctuation, quotation marks, dashes, apostrophes, and numerals typographically correct for the locale.
- **Avoid:** Hard-coded widths, forced line breaks, concatenated sentence fragments, or English-only abbreviations in shared components.

## 11. Provisional Fidexa typography contract

This is a starting direction for product and site work. It intentionally specifies behavior before locking a particular typeface.

### Family roles

- **UI family:** one highly legible sans-serif with a broad weight range, strong small-size rendering, useful numerals, variable-font support where practical, and coverage for the product’s languages.
- **Display family:** optional and used mainly for Fidexa marketing, hero statements, case-study openings, and other moments where a distinctive voice earns its space. It must pair cleanly with the UI family and remain readable at every approved size.
- **Mono family:** reserved for code, identifiers, logs, technical values, or deliberately tabular content. It is not the default for ordinary UI text.
- **Fallbacks:** every web font has an intentional, metrically compatible fallback stack; loading failure does not break layout or meaning.

### Style rules

- Use the named scale in Section 3 rather than arbitrary local values.
- Use sentence case by default.
- Use regular or medium for body and control text; reserve semibold/bold for hierarchy, selected state, action emphasis, and key metrics.
- Do not use light or thin weights for essential small text.
- Use `rem`-based sizing and height-growing content on the web.
- Keep body measure bounded; let operational tables and code use a task-appropriate exception.
- Use tabular numerals for comparable metrics and proportional numerals for natural prose unless the typeface or data task requires otherwise.
- Keep text, icons, color, spacing, and motion aligned to the same semantic state.
- Treat font loading, text enlargement, translation, empty/error content, and long user-created names as first-class states.

### Expressive without boring

Fidexa typography should feel deliberate and recognizable without becoming a type-effects showcase. The preferred expression is a calm UI family, confident hierarchy, generous but controlled whitespace, and a display voice used at the edges of the experience. Distinction should come from proportion, rhythm, and editorial confidence before it comes from novelty.

## 12. Mistakes to always avoid

### Typeface mistakes

- Choosing a font from a hero specimen without testing small UI text, numbers, punctuation, and fallbacks.
- Using too many families, weights, or styles until hierarchy loses meaning.
- Using a display face for body copy, forms, tables, or error recovery because it looks fashionable.
- Ignoring licensing, loading performance, language coverage, or variable-font behavior.
- Embedding platform fonts as static assets and losing native scaling or rendering behavior.

### Scale and hierarchy mistakes

- Inventing a new font size for every component.
- Making every heading, label, button, or metric equally bold.
- Using all caps for long copy or essential instructions.
- Using color or weight as the only distinction between states.
- Making text hierarchy depend on a single signal that disappears in dark mode, grayscale, zoom, or user settings.
- Using a visually large element with a semantically incorrect heading level.

### Layout mistakes

- Designing with placeholder copy and approving without realistic longest-case content.
- Fixed-height text boxes, clipped descenders, hidden lines, or accidental ellipses on important text.
- Hard-coded line breaks that fail at another width or language.
- Full-width paragraphs on desktop and cramped single-word columns on mobile.
- Treating line-height, paragraph spacing, and container width as afterthoughts.
- Shrinking type to preserve a rigid card grid.

### UI mistakes

- Placeholder text used as the only field label.
- Vague action labels that hide the consequence.
- Tiny, low-contrast metadata that people need to interpret the main value.
- Hover-only definitions, errors, or chart values.
- Icon-only controls without a clear label and accessible name.
- A loading, error, or success state that changes type dimensions enough to jump the layout or hides the recovery action.

### Dashboard mistakes

- Giant numbers with no unit, time range, scope, comparison, or freshness.
- Making every KPI loud through size, weight, color, and a separate card.
- Tiny legends, labels, axes, or footnotes that make the chart technically present but practically unreadable.
- Using a type treatment that implies precision the underlying data does not have.
- Compressing a desktop dashboard into mobile tiles instead of prioritizing and stacking information.

### Accessibility mistakes

- Treating a default-size screenshot as an accessibility test.
- Failing at 200% text enlargement or WCAG reflow.
- Using font weight, italics, case, or color as the only way to communicate meaning.
- Using text over images, gradients, glass, or translucent layers without testing the least-contrast region.
- Forgetting screen readers, keyboard order, RTL, translation, user-created content, or platform text settings.

## 13. Typography review checklist

### Purpose and voice

- [ ] The view’s job and intended reading order are clear.
- [ ] The type voice matches the product context: operational text is clear; expressive type earns its space.
- [ ] Type choices support the brand without competing with the task.

### Typeface and tokens

- [ ] Family roles are named: UI, optional display, mono, numeric, and fallback.
- [ ] Typeface performance was tested at actual body, label, metric, and code sizes.
- [ ] Font family, size, weight, line-height, tracking, casing, and paragraph spacing come from named tokens.
- [ ] No unexplained local font overrides or new one-off sizes remain.
- [ ] Font loading, fallback, licensing, and language coverage are recorded.

### Hierarchy and content

- [ ] Page, section, object, body, label, metadata, action, metric, and code roles are distinguishable.
- [ ] Semantic heading levels and programmatic reading order are correct.
- [ ] Realistic, longest-case, translated-length, empty, error, and success copy has been reviewed.
- [ ] Line length, line-height, paragraph spacing, and wrapping are comfortable at each target.
- [ ] No fixed-height text clips or hides meaningful content.

### Components and data

- [ ] Navigation, buttons, forms, errors, tables, tooltips, and icon/text pairs have intentional type behavior.
- [ ] Action labels are specific and remain truthful through loading and completion.
- [ ] Numeric values use a deliberate proportional or tabular treatment and retain units/context.
- [ ] Dashboard metrics, chart labels, legends, freshness, and data states are readable without hover.

### Desktop and mobile

- [ ] Desktop was reviewed at `1512×982` and at the supported narrow/snap window.
- [ ] Mobile was reviewed at `393×852`, with the `390×844` overflow guard where applicable.
- [ ] iPad portrait `834×1194` and landscape `1194×834` were reviewed when in scope.
- [ ] Text grows and reflows without clipping, overlap, or loss of task completion.
- [ ] Keyboard, focus, touch, orientation, safe areas, and on-screen keyboard states remain usable.

### Accessibility and evidence

- [ ] Normal and large text contrast meets the applicable WCAG thresholds.
- [ ] Text is usable at 200% enlargement and at the target platform’s larger text setting.
- [ ] Reflow works at the applicable narrow equivalent without unnecessary two-dimensional scrolling.
- [ ] Meaning survives without color, weight, size, case, hover, or position alone.
- [ ] RTL, localization, fallback fonts, reduced-motion context, and user-created strings were considered where relevant.
- [ ] Review records include viewport, browser/device, font state, zoom/text setting, content sample, and evidence captures or links.

## 14. Source map

Sources below were checked on **2026-09-04**. They are used as evidence and inspiration; Fidexa-specific rules are labeled as synthesis or provisional guidance.

| Source | Used for | Link |
| --- | --- | --- |
| Apple Human Interface Guidelines — Typography | Legibility, recommended platform sizes, weight choices, typeface count, hierarchy, system fonts, text styles, Dynamic Type, scaling, truncation, platform behavior | [Apple Typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| Material 3 in Compose | Type-scale families, named styles, size/leading pairs, reducing a scale to what a product needs, weight as emphasis, theming | [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) |
| Atlassian Design — Typography | Readability, visual harmony, contextual typography, font and text tokens, rem units, heading/body/metric/code styles, weight restraint | [Atlassian Typography](https://atlassian.design/foundations/typography/) |
| IBM Carbon — Typography | Type tokens and sets, calibrated typography, relationship between layout structure and typographic hierarchy, IBM Plex family | [IBM Carbon Typography](https://carbondesignsystem.com/elements/typography/overview/) |
| Vercel Geist — Typography | Treating typography as reusable combinations of size, line-height, tracking, and weight in a modern product system | [Geist Typography](https://vercel.com/geist/typography) |
| W3C WAI — Contrast Minimum | `4.5:1` normal text and `3:1` large-text contrast thresholds | [WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) |
| W3C WAI — Resize Text | `200%` text enlargement and avoiding loss of content or functionality | [WCAG Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) |
| W3C WAI — Reflow | Reflow at the equivalent of `320 CSS px` without unnecessary two-dimensional scrolling | [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) |
| W3C WAI — Meaningful Sequence | Maintaining meaningful reading order when presentation changes | [WCAG Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) |
| W3C WAI — Images of Text | Preference for real text that can scale, re-render, and adapt to user settings | [WCAG Images of Text](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html) |

This handbook is intentionally opinionated: make type easier to read, easier to scan, harder to misinterpret, and distinctive only where distinction serves the experience.
