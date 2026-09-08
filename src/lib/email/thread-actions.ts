export const THREAD_ACTIONS = ["read", "unread", "archive", "restore"] as const;
export type ThreadAction = (typeof THREAD_ACTIONS)[number];

export function parseThreadAction(input: unknown): ThreadAction | null {
  if (!input || typeof input !== "object") return null;
  const action = (input as { action?: unknown }).action;
  if (action === "read" || action === "unread" || action === "archive" || action === "restore") return action;
  return null;
}
