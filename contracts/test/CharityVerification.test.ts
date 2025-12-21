import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("CharityVerification", function () {
  let charityVerification: Contract;
  let owner: HardhatEthersSigner;
  let charity: HardhatEthersSigner;
  let verifier1: HardhatEthersSigner;
  let verifier2: HardhatEthersSigner;
  let verifier3: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, charity, verifier1, verifier2, verifier3, admin] = await ethers.getSigners();

    const CharityVerification = await ethers.getContractFactory("CharityVerification");
    charityVerification = await upgrades.deployProxy(
      CharityVerification,
      [3, 7 * 24 * 60 * 60], // 3 approvals, 7 days challenge
      { initializer: "initialize" }
    );
    await charityVerification.waitForDeployment();

    // Grant verifier roles
    await charityVerification.grantRole(
      await charityVerification.VERIFIER_ROLE(),
      verifier1.address
    );
    await charityVerification.grantRole(
      await charityVerification.VERIFIER_ROLE(),
      verifier2.address
    );
    await charityVerification.grantRole(
      await charityVerification.VERIFIER_ROLE(),
      verifier3.address
    );
  });

  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      expect(await charityVerification.requiredApprovals()).to.equal(3);
      expect(await charityVerification.challengePeriodDuration()).to.equal(7 * 24 * 60 * 60);
    });
  });

  describe("registerCharity", function () {
    it("Should register a charity successfully", async function () {
      await expect(
        charityVerification.registerCharity(
          charity.address,
          "Test Charity",
          "A test charity",
          "REG123"
        )
      )
        .to.emit(charityVerification, "CharityRegistered")
        .withArgs(charity.address, "Test Charity", (timestamp: any) => typeof timestamp === "bigint");

      const charityData = await charityVerification.getCharity(charity.address);
      expect(charityData.name).to.equal("Test Charity");
      expect(charityData.status).to.equal(0); // Pending
      expect(charityData.reputationScore).to.equal(100);
    });

    it("Should reject registration with zero address", async function () {
      await expect(
        charityVerification.registerCharity(
          ethers.ZeroAddress,
          "Test Charity",
          "Description",
          "REG123"
        )
      ).to.be.revertedWith("CharityVerification: invalid address");
    });

    it("Should reject duplicate registration", async function () {
      await charityVerification.registerCharity(
        charity.address,
        "Test Charity",
        "Description",
        "REG123"
      );

      await expect(
        charityVerification.registerCharity(
          charity.address,
          "Test Charity 2",
          "Description",
          "REG456"
        )
      ).to.be.revertedWith("CharityVerification: already registered");
    });
  });

  describe("approveVerification", function () {
    beforeEach(async function () {
      await charityVerification.registerCharity(
        charity.address,
        "Test Charity",
        "Description",
        "REG123"
      );
    });

    it("Should approve verification", async function () {
      await expect(
        charityVerification.connect(verifier1).approveVerification(charity.address)
      )
        .to.emit(charityVerification, "VerificationApproved")
        .withArgs(
          charity.address,
          verifier1.address,
          1n,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const approvalCount = await charityVerification.approvalCounts(charity.address);
      expect(approvalCount).to.equal(1);
    });

    it("Should verify charity after required approvals", async function () {
      await charityVerification.connect(verifier1).approveVerification(charity.address);
      await charityVerification.connect(verifier2).approveVerification(charity.address);

      await expect(
        charityVerification.connect(verifier3).approveVerification(charity.address)
      )
        .to.emit(charityVerification, "CharityVerified")
        .withArgs(
          charity.address,
          (verifiers: any[]) => verifiers.length === 3,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const charityData = await charityVerification.getCharity(charity.address);
      expect(charityData.status).to.equal(1); // Approved
      expect(charityData.verifiedAt).to.be.gt(0);
    });

    it("Should reject duplicate approval", async function () {
      await charityVerification.connect(verifier1).approveVerification(charity.address);

      await expect(
        charityVerification.connect(verifier1).approveVerification(charity.address)
      ).to.be.revertedWith("CharityVerification: already approved");
    });

    it("Should reject approval if not verifier", async function () {
      await expect(
        charityVerification.connect(charity).approveVerification(charity.address)
      ).to.be.reverted;
    });
  });

  describe("reportFraud", function () {
    beforeEach(async function () {
      await charityVerification.registerCharity(
        charity.address,
        "Test Charity",
        "Description",
        "REG123"
      );
      // Verify the charity
      await charityVerification.connect(verifier1).approveVerification(charity.address);
      await charityVerification.connect(verifier2).approveVerification(charity.address);
      await charityVerification.connect(verifier3).approveVerification(charity.address);
    });

    it("Should report fraud during challenge period", async function () {
      const charityData = await charityVerification.getCharity(charity.address);
      const challengeEnd = charityData.challengePeriodEnd;

      // Report fraud within challenge period
      await expect(
        charityVerification.reportFraud(charity.address, "Suspicious activity")
      )
        .to.emit(charityVerification, "FraudReported")
        .withArgs(
          charity.address,
          (reporter: any) => reporter !== ethers.ZeroAddress,
          "Suspicious activity",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const updatedCharity = await charityVerification.getCharity(charity.address);
      expect(updatedCharity.status).to.equal(3); // Challenged
    });

    it("Should auto-suspend after multiple fraud reports", async function () {
      // Report fraud 5 times
      for (let i = 0; i < 5; i++) {
        await charityVerification.reportFraud(charity.address, `Report ${i}`);
      }

      const charityData = await charityVerification.getCharity(charity.address);
      expect(charityData.status).to.equal(4); // Suspended
    });
  });

  describe("updateReputation", function () {
    beforeEach(async function () {
      await charityVerification.registerCharity(
        charity.address,
        "Test Charity",
        "Description",
        "REG123"
      );
    });

    it("Should update reputation score", async function () {
      await charityVerification.updateReputation(charity.address, 500);

      const charityData = await charityVerification.getCharity(charity.address);
      expect(charityData.reputationScore).to.equal(500);
    });

    it("Should reject invalid reputation score", async function () {
      await expect(
        charityVerification.updateReputation(charity.address, 1001)
      ).to.be.revertedWith("CharityVerification: invalid score");
    });
  });

  describe("suspendCharity", function () {
    beforeEach(async function () {
      await charityVerification.registerCharity(
        charity.address,
        "Test Charity",
        "Description",
        "REG123"
      );
    });

    it("Should suspend charity", async function () {
      await expect(
        charityVerification.suspendCharity(charity.address, "Violation of terms")
      )
        .to.emit(charityVerification, "CharitySuspended")
        .withArgs(
          charity.address,
          owner.address,
          "Violation of terms",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const charityData = await charityVerification.getCharity(charity.address);
      expect(charityData.status).to.equal(4); // Suspended
    });
  });
});

