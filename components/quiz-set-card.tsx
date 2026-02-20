"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, MoreHorizontal, FileQuestion } from "lucide-react";
import { handleDownload } from "@/lib/main";
import { FullUserQuestion } from "@/models/user-questions-schema";

export function QuizSetCard({
  quizSet,
  onView,
}: {
  quizSet: FullUserQuestion;
  onView: (set: FullUserQuestion) => void;
}) {
  const downloadHandler = async () => {
    try {
      const content = quizSet.questions
        .map((q, i) => {
          const options = q.options
            .map((opt, oi) =>
              `   ${String.fromCharCode(65 + oi)}. ${opt}${oi === q.correctAnswer ? " (Correct)" : ""}`
            )
            .join("\n");
          return `${i + 1}. ${q.question}\n${options}`;
        })
        .join("\n\n");
      await handleDownload(content, quizSet.originalText.slice(0, 20));
    } catch (err) {
      console.error(`Failed to download file: ${err}`);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md hover:border-foreground/20 transition-all duration-200">
      {/* Body */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground">
              <FileQuestion className="h-3 w-3 text-background" />
            </div>
            <p className="text-sm font-bold leading-none tracking-tight">Quiz Set</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
            {quizSet.originalText}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-lg">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => onView(quizSet)}>
              <Eye className="mr-2 h-3.5 w-3.5" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadHandler}>
              <Download className="mr-2 h-3.5 w-3.5" /> Download
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
          {quizSet.count} questions
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(quizSet.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}