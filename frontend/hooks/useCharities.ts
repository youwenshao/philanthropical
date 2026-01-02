"use client";

import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export interface Charity {
  address: Address;
  name: string;
  description: string;
  registrationNumber: string;
  reputationScore: number;
  verificationStatus: "pending" | "approved" | "rejected" | "challenged" | "suspended";
  createdAt: string;
  verifiedAt?: string;
}

async function fetchCharities(): Promise<Charity[]> {
  try {
    const response = await fetch("/api/charities");
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Failed to fetch charities: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch charities: Unknown error");
  }
}

export function useCharities() {
  return useQuery({
    queryKey: ["charities"],
    queryFn: fetchCharities,
    staleTime: 5 * 60 * 1000, // 5 minutes - charities don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}



