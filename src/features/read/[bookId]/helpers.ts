export function clampText(text: string, maxLen: number) {
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}
