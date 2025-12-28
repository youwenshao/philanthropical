"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDonations } from "@/hooks/useDonations";
import { useCharities } from "@/hooks/useCharities";
import { formatUSDC } from "@/lib/tokens/usdc";
import { Loader2 } from "lucide-react";
import { formatUnits } from "viem";

export function ImpactMetrics() {
  const { data: donations, isLoading: donationsLoading } = useDonations();
  const { data: charities, isLoading: charitiesLoading } = useCharities();

  if (donationsLoading || charitiesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalDonated = donations?.reduce((sum, d) => {
    // Amount is stored as string, convert to bigint
    try {
      return sum + BigInt(d.amount);
    } catch {
      return sum;
    }
  }, 0n) || 0n;
  const totalDonations = donations?.length || 0;
  const totalCharities = charities?.filter((c) => c.verificationStatus === "approved").length || 0;
  const avgDonation = totalDonations > 0 ? totalDonated / BigInt(totalDonations) : 0n;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Donated</CardTitle>
          <CardDescription>All time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatUSDC(totalDonated)} USDC</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Donations</CardTitle>
          <CardDescription>Number of transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDonations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verified Charities</CardTitle>
          <CardDescription>Active organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCharities}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Average Donation</CardTitle>
          <CardDescription>Per transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatUSDC(avgDonation)} USDC</div>
        </CardContent>
      </Card>
    </div>
  );
}

