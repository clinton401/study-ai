import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProtectedLoading() {
  return (
    <div className="w-full">
       {/* Hero Section Skeleton */}
       <section className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div>
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-6 w-64" />
              </div>
            </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Card 1 */}
            <Card className="rounded-3xl">
              <CardHeader>
                 <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

             {/* Card 2 */}
             <Card className="rounded-3xl">
              <CardHeader>
                 <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </div>
                       <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </div>
                  </div>
                   <Skeleton className="h-12 w-32 rounded-xl" />
              </CardContent>
            </Card>
            
             {/* Card 3 */}
             <Card className="rounded-3xl">
              <CardHeader>
                 <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </div>
                       <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </div>
                  </div>
                   <Skeleton className="h-12 w-32 rounded-xl" />
              </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}
