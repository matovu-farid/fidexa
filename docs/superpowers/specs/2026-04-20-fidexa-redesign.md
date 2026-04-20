# Fidexa Website Redesign Spec

## Overview

Redesign the Fidexa website from a basic landing page into a polished, Apple/Linear-inspired software studio site. The site positions Fidexa as a dual-purpose company: client solutions (building apps/websites for hire) and an innovation lab (internal products like Rishi). The redesign includes a new logo, upgraded tech stack, project showcase, and refined contact flow with a subtle AI chat option.

## Design Direction

**Aesthetic:** Dark, ultra-polished, Apple/Linear-inspired. Generous whitespace, refined typography (Inter or similar system font stack), subtle motion, monochrome palette with minimal accent usage. Premium, restrained, confident.

**Logo:** Hexagonal prism SVG mark + lowercase "fidexa" wordmark. Works in dark and light contexts. Used as favicon and nav logo.

**Color palette:**
- Background: `#09090b` (near-black)
- Foreground: `#fafafa` (near-white)
- Muted text: `#888` / `#666` / `#555` (grays for hierarchy)
- Borders: `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.1)`
- Card backgrounds: `rgba(255,255,255,0.03)`
- Accent tags: Muted colored badges per category (indigo for innovation, green for SaaS, amber for AI, pink for property, etc.)

**Typography:** Inter font family. Tight letter-spacing on headings (-0.5px to -1px). Section labels use 11px uppercase with 3px letter-spacing.

## Tech Stack Upgrades

Upgrade all major dependencies to latest stable versions:
- **Next.js** 14 → 15 (App Router, server actions, Turbopack)
- **React** 18 → 19
- **Tailwind CSS** 3 → 4
- **TypeScript** 5 (latest patch)
- All shadcn/ui, Radix UI, Lucide React to latest
- Keep Bun as package manager
- Keep Vercel deployment

## Pages

### Homepage (`/`)

Single-page scrolling layout with 5 sections separated by subtle borders:

**1. Hero**
- Small uppercase label: "Software Studio"
- Main headline: "We build software that improves lives"
- Subtitle: 1-2 sentences about turning ideas into polished software
- Two CTAs: "View Our Work" (solid white button) → scrolls to projects, "Get in Touch" (ghost button) → scrolls to contact
- Full viewport height, centered

**2. What We Do**
- Section label: "What We Do"
- Heading: "Two sides of the same coin"
- Two cards side by side:
  - **Client Solutions** — We build apps, websites, and platforms for clients. Web apps, mobile apps, full-stack systems, e-commerce.
  - **Innovation Lab** — Client work funds R&D. We build our own products pushing boundaries in AI, cross-platform, and developer tools.

**3. Featured Projects**
- Section label: "Selected Work"
- Heading: "Featured Projects"
- "View All →" link to `/projects`
- 2x2 grid of 4 project cards, each showing:
  - Category tags (colored badges)
  - Project name
  - One-line description
  - Tech stack (muted text)
- Featured projects (in order):
  1. **Rishi** — Cross-platform book reader with on-device AI, voice chat, and cloud sync. Tags: Innovation, Cross-Platform. Tech: Tauri, React Native, Rust, Cloudflare.
  2. **Money Lending System** — Full-featured lending platform with loan tracking, investor management, financial reporting. Tags: SaaS, Finance. Tech: Next.js, PostgreSQL, Clerk, Prisma.
  3. **AI Scraping Ecosystem** — AI-powered scraping product: dashboard, npm library, serverless backend. Tags: AI, Developer Tool. Tech: Next.js, AWS Lambda, npm, AI.
  4. **Apartment Manager** — Property management with rent billing, expenditure tracking, role-based access, data export. Tags: SaaS, Property. Tech: Next.js, PostgreSQL, Prisma, Better Auth.

**4. Capabilities**
- Section label: "Capabilities"
- Heading: "What we bring to the table"
- 4-column grid (stacks on mobile):
  - Web Apps (Next.js, React, Rails)
  - Mobile (Flutter, React Native)
  - AI & ML (OpenAI, on-device ML)
  - Desktop (Tauri, Electron, Rust)
- Each with an icon (Lucide icons, not emoji), label, and tech list

**5. Contact**
- Section label: "Get in Touch"
- Heading: "Let's build something great"
- Subtitle: "Tell us about your project and we'll get back to you."
- Form: Name, Email (side by side), Message textarea
- Two buttons side by side:
  - "Send Message" (solid white) — submits the form
  - "Ask AI instead" (ghost, with sparkle icon) — opens the AI chat as a modal/slide-over panel
