"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import Link from "next/link";
import { sendPasswordResetCode } from "@/actions/send-password-reset-code";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { LoadingButton } from "@/components/loading-button";
import { AuthCard, InputIcon, authInputCn, authLabelCn } from "./auth-card";

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createError } = createToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      const domain = window.location.origin;
      const { error } = await sendPasswordResetCode(data, domain);
      if (error) return createError(error);
      setIsSubmitted(true);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    form.reset();
  };

  if (isSubmitted) {
    return (
      <AuthCard
        icon={CheckCircle}
        iconClassName="bg-green-600"
        title="Check Your Email"
        description="If an account with that email exists, we've sent you a password reset link."
      >
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 px-4 py-3 text-center">
          <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={handleTryAgain}
              className="font-semibold underline underline-offset-2 hover:no-underline"
            >
              try again
            </button>
          </p>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={Mail}
      title="Forgot Password?"
      description="Enter your email and we'll send you a link to reset your password."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelCn}>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <InputIcon icon={Mail} />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className={authInputCn}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
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

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Sign In
      </Link>
    </AuthCard>
  );
}
