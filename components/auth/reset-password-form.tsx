"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "../loading-button";
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/validations/auth";
import { resetPassword } from "@/actions/reset-password";
import createToast from "@/hooks/create-toast";
import {useRouter} from "next/navigation";
import { ERROR_MESSAGES } from "@/lib/error-messages";


export function ResetPasswordForm() {
  const { userId, code } = useParams<{ userId: string; code: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const { createError, createSimple } = createToast();
  const { replace } = useRouter();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    
    try {
      setIsLoading(true);
     
      const {error, success} = await resetPassword(data, userId, code);
      if(error || !success) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      createSimple(success);
      form.reset();
      replace("/login")
    } catch (error) {
      console.error("Password reset error:", error);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
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
            Reset Your Password
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter your new password below
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Enter new password"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Confirm your password"
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
                message="Reset Password"
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
