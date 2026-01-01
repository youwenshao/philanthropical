import { create } from "zustand";
import { Address } from "viem";

interface DonationState {
  selectedCharity: Address | null;
  donationAmount: string;
  donationId: bigint | null;
  receiptTokenId: bigint | null;
  transactionHash: string | null;
  setSelectedCharity: (charity: Address | null) => void;
  setDonationAmount: (amount: string) => void;
  setDonationResult: (params: {
    donationId: bigint;
    receiptTokenId: bigint;
    transactionHash: string;
  }) => void;
  reset: () => void;
}

export const useDonationStore = create<DonationState>((set) => ({
  selectedCharity: null,
  donationAmount: "0",
  donationId: null,
  receiptTokenId: null,
  transactionHash: null,
  setSelectedCharity: (charity) => set({ selectedCharity: charity }),
  setDonationAmount: (amount) => set({ donationAmount: amount }),
  setDonationResult: ({ donationId, receiptTokenId, transactionHash }) =>
    set({ donationId, receiptTokenId, transactionHash }),
  reset: () =>
    set({
      selectedCharity: null,
      donationAmount: "0",
      donationId: null,
      receiptTokenId: null,
      transactionHash: null,
    }),
}));



