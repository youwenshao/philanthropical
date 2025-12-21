import { create } from "zustand";

interface AppState {
  selectedCharity: string | null;
  donationAmount: string;
  setSelectedCharity: (charity: string | null) => void;
  setDonationAmount: (amount: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCharity: null,
  donationAmount: "0",
  setSelectedCharity: (charity) => set({ selectedCharity: charity }),
  setDonationAmount: (amount) => set({ donationAmount: amount }),
}));

