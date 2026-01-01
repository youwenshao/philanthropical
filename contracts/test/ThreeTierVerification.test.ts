import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

/**
 * Integration tests for the three-tier verification system:
 * - Tier 1: CrowdsourcedVerification (community-based with staking)
 * - Tier 2: ProfessionalVerification (professional NGO organizations)
 * - Tier 3: VerificationOracle (Chainlink-based oracle verification)
 */
describe("Three-Tier Verification System Integration", function () {
  let crowdsourcedVerification: Contract;
  let professionalVerification: Contract;
  let verificationOracle: Contract;
  let charityVerification: Contract;

  let owner: HardhatEthersSigner;
  let charity: HardhatEthersSigner;
  let communityVoter1: HardhatEthersSigner;
  let communityVoter2: HardhatEthersSigner;
  let communityVoter3: HardhatEthersSigner;
  let communityVoter4: HardhatEthersSigner;
  let communityVoter5: HardhatEthersSigner;
  let profVerifier1: HardhatEthersSigner;
  let profVerifier2: HardhatEthersSigner;
  let oracle: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  beforeEach(async function () {
    [
      owner,
      charity,
      communityVoter1,
      communityVoter2,
      communityVoter3,
      communityVoter4,
      communityVoter5,
      profVerifier1,
      profVerifier2,
      oracle,
      admin,
    ] = await ethers.getSigners();

    // Deploy CharityVerification (for charity registration)
    const CharityVerification = await ethers.getContractFactory("CharityVerification");
    charityVerification = await upgrades.deployProxy(
      CharityVerification,
      [3, 7 * 24 * 60 * 60], // 3 approvals, 7 days challenge
      { initializer: "initialize" }
    );
    await charityVerification.waitForDeployment();

    // Deploy Tier 1: CrowdsourcedVerification
    const CrowdsourcedVerification = await ethers.getContractFactory("CrowdsourcedVerification");
    crowdsourcedVerification = await upgrades.deployProxy(
      CrowdsourcedVerification,
      [
        ethers.parseEther("0.1"), // minimumStake
        5, // minimumVotes
        6000, // consensusThreshold (60%)
        1000, // slashingPercentage (10%)
      ],
      { initializer: "initialize" }
    );
    await crowdsourcedVerification.waitForDeployment();

    // Deploy Tier 2: ProfessionalVerification
    const ProfessionalVerification = await ethers.getContractFactory("ProfessionalVerification");
    professionalVerification = await upgrades.deployProxy(
      ProfessionalVerification,
      [2], // requiredApprovals
      { initializer: "initialize" }
    );
    await professionalVerification.waitForDeployment();

    // Register professional verifiers
    await professionalVerification
      .connect(owner)
      .registerProfessionalVerifier(profVerifier1.address, "NGO 1", "ACC001");
    await professionalVerification
      .connect(owner)
      .registerProfessionalVerifier(profVerifier2.address, "NGO 2", "ACC002");

    // Deploy Tier 3: VerificationOracle
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

    // Register charity
    await charityVerification.registerCharity(
      charity.address,
      "Test Charity",
      "A test charity",
      "REG123"
    );

    // Approve charity (simplified - in real scenario would need 3 verifiers)
    // Grant verifier roles to multiple signers to avoid duplicate approval
    const [verifier1, verifier2, verifier3] = await ethers.getSigners();
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
    await charityVerification.connect(verifier1).approveVerification(charity.address);
    await charityVerification.connect(verifier2).approveVerification(charity.address);
    await charityVerification.connect(verifier3).approveVerification(charity.address);
  });

  describe("Tier 1: Crowdsourced Verification Flow", function () {
    it("Should complete Tier 1 verification with community consensus", async function () {
      const projectId = 1;
      const evidenceHash = "QmTier1Hash";

      // Submit verification
      await crowdsourcedVerification.submitVerification(
        charity.address,
        projectId,
        evidenceHash
      );

      // Community members vote (5 votes needed, 60% threshold)
      await crowdsourcedVerification
        .connect(communityVoter1)
        .castVote(1, 0, { value: ethers.parseEther("0.1") }); // Approve
      await crowdsourcedVerification
        .connect(communityVoter2)
        .castVote(1, 0, { value: ethers.parseEther("0.1") }); // Approve
      await crowdsourcedVerification
        .connect(communityVoter3)
        .castVote(1, 0, { value: ethers.parseEther("0.1") }); // Approve
      await crowdsourcedVerification
        .connect(communityVoter4)
        .castVote(1, 0, { value: ethers.parseEther("0.1") }); // Approve

      // 5th vote should trigger consensus
      await expect(
        crowdsourcedVerification
          .connect(communityVoter5)
          .castVote(1, 0, { value: ethers.parseEther("0.1") })
      )
        .to.emit(crowdsourcedVerification, "ConsensusReached")
        .withArgs(1n, 1n, 5n, 0n, (timestamp: any) => typeof timestamp === "bigint");

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.status).to.equal(1); // Approved
      expect(await crowdsourcedVerification.TIER()).to.equal(1);
    });
  });

  describe("Tier 2: Professional Verification Flow", function () {
    it("Should complete Tier 2 verification with professional verifiers", async function () {
      const projectId = 1;
      const evidenceHash = "QmTier2Hash";

      // Submit verification
      await professionalVerification.submitVerification(
        charity.address,
        projectId,
        evidenceHash
      );

      // Professional verifiers approve
      await professionalVerification.connect(profVerifier1).approveVerification(1);
      await expect(
        professionalVerification.connect(profVerifier2).approveVerification(1)
      )
        .to.emit(professionalVerification, "VerificationCompleted")
        .withArgs(1n, 1n, (verifiers: any[]) => verifiers.length === 2, (timestamp: any) => typeof timestamp === "bigint");

      const verification = await professionalVerification.getVerification(1);
      expect(verification.status).to.equal(1); // Approved
      expect(await professionalVerification.TIER()).to.equal(2);
    });
  });

  describe("Tier 3: Oracle Verification Flow", function () {
    it("Should complete Tier 3 verification with oracle", async function () {
      const projectId = 1;
      const evidenceHash = "QmTier3Hash";

      // Oracle deposits stake
      await verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("1.0") });

      // Submit verification (Tier 3)
      await verificationOracle.submitVerification(
        charity.address,
        projectId,
        evidenceHash,
        2 // VerificationTier.Tier3
      );

      // Oracle verifies impact (1 = Verified)
      await expect(
        verificationOracle.connect(oracle).verifyImpact(1, 1) // 1 = Verified
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
    });
  });

  describe("Multi-Tier Verification Workflow", function () {
    it("Should allow charity to use different tiers for different projects", async function () {
      // Project 1: Tier 1 (Crowdsourced)
      await crowdsourcedVerification.submitVerification(
        charity.address,
        1,
        "QmProject1"
      );
      await crowdsourcedVerification
        .connect(communityVoter1)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter2)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter3)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter4)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter5)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });

      const tier1Verification = await crowdsourcedVerification.getVerification(1);
      expect(tier1Verification.status).to.equal(1); // Approved

      // Project 2: Tier 2 (Professional)
      await professionalVerification.submitVerification(
        charity.address,
        2,
        "QmProject2"
      );
      await professionalVerification.connect(profVerifier1).approveVerification(1);
      await professionalVerification.connect(profVerifier2).approveVerification(1);

      const tier2Verification = await professionalVerification.getVerification(1);
      expect(tier2Verification.status).to.equal(1); // Approved

      // Project 3: Tier 3 (Oracle)
      await verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("1.0") });
      await verificationOracle.submitVerification(
        charity.address,
        3,
        "QmProject3",
        2 // VerificationTier.Tier3
      );
      await verificationOracle.connect(oracle).verifyImpact(1, 1); // 1 = Verified

      const tier3Verification = await verificationOracle.getVerification(1);
      expect(tier3Verification.result).to.equal(1); // Verified
    });
  });

  describe("Reputation System Across Tiers", function () {
    it("Should track reputation separately for each tier", async function () {
      // Tier 1: Community voter reputation
      await crowdsourcedVerification.submitVerification(
        charity.address,
        1,
        "QmHash"
      );
      await crowdsourcedVerification
        .connect(communityVoter1)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter2)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter3)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter4)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter5)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });

      const tier1Verifier = await crowdsourcedVerification.getVerifier(communityVoter1.address);
      expect(tier1Verifier.reputationScore).to.equal(110); // 100 + 10

      // Tier 2: Professional verifier reputation
      await professionalVerification.submitVerification(
        charity.address,
        2,
        "QmHash2"
      );
      await professionalVerification.connect(profVerifier1).approveVerification(1);
      await professionalVerification.connect(profVerifier2).approveVerification(1);

      const tier2Verifier = await professionalVerification.getProfessionalVerifier(profVerifier1.address);
      expect(tier2Verifier.reputationScore).to.equal(510); // 500 + 10
    });
  });

  describe("Dispute Resolution Across Tiers", function () {
    it("Should handle disputes in each tier independently", async function () {
      // Tier 1 dispute
      await crowdsourcedVerification.submitVerification(
        charity.address,
        1,
        "QmHash"
      );
      await crowdsourcedVerification
        .connect(communityVoter1)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter2)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter3)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter4)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });
      await crowdsourcedVerification
        .connect(communityVoter5)
        .castVote(1, 0, { value: ethers.parseEther("0.1") });

      await crowdsourcedVerification.connect(admin).createDispute(1, "Tier 1 dispute");
      const tier1Verification = await crowdsourcedVerification.getVerification(1);
      expect(tier1Verification.status).to.equal(3); // Disputed

      // Tier 2 dispute
      await professionalVerification.submitVerification(
        charity.address,
        2,
        "QmHash2"
      );
      await professionalVerification.connect(profVerifier1).approveVerification(1);
      await professionalVerification.connect(profVerifier2).approveVerification(1);

      await professionalVerification.connect(admin).createDispute(1, "Tier 2 dispute");
      const tier2Verification = await professionalVerification.getVerification(1);
      expect(tier2Verification.status).to.equal(3); // Disputed

      // Tier 3 dispute
      await verificationOracle.connect(oracle).depositStake({ value: ethers.parseEther("1.0") });
      await verificationOracle.submitVerification(
        charity.address,
        3,
        "QmHash3",
        2 // VerificationTier.Tier3
      );
      await verificationOracle.connect(oracle).verifyImpact(1, 1); // 1 = Verified

      await verificationOracle.connect(admin).createDispute(1, "Tier 3 dispute");
      const tier3Verification = await verificationOracle.getVerification(1);
      expect(tier3Verification.disputed).to.be.true;
    });
  });
});

