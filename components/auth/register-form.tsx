"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {  Mail, Lock, User, GraduationCap } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation";
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import createToast from "@/hooks/create-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import Link from "next/link";
import { register } from "@/actions/register"
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { LoadingButton } from "../loading-button";
import { Social } from "./social";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { createError, createSimple } = createToast();
  const {push} = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      
      const result = await register(data);
      const { error, success, redirect } = result;
      if (error || !redirect || !success) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);

      createSimple(success);
      form.reset();
      push(redirect);
    } catch (error) {
      console.error("Registration error:", error);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md"
    >
      <Card className=" backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold ">
            Join StudyAI
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create your account and start studying smarter</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300"> Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter your  name"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</FormLabel>
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
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={ "password"}
                          placeholder="Create a password"
                          className="pl-10  h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
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
                          type={"password"}
                          placeholder="Confirm your password"
                          className="pl-10  h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                          {...field}
                        />
                      
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            

                            <LoadingButton isPending={isLoading} disabled={isLoading}  message="Create Account"/>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
            </div>
          </div>
          <Social isPending={isLoading} />

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
