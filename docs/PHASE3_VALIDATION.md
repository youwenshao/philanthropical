# Phase 3 Validation Checklist

Use this checklist to validate that Phase 3 is properly set up and working.

## Pre-Validation Setup

### 1. Environment Variables

Ensure these are configured in `frontend/.env.local`:

- [x] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN (optional but recommended)

### 2. Database Migrations

Run Phase 3 database migrations:

```sql
-- In Supabase SQL Editor, run:
-- 1. Materialized views migration
-- 2. Additional indexes migration
-- 3. Refresh function
```

Verify migrations:
```sql
-- Check materialized views exist
SELECT * FROM donation_analytics_mv LIMIT 1;
SELECT * FROM charity_performance_mv LIMIT 1;
SELECT * FROM verification_stats_mv LIMIT 1;
```

## Automated Validation

### Run Test Scripts

1. **File Structure Test:**
   ```bash
   ./scripts/test-phase3.sh
   ```
   Expected: 45+ passed, 0-1 warnings, 0-1 failures (type check may fail)

2. **Functional Test:**
   ```bash
   # Start frontend first
   cd frontend && npm run dev
   
   # In another terminal
   ./scripts/test-phase3-functional.sh
   ```

## Manual Validation

### 1. Health Check ✅

**Test:** `GET /api/health`

```bash
curl http://localhost:3000/api/health
```

**Expected:**
- Status: 200
- Response includes: `status: "healthy"` or `"degraded"`
- Database check: `"healthy"` or `"unhealthy"`

**Validation:**
- [ ] Endpoint responds
- [ ] Returns JSON
- [ ] Status field present
- [ ] Database check works (if Supabase configured)

### 2. Metrics Endpoint ✅

**Test:** `GET /api/metrics`

```bash
curl http://localhost:3000/api/metrics
```

**Expected:**
- Status: 200
- Response includes: `timestamp`, `uptime`, `memory`
- Database metrics (if configured)

**Validation:**
- [ ] Endpoint responds
- [ ] Returns metrics data
- [ ] Memory usage reported
- [ ] Database metrics included (if configured)

### 3. Analytics Dashboard ✅

**Test:** Navigate to `/analytics`

1. Open browser: `http://localhost:3000/analytics`
2. Check page loads
3. Verify components render

**Expected:**
- Page loads without errors
- Metrics cards display
- Charts render (may be empty if no data)
- Export button visible

**Validation:**
- [ ] Page loads successfully
- [ ] No console errors
- [ ] Metrics cards visible
- [ ] Charts render
- [ ] Loading states work
- [ ] Export button functional

### 4. Analytics API ✅

**Test:** `GET /api/analytics`

```bash
curl http://localhost:3000/api/analytics
```

**Expected:**
- Status: 200
- Response includes: `totalDonations`, `totalAmount`, `activeCharities`, etc.

**Validation:**
- [ ] Endpoint responds
- [ ] Returns analytics data
- [ ] All expected fields present
- [ ] Handles empty data gracefully

### 5. Export Functionality ✅

**Test:** `GET /api/export`

```bash
curl "http://localhost:3000/api/export?format=csv"
```

**Expected:**
- Status: 200
- CSV or JSON response
- Proper headers

**Validation:**
- [ ] Export endpoint responds
- [ ] CSV format works
- [ ] JSON format works
- [ ] Proper content-type headers

### 6. Frontend Performance ✅

**Test:** Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit on homepage

**Expected Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

**Validation:**
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### 7. Image Optimization ✅

**Test:** Network Tab

1. Open DevTools > Network
2. Reload page
3. Check image requests

**Expected:**
- Images use Next.js Image component
- Images are optimized (WebP/AVIF)
- Proper caching headers

**Validation:**
- [ ] Images use optimized formats
- [ ] Cache headers present
- [ ] Image sizes reasonable

### 8. Service Worker ✅

**Test:** Application Tab

