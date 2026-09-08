export function splitAddresses(value: string | null | undefined): string[] {
  if (!value) return [];
  return Array.from(value.matchAll(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w.-]+\.[A-Za-z]{2,}/g), (match) => match[0].toLowerCase());
}
