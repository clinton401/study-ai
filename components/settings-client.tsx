"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Mail,
  Lock,
  LogOut,
  Trash2,
  Check,
  Save,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/alert-dialog";
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
import { cn } from "@/lib/utils";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-start gap-3 px-4 sm:px-8 py-5 border-b border-border/60">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground mt-0.5">
          <Icon className="h-4 w-4 text-background" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight leading-none">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {/* Section body */}
      <div className="px-4 sm:px-8 py-6">{children}</div>
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        value={value}
        disabled
        className="rounded-xl bg-muted/50 border-border text-sm"
      />
    </div>
  );
}

// ─── Root error ───────────────────────────────────────────────────────────────

function RootError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
      {message}
    </p>
  );
}

// ─── Success note ─────────────────────────────────────────────────────────────

function SuccessNote({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-green-700 dark:text-green-400 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2"
    >
      {message}
    </motion.p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsClient({ session }: { session: SessionType }) {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false);
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState(false);

  const { createError, createSimple } = createToast();
  const { refresh } = useRouter();

  // ── Forms ──────────────────────────────────────────────────────────────────

  const emailForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", confirmEmail: "" },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChangeEmail = async (data: ChangeEmailFormData) => {
    setIsEmailLoading(true);
    try {
      const { error } = await changeEmail(data);
      if (error) { emailForm.setError("root", { message: error }); return; }
      setEmailSaveSuccess(true);
      emailForm.reset();
      setTimeout(() => setEmailSaveSuccess(false), 3000);
      refresh();
    } catch {
      emailForm.setError("root", { message: "Failed to update email. Please try again." });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsPasswordLoading(true);
    try {
      const { error } = await updatePassword(data);
      if (error) { passwordForm.setError("root", { message: error }); return; }
      setPasswordSaveSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSaveSuccess(false), 3000);
    } catch {
      passwordForm.setError("root", { message: "Failed to update password. Please try again." });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLogoutLoading || isDeleteLoading) return;
    try {
      setIsLogoutLoading(true);
      await signOut();
      createSimple("You have been signed out.");
      window.location.href = "/login";
    } catch {
      createError("There was a problem signing out.");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isLogoutLoading || isDeleteLoading) return;
    try {
      setIsDeleteLoading(true);
      const { error } = await deleteAccount();
      if (error) return createError(error);
      await signOut();
      createSimple("Account deleted successfully.");
      window.location.href = "/login";
    } catch {
      createError("There was a problem deleting your account.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const isBusy = isLogoutLoading || isDeleteLoading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Settings className="h-4 w-4 text-background" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none">Settings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your account</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <h2 className="text-4xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-muted-foreground text-lg">
            Update your email, password, and account preferences.
          </p>
        </motion.div>

        {/* ── Account Information ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <Section
            icon={User}
            title="Account Information"
            description="Your current account details — read only."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadonlyField label="Name" value={session.name ?? ""} />
              <ReadonlyField label="Email" value={session.email ?? ""} />
            </div>
          </Section>
        </motion.div>

        {/* ── Change Email ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Section
            icon={Mail}
            title="Change Email Address"
            description="Your new email will be used to sign in going forward."
          >
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(handleChangeEmail)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={emailForm.control}
                    name="newEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          New Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="confirmEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Confirm Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Confirm new email"
                            className="rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <RootError message={emailForm.formState.errors.root?.message} />
                {emailSaveSuccess && <SuccessNote message="Email updated successfully." />}

                <Button
                  type="submit"
                  disabled={isEmailLoading}
                  size="sm"
                  className="rounded-xl gap-1.5"
                >
                  {isEmailLoading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
                  ) : emailSaveSuccess ? (
                    <><Check className="h-3.5 w-3.5" /> Updated</>
                  ) : (
                    <><Save className="h-3.5 w-3.5" /> Update Email</>
                  )}
                </Button>
              </form>
            </Form>
          </Section>
        </motion.div>

        {/* ── Change Password ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
        >
          <Section
            icon={Lock}
            title="Change Password"
            description="Choose a strong password you don't use elsewhere."
          >
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                className="space-y-5"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          className="rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            className="rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            className="rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <RootError message={passwordForm.formState.errors.root?.message} />
                {passwordSaveSuccess && <SuccessNote message="Password updated successfully." />}

                <Button
                  type="submit"
                  disabled={isPasswordLoading}
                  size="sm"
                  className="rounded-xl gap-1.5"
                >
                  {isPasswordLoading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
                  ) : passwordSaveSuccess ? (
                    <><Check className="h-3.5 w-3.5" /> Updated</>
                  ) : (
                    <><Save className="h-3.5 w-3.5" /> Update Password</>
                  )}
                </Button>
              </form>
            </Form>
          </Section>
        </motion.div>

        {/* ── Danger Zone ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <div className="rounded-2xl border border-destructive/30 bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 px-4 sm:px-8 py-5 border-b border-destructive/20 bg-destructive/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive mt-0.5">
                <ShieldAlert className="h-4 w-4 text-destructive-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight leading-none text-destructive">
                  Danger Zone
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  These actions are permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sign out */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isBusy}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-accent hover:border-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {isLogoutLoading
                          ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          : <LogOut className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-none">Sign Out</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          End your current session
                        </p>
                      </div>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be redirected to the login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        disabled={isBusy}
                        className="rounded-xl"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete account */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isBusy}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-destructive/30 px-4 py-3 text-left transition-colors hover:bg-destructive/5 hover:border-destructive/60 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                        {isDeleteLoading
                          ? <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          : <Trash2 className="h-4 w-4 text-destructive" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-none text-destructive">
                          Delete Account
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Permanently remove all your data
                        </p>
                      </div>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">
                        Delete your account?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is permanent and cannot be undone. All your
                        data — including saved content, flashcards, and history —
                        will be deleted immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isBusy}
                        className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}