# Phase 1 Setup Guide

This guide will walk you through the complete Phase 1 setup process for the Philanthropical platform.

## Overview

Phase 1 setup includes:
1. ✅ Configure environment variables
2. ✅ Deploy contracts to Polygon Amoy
3. ✅ Set up Supabase database with migrations

## Step 1: Configure Environment Variables

### 1.1 Contracts Environment

1. Navigate to the contracts directory:
   ```bash
   cd contracts
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and fill in the required values:
   ```bash
   # Required for deployment
   PRIVATE_KEY=your_64_character_hex_private_key_without_0x_prefix
   ETHERSCAN_API_KEY=your_etherscan_api_key
   
   # Optional (has defaults)
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   ```

   **Important Notes:**
   - Your `PRIVATE_KEY` must be exactly 64 hex characters (32 bytes)
   - Never commit the `.env` file to version control
   - Get your Etherscan API key from: https://etherscan.io/apis
   - Get testnet MATIC from: https://faucet.polygon.technology/

### 1.2 Frontend Environment

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local` and fill in the required values:
   ```bash
   # Required
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Set after contract deployment
   NEXT_PUBLIC_DONATION_REGISTRY_ADDRESS=
   NEXT_PUBLIC_CHARITY_VERIFICATION_ADDRESS=
   NEXT_PUBLIC_IMPACT_ESCROW_ADDRESS=
   NEXT_PUBLIC_VERIFICATION_ORACLE_ADDRESS=
   ```

   **Important Notes:**
   - Get WalletConnect project ID from: https://cloud.walletconnect.com/
   - Supabase credentials come from your Supabase project (see Step 3)
   - Contract addresses will be filled in after deployment (Step 2)

### 1.3 Indexer Environment

1. Navigate to the indexer directory:
   ```bash
   cd ../indexer
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and fill in the required values:
   ```bash
   # Required
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Set after contract deployment
   DONATION_REGISTRY_ADDRESS=
   CHARITY_VERIFICATION_ADDRESS=
   START_BLOCK=0  # Set to deployment block number
   ```

## Step 2: Deploy Contracts to Polygon Amoy

### 2.1 Prerequisites

Before deploying, ensure you have:
- ✅ Configured `PRIVATE_KEY` in `contracts/.env`
- ✅ Wallet has sufficient MATIC (minimum 0.1 MATIC recommended)
- ✅ All tests passing

### 2.2 Compile Contracts

```bash
cd contracts
npm install  # If not already done
npm run compile
```

### 2.3 Run Tests

```bash
npm run test
```

Ensure all tests pass before deploying.

### 2.4 Deploy Contracts

```bash
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

=== Deployment Summary ===
DonationRegistry: 0x...
CharityVerification: 0x...
ImpactEscrow: 0x...
VerificationOracle: 0x...
```

### 2.5 Save Contract Addresses

Copy the deployed addresses and update your environment files:

**Update `frontend/.env.local`:**
```bash
NEXT_PUBLIC_DONATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CHARITY_VERIFICATION_ADDRESS=0x...
NEXT_PUBLIC_IMPACT_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_VERIFICATION_ORACLE_ADDRESS=0x...
```

**Update `indexer/.env`:**
```bash
DONATION_REGISTRY_ADDRESS=0x...
CHARITY_VERIFICATION_ADDRESS=0x...
IMPACT_ESCROW_ADDRESS=0x...
VERIFICATION_ORACLE_ADDRESS=0x...
START_BLOCK=<block_number_from_deployment>
```

**Update `contracts/.env` (optional, for verification script):**
```bash
DONATION_REGISTRY_ADDRESS=0x...
CHARITY_VERIFICATION_ADDRESS=0x...
IMPACT_ESCROW_ADDRESS=0x...
VERIFICATION_ORACLE_ADDRESS=0x...
```

### 2.6 Verify Contracts (Optional but Recommended)

After deployment, verify contracts on Etherscan:

```bash
npm run verify:amoy
```

Or verify individually:
```bash
npx hardhat verify --network amoy <CONTRACT_ADDRESS> [constructor-args]
```

## Step 3: Set Up Supabase Database

### 3.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `philanthropical` (or your preferred name)
   - **Database Password**: Choose a strong password (save securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier works for development
4. Click **"Create new project"**
5. Wait for provisioning (1-2 minutes)

### 3.2 Get Supabase Credentials

1. Go to **Settings** → **API** in your Supabase project
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: For `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: For `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### 3.3 Run Database Migrations

You have two options:

#### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**:
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # Or using npm
   npm install -g supabase
   ```

