"use client"
import {FC} from 'react'
import {FcGoogle} from "react-icons/fc"
import {Button} from "@/components/ui/button"
import {signIn} from "next-auth/react"
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
export const Social: FC<{isPending: boolean}> = ({isPending}) => {
  const onClick = (provider: "google"|"github") => {
    if(isPending) return

    signIn(provider, {
      callbackUrl:  DEFAULT_LOGIN_REDIRECT
    })

  }
  return (
    <Button
    disabled={isPending}
      variant="outline"
      className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      onClick={() => onClick("google")}
    >
      <FcGoogle className="h-5 aspect-square " />  Google
    </Button>
  );
}
