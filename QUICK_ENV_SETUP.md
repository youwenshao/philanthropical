# Quick Environment Variables Setup

## ✅ What's Been Done

1. ✅ Added Supabase configuration placeholders to `frontend/.env.local`
2. ✅ Created `indexer/.env` from template
3. ✅ Created setup script at `scripts/setup-env.sh`
4. ✅ Created detailed documentation at `docs/ENV_SETUP.md`

## 🔑 Next Steps: Add Your Supabase Credentials

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create one if you haven't)
3. Navigate to **Settings** → **API**
4. Copy these three values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the public key)
   - **service_role** key (⚠️ **KEEP SECRET** - this is your admin key!)

### Step 2: Update Frontend Environment

Edit `frontend/.env.local` and replace these placeholders:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co  # ← Replace with your URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here      # ← Replace with anon key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here # ← Replace with service_role key
```

### Step 3: Update Indexer Environment

Edit `indexer/.env` and replace these placeholders:

```bash
SUPABASE_URL=https://your-project.supabase.co                  # ← Replace with your URL
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key       # ← Replace with service_role key
```

## 🚀 Quick Setup (Automated)

You can also use the setup script:

```bash
./scripts/setup-env.sh
```

This will prompt you for your credentials and automatically update all files.

## ✅ Verification

After updating your credentials:

1. **Test Frontend Connection:**
   ```bash
   cd frontend
   npm run dev
   ```
   Check browser console for any Supabase connection errors.

2. **Test Indexer Connection:**
   ```bash
   cd indexer
   npm run build
   npm start
   ```
   Should connect without errors.

## 📝 Current Environment Files Status

- ✅ `frontend/.env.local` - Has Supabase placeholders (needs your credentials)
- ✅ `indexer/.env` - Created from template (needs your credentials)
- ✅ `contracts/.env` - Already exists (needs PRIVATE_KEY for deployment)

## 🔒 Security Reminder

- ⚠️ Never commit `.env` files to git
- ⚠️ Service Role Key has admin access - keep it secret!
- ⚠️ Only use Service Role Key server-side (indexer, API routes)

## 📚 More Information

See `docs/ENV_SETUP.md` for complete documentation on all environment variables.



