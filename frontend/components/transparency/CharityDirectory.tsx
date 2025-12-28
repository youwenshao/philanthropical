"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharities } from "@/hooks/useCharities";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export function CharityDirectory() {
  const { data: charities, isLoading } = useCharities();

  const verifiedCharities = charities?.filter((c) => c.verificationStatus === "approved") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verified Charities</CardTitle>
        <CardDescription>All approved charities on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : verifiedCharities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No verified charities yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {verifiedCharities.map((charity) => (
              <Link
                key={charity.address}
                href={`/charities/${charity.address}`}
                className="block border rounded-lg p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{charity.name}</h3>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {charity.description || "No description available"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reputation: {charity.reputationScore}/1000
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

