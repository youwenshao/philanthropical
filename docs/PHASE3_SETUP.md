# Phase 3 Setup and Testing Guide

This guide will help you set up and test all Phase 3 features.

## Prerequisites

1. ✅ Phase 1 and Phase 2 completed
2. ✅ Supabase project configured
3. ✅ Contracts deployed (optional for testing)
4. ✅ Node.js 20+ installed

## Quick Setup

### 1. Environment Variables

#### Frontend Environment (`frontend/.env.local`)

Add these Phase 3 specific variables:

```bash
# Sentry Error Tracking (Optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id_here

# App Version (for monitoring)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**To get Sentry DSN:**
1. Go to [Sentry.io](https://sentry.io)
2. Create a new project (Next.js)
3. Copy the DSN from project settings

#### Existing Required Variables

Make sure these are already configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 2. Database Setup

Run the Phase 3 migrations:

```bash
# Connect to your Supabase project
# Via Supabase Dashboard > SQL Editor, or using Supabase CLI

# Run migrations in order:
# 1. Materialized views
supabase/migrations/20240301000000_materialized_views.sql

# 2. Additional indexes
supabase/migrations/20240301000001_additional_indexes.sql

# 3. Set up refresh function
supabase/functions/refresh_materialized_views.sql
```

**Or using Supabase CLI:**
```bash
supabase db push
```

### 3. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Mobile (if testing mobile features)
cd ../mobile
npm install
```

## Testing Phase 3 Features

### Automated Testing

Run the comprehensive test script:

```bash
./scripts/test-phase3.sh
```

This will check:
- ✅ All Phase 3 files exist
- ✅ Environment variables configured
- ✅ Type checking passes
- ✅ Build configurations correct

### Manual Testing

#### 1. Health Check Endpoint

```bash
# Start the frontend dev server
cd frontend
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "checks": {
    "database": "healthy",
    "api": "ok"
  }
}
```

#### 2. Metrics Endpoint

```bash
curl http://localhost:3000/api/metrics
```

Expected response:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "memory": {
    "used": 50,
    "total": 100
  },
  "database": {
    "donations": 0,
    "charities": 0,
    "verifications": 0
  }
}
```

#### 3. Analytics Dashboard

1. Navigate to `http://localhost:3000/analytics`
2. Verify:
   - ✅ Page loads without errors
   - ✅ Metrics cards display
   - ✅ Charts render
   - ✅ Export button works

#### 4. Frontend Performance

Test in browser DevTools:

1. **Lighthouse Audit:**
   ```bash
   # Open Chrome DevTools > Lighthouse
   # Run audit and verify:
   # - Performance > 90
   # - Accessibility > 90
   # - Best Practices > 90
   # - SEO > 90
   ```

2. **Network Tab:**
   - Check that images are optimized
   - Verify compression headers
   - Check bundle sizes

3. **Service Worker:**
   - Open DevTools > Application > Service Workers
   - Verify service worker is registered
   - Test offline functionality

#### 5. Monitoring (Sentry)

If Sentry is configured:

1. **Test Error Tracking:**
   - Trigger a test error (e.g., navigate to invalid route)
   - Check Sentry dashboard for error

2. **Test Performance Monitoring:**
   - Navigate through the app
   - Check Sentry Performance tab for transactions

#### 6. UI/UX Features

Test the following:

- ✅ Loading states on all async operations
- ✅ Error boundaries catch errors gracefully
- ✅ Toast notifications appear
- ✅ Empty states display helpful messages
- ✅ Animations are smooth
- ✅ Onboarding flow works (if applicable)

#### 7. Database Optimizations

Test materialized views:

```sql
-- Check if materialized views exist
SELECT * FROM donation_analytics_mv LIMIT 10;
SELECT * FROM charity_performance_mv LIMIT 10;
SELECT * FROM verification_stats_mv LIMIT 10;

-- Test refresh function
SELECT refresh_materialized_views();
```

#### 8. API Enhancements

Test API features:

```bash
# Test API versioning (if implemented)
curl http://localhost:3000/api/v2/donations

# Test batch endpoint (if implemented)
curl -X POST http://localhost:3000/api/batch \
  -H "Content-Type: application/json" \
  -d '{"requests": [...]}'

# Test export endpoint
curl http://localhost:3000/api/export?format=csv
```

#### 9. Mobile App (if applicable)

```bash
cd mobile
npm start

# Test offline mode
# Test push notifications
# Test image compression
```

## Validation Checklist

After setup, verify:

### Performance Metrics
- [ ] Page load time < 2 seconds (95th percentile)
- [ ] API response time < 200ms (95th percentile)
- [ ] Database query time < 100ms (95th percentile)
- [ ] Lighthouse score > 90 for all pages

### Functionality
- [ ] Health check endpoint returns healthy status
- [ ] Metrics endpoint returns data
- [ ] Analytics dashboard loads and displays data
- [ ] Export functionality works
- [ ] Materialized views refresh correctly
- [ ] All API endpoints respond correctly

### Monitoring
- [ ] Sentry error tracking works (if configured)
- [ ] Performance monitoring captures transactions
- [ ] Health checks run successfully
- [ ] Metrics are collected

### UI/UX
- [ ] Loading states appear on async operations
- [ ] Error boundaries catch errors
- [ ] Toast notifications work
- [ ] Empty states display
- [ ] Animations are smooth
- [ ] Accessibility features work

## Troubleshooting

### Health Check Returns "degraded"

**Issue:** Database connection failing

**Solution:**
1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is not paused
3. Verify network connectivity

### Analytics Dashboard Shows No Data

**Issue:** Materialized views not populated

**Solution:**
1. Run the refresh function:
   ```sql
   SELECT refresh_materialized_views();
   ```
2. Check if base tables have data
3. Verify materialized views exist

### Sentry Not Working

**Issue:** Errors not appearing in Sentry

**Solution:**
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check Sentry project settings
3. Verify network allows Sentry requests
4. Check browser console for Sentry errors

### Build Errors

**Issue:** TypeScript or build errors

**Solution:**
```bash
cd frontend
npm run type-check  # Check for type errors
npm run lint        # Check for linting errors
npm run build       # Try building
```

### Performance Issues

**Issue:** Slow page loads or API responses

**Solution:**
1. Check database query performance
2. Verify indexes are created
3. Check network tab for large assets
4. Verify compression is enabled
5. Check materialized views are refreshed

## Next Steps

After successful setup:

1. ✅ Monitor error rates in Sentry
2. ✅ Review analytics dashboard regularly
3. ✅ Set up alerts for critical metrics
4. ✅ Schedule materialized view refreshes
5. ✅ Review performance metrics weekly

## Support

For issues:
1. Check this guide
2. Review `docs/MONITORING.md`
3. Review `docs/PERFORMANCE_TUNING.md`
4. Check GitHub issues

