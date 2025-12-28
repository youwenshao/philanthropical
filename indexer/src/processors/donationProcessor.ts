import { ethers } from "ethers";
import { supabase } from "../database";

export interface DonationEvent {
  donationId: bigint;
  donor: string;
  charity: string;
  amount: bigint;
  receiptTokenId: bigint;
  timestamp: bigint;
  transactionHash: string;
  blockNumber: number;
}

// DonationCreated event ABI for decoding
const DONATION_CREATED_ABI = [
  "event DonationCreated(uint256 indexed donationId, address indexed donor, address indexed charity, uint256 amount, uint256 receiptTokenId, uint256 timestamp)"
];

export async function processDonationEvent(
  event: ethers.Log | ethers.ContractEventPayload,
  provider: ethers.Provider
): Promise<void> {
  try {
    // Handle both Log and ContractEventPayload
    let log: ethers.Log;
    let blockNumber: number;
    let transactionHash: string;

    if ("log" in event) {
      // ContractEventPayload
      log = event.log;
      blockNumber = event.log.blockNumber;
      transactionHash = event.log.transactionHash || "";
      // Use decoded args from event
      const donationId = event.args.donationId;
      const donor = event.args.donor;
      const charity = event.args.charity;
      const amount = event.args.amount;
      const receiptTokenId = event.args.receiptTokenId;

      const block = await provider.getBlock(blockNumber);
      if (!block) {
        throw new Error(`Block ${blockNumber} not found`);
      }

      const donationEvent: DonationEvent = {
        donationId: BigInt(donationId.toString()),
        donor: donor.toString(),
        charity: charity.toString(),
        amount: BigInt(amount.toString()),
        receiptTokenId: BigInt(receiptTokenId.toString()),
        timestamp: BigInt(block.timestamp),
        transactionHash,
        blockNumber,
      };

      // Insert into database
      const { error } = await supabase.from("donation_events").upsert({
        donation_id: donationEvent.donationId.toString(),
        donor_address: donationEvent.donor,
        charity_address: donationEvent.charity,
        amount: donationEvent.amount.toString(),
        token_address: process.env.USDC_ADDRESS || "0x0",
        receipt_token_id: donationEvent.receiptTokenId.toString(),
        transaction_hash: donationEvent.transactionHash,
        block_number: donationEvent.blockNumber,
        processed: false,
      });

      if (error) {
        console.error("Error inserting donation event:", error);
        throw error;
      }

      console.log(`Processed donation event: ${donationEvent.donationId}`);
      return;
    } else {
      // Log object - decode manually
      log = event;
      blockNumber = event.blockNumber || 0;
      transactionHash = event.transactionHash || "";
    }

    // Decode from log
    const iface = new ethers.Interface(DONATION_CREATED_ABI);
    const decoded = iface.parseLog({
      topics: log.topics || [],
      data: log.data,
    });

    if (!decoded) {
      throw new Error("Failed to decode event");
    }

    const donationId = decoded.args.donationId;
    const donor = decoded.args.donor;
    const charity = decoded.args.charity;
    const amount = decoded.args.amount;
    const receiptTokenId = decoded.args.receiptTokenId;

    const block = await provider.getBlock(blockNumber);
    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    const donationEvent: DonationEvent = {
      donationId: BigInt(donationId.toString()),
      donor: donor.toString(),
      charity: charity.toString(),
      amount: BigInt(amount.toString()),
      receiptTokenId: BigInt(receiptTokenId.toString()),
      timestamp: BigInt(block.timestamp),
      transactionHash,
      blockNumber,
    };

    // Insert into database
    const { error } = await supabase.from("donation_events").upsert({
      donation_id: donationEvent.donationId.toString(),
      donor_address: donationEvent.donor,
      charity_address: donationEvent.charity,
      amount: donationEvent.amount.toString(),
      token_address: process.env.USDC_ADDRESS || "0x0",
      receipt_token_id: donationEvent.receiptTokenId.toString(),
      transaction_hash: donationEvent.transactionHash,
      block_number: donationEvent.blockNumber,
      processed: false,
    });

    if (error) {
      console.error("Error inserting donation event:", error);
      throw error;
    }

    console.log(`Processed donation event: ${donationEvent.donationId}`);
  } catch (error) {
    console.error("Error processing donation event:", error);
    throw error;
  }
}

