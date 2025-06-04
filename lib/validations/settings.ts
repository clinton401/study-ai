import { z } from "zod"

export const changeEmailSchema = z
  .object({
    newEmail: z.string().email("Please enter a valid email address").trim().transform((email) => email.toLowerCase()),
    confirmEmail: z.string().email("Please enter a valid email address").trim().transform((email) => email.toLowerCase()),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: "Email addresses don't match",
    path: ["confirmEmail"],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
