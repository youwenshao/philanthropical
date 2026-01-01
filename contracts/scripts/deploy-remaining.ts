import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying remaining contracts with the account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Already deployed contracts (from previous deployment)
  const DONATION_REGISTRY = "0x352ac4F67cD0f6347058237c870faFD405C2FA26";
  const CHARITY_VERIFICATION = "0x4dF5fC96C716319EcAA0E43BA9de53f701F08Ac7";

  console.log("\nAlready deployed:");
  console.log("DonationRegistry:", DONATION_REGISTRY);
  console.log("CharityVerification:", CHARITY_VERIFICATION);

  // Deploy ImpactEscrow
  console.log("\nDeploying ImpactEscrow...");
  const ImpactEscrow = await ethers.getContractFactory("ImpactEscrow");
  const impactEscrow = await upgrades.deployProxy(
    ImpactEscrow,
    [
      2 * 24 * 60 * 60, // timelockDuration (2 days)
      2, // requiredApprovals
    ],
    { initializer: "initialize" }
  );
  await impactEscrow.waitForDeployment();
  const impactEscrowAddress = await impactEscrow.getAddress();
  console.log("ImpactEscrow deployed to:", impactEscrowAddress);

  // Check balance before deploying VerificationOracle
  const remainingBalance = await ethers.provider.getBalance(deployer.address);
  console.log("\nRemaining balance:", ethers.formatEther(remainingBalance), "MATIC");

  // Deploy VerificationOracle
  console.log("\nDeploying VerificationOracle...");
  const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
  const verificationOracle = await upgrades.deployProxy(
    VerificationOracle,
    [
      ethers.parseEther("1.0"), // requiredStake (1 ETH)
      7 * 24 * 60 * 60, // disputePeriod (7 days)
      1000, // penaltyPercentage (10% in basis points)
    ],
    { initializer: "initialize" }
  );
  await verificationOracle.waitForDeployment();
  const verificationOracleAddress = await verificationOracle.getAddress();
  console.log("VerificationOracle deployed to:", verificationOracleAddress);

  console.log("\n=== Complete Deployment Summary ===");
  console.log("DonationRegistry:", DONATION_REGISTRY);
  console.log("CharityVerification:", CHARITY_VERIFICATION);
  console.log("ImpactEscrow:", impactEscrowAddress);
  console.log("VerificationOracle:", verificationOracleAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



