#!/bin/bash

# GCG Deal Scout — Vercel Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 GCG Deal Scout — Vercel Deployment"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please copy .env.example to .env.local and fill in your values"
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Check git status
echo "📦 Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Working directory clean"
else
    echo "⚠️  Uncommitted changes detected. Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "📝 Preparing for deployment..."
echo ""

# Build locally first
echo "🔨 Building locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Set environment variables in Vercel Dashboard"
    echo "2. Run migrations: vercel env pull && npx prisma migrate deploy"
    echo "3. Test: vercel logs --follow"
    echo ""
    echo "📖 For detailed instructions, see: DEPLOY_VERCEL.md"
else
    echo "❌ Deployment failed!"
    exit 1
fi
