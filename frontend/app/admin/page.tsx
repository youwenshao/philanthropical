"use client";

import { useAccount } from "wagmi";
import { isAdminAddress } from "@/lib/admin/auth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletConnectionHelp } from "@/components/ui/WalletConnectionHelp";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building2, BarChart3 } from "lucide-react";

export default function AdminPage() {
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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage charities, verifications, and platform settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/admin/dashboard">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <LayoutDashboard className="h-8 w-8 mb-2" />
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                View platform statistics and recent activity
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/charities">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <Building2 className="h-8 w-8 mb-2" />
              <CardTitle>Charity Management</CardTitle>
              <CardDescription>
                Register and manage charity organizations
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader>
            <BarChart3 className="h-8 w-8 mb-2" />
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Advanced analytics and reporting (Coming soon)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Make sure you have configured admin addresses in your environment variables.
            Set <code className="bg-muted px-1 rounded">NEXT_PUBLIC_ADMIN_ADDRESSES</code> with comma-separated wallet addresses.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

