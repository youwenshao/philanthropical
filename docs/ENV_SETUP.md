# Environment Variables Setup Guide

This guide will help you configure all environment variables for the Philanthropical project.

## Quick Setup

Run the automated setup script:

```bash
./scripts/setup-env.sh
```

This script will prompt you for your Supabase credentials and automatically update all `.env` files.

## Manual Setup

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: The public anon key (safe for client-side)
   - **service_role key**: The service role key (⚠️ **KEEP SECRET** - server-side only!)

### Step 2: Configure Frontend Environment

Edit `frontend/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# WalletConnect (already configured)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=1bb34e30874211ae45144ab942b08795

# Polygon Amoy RPC (already configured)
NEXT_PUBLIC_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Contract Addresses (set after deploying contracts)
NEXT_PUBLIC_DONATION_REGISTRY_ADDRESS=
NEXT_PUBLIC_CHARITY_VERIFICATION_ADDRESS=
NEXT_PUBLIC_IMPACT_ESCROW_ADDRESS=
NEXT_PUBLIC_VERIFICATION_ORACLE_ADDRESS=

# Admin Configuration (optional)
NEXT_PUBLIC_ADMIN_ADDRESSES=your_wallet_address_here
```

### Step 3: Configure Indexer Environment

Create `indexer/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Polygon Amoy RPC
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Contract Addresses (set after deploying contracts)
DONATION_REGISTRY_ADDRESS=
CHARITY_VERIFICATION_ADDRESS=
IMPACT_ESCROW_ADDRESS=
VERIFICATION_ORACLE_ADDRESS=

# Starting Block (set to deployment block number)
START_BLOCK=0

# USDC Token Address (Polygon Amoy testnet)
USDC_ADDRESS=
```

### Step 4: Configure Contracts Environment

Edit `contracts/.env`:

```bash
# Polygon Amoy Testnet
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Deployer Wallet Private Key (REQUIRED for deployment)
PRIVATE_KEY=your_64_character_hex_private_key

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Addresses (set after deployment)
DONATION_REGISTRY_ADDRESS=
CHARITY_VERIFICATION_ADDRESS=
IMPACT_ESCROW_ADDRESS=
VERIFICATION_ORACLE_ADDRESS=
```

## Environment Variables Reference

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon/public key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ✅ Yes | WalletConnect project ID |
| `NEXT_PUBLIC_DONATION_REGISTRY_ADDRESS` | ⚠️ After deploy | DonationRegistry contract address |
| `NEXT_PUBLIC_CHARITY_VERIFICATION_ADDRESS` | ⚠️ After deploy | CharityVerification contract address |
| `NEXT_PUBLIC_IMPACT_ESCROW_ADDRESS` | ⚠️ After deploy | ImpactEscrow contract address |
| `NEXT_PUBLIC_VERIFICATION_ORACLE_ADDRESS` | ⚠️ After deploy | VerificationOracle contract address |
| `NEXT_PUBLIC_ADMIN_ADDRESSES` | ❌ Optional | Comma-separated admin wallet addresses |
| `PINATA_JWT` | ❌ Optional | Pinata JWT for IPFS uploads |
| `NEXT_PUBLIC_RAMP_API_KEY` | ❌ Optional | Ramp Network API key |
| `NEXT_PUBLIC_MOONPAY_API_KEY` | ❌ Optional | MoonPay API key |

### Indexer (`indexer/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key |
| `POLYGON_AMOY_RPC_URL` | ✅ Yes | Polygon Amoy RPC endpoint |
| `DONATION_REGISTRY_ADDRESS` | ⚠️ After deploy | DonationRegistry contract address |
| `CHARITY_VERIFICATION_ADDRESS` | ⚠️ After deploy | CharityVerification contract address |
| `START_BLOCK` | ❌ Optional | Block number to start indexing from |
| `USDC_ADDRESS` | ❌ Optional | USDC token address on testnet |

### Contracts (`contracts/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | ✅ Yes | Deployer wallet private key (64 hex chars, no 0x) |
| `POLYGON_AMOY_RPC_URL` | ✅ Yes | Polygon Amoy RPC endpoint |
| `ETHERSCAN_API_KEY` | ✅ Yes | Etherscan API key for verification |
| `DONATION_REGISTRY_ADDRESS` | ⚠️ After deploy | Deployed contract addresses |
| `CHARITY_VERIFICATION_ADDRESS` | ⚠️ After deploy | Deployed contract addresses |
| `IMPACT_ESCROW_ADDRESS` | ⚠️ After deploy | Deployed contract addresses |
| `VERIFICATION_ORACLE_ADDRESS` | ⚠️ After deploy | Deployed contract addresses |

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Service Role Key** - This key has admin access. Only use server-side!
3. **Private Keys** - Never share or commit private keys
4. **API Keys** - Keep all API keys secret

## Verification

After setting up environment variables:

1. **Frontend**: Start dev server and check for connection errors
   ```bash
   cd frontend
   npm run dev
   ```

2. **Indexer**: Build and test connection
   ```bash
   cd indexer
   npm run build
   npm start
   ```

3. **Contracts**: Test compilation
   ```bash
   cd contracts
   npm run compile
   ```

## Troubleshooting

### Supabase Connection Errors

- Verify your project URL is correct
- Check that you're using the correct keys (anon vs service role)
- Ensure your Supabase project is not paused
- Check network connectivity

### Missing Environment Variables

- Make sure `.env` files are in the correct directories
- Restart your development servers after updating `.env` files
- Check for typos in variable names (case-sensitive!)

### Contract Deployment Issues

- Verify `PRIVATE_KEY` is exactly 64 hex characters
- Ensure wallet has sufficient MATIC for gas
- Check RPC URL is accessible

## Next Steps

After configuring environment variables:

1. ✅ Run Supabase migrations
2. ✅ Deploy contracts to Polygon Amoy
3. ✅ Update contract addresses in `.env` files
4. ✅ Test frontend connection
5. ✅ Start the indexer service



