---
name: Philanthropical Phase 1 Core Donation Flow
overview: Implement the complete donation flow from fiat to on-chain donation with NFT receipt, build admin dashboard for charity management, create basic transparency dashboard, and set up mobile app skeleton for impact verification.
todos:
  - id: fiat-onramp
    content: Implement fiat on-ramp integration with Ramp Network (primary) and MoonPay (fallback), including KYC tier detection and transaction tracking
    status: in_progress
  - id: usdc-integration
    content: Integrate USDC token handling on Polygon Amoy, including balance checking, approval flow, and amount formatting
    status: pending
  - id: donation-flow
    content: "Build complete donation flow components: donation form, charity selector, transaction progress, and NFT receipt display"
    status: pending
    dependencies:
      - usdc-integration
  - id: admin-dashboard
    content: Create admin dashboard with charity management, multi-sig approval interface, verification workflow, and fraud report handling
    status: pending
  - id: transparency-dashboard
    content: Build public transparency dashboard with real-time donation feed, charity directory, flow visualizations, and impact metrics
    status: pending
  - id: blockchain-indexer
    content: Implement blockchain event indexer service to parse contract events into Supabase database with reorg handling
    status: pending
  - id: mobile-app
    content: Set up Expo React Native app with wallet connection, camera integration, geolocation capture, and IPFS upload
    status: pending
  - id: api-routes
    content: Create API routes for donations, charities, on-ramp, and IPFS with rate limiting and authentication
    status: pending
  - id: state-management
    content: Implement Zustand stores and React Query hooks for donation and charity state management
    status: pending
  - id: testing-validation
    content: Write E2E tests for donation flow, integration tests for APIs, and perform load testing with 100 concurrent users
    status: pending
    dependencies:
      - donation-flow
      - api-routes
---

# Philanthropical MVP - Phase 1 Core Donation Flow

## Overview

Implement the complete end-to-end donation experience, admin tools for charity management, transparency dashboard for public viewing, and mobile app foundation for impact verification.

## Deliverables

### 1. Complete Donation Flow (Fiat → USDC → Donation → NFT Receipt)

**Components:**

- Fiat on-ramp integration (Ramp Network primary, MoonPay fallback)
- USDC token handling on Polygon Amoy
- Donation transaction flow with DonationRegistry contract
- NFT receipt minting and display
- Transaction status tracking and error handling

**User Journey:**

1. User selects charity and donation amount
2. User connects wallet or uses embedded wallet
3. Fiat on-ramp flow (if needed) → USDC on Polygon
4. User approves USDC spending
5. Donation transaction submitted
6. NFT receipt minted and displayed
7. Transaction confirmation and receipt download

### 2. Admin Dashboard for Charity Management

**Features:**

- Charity registration and verification workflow
- Multi-sig approval interface
- Charity status management (pending, approved, suspended)
- Reputation score management
- Fraud report handling
- Donation analytics per charity

**Access Control:**

- Admin-only routes with authentication
- Role-based UI components
- Multi-sig transaction interface

### 3. Basic Transparency Dashboard

**Features:**

- Public-facing donation statistics
- Real-time donation feed
- Charity directory with verification status
- Donation flow visualization (Sankey diagram)
- Impact metrics display
- Transaction explorer links

**Data Sources:**

- Blockchain events (via indexer)
- Supabase database
- Real-time updates via WebSocket or polling

### 4. Mobile App Skeleton (Expo React Native)

**Features:**

- Expo project setup
- Wallet connection (WalletConnect)
- Camera integration for impact photos
- Geolocation capture
- Photo upload to IPFS
- Basic navigation structure
- Supabase authentication

## Implementation Tasks

### Task 1: Fiat On-Ramp Integration

**Files to create:**

- `frontend/lib/onramp/ramp.ts` - Ramp Network integration
- `frontend/lib/onramp/moonpay.ts` - MoonPay fallback
- `frontend/components/donation/OnRampModal.tsx` - On-ramp UI component
- `frontend/app/api/onramp/route.ts` - On-ramp API endpoint

**Key Features:**

- Ramp Network widget integration
- MoonPay fallback mechanism
- KYC tier detection
- Transaction status tracking
- Error handling and retry logic

### Task 2: USDC Token Integration

**Files to create:**

- `frontend/lib/tokens/usdc.ts` - USDC contract ABI and helpers
- `frontend/hooks/useUSDC.ts` - React hook for USDC operations
- `frontend/components/donation/USDCBalance.tsx` - Balance display
- `frontend/components/donation/USDCApproval.tsx` - Approval component

**Key Features:**

- USDC balance checking
- Approval flow for DonationRegistry
- Token amount formatting
- Network detection (Amoy vs Mainnet)

### Task 3: Donation Flow Components

**Files to create:**

- `frontend/app/donate/page.tsx` - Donation page
- `frontend/components/donation/DonationForm.tsx` - Donation form
- `frontend/components/donation/CharitySelector.tsx` - Charity selection
- `frontend/components/donation/DonationProgress.tsx` - Progress indicator
- `frontend/components/donation/ReceiptDisplay.tsx` - NFT receipt display
- `frontend/hooks/useDonation.ts` - Donation transaction hook
- `frontend/lib/contracts/donationRegistry.ts` - Contract interaction helpers

**Key Features:**

- Multi-step donation wizard
- Real-time transaction status
- Error handling and recovery
- Receipt NFT display and download
- Transaction history

### Task 4: Admin Dashboard

**Files to create:**

