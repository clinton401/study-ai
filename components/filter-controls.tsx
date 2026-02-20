import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";

interface FilterControlsProps {
  title: string;
  sort?: string;
  setSort?: Dispatch<SetStateAction<string>>;
  type?: string;
  setType?: Dispatch<SetStateAction<string>>;
}

export function FilterControls({ title, sort, setSort, type, setType }: FilterControlsProps) {
  const hasFilters = (sort && setSort) || (type && setType);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Title */}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

      {/* Filters */}
      {hasFilters && (
        <div className="flex items-center flex-wrap gap-2">
          {/* Sort */}
          {sort !== undefined && setSort && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:block">
                Sort
              </span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className={cn("h-8 rounded-xl text-xs", type !== undefined ? "w-[140px]" : "w-[150px]")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="createdAt" className="text-xs">Date Created</SelectItem>
                  {type !== undefined ? (
                    <SelectItem value="topic" className="text-xs">Topic</SelectItem>
                  ) : (
                    <SelectItem value="title" className="text-xs">Title</SelectItem>
                  )}
                  <SelectItem value="length" className="text-xs">Length</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type */}
          {type !== undefined && setType && (
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-8 w-[130px] rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                <SelectItem value="essay" className="text-xs">Essay</SelectItem>
                <SelectItem value="letter" className="text-xs">Letter</SelectItem>
                <SelectItem value="term-paper" className="text-xs">Term Paper</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}