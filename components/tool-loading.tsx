import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ToolLoading() {
  return (
    <div className="w-full">
      {/* Hero Section Skeleton */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-14 w-14 rounded-2xl" />
            </div>
          <Skeleton className="h-16 w-3/4 max-w-lg mb-6 rounded-xl" />
          <Skeleton className="h-6 w-1/2 max-w-2xl mb-8 rounded-xl" />
        </div>
      </section>

      {/* Main Interface Skeleton */}
      <section className="pb-20 w-full px-4">
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Input Card */}
          <Card className="rounded-xl shadow-xl">
            <CardHeader>
               <Skeleton className="h-8 w-64 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Skeleton className="h-10 w-full rounded-xl" />
                     <Skeleton className="h-10 w-full rounded-xl" />
                 </div>
            </CardContent>
          </Card>
          
           {/* Output Card */}
           <Card className="rounded-xl shadow-xl">
               <CardHeader>
                   <Skeleton className="h-8 w-48 rounded-xl" />
               </CardHeader>
               <CardContent>
                   <div className="space-y-4">
                       <Skeleton className="h-4 w-full rounded-xl" />
                       <Skeleton className="h-4 w-full rounded-xl" />
                       <Skeleton className="h-4 w-3/4 rounded-xl" />
                        <Skeleton className="h-4 w-full rounded-xl" />
                       <Skeleton className="h-4 w-5/6 rounded-xl" />
                   </div>
               </CardContent>
           </Card>
        </div>
      </section>
    </div>
  );
}
