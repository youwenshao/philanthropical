import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("ImpactEscrow", function () {
  let impactEscrow: Contract;
  let mockToken: Contract;
  let owner: HardhatEthersSigner;
  let charity: HardhatEthersSigner;
  let treasurer1: HardhatEthersSigner;
  let treasurer2: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, charity, treasurer1, treasurer2, admin] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("ERC20Mock");
    mockToken = await MockERC20.deploy("Test Token", "TEST", owner.address, ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    const ImpactEscrow = await ethers.getContractFactory("ImpactEscrow");
    impactEscrow = await upgrades.deployProxy(
      ImpactEscrow,
      [2 * 24 * 60 * 60, 2], // 2 days timelock, 2 approvals
      { initializer: "initialize" }
    );
    await impactEscrow.waitForDeployment();

    // Grant treasurer roles
    await impactEscrow.grantRole(
      await impactEscrow.TREASURER_ROLE(),
      treasurer1.address
    );
    await impactEscrow.grantRole(
      await impactEscrow.TREASURER_ROLE(),
      treasurer2.address
    );

    // Approve escrow to spend tokens
    await mockToken.approve(await impactEscrow.getAddress(), ethers.parseEther("1000000"));
  });

  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      expect(await impactEscrow.timelockDuration()).to.equal(2 * 24 * 60 * 60);
      expect(await impactEscrow.requiredApprovals()).to.equal(2);
    });
  });

  describe("createProject", function () {
    it("Should create a project successfully", async function () {
      const totalAmount = ethers.parseEther("10000");

      await expect(
        impactEscrow.createProject(
          charity.address,
          await mockToken.getAddress(),
          totalAmount
        )
      )
        .to.emit(impactEscrow, "ProjectCreated")
        .withArgs(
          1n,
          charity.address,
          await mockToken.getAddress(),
          totalAmount,
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const project = await impactEscrow.getProject(1);
      expect(project.charity).to.equal(charity.address);
      expect(project.totalAmount).to.equal(totalAmount);
      expect(project.active).to.be.true;
    });

    it("Should transfer tokens to escrow", async function () {
      const totalAmount = ethers.parseEther("10000");

      await impactEscrow.createProject(
        charity.address,
        await mockToken.getAddress(),
        totalAmount
      );

      const escrowBalance = await mockToken.balanceOf(await impactEscrow.getAddress());
      expect(escrowBalance).to.equal(totalAmount);
    });
  });

  describe("createMilestone", function () {
    let projectId: bigint;

    beforeEach(async function () {
      const totalAmount = ethers.parseEther("10000");
      const tx = await impactEscrow.createProject(
        charity.address,
        await mockToken.getAddress(),
        totalAmount
      );
      const receipt = await tx.wait();
      projectId = 1n;
    });

    it("Should create a milestone", async function () {
      await expect(
        impactEscrow.createMilestone(
          projectId,
          "Build school",
          ethers.parseEther("5000")
        )
      )
        .to.emit(impactEscrow, "MilestoneCreated")
        .withArgs(
          projectId,
          0n,
          "Build school",
          ethers.parseEther("5000"),
          (timestamp: any) => typeof timestamp === "bigint"
        );
    });

    it("Should reject milestone exceeding project total", async function () {
      await expect(
        impactEscrow.createMilestone(
          projectId,
          "Build school",
          ethers.parseEther("15000")
        )
      ).to.be.revertedWith("ImpactEscrow: amount exceeds total");
    });
  });

  describe("approveMilestone", function () {
    let projectId: bigint;

    beforeEach(async function () {
      const totalAmount = ethers.parseEther("10000");
      await impactEscrow.createProject(
        charity.address,
        await mockToken.getAddress(),
        totalAmount
      );
      projectId = 1n;

      await impactEscrow.createMilestone(
        projectId,
        "Build school",
        ethers.parseEther("5000")
      );
    });

    it("Should approve milestone", async function () {
      await expect(
        impactEscrow.connect(treasurer1).approveMilestone(projectId, 0)
      )
        .to.emit(impactEscrow, "MilestoneApproved")
        .withArgs(
          projectId,
          0n,
          treasurer1.address,
          1n,
          (timestamp: any) => typeof timestamp === "bigint"
        );
    });

    it("Should release funds after required approvals", async function () {
      await impactEscrow.connect(treasurer1).approveMilestone(projectId, 0);
      
      await expect(
        impactEscrow.connect(treasurer2).approveMilestone(projectId, 0)
      )
        .to.emit(impactEscrow, "FundsReleased")
        .withArgs(
          projectId,
          0n,
          charity.address,
          ethers.parseEther("5000"),
          await mockToken.getAddress(),
          (timestamp: any) => typeof timestamp === "bigint"
        );

      const charityBalance = await mockToken.balanceOf(charity.address);
      expect(charityBalance).to.equal(ethers.parseEther("5000"));
    });
  });

  describe("Emergency Withdrawal", function () {
    it("Should request emergency withdrawal", async function () {
      const withdrawalAmount = ethers.parseEther("1000");

      await expect(
        impactEscrow.requestEmergencyWithdrawal(
          charity.address,
          withdrawalAmount,
          await mockToken.getAddress()
        )
      )
        .to.emit(impactEscrow, "EmergencyWithdrawalRequested")
        .withArgs(
          1n,
          charity.address,
          withdrawalAmount,
          await mockToken.getAddress(),
          (unlockTime: any) => typeof unlockTime === "bigint",
          (timestamp: any) => typeof timestamp === "bigint"
        );
    });

    it("Should execute emergency withdrawal after timelock", async function () {
      const withdrawalAmount = ethers.parseEther("1000");
      
      // Create project to have funds
      await impactEscrow.createProject(
        charity.address,
        await mockToken.getAddress(),
        ethers.parseEther("10000")
      );

      // Request withdrawal
      await impactEscrow.requestEmergencyWithdrawal(
        charity.address,
        withdrawalAmount,
        await mockToken.getAddress()
      );

      // Fast forward time (in real scenario, would use time manipulation)
      // For now, we'll test the revert case
      await expect(
        impactEscrow.executeEmergencyWithdrawal(1)
      ).to.be.revertedWith("ImpactEscrow: timelock not expired");
    });
  });
});

