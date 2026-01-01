# Philanthropical Smart Contracts

Smart contracts for the Philanthropical blockchain-based transparent charity platform.

> **HKUST 2026 Hong Kong Web3 Ideathon**  
> **Category 3: Safeguarding Against Financial Scams and Frauds**  
> **Team: AIInFin | Members: Serena & Youwen**

## Contracts

- **DonationRegistry.sol**: ERC-1155 based donation registry with NFT receipts
- **CharityVerification.sol**: Multi-sig charity verification and reputation system
- **ImpactEscrow.sol**: Milestone-based escrow with yield generation
- **VerificationOracle.sol**: Chainlink Oracle integration for impact verification

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Compile contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm run test
```

5. Run tests with coverage:
```bash
npm run test:coverage
```

6. Deploy to Amoy testnet:
```bash
npm run deploy:amoy
```

7. Verify contracts on Etherscan:
```bash
npm run verify:amoy
```

## Security

- All contracts use OpenZeppelin's battle-tested libraries
- Security patterns: ReentrancyGuard, Checks-Effects-Interactions
- Contracts are upgradeable using Transparent Proxy pattern
- Comprehensive test coverage (>90%)

## License

MIT

