"use client";

import { FC } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social: FC<{ isPending: boolean }> = ({ isPending }) => {
  const onClick = (provider: "google" | "github") => {
    if (isPending) return;
    signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT });
  };

  return (
    <Button
      disabled={isPending}
      variant="outline"
      className="w-full h-10 rounded-xl gap-2 text-sm"
      onClick={() => onClick("google")}
    >
      <FcGoogle className="h-4 w-4 shrink-0" />
      Continue with Google
    </Button>
  );
};
