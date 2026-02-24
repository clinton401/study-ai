import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLoading() {
  return (
    <div className="w-full px-4 py-10 space-y-10 overflow-hidden">
      {/* Header Area */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <Skeleton className="h-6 w-full max-w-lg rounded-lg" />
      </div>
      
      {/* Account Info Block */}
      <div className="rounded-2xl border p-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Security Block */}
      <div className="rounded-2xl border p-6 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Danger Zone Block */}
      <div className="rounded-2xl border border-destructive/20 p-6 space-y-4 bg-destructive/5">
        <Skeleton className="h-6 w-32" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-12 w-full sm:w-1/2 rounded-xl" />
          <Skeleton className="h-12 w-full sm:w-1/2 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
