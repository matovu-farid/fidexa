"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackAnalytics, type AnalyticsEvent } from "@/lib/analytics";

type AnalyticsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  events: readonly AnalyticsEvent[];
  children: ReactNode;
};

export function AnalyticsLink({ events, onClick, children, ...props }: AnalyticsLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        for (const analyticsEvent of events) trackAnalytics(analyticsEvent);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
