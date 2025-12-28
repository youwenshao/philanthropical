/**
 * DonationRegistry Contract Helpers
 */

import { Address, parseUnits } from "viem";

// DonationRegistry ABI (key functions)
export const DONATION_REGISTRY_ABI = [
  {
    inputs: [
      { name: "charity", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "createDonation",
    outputs: [{ name: "donationId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "charities", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    name: "createDonationBatch",
    outputs: [{ name: "donationIds", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "donationId", type: "uint256" }],
    name: "getDonation",
    outputs: [
      {
        components: [
          { name: "donor", type: "address" },
          { name: "charity", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "receiptTokenId", type: "uint256" },
          { name: "processed", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "donor", type: "address" }],
    name: "getDonorDonations",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DONATION_TOKEN_ID",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "RECEIPT_TOKEN_ID_BASE",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    type: "event",
    name: "DonationCreated",
    inputs: [
      { indexed: true, name: "donationId", type: "uint256" },
      { indexed: true, name: "donor", type: "address" },
      { indexed: true, name: "charity", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "receiptTokenId", type: "uint256" },
      { name: "timestamp", type: "uint256" },
    ],
  },
] as const;

export interface DonationParams {
  charity: Address;
  amount: string; // Human-readable amount
  tokenAddress: Address; // USDC address
}

/**
 * Prepare donation transaction
 */
export function prepareDonationTransaction(
  contractAddress: Address,
  params: DonationParams,
  usdcDecimals: number = 6
) {
  const amount = parseUnits(params.amount, usdcDecimals);

  return {
    address: contractAddress,
    abi: DONATION_REGISTRY_ABI,
    functionName: "createDonation",
    args: [params.charity, amount],
  };
}

