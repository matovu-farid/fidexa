import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selected Projects | Fidexa",
  description: "Explore selected software products, client solutions, infrastructure, and developer tools built by Fidexa.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Selected Projects | Fidexa",
    description: "Explore selected software products, client solutions, infrastructure, and developer tools built by Fidexa.",
    url: "/projects",
  },
};

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
