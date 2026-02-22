"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download } from "lucide-react";
import { handleCopy, handleDownload } from "@/lib/main";
import { cn } from "@/lib/utils";

export const CopyExport: FC<{ content: string; filename: string }> = ({
  content,
  filename,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const copyHandler = () => {
    try {
      handleCopy(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error(`Failed to copy text: ${err}`);
    }
  };

  const downloadHandler = async () => {
    try {
      await handleDownload(content, filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err) {
      console.error(`Failed to download file: ${err}`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyHandler}
        disabled={!content.trim()}
        className={cn(
          "rounded-xl gap-1.5 transition-colors",
          copySuccess && "border-green-400/60 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
        )}
      >
        {copySuccess ? (
          <><Check className="h-3.5 w-3.5" /> Copied</>
        ) : (
          <><Copy className="h-3.5 w-3.5" /> Copy</>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={downloadHandler}
        disabled={!content.trim()}
        className={cn(
          "rounded-xl gap-1.5 transition-colors",
          exportSuccess && "border-green-400/60 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
        )}
      >
        {exportSuccess ? (
          <><Check className="h-3.5 w-3.5" /> Saved</>
        ) : (
          <><Download className="h-3.5 w-3.5" /> Export</>
        )}
      </Button>
    </div>
  );
};