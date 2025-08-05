"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of students who are already studying smarter with AI. Start your free trial today!
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className=" px-12 py-6 text-xl rounded-full"
            >
              Sign Up for Free
              <Zap className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
