# Fidexa Imagery and Icons Principles

**Imagery and iconography handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

## How to use this handbook

Images and icons are not filler around the interface. They orient, explain, prove, identify, evoke, and help people act. They also add cognitive, technical, cultural, and accessibility costs. Use them because they make a message or decision clearer, not because an empty area feels uncomfortable.

Use this with the [Fidexa Layout and Grid Principles](./ui-layout-grid-principles.md), [Fidexa Visual Hierarchy Principles](./ui-visual-hierarchy-principles.md), [Fidexa Shape Language Principles](./ui-shape-language-principles.md), [Fidexa Color Principles](./ui-color-principles.md), and the [UI/UX Review Checklist](./ui-ux-design-review-checklist.md).

## 1. Imagery doctrine

### Use real media as evidence

Product captures, project images, diagrams, and illustrations should prove or explain something. Fidexa’s portfolio must not imply a capability a capture does not show.

- **Do:** Use real product media for product proof and meaningful alt text for its purpose.
- **Do:** Record provenance, crop intent, dimensions, and the context in which the image is truthful.
- **Avoid:** Invented dashboard widgets, generic stock imagery presented as product evidence, or crops that imply an unauthenticated capability.
- **Review question:** What does this image help the person understand or trust?

### Use imagery to carry emotion and orientation

Brand imagery can set tone and help people remember the product, but it should not compete with the primary task.

- **Do:** Choose a consistent subject, lighting, crop, and editorial voice.
- **Do:** Let imagery frame a message or create an intentional pause.
- **Avoid:** Adding unrelated illustrations to every section or using visual novelty as a substitute for explanation.

### Design the crop, not just the asset

An image is part of a responsive composition. Its focal point, aspect ratio, object position, loading state, and fallback need to be designed.

- **Do:** Use a stable aspect-ratio frame, deliberate object-fit behavior, explicit dimensions, and tested mobile crops.
- **Do:** Keep the subject and meaningful text inside safe crop areas.
- **Avoid:** Letting a browser choose a crop that removes the evidence or creates accidental visual meaning.

## 2. Icon doctrine

### Icons support words and conventions

An icon can accelerate recognition when it is familiar and paired with context. It should not force a person to decode a private symbol language.

- **Do:** Pair unfamiliar, high-stakes, or icon-only actions with a visible label and accessible name.
- **Do:** Use established platform or product conventions when users already know them.
- **Avoid:** Replacing every word with an icon or assuming a symbol means the same thing across cultures and products.

### Build one icon language

Icon family, stroke/fill style, corner treatment, optical size, baseline, and alignment should feel related.

- **Do:** Define grid, size, stroke, cap, join, corner, fill, and optical-correction rules.
- **Do:** Match icon weight and visual density to adjacent typography.
- **Avoid:** Mixing unrelated icon packs, stroke weights, viewboxes, or rendering styles in one product.

### Icons have states

Default, hover, focus, pressed, selected, disabled, loading, and error states need recognizable changes without becoming decorative noise.

- **Do:** Use color, fill, stroke, background, shape, motion, or label as coordinated signals.
- **Do:** Keep the icon recognizable when it changes state.
- **Avoid:** Making a one-pixel tint change the only indication of selection or focus.

## 3. UI components

### Icon-only controls

- Give the control an accessible name.
- Provide a tooltip or visible label when the action is not obvious, but never make the tooltip the only route to essential information.
- Use a stable hit area larger than the visible artwork.
- Keep icons aligned optically with adjacent text and controls.

### Images in cards and media frames

- Define the image’s role: evidence, thumbnail, navigation, decoration, or background.
- Use meaningful alt text for informative images and empty alt text for purely decorative images.
- Preserve subject position and crop across desktop and mobile.
- Avoid putting interactive text only inside an image when real text can be used.

### Empty states and errors

- Use an illustration only when it clarifies the situation or makes recovery more inviting.
- Let the message, cause, and next action remain primary.
- Avoid a cheerful illustration that contradicts a serious error, permission problem, or data loss.

## 4. Dashboards and data

- Use icons to label status, direction, filter, drill-down, or action when their meaning is clear.
- Do not use decorative icons to make every KPI card look different.
- Prefer real chart marks and accessible summaries to decorative chart-like illustrations.
- Use thumbnails or product media when they help identify an object; do not let them crowd the metric and scope.
- Keep chart legends, labels, and interactions understandable without icon decoding alone.

## 5. Desktop, mobile, and prototypes

### Desktop

