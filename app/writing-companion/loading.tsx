import { Skeleton } from "@/components/ui/skeleton";

export default function WritingCompanionLoading() {
  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header Skeleton */}
      <header className="">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-40" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Hero Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Editor Panel Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-border/60">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-[460px] w-full rounded-none" />
              <div className="px-6 py-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-9 w-32 rounded-xl" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-xl" />
                  <Skeleton className="h-9 w-24 rounded-xl ml-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-4">
            {/* Stats Card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-3 w-12" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-3.5" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions Card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
               <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-3.5" />
                  <Skeleton className="h-3 w-24" />
               </div>
               <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3 w-32" />
               </div>
            </div>
          </div>
        </div>

        {/* How it works Skeleton */}
        <div className="border-t border-border/60 pt-14 space-y-8">
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
