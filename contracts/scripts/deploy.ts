import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check if a contract is already deployed at the given address
 * @param address Contract address to check
 * @returns true if contract code exists, false otherwise
 */
async function isContractDeployed(address: string): Promise<boolean> {
  if (!address || address === "" || address === "0x" || !ethers.isAddress(address)) {
    return false;
  }

  try {
    const code = await ethers.provider.getCode(address);
    // Contract exists if code size > 0 (0x0 means no contract)
    return code !== "0x" && code.length > 2;
  } catch (error) {
    // If we can't check, assume not deployed
    return false;
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("\nChecking for existing contracts...\n");

  // Track existing vs newly deployed contracts
  const existingContracts: Record<string, string> = {};
  const newContracts: Record<string, string> = {};

  // Deploy DonationRegistry
  let donationRegistryAddress = process.env.DONATION_REGISTRY_ADDRESS || "";
  if (donationRegistryAddress && await isContractDeployed(donationRegistryAddress)) {
    console.log("✓ DonationRegistry already deployed at:", donationRegistryAddress);
    existingContracts["DonationRegistry"] = donationRegistryAddress;
  } else {
    console.log("Deploying DonationRegistry...");
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
    donationRegistryAddress = await donationRegistry.getAddress();
    console.log("DonationRegistry deployed to:", donationRegistryAddress);
    newContracts["DonationRegistry"] = donationRegistryAddress;
  }

  // Deploy CharityVerification
  let charityVerificationAddress = process.env.CHARITY_VERIFICATION_ADDRESS || "";
  if (charityVerificationAddress && await isContractDeployed(charityVerificationAddress)) {
    console.log("✓ CharityVerification already deployed at:", charityVerificationAddress);
    existingContracts["CharityVerification"] = charityVerificationAddress;
  } else {
    console.log("Deploying CharityVerification...");
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
    charityVerificationAddress = await charityVerification.getAddress();
    console.log("CharityVerification deployed to:", charityVerificationAddress);
    newContracts["CharityVerification"] = charityVerificationAddress;
  }

  // Deploy ImpactEscrow
  let impactEscrowAddress = process.env.IMPACT_ESCROW_ADDRESS || "";
  if (impactEscrowAddress && await isContractDeployed(impactEscrowAddress)) {
    console.log("✓ ImpactEscrow already deployed at:", impactEscrowAddress);
    existingContracts["ImpactEscrow"] = impactEscrowAddress;
  } else {
    console.log("Deploying ImpactEscrow...");
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
    impactEscrowAddress = await impactEscrow.getAddress();
    console.log("ImpactEscrow deployed to:", impactEscrowAddress);
    newContracts["ImpactEscrow"] = impactEscrowAddress;
  }

  // Deploy VerificationOracle
  let verificationOracleAddress = process.env.VERIFICATION_ORACLE_ADDRESS || "";
  if (verificationOracleAddress && await isContractDeployed(verificationOracleAddress)) {
    console.log("✓ VerificationOracle already deployed at:", verificationOracleAddress);
    existingContracts["VerificationOracle"] = verificationOracleAddress;
  } else {
    console.log("Deploying VerificationOracle...");
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
    verificationOracleAddress = await verificationOracle.getAddress();
    console.log("VerificationOracle deployed to:", verificationOracleAddress);
    newContracts["VerificationOracle"] = verificationOracleAddress;
  }

  // Deploy CrowdsourcedVerification (Phase 2 - Tier 1)
  let crowdsourcedVerificationAddress = process.env.CROWDSOURCED_VERIFICATION_ADDRESS || "";
  if (crowdsourcedVerificationAddress && await isContractDeployed(crowdsourcedVerificationAddress)) {
    console.log("✓ CrowdsourcedVerification already deployed at:", crowdsourcedVerificationAddress);
    existingContracts["CrowdsourcedVerification"] = crowdsourcedVerificationAddress;
  } else {
    console.log("Deploying CrowdsourcedVerification...");
    const CrowdsourcedVerification = await ethers.getContractFactory("CrowdsourcedVerification");
    const crowdsourcedVerification = await upgrades.deployProxy(
      CrowdsourcedVerification,
      [
        ethers.parseEther("0.1"), // minimumStake (0.1 ETH)
        5, // minimumVotes
        6000, // consensusThreshold (60% in basis points)
        1000, // slashingPercentage (10% in basis points)
      ],
      { initializer: "initialize" }
    );
    await crowdsourcedVerification.waitForDeployment();
    crowdsourcedVerificationAddress = await crowdsourcedVerification.getAddress();
    console.log("CrowdsourcedVerification deployed to:", crowdsourcedVerificationAddress);
    newContracts["CrowdsourcedVerification"] = crowdsourcedVerificationAddress;
  }

  // Deploy ProfessionalVerification (Phase 2 - Tier 2)
  let professionalVerificationAddress = process.env.PROFESSIONAL_VERIFICATION_ADDRESS || "";
  if (professionalVerificationAddress && await isContractDeployed(professionalVerificationAddress)) {
    console.log("✓ ProfessionalVerification already deployed at:", professionalVerificationAddress);
    existingContracts["ProfessionalVerification"] = professionalVerificationAddress;
  } else {
    console.log("Deploying ProfessionalVerification...");
    const ProfessionalVerification = await ethers.getContractFactory("ProfessionalVerification");
    const professionalVerification = await upgrades.deployProxy(
      ProfessionalVerification,
      [
        2, // requiredApprovals (2 professional verifiers)
      ],
      { initializer: "initialize" }
    );
    await professionalVerification.waitForDeployment();
    professionalVerificationAddress = await professionalVerification.getAddress();
    console.log("ProfessionalVerification deployed to:", professionalVerificationAddress);
    newContracts["ProfessionalVerification"] = professionalVerificationAddress;
  }

  // Deployment Summary
  console.log("\n=== Deployment Summary ===");
  
  if (Object.keys(existingContracts).length > 0) {
    console.log("\nExisting Contracts (skipped):");
    for (const [name, address] of Object.entries(existingContracts)) {
      console.log(`  ${name}: ${address}`);
    }
  }

  if (Object.keys(newContracts).length > 0) {
    console.log("\nNewly Deployed Contracts:");
    for (const [name, address] of Object.entries(newContracts)) {
      console.log(`  ${name}: ${address}`);
    }
  }

  console.log("\nAll Contract Addresses:");
  console.log("DonationRegistry:", donationRegistryAddress);
  console.log("CharityVerification:", charityVerificationAddress);
  console.log("ImpactEscrow:", impactEscrowAddress);
  console.log("VerificationOracle:", verificationOracleAddress);
  console.log("CrowdsourcedVerification:", crowdsourcedVerificationAddress);
  console.log("ProfessionalVerification:", professionalVerificationAddress);
  
  if (Object.keys(newContracts).length > 0) {
    console.log("\n💡 Update your .env file with the new contract addresses above.");
  } else {
    console.log("\n✓ All contracts already deployed. No POL spent!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

