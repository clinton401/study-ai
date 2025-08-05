"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";

export  function SigninErrorPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md mx-auto mt-10"
    >
      <Card className=" backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-500 p-3 rounded-2xl">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
            Sign In Failed
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Something went wrong while trying to sign you in. This could be due to an invalid link or provider issue.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Link href="/login">
            <Button className="w-full h-12 rounded-xl">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
