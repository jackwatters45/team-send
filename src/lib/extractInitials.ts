export default function extractInitials(text: string, numInitials = 2): string {
  if (!text) {
    return "";
  }

  const words = text.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0]!.slice(0, numInitials).toUpperCase();
  }

  return words
    .slice(0, numInitials)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}
