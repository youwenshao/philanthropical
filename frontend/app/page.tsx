import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold">Philanthropical</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transparent charity platform powered by blockchain. 
            Make donations with full transparency and track impact in real-time.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/donate">
              <Button size="lg">Make a Donation</Button>
            </Link>
            <Link href="/transparency">
              <Button size="lg" variant="outline">View Transparency</Button>
            </Link>
          </div>

          <div className="mt-12">
            <ConnectButton />
          </div>
        </div>
      </div>
    </main>
  );
}

