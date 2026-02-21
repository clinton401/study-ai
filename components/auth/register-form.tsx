"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import createToast from "@/hooks/create-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import Link from "next/link";
import { register } from "@/actions/register";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { LoadingButton } from "../loading-button";
import { Social } from "./social";
import {
  AuthCard,
  AuthDivider,
  InputIcon,
  authInputCn,
  authLabelCn,
} from "./auth-card";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { createError, createSimple } = createToast();
  const { push } = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { error, success, redirect } = await register(data);
      if (error || !redirect || !success)
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      createSimple(success);
      form.reset();
      push(redirect);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      description="Join StudyAI and start studying smarter"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelCn}>Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <InputIcon icon={User} />
                    <Input
                      type="text"
                      placeholder="Your full name"
                      className={authInputCn}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelCn}>Email</FormLabel>
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

          {/* New password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelCn}>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <InputIcon icon={Lock} />
                    <Input
                      type="password"
                      placeholder="Create a password"
                      className={authInputCn}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Confirm password */}
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
                      placeholder="Confirm your password"
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
            message="Create Account"
          />
        </form>
      </Form>

      <AuthDivider />
      <Social isPending={isLoading} />

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
