"use client";

import { FC, ReactNode } from "react";
import { SessionType } from "@/lib/types";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
// import { Footer } from "@/components/footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Navigation from "@/components/navigation";

const authRoutes = [
  "/login",
  "/register",
  "/error",
  "/reset",
  "/forgot-password",
];
const verifyRegex = /^\/verify-email\/([^/]+)$/;
const resetRegex = /^\/reset-password\/([^/]+)$/;

export const ParentComp: FC<{
  session: SessionType | undefined;
  children: ReactNode;
}> = ({ session, children }) => {
  const pathname = usePathname();

  const isPublic = pathname === "/" || pathname === "/features";
  const isAuthRoute = authRoutes.includes(pathname);
  const isVerifyEmail = verifyRegex.test(pathname);
  const isResetPwd = resetRegex.test(pathname);

  // Public marketing pages + all auth screens get the top nav
  const isNavLayout = isPublic || isAuthRoute || isVerifyEmail || isResetPwd;

  if (isNavLayout) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navigation session={session} />
        <main className="flex-1">{children}</main>
        {/* Footer only on marketing pages, not on auth screens */}
        {/* {isPublic && <Footer />} */}
      </div>
    );
  }

  // Authenticated app shell — sidebar layout
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset>
        <DashboardHeader session={session} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
