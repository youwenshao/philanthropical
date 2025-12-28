"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUSDC, getUSDCAddress, ERC20_ABI } from "@/lib/tokens/usdc";
import { Address, maxUint256 } from "viem";
import { useMemo } from "react";

export function useUSDC() {
  const { address, chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get USDC address for current chain
  const usdcAddress = useMemo(() => {
    if (!chainId) return null;
    try {
      return getUSDCAddress(chainId);
    } catch {
      return null;
    }
  }, [chainId]);

  // Read balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcAddress || undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!usdcAddress,
    },
  });

  // Read decimals
  const { data: decimals } = useReadContract({
    address: usdcAddress || undefined,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!usdcAddress,
    },
  });

  // Note: getAllowance should be called as a hook, not a function
  // For now, we'll use a separate hook when needed

  // Approve USDC spending
  const approve = async (spender: Address, amount?: bigint) => {
    if (!usdcAddress) {
      throw new Error("USDC not available on this network");
    }

    const approvalAmount = amount || maxUint256;

    writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, approvalAmount],
    });
  };

  // Check if user has sufficient balance
  const hasSufficientBalance = (requiredAmount: bigint): boolean => {
    if (!balance) return false;
    return balance >= requiredAmount;
  };

  // Check if user has sufficient allowance
  // Note: This requires a separate hook call - see useUSDCAllowance hook
  const hasSufficientAllowance = (_spender: Address, _requiredAmount: bigint): boolean => {
    // This will be implemented with a separate hook
    return false;
  };

  // Format balance for display
  const formattedBalance = useMemo(() => {
    if (!balance || !decimals) return "0.00";
    return formatUSDC(balance, Number(decimals));
  }, [balance, decimals]);

  return {
    address: usdcAddress,
    balance,
    formattedBalance,
    decimals: decimals ? Number(decimals) : 6,
    approve,
    hasSufficientBalance,
    hasSufficientAllowance,
    refetchBalance,
    isApproving: isPending || isConfirming,
    isApproved: isConfirmed,
    approvalError: error,
    approvalHash: hash,
  };
}