- `frontend/app/admin/layout.tsx` - Admin layout with auth
- `frontend/app/admin/dashboard/page.tsx` - Admin dashboard
- `frontend/app/admin/charities/page.tsx` - Charity management
- `frontend/app/admin/charities/[id]/page.tsx` - Charity detail
- `frontend/components/admin/CharityTable.tsx` - Charity list table
- `frontend/components/admin/VerificationWorkflow.tsx` - Multi-sig approval UI
- `frontend/components/admin/FraudReports.tsx` - Fraud report management
- `frontend/lib/admin/auth.ts` - Admin authentication
- `frontend/middleware.ts` - Route protection

**Key Features:**

- Admin authentication (wallet-based)
- Charity CRUD operations
- Multi-sig transaction builder
- Verification workflow UI
- Analytics dashboard

### Task 5: Transparency Dashboard

**Files to create:**

- `frontend/app/transparency/page.tsx` - Transparency dashboard
- `frontend/components/transparency/DonationFeed.tsx` - Real-time feed
- `frontend/components/transparency/CharityDirectory.tsx` - Charity list
- `frontend/components/transparency/DonationFlowChart.tsx` - Sankey diagram
- `frontend/components/transparency/ImpactMetrics.tsx` - Metrics display
- `frontend/lib/charts/sankey.ts` - Sankey chart utilities
- `frontend/hooks/useDonationFeed.ts` - Real-time donation feed hook

**Key Features:**

- Public-facing (no auth required)
- Real-time updates
- Interactive visualizations
- Responsive design
- Export functionality

### Task 6: Blockchain Event Indexer

**Files to create:**

- `indexer/package.json` - Indexer dependencies
- `indexer/src/index.ts` - Main indexer service
- `indexer/src/eventListeners.ts` - Contract event listeners
- `indexer/src/database.ts` - Supabase client
- `indexer/src/processors/donationProcessor.ts` - Donation event processor
- `indexer/src/processors/verificationProcessor.ts` - Verification event processor
- `indexer/.env.example` - Environment template

**Key Features:**

- Listen to all contract events
- Process and transform events
- Store in Supabase
- Handle reorgs and missed blocks
- Error recovery and retry logic

### Task 7: Mobile App Setup

**Files to create:**

- `mobile/package.json` - Expo dependencies
- `mobile/app.json` - Expo configuration
- `mobile/app/_layout.tsx` - Root layout
- `mobile/app/(tabs)/index.tsx` - Home screen
- `mobile/app/(tabs)/verify.tsx` - Verification screen
- `mobile/app/(tabs)/profile.tsx` - Profile screen
- `mobile/components/CameraView.tsx` - Camera component
- `mobile/lib/ipfs.ts` - IPFS upload
- `mobile/lib/supabase.ts` - Supabase client
- `mobile/hooks/useLocation.ts` - Geolocation hook

**Key Features:**

- Expo setup with EAS Build
- WalletConnect integration
- Camera and photo capture
- Geolocation tagging
- IPFS upload
- Offline support

### Task 8: API Routes and Backend

**Files to create:**

- `frontend/app/api/donations/route.ts` - Donation API
- `frontend/app/api/charities/route.ts` - Charity API
- `frontend/app/api/onramp/route.ts` - On-ramp API
- `frontend/app/api/ipfs/route.ts` - IPFS upload API
- `frontend/lib/rateLimit.ts` - Rate limiting middleware
- `frontend/lib/cors.ts` - CORS configuration

**Key Features:**

- RESTful API endpoints
- Rate limiting
- Input validation
- Error handling
- Authentication middleware

### Task 9: State Management and Hooks

**Files to create:**

- `frontend/store/donationStore.ts` - Donation state
- `frontend/store/charityStore.ts` - Charity state
- `frontend/hooks/useCharities.ts` - Charity data hook
- `frontend/hooks/useDonations.ts` - Donation data hook
- `frontend/hooks/useWallet.ts` - Wallet utilities hook

**Key Features:**

- Zustand stores for global state
- React Query for server state
- Optimistic updates
- Cache management

### Task 10: Testing and Validation

**Files to create:**

- `frontend/__tests__/donation.test.tsx` - Donation flow tests
- `frontend/__tests__/admin.test.tsx` - Admin tests
- `indexer/__tests__/indexer.test.ts` - Indexer tests
- `mobile/__tests__/camera.test.tsx` - Mobile tests
- `docs/PHASE1_VALIDATION.md` - Validation checklist

**Key Features:**

- E2E tests for donation flow
- Integration tests for API routes
- Performance testing
- Load testing (100 concurrent users)

## Technical Decisions

1. **Fiat On-Ramp**: Ramp Network as primary (better UX), MoonPay as fallback
2. **USDC Contract**: Use existing USDC on Polygon (testnet: mock USDC if needed)
3. **State Management**: Zustand for client state, React Query for server state
4. **Real-time Updates**: Supabase Realtime for dashboard, polling fallback
5. **Mobile Framework**: Expo with EAS Build for easy deployment
6. **Indexer**: Node.js service with ethers.js, runs as separate process

## Validation Gates

After Phase 1 completion, validate:

- [ ] 100 users can complete donation in <3 minutes
- [ ] Transaction costs <$0.10 per donation
- [ ] No failed transactions in stress test (100 concurrent users)
- [ ] Mobile app captures and uploads geotagged photos
- [ ] Admin dashboard allows charity management
- [ ] Transparency dashboard displays real-time data
- [ ] All API endpoints have rate limiting
- [ ] Error handling covers all edge cases

## Dependencies

- Phase 0 contracts deployed and verified
- Supabase database with migrations applied
- Ramp Network API key
- MoonPay API credentials (optional)
- Pinata IPFS API keys
- USDC contract address on Polygon Amoy

## Next Steps After Phase 1

Once Phase 1 is validated, proceed to Phase 2:

- Three-tier verification system operational
- Fraud detection with ML models