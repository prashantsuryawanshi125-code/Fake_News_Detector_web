# Fake News Detector - Deployment Guide

## ✅ Build Status
The project has been successfully built! Production files are in the `dist/` directory.

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Recommended)
Vercel is the easiest and most suitable for React/Vite applications.

#### Steps:
1. **Create a Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up with GitHub, GitLab, or email

2. **Push to GitHub** (Required for Vercel)
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/fake-news-detector.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your GitHub repo
   - Configure environment variables:
     - Add `GEMINI_API_KEY`: `AIzaSyAvji6MkM2lUcrkO0-gydxoEwMmiv_ZcKc`
   - Click "Deploy"

4. **Access Your App**
   - Your app will be live at: `https://fake-news-detector-YOUR_USERNAME.vercel.app`

---

### Option 2: Deploy to Netlify
Another excellent free option for static sites.

#### Steps:
1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/fake-news-detector.git
   git push -u origin main
   ```

3. **Connect to Netlify**
   - Go to https://app.netlify.com/start
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variable: `GEMINI_API_KEY`
   - Deploy

4. **Access Your App**
   - Your app will be live at: `https://YOUR_SITE_NAME.netlify.app`

---

### Option 3: Deploy to GitHub Pages (Free)
For simple static hosting.

#### Steps:
1. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/fake-news-detector/',
     // ... rest of config
   });
   ```

2. **Add GitHub Pages Workflow**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '20'
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Access Your App**
   - Your app will be live at: `https://YOUR_USERNAME.github.io/fake-news-detector`

---

### Option 4: Deploy to AWS Amplify
AWS option with more control.

#### Steps:
1. **Create AWS Account**
   - Go to https://aws.amazon.com

2. **Push to GitHub**

3. **Connect to AWS Amplify**
   - Go to https://console.aws.amazon.com/amplifyapp
   - Select "New app" > "Host web app"
   - Connect your GitHub repo
   - Build settings should auto-detect
   - Deploy

---

## 🔑 Environment Variables
Make sure to add your Gemini API key in the platform's environment variables:
- **Key**: `GEMINI_API_KEY`
- **Value**: `AIzaSyAvji6MkM2lUcrkO0-gydxoEwMmiv_ZcKc`

## 📊 Performance Metrics
- **Build Time**: ~8 seconds
- **Bundle Size**: 1,061 KB (294 KB gzipped)
- **Build Status**: ✅ Success

## 🛠️ Local Testing Before Deployment
```bash
npm run build      # Build for production
npm run preview    # Preview production build locally
```

## 📝 Next Steps
1. Choose your preferred deployment platform
2. Create an account (if needed)
3. Connect your GitHub repository
4. Add environment variables
5. Deploy!

For questions or issues, refer to:
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Docs: https://vitejs.dev/guide/static-deploy.html
