import { create } from "zustand";
import { Address } from "viem";
import { Charity } from "@/hooks/useCharities";

interface CharityState {
  charities: Charity[];
  selectedCharity: Charity | null;
  setCharities: (charities: Charity[]) => void;
  setSelectedCharity: (charity: Charity | null) => void;
  getCharityByAddress: (address: Address) => Charity | undefined;
}

export const useCharityStore = create<CharityState>((set, get) => ({
  charities: [],
  selectedCharity: null,
  setCharities: (charities) => set({ charities }),
  setSelectedCharity: (charity) => set({ selectedCharity: charity }),
  getCharityByAddress: (address) => {
    return get().charities.find((c) => c.address.toLowerCase() === address.toLowerCase());
  },
}));



