import ProductCard from "@/components/ProductCard";
import { useFeaturedProducts } from "@/hooks/useCatalog";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/CatalogStates";

const FeaturedProducts = () => {
  const { data, isLoading, isError, isFetching, refetch } = useFeaturedProducts();
  const products = data ?? [];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2">منتجات <span className="gold-text">مميزة</span></h2>
        <p className="text-muted-foreground">أحدث الوصولات والأكثر مبيعاً</p>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : isError ? (
        <ErrorState title="تعذر تحميل المنتجات" onRetry={() => refetch()} retrying={isFetching} />
      ) : products.length === 0 ? (
        <EmptyState title="لا توجد منتجات حالياً" description="تابعنا لمعرفة أحدث المنتجات" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
