/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import { DonationForm } from "@/components/donation/DonationForm";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </WagmiProvider>
);

describe("DonationForm", () => {
  it("renders connect wallet when not connected", () => {
    render(
      <TestWrapper>
        <DonationForm />
      </TestWrapper>
    );

    expect(screen.getByText(/Connect Your Wallet/i)).toBeInTheDocument();
  });

  it("displays USDC balance component", () => {
    render(
      <TestWrapper>
        <DonationForm />
      </TestWrapper>
    );

    // Component should render even if wallet not connected
    expect(screen.getByText(/USDC Balance/i)).toBeInTheDocument();
  });
});



