import { ethers } from "ethers";
import { processDonationEvent } from "./processors/donationProcessor";
import { processVerificationEvent } from "./processors/verificationProcessor";

const DONATION_REGISTRY_ABI = [
  "event DonationCreated(uint256 indexed donationId, address indexed donor, address indexed charity, uint256 amount, uint256 receiptTokenId, uint256 timestamp)",
  "function createDonation(address charity, uint256 amount) returns (uint256)",
];

const CHARITY_VERIFICATION_ABI = [
  "event CharityVerified(address indexed charity, address[] verifiers, uint256 timestamp)",
  "event CharityRejected(address indexed charity, address indexed verifier, string reason, uint256 timestamp)",
  "event CharitySuspended(address indexed charity, address indexed admin, string reason, uint256 timestamp)",
];

export async function setupEventListeners(
  provider: ethers.Provider,
  donationRegistryAddress: string,
  charityVerificationAddress: string,
  startBlock: number
) {
  const donationRegistry = new ethers.Contract(
    donationRegistryAddress,
    DONATION_REGISTRY_ABI,
    provider
  );

  const charityVerification = new ethers.Contract(
    charityVerificationAddress,
    CHARITY_VERIFICATION_ABI,
    provider
  );

  // Listen for new donation events
  donationRegistry.on("DonationCreated", async (...args) => {
    try {
      // Last argument is the event object
      const event = args[args.length - 1];
      if (event && event.log) {
        await processDonationEvent(event.log, provider);
      }
    } catch (error) {
      console.error("Error processing DonationCreated event:", error);
    }
  });

  // Listen for verification events
  charityVerification.on("CharityVerified", async (...args) => {
    try {
      const event = args[args.length - 1];
      if (event && event.log) {
        await processVerificationEvent(event.log, provider);
      }
    } catch (error) {
      console.error("Error processing CharityVerified event:", error);
    }
  });

  // Process historical events
  const currentBlock = await provider.getBlockNumber();
  const batchSize = 1000;

  for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += batchSize) {
    const toBlock = Math.min(fromBlock + batchSize - 1, currentBlock);

    try {
      // Get donation events
      const donationEvents = await donationRegistry.queryFilter(
        donationRegistry.filters.DonationCreated(),
        fromBlock,
        toBlock
      );

      for (const event of donationEvents) {
        await processDonationEvent(event, provider);
      }

      // Get verification events
      const verificationEvents = await charityVerification.queryFilter(
        charityVerification.filters.CharityVerified(),
        fromBlock,
        toBlock
      );

      for (const event of verificationEvents) {
        await processVerificationEvent(event, provider);
      }

      console.log(`Processed blocks ${fromBlock} to ${toBlock}`);
    } catch (error) {
      console.error(`Error processing blocks ${fromBlock} to ${toBlock}:`, error);
    }
  }
}

