/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { CharityTable } from "@/components/admin/CharityTable";
import { Charity } from "@/hooks/useCharities";

const mockCharities: Charity[] = [
  {
    address: "0x1111111111111111111111111111111111111111" as any,
    name: "Test Charity 1",
    description: "A test charity",
    registrationNumber: "REG001",
    reputationScore: 950,
    verificationStatus: "approved",
    createdAt: new Date().toISOString(),
  },
  {
    address: "0x2222222222222222222222222222222222222222" as any,
    name: "Test Charity 2",
    description: "Another test charity",
    registrationNumber: "REG002",
    reputationScore: 800,
    verificationStatus: "pending",
    createdAt: new Date().toISOString(),
  },
];

describe("CharityTable", () => {
  it("renders charity list", () => {
    render(<CharityTable charities={mockCharities} />);

    expect(screen.getByText("Test Charity 1")).toBeInTheDocument();
    expect(screen.getByText("Test Charity 2")).toBeInTheDocument();
  });

  it("displays verification status badges", () => {
    render(<CharityTable charities={mockCharities} />);

    expect(screen.getByText(/Verified/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  it("shows empty state when no charities", () => {
    render(<CharityTable charities={[]} />);

    expect(screen.getByText(/No charities registered yet/i)).toBeInTheDocument();
  });
});

