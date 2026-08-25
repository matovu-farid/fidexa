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
    appStore?: string;
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
    description: "Production Apple ecosystem reading platform for iPhone, iPad, Mac, CarPlay, and connected Apple Watch experiences, with EPUB and PDF reading, read-aloud, highlights, sync, sharing, and AI chat grounded in the current book. Android is planned, but is not available today.",
    category: "cross-platform",
    tags: ["Innovation", "Cross-Platform"],
    techStack: ["SwiftUI", "Swift", "Shared Swift Packages", "TypeScript", "Cloudflare"],
    year: 2026,
    featured: true,
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
    description: "Production fintech and accounting-ledger platform for a money-lending business, with reducing-balance interest, exact money math, investor capital, risk watchlists, approvals, role-based access, and financial reports.",
    category: "web-apps",
    tags: ["SaaS", "Fintech"],
    techStack: ["Next.js 16", "React 19", "TypeScript", "PostgreSQL (Neon)", "Drizzle ORM", "TanStack DB", "ElectricSQL", "Better Auth", "BigNumber.js"],
    year: 2026,
    featured: true,
    links: {
      github: "https://github.com/matovu-farid/money-lending",
      live: "https://money-lending.fidexa.org/home",
    },
  },
  {
    id: "inventory-trade",
    name: "Inventory and Trade Management System",
    description: "Production trade platform spanning Supply, Store, and Shop, with a shared double-entry ledger from procurement to retail, RMB, USD, and UGX money support, POS, stock control, loss detection, and audit trails.",
    category: "web-apps",
    tags: ["SaaS", "Trade"],
    techStack: ["TanStack Start", "TanStack Router", "TanStack DB", "React", "TypeScript", "PostgreSQL (Neon)", "Drizzle ORM", "Cloudflare Workers", "Better Auth"],
    year: 2026,
    featured: true,
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
    featured: true,
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
    links: {
      live: "https://apartment-manager-ten.vercel.app",
    },
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
  {
    id: "pearl-of-africa",
    name: "Pearl of Africa Tour",
    description: "Responsive tourism website showcasing Uganda's annual tour event featuring game park visits and cultural experiences.",
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
    description: "Creative drawing and painting app on Google Play Store with shape tools, color palettes, and screenshot saving.",
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
    description: "Mobile-friendly stock price viewer displaying company information and real-time prices.",
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
    description: "SpaceX rocket booking and mission joining app consuming live SpaceX API data.",
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
