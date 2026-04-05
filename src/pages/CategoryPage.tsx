import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

type CategoryInfo = { name: string; icon: string };

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: catData }, { data: prodData }] = await Promise.all([
        supabase.from("categories").select("name, icon").eq("slug", id!).maybeSingle(),
        supabase.from("products").select("*").eq("category", id!).eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      setCategory(catData);
      setProducts((prodData as Product[]) || []);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black">
            {category?.icon} {category?.name || "الفئة"}
          </h1>
          <p className="text-muted-foreground mt-1">{products.length} منتج متاح</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl">لا توجد منتجات في هذا القسم حالياً</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
