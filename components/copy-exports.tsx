import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Download } from "lucide-react";
import { handleCopy, handleDownload } from "@/lib/main";

export const CopyExport: FC<{ content: string; filename: string}> = ({content, filename}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const copyHandler = () => {
    try{
      handleCopy(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }catch(error){
        console.error(`Failed to copy text: ${error}`)
    }
  }

  const downloadHandler = async () => {
      try {
          await handleDownload(content, filename);
                setExportSuccess(true);
                setTimeout(() => setExportSuccess(false), 2000);
      }catch(error){
        console.error(`Failed to download file: ${error}`)
      }
  }
  return (
    <>
      <Button
      disabled={!content.trim()}
        variant="outline"
        size="sm"
        onClick={copyHandler}
        className={`rounded-xl transition-colors ${
          copySuccess ? "bg-green-50 border-green-200 text-green-700" : ""
        }`}
      >
        {copySuccess ? (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </Button>
      <Button
      disabled={!content.trim()}
        variant="outline"
        size="sm"
        onClick={downloadHandler}
        className={`rounded-xl transition-colors ${
          exportSuccess ? "bg-green-50 border-green-200 text-green-700" : ""
        }`}
      >
        {exportSuccess ? (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Exported!
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export
          </>
        )}
      </Button>
    </>
  );
};