1. Open DevTools > Application
2. Go to Service Workers
3. Check registration

**Expected:**
- Service worker registered
- Status: activated

**Validation:**
- [ ] Service worker registered
- [ ] Status is activated
- [ ] Offline functionality works (if implemented)

### 9. Error Boundaries ✅

**Test:** Trigger Error

1. Navigate to invalid route
2. Check error handling

**Expected:**
- Error caught by boundary
- User-friendly error message
- No white screen

**Validation:**
- [ ] Error boundary catches errors
- [ ] Error message displayed
- [ ] App doesn't crash

### 10. Loading States ✅

**Test:** Navigation

1. Navigate between pages
2. Check loading indicators

**Expected:**
- Loading spinners appear
- Skeleton loaders show
- Smooth transitions

**Validation:**
- [ ] Loading states visible
- [ ] Skeleton loaders work
- [ ] Smooth transitions

### 11. Toast Notifications ✅

**Test:** User Actions

1. Perform actions (donate, submit form)
2. Check for toast messages

**Expected:**
- Toast notifications appear
- Proper styling
- Auto-dismiss works

**Validation:**
- [ ] Toasts appear on actions
- [ ] Proper styling
- [ ] Auto-dismiss works

### 12. Database Materialized Views ✅

**Test:** SQL Queries

```sql
-- Check views exist and have data
SELECT COUNT(*) FROM donation_analytics_mv;
SELECT COUNT(*) FROM charity_performance_mv;
SELECT COUNT(*) FROM verification_stats_mv;

-- Test refresh function
SELECT refresh_materialized_views();
```

**Expected:**
- Views exist
- Refresh function works
- Data is current

**Validation:**
- [ ] Materialized views exist
- [ ] Refresh function works
- [ ] Views contain data (if applicable)

### 13. Monitoring (Sentry) ✅

**Test:** Error Tracking

1. If Sentry configured, trigger test error
2. Check Sentry dashboard

**Expected:**
- Errors appear in Sentry
- Performance data captured

**Validation:**
- [ ] Sentry configured (optional)
- [ ] Errors tracked (if configured)
- [ ] Performance monitoring works (if configured)

### 14. API Caching ✅

**Test:** Network Tab

1. Make API request
2. Check response headers
3. Make same request again

**Expected:**
- Cache-Control headers present
- Second request may be cached

**Validation:**
- [ ] Cache headers present
- [ ] Caching works as expected

### 15. Build and Type Check ✅

**Test:** Build Process

```bash
cd frontend
npm run build
npm run type-check
```

**Expected:**
- Build succeeds
- Type check passes (or shows only minor warnings)

**Validation:**
- [ ] Build succeeds
- [ ] Type check passes (or acceptable warnings)
- [ ] No critical errors

## Performance Benchmarks

### Target Metrics

- [ ] Page load time < 2s (95th percentile)
- [ ] API response time < 200ms (95th percentile)
- [ ] Database query time < 100ms (95th percentile)
- [ ] Lighthouse Performance > 90
- [ ] Error rate < 0.1%

### Measurement

Use browser DevTools and monitoring tools to measure:

1. **Page Load Time:**
   - Network tab > Load time
   - Lighthouse > Performance metrics

2. **API Response Time:**
   - Network tab > API requests
   - Response time column

3. **Database Query Time:**
   - Supabase dashboard > Query performance
   - Check slow queries

## Summary

After completing all validations:

- ✅ **All Critical:** All must pass for production
- ⚠️ **Optional:** Sentry, some analytics features
- 📊 **Performance:** Monitor and optimize continuously

## Next Steps

1. ✅ Fix any failed validations
2. ✅ Set up monitoring alerts
3. ✅ Schedule materialized view refreshes
4. ✅ Configure Sentry (if not done)
5. ✅ Set up production deployment
6. ✅ Create monitoring dashboards

## Troubleshooting

See `docs/PHASE3_SETUP.md` for detailed troubleshooting guide.

