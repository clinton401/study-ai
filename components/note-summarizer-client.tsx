"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, Download, Copy, Loader2, BookOpen, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Client Component - handles file upload, state, and interactivity
export function NoteSummarizerClient() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [summaryLength, setSummaryLength] = useState("medium")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // Simulate file reading
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setInputText(text.slice(0, 1000) + "...") // Truncate for demo
      }
      reader.readAsText(file)
    }
  }

  const handleSummarize = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockSummary = `Key Points Summary:

• The main topic discusses the fundamental concepts of artificial intelligence and machine learning
• Important algorithms include neural networks, decision trees, and support vector machines
• Applications span across healthcare, finance, transportation, and education sectors
• Ethical considerations include bias prevention, privacy protection, and transparency in AI systems
• Future developments focus on explainable AI and human-AI collaboration

This summary captures the essential information from your ${uploadedFile?.name || "text"} in a concise format, highlighting the most important concepts and takeaways for effective studying.`

    setSummary(mockSummary)
    setIsLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
  }

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "summary.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl w-fit mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              AI Note Summarizer
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform lengthy notes and PDFs into concise, actionable summaries that capture the key points.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-6 w-6 text-blue-600" />
                    <span>Upload Your Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-gray-500">PDF, TXT, DOC, DOCX (Max 10MB)</p>
                    </label>
                  </div>

                  {/* Text Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Or paste your text directly:
                    </label>
                    <Textarea
                      placeholder="Paste your notes, article, or any text you want to summarize..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[200px] text-base leading-relaxed border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl resize-none"
                    />
                  </div>

                  {/* Summary Options */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary Length:</label>
                      <Select value={summaryLength} onValueChange={setSummaryLength}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (2-3 sentences)</SelectItem>
                          <SelectItem value="medium">Medium (1 paragraph)</SelectItem>
                          <SelectItem value="long">Long (Multiple paragraphs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSummarize}
                      disabled={!inputText.trim() || isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-12"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating Summary...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Output Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-green-600" />
                      <span>AI Summary</span>
                    </div>
                    {summary && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <pre className="whitespace-pre-wrap text-sm text-green-800 dark:text-green-200 font-sans">
                          {summary}
                        </pre>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Summary generated in 2.3 seconds</span>
                        <span>{summary.split(" ").length} words</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Your AI-generated summary will appear here
                      </p>
                      <p className="text-sm text-gray-400">Upload a file or paste text to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
