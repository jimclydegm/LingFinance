import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ling 3 Flash Fin Demo | Financial Reasoning AI",
  description: "Internal demonstration of financial reasoning capabilities of inclusionai/ling-3.0-flash-fin:free via OpenRouter API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#080c14] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
