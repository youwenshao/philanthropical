"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, ExternalLink } from "lucide-react";
import { formatUSDC } from "@/lib/tokens/usdc";
import { Address } from "viem";
import Link from "next/link";
import { useChainId } from "wagmi";

interface ReceiptDisplayProps {
  donationId: bigint;
  receiptTokenId: bigint;
  charityAddress: Address;
  charityName?: string;
  amount: bigint;
  transactionHash: string;
  timestamp: Date;
  chainId: number;
}

export function ReceiptDisplay({
  donationId,
  receiptTokenId,
  charityAddress,
  charityName,
  amount,
  transactionHash,
  timestamp,
  chainId: propChainId,
}: ReceiptDisplayProps) {
  const chainId = useChainId();
  const effectiveChainId = propChainId || chainId;
  const explorerUrl =
    effectiveChainId === 80002
      ? `https://amoy.polygonscan.com/tx/${transactionHash}`
      : `https://polygonscan.com/tx/${transactionHash}`;

  const downloadReceipt = () => {
    const receipt = {
      donationId: donationId.toString(),
      receiptTokenId: receiptTokenId.toString(),
      charityAddress,
      charityName,
      amount: formatUSDC(amount),
      transactionHash,
      timestamp: timestamp.toISOString(),
      chainId,
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donation-receipt-${donationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Donation Successful!
          </CardTitle>
          <Badge variant="default" className="bg-green-500">
            NFT Receipt #{receiptTokenId.toString()}
          </Badge>
        </div>
        <CardDescription>Your donation has been recorded on-chain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Donation ID</p>
            <p className="font-mono text-sm">{donationId.toString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-semibold">{formatUSDC(amount)} USDC</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Charity</p>
            <p className="font-mono text-sm truncate">{charityName || charityAddress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="text-sm">{timestamp.toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Transaction Hash</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs bg-muted p-2 rounded truncate">
              {transactionHash}
            </code>
            <Link href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={downloadReceipt} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Link href="/transparency" className="flex-1">
            <Button variant="default" className="w-full">
              View Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

