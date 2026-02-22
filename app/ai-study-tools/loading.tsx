import { Skeleton } from "@/components/ui/skeleton";

export default function AIStudyToolsLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 overflow-hidden">
      {/* Simple Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Hero Title */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      {/* Simple Card Block */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>

      {/* Footer Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
