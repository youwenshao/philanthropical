import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { setupEventListeners } from "./eventListeners";

dotenv.config();

async function main() {
  console.log("Starting Philanthropical Indexer...");

  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL;
  if (!rpcUrl) {
    throw new Error("POLYGON_AMOY_RPC_URL not set");
  }

  const donationRegistryAddress = process.env.DONATION_REGISTRY_ADDRESS;
  const charityVerificationAddress = process.env.CHARITY_VERIFICATION_ADDRESS;
  const startBlock = parseInt(process.env.START_BLOCK || "0");

  if (!donationRegistryAddress || !charityVerificationAddress) {
    throw new Error("Contract addresses not configured");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Verify connection
  const network = await provider.getNetwork();
  console.log(`Connected to network: ${network.name} (${network.chainId})`);

  // Setup event listeners
  await setupEventListeners(
    provider,
    donationRegistryAddress,
    charityVerificationAddress,
    startBlock
  );

  console.log("Indexer running. Listening for events...");

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\nShutting down indexer...");
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

