import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Noto'g'ri fe'llar — 5 bosqichli mashq",
  description:
    "116 ta ingliz tili noto'g'ri fe'lini kartochka, juftlash, yozish, tezlik va test rejimlarida o'zbek tilidagi tarjimasi bilan yodlang.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Noto'g'ri fe'llar",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS ignores SVG for the home-screen icon, so this must be a PNG.
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays available on purpose: blocking it (maximumScale: 1 +
  // userScalable: false) fails WCAG 1.4.4 and hurts anyone reading small text.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark">
      <body className="font-sans bg-dark-bg text-dark-text antialiased selection:bg-brand-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
