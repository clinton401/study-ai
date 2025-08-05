"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, PenTool, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { useRouter } from "next/navigation";

// Client Component - handles animations and interactivity
export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold  mb-6">
            Study Smarter with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A one-stop learning assistant for students: summarize notes,
            generate essays and letters, and improve writing instantly with AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/content-generator">
              <Button
                size="lg"
                className=" text-white px-8 py-4 text-lg rounded-full"
              >
                Explore Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {/* <Link href="/features">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-full border-2">
                Try Demo
              </Button>
            </Link> */}
          </div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <div className=" rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 *:cursor-pointer md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                  onClick={() => push("/content-generator")}
                >
                  <Wand2 className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Content Generator
                  </h3>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                  onClick={() => push("/writing-companion")}
                >
                  <PenTool className="h-12 w-12 text-purple-600 mb-4" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Writing Help
                  </h3>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                  onClick={() => push("/ai-study-tools")}
                >
                  <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Smart Summaries
                  </h3>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
