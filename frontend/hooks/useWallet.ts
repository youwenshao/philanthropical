"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { useEffect, useState } from "react";

export function useWallet() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [switchError, setSwitchError] = useState<Error | null>(null);

  // Check if on correct network
  // polygonAmoy.id is 80002, so we check for exact match
  const isCorrectNetwork = chainId === polygonAmoy.id;

  const switchToAmoy = async () => {
    try {
      setSwitchError(null);
      await switchChain({ chainId: polygonAmoy.id });
      // Note: User needs to approve in MetaMask popup
    } catch (error: any) {
      console.error("Failed to switch chain:", error);
      // Check if it's a user rejection
      if (error?.message?.includes("reject") || error?.code === 4001) {
        setSwitchError(new Error("Network switch was cancelled. Please try again and approve in MetaMask."));
      } else {
        setSwitchError(new Error("Failed to switch network. Please check MetaMask for a confirmation popup."));
      }
      throw error;
    }
  };

  // Automatically attempt to switch to Polygon Amoy when connected to wrong network
  useEffect(() => {
    if (isConnected && !isCorrectNetwork && chainId && chainId !== polygonAmoy.id && !isSwitching) {
      // Only auto-switch if we have a valid chainId, it's not the correct one, and not already switching
      // This prevents infinite loops
      const timer = setTimeout(async () => {
        try {
          setSwitchError(null);
          await switchChain({ chainId: polygonAmoy.id });
        } catch (error) {
          // Silently fail - user can manually switch via RainbowKit UI
          console.log("Auto-switch failed, user can switch manually:", error);
        }
      }, 1000); // Small delay to let wallet settle

      return () => clearTimeout(timer);
    }
  }, [isConnected, isCorrectNetwork, chainId, isSwitching, switchChain]);

  return {
    address,
    isConnected,
    connector,
    chainId,
    isCorrectNetwork,
    switchToAmoy,
    isSwitching,
    switchError,
  };
}

