import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Philanthropical - Transparent Charity Platform",
  description: "Blockchain-based transparent charity platform reducing fraud in cross-border donations",
  keywords: ["charity", "blockchain", "donation", "transparency", "crypto"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
        </Providers>
      </body>
    </html>
  );
}

