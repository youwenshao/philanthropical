"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { RampNetwork, RampConfig } from "@/lib/onramp/ramp";
import { MoonPay, MoonPayConfig } from "@/lib/onramp/moonpay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

interface OnRampModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (transactionId: string, provider: "ramp" | "moonpay") => void;
  amountUSD?: number;
  preferredProvider?: "ramp" | "moonpay";
}

export function OnRampModal({
  open,
  onClose,
  onSuccess,
  amountUSD,
  preferredProvider = "ramp",
}: OnRampModalProps) {
  const { address } = useAccount();
  const [provider, setProvider] = useState<"ramp" | "moonpay">(preferredProvider);
  const [ramp, setRamp] = useState<RampNetwork | null>(null);
  const [moonpay, setMoonpay] = useState<MoonPay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !address) return;

    const initializeProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize Ramp Network
        const rampConfig: RampConfig = {
          hostApiKey: process.env.NEXT_PUBLIC_RAMP_API_KEY || "",
          hostAppName: "Philanthropical",
          hostLogoUrl: "/logo.png",
          defaultAsset: "USDC_POLYGON",
          userAddress: address,
          defaultFlow: "ONRAMP",
          enabledFlows: ["ONRAMP"],
        };

        const rampInstance = new RampNetwork(rampConfig);
        await rampInstance.initialize();
        setRamp(rampInstance);

        // Initialize MoonPay
        const moonpayConfig: MoonPayConfig = {
          apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "",
          walletAddress: address,
          currencyCode: "usdc_polygon",
          baseCurrencyCode: "usd",
          ...(amountUSD && { baseCurrencyAmount: amountUSD }),
          redirectURL: window.location.origin + "/donate?onramp=success",
        };

        const moonpayInstance = new MoonPay(moonpayConfig);
        setMoonpay(moonpayInstance);
      } catch (err) {
        console.error("Failed to initialize on-ramp providers:", err);
        setError("Failed to initialize payment providers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeProviders();
  }, [open, address, amountUSD]);

  const handleRampOpen = () => {
    if (!ramp) {
      setError("Ramp Network not initialized");
      return;
    }

    try {
      // Set up event listeners
      ramp.on("PURCHASE_CREATED", (data: any) => {
        setTransactionId(data.id);
        if (onSuccess) {
          onSuccess(data.id, "ramp");
        }
      });

      ramp.on("PURCHASE_FAILED", (data: any) => {
        setError(data.message || "Purchase failed");
      });

      ramp.on("PURCHASE_SUCCESSFUL", (data: any) => {
        setTransactionId(data.id);
        if (onSuccess) {
          onSuccess(data.id, "ramp");
        }
      });

      ramp.show();
    } catch (err) {
      console.error("Failed to open Ramp widget:", err);
      setError("Failed to open Ramp Network. Please try MoonPay instead.");
    }
  };

  const handleMoonPayOpen = () => {
    if (!moonpay) {
      setError("MoonPay not initialized");
      return;
    }

    try {
      const windowRef = moonpay.open();
      if (!windowRef) {
        setError("Popup blocked. Please allow popups for this site.");
        return;
      }

      // Listen for messages from MoonPay popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== "https://buy.moonpay.com") return;

        if (event.data.type === "MOONPAY_TRANSACTION_CREATED") {
          setTransactionId(event.data.transactionId);
          if (onSuccess) {
            onSuccess(event.data.transactionId, "moonpay");
          }
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (err) {
      console.error("Failed to open MoonPay:", err);
      setError("Failed to open MoonPay. Please try again.");
    }
  };

  const handleProviderSwitch = () => {
    setProvider(provider === "ramp" ? "moonpay" : "ramp");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy USDC with Fiat</DialogTitle>
          <DialogDescription>
            Choose a provider to purchase USDC on Polygon. You'll need USDC to make donations.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !transactionId && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleRampOpen}
                disabled={!ramp}
                className="w-full"
                variant={provider === "ramp" ? "default" : "outline"}
              >
                Ramp Network
              </Button>
              <Button
                onClick={handleMoonPayOpen}
                disabled={!moonpay}
                className="w-full"
                variant={provider === "moonpay" ? "default" : "outline"}
              >
                MoonPay
              </Button>
            </div>

            <Button
              onClick={handleProviderSwitch}
              variant="ghost"
              className="w-full"
            >
              Switch to {provider === "ramp" ? "MoonPay" : "Ramp Network"}
            </Button>
          </div>
        )}

        {transactionId && (
          <Alert>
            <AlertDescription>
              Transaction created! ID: {transactionId}
              <br />
              Please complete the purchase in the popup window.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}



