"use client"

import * as React from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { FullUserFlashcard as FlashcardSet } from "@/models/user-flashcards-schema";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyExport } from "./copy-exports";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {CollapsibleText} from "@/components/collapsible-text";

// interface Flashcard {
//   id: number
//   front: string
//   back: string
// }

// interface FlashcardSet {
//   id: number
//   originalText: string
//   count: number
//   createdAt: string
//   flashcards: Flashcard[]
// }

interface FlashcardViewerProps {
  flashcardSet: FlashcardSet
  onClose: () => void
}

export function FlashcardViewer({ flashcardSet, onClose }: FlashcardViewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"study" | "list">("study")

  const currentCard = flashcardSet.flashcards[currentCardIndex]

  const handleNext = () => {
    if (currentCardIndex < flashcardSet.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

 
  const flashcardContent = flashcardSet.flashcards
      .map((card, index) => `${index + 1}. Q: ${card.front}\n   A: ${card.back}`)
      .join("\n\n");

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Flashcard Set</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-100 text-green-800">{flashcardSet.count} cards</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(flashcardSet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <Button
              variant={viewMode === "study" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("study")}
            >
              Study Mode
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              List View
                      </Button> */}
                      <ToggleGroup
  type="single"
  value={viewMode}
  onValueChange={(v) => v && setViewMode(v as "study" | "list")}
  className="rounded-lg border p-1"
>
  <ToggleGroupItem value="study" className="px-3">
    Study Mode
  </ToggleGroupItem>
  <ToggleGroupItem value="list" className="px-3">
    List View
  </ToggleGroupItem>
</ToggleGroup>
                       <CopyExport
              content={flashcardContent}
              filename={flashcardSet.originalText.slice(0, 10)}
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
          {viewMode === "study" ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Card {currentCardIndex + 1} of {flashcardSet.flashcards.length}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setIsFlipped(false)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <Card className="min-h-[300px] cursor-pointer" onClick={handleFlip}>
                  <CardContent className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">{isFlipped ? "Answer" : "Question"}</div>
                      <div className="text-lg font-medium">{isFlipped ? currentCard.back : currentCard.front}</div>
                      {!isFlipped && <div className="text-sm text-muted-foreground mt-4">Click to reveal answer</div>}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between mt-6">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentCardIndex === 0}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {flashcardSet.flashcards.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentCardIndex ? "bg-primary" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentCardIndex === flashcardSet.flashcards.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="max-w-4xl mx-auto p-6">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Original Text</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CollapsibleText text={flashcardSet.originalText} className="text-muted-foreground" />
                    {/* <p className="text-muted-foreground">{flashcardSet.originalText}</p> */}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {flashcardSet.flashcards.map((card, index) => (
                    <Card key={card.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">Card {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Question</div>
                          <div className="p-3 bg-muted rounded-md">{card.front}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Answer</div>
                          <div className="p-3 bg-green-50 text-primary border border-green-200 rounded-md">{card.back}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
