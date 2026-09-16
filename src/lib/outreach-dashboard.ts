export type OutreachDashboardState = "empty" | "missing" | "ready" | "unavailable";

export function getBoundedOutreachCompanyId(value: string | null | undefined): string | null {
  const id = value?.trim();
  return id && id.length <= 200 ? id : null;
}

export function classifyOutreachDashboard(input: {
  workerAvailable: boolean;
  companyRequested: boolean;
  companyFound: boolean;
  companyCount: number;
}): OutreachDashboardState {
  if (!input.workerAvailable) return "unavailable";
  if (input.companyRequested && !input.companyFound) return "missing";
  if (input.companyCount === 0) return "empty";
  return "ready";
}
