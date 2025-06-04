"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FeaturesCTASection() {
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
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Start using our AI-powered learning tools today and see the difference they can make in your studies.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-full"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
