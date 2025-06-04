"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  PenTool,
  CheckCircle,
  RefreshCw,
  Volume2,
  Wand2,
  BookOpen,
  Users,
  Briefcase, Pause, StopCircle, Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rephraseText } from "@/actions/rephrase-text";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { fixGrammar } from "@/actions/fix-grammar";
import { CopyExport } from "./copy-exports"

const toneOptions = [
  { value: "formal", label: "Formal", icon: Briefcase },
  { value: "friendly", label: "Friendly", icon: Users },
  { value: "academic", label: "Academic", icon: BookOpen },
  { value: "casual", label: "Casual", icon: Users },
]

export function WritingCompanionClient() {
  const [text, setText] = useState("")
  const [selectedTone, setSelectedTone] = useState<"formal" | "friendly" | "academic" | "casual">("formal")
  const [wordCount, setWordCount] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false);
  const [previousText, setPreviousText] = useState(""); 
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { createError, createSimple } = createToast();

  const handleTextChange = (value: string) => {
    setText(value)
    setWordCount(
      value
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length,
    )
  }

  const handleFixGrammar = async () => {
   
    if (text.trim().length < 50) {
      return createError(
        "Please enter more text to fixed (at least 50 characters)."
      );
    }

    if (text.length > 50_000)
      return createError(
        "Text to be fixed must have maximum 50,000 characters"
      );

    // setIsProcessing(true)
    // // Simulate AI processing
    // await new Promise((resolve) => setTimeout(resolve, 1500))

    // setSuggestions([
    //   'Consider changing "there" to "their" in line 2',
    //   'Add a comma after "However" in line 5',
    //   'The sentence starting with "Because" is a fragment',
    //   'Consider using "Furthermore" instead of "Also" for better flow',
    // ])
    try{
      setIsProcessing(true);
      setSuggestions([]);
      const {grammarFixes, error} = await fixGrammar(text);
      if (error) return createError(error);
      if (grammarFixes.length < 1) return createSimple("Looks good! No grammar errors detected.");
      setSuggestions(grammarFixes)

      createSimple("Here are some grammar fixes you can review.");
      
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });

      
    }catch(error){
      console.error(`Error generating grammer fixes: ${error}`);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }finally{
      setIsProcessing(false);

    }
  }

  const handleRephrase = async () => {
   
    if (text.trim().length < 100) {
      return createError("Please enter more text to rephrase (at least 100 characters).");
  }

  if (text.length > 50000) return createError("Text to be rephrased must have maximum 50,000 characters");

  

    try{
      
      setIsRephrasing(true);
      setPreviousText(text);
    const {error, rephrase} = await rephraseText(text, selectedTone);
    if(error || !rephrase) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);

      setText(rephrase);
      setShowConfirmButtons(true);

    }catch(error){
      console.error(`Error rephrasing text: ${error}`);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }finally {

      setIsRephrasing(false)
    }
  }

 

 

  const handlePlay = () => {
    if (!("speechSynthesis" in window)) return;

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    if (isSpeaking) return; // already playing

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      speechSynthesis.pause();
      setIsPaused(true);
      // setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };
  
  const handleAccept = () => {
    setPreviousText("");
    setShowConfirmButtons(false);
  };
  
  const handleReject = () => {
    setText(previousText); 
    setPreviousText("");
    setShowConfirmButtons(false);
  };
  

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
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-2xl w-fit mx-auto mb-6">
              <PenTool className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
              AI Writing Companion
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Enhance your writing with intelligent suggestions for grammar,
              style, tone, and clarity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Writing Interface */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PenTool className="h-6 w-6 text-green-600" />
                      <span>Your Writing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Start writing your text here... Our AI will help you improve it as you type."
                      value={text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="min-h-[400px] text-lg leading-relaxed border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 rounded-xl resize-none"
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleFixGrammar}
                        disabled={!text.trim() || isProcessing || isRephrasing}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isProcessing ? "Checking..." : "Fix Grammar"}
                      </Button>

                      <Select
                        value={selectedTone}
                        onValueChange={(
                          value: "formal" | "friendly" | "academic" | "casual"
                        ) => setSelectedTone(value)}
                      >
                        <SelectTrigger className="w-40 rounded-xl">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {toneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <option.icon className="h-4 w-4" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {showConfirmButtons ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAccept}
                            variant="outline"
                            className="rounded-xl border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={handleReject}
                            variant="outline"
                            className="rounded-xl border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleRephrase}
                          disabled={
                            !text.trim() || isRephrasing || isProcessing
                          }
                          variant="outline"
                          className="rounded-xl border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {isRephrasing ? "Rephrasing..." : "Rephrase"}
                        </Button>
                      )}

                      {!isSpeaking ? (
                        <Button
                          onClick={handlePlay}
                          disabled={!text.trim()}
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          Listen
                        </Button>
                      ) : (
                        <>
                          {isPaused ? (
                            <Button
                              onClick={handlePlay}
                              variant="outline"
                              className="rounded-xl"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
                          ) : (
                            <Button
                              onClick={handlePause}
                              variant="outline"
                              className="rounded-xl"
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          <Button
                            onClick={handleStop}
                            variant="destructive"
                            className="rounded-xl"
                          >
                            <StopCircle className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        </>
                      )}

                      <CopyExport content={text} filename="writing-companion" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Writing Stats */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Writing Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Words
                      </span>
                      <span className="font-semibold text-green-600">
                        {wordCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Characters
                      </span>
                      <span className="font-semibold text-green-600">
                        {text.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Reading Time
                      </span>
                      <span className="font-semibold text-green-600">
                        {Math.ceil(wordCount / 200)} min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Grade Level
                      </span>
                      <span className="font-semibold text-green-600">
                        College
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Suggestions */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl" ref={targetRef}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                      <span className="text-lg">AI Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {suggestions.length > 0 ? (
                      <div className="space-y-3" >
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
                          >
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              {suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Start writing to get AI-powered suggestions for
                          improving your text.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
