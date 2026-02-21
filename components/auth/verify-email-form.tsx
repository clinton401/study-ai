"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from "@/lib/validations/auth";
import Link from "next/link";
import useCountdown, { COUNTDOWN_DURATION } from "@/hooks/use-countdown";
import { useParams } from "next/navigation";
import { sendVerificationCode } from "@/actions/send-verification-code";
import { verifyEmail } from "@/actions/verify-email";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { LoadingButton } from "@/components/loading-button";
import { RegenerateButton } from "../regenerate-button";
import { AuthCard, authLabelCn } from "./auth-card";
import { motion } from "framer-motion";

export function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { id } = useParams();
  const {
    isNewClicked: isResendClicked,
    setIsNewClicked: setIsResendClicked,
    countdown,
  } = useCountdown();
  const { createError, createSimple } = createToast();

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  const resolveUserId = (): string | null => {
    const raw = Array.isArray(id) ? id[0] : id;
    return raw && typeof raw === "string" ? raw : null;
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    const userId = resolveUserId();
    if (!userId) return createError("Invalid User ID");
    try {
      setIsLoading(true);
      const { error } = await verifyEmail(userId, data);
      if (error) return createError(error);
      setIsVerified(true);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown < COUNTDOWN_DURATION)
      return createError("Please wait before requesting a new code.");
    const userId = resolveUserId();
    if (!userId) return createError("Invalid User ID");
    try {
      setResendLoading(true);
      setIsResendClicked(false);
      const { error, success } = await sendVerificationCode(userId);
      if (error || !success)
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      createSimple(success);
      setIsResendClicked(true);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setResendLoading(false);
    }
  };

  // ── Verified state ─────────────────────────────────────────────────────────

  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="flex flex-col items-center text-center px-8 pt-10 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 mb-5">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">
              Email Verified!
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
              Your account is now active. You can sign in and start using
              StudyAI.
            </p>
          </div>
          <div className="px-8 pb-10 space-y-4">
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 px-4 py-4 text-center space-y-1">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                Welcome to StudyAI!
              </p>
              <p className="text-xs text-muted-foreground">
                Explore AI-powered flashcards, summaries, and writing tools.
              </p>
            </div>
            <Button asChild className="w-full h-10 rounded-xl text-sm">
              <Link href="/login">Continue to Sign In</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Default state ──────────────────────────────────────────────────────────

  return (
    <AuthCard
      icon={Mail}
      title="Verify Your Email"
      description="Enter the 6-digit code we sent to your email address."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className={`${authLabelCn} block text-center`}>
                  Verification Code
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="rounded-xl" />
                        <InputOTPSlot index={1} className="rounded-xl" />
                        <InputOTPSlot index={2} className="rounded-xl" />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className="rounded-xl" />
                        <InputOTPSlot index={4} className="rounded-xl" />
                        <InputOTPSlot index={5} className="rounded-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <p className="text-center text-xs text-muted-foreground">
                  Please enter the 6-digit code sent to your email.
                </p>
                <FormMessage className="text-xs text-center" />
              </FormItem>
            )}
          />

          <LoadingButton
            isPending={isLoading}
            disabled={
              isLoading || form.watch("otp").length !== 6 || resendLoading
            }
            message="Verify Email"
          />
        </form>
      </Form>

      {/* Resend */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground text-center">
          Didn&apos;t receive the code? Check your spam folder or
        </p>
        <RegenerateButton
          isPending={resendLoading}
          disabled={isLoading || resendLoading}
          isResendClicked={isResendClicked}
          resendCode={handleResendOTP}
          countdown={countdown}
        />
      </div>

      <div className="pt-1 border-t border-border/60 text-center">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthCard>
  );
}
