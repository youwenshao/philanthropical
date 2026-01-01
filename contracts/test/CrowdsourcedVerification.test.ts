import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("CrowdsourcedVerification", function () {
  let crowdsourcedVerification: Contract;
  let owner: HardhatEthersSigner;
  let charity: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;
  let voter4: HardhatEthersSigner;
  let voter5: HardhatEthersSigner;
  let voter6: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let disputer: HardhatEthersSigner;

  const minimumStake = ethers.parseEther("0.1");
  const minimumVotes = 5;
  const consensusThreshold = 6000; // 60% in basis points
  const slashingPercentage = 1000; // 10% in basis points

  beforeEach(async function () {
    [owner, charity, voter1, voter2, voter3, voter4, voter5, voter6, admin, disputer] =
      await ethers.getSigners();

    const CrowdsourcedVerification = await ethers.getContractFactory("CrowdsourcedVerification");
    crowdsourcedVerification = await upgrades.deployProxy(
      CrowdsourcedVerification,
      [minimumStake, minimumVotes, consensusThreshold, slashingPercentage],
      { initializer: "initialize" }
    );
    await crowdsourcedVerification.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      expect(await crowdsourcedVerification.TIER()).to.equal(1);
      expect(await crowdsourcedVerification.minimumStake()).to.equal(minimumStake);
      expect(await crowdsourcedVerification.minimumVotes()).to.equal(minimumVotes);
      expect(await crowdsourcedVerification.consensusThreshold()).to.equal(consensusThreshold);
      expect(await crowdsourcedVerification.slashingPercentage()).to.equal(slashingPercentage);
    });

    it("Should reject invalid initialization parameters", async function () {
      const CrowdsourcedVerification = await ethers.getContractFactory("CrowdsourcedVerification");
      
      await expect(
        upgrades.deployProxy(
          CrowdsourcedVerification,
          [0, minimumVotes, consensusThreshold, slashingPercentage],
          { initializer: "initialize" }
        )
      ).to.be.revertedWith("CrowdsourcedVerification: invalid stake");

      await expect(
        upgrades.deployProxy(
          CrowdsourcedVerification,
          [minimumStake, 0, consensusThreshold, slashingPercentage],
          { initializer: "initialize" }
        )
      ).to.be.revertedWith("CrowdsourcedVerification: invalid votes");

      await expect(
        upgrades.deployProxy(
          CrowdsourcedVerification,
          [minimumStake, minimumVotes, 10001, slashingPercentage],
          { initializer: "initialize" }
        )
      ).to.be.revertedWith("CrowdsourcedVerification: invalid threshold");
    });
  });

  describe("submitVerification", function () {
    it("Should submit verification successfully", async function () {
      await expect(
        crowdsourcedVerification.submitVerification(
          charity.address,
          1,
          "QmHash123"
        )
      )
        .to.emit(crowdsourcedVerification, "VerificationSubmitted")
        .withArgs(
          1n,
          charity.address,
          1n,
          "QmHash123",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.charity).to.equal(charity.address);
      expect(verification.projectId).to.equal(1);
      expect(verification.evidenceHash).to.equal("QmHash123");
      expect(verification.status).to.equal(0); // Pending
    });

    it("Should reject submission with zero address", async function () {
      await expect(
        crowdsourcedVerification.submitVerification(
          ethers.ZeroAddress,
          1,
          "QmHash123"
        )
      ).to.be.revertedWith("CrowdsourcedVerification: invalid charity");
    });

    it("Should reject submission with empty hash", async function () {
      await expect(
        crowdsourcedVerification.submitVerification(
          charity.address,
          1,
          ""
        )
      ).to.be.revertedWith("CrowdsourcedVerification: empty hash");
    });
  });

  describe("depositStake", function () {
    it("Should deposit stake successfully", async function () {
      await expect(
        crowdsourcedVerification.connect(voter1).depositStake({ value: minimumStake })
      )
        .to.emit(crowdsourcedVerification, "StakeDeposited")
        .withArgs(
          voter1.address,
          minimumStake,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const stake = await crowdsourcedVerification.stakedAmounts(voter1.address);
      expect(stake).to.equal(minimumStake);

      const verifier = await crowdsourcedVerification.getVerifier(voter1.address);
      expect(verifier.verifierAddress).to.equal(voter1.address);
      expect(verifier.reputationScore).to.equal(100);
      expect(verifier.totalStaked).to.equal(minimumStake);
    });

    it("Should reject zero amount deposit", async function () {
      await expect(
        crowdsourcedVerification.connect(voter1).depositStake({ value: 0 })
      ).to.be.revertedWith("CrowdsourcedVerification: zero amount");
    });

    it("Should allow multiple deposits", async function () {
      await crowdsourcedVerification.connect(voter1).depositStake({ value: minimumStake });
      await crowdsourcedVerification.connect(voter1).depositStake({ value: minimumStake });

      const stake = await crowdsourcedVerification.stakedAmounts(voter1.address);
      expect(stake).to.equal(minimumStake * 2n);
    });
  });

  describe("castVote", function () {
    beforeEach(async function () {
      await crowdsourcedVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );
    });

    it("Should cast approve vote successfully", async function () {
      await expect(
        crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake }) // 0 = Approve
      )
        .to.emit(crowdsourcedVerification, "VoteCast")
        .withArgs(
          1n,
          voter1.address,
          0n, // Approve
          minimumStake,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.approveVotes).to.equal(1);
      expect(verification.totalVotes).to.equal(1);
    });

    it("Should cast reject vote successfully", async function () {
      await expect(
        crowdsourcedVerification.connect(voter1).castVote(1, 1, { value: minimumStake }) // 1 = Reject
      )
        .to.emit(crowdsourcedVerification, "VoteCast")
        .withArgs(
          1n,
          voter1.address,
          1n, // Reject
          minimumStake,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.rejectVotes).to.equal(1);
      expect(verification.totalVotes).to.equal(1);
    });

    it("Should reject vote with insufficient stake", async function () {
      await expect(
        crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("CrowdsourcedVerification: insufficient stake");
    });

    it("Should reject duplicate vote", async function () {
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });

      await expect(
        crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake })
      ).to.be.revertedWith("CrowdsourcedVerification: already voted");
    });

    it("Should reject vote on non-pending verification", async function () {
      // Create enough votes to reach consensus
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter5).castVote(1, 0, { value: minimumStake });

      // Verification should be approved now
      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.status).to.equal(1); // Approved

      // Try to vote on approved verification
      await expect(
        crowdsourcedVerification.connect(voter6).castVote(1, 0, { value: minimumStake })
      ).to.be.revertedWith("CrowdsourcedVerification: not pending");
    });
  });

  describe("Consensus Mechanism", function () {
    beforeEach(async function () {
      await crowdsourcedVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );
    });

    it("Should reach consensus with 5 approve votes (60% threshold)", async function () {
      // Cast 5 approve votes
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 0, { value: minimumStake });

      await expect(
        crowdsourcedVerification.connect(voter5).castVote(1, 0, { value: minimumStake })
      )
        .to.emit(crowdsourcedVerification, "ConsensusReached")
        .withArgs(
          1n,
          1n, // Approved
          5n,
          0n,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.status).to.equal(1); // Approved
      expect(verification.consensusReachedAt).to.be.gt(0);
    });

    it("Should reach consensus with 3 approve and 2 reject votes (60% threshold)", async function () {
      // Cast 3 approve and 2 reject votes
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 1, { value: minimumStake });
      await crowdsourcedVerification.connect(voter5).castVote(1, 1, { value: minimumStake });

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.status).to.equal(1); // Approved (3/5 = 60%)
      expect(verification.approveVotes).to.equal(3);
      expect(verification.rejectVotes).to.equal(2);
    });

    it("Should reject when reject votes reach 60%", async function () {
      // Cast 3 reject and 2 approve votes
      await crowdsourcedVerification.connect(voter1).castVote(1, 1, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 1, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 1, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter5).castVote(1, 0, { value: minimumStake });

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.status).to.equal(2); // Rejected
      expect(verification.rejectVotes).to.equal(3);
      expect(verification.approveVotes).to.equal(2);
    });

    it("Should not reach consensus with less than minimum votes", async function () {
      // Cast only 4 votes (less than minimum 5)
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 0, { value: minimumStake });

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.status).to.equal(0); // Still Pending
    });
  });

  describe("Reputation System", function () {
    beforeEach(async function () {
      await crowdsourcedVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );
    });

    it("Should increase reputation for matching consensus", async function () {
      // All voters approve, verification gets approved
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter5).castVote(1, 0, { value: minimumStake });

      const verifier1 = await crowdsourcedVerification.getVerifier(voter1.address);
      expect(verifier1.reputationScore).to.equal(110); // 100 + 10
      expect(verifier1.successfulVerifications).to.equal(1);
    });

    it("Should decrease reputation for non-matching consensus", async function () {
      // voter1 approves, but consensus is reject
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 1, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 1, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 1, { value: minimumStake });
      await crowdsourcedVerification.connect(voter5).castVote(1, 1, { value: minimumStake });

      const verifier1 = await crowdsourcedVerification.getVerifier(voter1.address);
      expect(verifier1.reputationScore).to.equal(80); // 100 - 20
      expect(verifier1.falseVerifications).to.equal(1);
    });

    it("Should cap reputation at 1000", async function () {
      // Cast many votes to increase reputation
      for (let i = 0; i < 100; i++) {
        await crowdsourcedVerification.submitVerification(
          charity.address,
          i + 2,
          `QmHash${i}`
        );
        await crowdsourcedVerification.connect(voter1).castVote(i + 2, 0, { value: minimumStake });
        await crowdsourcedVerification.connect(voter2).castVote(i + 2, 0, { value: minimumStake });
        await crowdsourcedVerification.connect(voter3).castVote(i + 2, 0, { value: minimumStake });
        await crowdsourcedVerification.connect(voter4).castVote(i + 2, 0, { value: minimumStake });
        await crowdsourcedVerification.connect(voter5).castVote(i + 2, 0, { value: minimumStake });
      }

      const verifier1 = await crowdsourcedVerification.getVerifier(voter1.address);
      expect(verifier1.reputationScore).to.equal(1000); // Capped at 1000
    });
  });

  describe("Dispute and Slashing", function () {
    beforeEach(async function () {
      await crowdsourcedVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );

      // Reach consensus (approved)
      await crowdsourcedVerification.connect(voter1).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter2).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter3).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter4).castVote(1, 0, { value: minimumStake });
      await crowdsourcedVerification.connect(voter5).castVote(1, 0, { value: minimumStake });
    });

    it("Should create dispute successfully", async function () {
      await expect(
        crowdsourcedVerification.connect(disputer).createDispute(1, "Fraud detected")
      )
        .to.emit(crowdsourcedVerification, "DisputeCreated")
        .withArgs(
          1n,
          disputer.address,
          "Fraud detected",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await crowdsourcedVerification.getVerification(1);
      expect(verification.status).to.equal(3); // Disputed
    });

    it("Should slash verifiers after dispute resolution", async function () {
      // Create dispute
      await crowdsourcedVerification.connect(disputer).createDispute(1, "Fraud detected");

      // Admin slashes approvers
      const voter1Stake = await crowdsourcedVerification.stakedAmounts(voter1.address);
      const slashAmount = (voter1Stake * BigInt(slashingPercentage)) / 10000n;

      await expect(
        crowdsourcedVerification.connect(owner).slashVerifiers(1, true) // slash approvers
      )
        .to.emit(crowdsourcedVerification, "VerifierSlashed")
        .withArgs(
          voter1.address,
          slashAmount,
          1n,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const newStake = await crowdsourcedVerification.stakedAmounts(voter1.address);
      expect(newStake).to.equal(voter1Stake - slashAmount);
    });

    it("Should reject slashing on non-disputed verification", async function () {
      await expect(
        crowdsourcedVerification.connect(owner).slashVerifiers(1, true)
      ).to.be.revertedWith("CrowdsourcedVerification: not disputed");
    });
  });

  describe("withdrawStake", function () {
    beforeEach(async function () {
      await crowdsourcedVerification.connect(voter1).depositStake({ value: minimumStake * 2n });
    });

    it("Should withdraw stake successfully", async function () {
      const initialBalance = await ethers.provider.getBalance(voter1.address);
      const withdrawAmount = minimumStake;

      const tx = await crowdsourcedVerification.connect(voter1).withdrawStake(withdrawAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx)
        .to.emit(crowdsourcedVerification, "StakeWithdrawn")
        .withArgs(
          voter1.address,
          withdrawAmount,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const finalBalance = await ethers.provider.getBalance(voter1.address);
      const stake = await crowdsourcedVerification.stakedAmounts(voter1.address);
      expect(stake).to.equal(minimumStake); // Remaining stake
    });

    it("Should reject withdrawal with insufficient balance", async function () {
      await expect(
        crowdsourcedVerification.connect(voter1).withdrawStake(minimumStake * 3n)
      ).to.be.revertedWith("CrowdsourcedVerification: insufficient balance");
    });
  });

  describe("Admin Functions", function () {
    it("Should update minimum stake", async function () {
      const newStake = ethers.parseEther("0.2");
      await crowdsourcedVerification.connect(owner).updateMinimumStake(newStake);
      expect(await crowdsourcedVerification.minimumStake()).to.equal(newStake);
    });

    it("Should update consensus parameters", async function () {
      const newMinimumVotes = 7;
      const newThreshold = 7000; // 70%

      await crowdsourcedVerification
        .connect(owner)
        .updateConsensusParams(newMinimumVotes, newThreshold);

      expect(await crowdsourcedVerification.minimumVotes()).to.equal(newMinimumVotes);
      expect(await crowdsourcedVerification.consensusThreshold()).to.equal(newThreshold);
    });

    it("Should update slashing percentage", async function () {
      const newPercentage = 2000; // 20%
      await crowdsourcedVerification.connect(owner).updateSlashingPercentage(newPercentage);
      expect(await crowdsourcedVerification.slashingPercentage()).to.equal(newPercentage);
    });

    it("Should reject admin functions from non-admin", async function () {
      await expect(
        crowdsourcedVerification.connect(voter1).updateMinimumStake(ethers.parseEther("0.2"))
      ).to.be.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause contract", async function () {
      await crowdsourcedVerification.connect(owner).pause();
      expect(await crowdsourcedVerification.paused()).to.be.true;

      await expect(
        crowdsourcedVerification.submitVerification(charity.address, 1, "QmHash123")
      ).to.be.revertedWithCustomError(crowdsourcedVerification, "EnforcedPause");

      await crowdsourcedVerification.connect(owner).unpause();
      expect(await crowdsourcedVerification.paused()).to.be.false;

      await expect(
        crowdsourcedVerification.submitVerification(charity.address, 1, "QmHash123")
      ).to.emit(crowdsourcedVerification, "VerificationSubmitted");
    });
  });
});


