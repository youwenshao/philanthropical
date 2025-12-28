"use client";

import { useState } from "react";
import { useUSDC } from "@/hooks/useUSDC";
import { useUSDCAllowance } from "@/hooks/useUSDCAllowance";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Address, parseUnits } from "viem";

interface USDCApprovalProps {
  spender: Address; // DonationRegistry contract address
  amount: string; // Amount in USDC (human-readable)
  onApproved?: () => void;
}

export function USDCApproval({ spender, amount, onApproved }: USDCApprovalProps) {
  const { approve, isApproving, isApproved, approvalError, decimals } = useUSDC();
  const { hasSufficientAllowance } = useUSDCAllowance(spender);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      setLocalError(null);
      const amountBigInt = parseUnits(amount, decimals);
      await approve(spender, amountBigInt);
    } catch (error: any) {
      console.error("Approval error:", error);
      setLocalError(error.message || "Failed to approve USDC spending");
    }
  };

  // Check if already approved
  const requiredAmount = parseUnits(amount, decimals);
  const isAlreadyApproved = hasSufficientAllowance(requiredAmount) || isApproved;

  if (isAlreadyApproved) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          USDC spending approved. You can proceed with the donation.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need to approve USDC spending before making a donation. This is a one-time
          transaction per amount.
        </AlertDescription>
      </Alert>

      {(approvalError || localError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{approvalError?.message || localError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleApprove}
        disabled={isApproving}
        className="w-full"
        size="lg"
      >
        {isApproving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Approving...
          </>
        ) : (
          `Approve ${amount} USDC`
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        This will allow the donation contract to spend up to {amount} USDC on your behalf.
      </p>
    </div>
  );
}

