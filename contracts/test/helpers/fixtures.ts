import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

export interface Contracts {
  donationRegistry: Contract;
  charityVerification: Contract;
  impactEscrow: Contract;
  verificationOracle: Contract;
}

export async function deployContracts(
  deployer: HardhatEthersSigner,
  royaltyReceiver?: HardhatEthersSigner
): Promise<Contracts> {
  const receiver = royaltyReceiver || deployer;

  // Deploy DonationRegistry
  const DonationRegistry = await ethers.getContractFactory("DonationRegistry");
  const donationRegistry = await upgrades.deployProxy(
    DonationRegistry,
    [receiver.address, 250], // 2.5% platform fee
    { initializer: "initialize" }
  );
  await donationRegistry.waitForDeployment();

  // Deploy CharityVerification
  const CharityVerification = await ethers.getContractFactory("CharityVerification");
  const charityVerification = await upgrades.deployProxy(
    CharityVerification,
    [3, 7 * 24 * 60 * 60], // 3 approvals, 7 days challenge
    { initializer: "initialize" }
  );
  await charityVerification.waitForDeployment();

  // Deploy ImpactEscrow
  const ImpactEscrow = await ethers.getContractFactory("ImpactEscrow");
  const impactEscrow = await upgrades.deployProxy(
    ImpactEscrow,
    [2 * 24 * 60 * 60, 2], // 2 days timelock, 2 approvals
    { initializer: "initialize" }
  );
  await impactEscrow.waitForDeployment();

  // Deploy VerificationOracle
  const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
  const verificationOracle = await upgrades.deployProxy(
    VerificationOracle,
    [ethers.parseEther("1.0"), 7 * 24 * 60 * 60, 1000], // 1 ETH stake, 7 days dispute, 10% penalty
    { initializer: "initialize" }
  );
  await verificationOracle.waitForDeployment();

  return {
    donationRegistry,
    charityVerification,
    impactEscrow,
    verificationOracle,
  };
}

