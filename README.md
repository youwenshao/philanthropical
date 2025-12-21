# Philanthropical MVP

A blockchain-based transparent charity platform designed to reduce fraud in cross-border donations.

## Overview

Philanthropical leverages blockchain technology to create a transparent, verifiable, and efficient charity platform. By using smart contracts, we ensure that donations are tracked, verified, and distributed with full transparency while reducing fraud and operational costs.

## Features

- **Transparent Donations**: All donations are recorded on-chain with NFT receipts
- **Charity Verification**: Multi-sig approval system for charity onboarding
- **Impact Escrow**: Milestone-based fund release with multi-sig control
- **Verification Oracle**: Chainlink-integrated impact verification system
- **Fraud Detection**: Multi-layer fraud detection engine
- **Cross-Border Payments**: Efficient crypto-based cross-border transfers

## Tech Stack

### Blockchain
- **Network**: Polygon Mumbai Testnet → Polygon Mainnet
- **Smart Contracts**: Solidity 0.8.19+ with Hardhat
- **Libraries**: OpenZeppelin, Chainlink

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: shadcn/ui with Tailwind CSS
- **Web3**: wagmi + viem + RainbowKit
- **State**: Zustand

### Backend
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **File Storage**: IPFS via Pinata
- **APIs**: Next.js API Routes

## Project Structure

```
philanthropical/
├── contracts/          # Smart contracts (Hardhat)
├── frontend/           # Next.js application
├── mobile/             # Expo React Native app (future)
├── indexer/            # Blockchain event indexer
├── supabase/           # Database migrations
└── docs/               # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Supabase account
- Polygon Mumbai testnet MATIC

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/philanthropical.git
cd philanthropical
```

2. Set up contracts:
```bash
cd contracts
npm install
cp .env.example .env
# Fill in your .env values
npm run compile
npm run test
```

3. Set up frontend:
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Fill in your .env.local values
npm run dev
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run migrations from `supabase/migrations/`
   - Configure Row Level Security policies

### Environment Variables

See `.env.example` files in each directory for required environment variables.

## Development

### Contracts

```bash
cd contracts
npm run compile      # Compile contracts
npm run test        # Run tests
npm run test:coverage  # Generate coverage report
npm run deploy:mumbai  # Deploy to Mumbai testnet
```

### Frontend

```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run linter
npm run type-check  # Type check
```

## Testing

### Contract Tests

```bash
cd contracts
npm run test
```

Test coverage must be >90% for all contracts.

### Security Scanning

```bash
cd contracts
npm run slither     # Run Slither static analysis
```

## Deployment

### Contracts

1. Deploy to Mumbai testnet:
```bash
cd contracts
npm run deploy:mumbai
```

2. Verify contracts:
```bash
npm run verify:mumbai
```

### Frontend

Deploy to Vercel or your preferred hosting platform:

```bash
cd frontend
npm run build
```

## Security

- All contracts use OpenZeppelin's battle-tested libraries
- Security patterns: ReentrancyGuard, Checks-Effects-Interactions
- Contracts are upgradeable using Transparent Proxy pattern
- Comprehensive test coverage (>90%)
- Regular security audits with Slither and MythX

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines.

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

