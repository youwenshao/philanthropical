---
name: Philanthropical Phase 0 Foundation
overview: Set up the complete development foundation for Philanthropical MVP including Hardhat project with smart contracts, Next.js 14 frontend, Supabase backend, CI/CD pipeline, and security tooling integration.
todos:
  - id: setup-hardhat
    content: Initialize Hardhat project with TypeScript, configure Mumbai testnet, set up OpenZeppelin and Chainlink dependencies, configure Solidity compiler 0.8.19+
    status: completed
  - id: create-contracts
    content: Implement four core smart contracts (DonationRegistry, CharityVerification, ImpactEscrow, VerificationOracle) with security patterns, upgradeability, and event emissions
    status: completed
    dependencies:
      - setup-hardhat
  - id: write-tests
    content: Create comprehensive test suites for all contracts with >90% coverage, including edge cases, security tests, and gas optimization tests
    status: completed
    dependencies:
      - create-contracts
  - id: setup-nextjs
    content: Initialize Next.js 14 with App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui, wagmi/viem, RainbowKit, and Zustand
    status: completed
  - id: configure-supabase
    content: Set up Supabase project, create database schema with RLS policies, configure migrations and seed data
    status: completed
  - id: setup-cicd
    content: Create GitHub Actions workflows for testing, security scanning, deployment, and coverage reporting
    status: completed
    dependencies:
      - write-tests
  - id: integrate-security-tools
    content: Configure Slither and MythX for automated security analysis, set up security scanning in CI/CD
    status: completed
    dependencies:
      - create-contracts
  - id: create-env-templates
    content: Create .env.example files for all services with placeholder values and documentation
    status: completed
  - id: write-documentation
    content: Create README, architecture docs, security docs, deployment guide, and contributing guidelines
    status: completed
  - id: validate-phase0
    content: Deploy contracts to Mumbai, verify on PolygonScan, run full test suite, validate security scans, test frontend wallet connection
    status: pending
    dependencies:
      - setup-cicd
      - integrate-security-tools
      - setup-nextjs
---

# Philanthropical MVP - Phase 0 Foundation P

lan

## Overview

Establish the complete development foundation for the Philanthropical blockchain charity platform. This phase focuses on infrastructure, tooling, and basic contract architecture with comprehensive testing and security baseline.

## Project Structure

```javascript
philanthropical/
├── contracts/              # Hardhat smart contracts
│   ├── contracts/
│   │   ├── DonationRegistry.sol
│   │   ├── CharityVerification.sol
│   │   ├── ImpactEscrow.sol
│   │   └── VerificationOracle.sol
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.ts
├── frontend/               # Next.js 14 application
│   ├── app/                # App Router
│   ├── components/         # shadcn/ui components
│   ├── lib/                # Utilities, wagmi config
│   └── public/
├── mobile/                 # Expo React Native app
│   └── app/
├── indexer/                # Blockchain event indexer service
│   └── src/
├── fraud-detection/        # Python ML service (future)
├── .github/
│   └── workflows/          # CI/CD pipelines
├── docs/                   # Documentation
└── .env.example            # Environment variable templates
```



## Implementation Tasks

### 1. Hardhat Project Setup

**Files to create:**

- `contracts/hardhat.config.ts` - Hardhat configuration with TypeScript, Mumbai testnet, and verification
- `contracts/package.json` - Dependencies: Hardhat, OpenZeppelin, Chainlink, TypeScript, ethers.js
- `contracts/tsconfig.json` - TypeScript strict configuration
- `contracts/.solhint.json` - Linting rules
- `contracts/.env.example` - Contract deployment keys template

**Key configurations:**

- Solidity 0.8.19+ compiler
- Mumbai testnet network configuration
- Etherscan verification setup
- Gas reporting
- Coverage plugin for test coverage metrics

### 2. Smart Contract Architecture

**Contracts to implement (basic structure with core functions):`contracts/contracts/DonationRegistry.sol`:**

- ERC-1155 base (fungible donations + NFT receipts)
- Batch donation processing
- Event emissions for all state changes
- Royalty support (ERC-2981) for platform fees
- Pausable and upgradeable (Transparent Proxy pattern)

**`contracts/contracts/CharityVerification.sol`:**

- Multi-sig approval system
- Reputation scoring mechanism
- Challenge period for fraud reports
- Slashing conditions structure

**`contracts/contracts/ImpactEscrow.sol`:**

- Multi-sig treasury control
- Milestone-based fund release
- Emergency withdrawal with timelock
- Yield generation hooks (Aave/Compound integration points)

**`contracts/contracts/VerificationOracle.sol`:**

- Chainlink Oracle integration
- Custom verification oracle structure
- Dispute resolution mechanism
- Penalty system framework

**Security patterns to implement:**

- ReentrancyGuard on all external calls
- Checks-Effects-Interactions pattern
- Circuit breakers for unusual activity
- Comprehensive event logging

### 3. Test Suite Foundation

**Files to create:**

- `contracts/test/DonationRegistry.test.ts` - Comprehensive test suite
- `contracts/test/CharityVerification.test.ts`
- `contracts/test/ImpactEscrow.test.ts`
- `contracts/test/VerificationOracle.test.ts`
- `contracts/test/helpers/` - Test utilities and fixtures
- `contracts/test/fixtures/` - Deployment fixtures

