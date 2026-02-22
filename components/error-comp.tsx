import { ERROR_MESSAGES } from "@/lib/error-messages";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorCompProps {
  onRetry: () => void;
  error?: Error | null;
}

export function ErrorComp({ onRetry, error }: ErrorCompProps) {
  return (
    <div className="col-span-full rounded-2xl border border-border bg-card shadow-sm p-10 flex flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground max-w-xs">
        {error?.message || ERROR_MESSAGES.UNKNOWN_ERROR}
      </p>
      <Button onClick={onRetry} variant="outline" size="sm" className="rounded-xl gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </Button>
    </div>
  );
}