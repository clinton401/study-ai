"use client"

import { motion } from "framer-motion"
import { BookOpen, PenTool, Wand2, CheckCircle, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const features = [
  {
    icon: BookOpen,
    title: "Note Summarizer",
    description: "Transform lengthy notes and PDFs into concise, actionable summaries that capture the key points.",
    benefits: [
      "Upload PDFs, Word docs, or paste text directly",
      "AI identifies and extracts key concepts",
      "Customizable summary length and detail",
      "Highlight important terms and definitions",
    ],
    color: "from-blue-500 to-blue-600",
    href: "/ai-study-tools",
  },
  {
    icon: Wand2,
    title: "Content Generator",
    description:
      "Generate essays, letters, and written content with AI. Choose your type, tone, and length for perfect results.",
    benefits: [
      "Create essays and letters instantly",
      "Multiple tone options (formal, academic, casual, friendly)",
      "Customizable length from 500 to 2000+ words",
      "Copy and export functionality built-in",
    ],
    color: "from-green-500 to-green-600",
    href: "/content-generator",
  },
  {
    icon: PenTool,
    title: "AI Writing Companion",
    description: "Enhance your writing with intelligent suggestions for grammar, style, tone, and clarity.",
    benefits: [
      "Real-time grammar and spell checking",
      "Tone adjustment (formal, casual, academic)",
      "Sentence restructuring and clarity improvements",
      "Plagiarism detection and citation help",
    ],
    color: "from-purple-500 to-purple-600",
    href: "/writing-companion",
  },
]

export function FeaturesDetailSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            viewport={{ once: true }}
            className={`mb-20 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-fit mb-6`}>
                  <feature.icon className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">{feature.title}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{feature.description}</p>
                <ul className="space-y-4 mb-8">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href={feature.href}>
                  <Button
                    size="lg"
                    className={`bg-gradient-to-r ${feature.color} hover:opacity-90 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105`}
                  >
                    Try {feature.title}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div
                      className={`bg-gradient-to-r ${feature.color} h-48 rounded-2xl mb-6 flex items-center justify-center`}
                    >
                      <feature.icon className="h-24 w-24 text-white" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
