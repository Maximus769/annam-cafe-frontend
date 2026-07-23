"use client";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { loadCart, clearCart, PRODUCTS, type CartItem } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL || "https://ca-phe-viet.onrender.com";

const C = {
  bg: "#060402", bg2: "#0e0805", bg3: "#1a0e08",
  br1: "#2C1503", br2: "#8B5A2B",
  gold: "#c8a87a", gold2: "#a07850",
  cream: "#F5E6C8", dim: "#9a8070", dim2: "#6a5040",
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setCart(loadCart()); }, []);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const shipping = total >= 60 ? 0 : 4.9;
  const grandTotal = total + shipping;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !cart.length) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          items: cart.map(i => ({ sku: i.sku, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        setError(data.detail || data.error || "Erreur. Réessayez.");
        setSending(false);
      }
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
      setSending(false);
    }
  }

  if (cart.length === 0 && !sending) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Georgia,serif", color: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: C.dim, marginBottom: "20px" }}>Votre panier est vide.</p>
        <Link href="/" style={{ color: C.gold, textDecoration: "none", fontSize: "13px" }}>← Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Georgia,serif", background: C.bg, minHeight: "100vh", color: C.cream }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", padding: "0 32px", height: "60px", background: C.bg2, borderBottom: `1px solid ${C.br1}`, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: "20px", letterSpacing: ".15em", color: C.cream, textDecoration: "none" }}>ANNAM</Link>
      </nav>

      {/* Breadcrumb */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "16px 20px" }}>
        <p style={{ fontSize: "11px", color: C.dim2, letterSpacing: ".1em" }}>
          <Link href="/" style={{ color: C.dim2, textDecoration: "none" }}>Boutique</Link>
          {" → "}
          <Link href="/cart" style={{ color: C.dim2, textDecoration: "none" }}>Panier</Link>
          {" → "}
          <span style={{ color: C.gold }}>Paiement</span>
        </p>
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "8px 20px 48px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "28px", alignItems: "start" }}>

        {/* ── LEFT: Email form ── */}
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 400, letterSpacing: ".1em", margin: "0 0 24px" }}>
            Finaliser la commande
          </h1>

          <form onSubmit={handleSubmit}>

            {/* Email section */}
            <div style={{ border: `1px solid ${C.br1}`, background: C.bg2, marginBottom: "20px" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.br1}`, background: C.bg3 }}>
                <p style={{ fontSize: "9px", letterSpacing: ".3em", color: C.gold2, textTransform: "uppercase", margin: 0 }}>
                  1. Coordonnées
                </p>
              </div>
              <div style={{ padding: "20px" }}>
                <label style={{ fontSize: "11px", letterSpacing: ".2em", color: C.gold2, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Adresse email *
                </label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  autoFocus
                  style={{
                    width: "100%", padding: "13px 14px", boxSizing: "border-box",
                    background: C.bg, border: `1px solid ${email ? C.br2 : C.br1}`,
                    color: C.cream, fontSize: "15px", fontFamily: "Georgia,serif",
                    transition: "border-color .2s", outline: "none",
                  }}
                />
                <p style={{ fontSize: "11px", color: C.dim2, margin: "8px 0 0" }}>
                  Votre confirmation de commande et suivi de livraison seront envoyés ici.
                </p>
              </div>
            </div>

            {/* Payment section */}
            <div style={{ border: `1px solid ${C.br1}`, background: C.bg2, marginBottom: "20px" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.br1}`, background: C.bg3 }}>
                <p style={{ fontSize: "9px", letterSpacing: ".3em", color: C.gold2, textTransform: "uppercase", margin: 0 }}>
                  2. Paiement & livraison
                </p>
              </div>
              <div style={{ padding: "20px" }}>
                <p style={{ fontSize: "13px", color: C.dim, margin: "0 0 12px", lineHeight: 1.7 }}>
                  Vous serez redirigé vers <strong style={{ color: C.cream }}>Stripe</strong> pour finaliser votre paiement en toute sécurité.
                  L'adresse de livraison sera renseignée sur la page Stripe.
                </p>
                <div style={{ display: "flex", gap: "20px", padding: "14px", background: C.bg3, border: `1px solid ${C.br1}` }}>
                  {[
                    ["🔒", "SSL 256-bit", "Chiffrement bancaire"],
                    ["💳", "Visa / Mastercard", "3D Secure inclus"],
                    ["🇫🇷", "France + EU", "FR · BE · CH · LU"],
                  ].map(([icon, title, sub]) => (
                    <div key={title} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icon}</div>
                      <div style={{ fontSize: "10px", color: C.cream, letterSpacing: ".05em" }}>{title}</div>
                      <div style={{ fontSize: "9px", color: C.dim2, marginTop: "2px" }}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "#2a0808", border: "1px solid #5a1010", color: "#e07070", fontSize: "13px", marginBottom: "16px" }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim() || sending}
              style={{
                width: "100%", padding: "18px",
                background: !email.trim() || sending ? C.br1 : "#635BFF",
                border: "none", color: "#fff",
                fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase",
                cursor: !email.trim() || sending ? "not-allowed" : "pointer",
                fontFamily: "Georgia,serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                opacity: sending ? 0.8 : 1, transition: "background .2s",
              }}
            >
              {sending ? (
                <>
                  <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  Redirection vers Stripe…
                </>
              ) : (
                <>Payer €{grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(2)} →</>
              )}
            </button>

            <p style={{ textAlign: "center", marginTop: "12px" }}>
              <Link href="/cart" style={{ fontSize: "12px", color: C.dim, textDecoration: "none" }}>
                ← Retour au panier
              </Link>
            </p>
          </form>
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div style={{ border: `1px solid ${C.br1}`, background: C.bg2, position: "sticky", top: "80px" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.br1}`, background: C.bg3 }}>
            <p style={{ fontSize: "9px", letterSpacing: ".3em", color: C.gold2, textTransform: "uppercase", margin: 0 }}>
              Votre commande ({count} article{count > 1 ? "s" : ""})
            </p>
          </div>

          <div style={{ padding: "16px 20px" }}>
            {cart.map(item => {
              const prod = PRODUCTS[item.sku];
              return (
                <div key={item.sku} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.br1}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "44px", background: C.bg3, border: `1px solid ${prod?.accent || C.br2}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "16px" }}>☕</span>
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", color: C.cream, margin: "0 0 2px" }}>{item.name}</p>
                      <p style={{ fontSize: "10px", color: C.dim, margin: 0 }}>250g · Qté {item.qty}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "14px", color: C.cream, whiteSpace: "nowrap", marginLeft: "8px" }}>€{item.price * item.qty}</span>
                </div>
              );
            })}

            <div style={{ paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${C.br1}`, paddingTop: "12px", marginTop: "4px" }}>
                <span style={{ fontSize: "15px", color: C.cream }}>Total</span>
                <span style={{ fontSize: "24px", color: C.cream }}>€{grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: "10px", color: C.dim2, margin: "2px 0 0" }}>TVA 5,5% incluse</p>
            </div>
          </div>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
