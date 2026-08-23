import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories, useCategoryProducts } from "@/hooks/useCatalog";
import { PRODUCTS_PAGE_SIZE } from "@/lib/catalog";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/CatalogStates";

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [id]);

  const categoriesQuery = useCategories();
  const productsQuery = useCategoryProducts(id, page);

  const category = (categoriesQuery.data ?? []).find((cat) => cat.slug === id);
  const products = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));

  const goTo = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black">
            {category?.icon} {category?.name || "الفئة"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {productsQuery.isLoading ? "جاري تحميل المنتجات..." : `${total} منتج متاح`}
          </p>
        </div>

        {productsQuery.isLoading ? (
          <ProductGridSkeleton count={PRODUCTS_PAGE_SIZE} />
        ) : productsQuery.isError ? (
          <ErrorState
            title="تعذر تحميل منتجات هذا القسم"
            onRetry={() => productsQuery.refetch()}
            retrying={productsQuery.isFetching}
          />
        ) : products.length === 0 ? (
          <EmptyState title="لا توجد منتجات في هذا القسم حالياً" description="جرّب قسماً آخر أو عد لاحقاً" />
        ) : (
          <>
            <div
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-opacity ${
                productsQuery.isFetching ? "opacity-60" : ""
              }`}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="outline" size="icon" onClick={() => goTo(page - 1)} disabled={page === 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="icon"
                    onClick={() => goTo(i + 1)}
                    className={page === i + 1 ? "gold-gradient text-primary-foreground font-bold" : ""}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="icon" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
