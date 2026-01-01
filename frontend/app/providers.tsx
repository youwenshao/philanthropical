"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import { polygonAmoy } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

// Optimized QueryClient configuration
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: data is fresh for 30 seconds by default
        staleTime: 30 * 1000,
        // Garbage collection time: cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Refetch on window focus
        refetchOnWindowFocus: true,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Retry failed requests
        retry: 3,
        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          initialChain={polygonAmoy}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

