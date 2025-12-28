# Supabase Database Setup Guide

This guide will walk you through setting up your Supabase database for the Philanthropical platform.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Basic knowledge of SQL and database concepts

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `philanthropical` (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click **"Create new project"**
5. Wait for the project to be provisioned (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

After your project is created:

1. Go to **Settings** → **API** (in the left sidebar)
2. You'll find:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

Copy these values - you'll need them for your `.env` files.

## Step 3: Run Database Migrations

You have two options to run migrations:

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**:
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # Or using npm
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```
   This will open your browser to authenticate.

3. **Link your project**:
   ```bash
   cd /Users/youwenshao/Projects/philanthropical
   supabase link --project-ref your-project-id
   ```
   You can find your project ID in the Supabase dashboard URL or in project settings.

4. **Run migrations**:
   ```bash
   supabase db push
   ```
   This will apply all migrations from `supabase/migrations/` to your database.

### Option B: Using Supabase Dashboard (Manual)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **"New query"**
4. Open the migration file: `supabase/migrations/20240101000000_initial_schema.sql`
5. Copy the entire contents of the file
6. Paste it into the SQL Editor
7. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)

## Step 4: Verify Migration Success

After running the migration, verify that everything was created correctly:

1. Go to **Table Editor** in the Supabase dashboard
2. You should see the following tables:
   - `users`
   - `charities`
   - `donation_events`
   - `verification_submissions`
   - `fraud_alerts`
   - `projects`
   - `milestones`

3. Check Row Level Security (RLS) is enabled:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```
   You should see multiple policies listed.

## Step 5: Configure Environment Variables

Update your frontend `.env.local` file with your Supabase credentials:

```bash
cd frontend
cp .env.example .env.local
```

Then edit `.env.local` and add:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

For the indexer, update `indexer/.env`:
```bash
cd indexer
cp .env.example .env
```

Then edit `.env` and add:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 6: Test Database Connection

### Test from Frontend

1. Start your frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Check the browser console for any Supabase connection errors

### Test from Indexer

1. Build and run the indexer:
   ```bash
   cd indexer
   npm install
   npm run build
   npm start
   ```

2. Check for any database connection errors in the console

## Database Schema Overview

The migration creates the following structure:

### Core Tables

- **users**: Links Supabase auth users to wallet addresses
- **charities**: Stores charity information and verification status
- **donation_events**: Records all on-chain donation transactions
- **verification_submissions**: Tracks impact verification submissions
- **fraud_alerts**: Stores fraud detection alerts
- **projects**: Tracks escrow projects
- **milestones**: Tracks project milestones for fund release

### Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**: Configured to allow appropriate access:
  - Public read access for charities, donations, projects
  - Authenticated users can read their own data
  - Only admins/service role can write sensitive data

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- The tables may already exist. Check if you've run the migration before.
- If you need to reset, you can drop tables manually (⚠️ This deletes all data):
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
- Make sure you're using the service role key for migrations
- Check that your project has the necessary permissions

### Connection Issues

**"Invalid API key"**
- Double-check that you copied the keys correctly
- Ensure there are no extra spaces or newlines
- Verify you're using the correct key (anon key for frontend, service role for indexer)

**"Failed to connect to database"**
- Check your internet connection
- Verify the Supabase project URL is correct
- Ensure your project is not paused (free tier projects pause after inactivity)

### RLS Policy Issues

**"new row violates row-level security policy"**
- Check that you're using the correct authentication context
- Verify RLS policies are correctly configured
- For service operations, use the service role key

## Next Steps

After setting up the database:

1. ✅ Deploy contracts to Polygon Amoy
2. ✅ Update contract addresses in `.env` files
3. ✅ Configure the indexer to start processing events
4. ✅ Test the full donation flow end-to-end

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## Support

If you encounter issues:
1. Check the Supabase dashboard logs
2. Review the migration file for syntax errors
3. Consult the [Supabase Discord](https://discord.supabase.com)
4. Open a GitHub issue with error details

