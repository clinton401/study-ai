"use client"
import {
    SidebarTrigger,
  } from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {ModeToggle} from "@/components/mode-toggle"
import {usePathname} from "next/navigation";
import { SessionType } from "@/lib/types";
import {Button} from "@/components/ui/button";
import Link from "next/link";
export function DashboardHeader({session}: {session: SessionType | undefined}) {
  const pathname = usePathname();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 sticky z-20 backdrop-blur-sm  mb-4  top-0 w-full left-0 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center  justify-between">
        <div className="grow">
          {pathname === "/dashboard" && (
            <>
              <h1 className="text-lg font-semibold w-full ">Dashboard</h1>
              <p className="text-sm text-muted-foreground w-full truncate">
                Welcome back, {session && session.name.trim().split(/\s+/)[0]}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {session ? (
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
              <AvatarFallback>{session.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          ) : (
          <Button asChild >
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}