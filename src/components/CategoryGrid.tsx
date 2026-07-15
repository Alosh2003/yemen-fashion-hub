import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getActiveCategories, getActiveProductCategoryCounts } from "@/lib/catalog";

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
    let mounted = true;

    const fetchData = async () => {
      try {
        const [cats, countMap] = await Promise.all([
          getActiveCategories(),
          getActiveProductCategoryCounts(),
        ]);

        if (!mounted) return;
        setCategories(cats.map((c) => ({ ...c, productCount: countMap[c.slug] || 0 })));
      } catch (error) {
        console.error("Failed to load categories", error);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();

    return () => { mounted = false; };
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
            <img src={cat.image || "/placeholder.svg"} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
