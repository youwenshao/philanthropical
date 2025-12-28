"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDonations } from "@/hooks/useDonations";
import { useCharities } from "@/hooks/useCharities";
import { formatUSDC } from "@/lib/tokens/usdc";
import { Loader2 } from "lucide-react";
import { formatUnits } from "viem";

export default function AdminDashboard() {
  const { data: donations, isLoading: donationsLoading } = useDonations({ limit: 10 });
  const { data: charities, isLoading: charitiesLoading } = useCharities();

  const totalDonations = donations?.reduce((sum, d) => {
    try {
      return sum + BigInt(d.amount || "0");
    } catch {
      return sum;
    }
  }, 0n) || 0n;
  const totalCharities = charities?.length || 0;
  const verifiedCharities = charities?.filter((c) => c.verificationStatus === "approved").length || 0;

  if (donationsLoading || charitiesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">Platform statistics and recent activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Donations</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatUSDC(totalDonations)} USDC</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Charities</CardTitle>
            <CardDescription>Registered organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCharities}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {verifiedCharities} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Last 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{donations?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donations && donations.length > 0 ? (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{formatUSDC(BigInt(donation.amount))} USDC</p>
                    <p className="text-sm text-muted-foreground">
                      To: {donation.charityAddress}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No donations yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

