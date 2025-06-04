"use client"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordClientPage() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <ForgotPasswordForm />
      </motion.div>
     
    </>
  );
}
