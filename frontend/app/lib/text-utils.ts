export function calculateReadTime(text: string | null | undefined): string {
  if (!text) return "1 min read";
  const words = String(text).trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
