"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDonations } from "@/hooks/useDonations";
import { useCharities } from "@/hooks/useCharities";
import { formatUSDC } from "@/lib/tokens/usdc";
import { Loader2 } from "lucide-react";
import { Address } from "viem";

export function DonationFlowChart() {
  const { data: donations, isLoading: donationsLoading } = useDonations();
  const { data: charities, isLoading: charitiesLoading } = useCharities();

  if (donationsLoading || charitiesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donation Flow</CardTitle>
          <CardDescription>Visualization of donation distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate donations per charity
  const charityDonations = new Map<string, bigint>();
  donations?.forEach((donation) => {
    const current = charityDonations.get(donation.charityAddress) || 0n;
    try {
      charityDonations.set(donation.charityAddress, current + BigInt(donation.amount));
    } catch {
      // Skip invalid amounts
    }
  });

  // Get top charities
  const topCharities = Array.from(charityDonations.entries())
    .sort((a, b) => {
      if (a[1] > b[1]) return -1;
      if (a[1] < b[1]) return 1;
      return 0;
    })
    .slice(0, 10)
    .map(([address, amount]) => {
      const charity = charities?.find((c) => c.address.toLowerCase() === address.toLowerCase());
      return {
        name: charity?.name || address.slice(0, 10) + "...",
        address,
        amount,
      };
    });

  const total = topCharities.reduce((sum, c) => sum + c.amount, 0n);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Charities by Donations</CardTitle>
        <CardDescription>Distribution of donations across charities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCharities.map((charity) => {
            const percentage = total > 0n ? Number((charity.amount * 100n) / total) : 0;
            return (
              <div key={charity.address} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{charity.name}</span>
                  <span>{formatUSDC(charity.amount)} USDC ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

