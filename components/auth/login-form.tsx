"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";
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
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import Link from "next/link";
import { LoadingButton } from "../loading-button";
import { login } from "@/actions/login";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Social } from "./social";
import {
  AuthCard,
  AuthDivider,
  InputIcon,
  authInputCn,
  authLabelCn,
} from "./auth-card";

export function LoginForm({ loginPage = true }: { loginPage?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { createError, createSimple } = createToast();
  const { push } = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const { error, success, redirect } = await login(data);
      if (error) return createError(error);
      createSimple(success || "Login successful");
      form.reset();
      if (loginPage) {
        push(redirect || DEFAULT_LOGIN_REDIRECT);
      } else {
        window.location.reload();
      }
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to continue your learning journey"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className={authLabelCn}>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <InputIcon icon={Lock} />
                    <Input
                      type="password"
                      placeholder="Enter your password"
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
            message="Sign In"
          />
        </form>
      </Form>

      <AuthDivider />
      <Social isPending={isLoading} />

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
