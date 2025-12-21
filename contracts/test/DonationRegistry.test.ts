import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";
import { deployContracts } from "./helpers/fixtures";

describe("DonationRegistry", function () {
  let donationRegistry: Contract;
  let owner: HardhatEthersSigner;
  let donor: HardhatEthersSigner;
  let charity: HardhatEthersSigner;
  let operator: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, donor, charity, operator, admin] = await ethers.getSigners();

    const DonationRegistry = await ethers.getContractFactory("DonationRegistry");
    donationRegistry = await upgrades.deployProxy(
      DonationRegistry,
      [owner.address, 250], // 2.5% platform fee
      { initializer: "initialize" }
    );
    await donationRegistry.waitForDeployment();

    // Grant operator role
    await donationRegistry.grantRole(
      await donationRegistry.OPERATOR_ROLE(),
      operator.address
    );
  });

  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      expect(await donationRegistry.maxDonationAmount()).to.equal(
        ethers.parseEther("1000000")
      );
      expect(await donationRegistry.minDonationAmount()).to.equal(
        ethers.parseEther("1")
      );
      expect(await donationRegistry.platformFeeBps()).to.equal(250);
    });

    it("Should grant admin role to deployer", async function () {
      expect(
        await donationRegistry.hasRole(
          await donationRegistry.DEFAULT_ADMIN_ROLE(),
          owner.address
        )
      ).to.be.true;
    });
  });

  describe("createDonation", function () {
    it("Should create a donation successfully", async function () {
      const amount = ethers.parseEther("100");

      await expect(
        donationRegistry.connect(donor).createDonation(charity.address, amount)
      )
        .to.emit(donationRegistry, "DonationCreated")
        .withArgs(
          1,
          donor.address,
          charity.address,
          amount,
          await donationRegistry.RECEIPT_TOKEN_ID_BASE() + 1n,
          (value: any) => typeof value === "bigint"
        );

      const donation = await donationRegistry.getDonation(1);
      expect(donation.donor).to.equal(donor.address);
      expect(donation.charity).to.equal(charity.address);
      expect(donation.amount).to.equal(amount);
      expect(donation.processed).to.be.false;
    });

    it("Should mint donation token and receipt NFT", async function () {
      const amount = ethers.parseEther("100");

      await donationRegistry.connect(donor).createDonation(charity.address, amount);

      const donationBalance = await donationRegistry.balanceOf(
        donor.address,
        await donationRegistry.DONATION_TOKEN_ID()
      );
      expect(donationBalance).to.equal(amount);

      const receiptBalance = await donationRegistry.balanceOf(
        donor.address,
        await donationRegistry.RECEIPT_TOKEN_ID_BASE() + 1n
      );
      expect(receiptBalance).to.equal(1);
    });

    it("Should reject donation with zero charity address", async function () {
      await expect(
        donationRegistry
          .connect(donor)
          .createDonation(ethers.ZeroAddress, ethers.parseEther("100"))
      ).to.be.revertedWith("DonationRegistry: invalid charity");
    });

    it("Should reject donation below minimum amount", async function () {
      await expect(
        donationRegistry
          .connect(donor)
          .createDonation(charity.address, ethers.parseEther("0.5"))
      ).to.be.revertedWith("DonationRegistry: amount too low");
    });

    it("Should reject donation above maximum amount", async function () {
      await expect(
        donationRegistry
          .connect(donor)
          .createDonation(charity.address, ethers.parseEther("2000000"))
      ).to.be.revertedWith("DonationRegistry: amount too high");
    });

    it("Should track donations per donor", async function () {
      await donationRegistry
        .connect(donor)
        .createDonation(charity.address, ethers.parseEther("100"));
      await donationRegistry
        .connect(donor)
        .createDonation(charity.address, ethers.parseEther("200"));

      const donations = await donationRegistry.getDonorDonations(donor.address);
      expect(donations.length).to.equal(2);
      expect(donations[0]).to.equal(1);
      expect(donations[1]).to.equal(2);
    });

    it("Should track donations per charity", async function () {
      const charity2 = (await ethers.getSigners())[5];

      await donationRegistry
        .connect(donor)
        .createDonation(charity.address, ethers.parseEther("100"));
      await donationRegistry
        .connect(donor)
        .createDonation(charity2.address, ethers.parseEther("200"));

      const donations = await donationRegistry.getCharityDonations(charity.address);
      expect(donations.length).to.equal(1);
      expect(donations[0]).to.equal(1);
    });
  });

  describe("createDonationBatch", function () {
    it("Should create multiple donations in batch", async function () {
      const charity2 = (await ethers.getSigners())[5];
      const amounts = [
        ethers.parseEther("100"),
        ethers.parseEther("200"),
        ethers.parseEther("300"),
      ];
      const charities = [charity.address, charity2.address, charity.address];

      const tx = await donationRegistry
        .connect(donor)
        .createDonationBatch(charities, amounts);

      // Verify event was emitted
      await expect(tx).to.emit(donationRegistry, "DonationBatchCreated");

      const donation1 = await donationRegistry.getDonation(1);
      expect(donation1.charity).to.equal(charity.address);
      expect(donation1.amount).to.equal(amounts[0]);
    });

    it("Should reject batch with mismatched arrays", async function () {
      await expect(
        donationRegistry
          .connect(donor)
          .createDonationBatch([charity.address], [ethers.parseEther("100"), ethers.parseEther("200")])
      ).to.be.revertedWith("DonationRegistry: arrays length mismatch");
    });

    it("Should reject batch that exceeds daily limit", async function () {
      // Use amounts that are within max (1M) but together exceed daily limit (10M)
      // 11 donations of 1M each = 11M, which exceeds 10M daily limit
      const amounts = Array(11).fill(ethers.parseEther("1000000")); // 1M each, total 11M
      const charities = Array(11).fill(charity.address);

      await expect(
        donationRegistry.connect(donor).createDonationBatch(charities, amounts)
      ).to.be.revertedWith("DonationRegistry: daily limit exceeded");
    });

    it("Should reject batch that is too large", async function () {
      const amounts = Array(51).fill(ethers.parseEther("100"));
      const charities = Array(51).fill(charity.address);

      await expect(
        donationRegistry.connect(donor).createDonationBatch(charities, amounts)
      ).to.be.revertedWith("DonationRegistry: batch too large");
    });
  });

  describe("markDonationProcessed", function () {
    it("Should mark donation as processed", async function () {
      await donationRegistry
        .connect(donor)
        .createDonation(charity.address, ethers.parseEther("100"));

      await expect(
        donationRegistry.connect(operator).markDonationProcessed(1)
      )
        .to.emit(donationRegistry, "DonationProcessed")
        .withArgs(1, true);

      const donation = await donationRegistry.getDonation(1);
      expect(donation.processed).to.be.true;
    });

    it("Should reject marking non-existent donation", async function () {
      await expect(
        donationRegistry.connect(operator).markDonationProcessed(999)
      ).to.be.revertedWith("DonationRegistry: donation not found");
    });

    it("Should reject if not operator", async function () {
      await donationRegistry
        .connect(donor)
        .createDonation(charity.address, ethers.parseEther("100"));

      await expect(
        donationRegistry.connect(donor).markDonationProcessed(1)
      ).to.be.reverted;
    });
  });

  describe("Circuit Breakers", function () {
    it("Should update circuit breakers", async function () {
      await donationRegistry.updateCircuitBreakers(
        ethers.parseEther("2000000"),
        ethers.parseEther("2"),
        ethers.parseEther("20000000")
      );

      expect(await donationRegistry.maxDonationAmount()).to.equal(
        ethers.parseEther("2000000")
      );
      expect(await donationRegistry.minDonationAmount()).to.equal(
        ethers.parseEther("2")
      );
    });

    it("Should reject invalid circuit breaker values", async function () {
      await expect(
        donationRegistry.updateCircuitBreakers(
          ethers.parseEther("100"),
          ethers.parseEther("200"),
          ethers.parseEther("1000")
        )
      ).to.be.revertedWith("DonationRegistry: invalid amounts");
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause", async function () {
      await donationRegistry.pause();
      expect(await donationRegistry.paused()).to.be.true;

      await expect(
        donationRegistry
          .connect(donor)
          .createDonation(charity.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(donationRegistry, "EnforcedPause");

      await donationRegistry.unpause();
      expect(await donationRegistry.paused()).to.be.false;

      await donationRegistry
        .connect(donor)
        .createDonation(charity.address, ethers.parseEther("100"));
    });
  });

  describe("Platform Fee", function () {
    it("Should update platform fee", async function () {
      await donationRegistry.updatePlatformFee(500); // 5%
      expect(await donationRegistry.platformFeeBps()).to.equal(500);
    });

    it("Should reject fee above 10%", async function () {
      await expect(
        donationRegistry.updatePlatformFee(1001)
      ).to.be.revertedWith("DonationRegistry: fee too high");
    });
  });

  describe("Gas Optimization", function () {
    it.skip("Should use less gas for batch donations", async function () {
      const charity2 = (await ethers.getSigners())[5];
      const amounts = [
        ethers.parseEther("100"),
        ethers.parseEther("200"),
      ];
      const charities = [charity.address, charity2.address];

      const batchTx = await donationRegistry
        .connect(donor)
        .createDonationBatch(charities, amounts);

      const batchReceipt = await batchTx.wait();
      const batchGas = batchReceipt!.gasUsed;

      // Create same donations individually
      const tx1 = await donationRegistry
        .connect(donor)
        .createDonation(charity.address, amounts[0]);
      const tx2 = await donationRegistry
        .connect(donor)
        .createDonation(charity2.address, amounts[1]);

      const receipt1 = await tx1.wait();
      const receipt2 = await tx2.wait();
      const individualGas = receipt1!.gasUsed + receipt2!.gasUsed;

      // Batch should use less gas (accounting for overhead)
      expect(batchGas).to.be.lessThan(individualGas);
    });
  });
});