- Contact form submits via server action or API route (can start with console.log, wire up email later)

**6. Footer**
- "Fidexa" logo + tagline
- Social links: GitHub, X/Twitter, LinkedIn
- Copyright with dynamic year
- Minimal, single row

### Navigation

- Sticky top nav, transparent background with blur backdrop
- Logo (hexagonal prism + "fidexa") on left
- Links: Projects, Contact (anchor links on homepage, real links on /projects page)
- Clean, minimal — no hamburger menu needed for 2 links (can just show always)

### Projects Page (`/projects`)

- Full grid of all projects (~15)
- Category filter tabs: All, AI & Automation, Cross-Platform, Web Applications, Developer Tools
- Each card: same style as homepage featured cards but in a responsive grid (1-2-3 columns)
- Projects data lives in a shared data file (`src/data/projects.ts`)
- Project data sourced from portfolio project, adapted for Fidexa context

### AI Chat Modal

- Triggered by "Ask AI instead" button on contact section
- Opens as a slide-over panel or modal
- Reuses existing chat logic (OpenAI integration) but with updated UI matching the site aesthetic
- Dark modal with chat bubbles
- Can be closed, returning to contact form
- No standalone `/chat` page — chat lives only in the modal

## Project Data

All project data in `src/data/projects.ts`. Each project has:
```typescript
{
  id: string
  name: string
  description: string
  category: "ai-automation" | "cross-platform" | "web-apps" | "developer-tools"
  tags: string[]
  techStack: string[]
  year: number
  featured: boolean
  links?: { github?: string; live?: string; video?: string }
}
```

Full project list (sourced from portfolio + GitHub):
1. Rishi (featured)
2. Money Lending System (featured)
3. AI Scraping Ecosystem (featured)
4. Apartment Manager (featured)
5. Maria (crypto trading bot)
6. Murmur (Rust macOS voice-to-text CLI)
7. Sophie Website (Abia Cleaning Services)
8. Proxy Service
9. Realtime Analytics
10. RC-Textfield (npm component library)
11. Pearl of Africa Tour
12. Painter (Play Store app)
13. Virtual Phone
14. Stocks App
15. Space Travellers

Archived/superseded projects (Book Reader, Apartment Manager Rails) are excluded.

## Logo

SVG hexagonal prism mark:
- 3D hexagonal shape with internal perspective lines
- Stroke-based (no fills) for clean scaling
- Two variants: white strokes (for dark bg), dark strokes (for light bg)
- Used in nav, footer, and as favicon (simplified to just the hex shape)

## What's Removed

- Old WhySection, WhatSection, ContactSection components (replaced entirely)
- Standalone `/chat` page (chat moves to modal)
- `systemMessage.md` (updated for modal context)
- Placeholder phone numbers
- Old logo/branding
- Theme switcher (dark-only for now — simpler, more cohesive)

## What's Kept

- Vercel deployment
- Bun package manager
- shadcn/ui component library (upgraded)
- OpenAI chat integration (moved to modal)
- Basic project structure (`src/app`, `src/components`, `src/lib`)

## File Structure (Expected)

```
src/
├── app/
│   ├── layout.tsx          (root layout, font, metadata)
│   ├── page.tsx            (homepage with all sections)
│   ├── globals.css         (tailwind v4, CSS variables)
│   ├── projects/
│   │   └── page.tsx        (projects grid page)
│   └── api/
│       └── chat/
│           └── route.ts    (OpenAI chat endpoint)
├── components/
│   ├── nav.tsx             (sticky navbar)
│   ├── hero.tsx            (hero section)
│   ├── what-we-do.tsx      (dual identity section)
│   ├── featured-projects.tsx (4 featured project cards)
│   ├── capabilities.tsx    (capabilities grid)
│   ├── contact.tsx         (contact form + AI button)
│   ├── footer.tsx          (footer)
│   ├── chat-modal.tsx      (AI chat slide-over)
│   ├── project-card.tsx    (reusable project card)
│   ├── project-filters.tsx (category filter tabs)
│   ├── logo.tsx            (SVG logo component)
│   └── ui/                 (shadcn components)
├── data/
│   └── projects.ts         (all project data)
└── lib/
    └── utils.ts            (cn utility)
```
