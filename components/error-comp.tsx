import {ERROR_MESSAGES} from "@/lib/error-messages";
import { Card, CardContent } from "@/components/ui/card";
import {
    RefreshCw,
    AlertCircle,
} from "lucide-react";
  import {Button} from "@/components/ui/button";
interface ErrorCompProps {
    onRetry: () => void;
    error?: Error | null;
  }
  export function ErrorComp({ onRetry, error }: ErrorCompProps) {
    return (
      <Card className="md:col-span-3">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            {error?.message || ERROR_MESSAGES.UNKNOWN_ERROR}
          </p>
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
      // </div>
    );
  }