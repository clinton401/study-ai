"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthCard } from "./auth-card";

export function SigninErrorPage() {
  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <AuthCard
        icon={AlertTriangle}
        iconClassName="bg-destructive"
        title="Sign In Failed"
        description="Something went wrong while trying to sign you in. This could be due to an invalid link or a provider issue."
      >
        <Button asChild className="w-full h-10 rounded-xl text-sm">
          <Link href="/login">Back to Login</Link>
        </Button>
      </AuthCard>
    </div>
  );
}
