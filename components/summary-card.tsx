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
import { Download, Eye, MoreHorizontal, Trash2, Loader } from "lucide-react";
import  { FullUserSummary as Summary } from "@/models/user-summary";
import { deleteSummary} from "@/actions/delete-summary";
import {useState} from "react";
import { useQueryClient } from "@tanstack/react-query";
import createToast from "@/hooks/create-toast";
import {useRouter} from "next/navigation";

// type Summary = {
//   id: number;
//   title: string;
//   length: string;
//   createdAt: string;
//   preview: string;
// };

export function SummaryCard({
  summary,
  onView,
  sort = ""
}: {
  summary: Summary;
  onView: (summary: Summary) => void;
  sort?: string;
}) {

  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient();
  const { createError, createSimple } = createToast();
const {refresh} = useRouter();
  const handleDelete = async () => {
    if (isDeleting) return;
    try {
       setIsDeleting(true);
      const {error} = await deleteSummary(summary._id);
      if(error) return createError(error)
      // queryClient.invalidateQueries(["stats-content"]);
      await Promise.all([
        queryClient.invalidateQueries(
          {
            queryKey: ["stats-summary"],
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
            queryKey: ["summaries", sort],
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">
              {summary.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {summary.summary}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(summary)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
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
        <div className="flex items-center justify-between">
          <Badge className={getLengthColor(summary.length)}>
            {summary.length}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(summary.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
