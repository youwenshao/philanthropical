import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: "Philanthropical - Transparent Charity Platform",
  description: "Blockchain-based transparent charity platform reducing fraud in cross-border donations",
  keywords: ["charity", "blockchain", "donation", "transparency", "crypto"],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for blockchain RPCs */}
        <link rel="dns-prefetch" href="https://polygon-amoy.g.alchemy.com" />
        <link rel="dns-prefetch" href="https://rpc.ankr.com" />
      </head>
      <body className={inter.className}>
        <Providers>
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                Philanthropical
              </Link>
              <div className="flex gap-4">
                <Link href="/donate">
                  <Button variant="ghost">Donate</Button>
                </Link>
                <Link href="/transparency">
                  <Button variant="ghost">Transparency</Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              </div>
            </div>
          </nav>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

