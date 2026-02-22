import { Loader2 } from "lucide-react";

export default function ProtectedLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );
}
