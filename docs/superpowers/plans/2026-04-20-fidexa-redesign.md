# Fidexa Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Fidexa from a basic landing page into a polished, Apple/Linear-inspired software studio site with project showcase, new logo, and upgraded tech stack.

**Architecture:** Single-page marketing homepage with scroll sections (Hero, What We Do, Featured Projects, Capabilities, Contact, Footer) plus a /projects page with category filters. AI chat moves from standalone page to a slide-over modal triggered from the contact section. All existing section components are replaced.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, TypeScript 5, shadcn/ui (latest), Lucide React, Vercel AI SDK

---

### Task 1: Upgrade Dependencies and Migrate Config

**Files:**
- Modify: `package.json`
- Delete: `tailwind.config.ts`
- Modify: `postcss.config.mjs`
- Modify: `src/app/globals.css`
- Modify: `next.config.mjs`
- Modify: `components.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Update package.json dependencies**

Replace the contents of `package.json` with upgraded versions. Key changes:
- next: 14 → 15
- react/react-dom: 18 → 19
- Remove tailwindcss v3, add tailwindcss v4 + @tailwindcss/postcss
- Replace tailwindcss-animate with tw-animate-css
- Remove @next/mdx, @mdx-js/react, @mdx-js/loader, remark-gfm, remark-math (no longer needed)
- Remove react-dropzone (unused)
- Remove simple-icons, react-icons (replaced by lucide-react)
- Remove next-themes (dark-only, no switcher)
- Update @types/react and @types/react-dom to v19

```json
{
  "name": "fidexa",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.0.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "ai": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "tailwind-merge": "^2.5.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "tailwindcss": "^4.0.0",
    "tw-animate-css": "^1.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Run install**

```bash
cd /Users/faridmatovu/projects/fidexa && rm -rf node_modules bun.lockb && bun install
```

- [ ] **Step 3: Rewrite postcss.config.mjs**

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 4: Delete tailwind.config.ts**

```bash
rm tailwind.config.ts
```

- [ ] **Step 5: Rewrite globals.css for Tailwind v4**

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
}

:root {
  --radius: 0.625rem;
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 6: Simplify next.config.mjs**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 7: Update components.json**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 8: Regenerate shadcn/ui components**

```bash
cd /Users/faridmatovu/projects/fidexa
npx shadcn@latest add button card input textarea dialog --overwrite --yes
```

- [ ] **Step 9: Verify dev server starts**

```bash
cd /Users/faridmatovu/projects/fidexa && bun run build
```

Fix any errors until build succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "chore: upgrade to Next.js 15, React 19, Tailwind v4"
```

---

### Task 2: Create Logo Component and Project Data

**Files:**
- Create: `src/components/logo.tsx`
- Create: `src/data/projects.ts`

- [ ] **Step 1: Create the hexagonal prism SVG logo component**

Create `src/components/logo.tsx`:

```tsx
export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 40 44"
      fill="none"
      className={className}
    >
      <path
        d="M20 2L38 14V30L20 42L2 30V14L20 2Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M20 2V42" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path
        d="M2 14L20 22L38 14"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path d="M20 22V42" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

export function LogoWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={28} />
      <span className="text-xl font-bold tracking-tight">fidexa</span>
    </div>
  );
}
```

- [ ] **Step 2: Create project data file**

Create `src/data/projects.ts`:

```typescript
export type ProjectCategory = "ai-automation" | "cross-platform" | "web-apps" | "developer-tools";

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  techStack: string[];
  year: number;
  featured: boolean;
  links?: {
    github?: string;
    live?: string;
    video?: string;
  };
}

export const categories: { value: ProjectCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ai-automation", label: "AI & Automation" },
  { value: "cross-platform", label: "Cross-Platform" },
  { value: "web-apps", label: "Web Applications" },
  { value: "developer-tools", label: "Developer Tools" },
];

