# Deployment Guide

## Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Supabase account
- Polygon Mumbai testnet MATIC
- Environment variables configured

## Deployment Steps

### 1. Smart Contracts

#### Local Testing
```bash
cd contracts
npm install
npm run compile
npm run test
```

#### Deploy to Mumbai Testnet
```bash
# Ensure .env is configured with:
# - POLYGON_MUMBAI_RPC_URL
# - PRIVATE_KEY (deployer wallet)
# - POLYGONSCAN_API_KEY

npm run deploy:mumbai
```

#### Verify Contracts
```bash
npm run verify:mumbai
```

#### Deploy to Mainnet (Production)
```bash
# Update .env with mainnet values
npm run deploy:polygon
npm run verify:polygon
```

### 2. Database Setup

#### Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Note your project URL and keys

#### Run Migrations
```bash
# Using Supabase CLI
supabase db push

# Or manually via Supabase dashboard:
# Copy contents of supabase/migrations/20240101000000_initial_schema.sql
# Run in SQL editor
```

#### Configure RLS Policies
RLS policies are included in the migration file. Verify they're active:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Frontend Deployment

#### Build
```bash
cd frontend
npm install
npm run build
```

#### Environment Variables
Ensure all required environment variables are set:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Contract addresses (after deployment)

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Deploy to Other Platforms
- **Netlify**: Connect GitHub repo, set build command `npm run build`
- **AWS Amplify**: Connect repo, configure build settings
- **Self-hosted**: Use `npm run start` after build

### 4. Indexer Service

#### Setup
```bash
cd indexer
npm install
cp .env.example .env
# Configure .env with contract addresses and Supabase credentials
```

#### Run
```bash
npm start
```

#### Deploy as Service
- **PM2**: `pm2 start index.js --name philanthropical-indexer`
- **Docker**: See Dockerfile (if created)
- **Systemd**: Create service file

## Post-Deployment

### Verification Checklist

- [ ] Contracts deployed and verified on block explorer
- [ ] Database migrations applied
- [ ] RLS policies active
- [ ] Frontend accessible and functional
- [ ] Wallet connection working
- [ ] Indexer running and processing events
- [ ] Monitoring configured (Sentry, etc.)
- [ ] Environment variables secured
- [ ] Backup procedures in place

### Monitoring

1. **Smart Contracts**
   - Monitor via Tenderly
   - Track gas usage
   - Watch for unusual activity

2. **Application**
   - Sentry for errors
   - Analytics for usage
   - Database performance

3. **Infrastructure**
   - Server uptime
   - Database connections
   - API response times

## Rollback Procedures

### Smart Contracts
- Contracts are upgradeable via Transparent Proxy
- Use `upgradeProxy` function to deploy new implementation
- Test upgrades on testnet first

### Frontend
- Vercel: Use deployment history to rollback
- Other platforms: Use previous build/deployment

### Database
- Supabase: Use point-in-time recovery
- Manual: Restore from backups

## Production Checklist

Before going live:

- [ ] Security audit completed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Incident response plan ready
- [ ] Team trained on procedures
- [ ] Legal compliance verified

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs and metrics
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Security audit review
- **As needed**: Contract upgrades and improvements

### Updates

1. Test on testnet first
2. Review changes thoroughly
3. Deploy during low-traffic periods
4. Monitor closely after deployment
5. Have rollback plan ready

