"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Address, parseUnits } from "viem";
import { DONATION_REGISTRY_ABI, prepareDonationTransaction } from "@/lib/contracts/donationRegistry";
import { getUSDCAddress } from "@/lib/tokens/usdc";
import { useUSDC } from "@/hooks/useUSDC";
import { useUSDCAllowance } from "@/hooks/useUSDCAllowance";

export interface DonationState {
  step: "idle" | "approving" | "donating" | "success" | "error";
  donationId?: bigint;
  receiptTokenId?: bigint;
  transactionHash?: string;
  error?: string;
}

export function useDonation() {
  const { address, chainId } = useAccount();
  const { balance, decimals } = useUSDC();
  const [donationState, setDonationState] = useState<DonationState>({ step: "idle" });
  const [charity, setCharity] = useState<Address | null>(null);
  const [amount, setAmount] = useState<string>("");

  // Get contract address from env
  const contractAddress = process.env.NEXT_PUBLIC_DONATION_REGISTRY_ADDRESS as Address | undefined;
  const usdcAddress = chainId ? getUSDCAddress(chainId) : null;
  
  // Check if network is supported
  const isNetworkSupported = chainId ? usdcAddress !== null : false;

  // Get allowance if we have a charity and amount
  const { allowance, hasSufficientAllowance } = useUSDCAllowance(
    contractAddress || ("0x0" as Address)
  );

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if user needs to approve
  const needsApproval = (() => {
    if (!charity || !amount || !contractAddress || !usdcAddress) return false;
    const amountBigInt = parseUnits(amount, decimals);
    return !hasSufficientAllowance(amountBigInt);
  })();

  // Check if user has sufficient balance
  const hasBalance = (() => {
    if (!amount || !balance || typeof balance !== 'bigint') return false;
    const amountBigInt = parseUnits(amount, decimals);
    return balance >= amountBigInt;
  })();

  // Create donation transaction
  const createDonation = async (charityAddress: Address, donationAmount: string) => {
    if (!isNetworkSupported) {
      throw new Error("Unsupported network. Please switch to Polygon Amoy testnet.");
    }
    if (!contractAddress || !usdcAddress) {
      throw new Error("Contract or USDC address not configured");
    }

    if (!hasBalance) {
      throw new Error("Insufficient USDC balance");
    }

    setCharity(charityAddress);
    setAmount(donationAmount);
    setDonationState({ step: "donating" });

    try {
      const tx = prepareDonationTransaction(contractAddress, {
        charity: charityAddress,
        amount: donationAmount,
        tokenAddress: usdcAddress,
      });

      writeContract({
        address: tx.address,
        abi: tx.abi,
        functionName: tx.functionName as "createDonation",
        args: [tx.args[0] as `0x${string}`, tx.args[1] as bigint],
      });
    } catch (err: any) {
      setDonationState({
        step: "error",
        error: err.message || "Failed to create donation",
      });
      throw err;
    }
  };

  // Monitor transaction status
  useEffect(() => {
    if (isPending) {
      setDonationState({ step: "donating", transactionHash: hash });
    } else if (isConfirming) {
      setDonationState({ step: "donating", transactionHash: hash });
    } else if (isConfirmed && receipt) {
      // Extract donation ID from events
      const donationEvent = receipt.logs.find((log: any) => {
        // Parse event to get donation ID
        // This is a simplified version - in production, decode the event properly
        return true;
      });

      setDonationState({
        step: "success",
        transactionHash: hash,
        // donationId and receiptTokenId would be extracted from events
      });
    } else if (error) {
      setDonationState({
        step: "error",
        error: error.message || "Transaction failed",
      });
    }
  }, [isPending, isConfirming, isConfirmed, receipt, hash, error]);

  return {
    createDonation,
    donationState,
    needsApproval,
    hasBalance,
    charity,
    amount,
    isPending: isPending || isConfirming,
    error,
    isNetworkSupported,
    usdcAddress,
  };
}

