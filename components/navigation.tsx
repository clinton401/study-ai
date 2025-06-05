"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {  Menu, X, GraduationCap, ChevronDown, Loader } from "lucide-react"
import { Button } from "@/components/ui/button";
import {ModeToggle} from "@/components/mode-toggle"
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation"
import {SessionType} from "@/lib/types";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";
import createToast from "@/hooks/create-toast";
export default function Navigation({session}: {
  session: SessionType | undefined
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPending, setIsPending ] = useState(false)
const pathname = usePathname();
  const { push } = useRouter();
  const { createError, createSimple } = createToast();
useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}, [pathname]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

 

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Content Generator", href: "/content-generator" },
    { name: "Writing Companion", href: "/writing-companion" },
    { name: "AI Study Tools", href: "/ai-study-tools" },
  ]
  const handleLogout = async () => {
    if (isPending) return;
    try {
      setIsPending(true)
      await signOut();
      createSimple("You have logged out successfully.");
          window.location.href="/login";
    } catch (error) {
      console.error(`Unable to logout: ${error}`);
      createError("There was a problem trying to logout");
    } finally {
      setIsPending(false)
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StudyAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={` hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-blue-500 "
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />

            <div className="hidden lg:flex items-center space-x-2">
              {!session ? (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      Register
                    </Button>
                  </Link>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full max-w-[150px] truncate"
                    >
                      Clinton <ChevronDown />{" "}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuItem onClick={() => push("/settings")}>
                      Settings
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isPending}
                    >
                      Log out
                      {isPending && (
                        <DropdownMenuShortcut>
                          <Loader className="size-3 animate-spin" />
                        </DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 overflow-hidden border-t border-gray-200 dark:border-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block ${
                    pathname === item.href
                      ? "text-blue-500 "
                      : "text-gray-700 dark:text-gray-300"
                  } hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {!session ? (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Register
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start">
                        Settings
                      </Button>
                    </Link>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleLogout}
                      disabled={isPending}
                    >
                      Log out{" "}
                      {isPending && (
                        <Loader className="size-3 animate-spin ml-1" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
