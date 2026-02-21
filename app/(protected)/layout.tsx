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
        <div className="pt-4">
          <LoginForm loginPage={false} />
        </div>
      )}
      <div className={`${!session ? "hidden" : ""}  w-full   h-full `}>
        {children}
      </div>
    </>
  );
}
