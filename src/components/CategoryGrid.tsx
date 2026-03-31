import { Link } from "react-router-dom";
import { categories } from "@/data/products";

const CategoryGrid = () => (
  <section className="container mx-auto px-4 py-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-black mb-2">تسوق حسب <span className="gold-text">الفئة</span></h2>
      <p className="text-muted-foreground">اختر من بين مجموعة متنوعة من الأقسام</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/category/${cat.id}`}
          className="group relative rounded-xl overflow-hidden aspect-square hover-lift"
        >
          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 right-0 left-0 p-4">
            <span className="text-2xl">{cat.icon}</span>
            <h3 className="font-bold text-foreground">{cat.name}</h3>
            <p className="text-xs text-muted-foreground">{cat.count} منتج</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default CategoryGrid;
