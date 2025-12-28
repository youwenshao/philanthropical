import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock wagmi
jest.mock("wagmi", () => ({
  useAccount: () => ({
    address: undefined,
    isConnected: false,
  }),
  useChainId: () => 80002,
  useSwitchChain: () => ({
    switchChain: jest.fn(),
  }),
  useReadContract: () => ({
    data: undefined,
    isLoading: false,
  }),
  useWriteContract: () => ({
    writeContract: jest.fn(),
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false,
  }),
}));

