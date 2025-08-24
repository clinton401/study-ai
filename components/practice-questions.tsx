"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label";
import {generateQuestions} from "@/actions/generate-questions";
import createToast from "@/hooks/create-toast"
import { ERROR_MESSAGES } from "@/lib/error-messages"
import { Loader, FileQuestion } from "lucide-react";

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  userAnswer?: number
  showAnswer?: boolean
}

interface PracticeQuestionsProps {
  content: string
}

export function PracticeQuestions({ content }: PracticeQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    
    const { createError } = createToast();  
    const targetRef = useRef<HTMLDivElement | null>(null);

  const generateQuestionsHandler = async (text: string, count: number = 20) => {
    if(loading) return;
    if(content.length < 200) return createError("Please provide at least 200 characters of text to generate questions.");
    try {
      setLoading(true);
      setQuestions([])

      const data = await generateQuestions( text, count );

      if (!data || !Array.isArray(data.questions)) {
        createError("Invalid response format");
        return;
      }

      const formattedQuestions: Question[] = data.questions
        .map((q: Question, idx: number) => {
          if (
            typeof q.question !== "string" ||
            !Array.isArray(q.options) ||
            typeof q.correctAnswer !== "number"
          ) {
            createError("Invalid question object");
            return null;
          }

          return {
            id: idx + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
          };
        })
        .filter(Boolean) as Question[];

      setQuestions(formattedQuestions);
      targetRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        console.log(`Unable to generate questions: ${err}`)
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };


  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, userAnswer: answerIndex } : q)))
  }

//   const checkAnswer = (questionId: number) => {
//     setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, showAnswer: true } : q)))
//   }

const checkAllAnswers = () => {
  
      targetRef.current?.scrollIntoView({ behavior: "smooth" });
  setQuestions((prev) =>
    prev.map((q) => ({
      ...q,
      showAnswer: true,
    }))
  );
};

//   if (content.length < 200) return null

  return (
    <Card className="shadow-lg mt-16" ref={targetRef}>
      <CardHeader className="flex flex-row items-center flex-wrap gap-1 justify-between">
        <CardTitle className="text-xl">Practice Questions</CardTitle>
        {questions.length === 0 && (
          <Button
            onClick={() => generateQuestionsHandler(content)}
            variant="outline"
            disabled={loading}
          >
            Generate Questions
            {loading && <Loader className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        )}
      </CardHeader>

      
{questions.length < 1 && (
  <CardContent className="flex flex-col items-center justify-center pb-12 text-gray-400">
    <FileQuestion className="h-12 w-12 mb-4 text-gray-300" />
    <p className="text-center">
      No questions yet. Click &quot;Generate Questions&quot; to create
      practice questions from your content.
    </p>
  </CardContent>
)}

      {questions.length > 0 && (
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium">
                {index + 1}. {question.question}
              </h3>
              <RadioGroup
                value={question.userAnswer?.toString()}
                onValueChange={(value) =>
                  handleAnswerSelect(question.id, Number.parseInt(value))
                }
              >
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={optionIndex.toString()}
                      id={`q${question.id}-${optionIndex}`}
                      disabled={question.showAnswer && question.showAnswer === true}
                    />
                    <Label
                      htmlFor={`q${question.id}-${optionIndex}`}
                      className={`${
                        question.showAnswer
                          ? optionIndex === question.correctAnswer
                            ? "text-green-600 font-medium"
                            : question.userAnswer === optionIndex &&
                              optionIndex !== question.correctAnswer
                            ? "text-red-600"
                            : ""
                          : ""
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {question.showAnswer && (
                <div
                  className={`text-sm p-3 rounded ${
                    question.userAnswer === question.correctAnswer
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {question.userAnswer === question.correctAnswer
                    ? "✓ Correct!"
                    : "✗ Incorrect"}
                  {question.userAnswer !== question.correctAnswer && (
                    <span className="block mt-1">
                      The correct answer is:{" "}
                      {question.options[question.correctAnswer]}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {!questions[0]?.showAnswer && (
            <Button
              onClick={checkAllAnswers}
              variant="default"
              className="w-full"
            >
              Check Answers
            </Button>
          )}

          {questions[0]?.showAnswer && (
            <div className="text-center font-medium text-lg mt-4">
              You got{" "}
              {questions.filter((q) => q.userAnswer === q.correctAnswer).length}{" "}
              out of {questions.length} correct
            </div>
          )}

          <Button
            onClick={() => {
                targetRef.current?.scrollIntoView({ behavior: "smooth" });
                          generateQuestionsHandler(content)

            }}
            variant="outline"
            disabled={loading}
            className="w-full bg-transparent"
          >
            Generate New Questions
            {loading && <Loader className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
 