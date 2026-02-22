import { LoginForm } from "@/components/auth/login-form";
import getServerUser from "@/hooks/get-server-user";
import type React from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerUser();
  return (
    <>
      {!session && (
          <LoginForm loginPage={false} />
      )}
      <div className={`${!session ? "hidden" : ""}  w-full   h-full `}>
        {children}
      </div>
    </>
  );
}
