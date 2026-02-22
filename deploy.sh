#!/usr/bin/env bash
# Deployment script for Fake News Detector

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

# Step 2: Build project
echo "🔨 Step 2: Building project for production..."
npm run build

# Step 3: Check build output
if [ -d "dist" ]; then
    echo "✅ Build successful! Files in dist/ directory"
    ls -lh dist/
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Deploy production build'"
echo "   git push"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "3. Or deploy to Netlify:"
echo "   netlify deploy --prod --dir=dist"
echo ""
echo "✨ Deployment script completed!"
