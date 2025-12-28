"use client";

import { useAccount, useReadContract } from "wagmi";
import { getUSDCAddress, ERC20_ABI } from "@/lib/tokens/usdc";
import { Address } from "viem";
import { useMemo } from "react";

export function useUSDCAllowance(spender: Address) {
  const { address, chainId } = useAccount();

  const usdcAddress = useMemo(() => {
    if (!chainId) return null;
    return getUSDCAddress(chainId);
  }, [chainId]);

  const { data: allowance, refetch } = useReadContract({
    address: usdcAddress || undefined,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && spender ? [address, spender] : undefined,
    query: {
      enabled: !!address && !!usdcAddress && !!spender,
    },
  });

  const hasSufficientAllowance = (requiredAmount: bigint): boolean => {
    if (!allowance) return false;
    return allowance >= requiredAmount;
  };

  return {
    allowance,
    hasSufficientAllowance,
    refetch,
  };
}

