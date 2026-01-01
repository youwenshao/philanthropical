"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  content: React.ReactNode;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

export function OnboardingFlow({
  steps,
  onComplete,
  onSkip,
  storageKey = "philanthropical-onboarding-completed",
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Check if onboarding was already completed
  if (typeof window !== "undefined") {
    const completed = localStorage.getItem(storageKey);
    if (completed === "true" && currentStep === 0) {
      setIsVisible(false);
    }
  }

  if (!isVisible) {
    return null;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
    setIsVisible(false);
    onSkip?.();
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
    setIsVisible(false);
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl mx-4 animate-scale-in">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleSkip}
            aria-label="Close onboarding"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pr-8">
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[200px]">{currentStepData.content}</div>
          <div className="flex justify-between">
            <div>
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {!isLastStep && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext}>
                {isLastStep ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

