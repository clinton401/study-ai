import { Skeleton } from "@/components/ui/skeleton";

export default function AIStudyToolsLoading() {
  return (
    <div className="w-full px-4 py-10 space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <Skeleton className="h-6 w-full max-w-lg rounded-lg" />
      </div>
      
      <div className="rounded-2xl border p-6 space-y-8">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
