import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SummaryCardSkeleton } from "@/components/summary-card-skeleton";
import { Separator } from "@/components/ui/separator";

export default function DashboardLoading() {
  return (
    <main className="w-full">
      <div className="flex flex-col gap-6 p-6 w-full">
        {/* Analytics Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Sections Skeleton */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))}
            </div>
          </section>

          <Separator />

          {/* Section 2 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))}
            </div>
          </section>
          
           <Separator />

          {/* Section 3 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
