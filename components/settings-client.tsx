"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, User, Mail, Lock, LogOut, Trash2, Check, Save, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {useRouter} from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  changeEmailSchema,
  changePasswordSchema,
  type ChangeEmailFormData,
  type ChangePasswordFormData,
} from "@/lib/validations/settings";
import { SessionType } from "@/lib/types";
import { deleteAccount } from "@/actions/delete-account";
import { changeEmail } from "@/actions/change-email";
import { updatePassword } from "@/actions/update-password";
import createToast from "@/hooks/create-toast";

import { signOut } from "next-auth/react";

export function SettingsClient({session}:  {session: SessionType}) {
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false)
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState(false)

  const { createError, createSimple } = createToast();
  const {refresh} = useRouter();
  
  const userData = {
    name: session.name,
    email: session.email,
  }

  // Email form
  const emailForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      confirmEmail: "",
    },
  })

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const handleChangeEmail = async (data: ChangeEmailFormData) => {
    setIsEmailLoading(true)
    try {
      const {error} = await changeEmail(data);
      if(error){
        
      emailForm.setError("root", { message: error});
      return;
      }

      setEmailSaveSuccess(true)
      emailForm.reset()
      setTimeout(() => setEmailSaveSuccess(false), 3000)
      refresh();
    } catch (error) {
      console.error("Failed to change email:", error)
      emailForm.setError("root", { message: "Failed to update email. Please try again." })
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsPasswordLoading(true)
    try {
      const {error} = await updatePassword(data);
      if(error){
        
      passwordForm.setError("root", { message: error });
      return;
      }
      setPasswordSaveSuccess(true)
      passwordForm.reset()
      setTimeout(() => setPasswordSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to change password:", error)
      passwordForm.setError("root", { message: "Failed to update password. Please try again." })
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleLogout = async() => {
    if (isLogoutLoading || isDeleteLoading) return;
    try {
      setIsLogoutLoading(true)
      await signOut();
      createSimple("You have logged out successfully.");
          window.location.href="/login";
    } catch (error) {
      console.error(`Unable to logout: ${error}`);
      createError("There was a problem trying to logout");
    } finally {
      setIsLogoutLoading(false)
    }
  }

  const handleDeleteAccount = async() => {
    if (isLogoutLoading || isDeleteLoading) return;
    try {
      setIsDeleteLoading(true)
      const {error} = await deleteAccount();
      if(error)return createError(error);
      await signOut();
      createSimple("Account deleted successfully.");
          window.location.href="/login";
    } catch (error) {
      console.error(`Unable to delete account: ${error}`);
      createError("There was a problem trying to delete account");
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">
                  Settings
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                  Manage your account settings
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Settings Content */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={userData.name}
                      disabled
                      className="rounded-xl bg-gray-50 dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={userData.email}
                      disabled
                      className="rounded-xl bg-gray-50 dark:bg-gray-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Email */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-6 w-6 text-green-600" />
                  <span>Change Email Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...emailForm}>
                  <form
                    onSubmit={emailForm.handleSubmit(handleChangeEmail)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              New Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter new email"
                                className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="confirmEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Confirm New Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Confirm new email"
                                className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {emailForm.formState.errors.root && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {emailForm.formState.errors.root.message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isEmailLoading}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                    >
                      {isEmailLoading ? (
                        "Updating..."
                      ) : emailSaveSuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Email Updated!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Email
                        </>
                      )}
                    </Button>

                    {emailSaveSuccess && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Your email has been successfully updated
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-6 w-6 text-purple-600" />
                  <span>Change Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                    className="space-y-6"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={"password"}
                                placeholder="Enter current password"
                                className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 "
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={"password"}
                                  placeholder="Enter new password"
                                  className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 "
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Confirm New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={"password"}
                                  placeholder="Confirm new password"
                                  className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 "
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {passwordForm.formState.errors.root && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {passwordForm.formState.errors.root.message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isPasswordLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                    >
                      {isPasswordLoading ? (
                        "Updating..."
                      ) : passwordSaveSuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Password Updated!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>

                    {passwordSaveSuccess && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Your password has been successfully updated.
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Logout */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        disabled={isLogoutLoading || isDeleteLoading}
                      >
                        {isLogoutLoading ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4 mr-2" />
                        )}
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to sign out of your account?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLogout}
                          className="rounded-xl"
                          disabled={isLogoutLoading || isDeleteLoading}
                        >
                          Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Delete Account */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200  rounded-xl"
                        disabled={isLogoutLoading || isDeleteLoading}
                      >
                        {isDeleteLoading ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your account? This
                          action cannot be undone and will permanently remove
                          all your data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700 rounded-xl"
                          disabled={isLogoutLoading || isDeleteLoading}
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  );
}
