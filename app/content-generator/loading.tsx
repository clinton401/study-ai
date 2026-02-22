import { Skeleton } from "@/components/ui/skeleton";

export default function ContentGeneratorLoading() {
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

      {/* Simple Main Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
        <Skeleton className="h-12 w-40 rounded-xl pt-4" />
      </div>
    </div>
  );
}