**Test coverage requirements:**

- >90% coverage for critical functions
- Edge case testing (failed transactions, network issues)
- Gas optimization tests
- Security vulnerability tests (reentrancy, overflow, etc.)
- Fork testing setup with Tenderly

### 4. Next.js 14 Frontend Setup

**Files to create:**

- `frontend/package.json` - Next.js 14, TypeScript, Tailwind, shadcn/ui, wagmi, viem, RainbowKit
- `frontend/tsconfig.json` - TypeScript strict mode
- `frontend/tailwind.config.ts` - Tailwind configuration
- `frontend/next.config.js` - Next.js config with security headers
- `frontend/app/layout.tsx` - Root layout with providers
- `frontend/app/page.tsx` - Landing page
- `frontend/lib/wagmi.ts` - Wagmi configuration
- `frontend/lib/rainbowkit.ts` - RainbowKit setup
- `frontend/components/ui/` - shadcn/ui components initialization
- `frontend/.env.example` - Frontend environment variables

**Key setup:**

- App Router structure
- Wallet connection (RainbowKit + Privy fallback)
- Zustand store setup
- API route structure with rate limiting
- Security middleware (CSP headers, CORS)

### 5. Supabase Backend Setup

**Files to create:**

- `supabase/migrations/` - Database migration files
- `supabase/seed.sql` - Seed data for development
- `supabase/.env.example` - Supabase credentials template

**Database schema (initial):**

- `donation_events` table with Row Level Security
- `charities` table with verification status
- `users` table with wallet addresses
- `verification_submissions` table
- `fraud_alerts` table structure

**RLS Policies:**

- Users can only read their own donation data
- Public read access for verified charities
- Admin-only write access for critical tables

### 6. CI/CD Pipeline

**Files to create:**

- `.github/workflows/contracts-test.yml` - Contract testing on PR
- `.github/workflows/contracts-deploy.yml` - Contract deployment to Mumbai
- `.github/workflows/frontend-test.yml` - Frontend tests and linting
- `.github/workflows/security-scan.yml` - Slither and MythX analysis
- `.github/workflows/coverage.yml` - Test coverage reporting

**Pipeline features:**

- Run tests on all PRs
- Security scanning with Slither
- Contract verification on deployment
- Test coverage enforcement (>90% for contracts)
- Automated deployment to testnet on main branch

### 7. Security Tooling Integration

**Files to create:**

- `contracts/slither.config.json` - Slither static analysis config
- `.github/workflows/security-scan.yml` - Automated security scanning
- `contracts/.mythx.yml` - MythX configuration
- Security baseline documentation

**Security checks:**

- Slither static analysis (zero high-risk issues required)
- MythX contract analysis
- Gas optimization reports
- Dependency vulnerability scanning

### 8. Development Tooling

**Files to create:**

- `.editorconfig` - Editor configuration
- `.prettierrc` - Code formatting
- `.eslintrc.json` - Linting rules
- `docker-compose.yml` - Local development environment (if needed)
- `README.md` - Project documentation
- `docs/ARCHITECTURE.md` - Architecture overview
- `docs/SECURITY.md` - Security considerations

### 9. Environment Configuration

**Files to create:**

- `.env.example` (root) - Master environment template
- `contracts/.env.example` - Contract-specific variables
- `frontend/.env.example` - Frontend variables
- `indexer/.env.example` - Indexer service variables

**Variables to template:**

- Polygon Mumbai RPC URLs (Alchemy, Infura, QuickNode)
- Wallet private keys for deployment
- Supabase URL and keys
- Pinata API keys (IPFS)
- Etherscan API key for verification
- Sentry DSN for error tracking

### 10. Documentation

**Files to create:**

- `README.md` - Project overview and setup instructions
- `docs/ARCHITECTURE.md` - System architecture and data flows
- `docs/SECURITY.md` - Security practices and audit trail
- `docs/DEPLOYMENT.md` - Deployment procedures
- `docs/CONTRIBUTING.md` - Development guidelines

## Validation Gates

After Phase 0 completion, validate:

- [ ] All contracts compile and deploy to Mumbai testnet
- [ ] Contract verification works on PolygonScan
- [ ] Test coverage >90% for all contracts
- [ ] Zero high-risk security issues from Slither
- [ ] Frontend connects to wallet and reads chain data
- [ ] CI/CD pipeline runs successfully
- [ ] Single command deployment to testnet works
- [ ] All environment variables documented

## Technical Decisions

1. **Proxy Pattern**: Use OpenZeppelin's TransparentUpgradeableProxy for all contracts
2. **Testing Framework**: Hardhat + Chai + ethers.js for contract tests
3. **Frontend State**: Zustand for global state, React Query for server state
4. **Database**: Supabase PostgreSQL with Row Level Security enabled
5. **File Storage**: IPFS via Pinata (Arweave integration in Phase 2)
6. **Monitoring**: Sentry for errors, Tenderly for transaction monitoring

## Next Steps After Phase 0