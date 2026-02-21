"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from "next/navigation";
import { SessionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Page title map — extend as new routes are added
const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/ai-study-tools": { title: "AI Study Tools" },
  "/content-generator": { title: "Content Generator" },
  "/writing-companion": { title: "Writing Companion" },
  "/dashboard/summary": { title: "My Summaries" },
  "/dashboard/flashcards": { title: "My Flashcards" },
  "/dashboard/quiz": { title: "My Quizzes" },
  "/dashboard/content": { title: "My Content" },
  "/settings": { title: "Settings" },
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

export function DashboardHeader({
  session,
}: {
  session: SessionType | undefined;
}) {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname];

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-sm px-4">
      {/* Sidebar trigger + divider */}
      <SidebarTrigger className="-ml-1 rounded-lg" />
      <Separator orientation="vertical" className="h-4 mx-1" />

      {/* Page title */}
      <div className="flex-1 min-w-0">
        {page && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold truncate">{page.title}</span>
            {pathname === "/dashboard" && session && (
              <span className="text-xs text-muted-foreground truncate">
                Welcome back, {session.name.trim().split(/\s+/)[0]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        <ModeToggle />
        {session ? (
          <Avatar className="h-7 w-7">
            <AvatarImage src={""} alt={session.name} />
            <AvatarFallback className="text-[11px] font-bold bg-foreground text-background">
              {getInitials(session.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Button asChild size="sm" className="rounded-xl text-sm h-8">
            <Link href="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
