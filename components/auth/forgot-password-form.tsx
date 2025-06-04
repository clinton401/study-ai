"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, GraduationCap } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import Link from "next/link";
import { sendPasswordResetCode } from "@/actions/send-password-reset-code";
import createToast from "@/hooks/create-toast"
import { ERROR_MESSAGES } from "@/lib/error-messages";
import {LoadingButton} from "@/components/loading-button"

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { createError } = createToast();
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    
    try {
      setIsLoading(true);
      const domain = window.location.origin;
      const { error } = await sendPasswordResetCode(data, domain);
      if(error) return createError(error)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Forgot password error:", error);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setIsSubmitted(false)
    form.reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md"
    >
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isSubmitted ? "Check Your Email" : "Forgot Password?"}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isSubmitted
              ? "We've sent a password reset link to your email address"
              : "Enter your email address and we'll send you a link to reset your password"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

           
                 <LoadingButton
                isPending={isLoading}
                disabled={isLoading}
                message="Send Reset Link"
              />
              </form>
            </Form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-green-800 dark:text-green-200">
                  If an account with that email exists, we've sent you a password reset link.
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={handleTryAgain}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
