import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("ProfessionalVerification", function () {
  let professionalVerification: Contract;
  let owner: HardhatEthersSigner;
  let charity: HardhatEthersSigner;
  let profVerifier1: HardhatEthersSigner;
  let profVerifier2: HardhatEthersSigner;
  let profVerifier3: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let disputer: HardhatEthersSigner;

  const requiredApprovals = 2;

  beforeEach(async function () {
    [owner, charity, profVerifier1, profVerifier2, profVerifier3, admin, disputer] =
      await ethers.getSigners();

    const ProfessionalVerification = await ethers.getContractFactory("ProfessionalVerification");
    professionalVerification = await upgrades.deployProxy(
      ProfessionalVerification,
      [requiredApprovals],
      { initializer: "initialize" }
    );
    await professionalVerification.waitForDeployment();

    // Register professional verifiers
    await professionalVerification
      .connect(owner)
      .registerProfessionalVerifier(
        profVerifier1.address,
        "NGO Organization 1",
        "ACC001"
      );
    await professionalVerification
      .connect(owner)
      .registerProfessionalVerifier(
        profVerifier2.address,
        "NGO Organization 2",
        "ACC002"
      );
    await professionalVerification
      .connect(owner)
      .registerProfessionalVerifier(
        profVerifier3.address,
        "NGO Organization 3",
        "ACC003"
      );
  });

  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      expect(await professionalVerification.TIER()).to.equal(2);
      expect(await professionalVerification.requiredApprovals()).to.equal(requiredApprovals);
    });

    it("Should reject invalid initialization parameters", async function () {
      const ProfessionalVerification = await ethers.getContractFactory("ProfessionalVerification");
      
      await expect(
        upgrades.deployProxy(
          ProfessionalVerification,
          [0],
          { initializer: "initialize" }
        )
      ).to.be.revertedWith("ProfessionalVerification: invalid approvals");
    });
  });

  describe("registerProfessionalVerifier", function () {
    it("Should register professional verifier successfully", async function () {
      const newVerifier = (await ethers.getSigners())[10];

      await expect(
        professionalVerification
          .connect(owner)
          .registerProfessionalVerifier(
            newVerifier.address,
            "New NGO",
            "ACC004"
          )
      )
        .to.emit(professionalVerification, "ProfessionalVerifierRegistered")
        .withArgs(
          newVerifier.address,
          "New NGO",
          "ACC004",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verifier = await professionalVerification.getProfessionalVerifier(newVerifier.address);
      expect(verifier.organizationName).to.equal("New NGO");
      expect(verifier.accreditationNumber).to.equal("ACC004");
      expect(verifier.reputationScore).to.equal(500); // Higher initial reputation
      expect(verifier.active).to.be.true;

      // Check role was granted
      expect(
        await professionalVerification.hasRole(
          await professionalVerification.PROFESSIONAL_VERIFIER_ROLE(),
          newVerifier.address
        )
      ).to.be.true;
    });

    it("Should reject registration with zero address", async function () {
      await expect(
        professionalVerification
          .connect(owner)
          .registerProfessionalVerifier(
            ethers.ZeroAddress,
            "NGO",
            "ACC"
          )
      ).to.be.revertedWith("ProfessionalVerification: invalid address");
    });

    it("Should reject duplicate registration", async function () {
      await expect(
        professionalVerification
          .connect(owner)
          .registerProfessionalVerifier(
            profVerifier1.address,
            "Duplicate NGO",
            "ACC005"
          )
      ).to.be.revertedWith("ProfessionalVerification: already registered");
    });

    it("Should reject registration from non-admin", async function () {
      await expect(
        professionalVerification
          .connect(profVerifier1)
          .registerProfessionalVerifier(
            (await ethers.getSigners())[10].address,
            "NGO",
            "ACC"
          )
      ).to.be.reverted;
    });
  });

  describe("removeProfessionalVerifier", function () {
    it("Should remove professional verifier successfully", async function () {
      await expect(
        professionalVerification.connect(owner).removeProfessionalVerifier(profVerifier1.address)
      )
        .to.emit(professionalVerification, "ProfessionalVerifierRemoved")
        .withArgs(profVerifier1.address, (timestamp: any) => typeof timestamp === "bigint");

      const verifier = await professionalVerification.getProfessionalVerifier(profVerifier1.address);
      expect(verifier.active).to.be.false;

      // Check role was revoked
      expect(
        await professionalVerification.hasRole(
          await professionalVerification.PROFESSIONAL_VERIFIER_ROLE(),
          profVerifier1.address
        )
      ).to.be.false;
    });

    it("Should reject removal of non-registered verifier", async function () {
      const newVerifier = (await ethers.getSigners())[10];
      await expect(
        professionalVerification.connect(owner).removeProfessionalVerifier(newVerifier.address)
      ).to.be.revertedWith("ProfessionalVerification: not registered");
    });
  });

  describe("submitVerification", function () {
    it("Should submit verification successfully", async function () {
      await expect(
        professionalVerification.submitVerification(
          charity.address,
          1,
          "QmHash123"
        )
      )
        .to.emit(professionalVerification, "VerificationSubmitted")
        .withArgs(
          1n,
          charity.address,
          1n,
          "QmHash123",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await professionalVerification.getVerification(1);
      expect(verification.charity).to.equal(charity.address);
      expect(verification.projectId).to.equal(1);
      expect(verification.evidenceHash).to.equal("QmHash123");
      expect(verification.status).to.equal(0); // Pending
    });

    it("Should reject submission with zero address", async function () {
      await expect(
        professionalVerification.submitVerification(
          ethers.ZeroAddress,
          1,
          "QmHash123"
        )
      ).to.be.revertedWith("ProfessionalVerification: invalid charity");
    });

    it("Should reject submission with empty hash", async function () {
      await expect(
        professionalVerification.submitVerification(
          charity.address,
          1,
          ""
        )
      ).to.be.revertedWith("ProfessionalVerification: empty hash");
    });
  });

  describe("approveVerification", function () {
    beforeEach(async function () {
      await professionalVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );
    });

    it("Should approve verification successfully", async function () {
      await expect(
        professionalVerification.connect(profVerifier1).approveVerification(1)
      )
        .to.emit(professionalVerification, "VerificationApproved")
        .withArgs(
          1n,
          profVerifier1.address,
          1n,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await professionalVerification.getVerification(1);
      expect(verification.approvalCount).to.equal(1);
      expect(verification.verifiers.length).to.equal(1);
    });

    it("Should complete verification after required approvals", async function () {
      await professionalVerification.connect(profVerifier1).approveVerification(1);

      await expect(
        professionalVerification.connect(profVerifier2).approveVerification(1)
      )
        .to.emit(professionalVerification, "VerificationCompleted")
        .withArgs(
          1n,
          1n, // Approved
          (verifiers: any[]) => verifiers.length === 2,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await professionalVerification.getVerification(1);
      expect(verification.status).to.equal(1); // Approved
      expect(verification.verifiedAt).to.be.gt(0);
      expect(verification.approvalCount).to.equal(2);
    });

    it("Should reject duplicate approval", async function () {
      await professionalVerification.connect(profVerifier1).approveVerification(1);

      await expect(
        professionalVerification.connect(profVerifier1).approveVerification(1)
      ).to.be.revertedWith("ProfessionalVerification: already approved");
    });

    it("Should reject approval from non-professional verifier", async function () {
      const nonVerifier = (await ethers.getSigners())[10];
      await expect(
        professionalVerification.connect(nonVerifier).approveVerification(1)
      ).to.be.reverted;
    });

    it("Should reject approval from inactive verifier", async function () {
      await professionalVerification.connect(owner).removeProfessionalVerifier(profVerifier1.address);

      await expect(
        professionalVerification.connect(profVerifier1).approveVerification(1)
      ).to.be.reverted; // May revert with AccessControl error or custom error
    });

    it("Should reject approval on non-pending verification", async function () {
      await professionalVerification.connect(profVerifier1).approveVerification(1);
      await professionalVerification.connect(profVerifier2).approveVerification(1);

      // Verification is now approved
      await expect(
        professionalVerification.connect(profVerifier3).approveVerification(1)
      ).to.be.revertedWith("ProfessionalVerification: not pending");
    });
  });

  describe("rejectVerification", function () {
    beforeEach(async function () {
      await professionalVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );
    });

    it("Should reject verification successfully", async function () {
      await expect(
        professionalVerification.connect(profVerifier1).rejectVerification(1, "Invalid evidence")
      )
        .to.emit(professionalVerification, "VerificationRejected")
        .withArgs(
          1n,
          profVerifier1.address,
          "Invalid evidence",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await professionalVerification.getVerification(1);
      expect(verification.rejectionCount).to.equal(1);
    });

    it("Should complete rejection after required rejections", async function () {
      await professionalVerification.connect(profVerifier1).rejectVerification(1, "Reason 1");
      await professionalVerification.connect(profVerifier2).rejectVerification(1, "Reason 2");

      const verification = await professionalVerification.getVerification(1);
      expect(verification.status).to.equal(2); // Rejected
      expect(verification.verifiedAt).to.be.gt(0);
    });

    it("Should reject duplicate rejection", async function () {
      await professionalVerification.connect(profVerifier1).rejectVerification(1, "Reason");

      await expect(
        professionalVerification.connect(profVerifier1).rejectVerification(1, "Reason 2")
      ).to.be.revertedWith("ProfessionalVerification: already rejected");
    });
  });

  describe("Reputation System", function () {
    beforeEach(async function () {
      await professionalVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );
    });

    it("Should increase reputation for successful verification", async function () {
      const initialReputation = (await professionalVerification.getProfessionalVerifier(profVerifier1.address)).reputationScore;
      
      await professionalVerification.connect(profVerifier1).approveVerification(1);
      await professionalVerification.connect(profVerifier2).approveVerification(1);

      const verifier = await professionalVerification.getProfessionalVerifier(profVerifier1.address);
      expect(verifier.reputationScore).to.equal(initialReputation + 10n);
      expect(verifier.successfulVerifications).to.equal(1);
      expect(verifier.totalVerifications).to.equal(1);
    });

    it("Should cap reputation at 1000", async function () {
      // Perform many successful verifications
      for (let i = 0; i < 60; i++) {
        await professionalVerification.submitVerification(
          charity.address,
          i + 2,
          `QmHash${i}`
        );
        await professionalVerification.connect(profVerifier1).approveVerification(i + 2);
        await professionalVerification.connect(profVerifier2).approveVerification(i + 2);
      }

      const verifier = await professionalVerification.getProfessionalVerifier(profVerifier1.address);
      expect(verifier.reputationScore).to.equal(1000); // Capped at 1000
    });
  });

  describe("Dispute", function () {
    beforeEach(async function () {
      await professionalVerification.submitVerification(
        charity.address,
        1,
        "QmHash123"
      );
      await professionalVerification.connect(profVerifier1).approveVerification(1);
      await professionalVerification.connect(profVerifier2).approveVerification(1);
    });

    it("Should create dispute successfully", async function () {
      await expect(
        professionalVerification.connect(disputer).createDispute(1, "Fraud detected")
      )
        .to.emit(professionalVerification, "DisputeCreated")
        .withArgs(
          1n,
          disputer.address,
          "Fraud detected",
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const verification = await professionalVerification.getVerification(1);
      expect(verification.status).to.equal(3); // Disputed
    });

    it("Should reject dispute on pending verification", async function () {
      await professionalVerification.submitVerification(
        charity.address,
        2,
        "QmHash456"
      );

      await expect(
        professionalVerification.connect(disputer).createDispute(2, "Reason")
      ).to.be.revertedWith("ProfessionalVerification: cannot dispute");
    });
  });

  describe("Admin Functions", function () {
    it("Should update required approvals", async function () {
      const newRequiredApprovals = 3;
      await professionalVerification.connect(owner).updateRequiredApprovals(newRequiredApprovals);
      expect(await professionalVerification.requiredApprovals()).to.equal(newRequiredApprovals);
    });

    it("Should reject admin functions from non-admin", async function () {
      await expect(
        professionalVerification.connect(profVerifier1).updateRequiredApprovals(3)
      ).to.be.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause contract", async function () {
      await professionalVerification.connect(owner).pause();
      expect(await professionalVerification.paused()).to.be.true;

      await expect(
        professionalVerification.submitVerification(charity.address, 1, "QmHash123")
      ).to.be.revertedWithCustomError(professionalVerification, "EnforcedPause");

      await professionalVerification.connect(owner).unpause();
      expect(await professionalVerification.paused()).to.be.false;

      await expect(
        professionalVerification.submitVerification(charity.address, 1, "QmHash123")
      ).to.emit(professionalVerification, "VerificationSubmitted");
    });
  });
});

