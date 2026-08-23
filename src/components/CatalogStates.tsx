import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => (
  <div className="bg-card rounded-xl overflow-hidden border border-border">
    <Skeleton className="w-full aspect-[3/4] rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CategoryGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="aspect-square rounded-xl" />
    ))}
  </div>
);

export const ErrorState = ({
  title = "تعذر تحميل البيانات",
  description = "تحقق من اتصالك بالإنترنت ثم أعد المحاولة.",
  onRetry,
  retrying,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) => (
  <div className="text-center py-14 px-4">
    <AlertTriangle className="w-12 h-12 mx-auto text-destructive/70 mb-4" />
    <h3 className="font-bold text-lg mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-5">{description}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" disabled={retrying} className="gap-2">
        <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
        إعادة المحاولة
      </Button>
    )}
  </div>
);

export const EmptyState = ({ title, description }: { title: string; description?: string }) => (
  <div className="text-center py-16 text-muted-foreground">
    <p className="text-xl font-bold text-foreground mb-1">{title}</p>
    {description && <p className="text-sm">{description}</p>}
  </div>
);
