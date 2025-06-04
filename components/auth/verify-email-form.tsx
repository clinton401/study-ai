"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator  } from "@/components/ui/input-otp"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { verifyEmailSchema, type VerifyEmailFormData } from "@/lib/validations/auth"
import Link from "next/link";
import useCountdown, {COUNTDOWN_DURATION} from "@/hooks/use-countdown";
import {useParams} from "next/navigation";
import { sendVerificationCode } from "@/actions/send-verification-code";
import { verifyEmail } from "@/actions/verify-email";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { LoadingButton } from "@/components/loading-button";
import { RegenerateButton } from "../regenerate-button"

export function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false);
  const {id} = useParams();
  const  { isNewClicked: isResendClicked, setIsNewClicked: setIsResendClicked, countdown } = useCountdown();
  const { createError, createSimple } = createToast();
  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  })

  const onSubmit = async (data: VerifyEmailFormData) => {
    const userId = Array.isArray(id) ? id[0] : id;
    if(!userId || typeof userId !== "string" ) return createError("Invalid User ID");
    
    try {
      setIsLoading(true);
      const {error} = await verifyEmail(userId, data);
      if(error) return createError(error);
      
      setIsVerified(true)
    } catch (error) {
      console.error("Verification error:", error)
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
if (countdown < COUNTDOWN_DURATION)
  return createError("Please wait before requesting a new code.");
    const userId = Array.isArray(id) ? id[0] : id;
    if (!userId || typeof userId !== "string")
      return createError("Invalid User ID");
    
    try {
      setResendLoading(true);
      setIsResendClicked(false);
     
      const {error, success} = await sendVerificationCode(userId);
      if(error || !success) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      createSimple(success);
      
      setIsResendClicked(true);
    } catch (error) {
      console.error("Resend error:", error);
       createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setResendLoading(false)
    }
  }

  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Email Verified!
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Your account has been successfully verified. You can now access all StudyAI features.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Welcome to StudyAI!</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your account is now active and ready to use. Start exploring our AI-powered learning tools.
              </p>
            </div>

            <Button
              asChild
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-medium"
            >
              <Link href="/login">Continue to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
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
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Verify Your Email
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter the 6-digit code we sent to your email address
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center block">
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400" index={0} />
                            <InputOTPSlot className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400" index={1} />
                            <InputOTPSlot className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400" index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400" index={3} />
                            <InputOTPSlot className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400" index={4} />
                            <InputOTPSlot className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400" index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormDescription className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Please enter the 6-digit code sent to your email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <Button
                type="submit"
                disabled={isLoading || form.watch("otp").length !== 6}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-medium"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button> */}
               <LoadingButton isPending={isLoading} disabled={isLoading || form.watch("otp").length !== 6 || resendLoading}  message="Verify Email "/>
            </form>
          </Form>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Didn&apos;t receive the code? Check your spam folder or
            </p>

            {/* <Button
              onClick={handleResendOTP}
              disabled={resendLoading}
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </Button> */}
            <RegenerateButton isPending={resendLoading} disabled={isLoading || resendLoading} isResendClicked={isResendClicked} resendCode={handleResendOTP} countdown={countdown} />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Need help?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
