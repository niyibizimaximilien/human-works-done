import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const CardListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <Card key={i} className="border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="space-y-2">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 py-3 border-b border-border/50">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);
