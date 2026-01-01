"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WalletConnectionHelpProps {
  variant?: "default" | "compact";
}

export function WalletConnectionHelp({ variant = "default" }: WalletConnectionHelpProps) {
  if (variant === "compact") {
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Tip:</strong> Check your MetaMask extension for a connection popup. Click the MetaMask icon in your browser toolbar if you don't see it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <p className="font-medium">Waiting for wallet connection...</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Click "Connect Wallet" above to start</li>
          <li><strong>Check your MetaMask extension</strong> - a popup will appear asking for permission</li>
          <li>Click "Next" and then "Connect" in the MetaMask popup to approve</li>
          <li>If you don't see a popup, click the MetaMask icon in your browser toolbar</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}



