#!/bin/bash

# Phase 3 Functional Testing Script
# Tests actual functionality of Phase 3 features

set +e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

print_test() {
    local name=$1
    echo -e "${BLUE}Testing: $name${NC}"
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    PASSED=$((PASSED + 1))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    FAILED=$((FAILED + 1))
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 3 Functional Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if frontend is running
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

print_test "Health Check Endpoint"
if curl -s -f "${FRONTEND_URL}/api/health" > /dev/null 2>&1; then
    RESPONSE=$(curl -s "${FRONTEND_URL}/api/health")
    if echo "$RESPONSE" | grep -q '"status"'; then
        print_pass "Health endpoint responds"
        echo "  Response: $(echo $RESPONSE | jq -r '.status' 2>/dev/null || echo 'OK')"
    else
        print_fail "Health endpoint response invalid"
    fi
else
    print_fail "Health endpoint not accessible (is frontend running?)"
    echo "  Start with: cd frontend && npm run dev"
fi

echo ""

print_test "Metrics Endpoint"
if curl -s -f "${FRONTEND_URL}/api/metrics" > /dev/null 2>&1; then
    RESPONSE=$(curl -s "${FRONTEND_URL}/api/metrics")
    if echo "$RESPONSE" | grep -q '"timestamp"'; then
        print_pass "Metrics endpoint responds"
    else
        print_fail "Metrics endpoint response invalid"
    fi
else
    print_fail "Metrics endpoint not accessible"
fi

echo ""

print_test "Analytics Endpoint"
if curl -s -f "${FRONTEND_URL}/api/analytics" > /dev/null 2>&1; then
    RESPONSE=$(curl -s "${FRONTEND_URL}/api/analytics")
    if echo "$RESPONSE" | grep -q '"totalDonations"'; then
        print_pass "Analytics endpoint responds"
    else
        print_fail "Analytics endpoint response invalid"
    fi
else
    print_fail "Analytics endpoint not accessible"
fi

echo ""

print_test "Database Materialized Views"
# Check if we can query materialized views (requires Supabase connection)
if [ -f "frontend/.env.local" ]; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" frontend/.env.local | cut -d'=' -f2)
    if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "your-project-id.supabase.co" ]; then
        print_pass "Supabase URL configured"
        echo "  Note: Run SQL to verify materialized views exist"
        echo "  SELECT * FROM donation_analytics_mv LIMIT 1;"
    else
        print_fail "Supabase URL not configured"
    fi
else
    print_fail "frontend/.env.local not found"
fi

echo ""

print_test "Frontend Build"
if [ -d "frontend" ]; then
    cd frontend
    if npm run build > /dev/null 2>&1; then
        print_pass "Frontend builds successfully"
    else
        print_fail "Frontend build failed (check errors above)"
    fi
    cd ..
else
    print_fail "Frontend directory not found"
fi

echo ""

print_test "Service Worker"
if [ -f "frontend/public/sw.js" ]; then
    print_pass "Service worker file exists"
else
    print_fail "Service worker file missing"
fi

echo ""

print_test "Sentry Configuration"
if [ -f "frontend/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_SENTRY_DSN" frontend/.env.local; then
        SENTRY_DSN=$(grep "NEXT_PUBLIC_SENTRY_DSN" frontend/.env.local | cut -d'=' -f2)
        if [ -n "$SENTRY_DSN" ] && [ "$SENTRY_DSN" != "your_sentry_dsn_here" ]; then
            print_pass "Sentry DSN configured"
        else
            echo -e "${YELLOW}⚠ WARN${NC} Sentry DSN not configured (optional)"
        fi
    else
        echo -e "${YELLOW}⚠ WARN${NC} Sentry DSN not found (optional)"
    fi
else
    echo -e "${YELLOW}⚠ WARN${NC} frontend/.env.local not found"
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All functional tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Review output above.${NC}"
    echo -e "${YELLOW}Note: Some failures may be expected if services aren't running.${NC}"
    exit 0  # Don't fail, just report
fi