- Use larger media fields for evidence, comparison, and narrative proof.
- Keep icon toolbars discoverable with labels, menus, keyboard access, and focus.
- Do not hide essential labels because desktop has a wide toolbar.

### Mobile

- Respect touch targets, safe areas, thumb reach, loading, and network cost.
- Avoid hover-only image actions or icon meaning.
- Keep important subject matter inside the mobile crop and provide a way to view detail when needed.
- Use bottom sheets, galleries, or progressive disclosure for secondary media rather than shrinking everything.

### Prototypes

- Prototype only the imagery and icon behavior that tests the learning question.
- Use realistic assets, loading/failure states, and content provenance if the prototype is testing trust.
- Avoid spending time on icon micro-polish before the action, label, and recovery are clear.

## 6. Accessibility and performance

- **Requirement:** Informative images have an accurate text alternative; decorative images are not announced as content.
- **Requirement:** Essential text is real text where the technology can render it; do not bake important copy into an image.
- **Requirement:** Icons and controls have accessible names, roles, states, and values.
- Never use image, icon, or color alone to communicate essential meaning.
- Ensure sufficient contrast for icons, focus indicators, and meaningful graphical objects.
- Provide reduced-motion behavior for animated media and icons.
- Specify width and height or an aspect-ratio frame to reduce layout shift; optimize formats, sizes, and loading priority.
- Test broken media, slow networks, no-image fallbacks, zoom, text enlargement, RTL, and high-contrast settings.

## 7. Mistakes to always avoid

- Using generic stock images where product proof is required.
- Showing an invented dashboard or UI as if it were a real product capture.
- Cropping away the subject, evidence, label, or focus of an image.
- Mixing icon packs or stroke weights without a reason.
- Using an icon-only action without a label or accessible name.
- Making hover, color, or a tooltip the only way to understand an icon.
- Treating decorative illustrations as more important than the message or recovery action.
- Baking essential words into images.
- Loading huge media for small thumbnails or causing layout shifts.
- Ignoring cultural interpretation, localization, RTL, reduced motion, or broken media.

## 8. Imagery and icon review checklist

- [ ] Every image or icon has a named role: evidence, orientation, emotion, action, status, or decoration.
- [ ] Product imagery is real, truthful, sourced, and cropped without implying unsupported capability.
- [ ] Focal point, aspect ratio, object position, dimensions, loading, failure, and mobile crop are defined.
- [ ] Informative images have useful alt text; decorative images are hidden from assistive technology.
- [ ] The icon family shares grid, weight, optical size, rendering, and alignment rules.
- [ ] Icon-only controls have accessible names and adequate hit areas.
- [ ] State changes remain recognizable without color, hover, or tooltip alone.
- [ ] Dashboards use imagery and icons to clarify objects/status, not decorate every metric.
- [ ] Desktop and mobile network, touch, crop, gallery, and disclosure behavior are tested.
- [ ] Performance, reduced motion, RTL, localization, zoom, high contrast, and broken assets are covered.

## 9. Source map

Sources checked on **2026-09-04**:

| Source | Used for | Link |
| --- | --- | --- |
| Apple Human Interface Guidelines — Images | Meaningful imagery, platform-aware media, scaling, cropping, and visual context | [Apple Images](https://developer.apple.com/design/human-interface-guidelines/images) |
| Apple Human Interface Guidelines — Icons | Consistent icon usage, platform conventions, clarity, and symbol behavior | [Apple Icons](https://developer.apple.com/design/human-interface-guidelines/icons) |
| Apple SF Symbols | System-aligned symbols, weights, sizes, and integration with text | [SF Symbols](https://developer.apple.com/sf-symbols/) |
| Material Icons | Familiar icon language, consistent grid, and product/system icon use | [Material Icons](https://m3.material.io/styles/icons/overview) |
| Atlassian Design — Iconography | Icon principles, consistency, sizing, and accessibility | [Atlassian Iconography](https://atlassian.design/foundations/iconography/) |
| IBM Carbon — Icons | Icon system, product roles, and consistent use in enterprise interfaces | [Carbon Icons](https://carbondesignsystem.com/elements/icons/overview/) |
| W3C WAI — Non-text Content | Text alternatives for informative, functional, and decorative non-text content | [WCAG Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) |
| W3C WAI — Images of Text | Preference for real text that can scale and adapt | [WCAG Images of Text](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html) |

Fidexa rule: use images to prove or orient, and icons to clarify or accelerate—never to make an empty space feel decorated.
