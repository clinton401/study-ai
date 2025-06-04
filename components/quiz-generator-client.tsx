"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Upload, Play, CheckCircle, X, RotateCcw, Trophy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// Client Component - handles quiz generation, state, and interactivity
export function QuizGeneratorClient() {
  const [inputText, setInputText] = useState("")
  const [quizSettings, setQuizSettings] = useState({
    questionCount: "5",
    difficulty: "medium",
    questionType: "multiple-choice",
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  const mockQuestions: Question[] = [
    {
      id: 1,
      question: "What is the primary function of artificial neural networks?",
      options: [
        "To store data efficiently",
        "To mimic human brain processing",
        "To create user interfaces",
        "To manage databases",
      ],
      correctAnswer: 1,
      explanation:
        "Artificial neural networks are designed to mimic the way human brains process information, using interconnected nodes to learn patterns and make decisions.",
    },
    {
      id: 2,
      question: "Which algorithm is commonly used for supervised learning?",
      options: ["K-means clustering", "Linear regression", "DBSCAN", "Apriori algorithm"],
      correctAnswer: 1,
      explanation:
        "Linear regression is a fundamental supervised learning algorithm used to predict continuous values based on input features.",
    },
    {
      id: 3,
      question: "What does 'overfitting' mean in machine learning?",
      options: [
        "The model performs well on training data but poorly on new data",
        "The model is too simple to capture patterns",
        "The model processes data too quickly",
        "The model uses too much memory",
      ],
      correctAnswer: 0,
      explanation:
        "Overfitting occurs when a model learns the training data too well, including noise and irrelevant patterns, leading to poor performance on new, unseen data.",
    },
  ]

  const handleGenerateQuiz = async () => {
    if (!inputText.trim()) return

    setIsGenerating(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setQuestions(mockQuestions.slice(0, Number.parseInt(quizSettings.questionCount)))
    setIsGenerating(false)
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResults(false)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleRestartQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResults(false)
  }

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correctAnswer ? 1 : 0)
    }, 0)
  }

  const getScorePercentage = () => {
    return Math.round((calculateScore() / questions.length) * 100)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl w-fit mx-auto mb-6">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              AI Quiz Generator
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create custom quizzes from your study materials. Test your knowledge with AI-generated questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {!quizStarted && !showResults ? (
            /* Quiz Setup */
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
                      <Upload className="h-6 w-6 text-purple-600" />
                      <span>Study Material</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Paste your study content:
                      </label>
                      <Textarea
                        placeholder="Paste your notes, textbook content, or any material you want to create a quiz from..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[300px] text-base leading-relaxed border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Settings Section */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-6 w-6 text-purple-600" />
                      <span>Quiz Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Number of Questions:
                        </label>
                        <Select
                          value={quizSettings.questionCount}
                          onValueChange={(value) => setQuizSettings((prev) => ({ ...prev, questionCount: value }))}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Questions</SelectItem>
                            <SelectItem value="5">5 Questions</SelectItem>
                            <SelectItem value="10">10 Questions</SelectItem>
                            <SelectItem value="15">15 Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Difficulty Level:
                        </label>
                        <Select
                          value={quizSettings.difficulty}
                          onValueChange={(value) => setQuizSettings((prev) => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Type:</label>
                        <Select
                          value={quizSettings.questionType}
                          onValueChange={(value) => setQuizSettings((prev) => ({ ...prev, questionType: value }))}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="true-false">True/False</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={!inputText.trim() || isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl h-12"
                    >
                      {isGenerating ? (
                        <>
                          <Brain className="h-5 w-5 mr-2 animate-pulse" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 mr-2" />
                          Generate Quiz
                        </>
                      )}
                    </Button>

                    {questions.length > 0 && (
                      <Button
                        onClick={handleStartQuiz}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Quiz ({questions.length} Questions)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : showResults ? (
            /* Quiz Results */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardHeader className="text-center">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl w-fit mx-auto mb-4">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600 mb-2">{getScorePercentage()}%</div>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      You scored {calculateScore()} out of {questions.length} questions correctly
                    </p>
                  </div>

                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          {selectedAnswers[index] === question.correctAnswer ? (
                            <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                          ) : (
                            <X className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                              {index + 1}. {question.question}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <span className="font-medium">Correct answer:</span>{" "}
                              {question.options[question.correctAnswer]}
                            </p>
                            {selectedAnswers[index] !== question.correctAnswer && (
                              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                                <span className="font-medium">Your answer:</span>{" "}
                                {question.options[selectedAnswers[index]]}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button onClick={handleRestartQuiz} variant="outline" className="rounded-xl">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => setQuestions([])}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate New Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Quiz Taking Interface */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-6 w-6 text-purple-600" />
                      <span>
                        Question {currentQuestion + 1} of {questions.length}
                      </span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>No time limit</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions[currentQuestion] && (
                    <>
                      <div>
                        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-6">
                          {questions[currentQuestion].question}
                        </h3>

                        <RadioGroup
                          value={selectedAnswers[currentQuestion]?.toString()}
                          onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                          className="space-y-3"
                        >
                          {questions[currentQuestion].options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                          disabled={currentQuestion === 0}
                          className="rounded-xl"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextQuestion}
                          disabled={selectedAnswers[currentQuestion] === undefined}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                          {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
