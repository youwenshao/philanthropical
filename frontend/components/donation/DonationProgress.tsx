"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type DonationStep = "connect" | "select" | "approve" | "donate" | "complete";

interface DonationProgressProps {
  currentStep: DonationStep;
  error?: string;
}

const steps: { key: DonationStep; label: string }[] = [
  { key: "connect", label: "Connect Wallet" },
  { key: "select", label: "Select Charity" },
  { key: "approve", label: "Approve USDC" },
  { key: "donate", label: "Make Donation" },
  { key: "complete", label: "Complete" },
];

export function DonationProgress({ currentStep, error }: DonationProgressProps) {
  const getStepIndex = (step: DonationStep): number => {
    return steps.findIndex((s) => s.key === step);
  };

  const currentIndex = getStepIndex(currentStep);

  const getStepIcon = (index: number) => {
    if (index < currentIndex) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (index === currentIndex) {
      if (error) {
        return <XCircle className="h-5 w-5 text-red-500" />;
      }
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    } else {
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div
          className={cn(
            "absolute top-5 left-0 h-0.5 transition-all",
            currentIndex > 0 ? "bg-green-500" : "bg-muted"
          )}
          style={{
            width: currentIndex > 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : "0%",
          }}
        />
        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-10" />

        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors bg-background",
                index < currentIndex
                  ? "bg-green-500 border-green-500 text-white"
                  : index === currentIndex
                  ? error
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-primary border-primary text-white"
                  : "border-muted-foreground text-muted-foreground"
              )}
            >
              {getStepIcon(index)}
            </div>
            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-sm font-medium",
                  index <= currentIndex ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}

