"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  icon?: React.ElementType;
  iconClassName?: string;
  title: string;
  description: string | React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared shell for all auth forms.
 * Eliminates the repeated Card + gradient icon + title + description pattern
 * across Login, Register, ForgotPassword, ResetPassword, VerifyEmail, and ErrorPage.
 */
export function AuthCard({
  icon: Icon = GraduationCap,
  iconClassName,
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border py-8 border-border bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center text-center px-8 pt-10 pb-6">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 mb-5 shadow-lg shadow-blue-500/20",
              iconClassName,
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
            {description}
          </p>
        </div>
        {/* Body */}
        <div className="px-8 pb-10 space-y-5">{children}</div>
      </div>
    </motion.div>
  );
}

/** Thin "or continue with" rule used between form and OAuth */
export function AuthDivider({
  label = "Or continue with",
}: {
  label?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 bg-card text-xs text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Icon pinned to the left inside an Input */
export function InputIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <Icon className="absolute left-4  top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
  );
}

/** Consistent input classes for all auth fields */
export const authInputCn =
  "pl-10 h-10 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground";

/** Consistent label classes */
export const authLabelCn =
  "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