export const projects: Project[] = [
  {
    id: "rishi",
    name: "Rishi",
    description:
      "Cross-platform book reader with on-device AI, voice chat, and cloud sync across desktop, web, and mobile.",
    category: "cross-platform",
    tags: ["Innovation", "Cross-Platform"],
    techStack: ["Tauri", "React Native", "Rust", "Cloudflare"],
    year: 2025,
    featured: true,
    links: {
      github: "https://github.com/matovu-farid/rishi-monorepo",
      video: "https://youtu.be/vcWcpEGsof8",
    },
  },
  {
    id: "money-lending",
    name: "Money Lending System",
    description:
      "Full-featured lending platform with loan tracking, investor management, daily interest calculations, and financial reporting.",
    category: "web-apps",
    tags: ["SaaS", "Finance"],
    techStack: ["Next.js", "PostgreSQL", "Clerk", "Prisma"],
    year: 2026,
    featured: true,
    links: {
      live: "https://money-lending-liart.vercel.app",
    },
  },
  {
    id: "ai-scraping",
    name: "AI Scraping Ecosystem",
    description:
      "AI-powered scraping product: interactive dashboard, published npm library (scrap-ai), and serverless AWS Lambda backend.",
    category: "ai-automation",
    tags: ["AI", "Developer Tool"],
    techStack: ["Next.js", "AWS Lambda", "npm", "AI"],
    year: 2025,
    featured: true,
    links: {
      github: "https://github.com/matovu-farid/scrap-platform",
    },
  },
  {
    id: "apartment-manager",
    name: "Apartment Manager",
    description:
      "Property management with block management, rent billing cycles, expenditure tracking, role-based access, and data export.",
    category: "web-apps",
    tags: ["SaaS", "Property"],
    techStack: ["Next.js", "PostgreSQL", "Prisma", "Better Auth"],
    year: 2025,
    featured: true,
    links: {
      github: "https://github.com/matovu-farid/apartment_manager_next",
      live: "https://apartment-manager-ten.vercel.app",
    },
  },
  {
    id: "maria",
    name: "Maria",
    description:
      "Production cryptocurrency trading bot with multiple strategies, backtesting, grid-search optimization, and Docker Swarm deployment.",
    category: "ai-automation",
    tags: ["AI", "Finance"],
    techStack: ["TypeScript", "Effect.js", "Docker", "Prisma", "PostgreSQL"],
    year: 2026,
    featured: false,
  },
  {
    id: "murmur",
    name: "Murmur",
    description:
      "macOS voice-to-text dictation CLI daemon built in Rust for fast, native speech recognition.",
    category: "developer-tools",
    tags: ["CLI", "Systems"],
    techStack: ["Rust", "macOS"],
    year: 2025,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/murmur",
    },
  },
  {
    id: "sophie-website",
    name: "Sophie Website",
    description:
      "Business website for Abia Cleaning Services LLC built with the T3 stack.",
    category: "web-apps",
    tags: ["Client Work", "Business"],
    techStack: ["Next.js", "tRPC", "Prisma", "Tailwind CSS"],
    year: 2023,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/sophie-website",
      live: "https://sophie-website-six.vercel.app",
    },
  },
  {
    id: "proxy-service",
    name: "Proxy Service",
    description:
      "Containerized reverse proxy for OpenAI's TTS API with rate limiting, CORS, Docker secrets, and nginx.",
    category: "developer-tools",
    tags: ["Infrastructure", "Docker"],
    techStack: ["TypeScript", "Docker", "nginx", "Bun"],
    year: 2024,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/proxy-service",
    },
  },
  {
    id: "realtime-analytics",
    name: "Realtime Analytics",
    description:
      "Real-time search analytics dashboard with trend tracking and IP-based user analytics.",
    category: "web-apps",
    tags: ["Analytics", "Real-time"],
    techStack: ["Ruby on Rails", "PostgreSQL", "RSpec"],
    year: 2023,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/realtime-analytics",
      live: "https://realtime-analytics-ae1974cb754c.herokuapp.com/",
    },
  },
  {
    id: "rc-textfield",
    name: "RC-Textfield",
    description:
      "Published React component library on npm providing flexible text fields with built-in validation and Tailwind CSS styling.",
    category: "developer-tools",
    tags: ["npm", "Component Library"],
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    year: 2023,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/rc-textfield",
    },
  },
  {
    id: "pearl-of-africa",
    name: "Pearl of Africa Tour",
    description:
      "Responsive tourism website showcasing Uganda's annual tour event featuring game park visits and cultural experiences.",
    category: "web-apps",
    tags: ["Tourism", "Marketing"],
    techStack: ["HTML", "CSS", "JavaScript"],
    year: 2022,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/Pearl-of-Africa-tour",
      live: "https://matovu-farid.github.io/Pearl-of-Africa-tour/",
    },
  },
  {
    id: "painter",
    name: "Painter",
    description:
      "Creative drawing and painting app on Google Play Store with shape tools, color palettes, and screenshot saving.",
    category: "cross-platform",
    tags: ["Mobile", "Play Store"],
    techStack: ["Flutter", "Dart", "Canvas API"],
    year: 2022,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/painter",
    },
  },
  {
    id: "virtual-phone",
    name: "Virtual Phone",
    description: "Virtual phone application for communication and telephony.",
    category: "web-apps",
    tags: ["Communication", "Telephony"],
    techStack: ["TypeScript", "Next.js"],
    year: 2024,
    featured: false,
    links: {
      live: "https://virtual-phone.vercel.app",
    },
  },
  {
    id: "stocks-app",
    name: "Stocks App",
    description:
      "Mobile-friendly stock price viewer displaying company information and real-time prices.",
    category: "web-apps",
    tags: ["Finance", "Data"],
    techStack: ["React", "Redux", "JavaScript"],
    year: 2022,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/stocks-app",
      live: "https://frosty-beaver-391916.netlify.app",
    },
  },
  {
    id: "space-travellers",
    name: "Space Travellers",
    description:
      "SpaceX rocket booking and mission joining app consuming live SpaceX API data.",
    category: "web-apps",
    tags: ["API", "Space"],
    techStack: ["React", "Redux", "SpaceX API"],
    year: 2022,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/space-travellers",
      live: "https://space-travellers-farid-anny.netlify.app/",
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/logo.tsx src/data/projects.ts && git commit -m "feat: add logo component and project data"
```

---

### Task 3: Create Navigation Component

**Files:**
- Create: `src/components/nav.tsx`

- [ ] **Step 1: Create sticky navigation**

Create `src/components/nav.tsx`:

```tsx
import Link from "next/link";
import { LogoWithText } from "./logo";

export function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/">
          <LogoWithText />
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/projects"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </Link>
          <a
            href="#contact"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/nav.tsx && git commit -m "feat: add sticky navigation component"
```

---

### Task 4: Create Homepage Section Components

**Files:**
- Create: `src/components/hero.tsx`
- Create: `src/components/what-we-do.tsx`
- Create: `src/components/project-card.tsx`
- Create: `src/components/featured-projects.tsx`
- Create: `src/components/capabilities.tsx`
- Create: `src/components/contact.tsx`
- Create: `src/components/footer.tsx`

- [ ] **Step 1: Create hero section**

Create `src/components/hero.tsx`:

```tsx
export function Hero() {
  return (
    <section className="flex min-h-screen items-center justify-center px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Software Studio
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          We build software that{" "}
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            improves lives
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
          Innovative digital products and client solutions. From concept to
          launch, we turn ideas into polished software.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#projects"
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            View Our Work
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-white/[0.15] px-6 py-3 text-sm text-muted-foreground transition-colors hover:border-white/[0.3] hover:text-foreground"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create what-we-do section**

Create `src/components/what-we-do.tsx`:

```tsx
export function WhatWeDo() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          What We Do
        </p>
        <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">
          Two sides of the same coin
        </h2>
        <div className="grid gap-4 sm:grid-columns-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="mb-3 text-lg font-semibold">Client Solutions</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We build apps, websites, and platforms for clients. Web
              applications, mobile apps, full-stack systems, and e-commerce
              solutions — tailored to your needs.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="mb-3 text-lg font-semibold">Innovation Lab</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Client work funds our own R&D. We build products like Rishi —
              pushing boundaries in AI, cross-platform development, and
              developer tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create project card component**

Create `src/components/project-card.tsx`:

```tsx
import type { Project } from "@/data/projects";
import { ExternalLink, Github, Play } from "lucide-react";

const tagColors: Record<string, string> = {
  Innovation: "bg-indigo-500/15 text-indigo-300",
  "Cross-Platform": "bg-white/[0.06] text-muted-foreground",
  SaaS: "bg-green-500/15 text-green-300",
  Finance: "bg-white/[0.06] text-muted-foreground",
  AI: "bg-amber-500/15 text-amber-300",
  "Developer Tool": "bg-white/[0.06] text-muted-foreground",
  Property: "bg-pink-500/15 text-pink-300",
  "Client Work": "bg-white/[0.06] text-muted-foreground",
  Business: "bg-white/[0.06] text-muted-foreground",
  Infrastructure: "bg-white/[0.06] text-muted-foreground",
  Docker: "bg-white/[0.06] text-muted-foreground",
  Analytics: "bg-cyan-500/15 text-cyan-300",
  "Real-time": "bg-white/[0.06] text-muted-foreground",
  npm: "bg-red-500/15 text-red-300",
  "Component Library": "bg-white/[0.06] text-muted-foreground",
  Tourism: "bg-white/[0.06] text-muted-foreground",
  Marketing: "bg-white/[0.06] text-muted-foreground",
  Mobile: "bg-violet-500/15 text-violet-300",
  "Play Store": "bg-white/[0.06] text-muted-foreground",
  Communication: "bg-white/[0.06] text-muted-foreground",
  Telephony: "bg-white/[0.06] text-muted-foreground",
  Data: "bg-white/[0.06] text-muted-foreground",
  API: "bg-white/[0.06] text-muted-foreground",
  Space: "bg-white/[0.06] text-muted-foreground",
  CLI: "bg-white/[0.06] text-muted-foreground",
  Systems: "bg-orange-500/15 text-orange-300",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
      <div className="mb-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagColors[tag] ?? "bg-white/[0.06] text-muted-foreground"}`}
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <p className="mt-4 text-xs text-white/30">
        {project.techStack.join(" · ")}
      </p>
      {project.links && (
        <div className="mt-4 flex gap-3">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github size={16} />
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink size={16} />
            </a>
          )}
          {project.links.video && (
            <a
              href={project.links.video}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Play size={16} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create featured projects section**

Create `src/components/featured-projects.tsx`:

```tsx
import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { ProjectCard } from "./project-card";

export function FeaturedProjects() {
  return (
    <section id="projects" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Selected Work
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Featured Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="rounded-lg border border-white/[0.1] px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-white/[0.2] hover:text-foreground"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create capabilities section**

Create `src/components/capabilities.tsx`:

```tsx
import { Globe, Smartphone, Bot, Monitor } from "lucide-react";

const capabilities = [
  {
    icon: Globe,
    label: "Web Apps",
    tech: "Next.js, React, Rails",
  },
  {
    icon: Smartphone,
    label: "Mobile",
    tech: "Flutter, React Native",
  },
  {
    icon: Bot,
    label: "AI & ML",
    tech: "OpenAI, on-device ML",
  },
  {
    icon: Monitor,
    label: "Desktop",
    tech: "Tauri, Electron, Rust",
  },
];

export function Capabilities() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Capabilities
        </p>
        <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">
          What we bring to the table
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {capabilities.map((cap) => (
            <div key={cap.label} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <cap.icon size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">{cap.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{cap.tech}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create contact section**

Create `src/components/contact.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { ChatModal } from "./chat-modal";

export function Contact() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <section id="contact" className="border-t border-white/[0.06] px-6 py-24">
        <div className="mx-auto max-w-xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Get in Touch
          </p>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Let&apos;s build something great
          </h2>
          <p className="mb-10 text-sm text-muted-foreground">
            Tell us about your project and we&apos;ll get back to you.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              console.log("Contact form:", Object.fromEntries(data));
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="name" placeholder="Name" required />
              <Input name="email" type="email" placeholder="Email" required />
            </div>
            <Textarea
              name="message"
              placeholder="Your message..."
              className="min-h-[120px]"
              required
            />
            <div className="flex items-center gap-3">
              <Button type="submit" className="px-6">
                Send Message
              </Button>
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-white/[0.1] px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-white/[0.2] hover:text-foreground"
              >
                <Sparkles size={14} />
                Ask AI instead
              </button>
            </div>
          </form>
        </div>
      </section>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
```

- [ ] **Step 7: Create footer**

Create `src/components/footer.tsx`:

```tsx
import { LogoWithText } from "./logo";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-6">
          <LogoWithText />
          <span className="text-xs text-muted-foreground">
            Inspiring Digital Transformation
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/matovu-farid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github size={18} />
          </a>
          <a
            href="https://twitter.com/matovu100"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Twitter size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Linkedin size={18} />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Fidexa. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/hero.tsx src/components/what-we-do.tsx src/components/project-card.tsx src/components/featured-projects.tsx src/components/capabilities.tsx src/components/contact.tsx src/components/footer.tsx && git commit -m "feat: add all homepage section components"
```

---

### Task 5: Create Chat Modal

**Files:**
- Create: `src/components/chat-modal.tsx`
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create chat modal component**

Create `src/components/chat-modal.tsx`:

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/chat" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-white/[0.1] bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Fidexa AI</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Bot size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Tell us about your project
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Our AI will help scope your idea and suggest next steps.
                </p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
                  <Bot size={14} className="text-muted-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-white/[0.04] text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground">
                  <User size={14} className="text-background" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
                <Bot size={14} className="text-muted-foreground" />
              </div>
              <div className="rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/[0.06] px-4 py-3"
        >
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Describe your project idea..."
              className="min-h-[44px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update chat API route for AI SDK v4**

Rewrite `src/app/api/chat/route.ts`:

```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

const systemPrompt = `You are Fidexa's AI project consultant. Help potential clients scope their project ideas.

Your role:
- Ask clarifying questions one at a time about their project
- Understand: purpose, target audience, core features, platform (web/mobile/desktop), timeline
- Suggest technical approaches based on Fidexa's capabilities (Next.js, React Native, Flutter, Tauri, Rust, AI/ML)
- Be concise, professional, and helpful
- After gathering enough info, provide a brief project summary with recommended approach

Keep responses short and focused. You're having a conversation, not writing an essay.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/chat-modal.tsx src/app/api/chat/route.ts && git commit -m "feat: add AI chat modal and update API route"
```

---

### Task 6: Assemble Homepage and Create Projects Page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/projects/page.tsx`
- Delete: `src/app/chat/page.tsx`
- Delete: `src/components/WhySection.tsx`
- Delete: `src/components/WhatSection.tsx`
- Delete: `src/components/ContactSection.tsx`
- Delete: `src/components/Footer.tsx`
- Delete: `src/components/theme-provider.tsx`
- Delete: `src/components/theme-switcher.tsx`
- Delete: `src/components/message.tsx`
- Delete: `src/components/spinner.tsx`
- Delete: `src/components/markdown.tsx`
- Delete: `src/components/mdx-components.tsx`
- Delete: `src/app/api/chat/systemMessage.md`
- Delete: `src/lib/hooks/use-enter-submit.tsx`

- [ ] **Step 1: Rewrite the root layout**

Rewrite `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fidexa — Software Studio",
  description:
    "We build software that improves lives. Innovative digital products and client solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite the homepage**

Rewrite `src/app/page.tsx`:

```tsx
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { WhatWeDo } from "@/components/what-we-do";
import { FeaturedProjects } from "@/components/featured-projects";
import { Capabilities } from "@/components/capabilities";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Hero />
        <WhatWeDo />
        <FeaturedProjects />
        <Capabilities />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Create projects page**

Create `src/app/projects/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProjectCard } from "@/components/project-card";
import { projects, categories } from "@/data/projects";
import type { ProjectCategory } from "@/data/projects";

export default function ProjectsPage() {
  const [active, setActive] = useState<ProjectCategory | "all">("all");

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <>
      <Nav />
      <main className="px-6 pt-32 pb-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Our Work
          </p>
          <h1 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
            Projects
          </h1>

          {/* Filters */}
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActive(cat.value)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  active === cat.value
                    ? "bg-foreground text-background"
                    : "border border-white/[0.1] text-muted-foreground hover:border-white/[0.2] hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Delete old components and pages**

```bash
cd /Users/faridmatovu/projects/fidexa
rm -f src/components/WhySection.tsx
rm -f src/components/WhatSection.tsx
rm -f src/components/ContactSection.tsx
rm -f src/components/Footer.tsx
rm -f src/components/theme-provider.tsx
rm -f src/components/theme-switcher.tsx
rm -f src/components/message.tsx
rm -f src/components/spinner.tsx
rm -f src/components/markdown.tsx
rm -f src/components/mdx-components.tsx
rm -f src/lib/hooks/use-enter-submit.tsx
rm -f src/app/api/chat/systemMessage.md
rm -rf src/app/chat
rm -f mdx-components.tsx
```

- [ ] **Step 5: Build and fix errors**

```bash
cd /Users/faridmatovu/projects/fidexa && bun run build
```

Fix any build errors until the build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: complete website redesign with new homepage and projects page"
```

---

### Task 7: Generate Favicon and Final Polish

**Files:**
- Create: `src/app/favicon.svg`
- Modify: `src/app/layout.tsx` (add favicon reference if needed)

- [ ] **Step 1: Create SVG favicon**

Create `src/app/icon.svg`:

```svg
<svg width="32" height="32" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 2L38 14V30L20 42L2 30V14L20 2Z" stroke="white" stroke-width="2.2"/>
  <path d="M20 2V42" stroke="white" stroke-width="1.5" opacity="0.4"/>
  <path d="M2 14L20 22L38 14" stroke="white" stroke-width="1.5" opacity="0.4"/>
  <path d="M20 22V42" stroke="white" stroke-width="1.5" opacity="0.6"/>
</svg>
```

- [ ] **Step 2: Delete old favicon and logo files**

```bash
cd /Users/faridmatovu/projects/fidexa
rm -f public/favicon.ico
rm -f public/logo-black.png public/logo-white.png public/fidexa.png
rm -f src/app/favicon.ico
```

- [ ] **Step 3: Final build verification**

```bash
cd /Users/faridmatovu/projects/fidexa && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add SVG favicon and remove old assets"
```
