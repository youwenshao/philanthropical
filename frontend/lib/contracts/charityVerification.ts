/**
 * CharityVerification Contract ABI
 */

export const CHARITY_VERIFICATION_ABI = [
  {
    inputs: [{ name: "charityAddress", type: "address" }],
    name: "approveVerification",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "charityAddress", type: "address" },
      { name: "reason", type: "string" },
    ],
    name: "rejectVerification",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "charityAddress", type: "address" },
      { name: "reason", type: "string" },
    ],
    name: "reportFraud",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

