#!/bin/bash

# Phase 3 Setup and Testing Script
# This script validates all Phase 3 features and implementations

set +e  # Don't exit on errors, we want to count them

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS")
            echo -e "${GREEN}✓${NC} $message"
            PASSED=$((PASSED + 1))
            ;;
        "FAIL")
            echo -e "${RED}✗${NC} $message"
            FAILED=$((FAILED + 1))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠${NC} $message"
            WARNINGS=$((WARNINGS + 1))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ${NC} $message"
            ;;
    esac
}

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        print_status "PASS" "File exists: $1"
        return 0
    else
        print_status "FAIL" "File missing: $1"
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        print_status "PASS" "Directory exists: $1"
        return 0
    else
        print_status "FAIL" "Directory missing: $1"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local file_path=$2
    if grep -q "^${var_name}=" "$file_path" 2>/dev/null; then
        local value=$(grep "^${var_name}=" "$file_path" | cut -d'=' -f2)
        if [ -z "$value" ] || [ "$value" = "your_*" ] || [ "$value" = "" ]; then
            print_status "WARN" "Environment variable $var_name is not configured in $file_path"
            return 1
        else
            print_status "PASS" "Environment variable $var_name is configured"
            return 0
        fi
    else
        print_status "WARN" "Environment variable $var_name not found in $file_path"
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 3 Setup and Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================
# 1. Database Optimizations
# ============================================
echo -e "${BLUE}1. Checking Database Optimizations...${NC}"

check_file "supabase/migrations/20240301000000_materialized_views.sql"
check_file "supabase/migrations/20240301000001_additional_indexes.sql"
check_file "supabase/functions/refresh_materialized_views.sql"

echo ""

# ============================================
# 2. Frontend Performance
# ============================================
echo -e "${BLUE}2. Checking Frontend Performance Features...${NC}"

check_file "frontend/lib/cache.ts"
check_file "frontend/components/ui/Skeleton.tsx"
check_file "frontend/components/ui/Toast.tsx"
check_file "frontend/public/sw.js"

# Check next.config.js for optimizations
if grep -q "compress: true" frontend/next.config.js; then
    print_status "PASS" "Compression enabled in next.config.js"
else
    print_status "FAIL" "Compression not enabled in next.config.js"
fi

if grep -q "images:" frontend/next.config.js; then
    print_status "PASS" "Image optimization configured"
else
    print_status "FAIL" "Image optimization not configured"
fi

echo ""

# ============================================
# 3. Monitoring Integration
# ============================================
echo -e "${BLUE}3. Checking Monitoring Integration...${NC}"

check_file "frontend/lib/monitoring/sentry.ts"
check_file "frontend/lib/monitoring/analytics.ts"
check_file "frontend/lib/monitoring/performance.ts"
check_file "frontend/app/api/health/route.ts"
check_file "frontend/app/api/metrics/route.ts"
check_file "frontend/sentry.client.config.ts"
check_file "frontend/sentry.server.config.ts"

# Check for Sentry DSN in environment
if [ -f "frontend/.env.local" ]; then
    check_env_var "NEXT_PUBLIC_SENTRY_DSN" "frontend/.env.local"
else
    print_status "WARN" "frontend/.env.local not found - Sentry may not be configured"
fi

echo ""

# ============================================
# 4. UI/UX Enhancements
# ============================================
echo -e "${BLUE}4. Checking UI/UX Enhancements...${NC}"

check_file "frontend/components/ui/EmptyState.tsx"
check_file "frontend/components/ui/LoadingSpinner.tsx"
check_file "frontend/components/ui/ErrorBoundary.tsx"
check_file "frontend/components/onboarding/OnboardingFlow.tsx"
check_file "frontend/lib/animations.ts"

echo ""

# ============================================
# 5. Analytics Dashboard
# ============================================
echo -e "${BLUE}5. Checking Analytics Dashboard...${NC}"

check_file "frontend/app/analytics/page.tsx"
check_file "frontend/components/analytics/MetricsCard.tsx"
check_file "frontend/components/analytics/Chart.tsx"
check_file "frontend/components/analytics/ExportButton.tsx"
check_file "frontend/app/api/analytics/route.ts"
check_file "frontend/app/api/export/route.ts"

echo ""

# ============================================
# 6. API Enhancements
# ============================================
echo -e "${BLUE}6. Checking API Enhancements...${NC}"

check_file "frontend/lib/api/validation.ts"
check_file "frontend/docs/api.md"

# Check for API versioning
if [ -d "frontend/app/api/v2" ]; then
    print_status "PASS" "API versioning directory exists"
else
    print_status "WARN" "API versioning directory not found"
fi

# Check for batch endpoint
if [ -f "frontend/app/api/batch/route.ts" ]; then
    print_status "PASS" "Batch API endpoint exists"
else
    print_status "WARN" "Batch API endpoint not found"
fi

echo ""

# ============================================
# 7. Mobile App Improvements
# ============================================
echo -e "${BLUE}7. Checking Mobile App Improvements...${NC}"

check_file "mobile/lib/offline.ts"
check_file "mobile/lib/notifications.ts"
check_file "mobile/components/LoadingState.tsx"
check_file "mobile/components/ErrorState.tsx"

echo ""

# ============================================
# 8. Production Readiness
# ============================================
echo -e "${BLUE}8. Checking Production Readiness...${NC}"

check_file "docs/INCIDENT_RESPONSE.md"
check_file "docs/MONITORING.md"
check_file "docs/PERFORMANCE_TUNING.md"
check_file "scripts/backup.sh"

# Check for GitHub workflows
if [ -d ".github/workflows" ]; then
    if [ -f ".github/workflows/backup.yml" ]; then
        print_status "PASS" "Backup workflow exists"
    else
        print_status "WARN" "Backup workflow not found"
    fi
else
    print_status "WARN" ".github/workflows directory not found"
fi

echo ""

# ============================================
# 9. Environment Variables Check
# ============================================
echo -e "${BLUE}9. Checking Environment Variables...${NC}"

if [ -f "frontend/.env.local" ]; then
    check_env_var "NEXT_PUBLIC_SUPABASE_URL" "frontend/.env.local"
    check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "frontend/.env.local"
    check_env_var "SUPABASE_SERVICE_ROLE_KEY" "frontend/.env.local"
else
    print_status "FAIL" "frontend/.env.local not found"
fi

if [ -f "indexer/.env" ]; then
    check_env_var "SUPABASE_URL" "indexer/.env"
    check_env_var "SUPABASE_SERVICE_ROLE_KEY" "indexer/.env"
else
    print_status "WARN" "indexer/.env not found"
fi

echo ""

# ============================================
# 10. Build and Type Check
# ============================================
echo -e "${BLUE}10. Running Build and Type Checks...${NC}"

# Frontend type check
if [ -d "frontend" ]; then
    cd frontend
    if npm run type-check > /dev/null 2>&1; then
        print_status "PASS" "Frontend type check passed"
    else
        print_status "FAIL" "Frontend type check failed"
    fi
    cd ..
else
    print_status "WARN" "Frontend directory not found"
fi

echo ""

# ============================================
# Summary
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the output above.${NC}"
    exit 1
fi

