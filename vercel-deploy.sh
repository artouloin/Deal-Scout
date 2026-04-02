#!/bin/bash

# GCG Deal Scout — Vercel Auto-Deploy Script
# Run this after: git push origin main

set -e

echo "🚀 GCG Deal Scout — Vercel Deployment"
echo "======================================"
echo ""

# Check prerequisites
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Step 2: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo ""
echo "Instructions:"
echo "1. Run: vercel --prod"
echo "2. If first time: Connect to GitHub repo"
echo "3. Set these environment variables in Vercel UI:"
echo "   - DATABASE_URL (auto from Vercel Postgres)"
echo "   - NEXTAUTH_SECRET (or keep default)"
echo "   - NOTIFY_EMAILS=j.s.a.baumgartner@gmx.de"
echo "   - TEAM_USERS (or keep default)"
echo ""
echo "Press ENTER to continue..."
read

vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Vercel deployment failed!"
    exit 1
fi

VERCEL_URL=$(vercel --prod --no-commit-sha 2>/dev/null | grep "https://" | tail -1 | xargs)

if [ -z "$VERCEL_URL" ]; then
    echo "⚠️  Could not get Vercel URL. Set NEXTAUTH_URL manually to your domain."
else
    echo "✅ Vercel deployment successful!"
    echo "📍 Your app URL: $VERCEL_URL"
fi

echo ""
echo "⏳ Step 4: Initialize Database..."
echo ""

# Step 4: Initialize Prisma migrations
echo "Pulling environment variables from Vercel..."
vercel env pull .env.local

echo ""
echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed!"
    echo "Try manually: npx prisma migrate deploy"
    exit 1
fi

echo ""
echo "✅ Database initialized!"
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Settings → Environment Variables"
echo "3. Make sure these are set:"
echo "   - NEXTAUTH_URL = your Vercel app URL"
echo "   - NOTIFY_EMAILS = j.s.a.baumgartner@gmx.de"
echo ""
echo "Test your app: vercel logs --follow"
echo ""
