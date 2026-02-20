import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, MoreHorizontal, Trash2, Loader } from "lucide-react";
import { FullUserSummary as Summary } from "@/models/user-summary";
import { deleteSummary } from "@/actions/delete-summary";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import createToast from "@/hooks/create-toast";
import { useRouter } from "next/navigation";
import { handleDownload } from "@/lib/main";
import { cn } from "@/lib/utils";
import { lengthColor } from "./card-helpers";

export function SummaryCard({
  summary,
  onView,
  sort = "",
}: {
  summary: Summary;
  onView: (summary: Summary) => void;
  sort?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { createError, createSimple } = createToast();
  const { refresh } = useRouter();

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const { error } = await deleteSummary(summary._id);
      if (error) return createError(error);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["stats-summary"], exact: true, refetchType: "active" }, { throwOnError: true, cancelRefetch: true }),
        queryClient.invalidateQueries({ queryKey: ["summaries", sort], exact: true, refetchType: "active" }, { throwOnError: true, cancelRefetch: true }),
      ]);
      refresh();
      createSimple("Summary deleted successfully.");
    } catch {
      createError("Unable to delete summary.");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadHandler = async () => {
    try {
      await handleDownload(summary.originalText, summary.summary.slice(0, 20));
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
            {summary.title}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {summary.summary}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-lg">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => onView(summary)}>
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

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", lengthColor(summary.length))}>
          {summary.length}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(summary.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}