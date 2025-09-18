"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { handleDownload } from "@/lib/main";
import {FullUserQuestion} from "@/models/user-questions-schema";

export function QuizSetCard({ quizSet, onView }: { quizSet: FullUserQuestion; onView: (summary: FullUserQuestion) => void }) {

   const downloadHandler = async () => {
     try {
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
       await handleDownload(quizContent, quizSet.originalText.slice(0, 20));
     } catch (error) {
       console.error(`Failed to download file: ${error}`);
     }
   };
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">Quiz Set</CardTitle>
            <CardDescription className="line-clamp-2">{quizSet.originalText}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(quizSet)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadHandler}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{quizSet.count} questions</Badge>
          <Badge className="bg-purple-100 text-purple-800">Quiz</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{quizSet.count} questions</span>
          <span>{new Date(quizSet.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
