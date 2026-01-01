#!/bin/bash

# Environment Variables Setup Script for Philanthropical
# This script helps you configure environment variables for the project

set -e

echo "🔧 Philanthropical Environment Variables Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for input
prompt_value() {
    local prompt=$1
    local var_name=$2
    local default=$3
    local secret=$4
    
    if [ "$secret" = "true" ]; then
        read -sp "$prompt: " value
        echo ""
    else
        if [ -n "$default" ]; then
            read -p "$prompt [$default]: " value
            value=${value:-$default}
        else
            read -p "$prompt: " value
        fi
    fi
    
    echo "$value"
}

echo -e "${BLUE}Step 1: Supabase Configuration${NC}"
echo "Get your Supabase credentials from: https://app.supabase.com/project/_/settings/api"
echo ""

SUPABASE_URL=$(prompt_value "Enter your Supabase Project URL" "" false)
SUPABASE_ANON_KEY=$(prompt_value "Enter your Supabase Anon/Public Key" "" true)
SUPABASE_SERVICE_KEY=$(prompt_value "Enter your Supabase Service Role Key" "" true)

echo ""
echo -e "${BLUE}Step 2: Frontend Configuration${NC}"
echo ""

# Frontend .env.local
FRONTEND_ENV="frontend/.env.local"

# Check if file exists, if not create from example
if [ ! -f "$FRONTEND_ENV" ]; then
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example "$FRONTEND_ENV"
        echo "Created $FRONTEND_ENV from .env.example"
    else
        touch "$FRONTEND_ENV"
        echo "Created new $FRONTEND_ENV"
    fi
fi

# Update or add Supabase variables
if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$FRONTEND_ENV"; then
    sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" "$FRONTEND_ENV"
else
    echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$FRONTEND_ENV"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$FRONTEND_ENV"; then
    sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" "$FRONTEND_ENV"
else
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> "$FRONTEND_ENV"
fi

if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$FRONTEND_ENV"; then
    sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" "$FRONTEND_ENV"
else
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY" >> "$FRONTEND_ENV"
fi

# Remove backup files
rm -f "$FRONTEND_ENV.bak"

echo -e "${GREEN}✓ Updated frontend/.env.local${NC}"

echo ""
echo -e "${BLUE}Step 3: Indexer Configuration${NC}"
echo ""

# Indexer .env
INDEXER_ENV="indexer/.env"

# Check if file exists, if not create from example
if [ ! -f "$INDEXER_ENV" ]; then
    if [ -f "indexer/.env.example" ]; then
        cp indexer/.env.example "$INDEXER_ENV"
        echo "Created $INDEXER_ENV from .env.example"
    else
        touch "$INDEXER_ENV"
        echo "Created new $INDEXER_ENV"
    fi
fi

# Update or add Supabase variables
if grep -q "SUPABASE_URL" "$INDEXER_ENV"; then
    sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" "$INDEXER_ENV"
else
    echo "SUPABASE_URL=$SUPABASE_URL" >> "$INDEXER_ENV"
fi

if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$INDEXER_ENV"; then
    sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" "$INDEXER_ENV"
else
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY" >> "$INDEXER_ENV"
fi

# Remove backup files
rm -f "$INDEXER_ENV.bak"

echo -e "${GREEN}✓ Updated indexer/.env${NC}"

echo ""
echo -e "${GREEN}✅ Environment variables configured successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify your Supabase credentials are correct"
echo "2. Make sure your Supabase database migrations have been run"
echo "3. Restart your development servers if they're running"
echo ""



