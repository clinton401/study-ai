"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, ChevronDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionType } from "@/lib/types";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import createToast from "@/hooks/create-toast";
import { Logo } from "@/components/logo";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Content Generator", href: "/content-generator" },
  { name: "Summary", href: "/ai-study-tools" },
  { name: "Writing Companion", href: "/writing-companion" },
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

export default function Navigation({
  session,
}: {
  session: SessionType | undefined;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const pathname = usePathname();
  const { push } = useRouter();
  const { createError, createSimple } = createToast();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Track scroll for backdrop
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    if (isPending) return;
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
  }, [isPending, createError, createSimple]);

  // Hide nav on dashboard route
  if (pathname === "/dashboard") return null;

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "sticky mb-6 top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-background backdrop-blur-md  shadow-sm",
        isScrolled
          ? "border-b border-border/60"
        : "",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm transition-colors duration-200",
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-2">
              {!session ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-sm"
                    asChild
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button size="sm" className="rounded-xl text-sm" asChild>
                    <Link href="/register">Sign up</Link>
                  </Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-sm font-semibold"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold shrink-0">
                        {getInitials(session.name)}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <div className="px-3 py-2 border-b border-border/60">
                      <p className="text-xs font-semibold truncate">
                        {session.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {session.email}
                      </p>
                    </div>
                    <DropdownMenuItem
                      className="rounded-lg mt-1"
                      onClick={() => push("/dashboard")}
                    >
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg"
                      onClick={() => push("/settings")}
                    >
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="rounded-lg text-destructive focus:text-destructive"
                      onClick={handleLogout}
                      disabled={isPending}
                    >
                      Sign Out
                      {isPending && (
                        <DropdownMenuShortcut>
                          <Loader className="h-3 w-3 animate-spin" />
                        </DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-xl"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md"
          >
            <div className="px-4 py-5 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center h-9 px-3 rounded-xl text-sm transition-colors",
                    pathname === item.href
                      ? "bg-accent text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-3 border-t border-border/60 space-y-1">
                {!session ? (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start rounded-xl text-sm"
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="w-full rounded-xl text-sm">
                        Sign up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 rounded-xl bg-muted/50 mb-2">
                      <p className="text-xs font-semibold truncate">
                        {session.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {session.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start rounded-xl text-sm"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start rounded-xl text-sm"
                      >
                        Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start rounded-xl text-sm text-destructive hover:text-destructive"
                      onClick={handleLogout}
                      disabled={isPending}
                    >
                      Sign Out
                      {isPending && (
                        <Loader className="h-3 w-3 animate-spin ml-2" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