2. **Login**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   cd /Users/youwenshao/Projects/philanthropical
   supabase link --project-ref your-project-id
   ```
   Find your project ID in the dashboard URL or project settings.

4. **Push migrations**:
   ```bash
   supabase db push
   ```

#### Option B: Using Supabase Dashboard (Manual)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Open `supabase/migrations/20240101000000_initial_schema.sql`
4. Copy entire contents and paste into SQL Editor
5. Click **"Run"** (or `Cmd+Enter` / `Ctrl+Enter`)

### 3.4 Verify Migration Success

1. Go to **Table Editor** in Supabase dashboard
2. Verify these tables exist:
   - `users`
   - `charities`
   - `donation_events`
   - `verification_submissions`
   - `fraud_alerts`
   - `projects`
   - `milestones`

3. Check RLS policies:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

### 3.5 Update Environment Variables

Update your `.env` files with Supabase credentials (already done in Step 1, but verify):

- `frontend/.env.local`: Add Supabase URL and keys
- `indexer/.env`: Add Supabase URL and service role key

## Step 4: Verify Setup

### 4.1 Test Contract Deployment

1. Visit [Amoy PolygonScan](https://amoy.polygonscan.com)
2. Search for your deployed contract addresses
3. Verify contracts are verified (if you ran verification)

### 4.2 Test Frontend Connection

1. Start frontend:
   ```bash
   cd frontend
   npm install  # If not already done
   npm run dev
   ```

2. Open http://localhost:3000
3. Check browser console for errors
4. Try connecting a wallet (should connect to Polygon Amoy)

### 4.3 Test Database Connection

1. Check Supabase dashboard → **Table Editor**
2. Verify you can see tables
3. Try inserting a test row (if needed)

### 4.4 Test Indexer (Optional)

1. Build indexer:
   ```bash
   cd indexer
   npm install  # If not already done
   npm run build
   ```

2. Start indexer:
   ```bash
   npm start
   ```

3. Check for connection errors in console

## Troubleshooting

### Contract Deployment Issues

**Error: "insufficient funds"**
- Get more MATIC from faucet: https://faucet.polygon.technology/
- Check wallet balance

**Error: "invalid private key"**
- Verify private key is exactly 64 hex characters
- Ensure no `0x` prefix
- Check for extra spaces or newlines

**Error: "nonce too low"**
- Wait a few minutes and try again
- Or manually set nonce in deployment script

### Database Migration Issues

**Error: "relation already exists"**
- Tables may already exist from previous migration
- Drop tables manually if needed (⚠️ deletes data):
  ```sql
  DROP TABLE IF EXISTS public.milestones CASCADE;
  DROP TABLE IF EXISTS public.projects CASCADE;
  DROP TABLE IF EXISTS public.fraud_alerts CASCADE;
  DROP TABLE IF EXISTS public.verification_submissions CASCADE;
  DROP TABLE IF EXISTS public.donation_events CASCADE;
  DROP TABLE IF EXISTS public.charities CASCADE;
  DROP TABLE IF EXISTS public.users CASCADE;
  ```

**Error: "permission denied"**
- Use service role key for migrations
- Check project permissions

### Frontend Connection Issues

**Wallet won't connect**
- Verify WalletConnect project ID is correct
- Check browser console for errors
- Ensure MetaMask is installed and unlocked
- Verify network is set to Polygon Amoy (chainId: 80002)

**Supabase connection fails**
- Verify Supabase URL and keys are correct
- Check for extra spaces in environment variables
- Ensure project is not paused (free tier)

## Next Steps

After completing Phase 1 setup:

1. ✅ Test end-to-end donation flow
2. ✅ Set up monitoring and logging
3. ✅ Configure admin accounts
4. ✅ Test charity verification process
5. ✅ Prepare for Phase 2 development

## Additional Resources

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Detailed Supabase instructions
- [Amoy Migration Guide](./AMOY_MIGRATION.md) - Network migration details
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment info
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture

## Support

If you encounter issues:
1. Check relevant documentation files
2. Review error messages carefully
3. Check Supabase dashboard logs
4. Verify all environment variables are set correctly
5. Open a GitHub issue with details



