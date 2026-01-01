import { Address } from "viem";

// Admin addresses (should be stored in environment or database)
const ADMIN_ADDRESSES: Address[] = (
  process.env.NEXT_PUBLIC_ADMIN_ADDRESSES || ""
)
  .split(",")
  .filter(Boolean)
  .map((addr) => addr.toLowerCase() as Address);

export function isAdminAddress(address: Address | undefined): boolean {
  if (!address) return false;
  return ADMIN_ADDRESSES.includes(address.toLowerCase() as Address);
}

export function requireAdmin(address: Address | undefined): void {
  if (!isAdminAddress(address)) {
    throw new Error("Unauthorized: Admin access required");
  }
}



