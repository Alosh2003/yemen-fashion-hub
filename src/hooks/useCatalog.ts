import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getActiveCategories,
  getActiveProductCategoryCounts,
  getCategoryProducts,
  getFeaturedProducts,
  getOfferProducts,
  PRODUCTS_PAGE_SIZE,
} from "@/lib/catalog";

// Catalog data barely changes, so cache it for a while instead of refetching
// on every navigation.
const catalogOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 1,
};

export const useCategories = () =>
  useQuery({ queryKey: ["categories"], queryFn: getActiveCategories, ...catalogOptions });

export const useCategoryCounts = () =>
  useQuery({
    queryKey: ["category-counts"],
    queryFn: getActiveProductCategoryCounts,
    ...catalogOptions,
  });

export const useFeaturedProducts = () =>
  useQuery({ queryKey: ["featured-products"], queryFn: getFeaturedProducts, ...catalogOptions });

export const useCategoryProducts = (slug: string | undefined, page: number) =>
  useQuery({
    queryKey: ["category-products", slug, page],
    queryFn: () => getCategoryProducts(slug!, page, PRODUCTS_PAGE_SIZE),
    enabled: !!slug,
    placeholderData: keepPreviousData,
    ...catalogOptions,
  });

export const useOfferProducts = () =>
  useQuery({ queryKey: ["offer-products"], queryFn: getOfferProducts, ...catalogOptions });
