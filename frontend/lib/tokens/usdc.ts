/**
 * USDC Token Integration
 * Handles USDC contract interactions on Polygon
 */

import { Address, parseUnits, formatUnits } from "viem";

// USDC contract addresses
export const USDC_ADDRESSES: Record<number, Address> = {
  // Polygon Amoy Testnet - Using a test USDC or mock token
  // Note: You may need to deploy a mock USDC for testing
  80002: "0x0FA8781a83E468266206fe7d5cE79E1C9239e9b0" as Address, // Example - replace with actual testnet USDC
  // Polygon Mainnet
  137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as Address, // Official USDC on Polygon
};

// ERC20 ABI for USDC (standard ERC20 functions)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
] as const;

/**
 * Get USDC contract address for a given chain ID
 * Returns null if USDC is not available on the chain
 */
export function getUSDCAddress(chainId: number): Address | null {
  return USDC_ADDRESSES[chainId] || null;
}

/**
 * Check if USDC is available on a given chain
 */
export function isUSDCAvailable(chainId: number): boolean {
  return chainId in USDC_ADDRESSES;
}

/**
 * Get supported chain IDs for USDC
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(USDC_ADDRESSES).map(Number);
}

/**
 * Format USDC amount (6 decimals) to human-readable string
 */
export function formatUSDC(amount: bigint, decimals: number = 6): string {
  return formatUnits(amount, decimals);
}

/**
 * Parse USDC amount from string (6 decimals)
 */
export function parseUSDC(amount: string, decimals: number = 6): bigint {
  return parseUnits(amount, decimals);
}

/**
 * Check if address is valid USDC contract
 */
export function isValidUSDCAddress(address: Address, chainId: number): boolean {
  const usdcAddress = getUSDCAddress(chainId);
  if (!usdcAddress) return false;
  return address.toLowerCase() === usdcAddress.toLowerCase();
}

