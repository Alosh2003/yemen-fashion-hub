import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Percent, Timer, Flame } from "lucide-react";

const OffersPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .not("original_price", "is", null)
        .order("rating", { ascending: false });

      const offers = (data as Product[] || []).filter(
        (p) => p.original_price && p.original_price > p.price
      );
      setProducts(offers);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">عروض حصرية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            أقوى <span className="gold-text">العروض</span> والخصومات
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            تسوّق أفضل المنتجات بأسعار مخفضة لفترة محدودة. لا تفوّت الفرصة!
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Percent className="w-4 h-4 text-primary" />
              <span>خصومات تصل إلى 50%</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4 text-primary" />
              <span>عروض محدودة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Percent className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد عروض حالياً</h2>
            <p className="text-muted-foreground">تابعنا للحصول على أحدث العروض والخصومات</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                جميع العروض <span className="text-muted-foreground text-base font-normal">({products.length} منتج)</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default OffersPage;
