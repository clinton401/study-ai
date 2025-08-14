import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Loader, Download, Trash2 } from "lucide-react";
import { FullTermPaper as TermPaper } from "@/models/term-paper";
import { handleDownload } from "@/lib/main";
import { deleteContent } from "@/actions/delete-content";
import {useState} from "react";
import { useQueryClient } from "@tanstack/react-query";
import createToast from "@/hooks/create-toast";
import {useRouter} from "next/navigation";

// type TermPaper = {
//   id: number;
//     topic: string;
//     type: string;
//     tone: string;
//     length: string;
//     wordCount: number;
//     createdAt: string;
//     preview: string;
// };

export function TermPaperCard({
  paper,
  onView,
  sort = "",
  type = ""
}: {
  paper: TermPaper;
  onView: (paper: TermPaper) => void;
  sort?: string;
  type?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { createError, createSimple } = createToast();
const {refresh} = useRouter();
  const handleDelete = async () => {
    if (isDeleting) return;
    try {
       setIsDeleting(true);
      const {error} = await deleteContent(paper._id);
      if(error) return createError(error)
      // queryClient.invalidateQueries(["stats-content"]);
      await Promise.all([
        queryClient.invalidateQueries(
          {
            queryKey: ["stats-content"],
            exact: true,
            refetchType: "active",
          },
          {
            throwOnError: true,
            cancelRefetch: true,
          }
        ),
        queryClient.invalidateQueries(
          {
            queryKey: ["contents", sort, type],
            exact: true,
            refetchType: "active",
          },
          {
            throwOnError: true,
            cancelRefetch: true,
          }
        ),
      ]);
      refresh();
      createSimple("Content deleted successfully");
    } catch (error) {
      console.error(`Unable to delete content: ${error}`);
      createError("Unable to delete content");
    } finally {
      setIsDeleting(false);
    }
  };

  
  const getToneColor = (tone: string) => {
    switch (tone) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "formal":
        return "bg-purple-100 text-purple-800";
      case "casual":
        return "bg-green-100 text-green-800";
      case "friendly":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLengthColor = (length: string) => {
    switch (length) {
      case "short":
        return "bg-yellow-100 text-yellow-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "long":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

   const downloadHandler = async () => {
        try {
            await handleDownload(paper.content, paper.topic.slice(0, 20));
        }catch(error){
          console.error(`Failed to download file: ${error}`)
        }
    }

  
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-1 w-full justify-between">
          <div className="space-y-1 overflow-hiden w-[80%]">
            <CardTitle className="text-lg line-clamp-2">
              {paper.topic}
            </CardTitle>
            <CardDescription className="line-clamp-2 overflow-hidden ">
              {paper.content}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(paper)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={downloadHandler}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" disabled={isDeleting} onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete

                {isDeleting && <Loader className="size-4 animate-spin ml-2" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="capitalize">
            {paper.type.replace("-", " ")}
          </Badge>
          <Badge className={getToneColor(paper.tone)}>{paper.tone}</Badge>
          <Badge className={getLengthColor(paper.length)}>{paper.length}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{paper.wordCount} words</span>
          <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

