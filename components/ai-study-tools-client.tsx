"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  Brain,
  BookOpen,
  Sparkles,
  Loader2,
  CheckCircle,
  RotateCcw,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import createToast from "@/hooks/create-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { extractTextFromDocx, extractTextFromTxt } from "@/lib/extract"
import { ERROR_MESSAGES } from "@/lib/error-messages"
import { summarizeText } from "@/actions/summarize-text";
import extractTextFromPDF from "react-pdftotext";
import {validateFileSize} from "@/lib/main";
import { CopyExport } from "./copy-exports";
import {AIDialog} from "@/components/ai-dialog";


export function AIStudyToolsClient() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [inputText, setInputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState("")
  const [summaryLength, setSummaryLength] = useState<"medium" | "short" | "long">("medium")
  const [isExtractPending, setIsExtractPending] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { createError } = createToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  
  const getFileType = (file: File) => {
    

    const nameParts = file.name.split(".");
    const extension = nameParts.length > 1 ? nameParts.pop()!.toLowerCase() : "";
  
    const type = file.type.toLowerCase();
    
  
    if (type.includes("pdf") || extension === "pdf") {
      return "pdf";
    } else if (
      type.includes("wordprocessingml") || extension === "docx"
    ) {
      return "docx";
    } else if (type.includes("text") || extension === "txt") {
      return "txt";
    }
  
    return null;
  };
  
  const extractText = async (file: File): Promise<{
    error: string | null;
    text: string | null
  }> => {
    const fileType = getFileType(file);
    if (!fileType) return { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.', text: null };
    let text: string | null = null;
  
   

    switch (fileType) {
      case "pdf":
        text = await extractTextFromPDF(file);
        break;
      case "docx":
        text = await extractTextFromDocx(file);
        break;
      case "txt":
        text = await extractTextFromTxt(file);
        break;
    }

    if (!text) {
      return { error: "No extractable text found. Is the file scanned or empty?", text: null };
    }

    return { text, error: null };
  };
  
  const handleFileUpload = async(event: React.ChangeEvent<HTMLInputElement>) => {
    if(isExtractPending) return createError("A file is still being extracted");
    const file = event.target.files?.[0];
    if (!file) return;
    const {error} = validateFileSize(file);
    if (error) return createError(error);
      
    try{
      setIsExtractPending(true)
      const {error, text} = await extractText(file);
      if(error || !text) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR)
        setUploadedFile(file);
      setInputText(text) 
    }catch(error) {
      console.error(`Unable to extract text: ${error}`);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }finally {
      setIsExtractPending(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async(e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (isExtractPending) return createError("A file is still being extracted");
    if (!file) return;

    const {error} = validateFileSize(file);
    if(error) return createError(error);
    try {
      setIsExtractPending(true);
     
      const { error, text } = await extractText(file);
      if (error || !text)
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      setUploadedFile(file);
      setInputText(text);
    } catch (error) {
      console.error(`Unable to extract text: ${error}`);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsExtractPending(false);
    }
  }

  const handleGenerateSummary = async () => {

  if(inputText.length < 200) return createError("Text to be summarized must have minimum 200 characters");
    if(inputText.length > 200000) return createError("Text to be summarized must have maximum 200,000 characters");
    try{
      setIsProcessing(true);
      setSummary("");
      const {error, summary} = await summarizeText(inputText, summaryLength);
      if(error || !summary) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      setSummary(summary);

      targetRef.current?.scrollIntoView({ behavior: 'smooth' });
    }catch(error) {
      console.error(`Unable to generate summary: ${error}`);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }finally{
      
    setIsProcessing(false)
    }
  }

 

 

 

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              AI Study Tools
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Summarize your notes and ask AI questions based on the content —
              all from a single upload.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="  backdrop-blur-sm  shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-6 w-6 text-blue-600" />
                  <span>Upload Your Study Material</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    ref={inputRef}
                  />
                  <label className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {uploadedFile ? (
                        <span className="text-green-600 font-medium">
                          ✓ {uploadedFile.name}
                        </span>
                      ) : (
                        "Click to upload or drag and drop"
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOCX, TXT (Max 10MB)
                    </p>
                    {isExtractPending && (
                      <p className="text-sm text-gray-500">
                        Extracting text...
                      </p>
                    )}
                  </label>
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Or paste your text directly:
                  </label>
                  <Textarea
                    placeholder="Paste your notes, textbook content, or any study material here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[300px] text-base leading-relaxed border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl resize-none"
                  />
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="fixed bottom-8 right-4"> */}

                  {/* </div> */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Summary Length:
                    </label>
                    <Select
                      value={summaryLength}
                      onValueChange={(value: "medium" | "short" | "long") =>
                        setSummaryLength(value)
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">
                          Short (Key points)
                        </SelectItem>
                        <SelectItem value="medium">
                          Medium (Detailed)
                        </SelectItem>
                        <SelectItem value="long">
                          Long (Comprehensive)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleGenerateSummary}
                      disabled={
                        !inputText.trim() || isProcessing || isExtractPending
                      }
                      className="w-full   rounded-xl h-10"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4  animate-spin" />
                          {/* Processing... */}
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <Card
            className=" backdrop-blur-sm border-0 shadow-xl rounded-3xl"
            ref={targetRef}
          >
            <CardHeader>
              <div className="flex items-center gap-2 justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span>AI Summary</span>
                </CardTitle>
                <AIDialog text={inputText} />
                {/* {!summary && (
                        <Button
                          onClick={handleGenerateSummary}
                          disabled={!inputText.trim() || isProcessing}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Run AI
                            </>
                          )}
                        </Button>
                      )} */}
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {summary ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center flex-wrap gap-2 justify-between">
                      <div className="flex space-2 flex-wrap ">
                        <CopyExport content={summary} filename="summary" />
                      </div>
                      <Button
                        onClick={() => setSummary("")}
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Generate New
                      </Button>
                    </div>
                    <div className=" w-full  border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <pre className="whitespace-pre-wrap text-sm text-blue-800 dark:text-blue-200 font-sans leading-relaxed">
                        {summary}
                      </pre>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Your AI-generated summary will appear here
                    </p>
                    <p className="text-sm text-gray-400">
                      Upload content and click &quot;Generate&quot; to get
                      started
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <Card className=" border-0 rounded-3xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
                  How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      1. Upload Content
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Upload your PDF, DOCX files or paste text directly
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      2. AI Processing
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Our AI analyzes your content and extracts key information
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      3. Get Results
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Receive summaries instantly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  );
}
