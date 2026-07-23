"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadCart, saveCart, PRODUCTS, type CartItem } from "@/lib/cart";

const C = {
  bg: "#060402", bg2: "#0e0805", bg3: "#1a0e08",
  br1: "#2C1503", br2: "#8B5A2B",
  gold: "#c8a87a", gold2: "#a07850",
  cream: "#F5E6C8", dim: "#9a8070", dim2: "#6a5040",
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(cart);
  }, [cart, loaded]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const shipping = total >= 60 ? 0 : 4.9;
  const grandTotal = total + shipping;

  function setQty(sku: string, qty: number) {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.sku === sku ? { ...i, qty } : i));
  }

  function remove(sku: string) {
    setCart(prev => prev.filter(i => i.sku !== sku));
  }

  if (!loaded) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", color: C.cream }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Georgia,serif", background: C.bg, minHeight: "100vh", color: C.cream }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", padding: "0 32px", height: "60px", background: C.bg2, borderBottom: `1px solid ${C.br1}`, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: "20px", letterSpacing: ".15em", color: C.cream, textDecoration: "none" }}>ANNAM</Link>
      </nav>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Title */}
        <div style={{ marginBottom: "28px" }}>
          <Link href="/" style={{ fontSize: "11px", letterSpacing: ".15em", color: C.gold2, textDecoration: "none", textTransform: "uppercase" }}>
            ← Continuer mes achats
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: 400, letterSpacing: ".1em", margin: "10px 0 4px" }}>Mon panier</h1>
          {count > 0 && (
            <p style={{ fontSize: "12px", color: C.dim, margin: 0 }}>{count} article{count > 1 ? "s" : ""}</p>
          )}
        </div>

        {cart.length === 0 ? (
          /* ── EMPTY ── */
          <div style={{ textAlign: "center", padding: "80px 0", border: `1px solid ${C.br1}` }}>
            <p style={{ fontSize: "40px", marginBottom: "16px" }}>☕</p>
            <p style={{ fontSize: "18px", color: C.dim, marginBottom: "24px" }}>Votre panier est vide</p>
            <Link href="/" style={{
              display: "inline-block", padding: "12px 28px",
              background: C.br2, border: `1px solid ${C.br2}`,
              color: C.cream, fontSize: "11px", letterSpacing: ".18em",
              textTransform: "uppercase", textDecoration: "none",
            }}>
              Choisir un café
            </Link>
          </div>
        ) : (
          /* ── CART LAYOUT ── */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>

            {/* ── LEFT: Items ── */}
            <div>
              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 140px 80px 40px",
                padding: "10px 16px", background: C.bg3,
                border: `1px solid ${C.br1}`, borderBottom: "none",
                fontSize: "9px", letterSpacing: ".25em", color: C.gold2, textTransform: "uppercase",
              }}>
                <span>Produit</span>
                <span style={{ textAlign: "center" }}>Quantité</span>
                <span style={{ textAlign: "right" }}>Prix</span>
                <span />
              </div>

              {cart.map((item, idx) => {
                const prod = PRODUCTS[item.sku];
                return (
                  <div key={item.sku} style={{
                    display: "grid", gridTemplateColumns: "1fr 140px 80px 40px",
                    padding: "20px 16px", alignItems: "center",
                    border: `1px solid ${C.br1}`,
                    borderTop: idx === 0 ? `1px solid ${C.br1}` : "none",
                    background: C.bg2,
                  }}>
                    {/* Product info */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      {/* Coffee bag visual */}
                      <div style={{
                        width: "64px", height: "80px", background: C.bg3,
                        border: `1px solid ${prod?.accent || C.br2}`,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: "24px" }}>☕</span>
                        <span style={{ fontSize: "8px", color: prod?.accent || C.gold, marginTop: "4px", letterSpacing: ".08em" }}>250g</span>
                      </div>

                      <div>
                        <p style={{ fontSize: "16px", color: C.cream, margin: "0 0 4px" }}>{item.name}</p>
                        <p style={{ fontSize: "10px", color: C.gold2, margin: "0 0 4px", letterSpacing: ".1em" }}>{item.origin}</p>
                        <p style={{ fontSize: "11px", color: C.dim, margin: 0 }}>{prod?.notes}</p>
                        <p style={{ fontSize: "12px", color: C.gold, margin: "6px 0 0" }}>€{item.price} / sachet</p>
                      </div>
                    </div>

                    {/* Qty selector */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.br2}` }}>
                        <button
                          onClick={() => item.qty > 1 ? setQty(item.sku, item.qty - 1) : remove(item.sku)}
                          style={{ width: "36px", height: "36px", background: "none", border: "none", color: C.cream, cursor: "pointer", fontSize: "18px", borderRight: `1px solid ${C.br1}`, fontFamily: "Georgia,serif" }}
                        >−</button>
                        <input
                          type="number" min={1} max={20} value={item.qty}
                          onChange={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= 20) setQty(item.sku, v); }}
                          style={{
                            width: "40px", height: "36px", textAlign: "center",
                            background: "none", border: "none", color: C.cream,
                            fontSize: "15px", fontFamily: "Georgia,serif",
                          }}
                        />
                        <button
                          onClick={() => setQty(item.sku, item.qty + 1)}
                          style={{ width: "36px", height: "36px", background: "none", border: "none", color: C.cream, cursor: "pointer", fontSize: "18px", borderLeft: `1px solid ${C.br1}`, fontFamily: "Georgia,serif" }}
                        >+</button>
                      </div>
                    </div>

                    {/* Line total */}
                    <p style={{ fontSize: "18px", color: C.cream, textAlign: "right", margin: 0 }}>
                      €{item.price * item.qty}
                    </p>

                    {/* Remove */}
                    <button
                      onClick={() => remove(item.sku)}
                      title="Supprimer"
                      style={{ background: "none", border: "none", color: C.dim2, cursor: "pointer", fontSize: "20px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >×</button>
                  </div>
                );
              })}

              {/* Subtotal row */}
              <div style={{
                display: "flex", justifyContent: "flex-end", alignItems: "center",
                padding: "16px", border: `1px solid ${C.br1}`, borderTop: "none",
                background: C.bg3, gap: "24px",
              }}>
                <span style={{ fontSize: "13px", color: C.dim }}>Sous-total ({count} article{count > 1 ? "s" : ""})</span>
                <span style={{ fontSize: "22px", color: C.cream }}>€{total}</span>
              </div>
            </div>

            {/* ── RIGHT: Order summary ── */}
            <div style={{ border: `1px solid ${C.br1}`, background: C.bg2, position: "sticky", top: "80px" }}>
              <div style={{ padding: "20px", borderBottom: `1px solid ${C.br1}` }}>
                <p style={{ fontSize: "9px", letterSpacing: ".35em", color: C.gold2, textTransform: "uppercase", margin: "0 0 16px" }}>
                  Récapitulatif
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: C.dim }}>Sous-total</span>
                    <span style={{ color: C.cream }}>€{total}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: C.dim }}>Livraison</span>
                    <span style={{ color: shipping === 0 ? "#7ab85a" : C.cream }}>
                      {shipping === 0 ? "Offerte ✓" : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p style={{ fontSize: "10px", color: C.dim2, margin: 0 }}>
                      Livraison offerte dès €60 (il manque €{(60 - total).toFixed(0)})
                    </p>
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${C.br1}`, paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "14px", color: C.cream }}>Total</span>
                  <span style={{ fontSize: "26px", color: C.cream }}>€{grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(2)}</span>
                </div>

                <p style={{ fontSize: "10px", color: C.dim2, margin: "6px 0 0" }}>TVA 5,5% incluse · Café alimentaire</p>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => router.push("/checkout")}
                  style={{
                    width: "100%", padding: "16px", background: "#635BFF",
                    border: "none", color: "#fff", fontSize: "13px",
                    letterSpacing: ".18em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "Georgia,serif",
                  }}
                >
                  Passer la commande →
                </button>

                <div style={{ display: "flex", justifyContent: "center", gap: "16px", padding: "12px 0", borderTop: `1px solid ${C.br1}` }}>
                  {["🔒 Paiement sécurisé", "📦 5–8j en France", "↩ Retour facile"].map(t => (
                    <span key={t} style={{ fontSize: "9px", color: C.dim2, letterSpacing: ".06em", textAlign: "center" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <footer style={{ padding: "24px", textAlign: "center", borderTop: `1px solid ${C.bg3}`, marginTop: "60px" }}>
        <p style={{ fontSize: "10px", color: C.dim2, letterSpacing: ".15em" }}>
          ANNAM · Maison de Café Vietnamien · France · © 2026
        </p>
      </footer>
    </div>
  );
}
