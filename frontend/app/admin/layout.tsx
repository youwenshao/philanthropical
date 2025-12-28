"use client";

import { useAccount } from "wagmi";
import { isAdminAddress } from "@/lib/admin/auth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletConnectionHelp } from "@/components/ui/WalletConnectionHelp";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Please connect your wallet to access the admin dashboard.</p>
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <ConnectButton />
        </div>
        <WalletConnectionHelp />
      </div>
    );
  }

  if (address && !isAdminAddress(address)) {
    const adminAddresses = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES;
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <p>
              <strong>Unauthorized Access:</strong> Your wallet address ({address}) is not authorized to access the admin dashboard.
            </p>
            {!adminAddresses ? (
              <div className="space-y-2">
                <p>
                  <strong>Configuration Required:</strong> Admin addresses are not configured.
                </p>
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-medium mb-2">To enable admin access:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open <code className="bg-background px-1 rounded">frontend/.env.local</code></li>
                    <li>Add your wallet address: <code className="bg-background px-1 rounded">NEXT_PUBLIC_ADMIN_ADDRESSES={address}</code></li>
                    <li>Restart your development server</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  <strong>Configured Admin Addresses:</strong>
                </p>
                <div className="bg-muted p-3 rounded text-sm">
                  {adminAddresses.split(',').map((addr, idx) => (
                    <div key={idx} className={addr.trim().toLowerCase() === address.toLowerCase() ? 'font-bold text-green-600' : ''}>
                      {addr.trim()}
                      {addr.trim().toLowerCase() === address.toLowerCase() && ' (Your address - should work)'}
                    </div>
                  ))}
                </div>
                <p className="text-sm">
                  Your address doesn't match any configured admin addresses. Please add your address to <code className="bg-background px-1 rounded">NEXT_PUBLIC_ADMIN_ADDRESSES</code>.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <a href="/">Go to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <ConnectButton />
        </div>
      </nav>
      <main className="container mx-auto py-8">{children}</main>
    </div>
  );
}

