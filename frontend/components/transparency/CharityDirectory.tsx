"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharities } from "@/hooks/useCharities";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { getCharityLogo } from "@/lib/charityLogos";

export function CharityDirectory() {
  const { data: charities, isLoading, error } = useCharities();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verified Charities</CardTitle>
          <CardDescription>All approved charities on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center py-8">
            {error.message || "Failed to load charities"}
          </p>
        </CardContent>
      </Card>
    );
  }

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
                <div className="flex items-start gap-3">
                  {(() => {
                    const logoPath = getCharityLogo(charity);
                    return logoPath ? (
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {/* Use img tag for SVGs to avoid Next.js Image optimization issues */}
                        <img
                          src={logoPath}
                          alt={`${charity.name} logo`}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="h-full w-full flex items-center justify-center text-sm font-bold text-primary">${charity.name.charAt(0)}</div>`;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {charity.name.charAt(0)}
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
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



