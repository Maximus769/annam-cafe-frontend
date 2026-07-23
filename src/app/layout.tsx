import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANNAM — Maison de Café Vietnamien",
  description: "Café vietnamien premium livré en France. Arabica Cầu Đất, Robusta Đắk Lắk, Rum Blend. Pure Aroma · High Kick · Rum Blend.",
  openGraph: {
    title: "ANNAM",
    description: "Café vietnamien premium — arômes singuliers, haute caféine",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>
        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${pixelId}');fbq('track','PageView');
          `}</Script>
        )}
        {children}
      </body>
    </html>
  );
}
