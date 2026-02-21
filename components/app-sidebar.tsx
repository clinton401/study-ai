"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState, useCallback } from "react";
import {
  BookOpen,
  ChevronDown,
  NotebookPen,
  FileText,
  Home,
  LogOut,
  Settings,
  Loader,
  LayoutDashboard,
  FileQuestion,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionType } from "@/lib/types";
import createToast from "@/hooks/create-toast";

// ─── Nav definitions ──────────────────────────────────────────────────────────

const mainNav = [{ title: "Dashboard", url: "/dashboard", icon: Home }];

const toolsNav = [
  { title: "Content Generator", url: "/content-generator", icon: FileText },
  { title: "AI Study Tools", url: "/ai-study-tools", icon: BookOpen },
  { title: "Writing Companion", url: "/writing-companion", icon: NotebookPen },
];

const libraryNav = [
  { title: "My Summaries", url: "/dashboard/summary", icon: BookOpen },
  {
    title: "My Flashcards",
    url: "/dashboard/flashcards",
    icon: LayoutDashboard,
  },
  { title: "My Quizzes", url: "/dashboard/quiz", icon: FileQuestion },
  { title: "My Content", url: "/dashboard/content", icon: FileText },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar({ session }: { session: SessionType | undefined }) {
  const [isPending, setIsPending] = useState(false);
  const pathname = usePathname();
  const { push } = useRouter();
  const { createError, createSimple } = createToast();

  const handleLogout = useCallback(async () => {
    if (isPending || !session) return;
    try {
      setIsPending(true);
      await signOut();
      createSimple("You have been signed out.");
      window.location.href = "/login";
    } catch {
      createError("There was a problem signing out.");
    } finally {
      setIsPending(false);
    }
  }, [isPending, session, createError, createSimple]);

  return (
    <Sidebar>
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                {/* Render brand mark directly — Logo wraps a <Link> which would nest <a> inside <a> */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-xl shrink-0">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold tracking-tight">
                  StudyAI
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* ── Main ───────────────────────────────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── AI Tools ───────────────────────────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── My Library ─────────────────────────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupLabel>My Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Settings ───────────────────────────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link href="/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User footer ──────────────────────────────────────────────────── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-10">
                    {/* Avatar pill */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
                      {getInitials(session.name)}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1 text-left leading-tight">
                      <span className="text-xs font-semibold truncate">
                        {session.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {session.email}
                      </span>
                    </div>
                    <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] rounded-xl"
                >
                  <DropdownMenuItem
                    className="rounded-lg"
                    onClick={() => push("/settings")}
                  >
                    <Settings className="mr-2 size-3.5" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-lg text-destructive focus:text-destructive"
                    onClick={handleLogout}
                    disabled={isPending}
                  >
                    <LogOut className="mr-2 size-3.5" />
                    Sign Out
                    {isPending && (
                      <DropdownMenuShortcut>
                        <Loader className="size-3 animate-spin" />
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="w-full rounded-xl" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
