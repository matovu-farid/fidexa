export type ProjectCategory = "ai-automation" | "native-apps" | "web-apps" | "developer-tools";

export interface ProjectEvidence {
  workflows: { title: string; description: string }[];
  captures: { src: string; mobileSrc?: string; mobileWidth?: number; mobileHeight?: number; alt: string; width: number; height: number; caption: string }[];
}

export interface ProjectCaseStudy {
  shortName: string;
  intro: string;
  situation: string;
  decision: string;
  delivered: string;
  caption: string;
  provenance: string;
  evidence?: ProjectEvidence;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  featuredSummary?: string;
  caseStudy?: ProjectCaseStudy;
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
    description: "Fidexa’s production Apple ecosystem reading platform brings books, listening, and book-grounded questions into one product. Built for iPhone, iPad, Mac, CarPlay, and connected Apple Watch experiences, it supports EPUB and PDF reading, read-aloud, highlights, sync, sharing, and AI chat grounded in the current book. The App Store listing and product walkthrough provide public evidence. Android is planned, but is not available today.",
    featuredSummary: "A production reading app bringing EPUB and PDF books, read-aloud, highlights, sync, and book-grounded AI chat together across Apple devices.",
    caseStudy: {
      shortName: "Rishi",
      intro: "One reading experience, across Apple devices.",
      situation: "Readers move between books, listening, and questions about what they’re reading.",
      decision: "Keep reading, read-aloud, and AI questions together, with answers grounded in the current book.",
      delivered: "An Apple reading platform with EPUB and PDF support, highlights, sync, and sharing. Available on the App Store, with a public product walkthrough.",
      caption: "Search the library, see books in progress, and choose the next read.",
      provenance: "Existing Rishi iPhone product capture; a static frame from the walkthrough.",
    },
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
    description: "Built by Fidexa for Kaks Credit, this production lending and accounting-ledger platform supports a money-lending operation used by real customers and businesses. It connects reducing-balance interest, exact money math, investor capital, risk watchlists, approvals, role-based access, and financial reports. The public product showcase demonstrates the platform; operational workspace access requires sign-in.",
    featuredSummary: "Kaks Credit runs lending on an accounting-ledger platform with reducing-balance interest, investor capital, approvals, risk watchlists, and financial reports.",
    caseStudy: {
      shortName: "Kaks Credit",
      intro: "Lending decisions connected to the ledger.",
      situation: "Kaks Credit’s lending operation brings together loan calculations, investor capital, approvals, and financial reporting.",
      decision: "Build around an accounting ledger, using exact money math for reducing-balance interest.",
      delivered: "A production lending platform with investor capital, risk watchlists, approvals, role-based access, and financial reports.",
      caption: "The public presentation connects loans, collections, and customers in one workspace view.",
      provenance: "Public Kaks Credit showcase with a dashboard illustration. The operational workspace requires sign-in.",
    },
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
    description: "Fidexa built this production trade platform to connect Supply, Store, and Shop from procurement to retail. Used by real customers and businesses, it combines a shared double-entry ledger, RMB, USD, and UGX money support, POS, stock control, loss detection, and audit trails. The public showcase provides product evidence; operational workspace access requires sign-in.",
    featuredSummary: "A trade platform connecting Supply, Store, and Shop with a shared ledger, point of sale, stock control, loss detection, and audit trails.",
    caseStudy: {
      shortName: "Inventory",
      intro: "From procurement to the shop floor.",
      situation: "Trade operations span Supply, Store, and Shop, from buying stock to recording retail sales.",
      decision: "Connect those stages through a shared double-entry ledger with RMB, USD, and UGX support.",
      delivered: "A production trade platform combining point of sale, stock control, loss detection, and audit trails.",
      caption: "Supply Routes tracks buying trips and procurement costs; Transfers moves stock between locations.",
      provenance: "Existing static Inventory dashboard capture. The operational workspace requires sign-in.",
    },
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
    description: "An AI-powered scraping ecosystem combining an interactive dashboard, a published npm library (scrap-ai), and a serverless AWS Lambda backend. It shows product delivery across a web interface, reusable developer package, and deployed processing infrastructure.",
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
    description: "A rebuild of Fidexa’s original Apartment Manager brings property and resident records together with monthly rent billing, payment receipts, expenses, and savings. Daily collections and rent-due views use Kampala time; collection destinations and reconciliation batches connect payments to deposits. Monthly reports support CSV and Excel export, while audit history records operational changes. The accounting workspace includes ledger and statement views and explicitly marks figures provisional when source reconciliation is pending. The public showcase is open; operational screens require sign-in.",
    featuredSummary: "Apartment Manager connects properties, residents, daily rent work, reconciliation, and monthly reporting in one rental-operations workspace.",
    caseStudy: {
      shortName: "Apartment Manager",
      intro: "Property records meet the daily work of rent.",
      situation: "Running rentals means keeping apartments, resident history, rent due, collections, and building expenses in step.",
      decision: "Connect daily rent work to collection destinations, reconciliation, and monthly reporting, while making the status of accounting figures explicit.",
      delivered: "A rebuild of the original Apartment Manager, with block and resident management, rent billing, payment receipts, expenses, savings, exports, and audit history. Accounting views visibly flag figures as provisional when source reconciliation is pending.",
      caption: "The public product page introduces the property workspace and its privacy-blurred apartment overview.",
      provenance: "Captured from the deployed public showcase. Identifying values in its embedded overview were already blurred by the product site.",
      evidence: {
        workflows: [
          { title: "Start with the rental records", description: "Blocks organize apartments by floor, rent, and occupancy. Resident records keep move-in and archived history alongside monthly rent cycles, payment status, and receipts." },
          { title: "Follow collections through to deposits", description: "Daily collections and the rent-due queue use Kampala dates. Collection destinations and reconciliation batches provide a place to compare recorded payments with deposits and their evidence." },
          { title: "Report with the accounting status visible", description: "Monthly reports cover rent, receivables, expenses, deposits, and reconciliation, with block filters and CSV/Excel export. Ledger and statement views are available, but unreconciled figures remain explicitly provisional. Audit activity records who changed what." },
        ],
        captures: [
          { src: "/projects/apartment-manager-daily-rent.png", mobileSrc: "/projects/apartment-manager-daily-rent-phone.png", mobileWidth: 361, mobileHeight: 719, width: 1184, height: 539, alt: "Apartment Manager daily collections with day, block, and destination filters and an empty day", caption: "Daily rent work: switch between collections and the due queue, then filter by day, block, and destination. This actual capture shows a day with no recorded payments." },
          { src: "/projects/apartment-manager-reports.png", mobileSrc: "/projects/apartment-manager-reports-phone.png", mobileWidth: 345, mobileHeight: 310, width: 1168, height: 172, alt: "Apartment Manager monthly report controls with Kampala month, block filter, and CSV and Excel export", caption: "Monthly report controls: choose a Kampala month and permitted blocks, then export CSV or Excel. Financial totals and private records are outside the capture." },
        ],
      },
    },
    category: "web-apps",
    tags: ["SaaS", "Property"],
    techStack: ["Next.js 15", "React 19", "TypeScript", "PostgreSQL", "Prisma", "Better Auth", "TanStack Query"],
    year: 2026,
    featured: true,
    media: { src: "/projects/apartment-manager-showcase.png", alt: "Apartment Manager public product page showing its property-management proposition and privacy-blurred apartment overview", width: 1093, height: 755 },
    links: { live: "https://apartment.fidexa.org/home" },
  },
  {
    id: "maria",
    name: "Maria",
    description: "Fidexa’s production cryptocurrency trading bot combines multiple strategies, backtesting, grid-search optimization, and Docker Swarm deployment. It demonstrates strategy evaluation and deployed automation.",
    category: "ai-automation",
    tags: ["AI", "Finance"],
    techStack: ["TypeScript", "Effect.js", "Docker", "Prisma", "PostgreSQL"],
    year: 2026,
    featured: false,
  },
  {
    id: "murmur",
    name: "Murmur",
    description: "A macOS voice-to-text dictation CLI daemon built in Rust for native speech recognition. The linked source repository provides implementation evidence for the command-line tool and background service.",
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
    description: "Client business website for Abia Cleaning Services LLC built with the T3 stack. The public site and source repository provide evidence of the delivered web experience.",
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
    description: "Containerized reverse proxy for the OpenAI TTS API, with rate limiting, CORS, Docker secrets, and nginx. The source repository documents an infrastructure layer for controlling access to speech-generation requests.",
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
    description: "Real-time search analytics dashboard built with Ruby on Rails and PostgreSQL, bringing trend tracking and IP-based user analytics into one view. The source repository provides implementation evidence.",
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
    description: "Published React component library on npm providing flexible text fields with built-in validation and Tailwind CSS styling. The linked source repository shows a reusable interface library built with React and TypeScript.",
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
