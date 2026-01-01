import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { setupEventListeners } from "./eventListeners";

dotenv.config();

// Structured logging utility
interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  correlationId?: string;
}

function log(entry: LogEntry) {
  const logMessage = {
    ...entry,
    timestamp: new Date().toISOString(),
    service: "indexer",
  };
  
  const logString = JSON.stringify(logMessage);
  
  switch (entry.level) {
    case "error":
      console.error(logString);
      break;
    case "warn":
      console.warn(logString);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(logString);
      }
      break;
    default:
      console.log(logString);
  }
}

// Generate correlation ID for request tracing
function generateCorrelationId(): string {
  return `idx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function main() {
  const correlationId = generateCorrelationId();
  
  log({
    level: "info",
    message: "Starting Philanthropical Indexer",
    correlationId,
  });

  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL;
  if (!rpcUrl) {
    log({
      level: "error",
      message: "POLYGON_AMOY_RPC_URL not set",
      correlationId,
    });
    throw new Error("POLYGON_AMOY_RPC_URL not set");
  }

  const donationRegistryAddress = process.env.DONATION_REGISTRY_ADDRESS;
  const charityVerificationAddress = process.env.CHARITY_VERIFICATION_ADDRESS;
  const startBlock = parseInt(process.env.START_BLOCK || "0");

  if (!donationRegistryAddress || !charityVerificationAddress) {
    log({
      level: "error",
      message: "Contract addresses not configured",
      correlationId,
      metadata: {
        donationRegistryAddress: !!donationRegistryAddress,
        charityVerificationAddress: !!charityVerificationAddress,
      },
    });
    throw new Error("Contract addresses not configured");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Verify connection
  try {
    const network = await provider.getNetwork();
    log({
      level: "info",
      message: "Connected to network",
      correlationId,
      metadata: {
        networkName: network.name,
        chainId: network.chainId.toString(),
      },
    });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to connect to network",
      correlationId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }

  // Setup event listeners
  try {
    await setupEventListeners(
      provider,
      donationRegistryAddress,
      charityVerificationAddress,
      startBlock
    );

    log({
      level: "info",
      message: "Indexer running. Listening for events",
      correlationId,
      metadata: {
        donationRegistryAddress,
        charityVerificationAddress,
        startBlock,
      },
    });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to setup event listeners",
      correlationId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }

  // Keep process alive
  process.on("SIGINT", () => {
    log({
      level: "info",
      message: "Shutting down indexer",
      correlationId: generateCorrelationId(),
    });
    process.exit(0);
  });

  process.on("unhandledRejection", (reason, promise) => {
    log({
      level: "error",
      message: "Unhandled promise rejection",
      correlationId: generateCorrelationId(),
      metadata: {
        reason: reason instanceof Error ? reason.message : String(reason),
      },
    });
  });

  process.on("uncaughtException", (error) => {
    log({
      level: "error",
      message: "Uncaught exception",
      correlationId: generateCorrelationId(),
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    });
    process.exit(1);
  });
}

main().catch((error) => {
  log({
    level: "error",
    message: "Fatal error in main",
    correlationId: generateCorrelationId(),
    metadata: {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
  });
  process.exit(1);
});



