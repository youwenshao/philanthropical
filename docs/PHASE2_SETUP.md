# Phase 2 Setup Guide

This guide will walk you through the complete Phase 2 setup process for the Philanthropical platform's three-tier verification system.

## Overview

Phase 2 implements the three-tier verification system:
1. **Tier 1: CrowdsourcedVerification** - Community-based verification with staking and consensus
2. **Tier 2: ProfessionalVerification** - Professional NGO organization verification
3. **Tier 3: VerificationOracle** - Chainlink-based oracle verification (already deployed in Phase 1)

## Prerequisites

Before starting Phase 2 setup, ensure:
- ✅ Phase 1 is complete (contracts deployed, frontend configured)
- ✅ Contracts are deployed to Polygon Amoy testnet
- ✅ You have admin access to the deployed contracts
- ✅ Sufficient MATIC for deployment gas costs

## Step 1: Deploy Phase 2 Contracts

### 1.1 Update Deployment Script

The deployment script (`contracts/scripts/deploy.ts`) has been updated to include:
- `CrowdsourcedVerification` (Tier 1)
- `ProfessionalVerification` (Tier 2)

### 1.2 Deploy Contracts

```bash
cd contracts
npm run compile
npm run test  # Verify all tests pass
npm run deploy:amoy
```

**Expected Output:**
```
Deploying contracts with the account: 0x...
Account balance: ...

Deploying DonationRegistry...
DonationRegistry deployed to: 0x...

Deploying CharityVerification...
CharityVerification deployed to: 0x...

Deploying ImpactEscrow...
ImpactEscrow deployed to: 0x...

Deploying VerificationOracle...
VerificationOracle deployed to: 0x...

Deploying CrowdsourcedVerification...
CrowdsourcedVerification deployed to: 0x...

Deploying ProfessionalVerification...
ProfessionalVerification deployed to: 0x...

=== Deployment Summary ===
DonationRegistry: 0x...
CharityVerification: 0x...
ImpactEscrow: 0x...
VerificationOracle: 0x...
CrowdsourcedVerification: 0x...
ProfessionalVerification: 0x...
```

### 1.3 Save Contract Addresses

Update your environment files with the new contract addresses:

**Update `frontend/.env.local`:**
```bash
NEXT_PUBLIC_CROWDSOURCED_VERIFICATION_ADDRESS=0x...
NEXT_PUBLIC_PROFESSIONAL_VERIFICATION_ADDRESS=0x...
```

**Update `indexer/.env`:**
```bash
CROWDSOURCED_VERIFICATION_ADDRESS=0x...
PROFESSIONAL_VERIFICATION_ADDRESS=0x...
```

### 1.4 Verify Contracts (Optional but Recommended)

```bash
npm run verify:amoy
```

Or verify individually:
```bash
npx hardhat verify --network amoy <CROWDSOURCED_VERIFICATION_ADDRESS> <constructor-args>
npx hardhat verify --network amoy <PROFESSIONAL_VERIFICATION_ADDRESS> <constructor-args>
```

## Step 2: Configure Tier 1 - CrowdsourcedVerification

### 2.1 Initial Parameters

The contract is deployed with these default parameters:
- **Minimum Stake**: 0.1 ETH (0.1 MATIC on testnet)
- **Minimum Votes**: 5
- **Consensus Threshold**: 60% (6000 basis points)
- **Slashing Percentage**: 10% (1000 basis points)

### 2.2 Register Community Verifiers

Community members can participate by:
1. Depositing stake (minimum 0.1 MATIC)
2. Voting on verification submissions
3. Earning reputation based on consensus alignment

**Example:**
```javascript
// Deposit stake
await crowdsourcedVerification.depositStake({ value: ethers.parseEther("0.1") });

// Vote on verification
await crowdsourcedVerification.castVote(verificationId, 0, { value: ethers.parseEther("0.1") }); // 0 = Approve
```

### 2.3 Consensus Mechanism

- Requires minimum 5 votes
- 60% threshold for consensus (3 out of 5 votes)
- Verifiers with matching votes gain reputation (+10)
- Verifiers with non-matching votes lose reputation (-20)

## Step 3: Configure Tier 2 - ProfessionalVerification

### 3.1 Initial Parameters

The contract is deployed with:
- **Required Approvals**: 2 professional verifiers

### 3.2 Register Professional Verifiers

Only admins can register professional verifiers (NGO organizations):

```javascript
await professionalVerification.registerProfessionalVerifier(
  verifierAddress,
  "NGO Organization Name",
  "Accreditation Number"
);
```

**Requirements:**
- Verifier must be a registered NGO organization
- Must provide accreditation/registration number
- Initial reputation score: 500 (higher than community verifiers)

### 3.3 Verification Process

