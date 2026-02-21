"use client";

import { ArrowLeft, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullUserSummary as Summary } from "@/models/user-summary";
import { CopyExport } from "./copy-exports";
import { AIContentDisplay } from "@/components/ai-content-display";
import { AIDialog } from "@/components/ai-dialog";
import { cn } from "@/lib/utils";
import { lengthColor } from "./card-helpers";

interface SummaryViewerProps {
  summary: Summary;
  onClose: () => void;
}

export function SummaryViewer({ summary, onClose }: SummaryViewerProps) {
  return (
    <Tabs
      defaultValue="summary"
      className="fixed bottom-0 left-0 w-full h-dvh z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start sm:flex-row flex-col sm:items-center justify-between flex-wrap gap-3 px-4 sm:px-6 py-4">
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
                {summary.title}
              </h1>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize",
                    lengthColor(summary.length),
                  )}
                >
                  {summary.length}
                </span>

                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(summary.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <AIDialog text={summary.originalText} />
            <CopyExport
              content={summary.summary}
              filename={
                summary.title?.slice(0, 20) || summary.summary.slice(0, 20)
              }
            />
          </div>
        </div>

        {/* Tabs Trigger */}
        <div className="flex justify-center px-6 pb-3">
          <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-xl">
            <TabsTrigger value="summary" className="rounded-lg text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Summary
            </TabsTrigger>

            <TabsTrigger value="original" className="rounded-lg text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Original
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <TabsContent
          value="summary"
          className="h-full data-[state=active]:flex data-[state=active]:flex-col"
        >
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-4 sm:px-10 py-8 prose prose-sm dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/90">
              <AIContentDisplay content={summary.summary} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="original"
          className="h-full data-[state=active]:flex data-[state=active]:flex-col"
        >
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-4 sm:px-10 py-8 prose prose-sm dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/90">
              <AIContentDisplay
                content={
                  summary.originalText || "No original content available."
                }
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
}
