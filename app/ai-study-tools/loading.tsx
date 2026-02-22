import { Skeleton } from "@/components/ui/skeleton";

export default function AIStudyToolsLoading() {
  return (
    <div className="min-h-screen bg-background w-full overflow-hidden">
      {/* Header Skeleton */}
      <header className="">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 space-y-6">
        {/* Hero Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>

        {/* Input Card Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-8 space-y-8">
          {/* Step 1 */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-48" />
             </div>
             <Skeleton className="h-32 w-full rounded-xl" />
             <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-border/60" />
                <Skeleton className="h-3 w-20" />
                <div className="h-px flex-1 bg-border/60" />
             </div>
             <Skeleton className="h-48 w-full rounded-xl" />
          </div>

          <div className="border-t border-border/60" />

          {/* Step 2 */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
             </div>
             <div className="flex flex-wrap gap-3">
                <Skeleton className="h-14 flex-1 min-w-[80px] rounded-xl" />
                <Skeleton className="h-14 flex-1 min-w-[80px] rounded-xl" />
                <Skeleton className="h-14 flex-1 min-w-[80px] rounded-xl" />
             </div>
          </div>

          <div className="border-t border-border/60" />

          {/* CTA Row */}
          <div className="flex gap-3">
             <Skeleton className="h-12 w-40 rounded-xl" />
             <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>

        {/* How it works Skeleton */}
        <div className="border-t border-border/60 pt-16 space-y-8">
           <Skeleton className="h-4 w-32" />
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-8" />
                      <div className="h-px flex-1 bg-border/60" />
                   </div>
                   <Skeleton className="h-5 w-5" />
                   <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}
