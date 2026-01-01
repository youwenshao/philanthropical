import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("VerificationOracle", function () {
  let verificationOracle: Contract;
  let owner: HardhatEthersSigner;
  let charity: HardhatEthersSigner;
  let oracle: HardhatEthersSigner;
  let disputer: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, charity, oracle, disputer, admin] = await ethers.getSigners();

    const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
    verificationOracle = await upgrades.deployProxy(
      VerificationOracle,
      [ethers.parseEther("1.0"), 7 * 24 * 60 * 60, 1000], // 1 ETH stake, 7 days dispute, 10% penalty
      { initializer: "initialize" }
    );
    await verificationOracle.waitForDeployment();

    // Grant oracle role
    await verificationOracle.grantRole(
      await verificationOracle.ORACLE_ROLE(),
      oracle.address
    );
  });

  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      expect(await verificationOracle.requiredStake()).to.equal(ethers.parseEther("1.0"));
      expect(await verificationOracle.disputePeriod()).to.equal(7 * 24 * 60 * 60);
      expect(await verificationOracle.penaltyPercentage()).to.equal(1000);
    });
  });

  describe("submitVerification", function () {
    it("Should submit verification successfully", async function () {
      await expect(
        verificationOracle.submitVerification(
          charity.address,
          1,
          "QmHash123",
          2 // VerificationTier.Tier3
        )
      )
        .to.emit(verificationOracle, "VerificationSubmitted")
        .withArgs(
          1n,
          charity.address,
          1n,
          "QmHash123",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await verificationOracle.getVerification(1);
      expect(verification.charity).to.equal(charity.address);
      expect(verification.evidenceHash).to.equal("QmHash123");
      expect(verification.result).to.equal(0); // Pending
    });
  });

  describe("depositStake", function () {
    it("Should deposit stake", async function () {
      await expect(
        verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("1.0") })
      )
        .to.emit(verificationOracle, "StakeDeposited")
        .withArgs(
          oracle.address,
          ethers.parseEther("1.0"),
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const stake = await verificationOracle.stakedAmounts(oracle.address);
      expect(stake).to.equal(ethers.parseEther("1.0"));
    });

    it("Should reject insufficient stake", async function () {
      await expect(
        verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("VerificationOracle: insufficient stake");
    });
  });

  describe("verifyImpact", function () {
    beforeEach(async function () {
      // Deposit stake
      await verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("1.0") });
      
      // Submit verification
      await verificationOracle.submitVerification(
        charity.address,
        1,
        "QmHash123",
        2 // VerificationTier.Tier3
      );
    });

    it("Should verify impact", async function () {
      await expect(
        verificationOracle.connect(oracle).verifyImpact(1, 1) // Verified
      )
        .to.emit(verificationOracle, "VerificationCompleted")
        .withArgs(
          1n,
          oracle.address,
          1n, // Verified
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await verificationOracle.getVerification(1);
      expect(verification.result).to.equal(1); // Verified
      expect(verification.verifiedBy).to.equal(oracle.address);
    });

    it("Should reject verification without stake", async function () {
      const newOracle = (await ethers.getSigners())[5];
      await verificationOracle.grantRole(
        await verificationOracle.ORACLE_ROLE(),
        newOracle.address
      );

      await expect(
        verificationOracle.connect(newOracle).verifyImpact(1, 1)
      ).to.be.revertedWith("VerificationOracle: insufficient stake");
    });
  });

  describe("createDispute", function () {
    beforeEach(async function () {
      // Deposit stake and verify
      await verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("1.0") });
      await verificationOracle.submitVerification(
        charity.address,
        1,
        "QmHash123",
        2 // VerificationTier.Tier3
      );
      await verificationOracle.connect(oracle).verifyImpact(1, 1); // Verified
    });

    it("Should create dispute", async function () {
      await expect(
        verificationOracle.connect(disputer).createDispute(1, "False verification")
      )
        .to.emit(verificationOracle, "DisputeCreated")
        .withArgs(
          1n,
          1n,
          disputer.address,
          "False verification",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await verificationOracle.getVerification(1);
      expect(verification.disputed).to.be.true;
      expect(verification.result).to.equal(3); // Disputed
    });
  });

  describe("resolveDispute", function () {
    beforeEach(async function () {
      // Deposit stake, verify, and dispute
      await verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("1.0") });
      await verificationOracle.submitVerification(
        charity.address,
        1,
        "QmHash123",
        2 // VerificationTier.Tier3
      );
      await verificationOracle.connect(oracle).verifyImpact(1, 1);
      await verificationOracle.connect(disputer).createDispute(1, "False verification");
    });

    it("Should resolve dispute in favor of disputer", async function () {
      await expect(
        verificationOracle.resolveDispute(1, true)
      )
        .to.emit(verificationOracle, "DisputeResolved")
        .withArgs(
          1n,
          1n,
          true,
          owner.address,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const dispute = await verificationOracle.getDispute(1);
      expect(dispute.resolved).to.be.true;
      expect(dispute.disputeWon).to.be.true;
    });

    it("Should resolve dispute in favor of oracle", async function () {
      await expect(
        verificationOracle.resolveDispute(1, false)
      )
        .to.emit(verificationOracle, "DisputeResolved")
        .withArgs(
          1n,
          1n,
          false,
          owner.address,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const dispute = await verificationOracle.getDispute(1);
      expect(dispute.resolved).to.be.true;
      expect(dispute.disputeWon).to.be.false;
    });
  });
});

