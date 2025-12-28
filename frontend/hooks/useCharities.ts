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
  const response = await fetch("/api/charities");
  if (!response.ok) {
    throw new Error("Failed to fetch charities");
  }
  return response.json();
}

export function useCharities() {
  return useQuery({
    queryKey: ["charities"],
    queryFn: fetchCharities,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

