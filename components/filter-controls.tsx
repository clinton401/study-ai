import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {  Filter } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export function FilterControls({title, sort, setSort, type, setType}: {title: string; sort: string; setSort: Dispatch<SetStateAction<string>>; type?: string; setType?: Dispatch<SetStateAction<string>>}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
      <h2 className="text-2xl font-bold tracking-tight">
          {title}
        </h2>
        {/* <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search content..." className="max-w-sm" /> */}
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="sort-by" className="text-sm font-medium">
          Sort by:
        </Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            {type ? (
            <SelectItem value="topic">Topic</SelectItem>

            ): (
            <SelectItem value="title">Title</SelectItem>

            )}
            {/* <SelectItem value="type">Type</SelectItem> */}
            <SelectItem value="length">Length</SelectItem>
          </SelectContent>
         
        </Select>
        {type && setType && (
 <Select value={type} onValueChange={setType}>
 <SelectTrigger className="w-[120px]">
   <SelectValue />
 </SelectTrigger>
 <SelectContent>
   <SelectItem value="all">All Types</SelectItem>
   <SelectItem value="essay">Essay</SelectItem>
   <SelectItem value="letter">Letter</SelectItem>
   <SelectItem value="term-paper">Term Paper</SelectItem>
 </SelectContent>
</Select>
          )}
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
