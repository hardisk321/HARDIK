// Format price in INR (or any currency) for display
export function formatPrice(price, currency = "INR") {
  if (price == null || price === "" || isNaN(Number(price))) return null;
  const n = Number(price);
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}

export function priceDisplay(product) {
  if (!product) return "Price on request";
  if (product.price_on_request || product.price == null) return "Price on request";
  const f = formatPrice(product.price, product.price_currency || "INR");
  return f || "Price on request";
}
