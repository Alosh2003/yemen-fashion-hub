import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(8);
      setProducts((data as Product[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2">منتجات <span className="gold-text">مميزة</span></h2>
        <p className="text-muted-foreground">أحدث الوصولات والأكثر مبيعاً</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
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
