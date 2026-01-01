# Philanthropical MVP

A blockchain-based transparent charity platform designed to reduce fraud in cross-border donations.

## Overview

Philanthropical leverages blockchain technology to create a transparent, verifiable, and efficient charity platform. By using smart contracts, we ensure that donations are tracked, verified, and distributed with full transparency while reducing fraud and operational costs.

## Features

### Core Features
- **Transparent Donations**: All donations are recorded on-chain with NFT receipts
- **Charity Verification**: Multi-sig approval system for charity onboarding with three-tier verification (Charity, Crowdsourced, Professional)
- **Impact Escrow**: Milestone-based fund release with multi-sig control
- **Verification Oracle**: Chainlink-integrated impact verification system
- **Fraud Detection**: Multi-layer fraud detection engine with ML-based anomaly detection
- **Cross-Border Payments**: Efficient crypto-based cross-border transfers via USDC on Polygon

### Advanced Features (Phase 3)
- **Analytics Dashboard**: Real-time metrics, interactive charts, and data export functionality
- **Performance Optimizations**: Image optimization, code splitting, service worker for offline support, and database materialized views
- **Monitoring & Observability**: Sentry error tracking, performance monitoring, custom analytics, and health check endpoints
- **Mobile App**: Expo React Native app with offline mode, push notifications, camera integration, and geolocation capture
- **API Enhancements**: API versioning, batch endpoints, response caching, and comprehensive API documentation
- **Production Readiness**: Incident response procedures, automated backups, security hardening, and comprehensive monitoring

## Tech Stack

### Blockchain
- **Network**: Polygon Amoy Testnet → Polygon Mainnet
- **Smart Contracts**: Solidity 0.8.22 with Hardhat
- **Libraries**: OpenZeppelin, Chainlink

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: shadcn/ui with Tailwind CSS
- **Web3**: wagmi + viem + RainbowKit
- **State**: Zustand

### Backend
- **Database**: Supabase (PostgreSQL) with Row Level Security, materialized views, and optimized indexes
- **File Storage**: IPFS via Pinata
- **APIs**: Next.js API Routes with versioning, caching, and batch operations
- **Monitoring**: Sentry for error tracking, custom analytics, and performance monitoring
- **Indexer**: Blockchain event indexer for real-time data synchronization

## Project Structure

```
philanthropical/
├── contracts/          # Smart contracts (Hardhat)
├── frontend/           # Next.js application with analytics dashboard
├── mobile/             # Expo React Native app for impact verification
├── indexer/            # Blockchain event indexer
├── fraud-detection/    # Fraud detection engine with ML models
├── supabase/           # Database migrations and functions
└── docs/               # Comprehensive documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Supabase account
- Polygon Amoy testnet MATIC

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
npm run deploy:amoy  # Deploy to Amoy testnet
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

1. Deploy to Amoy testnet:
```bash
cd contracts
npm run deploy:amoy
```

2. Verify contracts:
```bash
npm run verify:amoy
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
- Rate limiting on all API endpoints
- CORS protection and security headers
- Incident response procedures and monitoring

## Performance

- **Frontend**: Image optimization, code splitting, service worker for offline support
- **Database**: Materialized views for complex queries, strategic indexes, connection pooling
- **API**: Response caching, compression, batch operations
- **Target Metrics**: Page load < 2s, API response < 200ms, Database query < 100ms

## Monitoring

- **Error Tracking**: Sentry integration for real-time error monitoring
- **Performance**: Core Web Vitals tracking and API response time monitoring
- **Analytics**: Custom analytics dashboard with real-time metrics
- **Health Checks**: Automated health check endpoints for all services
- **Alerts**: Configurable alerting for critical issues

See [MONITORING.md](docs/MONITORING.md) and [PERFORMANCE_TUNING.md](docs/PERFORMANCE_TUNING.md) for detailed information.

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines.

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

