"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "../loading-button";
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { resetPassword } from "@/actions/reset-password";
import createToast from "@/hooks/create-toast";
import { useRouter } from "next/navigation";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { AuthCard, InputIcon, authInputCn, authLabelCn } from "./auth-card";

export function ResetPasswordForm() {
  const { userId, code } = useParams<{ userId: string; code: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const { createError, createSimple } = createToast();
  const { replace } = useRouter();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      const { error, success } = await resetPassword(data, userId, code);
      if (error || !success)
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      createSimple(success);
      form.reset();
      replace("/login");
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      description="Enter a new password for your account."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelCn}>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <InputIcon icon={Lock} />
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className={authInputCn}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelCn}>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <InputIcon icon={Lock} />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
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
            message="Reset Password"
          />
        </form>
      </Form>
    </AuthCard>
  );
}
