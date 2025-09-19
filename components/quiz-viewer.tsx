"use client";
import { ArrowLeft, CheckCircle} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyExport } from "./copy-exports";
import {FullUserQuestion as QuizSet} from "@/models/user-questions-schema";
import {CollapsibleText} from "@/components/collapsible-text";

// interface Question {
//   id: number;
//   question: string;
//   options: string[];
//   correctAnswer: number;
// }

// interface QuizSet {
//   id: number;
//   originalText: string;
//   count: number;
//   createdAt: string;
//   questions: Question[];
// }

interface QuizViewerProps {
  quizSet: QuizSet;
  onClose: () => void;
}

export function QuizViewer({ quizSet, onClose }: QuizViewerProps) {

  
  const quizContent = quizSet.questions
    .map((question, index) => {
      const optionsText = question.options
        .map(
          (option, optIndex) =>
            `   ${String.fromCharCode(65 + optIndex)}. ${option}${
              optIndex === question.correctAnswer ? " (Correct)" : ""
            }`
        )
        .join("\n");
      return `${index + 1}. ${question.question}\n${optionsText}`;
    })
    .join("\n\n");

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b flex-wrap gap-4 px-6 py-4">
          <div className="flex items-center flex-wrap gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Quiz Set</h1>
              <div className="flex items-center flex-wrap  gap-2 mt-1">
                <Badge className="bg-purple-100 text-purple-800">
                  {quizSet.count} questions
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(quizSet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <CopyExport
              content={quizContent}
              filename={quizSet.originalText.slice(0, 10)}
            />
            {/* <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button> */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Original Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <CollapsibleText
                    text={quizSet.originalText}
                    className="text-muted-foreground"
                  />
                  {/* <p className="text-muted-foreground">
                    {quizSet.originalText}
                  </p> */}
                </CardContent>
              </Card>

              <div className="space-y-6">
                {quizSet.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Question {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted rounded-md">
                        <p className="font-medium">{question.question}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Options:
                        </div>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`flex items-center gap-3 p-3 rounded-md border ${
                              optionIndex === question.correctAnswer
                                ? "bg-green-50 text-primary border-green-200"
                                : "bg-background border-border"
                            }`}
                          >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <span className="flex-1">{option}</span>
                            {optionIndex === question.correctAnswer && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Correct
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
