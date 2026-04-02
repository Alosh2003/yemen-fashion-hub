export type CityDeliveryInfo = {
  name: string;
  estimatedDays: number;
  deliveryFee: number;
  freeDeliveryMinimum: number;
};

export const cityDeliveryMap: Record<string, CityDeliveryInfo> = {
  "صنعاء": { name: "صنعاء", estimatedDays: 1, deliveryFee: 1500, freeDeliveryMinimum: 30000 },
  "عدن": { name: "عدن", estimatedDays: 2, deliveryFee: 2000, freeDeliveryMinimum: 40000 },
  "تعز": { name: "تعز", estimatedDays: 2, deliveryFee: 2000, freeDeliveryMinimum: 40000 },
  "الحديدة": { name: "الحديدة", estimatedDays: 2, deliveryFee: 2000, freeDeliveryMinimum: 40000 },
  "إب": { name: "إب", estimatedDays: 2, deliveryFee: 2000, freeDeliveryMinimum: 40000 },
  "ذمار": { name: "ذمار", estimatedDays: 2, deliveryFee: 1800, freeDeliveryMinimum: 35000 },
  "المكلا": { name: "المكلا", estimatedDays: 4, deliveryFee: 3000, freeDeliveryMinimum: 50000 },
  "سيئون": { name: "سيئون", estimatedDays: 4, deliveryFee: 3000, freeDeliveryMinimum: 50000 },
  "عمران": { name: "عمران", estimatedDays: 2, deliveryFee: 1800, freeDeliveryMinimum: 35000 },
  "حجة": { name: "حجة", estimatedDays: 3, deliveryFee: 2500, freeDeliveryMinimum: 45000 },
  "صعدة": { name: "صعدة", estimatedDays: 3, deliveryFee: 2500, freeDeliveryMinimum: 45000 },
  "البيضاء": { name: "البيضاء", estimatedDays: 3, deliveryFee: 2500, freeDeliveryMinimum: 45000 },
  "لحج": { name: "لحج", estimatedDays: 2, deliveryFee: 2000, freeDeliveryMinimum: 40000 },
  "أبين": { name: "أبين", estimatedDays: 3, deliveryFee: 2500, freeDeliveryMinimum: 45000 },
  "شبوة": { name: "شبوة", estimatedDays: 4, deliveryFee: 3000, freeDeliveryMinimum: 50000 },
  "مأرب": { name: "مأرب", estimatedDays: 3, deliveryFee: 2500, freeDeliveryMinimum: 45000 },
};

export const getDeliveryInfo = (city: string) => {
  return cityDeliveryMap[city] || { name: city, estimatedDays: 5, deliveryFee: 3500, freeDeliveryMinimum: 50000 };
};

export const getDeliveryFee = (city: string, subtotal: number): number => {
  const info = getDeliveryInfo(city);
  return subtotal >= info.freeDeliveryMinimum ? 0 : info.deliveryFee;
};

export const orderStatusLabels: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "معلق", color: "text-yellow-500 bg-yellow-500/10", icon: "⏳" },
  confirmed: { label: "مؤكد", color: "text-blue-500 bg-blue-500/10", icon: "✅" },
  processing: { label: "قيد التجهيز", color: "text-orange-500 bg-orange-500/10", icon: "📦" },
  shipping: { label: "قيد الشحن", color: "text-purple-500 bg-purple-500/10", icon: "🚚" },
  delivered: { label: "تم التوصيل", color: "text-green-500 bg-green-500/10", icon: "🎉" },
  cancelled: { label: "ملغي", color: "text-destructive bg-destructive/10", icon: "❌" },
  returned: { label: "مسترجع", color: "text-muted-foreground bg-muted", icon: "↩️" },
};
