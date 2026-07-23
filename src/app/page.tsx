"use client";
import { useState, useEffect, useRef } from "react";

const CART_KEY = "annam_cart";

const API = process.env.NEXT_PUBLIC_API_URL || "https://ca-phe-viet.onrender.com";

const PRODUCTS = [
  {
    sku: "PURE_AROMA",
    name: "Pure Aroma",
    origin: "Arabica · Cầu Đất · 1 500m",
    price: 32,
    notes: "Floral · Jasmin · Doux",
    badge: "Floral",
    accent: "#6aaa44",
  },
  {
    sku: "HIGH_KICK",
    name: "High Kick",
    origin: "Robusta · Đắk Lắk · Hauts Plateaux",
    price: 28,
    notes: "Corsé · Crème · 2× caféine",
    badge: "Puissant",
    accent: "#c05050",
  },
  {
    sku: "RUM_BLEND",
    name: "Rum Blend",
    origin: "Arabica + Robusta · Arôme Rhum",
    price: 35,
    notes: "Vanille · Rhum · Latte & cocktail",
    badge: "Signature ★",
    accent: "#c8850a",
  },
];

type CartItem = { sku: string; name: string; price: number; qty: number };

export default function Home() {
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]   = useState(false);
  const [step, setStep]           = useState<"cart"|"review"|"form"|"paying">("cart");
  const [email, setEmail]         = useState("");
  const [sending, setSending]     = useState(false);
  const [waitEmail, setWaitEmail] = useState("");
  const [waitDone, setWaitDone]   = useState(false);
  const [flash, setFlash]         = useState<string|null>(null);
  const [stripeErr, setStripeErr] = useState("");
  const [savedBanner, setSavedBanner] = useState(false);
  const mounted = useRef(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setCart(parsed);
          setSavedBanner(true);
          setTimeout(() => setSavedBanner(false), 4000);
        }
      }
    } catch {}
    mounted.current = true;
  }, []);

  // Save cart to localStorage on every change (after mount)
  useEffect(() => {
    if (!mounted.current) return;
    if (cart.length > 0) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_KEY);
    }
  }, [cart]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(p: typeof PRODUCTS[0]) {
    setCart(prev => {
      const ex = prev.find(i => i.sku === p.sku);
      if (ex) return prev.map(i => i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { sku: p.sku, name: p.name, price: p.price, qty: 1 }];
    });
    setFlash(p.sku);
    setTimeout(() => setFlash(null), 1500);
    setCartOpen(true);
    setStep("cart");
  }

  function updateQty(sku: string, d: number) {
    setCart(prev =>
      prev.map(i => i.sku === sku ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0)
    );
  }

  async function goToStripe() {
    if (!email.trim() || !cart.length) return;
    setSending(true);
    setStripeErr("");
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
        setStep("paying");
        localStorage.removeItem(CART_KEY);
        window.location.href = data.url;
      } else {
        setStripeErr(data.error || "Erreur de paiement. Réessayez.");
        setSending(false);
      }
    } catch {
      setStripeErr("Connexion impossible. Réessayez.");
      setSending(false);
    }
  }

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch(`${API}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitEmail, source: "waitlist" }),
      });
    } catch {}
    setWaitDone(true);
  }

  const C = {
    bg:"#060402", bg2:"#0e0805", bg3:"#1a0e08",
    br1:"#2C1503", br2:"#8B5A2B",
    gold:"#c8a87a", gold2:"#a07850",
    cream:"#F5E6C8", dim:"#9a8070", dim2:"#6a5040",
  };

  return (
    <div style={{ fontFamily:"Georgia,serif", background:C.bg, minHeight:"100vh", color:C.cream }}>

      {/* ── NAV ── */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 32px", height:"60px",
        background:C.bg2, borderBottom:`1px solid ${C.br1}`,
        position:"sticky", top:0, zIndex:50,
      }}>
        <span style={{ fontSize:"20px", letterSpacing:".15em" }}>ANNAM</span>

        <button onClick={() => { setCartOpen(true); setStep("cart"); }} style={{
          display:"flex", alignItems:"center", gap:"10px",
          background: count > 0 ? C.br2 : C.br1,
          border:`1px solid ${C.br2}`,
          color:C.cream, padding:"10px 22px",
          cursor:"pointer", fontSize:"13px", letterSpacing:".1em",
          fontFamily:"Georgia,serif", transition:"background .2s",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Panier
          {count > 0 && (
            <span style={{
              background:C.gold, color:C.bg, borderRadius:"50%",
              width:"20px", height:"20px", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"11px", fontFamily:"sans-serif", fontWeight:700,
            }}>{count}</span>
          )}
        </button>
      </nav>

      {/* ── SAVED CART BANNER ── */}
      {savedBanner && (
        <div style={{
          background:"#1a0d06", borderBottom:`1px solid ${C.br2}`,
          padding:"10px 24px", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:"12px",
        }}>
          <span style={{ fontSize:"13px", color:C.gold }}>
            ☕ Votre panier vous attend — {cart.reduce((s,i)=>s+i.qty,0)} article{cart.reduce((s,i)=>s+i.qty,0)>1?"s":""}
          </span>
          <button onClick={() => { setCartOpen(true); setSavedBanner(false); }} style={{
            background:C.br2, border:"none", color:C.cream,
            padding:"6px 16px", cursor:"pointer", fontSize:"11px",
            letterSpacing:".12em", textTransform:"uppercase", fontFamily:"Georgia,serif",
          }}>Voir →</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        textAlign:"center", padding:"60px 24px 48px",
        background:`radial-gradient(ellipse at 50% 0%, #1a0d06 0%, ${C.bg} 65%)`,
        borderBottom:`1px solid ${C.br1}`,
      }}>
        <p style={{ fontSize:"9px", letterSpacing:".5em", color:C.gold2, marginBottom:"14px", textTransform:"uppercase" }}>
          Maison de Café Vietnamien
        </p>
        <h1 style={{ fontSize:"clamp(52px,9vw,100px)", fontWeight:400, letterSpacing:".12em", margin:"0 0 12px", lineHeight:1 }}>
          ANNAM
        </h1>
        <p style={{ fontSize:"15px", color:C.gold, maxWidth:"420px", margin:"0 auto 32px", lineHeight:1.8 }}>
          L&apos;intensité des hauts plateaux vietnamiens, livrée en France.
        </p>
        <a href="#boutique" style={{
          display:"inline-block", padding:"12px 32px",
          background:C.br1, border:`1px solid ${C.br2}`,
          color:C.cream, fontSize:"11px", letterSpacing:".15em",
          textTransform:"uppercase", textDecoration:"none",
        }}>
          Voir les cafés ↓
        </a>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="boutique" style={{ maxWidth:"1080px", margin:"0 auto", padding:"48px 20px" }}>
        <p style={{ textAlign:"center", fontSize:"9px", letterSpacing:".4em", color:C.gold2, textTransform:"uppercase", marginBottom:"36px" }}>
          3 références · Sachet 250g · Livraison France
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"20px" }}>
          {PRODUCTS.map(p => (
            <div key={p.sku} style={{
              background:C.bg3,
              border:`1px solid ${flash===p.sku ? p.accent : C.br1}`,
              transition:"border-color .3s",
            }}>
              <div style={{ height:"3px", background:p.accent }} />
              <div style={{ padding:"20px 22px" }}>
                <span style={{
                  background:p.accent+"22", border:`1px solid ${p.accent}`,
                  fontSize:"9px", padding:"3px 10px", letterSpacing:".12em",
                  color:p.accent, textTransform:"uppercase", display:"inline-block", marginBottom:"12px",
                }}>{p.badge}</span>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"4px" }}>
                  <h3 style={{ fontSize:"26px", fontWeight:400, margin:0, color:C.cream }}>{p.name}</h3>
                  <span style={{ fontSize:"30px", fontWeight:300, color:C.cream, lineHeight:1 }}>€{p.price}</span>
                </div>

                <p style={{ fontSize:"10px", color:C.gold2, letterSpacing:".12em", textTransform:"uppercase", margin:"0 0 8px" }}>{p.origin}</p>
                <p style={{ fontSize:"12px", color:C.gold, margin:"0 0 18px" }}>{p.notes}</p>

                <button onClick={() => addToCart(p)} style={{
                  width:"100%", padding:"14px 0",
                  background: flash===p.sku ? p.accent : "transparent",
                  border:`2px solid ${flash===p.sku ? p.accent : C.br2}`,
                  color:C.cream, fontSize:"13px", letterSpacing:".18em",
                  textTransform:"uppercase", cursor:"pointer",
                  fontFamily:"Georgia,serif", transition:"all .25s",
                }}>
                  {flash===p.sku ? "✓ Ajouté !" : "Ajouter au panier"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section style={{
        background:C.bg2, padding:"52px 24px",
        textAlign:"center", borderTop:`1px solid ${C.br1}`,
      }}>
        <h2 style={{ fontSize:"22px", fontWeight:400, marginBottom:"8px" }}>Liste prioritaire</h2>
        <p style={{ color:C.dim, marginBottom:"24px", fontSize:"14px" }}>
          Accès avant-première · <strong style={{ color:C.gold }}>−10%</strong> sur votre première commande
        </p>
        {!waitDone ? (
          <form onSubmit={submitWaitlist} style={{ display:"flex", maxWidth:"380px", margin:"0 auto" }}>
            <input
              type="email" required placeholder="votre@email.com" value={waitEmail}
              onChange={e => setWaitEmail(e.target.value)}
              style={{
                flex:1, padding:"12px 14px", background:C.bg,
                border:`1px solid ${C.br1}`, borderRight:"none",
                color:C.cream, fontSize:"14px",
              }}
            />
            <button type="submit" style={{
              padding:"12px 22px", background:C.br2, border:`1px solid ${C.br2}`,
              color:C.cream, fontSize:"11px", letterSpacing:".15em",
              textTransform:"uppercase", cursor:"pointer", fontFamily:"Georgia,serif",
              whiteSpace:"nowrap",
            }}>
              Rejoindre
            </button>
          </form>
        ) : (
          <p style={{ color:C.gold, fontSize:"16px" }}>☕ Parfait — nous vous contacterons en priorité.</p>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"24px", textAlign:"center", borderTop:`1px solid ${C.bg3}` }}>
        <p style={{ fontSize:"10px", color:C.dim2, letterSpacing:".15em" }}>
          ANNAM · Maison de Café Vietnamien · France · © 2026
        </p>
        <p style={{ fontSize:"9px", color:C.dim2, marginTop:"6px", opacity:.5 }}>
          Paiement sécurisé par Stripe · TVA incluse
        </p>
      </footer>

      {/* ══ OVERLAY ══ */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:200, backdropFilter:"blur(3px)" }}
        />
      )}

      {/* ══ CART DRAWER ══ */}
      <aside style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:"min(420px,100vw)",
        background:C.bg2, borderLeft:`1px solid ${C.br1}`,
        zIndex:201,
        transform: cartOpen ? "translateX(0)" : "translateX(100%)",
        transition:"transform .28s cubic-bezier(.4,0,.2,1)",
        display:"flex", flexDirection:"column",
      }}>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 24px", borderBottom:`1px solid ${C.br1}`, flexShrink:0,
        }}>
          <h2 style={{ fontSize:"14px", letterSpacing:".2em", textTransform:"uppercase", fontWeight:400, margin:0 }}>
            {step==="paying" ? "Redirection…" : step==="form" ? "Paiement" : step==="review" ? "Récapitulatif" : `Mon panier${count>0?` (${count})`:"" }`}
          </h2>
          <button onClick={() => setCartOpen(false)} style={{
            background:"none", border:"none", color:C.dim,
            cursor:"pointer", fontSize:"22px", lineHeight:1, padding:"2px 6px",
          }}>×</button>
        </div>

        {/* ─ STEP CART ─ */}
        {step==="cart" && (
          <>
            <div style={{ flex:1, overflowY:"auto", padding:"16px 24px" }}>
              {cart.length===0 ? (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <p style={{ fontSize:"40px", marginBottom:"12px" }}>🛒</p>
                  <p style={{ color:C.dim, fontSize:"14px", marginBottom:"20px" }}>Votre panier est vide</p>
                  <button onClick={() => setCartOpen(false)} style={{
                    background:"none", border:`1px solid ${C.br2}`,
                    color:C.gold, padding:"10px 24px", cursor:"pointer",
                    fontSize:"11px", letterSpacing:".15em", textTransform:"uppercase", fontFamily:"Georgia,serif",
                  }}>Choisir un café</button>
                </div>
              ) : (
                cart.map(item => {
                  const prod = PRODUCTS.find(p => p.sku===item.sku)!;
                  return (
                    <div key={item.sku} style={{ padding:"16px 0", borderBottom:`1px solid ${C.br1}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px" }}>
                        <div>
                          <p style={{ fontSize:"16px", color:C.cream, marginBottom:"2px" }}>{item.name}</p>
                          <p style={{ fontSize:"10px", color:C.gold2, letterSpacing:".1em" }}>{prod.origin}</p>
                        </div>
                        <button onClick={() => updateQty(item.sku, -item.qty)} style={{
                          background:"none", border:"none", color:C.dim2, cursor:"pointer", fontSize:"18px", padding:"0 4px",
                        }}>×</button>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", border:`1px solid ${C.br1}` }}>
                          {([-1, +1] as const).map((d) => (
                            <button key={d} onClick={() => updateQty(item.sku, d)} style={{
                              background:"none", border:"none", color:C.cream, cursor:"pointer",
                              width:"36px", height:"36px", fontSize:"18px",
                              borderRight: d===-1 ? `1px solid ${C.br1}` : "none",
                              borderLeft:  d===+1 ? `1px solid ${C.br1}` : "none",
                              fontFamily:"Georgia,serif",
                            }}>{d===-1 ? "−" : "+"}</button>
                          ))}
                          <span style={{ width:"32px", textAlign:"center", color:C.cream, fontSize:"14px" }}>{item.qty}</span>
                        </div>
                        <span style={{ fontSize:"20px", color:C.cream }}>€{item.price*item.qty}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length>0 && (
              <div style={{ padding:"20px 24px", borderTop:`1px solid ${C.br1}`, flexShrink:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={{ fontSize:"13px", color:C.dim }}>Livraison</span>
                  <span style={{ fontSize:"13px", color: total>=60 ? "#7ab85a" : C.gold }}>
                    {total>=60 ? "Offerte ✓" : `Offerte dès €60 (il manque €${60-total})`}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px", paddingTop:"14px", borderTop:`1px solid ${C.br1}` }}>
                  <span style={{ fontSize:"15px", color:C.cream }}>Total</span>
                  <span style={{ fontSize:"24px", color:C.cream }}>€{total}</span>
                </div>
                <button onClick={() => setStep("review")} style={{
                  width:"100%", padding:"15px", background:C.br2,
                  border:"none", color:C.cream, fontSize:"12px",
                  letterSpacing:".2em", textTransform:"uppercase",
                  cursor:"pointer", fontFamily:"Georgia,serif",
                }}>
                  Commander →
                </button>
              </div>
            )}
          </>
        )}

        {/* ─ STEP REVIEW ─ */}
        {step==="review" && (
          <>
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
              <p style={{ fontSize:"9px", letterSpacing:".35em", color:C.gold2, textTransform:"uppercase", marginBottom:"16px" }}>
                Vérifiez votre commande
              </p>

              {/* Products table */}
              <div style={{ border:`1px solid ${C.br1}` }}>
                {/* Header */}
                <div style={{
                  display:"grid", gridTemplateColumns:"1fr auto auto",
                  padding:"8px 14px", background:C.bg3,
                  borderBottom:`1px solid ${C.br1}`,
                  fontSize:"9px", letterSpacing:".2em", color:C.gold2, textTransform:"uppercase",
                }}>
                  <span>Produit</span>
                  <span style={{ textAlign:"center", minWidth:"60px" }}>Qté</span>
                  <span style={{ textAlign:"right", minWidth:"60px" }}>Total</span>
                </div>

                {/* Rows */}
                {cart.map((item) => {
                  const prod = PRODUCTS.find(p => p.sku === item.sku)!;
                  return (
                    <div key={item.sku} style={{
                      display:"grid", gridTemplateColumns:"1fr auto auto",
                      padding:"14px", borderBottom:`1px solid ${C.br1}`,
                      alignItems:"center",
                    }}>
                      <div>
                        <p style={{ fontSize:"15px", color:C.cream, margin:0, marginBottom:"3px" }}>{item.name}</p>
                        <p style={{ fontSize:"9px", color:C.gold2, margin:0, letterSpacing:".1em" }}>{prod.origin}</p>
                        <p style={{ fontSize:"11px", color:C.dim, margin:0 }}>€{item.price} / sachet</p>
                      </div>

                      {/* Qty controls inline */}
                      <div style={{ display:"flex", alignItems:"center", border:`1px solid ${C.br1}`, margin:"0 16px" }}>
                        <button onClick={() => updateQty(item.sku, -1)} style={{
                          background:"none", border:"none", color:C.cream, cursor:"pointer",
                          width:"28px", height:"28px", fontSize:"16px",
                          borderRight:`1px solid ${C.br1}`, fontFamily:"Georgia,serif",
                        }}>−</button>
                        <span style={{ width:"28px", textAlign:"center", color:C.cream, fontSize:"14px" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.sku, +1)} style={{
                          background:"none", border:"none", color:C.cream, cursor:"pointer",
                          width:"28px", height:"28px", fontSize:"16px",
                          borderLeft:`1px solid ${C.br1}`, fontFamily:"Georgia,serif",
                        }}>+</button>
                      </div>

                      <span style={{ fontSize:"16px", color:C.cream, textAlign:"right", minWidth:"60px" }}>
                        €{item.price * item.qty}
                      </span>
                    </div>
                  );
                })}

                {/* Total row */}
                <div style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"14px 14px", background:C.bg3,
                }}>
                  <div>
                    <span style={{ fontSize:"13px", color:C.dim }}>Livraison </span>
                    <span style={{ fontSize:"13px", color: total>=60 ? "#7ab85a" : C.gold }}>
                      {total>=60 ? "offerte ✓" : `offerte dès €60`}
                    </span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:"10px", color:C.dim2, margin:0, marginBottom:"2px" }}>Total</p>
                    <p style={{ fontSize:"24px", color:C.cream, margin:0 }}>€{total}</p>
                  </div>
                </div>
              </div>

              <p style={{ fontSize:"11px", color:C.dim2, marginTop:"16px", lineHeight:1.7 }}>
                Sachet 250g · Café torréfié artisanalement au Vietnam · Livraison 5–8j
              </p>
            </div>

            <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.br1}`, display:"flex", flexDirection:"column", gap:"10px", flexShrink:0 }}>
              <button onClick={() => setStep("form")} style={{
                width:"100%", padding:"15px", background:C.br2,
                border:"none", color:C.cream, fontSize:"12px",
                letterSpacing:".2em", textTransform:"uppercase",
                cursor:"pointer", fontFamily:"Georgia,serif",
              }}>
                Procéder au paiement →
              </button>
              <button onClick={() => setStep("cart")} style={{
                background:"none", border:"none", color:C.dim,
                cursor:"pointer", fontSize:"12px", fontFamily:"Georgia,serif", padding:"4px",
              }}>
                ← Modifier le panier
              </button>
            </div>
          </>
        )}

        {/* ─ STEP FORM ─ */}
        {step==="form" && (
          <>
            <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
              {/* Mini recap */}
              <div style={{ background:C.bg3, border:`1px solid ${C.br1}`, padding:"10px 14px", marginBottom:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"12px", color:C.dim }}>{count} article{count>1?"s":""}</span>
                <span style={{ fontSize:"18px", color:C.cream }}>€{total}</span>
              </div>

              <label style={{ fontSize:"10px", letterSpacing:".25em", color:C.gold2, textTransform:"uppercase", display:"block", marginBottom:"8px" }}>
                Votre email
              </label>
              <input
                type="email" placeholder="votre@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoFocus
                style={{
                  width:"100%", padding:"13px 14px",
                  background:C.bg, border:`1px solid ${email ? C.br2 : C.br1}`,
                  color:C.cream, fontSize:"14px", marginBottom:"8px",
                  boxSizing:"border-box" as const,
                  fontFamily:"Georgia,serif", transition:"border-color .2s",
                }}
              />

              {stripeErr && (
                <p style={{ color:"#c05050", fontSize:"12px", marginBottom:"8px", padding:"10px 14px", background:"#2a0808", border:"1px solid #5a1010" }}>
                  ⚠ {stripeErr}
                </p>
              )}

              <p style={{ fontSize:"11px", color:C.dim2, lineHeight:1.7 }}>
                Vous serez redirigé vers le paiement sécurisé Stripe.
              </p>

              {/* Trust badges */}
              <div style={{ display:"flex", gap:"16px", marginTop:"20px", padding:"14px", background:C.bg3, border:`1px solid ${C.br1}` }}>
                {[
                  ["🔒", "Paiement sécurisé"],
                  ["📦", "Livraison 5–8j"],
                  ["↩", "Retour facile"],
                ].map(([icon, txt]) => (
                  <div key={txt} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ fontSize:"18px", marginBottom:"4px" }}>{icon}</div>
                    <div style={{ fontSize:"9px", color:C.dim2, letterSpacing:".08em" }}>{txt}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding:"20px 24px", borderTop:`1px solid ${C.br1}`, display:"flex", flexDirection:"column", gap:"10px", flexShrink:0 }}>
              <button onClick={goToStripe} disabled={!email.trim()||sending} style={{
                width:"100%", padding:"15px",
                background: email.trim() && !sending ? "#635BFF" : C.br1,
                border:"none", color:"#fff", fontSize:"12px",
                letterSpacing:".2em", textTransform:"uppercase",
                cursor: email.trim() && !sending ? "pointer" : "not-allowed",
                fontFamily:"Georgia,serif", opacity: sending ? .7 : 1,
                display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
              }}>
                {sending ? (
                  <>
                    <span style={{ display:"inline-block", width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
                    Redirection…
                  </>
                ) : (
                  <>Payer €{total} →</>
                )}
              </button>
              <button onClick={() => setStep("cart")} style={{
                background:"none", border:"none", color:C.dim,
                cursor:"pointer", fontSize:"12px", fontFamily:"Georgia,serif", padding:"6px",
              }}>
                ← Retour au panier
              </button>
            </div>
          </>
        )}

        {/* ─ STEP PAYING ─ */}
        {step==="paying" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", textAlign:"center" }}>
            <div style={{
              width:"48px", height:"48px", border:`3px solid ${C.br1}`, borderTopColor:C.gold,
              borderRadius:"50%", animation:"spin 0.8s linear infinite", marginBottom:"24px",
            }} />
            <p style={{ color:C.gold, fontSize:"16px", marginBottom:"8px" }}>Redirection vers Stripe…</p>
            <p style={{ color:C.dim2, fontSize:"12px" }}>Paiement 100% sécurisé</p>
          </div>
        )}
      </aside>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
