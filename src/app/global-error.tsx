"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="grid min-h-svh place-items-center p-6">
          <Card className="w-full max-w-lg">
            <CardHeader><CardTitle><h1>Something went wrong</h1></CardTitle><CardDescription>Please try again. If the problem persists, return to the home page.</CardDescription></CardHeader>
            <CardFooter className="flex-wrap gap-3"><Button type="button" onClick={reset}>Try again</Button><Button variant="outline" asChild><a href="/">Return home</a></Button></CardFooter>
          </Card>
        </main>
      </body>
    </html>
  );
}
