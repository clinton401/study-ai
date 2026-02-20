// ─── Shared badge color helpers ───────────────────────────────────────────────

export const toneColor = (tone: string) => {
  switch (tone) {
    case "academic": return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
    case "formal":   return "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300";
    case "casual":   return "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300";
    case "friendly": return "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300";
    default:         return "bg-muted text-muted-foreground";
  }
};

export const lengthColor = (length: string) => {
  switch (length) {
    case "short":  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300";
    case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
    case "long":   return "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300";
    default:       return "bg-muted text-muted-foreground";
  }
};