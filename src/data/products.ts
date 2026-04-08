export type Product = {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image: string | null;
  images?: string[] | null;
  category: string;
  subcategory: string;
  sizes: string[];
  colors: string[];
  badge?: string | null;
  rating: number;
  reviews: number;
  stock?: number;
  is_active?: boolean;
  description?: string | null;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
  image: string;
};

export const categories: Category[] = [
  { id: "men", name: "رجالي", icon: "👔", count: 0, image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80" },
  { id: "women", name: "نسائي", icon: "👗", count: 0, image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80" },
  { id: "kids", name: "أطفال", icon: "🧒", count: 0, image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80" },
  { id: "sports", name: "رياضي", icon: "🏃", count: 0, image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80" },
  { id: "traditional", name: "تقليدي", icon: "🕌", count: 0, image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&q=80" },
  { id: "accessories", name: "إكسسوارات", icon: "⌚", count: 0, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80" },
];
