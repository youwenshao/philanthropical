"use client";

import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export interface Donation {
  id: string;
  donationId: bigint;
  donorAddress: Address;
  charityAddress: Address;
  amount: string;
  tokenAddress: Address;
  receiptTokenId: bigint;
  transactionHash: string;
  blockNumber: bigint;
  processed: boolean;
  createdAt: string;
}

async function fetchDonations(params?: {
  donor?: Address;
  charity?: Address;
  limit?: number;
}): Promise<Donation[]> {
  const queryParams = new URLSearchParams();
  if (params?.donor) queryParams.append("donor", params.donor);
  if (params?.charity) queryParams.append("charity", params.charity);
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await fetch(`/api/donations?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch donations");
  }
  return response.json();
}

export function useDonations(params?: { donor?: Address; charity?: Address; limit?: number }) {
  return useQuery({
    queryKey: ["donations", params],
    queryFn: () => fetchDonations(params),
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - cache for 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchInterval: 60 * 1000, // Refetch every minute in background
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}



