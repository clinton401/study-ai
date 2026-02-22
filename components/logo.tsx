import { GraduationCap } from "lucide-react";
import Link from "next/link";

/**
 * Shared brand mark — used in Navigation and Footer.
 * The gradient pill background is preserved exactly as requested.
 */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const icon =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  const pill = size === "sm" ? "p-1.5" : size === "lg" ? "p-2.5" : "p-2";

  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div
        className={`bg-gradient-to-r from-blue-600 to-purple-600 ${pill} rounded-xl shrink-0`}
      >
        <GraduationCap className={`${icon} text-white`} />
      </div>
      <span className={`${text} font-bold tracking-tight`}>StudyAI</span>
    </Link>
  );
}
