export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  sizes: string[];
  colors: string[];
  badge?: string;
  rating: number;
  reviews: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
  image: string;
};

export const categories: Category[] = [
  { id: "men", name: "رجالي", icon: "👔", count: 245, image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80" },
  { id: "women", name: "نسائي", icon: "👗", count: 312, image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80" },
  { id: "kids", name: "أطفال", icon: "🧒", count: 189, image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80" },
  { id: "sports", name: "رياضي", icon: "🏃", count: 156, image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80" },
  { id: "traditional", name: "تقليدي", icon: "🕌", count: 98, image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&q=80" },
  { id: "accessories", name: "إكسسوارات", icon: "⌚", count: 201, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80" },
];

export const products: Product[] = [
  {
    id: "1", name: "قميص كلاسيكي أزرق", price: 8500, originalPrice: 12000,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80",
    category: "men", subcategory: "قمصان", sizes: ["S", "M", "L", "XL"], colors: ["أزرق", "أبيض"],
    badge: "خصم 30%", rating: 4.5, reviews: 23,
  },
  {
    id: "2", name: "فستان سهرة أنيق", price: 25000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
    category: "women", subcategory: "فساتين", sizes: ["S", "M", "L"], colors: ["أسود", "أحمر"],
    badge: "جديد", rating: 4.8, reviews: 45,
  },
  {
    id: "3", name: "بدلة رجالية فاخرة", price: 45000, originalPrice: 55000,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    category: "men", subcategory: "بدلات", sizes: ["M", "L", "XL", "XXL"], colors: ["كحلي", "رمادي"],
    badge: "الأكثر مبيعاً", rating: 4.9, reviews: 67,
  },
  {
    id: "4", name: "طقم أطفال قطني", price: 5500,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80",
    category: "kids", subcategory: "أطقم", sizes: ["2-3", "4-5", "6-7"], colors: ["ملون"],
    rating: 4.3, reviews: 18,
  },
  {
    id: "5", name: "حذاء رياضي نايك", price: 15000, originalPrice: 18000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    category: "sports", subcategory: "أحذية", sizes: ["40", "41", "42", "43", "44"], colors: ["أحمر", "أسود"],
    badge: "خصم 17%", rating: 4.7, reviews: 89,
  },
  {
    id: "6", name: "عباءة يمنية تقليدية", price: 18000,
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&q=80",
    category: "traditional", subcategory: "عبايات", sizes: ["M", "L", "XL"], colors: ["أسود", "بني"],
    badge: "حصري", rating: 4.6, reviews: 34,
  },
  {
    id: "7", name: "ساعة يد كلاسيكية", price: 22000,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
    category: "accessories", subcategory: "ساعات", sizes: ["واحد"], colors: ["ذهبي", "فضي"],
    rating: 4.4, reviews: 56,
  },
  {
    id: "8", name: "جينز سليم فت", price: 9500,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    category: "men", subcategory: "بناطيل", sizes: ["30", "32", "34", "36"], colors: ["أزرق غامق", "أسود"],
    rating: 4.2, reviews: 41,
  },
];
