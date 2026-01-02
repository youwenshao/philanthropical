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
        {/* Background progress line - spans from first to last circle border */}
        <div 
          className="absolute top-5 h-0.5 bg-muted -z-10" 
          style={{ 
            left: '20px', // Start from right edge of first circle (radius = 20px)
            right: '20px', // End at left edge of last circle
          }} 
        />
        
        {/* Active progress line - extends from border of previous circle to border of current circle */}
        {currentIndex > 0 && (
          <div
            className="absolute top-5 h-0.5 bg-green-500 transition-all -z-10"
            style={{
              left: '20px', // Start from right edge of first circle (radius = 20px)
              // Width: percentage of distance between first and last circle borders
              // Available space is (100% - 40px), we fill currentIndex/(steps.length-1) of it
              width: `calc((100% - 40px) * ${currentIndex / (steps.length - 1)} + 20px)`,
            }}
          />
        )}

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
              {/* Outer circle (border) */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors bg-background relative",
                  isCompleted
                    ? "border-green-500"
                    : isCurrent
                    ? error
                      ? "border-red-500"
                      : "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {/* Inner circle (filled) - only for current step */}
                {isCurrent && !error && (
                  <div className="absolute w-6 h-6 rounded-full bg-primary" />
                )}
                {isCurrent && error && (
                  <div className="absolute w-6 h-6 rounded-full bg-red-500" />
                )}
                {/* Icon */}
                <div className="relative z-10">
                  {getStepIcon(index)}
                </div>
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
          );
        })}
      </div>
      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}

