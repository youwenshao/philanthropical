import { ethers } from "ethers";
import { supabase } from "../database";

export interface VerificationEvent {
  charity: string;
  status: string;
  timestamp: bigint;
  transactionHash: string;
  blockNumber: number;
}

const CHARITY_VERIFIED_ABI = [
  "event CharityVerified(address indexed charity, address[] verifiers, uint256 timestamp)"
];

export async function processVerificationEvent(
  event: ethers.Log | ethers.ContractEventPayload,
  provider: ethers.Provider
): Promise<void> {
  try {
    // Handle both Log and ContractEventPayload
    let charity: string;
    let blockNumber: number;

    if ("args" in event && "log" in event) {
      // ContractEventPayload - use decoded args
      charity = event.args.charity.toString();
      blockNumber = event.log.blockNumber;
    } else {
      // Log object - decode manually
      const iface = new ethers.Interface(CHARITY_VERIFIED_ABI);
      const decoded = iface.parseLog({
        topics: event.topics || [],
        data: event.data,
      });

      if (!decoded) {
        throw new Error("Failed to decode verification event");
      }

      charity = decoded.args.charity.toString();
      blockNumber = event.blockNumber || 0;
    }

    const block = await provider.getBlock(blockNumber);
    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    // Update charity status to approved
    const { error } = await supabase
      .from("charities")
      .update({
        verification_status: "approved",
        verified_at: new Date(block.timestamp * 1000).toISOString(),
      })
      .eq("address", charity);

    if (error) {
      console.error("Error updating charity verification:", error);
      throw error;
    }

    console.log(`Updated charity verification: ${charity} -> ${statusMap[status]}`);
  } catch (error) {
    console.error("Error processing verification event:", error);
    throw error;
  }
}

