import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy DonationRegistry
  console.log("\nDeploying DonationRegistry...");
  const DonationRegistry = await ethers.getContractFactory("DonationRegistry");
  const donationRegistry = await upgrades.deployProxy(
    DonationRegistry,
    [
      deployer.address, // defaultRoyaltyReceiver
      250, // platformFeeBps (2.5%)
    ],
    { initializer: "initialize" }
  );
  await donationRegistry.waitForDeployment();
  const donationRegistryAddress = await donationRegistry.getAddress();
  console.log("DonationRegistry deployed to:", donationRegistryAddress);

  // Deploy CharityVerification
  console.log("\nDeploying CharityVerification...");
  const CharityVerification = await ethers.getContractFactory("CharityVerification");
  const charityVerification = await upgrades.deployProxy(
    CharityVerification,
    [
      3, // requiredApprovals
      7 * 24 * 60 * 60, // challengePeriodDuration (7 days)
    ],
    { initializer: "initialize" }
  );
  await charityVerification.waitForDeployment();
  const charityVerificationAddress = await charityVerification.getAddress();
  console.log("CharityVerification deployed to:", charityVerificationAddress);

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

  console.log("\n=== Deployment Summary ===");
  console.log("DonationRegistry:", donationRegistryAddress);
  console.log("CharityVerification:", charityVerificationAddress);
  console.log("ImpactEscrow:", impactEscrowAddress);
  console.log("VerificationOracle:", verificationOracleAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

