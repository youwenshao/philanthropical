import { run, ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

// Deployed contract addresses
// Can be set via environment variables or hardcoded here
const CONTRACTS = {
  DonationRegistry: process.env.DONATION_REGISTRY_ADDRESS || "0x352ac4F67cD0f6347058237c870faFD405C2FA26",
  CharityVerification: process.env.CHARITY_VERIFICATION_ADDRESS || "0x4dF5fC96C716319EcAA0E43BA9de53f701F08Ac7",
  ImpactEscrow: process.env.IMPACT_ESCROW_ADDRESS || "0x0c6F73835cA9eE3E85ADCEF8dF9fA32bcF0DCDE7", // Set via env var or update here
  VerificationOracle: process.env.VERIFICATION_ORACLE_ADDRESS || "0xbB87A71028EaED5DC382DD1b95e5DACAc7F73fFb", // Set via env var or update here
};

// Constructor arguments for implementation contracts
// Note: Upgradeable contracts use empty constructors, so no constructor args needed
const CONSTRUCTOR_ARGS: Record<string, { args: any[] }> = {
  DonationRegistry: {
    args: [], // Empty constructor for upgradeable contracts
  },
  CharityVerification: {
    args: [], // Empty constructor for upgradeable contracts
  },
  ImpactEscrow: {
    args: [], // Empty constructor for upgradeable contracts
  },
  VerificationOracle: {
    args: [], // Empty constructor for upgradeable contracts
  },
};

async function getImplementationAddress(proxyAddress: string): Promise<string> {
  // Storage slot for implementation address in TransparentUpgradeableProxy
  // keccak256("eip1967.proxy.implementation") - 1
  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  
  const provider = ethers.provider;
  const implementationAddress = await provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
  
  // Convert from bytes32 to address (last 20 bytes)
  return "0x" + implementationAddress.slice(-40);
}

async function main() {
  console.log("Verifying contracts on Amoy testnet...\n");

  for (const [contractName, proxyAddress] of Object.entries(CONTRACTS)) {
    if (!proxyAddress || proxyAddress === "") {
      console.log(`⏭️  Skipping ${contractName} - address not provided`);
      continue;
    }

    console.log(`\n📋 Verifying ${contractName}...`);
    console.log(`   Proxy Address: ${proxyAddress}`);

    try {
      // Get implementation address
      const implementationAddress = await getImplementationAddress(proxyAddress);
      console.log(`   Implementation Address: ${implementationAddress}`);

      // Verify implementation contract
      // Upgradeable contracts have empty constructors, so no constructor args
      const args = CONSTRUCTOR_ARGS[contractName];
      
      if (args.args.length > 0) {
        console.log(`   Verifying implementation with constructor args: ${args.args.join(", ")}`);
      } else {
        console.log(`   Verifying implementation (no constructor args - upgradeable contract)`);
      }

      await run("verify:verify", {
        address: implementationAddress,
        constructorArguments: args.args,
      });

      console.log(`✅ ${contractName} implementation verified successfully!`);
      console.log(`   View on Etherscan: https://amoy.polygonscan.com/address/${implementationAddress}`);

      // Note: Proxy contracts (TransparentUpgradeableProxy) are typically auto-verified
      // or can be verified separately if needed
      console.log(`   Proxy: https://amoy.polygonscan.com/address/${proxyAddress}`);

    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contractName} is already verified`);
      } else {
        console.error(`❌ Error verifying ${contractName}:`, error.message);
      }
    }
  }

  console.log("\n=== Verification Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

