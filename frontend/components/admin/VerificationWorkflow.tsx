"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Address } from "viem";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { CHARITY_VERIFICATION_ABI } from "@/lib/contracts/charityVerification";

const CHARITY_VERIFICATION_ADDRESS = process.env
  .NEXT_PUBLIC_CHARITY_VERIFICATION_ADDRESS as Address | undefined;

interface VerificationWorkflowProps {
  charityAddress: Address;
}

export function VerificationWorkflow({ charityAddress }: VerificationWorkflowProps) {
  const { address } = useAccount();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleApprove = () => {
    if (!CHARITY_VERIFICATION_ADDRESS) {
      alert("Charity verification contract not configured");
      return;
    }

    setAction("approve");
    writeContract({
      address: CHARITY_VERIFICATION_ADDRESS,
      abi: CHARITY_VERIFICATION_ABI,
      functionName: "approveVerification",
      args: [charityAddress],
    });
  };

  const handleReject = () => {
    if (!CHARITY_VERIFICATION_ADDRESS) {
      alert("Charity verification contract not configured");
      return;
    }

    setAction("reject");
    writeContract({
      address: CHARITY_VERIFICATION_ADDRESS,
      abi: CHARITY_VERIFICATION_ABI,
      functionName: "rejectVerification",
      args: [charityAddress, "Rejected by admin"],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={handleApprove}
          disabled={isPending || isConfirming}
          variant="default"
          className="flex-1"
        >
          {isPending && action === "approve" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </>
          )}
        </Button>
        <Button
          onClick={handleReject}
          disabled={isPending || isConfirming}
          variant="destructive"
          className="flex-1"
        >
          {isPending && action === "reject" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </>
          )}
        </Button>
      </div>

      {isSuccess && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Verification {action === "approve" ? "approved" : "rejected"} successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}



