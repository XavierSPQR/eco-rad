export function formatPrefixedNumber(prefix: string, value: number, width = 3) {
  return `${prefix}${String(value).padStart(width, "0")}`;
}

export function extractPrefixedNumber(value: string, prefix: string) {
  if (!value.startsWith(prefix)) return null;
  const numericPart = Number.parseInt(value.slice(prefix.length), 10);
  return Number.isFinite(numericPart) ? numericPart : null;
}

