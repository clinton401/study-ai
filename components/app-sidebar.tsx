"use client"
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

import { signOut } from "next-auth/react";
import {useState} from "react";
import {
  BookOpen,
  ChevronDown,
  NotebookPen,
  GraduationCap,
  FileText,
  Home,
  LogOut,
  Settings,
  User,
  Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {SessionType} from "@/lib/types";
import {useRouter} from "next/navigation";
import createToast from "@/hooks/create-toast";
export function AppSidebar({session}: {session: SessionType | undefined}) {
  
  const [isPending, setIsPending ] = useState(false)
const pathname = usePathname();
  const { push } = useRouter();
  const { createError, createSimple } = createToast();
    const navigationItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        // isActive: true,
      },
      {
        title: "Content Generator",
        url: "/content-generator",
        icon: FileText,
      },
      {
        title: "Generate Summary",
        url: "/ai-study-tools",
        icon: BookOpen,
      },
      {
        title: "Writing Companion",
        url: "/writing-companion",
        icon: NotebookPen,
      },
      {
        title: "Account Settings",
        url: "/settings",
        icon: Settings,
      },
    ];
    const handleLogout = async () => {
      if (isPending || !session) return;
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
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <GraduationCap className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">StudyAI</span>
                  {/* <span className="text-xs text-muted-foreground">
                    AI Helper
                  </span> */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {session ? (            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User className="size-4" />
                  <span>{session.name}</span>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={() => push("/settings")}>
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}
                disabled={isPending}>
                
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                  {isPending && (
                        <DropdownMenuShortcut>
                          <Loader className="size-3 animate-spin" />
                        </DropdownMenuShortcut>
                      )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>) : (
              <Button asChild className="w-full">
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
  