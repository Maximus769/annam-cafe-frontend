"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const C = {
  bg:"#060402", bg2:"#0e0805", bg3:"#1a0e08",
  br1:"#2C1503", br2:"#8B5A2B",
  gold:"#c8a87a", gold2:"#a07850",
  cream:"#F5E6C8", dim:"#9a8070", dim2:"#6a5040",
};

function SuccessContent() {
  const params = useSearchParams();
  const ref    = params.get("ref") || "";

  return (
    <div style={{ fontFamily:"Georgia,serif", background:C.bg, minHeight:"100vh", color:C.cream, display:"flex", flexDirection:"column" }}>
      <nav style={{
        display:"flex", alignItems:"center", padding:"0 32px", height:"60px",
        background:C.bg2, borderBottom:`1px solid ${C.br1}`,
      }}>
        <a href="/" style={{ fontSize:"20px", letterSpacing:".15em", color:C.cream, textDecoration:"none" }}>ANNAM</a>
      </nav>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", textAlign:"center" }}>
        <div style={{
          width:"80px", height:"80px", background:C.bg3, border:`1px solid #3a7020`,
          borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"36px", marginBottom:"28px",
        }}>☕</div>

        <p style={{ fontSize:"9px", letterSpacing:".5em", color:"#7ab85a", textTransform:"uppercase", marginBottom:"12px" }}>
          Paiement confirmé
        </p>
        <h1 style={{ fontSize:"32px", fontWeight:400, letterSpacing:".1em", marginBottom:"16px" }}>Merci pour votre commande !</h1>

        {ref && (
          <div style={{ background:C.bg3, border:`1px solid ${C.br1}`, padding:"14px 28px", marginBottom:"24px", display:"inline-block" }}>
            <p style={{ fontSize:"9px", color:C.dim2, letterSpacing:".3em", textTransform:"uppercase", marginBottom:"4px" }}>Référence</p>
            <p style={{ fontSize:"16px", color:C.gold, letterSpacing:".1em" }}>{ref}</p>
          </div>
        )}

        <p style={{ color:C.dim, fontSize:"14px", lineHeight:1.9, maxWidth:"380px", marginBottom:"32px" }}>
          Un email de confirmation a été envoyé à votre adresse.<br/>
          Livraison en France sous <strong style={{ color:C.cream }}>5–8 jours ouvrés</strong>.
        </p>

        <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", justifyContent:"center" }}>
          <a href="/" style={{
            display:"inline-block", padding:"13px 32px",
            background:C.br2, border:`1px solid ${C.br2}`,
            color:C.cream, fontSize:"11px", letterSpacing:".18em",
            textTransform:"uppercase", textDecoration:"none",
          }}>
            ← Retour à la boutique
          </a>
        </div>

        <p style={{ fontSize:"10px", color:C.dim2, marginTop:"40px", opacity:.6 }}>
          Des questions ? contact@annam.fr
        </p>
      </div>

      <footer style={{ padding:"20px", textAlign:"center", borderTop:`1px solid ${C.bg3}` }}>
        <p style={{ fontSize:"10px", color:C.dim2, letterSpacing:".15em" }}>
          ANNAM · Maison de Café Vietnamien · France · © 2026
        </p>
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ background:"#060402", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:"#F5E6C8" }}>
        Chargement…
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