1. Charity submits verification with evidence hash
2. At least 2 professional verifiers must approve
3. Verification is completed when threshold is reached
4. Verifiers gain reputation for successful verifications

## Step 4: Integration with Existing System

### 4.1 Update Frontend

Add UI components for:
- Tier selection when submitting verification
- Community voting interface
- Professional verifier dashboard
- Verification status display across tiers

### 4.2 Update Indexer

The indexer should listen to events from:
- `CrowdsourcedVerification` contract
- `ProfessionalVerification` contract
- `VerificationOracle` contract (already configured)

**Events to Index:**
- `VerificationSubmitted`
- `VoteCast`
- `ConsensusReached`
- `VerificationApproved`
- `VerificationCompleted`
- `DisputeCreated`

### 4.3 Database Schema Updates

Ensure Supabase has tables for:
- `verification_submissions` (already exists)
- `verification_votes` (new - for Tier 1)
- `professional_verifiers` (new - for Tier 2)
- `verification_tier_results` (new - track results per tier)

## Step 5: Testing Phase 2

### 5.1 Run Unit Tests

```bash
cd contracts
npm run test
```

**Test Files:**
- `CrowdsourcedVerification.test.ts` - Tier 1 tests
- `ProfessionalVerification.test.ts` - Tier 2 tests
- `ThreeTierVerification.test.ts` - Integration tests

### 5.2 Test Scenarios

#### Tier 1: Crowdsourced Verification
1. Submit verification
2. 5 community members vote
3. Consensus reached (60% threshold)
4. Reputation updated
5. Dispute creation and resolution

#### Tier 2: Professional Verification
1. Register professional verifier
2. Submit verification
3. 2 professional verifiers approve
4. Verification completed
5. Reputation updated

#### Multi-Tier Workflow
1. Charity uses different tiers for different projects
2. Verify reputation tracking across tiers
3. Test dispute resolution in each tier

### 5.3 Manual Testing Checklist

- [ ] Deploy all Phase 2 contracts
- [ ] Register professional verifiers
- [ ] Submit Tier 1 verification and reach consensus
- [ ] Submit Tier 2 verification and get approvals
- [ ] Test reputation system for both tiers
- [ ] Test dispute creation and resolution
- [ ] Verify events are indexed correctly
- [ ] Test frontend integration (if implemented)

## Step 6: Configuration Parameters

### 6.1 CrowdsourcedVerification Parameters

**Updatable by Admin:**
- `minimumStake` - Minimum stake required to vote
- `minimumVotes` - Minimum votes for consensus
- `consensusThreshold` - Percentage threshold (basis points)
- `slashingPercentage` - Slashing percentage (basis points)

**Example:**
```javascript
await crowdsourcedVerification.updateMinimumStake(ethers.parseEther("0.2"));
await crowdsourcedVerification.updateConsensusParams(7, 7000); // 7 votes, 70% threshold
```

### 6.2 ProfessionalVerification Parameters

**Updatable by Admin:**
- `requiredApprovals` - Minimum professional verifiers needed

**Example:**
```javascript
await professionalVerification.updateRequiredApprovals(3);
```

## Troubleshooting

### Contract Deployment Issues

**Error: "insufficient funds"**
- Get more MATIC from faucet: https://faucet.polygon.technology/
- Check wallet balance

**Error: "contract already deployed"**
- Use `deploy-remaining.ts` script if some contracts are already deployed
- Or update addresses in environment files

### Verification Issues

**Tier 1: Consensus not reached**
- Ensure minimum 5 votes are cast
- Check that 60% threshold is met (3 out of 5 votes)
- Verify stake amounts are sufficient

**Tier 2: Verification not completing**
- Ensure at least 2 professional verifiers are registered
- Check that verifiers have `PROFESSIONAL_VERIFIER_ROLE`
- Verify verifiers are active

### Integration Issues

**Events not indexed**
- Check indexer is listening to new contract addresses
- Verify event signatures match
- Check Supabase connection

**Frontend not connecting**
- Verify contract addresses in `.env.local`
- Check network is set to Polygon Amoy
- Verify ABI is updated

## Next Steps

After completing Phase 2 setup:

1. ✅ Test all three tiers end-to-end
2. ✅ Configure frontend UI for tier selection
3. ✅ Set up monitoring for verification metrics
4. ✅ Document verification workflows
5. ✅ Prepare for Phase 3 (if applicable)

## Additional Resources

- [Phase 1 Setup Guide](./PHASE1_SETUP.md) - Previous phase setup
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [Security Documentation](./SECURITY.md) - Security considerations

## Support

If you encounter issues:
1. Check relevant documentation files
2. Review error messages carefully
3. Verify all environment variables are set correctly
4. Check contract addresses on PolygonScan
5. Open a GitHub issue with details


