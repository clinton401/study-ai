import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().transform((email) => email.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z
  .object({
    name: z.string().min(3, { message: "Minimum 3 characters required" })
    .max(25, { message: "Name cannot be longer than 25 characters" }).trim().transform((name) => name.toLowerCase()),
    email: z.string().email("Please enter a valid email address").trim().transform((email) => email.toLowerCase()),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Confirm password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),

  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().transform((email) => email.toLowerCase()),
})

export const verifyEmailSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
})
export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>
