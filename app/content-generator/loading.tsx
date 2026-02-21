import { Skeleton } from "@/components/ui/skeleton";

export default function ContentGeneratorLoading() {
  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header Skeleton */}
      <header className="">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-40" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Brief Panel Skeleton */}
        <section className="space-y-10">
          {/* Hero Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-6 w-full max-w-xl" />
          </div>

          {/* Form Card Skeleton */}
          <div className="rounded-2xl border border-border bg-card p-8 space-y-10">
            {/* Step 1 — Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            </div>

            <div className="border-t border-border/60" />

            {/* Step 2 — Tone */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            </div>

            <div className="border-t border-border/60" />

            {/* Step 3 — Length */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 flex-1 rounded-xl" />
                ))}
              </div>
            </div>

            <div className="border-t border-border/60" />

            {/* Step 4 — Topic */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-32 w-full rounded-xl" />
              <div className="flex justify-between">
                 <Skeleton className="h-3 w-64" />
                 <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex gap-3">
               <Skeleton className="h-12 w-40 rounded-xl" />
               <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </section>

        {/* How it works Skeleton */}
        <div className="border-t border-border/60 pt-16 space-y-8">
           <Skeleton className="h-4 w-32" />
           <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-8" />
                      <div className="h-px flex-1 bg-border/60" />
                   </div>
                   <Skeleton className="h-5 w-5" />
                   <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}
