"use client";

import { useState } from "react";
import { Address } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useCharities } from "@/hooks/useCharities";

interface Charity {
  address: Address;
  name: string;
  description: string;
  verificationStatus: "pending" | "approved" | "rejected" | "challenged" | "suspended";
  reputationScore: number;
}

interface CharitySelectorProps {
  selectedCharity: Address | null;
  onSelect: (charity: Address) => void;
}

export function CharitySelector({ selectedCharity, onSelect }: CharitySelectorProps) {
  const { data: charities, isLoading, error } = useCharities();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">Loading charities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load charities: {error.message}</AlertDescription>
      </Alert>
    );
  }

  // Filter to only show approved charities
  const approvedCharities = charities?.filter((c: Charity) => c.verificationStatus === "approved") || [];

  if (approvedCharities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No verified charities available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select a Charity</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {approvedCharities.map((charity: Charity) => (
          <Card
            key={charity.address}
            className={`cursor-pointer transition-all ${
              selectedCharity === charity.address
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            }`}
            onClick={() => onSelect(charity.address)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{charity.name}</CardTitle>
                {getStatusBadge(charity.verificationStatus)}
              </div>
              <CardDescription className="line-clamp-2">
                {charity.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Reputation: {charity.reputationScore}/1000
                </span>
                {selectedCharity === charity.address && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

