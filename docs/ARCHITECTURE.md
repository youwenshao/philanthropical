# Philanthropical Architecture

> **HKUST 2026 Hong Kong Web3 Ideathon**  
> **Category 3: Safeguarding Against Financial Scams and Frauds**  
> **Team: AIInFin | Members: Serena & Youwen**

## System Overview

Philanthropical is a blockchain-based charity platform that ensures transparency and reduces fraud in cross-border donations. The system consists of multiple layers working together to provide a secure, verifiable, and efficient donation ecosystem. This project addresses the competition theme by leveraging blockchain technology, smart contracts, and ML-based fraud detection to safeguard against financial scams in charitable giving.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                         │
│  Next.js 14 + React + wagmi + RainbowKit                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  API Routes + Rate Limiting + CORS Protection                │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Supabase    │ │  IPFS/Pinata │ │  Blockchain  │
│  PostgreSQL  │ │  File Storage│ │  (Polygon)   │
└──────────────┘ └──────────────┘ └──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Smart Contract Layer                       │
│  DonationRegistry │ CharityVerification │ ImpactEscrow     │
│  VerificationOracle                                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Smart Contracts

#### DonationRegistry.sol
- **Purpose**: ERC-1155 based donation registry
- **Features**:
  - Fungible donation tokens
  - NFT receipts for each donation
  - Batch donation processing
  - Platform fee support (ERC-2981)
  - Circuit breakers for unusual activity

#### CharityVerification.sol
- **Purpose**: Multi-sig charity verification system
- **Features**:
  - Multi-sig approval for onboarding
  - Reputation scoring
  - Challenge period for fraud reports
  - Slashing conditions

#### ImpactEscrow.sol
- **Purpose**: Milestone-based fund escrow
- **Features**:
  - Multi-sig treasury control
  - Milestone-based releases
  - Emergency withdrawal with timelock
  - Yield generation hooks

#### VerificationOracle.sol
- **Purpose**: Impact verification system
- **Features**:
  - Chainlink Oracle integration
  - Custom verification oracle
  - Dispute resolution
  - Penalty system for false verifications

### 2. Frontend Application

#### Structure
```
frontend/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout with providers
│   ├── page.tsx      # Landing page
│   └── ...
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...
├── lib/             # Utilities
│   ├── wagmi.ts     # Wagmi configuration
│   └── store.ts     # Zustand store
└── ...
```

#### Key Features
- Wallet connection via RainbowKit
- Real-time blockchain data via wagmi
- State management with Zustand
- API routes for backend operations

### 3. Backend Services

#### Supabase Database
- **Schema**: See `supabase/migrations/`
- **Security**: Row Level Security (RLS) enabled
- **Tables**:
  - `users`: User profiles with wallet addresses
  - `charities`: Charity information
  - `donation_events`: On-chain donation records
  - `verification_submissions`: Impact verification data
  - `fraud_alerts`: Fraud detection alerts
  - `projects`: Escrow project data
  - `milestones`: Project milestones

#### Indexer Service
- **Purpose**: Parse blockchain events into Supabase
- **Functionality**:
  - Listen to contract events
  - Transform and store in database
  - Maintain event history

### 4. Data Flow

#### Donation Flow
```
User → Frontend → Smart Contract → Blockchain Event
                                    ↓
                              Indexer → Supabase
                                    ↓
                              Dashboard Update
```

#### Verification Flow
```
Charity → Register → Multi-sig Approval → Verified Status
                                              ↓
                                    Challenge Period
                                              ↓
                                    Impact Verification
```

## Security Architecture

### Smart Contract Security
- **Upgradeability**: Transparent Proxy pattern
- **Access Control**: Role-based with OpenZeppelin
- **Reentrancy Protection**: ReentrancyGuard on all external calls
- **Circuit Breakers**: Limits on donation amounts and daily totals
- **Pausable**: Emergency pause functionality

### Application Security
- **CSP Headers**: Content Security Policy configured
- **Rate Limiting**: API endpoint rate limiting
- **Input Validation**: All user inputs sanitized
- **SQL Injection Prevention**: Prepared statements only
- **Encryption**: Sensitive data encrypted at rest and in transit

### Wallet Security
- **Hardware Wallet Support**: Ledger, Trezor
- **Session Management**: Expiring sessions
- **Transaction Simulation**: Preview before signing
- **Social Recovery**: For embedded wallets

## Scalability Considerations

### Blockchain
- **Network**: Polygon for low gas costs
- **Batch Operations**: Batch donations to reduce gas
- **Gas Optimization**: Optimized contract code

### Database
- **Indexing**: Strategic indexes on frequently queried columns
- **Materialized Views**: For complex queries
- **Connection Pooling**: Via Supabase

### Frontend
- **CDN**: Static assets via CDN
- **Caching**: React Query for data caching, in-memory cache, service worker
- **Code Splitting**: Automatic with Next.js, lazy loading for large components
- **Image Optimization**: Next.js Image component with automatic optimization
- **Offline Support**: Service worker for offline functionality

## Monitoring & Observability

### Smart Contracts
- **Events**: Comprehensive event logging
- **Tenderly**: Transaction monitoring
- **Gas Tracking**: Gas usage per function

### Application
- **Sentry**: Error tracking and performance monitoring
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Business and technical metrics via custom analytics dashboard
- **Health Checks**: Automated health check endpoints for all services
- **Real-time Analytics**: Analytics dashboard with interactive charts and data export

## Additional Components

### Analytics Dashboard
- Real-time donation metrics and charity performance analytics
- Interactive charts and visualizations (time-series, geographic heatmaps)
- Data export functionality (CSV, JSON, PDF)
- Custom date ranges and filtering

### Mobile App (Expo React Native)
- Offline mode with sync capability
- Push notifications for verification updates
- Camera integration for impact verification photos
- Geolocation capture for verification submissions
- Image compression and optimized uploads

### Fraud Detection Engine
- Multi-layer fraud detection with ML-based anomaly detection
- Pattern recognition for suspicious donation patterns
- Real-time alert generation
- Integration with admin dashboard for fraud report handling

### API Enhancements
- API versioning (v1, v2)
- Batch endpoints for multiple operations
- Response caching with appropriate headers
- Comprehensive API documentation (OpenAPI/Swagger)

## Future Enhancements

- Cross-chain support (multi-chain donations)
- Governance token and DAO structure for platform governance
- Advanced ML models for fraud prediction
- Integration with additional payment methods

