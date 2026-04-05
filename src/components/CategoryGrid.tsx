import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  sort_order: number;
  productCount: number;
};

const CategoryGrid = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: cats }, { data: products }] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("category").eq("is_active", true),
      ]);

      const countMap: Record<string, number> = {};
      products?.forEach((p) => { countMap[p.category] = (countMap[p.category] || 0) + 1; });

      setCategories(
        (cats || []).map((c: any) => ({
          ...c,
          productCount: countMap[c.slug] || 0,
        }))
      );
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2">تسوق حسب <span className="gold-text">الفئة</span></h2>
        <p className="text-muted-foreground">اختر من بين مجموعة متنوعة من الأقسام</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="group relative rounded-xl overflow-hidden aspect-square hover-lift"
          >
            <img src={cat.image || ""} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-4">
              <span className="text-2xl">{cat.icon}</span>
              <h3 className="font-bold text-foreground">{cat.name}</h3>
              <p className="text-xs text-muted-foreground">{cat.productCount} منتج</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
