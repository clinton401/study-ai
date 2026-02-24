import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="w-full px-4 py-6 space-y-8 overflow-hidden">
      {/* Stats Grid simplified for loading */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Section Blocks */}
      <div className="space-y-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl hidden md:block" />
              <Skeleton className="h-32 w-full rounded-2xl hidden lg:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
