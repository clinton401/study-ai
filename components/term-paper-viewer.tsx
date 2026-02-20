"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FullTermPaper as TermPaper } from "@/models/term-paper";
import { CopyExport } from "./copy-exports";
import { AIContentDisplay } from "@/components/ai-content-display";
import { EditContentModal } from "@/components/edit-content-modal";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toneColor, lengthColor } from "./card-helpers";

interface TermPaperViewerProps {
  paper: TermPaper;
  onClose: () => void;
  sort?: string;
  type?: string;
  handleEditedContent?: (content: string) => void;
}

export function TermPaperViewer({
  paper,
  onClose,
  sort = "",
  type = "",
  handleEditedContent,
}: TermPaperViewerProps) {
  const queryClient = useQueryClient();

  const invalidateQuery = async (content: string) => {
    await Promise.all([
      queryClient.invalidateQueries(
        { queryKey: ["stats-content"], exact: true, refetchType: "active" },
        { throwOnError: true, cancelRefetch: true }
      ),
      queryClient.invalidateQueries(
        { queryKey: ["contents", sort, type], exact: true, refetchType: "active" },
        { throwOnError: true, cancelRefetch: true }
      ),
    ]);
    handleEditedContent?.(content);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-dvh z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
          {/* Left: back + title + badges */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight leading-tight line-clamp-1">
                {paper.topic}
              </h1>
              <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border capitalize">
                  {paper.type.replace("-", " ")}
                </span>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", toneColor(paper.tone))}>
                  {paper.tone}
                </span>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", lengthColor(paper.length))}>
                  {paper.length}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {paper.wordCount.toLocaleString()} words
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(paper.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <EditContentModal
              content={paper.content}
              invalidateQuery={invalidateQuery}
              id={paper._id.toString()}
            />
            <CopyExport content={paper.content} filename={paper.topic.slice(0, 20)} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 sm:px-10 py-8 prose prose-sm dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/90">
            <AIContentDisplay content={paper.content} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}