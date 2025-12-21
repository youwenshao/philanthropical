import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Philanthropical</h1>
        <p className="text-xl mb-8">
          Transparent charity platform powered by blockchain
        </p>
        <ConnectButton />
      </div>
    </main>
  );
}

