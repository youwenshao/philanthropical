"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDonationFeed } from "@/hooks/useDonationFeed";
import { formatUSDC } from "@/lib/tokens/usdc";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Address } from "viem";

export function DonationFeed() {
  const { donations, isLoading } = useDonationFeed();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Donations</CardTitle>
        <CardDescription>Live feed of all donations</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : donations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No donations yet</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {formatUSDC(BigInt(donation.amount || "0"))} USDC
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To: {donation.charityAddress.slice(0, 10)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(donation.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`https://amoy.polygonscan.com/tx/${donation.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View on Explorer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

