export const formatCurrency = (value: number, currency = "PHP") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
};
