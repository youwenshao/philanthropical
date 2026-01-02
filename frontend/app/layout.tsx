import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/footer/Footer";
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0066CC",
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
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

