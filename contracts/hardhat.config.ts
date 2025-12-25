import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

// Helper function to validate and format private key
function getPrivateKey(): string[] {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.trim() === "" || privateKey === "your_private_key_here") {
    return [];
  }
  // Remove 0x prefix if present and validate length (64 hex chars = 32 bytes)
  const cleanKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  if (cleanKey.length !== 64) {
    if (cleanKey.length === 40) {
      throw new Error(
        "❌ ERROR: PRIVATE_KEY appears to be an Ethereum address, not a private key.\n" +
        "   Private keys must be 64 hex characters (32 bytes).\n" +
        "   Example: 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef\n" +
        "   ⚠️  NEVER share your private key or commit it to version control!"
      );
    }
    throw new Error(
      `❌ ERROR: PRIVATE_KEY is invalid. Expected 64 hex characters, got ${cleanKey.length}.\n` +
      "   Private keys must be exactly 64 hex characters (32 bytes).\n" +
      "   ⚠️  NEVER share your private key or commit it to version control!"
    );
  }
  // Validate it's valid hex
  if (!/^[0-9a-fA-F]+$/.test(cleanKey)) {
    throw new Error(
      "❌ ERROR: PRIVATE_KEY contains invalid characters. Must be hexadecimal (0-9, a-f, A-F)."
    );
  }
  return [privateKey];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: process.env.POLYGON_AMOY_RPC_URL || "",
        enabled: false,
      },
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: getPrivateKey(),
      chainId: 80002,
      gasPrice: 26000000000, // 26 gwei (just above minimum of 25 gwei to reduce costs)
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC_URL || "",
      accounts: getPrivateKey(),
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY || "",
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: ["test/", "mocks/"],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;

