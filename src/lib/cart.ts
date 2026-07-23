export const CART_KEY = "annam_cart";

export type CartItem = {
  sku: string;
  name: string;
  origin: string;
  price: number;
  qty: number;
};

export const PRODUCTS: Record<string, { name: string; origin: string; price: number; badge: string; accent: string; notes: string }> = {
  PURE_AROMA: { name: "Pure Aroma", origin: "Arabica · Cầu Đất · 1 500m", price: 32, badge: "Floral", accent: "#6aaa44", notes: "Floral · Jasmin · Doux" },
  HIGH_KICK:  { name: "High Kick",  origin: "Robusta · Đắk Lắk · Hauts Plateaux", price: 28, badge: "Puissant", accent: "#c05050", notes: "Corsé · Crème · 2× caféine" },
  RUM_BLEND:  { name: "Rum Blend",  origin: "Arabica + Robusta · Arôme Rhum", price: 35, badge: "Signature ★", accent: "#c8850a", notes: "Vanille · Rhum · Latte & cocktail" },
};

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(CART_KEY);
    return s ? (JSON.parse(s) as CartItem[]) : [];
  } catch { return []; }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  if (items.length > 0) localStorage.setItem(CART_KEY, JSON.stringify(items));
  else localStorage.removeItem(CART_KEY);
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}
