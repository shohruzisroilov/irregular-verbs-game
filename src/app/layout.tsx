import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Irregular Verbs - English Learning App",
  description: "Master English irregular verbs easily with interactive flashcards, matching, typing, and speed tests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-dark-bg text-dark-text antialiased selection:bg-brand-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
