"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw, Loader, BookOpen } from "lucide-react";
import { generateFlashcards } from "@/actions/generate-flashcards";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages"

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface FlashcardCarouselProps {
  content: string;
}

export function FlashcardCarousel({
  content,
}: FlashcardCarouselProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flippedCard, setFlippedCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const {createError} = createToast();

 const generateFlashcardsHandler = async () => {
  if(loading) return;
      if(content.length < 200) return createError("Please provide at least 200 characters of text to generate flashcards.");
    try {
      setLoading(true);

      const data = await generateFlashcards(content, 20); 
         if (!data || data.error || !Array.isArray(data.flashcards)) {
        createError(data?.error || "Invalid response format")
        return
      }

      const formattedFlashcards: Flashcard[] = data.flashcards
        .map((fc: Flashcard, idx: number) => {
          if (typeof fc.front !== "string" || typeof fc.back !== "string") {
            createError("Invalid flashcard object")
            return null
          }
          const front = fc.front.trim()
          const back = fc.back.trim()
          if (!front || !back) {
            createError("Flashcard sides cannot be empty")
            return null
          }
          return {
            id: idx + 1,         
            front,
            back,
          }
        })
        .filter(Boolean) as Flashcard[]

      if (formattedFlashcards.length === 0) {
        createError("No valid flashcards returned")
        return
      }

      setFlashcards(formattedFlashcards);
      setCurrentFlashcard(0);
      setFlippedCard(false);
    } catch (err) {
      console.error(`Unable to generate flashcards: ${err}`)
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

   const nextFlashcard = () => {
     setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
     setFlippedCard(false);
   };

   const prevFlashcard = () => {
     setCurrentFlashcard(
       (prev) => (prev - 1 + flashcards.length) % flashcards.length
     );
     setFlippedCard(false);
   };

  // if (!content) return null;

  return (

<Card className="shadow-lg mt-16">
  <CardHeader className="flex flex-row items-center flex-wrap gap-1 justify-between">
    <CardTitle className="text-xl">Flashcards</CardTitle>
    {flashcards.length === 0 && (
      <Button
        onClick={generateFlashcardsHandler}
        variant="outline"
        disabled={loading}
      >
        Generate Flashcards
        {loading && <Loader className="ml-2 h-4 w-4 animate-spin" />}
      </Button>
    )}
  </CardHeader>

  {flashcards.length > 0 ? (
    <CardContent className="space-y-4">
      <div className="relative">
        <div
          className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8 min-h-48 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          onClick={() => setFlippedCard(!flippedCard)}
        >
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground mb-4">
              {flippedCard ? "Answer" : "Question"} • {currentFlashcard + 1} of{" "}
              {flashcards.length}
            </div>
            <p className="text-lg font-medium">
              {flippedCard
                ? flashcards[currentFlashcard]?.back
                : flashcards[currentFlashcard]?.front}
            </p>
            <div className="flex items-center justify-center mt-4">
              <RotateCcw className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Click to flip</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevFlashcard}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex space-x-2">
          {flashcards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentFlashcard ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={nextFlashcard}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  ) : (
    <CardContent className="flex flex-col text-gray-400 items-center justify-center py-12 text-center text-muted-foreground">
      <BookOpen className="h-12 w-12 mb-4" />
      <p className="text-sm ">No flashcards yet. Generate some to get started.</p>
    </CardContent>
  )}
</Card>

  );
}
