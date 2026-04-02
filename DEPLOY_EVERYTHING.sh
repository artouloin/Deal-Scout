#!/bin/bash
# 🚀 GCG Deal Scout — COMPLETE DEPLOYMENT SCRIPT
# Run this ONCE and everything is deployed!

set -e

echo "🚀 GCG Deal Scout — Complete Deployment"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# STEP 1: GitHub Push
# ============================================
echo -e "${YELLOW}STEP 1: Pushing to GitHub...${NC}"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found!${NC}"
    echo ""
    echo "Install with:"
    echo "  brew install gh  (macOS)"
    echo "  Or: https://github.com/cli/cli#installation"
    echo ""
    echo "Then run again: bash DEPLOY_EVERYTHING.sh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}📝 You're not logged in to GitHub. Signing in...${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ GitHub CLI ready${NC}"
echo ""

# Verify repo exists
echo "Checking if repo exists..."
if gh repo view artouloin/Deal-Scout &> /dev/null; then
    echo -e "${GREEN}✅ Repo found: artouloin/Deal-Scout${NC}"
else
    echo -e "${RED}❌ Repo not found!${NC}"
    echo "Make sure you created it at: https://github.com/artouloin/Deal-Scout"
    exit 1
fi

echo ""
echo "🔄 Pushing code..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Git push failed!${NC}"
    exit 1
fi

echo ""

# ============================================
# STEP 2 & 4: Vercel Deploy + DB Init
# ============================================
echo -e "${YELLOW}STEP 2: Vercel Deployment + Database Init...${NC}"
echo ""

if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI ready${NC}"
echo ""

# Deploy to Vercel
echo "🌐 Starting Vercel deployment..."
echo ""
echo "⚠️  Instructions:"
echo "1. If asked to connect GitHub → Authorize"
echo "2. If asked about project setup → Keep defaults"
echo "3. Deployment will take ~2-3 minutes"
echo ""
echo "Press ENTER to continue..."
read -r

vercel --prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Vercel deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Vercel deployment successful!${NC}"
echo ""

# Get Vercel URL
VERCEL_URL=$(vercel list | grep "gcg-deal-scout\|Deal-Scout" | grep "vercel.app" | head -1 | awk '{print $NF}')

if [ -z "$VERCEL_URL" ]; then
    VERCEL_URL="https://your-project.vercel.app"
    echo -e "${YELLOW}⚠️  Could not auto-detect URL. Set NEXTAUTH_URL manually in Vercel Dashboard${NC}"
else
    echo "📍 Your app URL: $VERCEL_URL"
fi

echo ""

# Initialize Database
echo -e "${YELLOW}STEP 3: Initializing Database...${NC}"
echo ""

echo "Pulling Vercel environment variables..."
vercel env pull .env.local

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to pull env vars!${NC}"
    exit 1
fi

echo ""
echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database migration failed!${NC}"
    echo "Try manually: npx prisma migrate deploy"
    exit 1
fi

echo -e "${GREEN}✅ Database initialized!${NC}"
echo ""

# ============================================
# SUCCESS
# ============================================
echo "============================================"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "============================================"
echo ""
echo -e "${GREEN}Your app is LIVE!${NC}"
echo ""
echo "📍 URL: $VERCEL_URL"
echo "🔐 Login: demo@gcg.de / demo123"
echo "📧 Notifications: j.s.a.baumgartner@gmx.de"
echo ""
echo "⚙️  Next steps:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Find your project"
echo "3. Settings → Environment Variables"
echo "4. Make sure NEXTAUTH_URL = $VERCEL_URL"
echo ""
echo "✅ Test your app:"
echo "   vercel logs --follow"
echo ""
echo "🚀 Done! Your app is ready to use!"
echo ""
