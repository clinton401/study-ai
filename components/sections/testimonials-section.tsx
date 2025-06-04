"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Computer Science Student",
    content: "This platform saved me hours of study time. The AI summaries are incredibly accurate!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Pre-Med Student",
    content: "The quiz generator helped me ace my biology exams. It's like having a personal tutor.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "English Major",
    content: "The writing companion improved my essays significantly. My grades went up by a full letter!",
    rating: 5,
  },
]

export function TestimonialsSection() {
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
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6">What Students Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands of students who are already studying smarter with AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-xl rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
