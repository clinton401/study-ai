"use client"

import { motion } from "framer-motion"
import { Upload, Zap, CheckCircle, ArrowRight } from "lucide-react"

const howItWorks = [
  {
    step: 1,
    title: "Upload Your Content",
    description: "Upload your notes, PDFs, or paste text directly into our platform.",
    icon: Upload,
  },
  {
    step: 2,
    title: "AI Processing",
    description: "Our advanced AI analyzes your content and identifies key information.",
    icon: Zap,
  },
  {
    step: 3,
    title: "Get Results",
    description: "Receive summaries, quizzes, or writing improvements instantly.",
    icon: CheckCircle,
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with our AI tools in just three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center border-2 border-blue-600">
                  <span className="text-sm font-bold text-blue-600">{step.step}</span>
                </div>
                {index < howItWorks.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-16 h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
