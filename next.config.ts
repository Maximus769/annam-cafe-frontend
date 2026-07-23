import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ca-phe-viet.onrender.com";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Prevent clickjacking
  { key: "X-Frame-Options",           value: "DENY" },
  // Reflect XSS filter (legacy browsers)
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  // HTTPS only (1 year)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // Limit referrer info
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  { key: "Permissions-Policy",        value: "geolocation=(), microphone=(), camera=(), payment=()" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' ${API_URL} https://api.stripe.com https://www.google-analytics.com`,
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "img-src 'self' data: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
  // Prevent exposing server info
  poweredByHeader: false,
};

export default nextConfig;
