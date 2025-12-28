"use client";

import { useParams } from "next/navigation";
import { useCharities } from "@/hooks/useCharities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationWorkflow } from "@/components/admin/VerificationWorkflow";
import { Address } from "viem";
import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";

export default function CharityDetailPage() {
  const params = useParams();
  const charityAddress = params.id as Address;
  const { data: charities } = useCharities();
  const charity = charities?.find((c) => c.address.toLowerCase() === charityAddress.toLowerCase());

  if (!charity) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">{charity.name}</h2>
        <p className="text-muted-foreground">{charity.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Charity Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <code className="text-sm">{charity.address}</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Number</p>
              <p>{charity.registrationNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reputation Score</p>
              <p className="text-2xl font-bold">{charity.reputationScore}/1000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="capitalize">{charity.verificationStatus}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Workflow</CardTitle>
            <CardDescription>Manage charity verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <VerificationWorkflow charityAddress={charityAddress} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

