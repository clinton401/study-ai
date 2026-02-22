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
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import createToast from "@/hooks/create-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toneColor, lengthColor } from "./card-helpers";

export function TermPaperCard({
  paper,
  onView,
  sort = "",
  type = "",
}: {
  paper: TermPaper;
  onView: (paper: TermPaper) => void;
  sort?: string;
  type?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { createError, createSimple } = createToast();
  const { refresh } = useRouter();

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const { error } = await deleteContent(paper._id);
      if (error) return createError(error);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["stats-content"], exact: true, refetchType: "active" }, { throwOnError: true, cancelRefetch: true }),
        queryClient.invalidateQueries({ queryKey: ["contents", sort, type], exact: true, refetchType: "active" }, { throwOnError: true, cancelRefetch: true }),
      ]);
      refresh();
      createSimple("Content deleted successfully.");
    } catch {
      createError("Unable to delete content.");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadHandler = async () => {
    try {
      await handleDownload(paper.content, paper.topic.slice(0, 20));
    } catch (err) {
      console.error(`Failed to download file: ${err}`);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md hover:border-foreground/20 transition-all duration-200">
      {/* Body */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug line-clamp-2 tracking-tight">
            {paper.topic}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {paper.content}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-lg">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => onView(paper)}>
              <Eye className="mr-2 h-3.5 w-3.5" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadHandler}>
              <Download className="mr-2 h-3.5 w-3.5" /> Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting
                ? <Loader className="mr-2 h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="mr-2 h-3.5 w-3.5" />}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border capitalize">
          {paper.type.replace("-", " ")}
        </span>
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", toneColor(paper.tone))}>
          {paper.tone}
        </span>
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", lengthColor(paper.length))}>
          {paper.length}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground tabular-nums">{paper.wordCount?.toLocaleString()} words</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(paper.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}