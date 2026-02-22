import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCardSkeleton } from "@/components/summary-card-skeleton";
import { Separator } from "@/components/ui/separator";

export default function DashboardLoading() {
  return (
    <main className="w-full">
      <div className="flex flex-col gap-6 p-6 w-full">
        {/* Analytics Cards Skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Dashboard Sections Skeleton */}
        <div className="space-y-10">
          {/* Section 1: Term Papers */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))}
            </div>
          </section>

          <Separator className="bg-border/60" />

          {/* Section 2: Summaries */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))}
            </div>
          </section>
          
          <Separator className="bg-border/60" />

          {/* Section 3: Flashcards */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))}
            </div>
          </section>

          <Separator className="bg-border/60" />

          {/* Section 4: Quizzes */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
