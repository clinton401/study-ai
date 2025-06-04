"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {  Mail, Lock, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function LoginForm({loginPage = true}: {loginPage?: boolean}) {
  const [isLoading, setIsLoading] = useState(false);
  const { createError, createSimple } = createToast();
  const { push, refresh } = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });


  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const { error, success, redirect } = await login(data);
      if (error)
        return createError(error);

      createSimple(success || "Login successful");
      form.reset();
      if(loginPage){
      push(redirect || DEFAULT_LOGIN_REDIRECT);
      }else{
        refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

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
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sign in to continue your learning journey
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={"password"}
                          placeholder="Enter your password"
                          className="pl-10  h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end w-full">
                {" "}
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot password?
                </Link>{" "}
              </div>

              <LoadingButton
                isPending={isLoading}
                disabled={isLoading}
                message="Sign In"
              />
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <Social isPending={isLoading} />

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
