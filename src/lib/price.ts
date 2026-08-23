export const formatNumber = (value: number) =>
  Number.isFinite(value) ? Math.round(value).toLocaleString("ar-YE") : "0";

// Old currency is the price stored in the database.
// New currency = old / rate.
export const toNewCurrency = (oldPrice: number, rate: number) => {
  if (!rate || rate <= 0) return oldPrice;
  return oldPrice / rate;
};

export const formatNewCurrency = (oldPrice: number, rate: number) => {
  const value = toNewCurrency(oldPrice, rate);
  return value < 10
    ? value.toLocaleString("ar-YE", { maximumFractionDigits: 2 })
    : formatNumber(value);
};
