import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLoading() {
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Hero Skeleton */}
        <div className="space-y-3 px-4 sm:px-0">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>

        {/* Section 1 Skeleton */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-start gap-3 px-4 sm:px-8 py-5 border-b border-border/60">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-48" />
            </div>
          </div>
          <div className="px-4 sm:px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 Skeleton */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
           <div className="flex items-start gap-3 px-4 sm:px-8 py-5 border-b border-border/60">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-2 w-56" />
            </div>
          </div>
          <div className="px-4 sm:px-8 py-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        {/* Danger Zone Skeleton */}
        <div className="rounded-2xl border border-destructive/30 bg-card overflow-hidden">
           <div className="flex items-start gap-3 px-4 sm:px-8 py-5 border-b border-destructive/20 bg-destructive/5">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-48" />
            </div>
          </div>
          <div className="px-4 sm:px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <Skeleton className="h-14 w-full rounded-xl" />
               <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
