import { Skeleton } from "@/components/ui/skeleton";

export default function ContentGeneratorLoading() {
  return (
    <div className="w-full px-4 py-10 space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-6 w-full max-w-lg rounded-lg" />
      </div>

      <div className="rounded-2xl border p-6 space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
    </div>
  );
}
