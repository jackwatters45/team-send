export default function extractInitials(text: string): string {
  const words = text.split(/\s+/);

  if (!words[0]?.[0] || !words[1]?.[0]) {
    return "";
  } else if (words.length === 1 && words[0]) {
    return words[0].slice(0, 2);
  } else {
    return words[0][0] + words[1][0];
  }
}
