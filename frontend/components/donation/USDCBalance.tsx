"use client";

import { useUSDC } from "@/hooks/useUSDC";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";

export function USDCBalance() {
  const { formattedBalance, balance, isLoading } = useUSDC();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            USDC Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          USDC Balance
        </CardTitle>
        <CardDescription>Your current USDC balance on Polygon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formattedBalance} USDC</div>
        {balance !== undefined && balance === 0n && (
          <p className="text-sm text-muted-foreground mt-2">
            You don't have any USDC. Use the on-ramp to purchase some.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

