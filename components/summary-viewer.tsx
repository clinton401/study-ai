"use client"

import * as React from "react"
import { ArrowLeft,  FileText  } from 'lucide-react'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FullUserSummary as Summary } from "@/models/user-summary";
import { CopyExport } from "./copy-exports";
import {AIContentDisplay} from "@/components/ai-content-display";
import {AIDialog} from "@/components/ai-dialog";

interface SummaryViewerProps {
  summary: Summary
  onClose: () => void
}





export function SummaryViewer({ summary, onClose }: SummaryViewerProps) {

  const originalContent =
    summary.originalText || "No original content available.";
  const summarizedContent = summary.summary;



  

  const getLengthColor = (length: string) => {
    switch (length) {
      case "short":
        return "bg-yellow-100 text-yellow-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "long":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="fixed inset-0 z-50 mt-0 h-dvh top-0 bg-background">
      <div className="flex h-dvh flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-wrap gap-4  px-6 py-4">
          <div className="flex min-w-[150px]  flex-1 items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex flex-col">
              <h1 className="text-xl font-semibold line-clamp-1 w-full">
                {summary.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getLengthColor(summary.length)}>
                  {summary.length}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(summary.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AIDialog text={summary.originalText} />

            <CopyExport
              content={summary.originalText}
              filename={summary.summary.slice(0, 10)}
            />
            {/* <Button variant="outline" size="sm" onClick={handleCopySummary}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Summary
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSummary}>
              <Download className="h-4 w-4 mr-2" />
              Download Summary
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button> */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="summary" className="h-full flex flex-col">
            <div className="border-b pb-2  flex items-center justify-center px-6">
              <TabsList className="grid w-full  max-w-md grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="original">Original Content</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="summary"
              className="flex-1 overflow-hidden mt-0"
            >
              <ScrollArea className="h-full">
                <div className="max-w-4xl mx-auto p-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Summarized Content
                      </CardTitle>
                      <CardDescription>
                        AI-generated summary of the original document
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="">
                      {/* <div className="prose prose-gray max-w-none">
                        <div className="whitespace-pre-wrap font-serif text-primary-foreground text-base leading-relaxed"> */}
                      <AIContentDisplay content={summarizedContent} />
                      {/* {summarizedContent} */}
                      {/* </div>
                      </div> */}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="original"
              className="flex-1 overflow-hidden mt-0"
            >
              <ScrollArea className="h-full">
                <div className="max-w-4xl mx-auto p-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Original Content
                      </CardTitle>
                      <CardDescription>
                        The complete original document that was summarized
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="">
                      {/* <div className="prose prose-gray max-w-none">
                        <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-muted-foreground"> */}
                      <AIContentDisplay content={originalContent} />
                      {/* {originalContent} */}
                      {/* </div>
                      </div> */}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
