"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  PenTool,
  FileText,
  Mail,
  Sparkles,
  Loader2,
  Wand2,
  BookOpen,
  Users,
  Briefcase,
  GraduationCap,
  Notebook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CopyExport } from "./copy-exports";
import { generateContent } from "@/actions/generate-content";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import {AIContentDisplay} from "./ai-content-display"

interface ContentOptions {
  type: string;
  tone: string;
  length: string;
  topic: string;
}



export function ContentGeneratorClient() {
  const [options, setOptions] = useState<ContentOptions>({
    type: "",
    tone: "",
    length: "",
    topic: "",
  });
  const [generatedContent, setGeneratedContent] = useState(``);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const targetRef = useRef<HTMLDivElement | null>(null);
  const { createError, createSimple } = createToast();
  const contentTypes = [
    {
      value: "essay",
      label: "Essay",
      icon: FileText,
      description: "Academic or persuasive essays",
    },
    {
      value: "letter",
      label: "Letter",
      icon: Mail,
      description: "Formal or informal letters",
    },
    {
      value: "term-paper",
      label: "Term Paper",
      icon: Notebook,
      description: "Research-based academic paper for a course",
    }
  ];
  
  const toneOptions = [
    {
      value: "formal",
      label: "Formal",
      icon: Briefcase,
      description: "Professional and structured",
    },
    {
      value: "academic",
      label: "Academic",
      icon: GraduationCap,
      description: "Scholarly and research-focused",
    },
    {
      value: "casual",
      label: "Casual",
      icon: Users,
      description: "Relaxed and conversational",
    },
    {
      value: "friendly",
      label: "Friendly",
      icon: Users,
      description: "Warm and approachable",
    },
  ];
  const getLengthOptions = (type: string) => {
    const isTermPaper = type.toLowerCase() === "term-paper";
  
    if (isTermPaper) {
      return [
        { value: "short", label: "Short", description: "1–5 pages" },
        { value: "medium", label: "Medium", description: "6–10 pages" },
        { value: "long", label: "Long", description: "11–15 pages" },
      ];
    }
  
    return [
      { value: "short", label: "Short", description: "500–750 words" },
      { value: "medium", label: "Medium", description: "750–1200 words" },
      { value: "long", label: "Long", description: "1200–2000 words" },
    ];
  };
  const lengthOptions =  getLengthOptions(options.type);
  const handleGenerate = async () => {
    if (
      !options.type ||
      !options.tone ||
      !options.length ||
      !options.topic.trim()
    ) {
      return;
    }
    try {
      setIsGenerating(true);
      setGeneratedContent("");
      const { topic, tone, length, type } = options;
      if(type === "term-paper") {
        createSimple("Generating your term paper. This might take a little while — hang tight!")
      }
      const { content, error } = await generateContent(
        topic,
        type,
        tone,
        length
      );
      if (error || !content)
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      setGeneratedContent(content);
      setWordCount(content.split(" ").length);
      
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(`Unable to generate content: ${error}`);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsGenerating(false);
    }
  };



  const isFormValid =
    options.type && options.tone && options.length && options.topic.trim();

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
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-2xl">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
              AI Content Generator
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Generate essays, letters, and written content with AI. Choose your
              style, tone, and length for perfect results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="h-6 w-6 text-green-600" />
                    <span>Content Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Type Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content Type
                    </Label>
                    <Select
                      value={options.type}
                      onValueChange={(value) =>
                        setOptions({ ...options, type: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Choose what you want to create">
                          {options.type
                            ? contentTypes.find((t) => t.value === options.type)
                                ?.label
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-3">
                              <type.icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500">
                                  {type.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tone Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tone & Style
                    </Label>
                    <Select
                      value={options.tone}
                      onValueChange={(value) =>
                        setOptions({ ...options, tone: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Select the tone for your content">
                          {options.tone
                            ? toneOptions.find((t) => t.value === options.tone)
                                ?.label
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            <div className="flex items-center space-x-3">
                              <tone.icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{tone.label}</div>
                                <div className="text-xs text-gray-500">
                                  {tone.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Length Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content Length
                    </Label>
                    <Select
                      value={options.length}
                      onValueChange={(value) =>
                        setOptions({ ...options, length: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Choose the length of your content">
                          {options.length
                            ? lengthOptions.find(
                                (l) => l.value === options.length
                              )?.label
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {lengthOptions.map((length) => (
                          <SelectItem key={length.value} value={length.value}>
                            <div>
                              <div className="font-medium">{length.label}</div>
                              <div className="text-xs text-gray-500">
                                {length.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Topic or Subject
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      placeholder={
                        options.type === "essay"
                          ? "e.g., The Impact of Technology on Education"
                          : options.type === "letter"
                          ? "e.g., Application for Summer Internship"
                          : options.type.toLowerCase() === "term-paper"
                          ? "e.g., Climate Change Policy Analysis"
                          : "Enter your topic or subject here..."
                      }
                      value={options.topic}
                      onChange={(e) =>
                        setOptions({ ...options, topic: e.target.value })
                      }
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                    />

<p className="text-xs text-gray-500 dark:text-gray-400">
  {options.type === "essay"
    ? "Provide a clear essay topic or thesis statement"
    : options.type === "letter"
    ? "Describe the purpose or main subject of your letter"
    : options.type.toLowerCase() === "term-paper"
    ? "Enter a detailed research topic for your term paper"
    : "Be specific about what you want to write about"}
</p>

                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!isFormValid || isGenerating}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl text-lg font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5  animate-spin" />
                        {/* Generating Content... */}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>

                  {!isFormValid && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                      Please fill in all fields to generate content
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Output Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl"
                ref={targetRef}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 flex-wrap justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <span>Generated Content</span>
                    </CardTitle>
                    {generatedContent && (
                      <div className="flex gap-2 flex-wrap">
                        <CopyExport
                          content={generatedContent}
                          filename="generated-content"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm  text-blue-800 dark:text-blue-200 font-sans leading-relaxed">
                          {/* {generatedContent} */}
                          <AIContentDisplay content={generatedContent} />
                        </pre>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center flex-wrap gap-4 w-full">
                          <span>Words: {wordCount}</span>
                          <span>Type: {options.type}</span>
                          <span>Tone: {options.tone}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PenTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Your AI-generated content will appear here
                      </p>
                      <p className="text-sm text-gray-400">
                        Fill in the options above and click &quot;Generate
                        Content&quot; to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-0 rounded-3xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
                  How Content Generation Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      1. Choose Type
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Select between essay, letter  or term-paper format
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      2. Set Tone
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Pick the style that fits your needs
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      3. Choose Length
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Select short, medium, or long format
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      4. Generate
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Get your custom content instantly
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
