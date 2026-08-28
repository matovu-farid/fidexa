export type ProjectCategory = "ai-automation" | "native-apps" | "web-apps" | "developer-tools";

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  techStack: string[];
  year: number;
  featured: boolean;
  media?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  links?: {
    appStore?: string;
    github?: string;
    live?: string;
    video?: string;
  };
}

export const categories: { value: ProjectCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ai-automation", label: "AI & Automation" },
  { value: "native-apps", label: "Apple & Native Apps" },
  { value: "web-apps", label: "Web Applications" },
  { value: "developer-tools", label: "Developer Tools" },
];

export const projects: Project[] = [
  {
    id: "rishi",
    name: "Rishi",
    description: "Production Apple ecosystem reading platform for iPhone, iPad, Mac, CarPlay, and connected Apple Watch experiences, with EPUB and PDF reading, read-aloud, highlights, sync, sharing, and AI chat grounded in the current book. Android is planned, but is not available today.",
    category: "native-apps",
    tags: ["Innovation", "Apple Native"],
    techStack: ["SwiftUI", "Swift", "Shared Swift Packages", "TypeScript", "Cloudflare"],
    year: 2026,
    featured: true,
    media: { src: "/projects/rishi-library.png", alt: "Rishi reading library on iPhone", width: 1280, height: 720 },
    links: {
      appStore: "https://apps.apple.com/us/app/rishi-reader/id6763041630",
      github: "https://github.com/matovu-farid/rishi-monorepo",
      live: "https://rishi.fidexa.org",
      video: "https://youtu.be/vcWcpEGsof8",
    },
  },
  {
    id: "money-lending",
    name: "Money Lending Management System",
    description: "Kaks Credit’s production fintech and accounting-ledger platform used by real customers and businesses in a money-lending operation, with reducing-balance interest, exact money math, investor capital, risk watchlists, approvals, role-based access, and financial reports.",
    category: "web-apps",
    tags: ["SaaS", "Fintech"],
    techStack: ["Next.js 16", "React 19", "TypeScript", "PostgreSQL (Neon)", "Drizzle ORM", "TanStack DB", "ElectricSQL", "Better Auth", "BigNumber.js"],
    year: 2026,
    featured: true,
    media: { src: "/projects/money-lending-showcase.png", alt: "Kaks Credit lending workspace showcase", width: 1280, height: 720 },
    links: {
      github: "https://github.com/matovu-farid/money-lending",
      live: "https://money-lending.fidexa.org/home",
    },
  },
  {
    id: "inventory-trade",
    name: "Inventory and Trade Management System",
    description: "Production trade platform used by real customers and businesses across Supply, Store, and Shop, with a shared double-entry ledger from procurement to retail, RMB, USD, and UGX money support, POS, stock control, loss detection, and audit trails.",
    category: "web-apps",
    tags: ["SaaS", "Trade"],
    techStack: ["TanStack Start", "TanStack Router", "TanStack DB", "React", "TypeScript", "PostgreSQL (Neon)", "Drizzle ORM", "Cloudflare Workers", "Better Auth"],
    year: 2026,
    featured: true,
    media: { src: "/projects/inventory-dashboard.png", alt: "Inventory management dashboard", width: 1440, height: 900 },
    links: {
      github: "https://github.com/matovu-farid/inventory",
      live: "https://inventory.fidexa.org/home",
    },
  },
  {
    id: "ai-scraping",
    name: "AI Scraping Ecosystem",
    description: "AI-powered scraping product: interactive dashboard, published npm library (scrap-ai), and serverless AWS Lambda backend.",
    category: "ai-automation",
    tags: ["AI", "Developer Tool"],
    techStack: ["Next.js", "AWS Lambda", "npm", "AI"],
    year: 2025,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/scrap-platform",
    },
  },
  {
    id: "apartment-manager",
    name: "Apartment Manager",
    description: "Property management with block management, rent billing cycles, expenditure tracking, role-based access, and data export.",
    category: "web-apps",
    tags: ["SaaS", "Property"],
    techStack: ["Next.js", "PostgreSQL", "Prisma", "Better Auth"],
    year: 2025,
    featured: false,
  },
  {
    id: "maria",
    name: "Maria",
    description: "Production cryptocurrency trading bot with multiple strategies, backtesting, grid-search optimization, and Docker Swarm deployment.",
    category: "ai-automation",
    tags: ["AI", "Finance"],
    techStack: ["TypeScript", "Effect.js", "Docker", "Prisma", "PostgreSQL"],
    year: 2026,
    featured: false,
  },
  {
    id: "murmur",
    name: "Murmur",
    description: "macOS voice-to-text dictation CLI daemon built in Rust for fast, native speech recognition.",
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
    description: "Business website for Abia Cleaning Services LLC built with the T3 stack.",
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
    description: "Containerized reverse proxy for OpenAI TTS API with rate limiting, CORS, Docker secrets, and nginx.",
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
    description: "Real-time search analytics dashboard with trend tracking and IP-based user analytics.",
    category: "web-apps",
    tags: ["Analytics", "Real-time"],
    techStack: ["Ruby on Rails", "PostgreSQL", "RSpec"],
    year: 2023,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/realtime-analytics",
    },
  },
  {
    id: "rc-textfield",
    name: "RC-Textfield",
    description: "Published React component library on npm providing flexible text fields with built-in validation and Tailwind CSS styling.",
    category: "developer-tools",
    tags: ["npm", "Component Library"],
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    year: 2023,
    featured: false,
    links: {
      github: "https://github.com/matovu-farid/rc-textfield",
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
