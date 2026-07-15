import { Product } from "@/data/products";
import { publicSupabase } from "@/integrations/supabase/publicClient";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  sort_order: number;
};

const productCardColumns = "id,name,price,original_price,image,images,category,subcategory,sizes,colors,badge,rating,reviews,stock,is_active,description";

let categoriesRequest: Promise<PublicCategory[]> | null = null;

export const getActiveCategories = () => {
  if (!categoriesRequest) {
    categoriesRequest = Promise.resolve(
      publicSupabase
        .from("categories")
        .select("id,name,slug,icon,image,sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
    )
      .then(({ data, error }) => {
        if (error) throw error;
        return (data || []) as PublicCategory[];
      })
      .catch((error) => {
        categoriesRequest = null;
        throw error;
      });
  }
  return categoriesRequest;
};

export const getActiveProductCategoryCounts = async () => {
  const { data, error } = await publicSupabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  if (error) throw error;

  return (data || []).reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
};

export const getFeaturedProducts = async () => {
  const { data, error } = await publicSupabase
    .from("products")
    .select(productCardColumns)
    .eq("is_active", true)
    .order("rating", { ascending: false })
    .limit(8);

  if (error) throw error;
  return (data || []) as Product[];
};

export const getCategoryProducts = async (categorySlug: string) => {
  const { data, error } = await publicSupabase
    .from("products")
    .select(productCardColumns)
    .eq("category", categorySlug)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Product[];
};

export const getOfferProducts = async () => {
  const { data, error } = await publicSupabase
    .from("products")
    .select(productCardColumns)
    .eq("is_active", true)
    .not("original_price", "is", null)
    .order("rating", { ascending: false });

  if (error) throw error;

  return ((data || []) as Product[]).filter(
    (product) => product.original_price && product.original_price > product.price
  );
};
