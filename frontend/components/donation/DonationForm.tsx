"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CharitySelector } from "./CharitySelector";
import { USDCBalance } from "./USDCBalance";
import { USDCApproval } from "./USDCApproval";
import { DonationProgress, DonationStep } from "./DonationProgress";
import { ReceiptDisplay } from "./ReceiptDisplay";
import { OnRampModal } from "./OnRampModal";
import { WalletConnectionHelp } from "@/components/ui/WalletConnectionHelp";
import { useDonation } from "@/hooks/useDonation";
import { useUSDC } from "@/hooks/useUSDC";
import { useWallet } from "@/hooks/useWallet";
import { parseUnits } from "viem";
import { AlertCircle, ArrowRight } from "lucide-react";

const DONATION_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_DONATION_REGISTRY_ADDRESS as Address | undefined;

export function DonationForm() {
  const { address, isConnected } = useAccount();
  const { isCorrectNetwork, switchToAmoy, chainId, isSwitching } = useWallet();
  const { balance, formattedBalance, decimals } = useUSDC();
  const { createDonation, donationState, needsApproval, hasBalance } = useDonation();
  
  // Check if network is supported - use isCorrectNetwork from useWallet which is more reliable
  // Also check chainId directly as a fallback in case of timing issues
  const isNetworkSupported = isCorrectNetwork || chainId === 80002;

  const [selectedCharity, setSelectedCharity] = useState<Address | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [showOnRamp, setShowOnRamp] = useState(false);

  // Determine current step
  const currentStep: DonationStep = (() => {
    if (!isConnected) return "connect";
    if (!selectedCharity) return "select";
    if (needsApproval) return "approve";
    if (donationState.step === "donating") return "donate";
    if (donationState.step === "success") return "complete";
    return "select";
  })();

  const handleDonate = async () => {
    if (!selectedCharity || !amount) {
      return;
    }

    try {
      await createDonation(selectedCharity, amount);
    } catch (error: any) {
      console.error("Donation error:", error);
    }
  };

  const amountBigInt = amount ? parseUnits(amount, decimals) : 0n;
  const insufficientBalance: boolean = balance !== undefined && typeof balance === 'bigint' && amountBigInt > balance;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DonationProgress
        currentStep={currentStep}
        error={donationState.error}
      />

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to start making donations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConnectButton />
            <WalletConnectionHelp />
          </CardContent>
        </Card>
      ) : isConnected && !isNetworkSupported ? (
        <Card>
          <CardHeader>
            <CardTitle>Unsupported Network</CardTitle>
            <CardDescription>
              Please switch to Polygon Amoy testnet to make donations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are currently connected to an unsupported network (Chain ID: {chainId}).
                This application requires Polygon Amoy testnet (Chain ID: 80002).
                {chainId === 80002 && (
                  <span className="block mt-2 text-yellow-600">
                    ⚠️ Note: You appear to be on the correct network, but there may be a configuration issue.
                  </span>
                )}
              </AlertDescription>
            </Alert>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2 text-sm">
                <p className="font-medium">Before switching networks:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>MetaMask will ask for permission</strong> - A popup will appear when you click the button below</li>
                  <li>Click "Approve" or "Switch network" in the MetaMask popup to confirm</li>
                  <li>If you don't see a popup, check the MetaMask icon in your browser toolbar</li>
                  <li>If Polygon Amoy isn't in your wallet, you'll need to add it manually (Chain ID: 80002)</li>
                </ul>
              </AlertDescription>
            </Alert>
            <Button 
              onClick={async () => {
                try {
                  console.log("Switching to Polygon Amoy...", { currentChainId: chainId, targetChainId: 80002 });
                  await switchToAmoy();
                  // Note: User will see MetaMask popup - no need to show alert here
                } catch (error: any) {
                  console.error("Failed to switch network:", error);
                  // Only show alert if it's not a user rejection (user rejection is expected)
                  if (!error?.message?.includes("reject") && error?.code !== 4001) {
                    alert("Please check MetaMask for a confirmation popup. Click the MetaMask icon in your browser toolbar if you don't see it.");
                  }
                }
              }} 
              className="w-full" 
              size="lg"
              disabled={chainId === 80002 || isSwitching}
            >
              {isSwitching 
                ? "Waiting for MetaMask approval..." 
                : chainId === 80002 
                  ? "Already on Polygon Amoy" 
                  : "Switch to Polygon Amoy (Check MetaMask)"}
            </Button>
          </CardContent>
        </Card>
      ) : donationState.step === "success" ? (
        <ReceiptDisplay
          donationId={donationState.donationId || 0n}
          receiptTokenId={donationState.receiptTokenId || 0n}
          charityAddress={selectedCharity || ("0x0" as Address)}
          amount={amountBigInt}
          transactionHash={donationState.transactionHash || "0x"}
          timestamp={new Date()}
          chainId={chainId}
        />
      ) : (
        <>
          <USDCBalance />

          <Card>
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>
                Select a charity and enter the amount you'd like to donate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CharitySelector
                selectedCharity={selectedCharity}
                onSelect={setSelectedCharity}
              />

              <div className="space-y-2">
                <Label htmlFor="amount">Donation Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Your balance: {formattedBalance} USDC
                </p>
              </div>

              {insufficientBalance && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <span>
                      Insufficient balance. You need {String(amount)} USDC but only have{" "}
                      {String(formattedBalance)} USDC.
                    </span>
                    <Button
                      variant="link"
                      className="p-0 ml-2"
                      onClick={() => setShowOnRamp(true)}
                    >
                      Buy USDC
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {selectedCharity && amount && !insufficientBalance && (
                <>
                  {needsApproval && DONATION_REGISTRY_ADDRESS && (
                    <USDCApproval
                      spender={DONATION_REGISTRY_ADDRESS}
                      amount={amount}
                    />
                  )}

                  {!needsApproval && (
                    <Button
                      onClick={handleDonate}
                      disabled={donationState.step === "donating"}
                      className="w-full"
                      size="lg"
                    >
                      {donationState.step === "donating" ? (
                        "Processing Donation..."
                      ) : (
                        <>
                          Donate {amount} USDC
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <OnRampModal
        open={showOnRamp}
        onClose={() => setShowOnRamp(false)}
        amountUSD={amount ? parseFloat(amount) : undefined}
      />
    </div>
  );
}

