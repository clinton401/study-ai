import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Loader } from "lucide-react"
import { FC, Dispatch, SetStateAction, useState } from "react";
import { editContent } from "@/actions/edit-content";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";

export const EditContentModal: FC<{
  content: string
  setContent?: Dispatch<SetStateAction<string>>,
  invalidateQuery?: (c: string) => Promise<void>,
  id: string | null
}> = ({ content, setContent, id, invalidateQuery  }) => {
  const [editMessage, setEditMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);
  const { createSimple, createError } = createToast();
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    if (editMessage.trim().length < 2 || editMessage.trim().length > 3000) return createError("Your edit instructions must be between 2 and 3,000 characters long.");
    if (!content.trim()) return createError("Content cannot be empty.");
    try {
      setIsPending(true);
      createSimple("Applying your edit request. This might take a few seconds...");
      const { error, content: editedContent } = await editContent(content, editMessage, id);
      if (error || !editedContent) {
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
      if(invalidateQuery){
       await invalidateQuery(editedContent);
      }
      setContent?.(editedContent);
      setEditMessage("");
      setOpen(false);
      createSimple("Edit request applied successfully!");

    }catch(error){
      console.error(`Unable to edit content: ${error}`)
      return createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!content.trim()}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90dvh] overflow-y-auto">
        {/* <ScrollArea className="h-full w-full"> */}
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Enter the instructions for how you want the AI to edit this
              content.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <Label htmlFor="editMessage">Edit instructions</Label>
            <Textarea
              id="editMessage"
              placeholder="e.g. Make this more concise"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              className="min-h-[120px]  max-h-[250px] "
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!editMessage.trim() || isPending}>
              Apply Edit
              {isPending && <Loader className="animate-spin size-4 ml-2" />}
            </Button>
          </DialogFooter>
        </form>
        {/* </ScrollArea> */}
      </DialogContent>
    </Dialog>
  );
}
