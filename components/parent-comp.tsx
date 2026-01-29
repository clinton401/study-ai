"use client";
import { FC, ReactNode } from "react";
import { SessionType } from "@/lib/types";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Navigation from "@/components/navigation";

export const ParentComp: FC<{
  session: SessionType | undefined;
  children: ReactNode;
}> = ({ session, children }) => {
  const pathname = usePathname();


  const isPublic = pathname === "/" || pathname === "/features";

  const verifyRegex = /^\/verify-email\/([^/]+)$/;
  const resetRegex = /^\/reset-password\/([^/]+)$/;
  
  const isVerifyEmail = verifyRegex.test(pathname);
  const isResetPassword = resetRegex.test(pathname);
  
  const authRoutes = ["/login", "/register", "/error", "/reset", "/forgot-password"];
  
  const isAuthRoute = authRoutes.includes(pathname);
  
  const isMatch = isPublic || isVerifyEmail || isResetPassword || isAuthRoute;
  // const isAuth = 

  return (
    <>
      {isPublic || isMatch ? (
        <>
          <Navigation session={session} />
          {children}
        </>
      ) : (
        <SidebarProvider>
          <AppSidebar session={session} />
          <SidebarInset>
            <DashboardHeader session={session} />
            {children}
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
};
