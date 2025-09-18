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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, MoreHorizontal} from "lucide-react";
import { FullUserFlashcard as FlashcardSet } from "@/models/user-flashcards-schema";
import { handleDownload } from "@/lib/main";

export function FlashcardSetCard({
  flashcardSet,
  onView,
}: {
  flashcardSet: FlashcardSet;
  onView: (summary: FlashcardSet) => void;
}) {


   const downloadHandler = async () => {
     try {
        const flashcardContent = flashcardSet.flashcards
      .map((card, index) => `${index + 1}. Q: ${card.front}\n   A: ${card.back}`)
      .join("\n\n");
       await handleDownload(flashcardContent, flashcardSet.originalText.slice(0, 20));
     } catch (error) {
       console.error(`Failed to download file: ${error}`);
     }
   };


  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">
              Flashcard Set
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {flashcardSet.originalText}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(flashcardSet)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadHandler}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator /> */}
              {/* <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{flashcardSet.count} cards</Badge>
          <Badge className="bg-green-100 text-green-800">Flashcards</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{flashcardSet.count} flashcards</span>
          <span>{new Date(flashcardSet.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
