# 🚀 VERCEL DEPLOYMENT GUIDE

Follow these steps to deploy your AirWatch app to Vercel:

## Option 1: Deploy via GitHub (Recommended - Easiest!)

### Step 1: Push to GitHub

1. Open your terminal/command prompt
2. Navigate to your project folder:
   ```bash
   cd path/to/your/air-quality-app
   ```

3. Initialize git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AirWatch app"
   git branch -M main
   ```

4. Create a new repository on GitHub (https://github.com/new)
   - Name it: `airwatch-app` (or any name you prefer)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

5. Connect your local project to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/airwatch-app.git
   git push -u origin main
   ```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Click "Add New Project"
5. Select "Import Git Repository"
6. Find your `airwatch-app` repository and click "Import"
7. Vercel will auto-detect it's a Vite project
8. Click "Deploy"

**That's it!** Your app will be live in ~30 seconds! 🎉

Vercel will give you a URL like: `airwatch-app-xyz.vercel.app`

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

This will open your browser to authenticate. Click the verification link in your email.

### Step 3: Deploy

Navigate to your project folder and run:

```bash
vercel
```

Follow the prompts:
- "Set up and deploy"? → **Yes**
- "Which scope"? → Select your account
- "Link to existing project"? → **No**
- "What's your project's name"? → `airwatch-app` (or any name)
- "In which directory is your code located"? → `./`

Vercel will deploy your app and give you a URL!

### Step 4: Deploy to Production

For future updates:

```bash
vercel --prod
```

---

## ✅ Verify Deployment

After deployment:

1. Click on the URL Vercel provides
2. Allow location access when prompted
3. You should see your AirWatch app with:
   - Your current location
   - Real-time AQI data
   - Beautiful animated interface
   - Pollutant breakdown
   - Health recommendations

---

## 🔧 Troubleshooting

### "The specified token is not valid"

Run these commands:
```bash
vercel logout
vercel login
```
Then try deploying again.

### Build Fails

Make sure all files are in the correct location:
```
your-project/
  ├── index.html
  ├── package.json
  ├── vite.config.js
  ├── src/
  │   ├── App.jsx
  │   ├── main.jsx
  │   └── index.css
  └── README.md
```

### Location Not Working

The app needs HTTPS to access location. Vercel automatically provides HTTPS, but if testing locally, you need:
```bash
npm run dev -- --host
```

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - In Vercel dashboard, go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain

2. **Auto-Deployments**
   - Every time you push to GitHub, Vercel automatically redeploys
   - Make changes → `git push` → auto-deploy! 🚀

3. **Environment Variables** (If needed in future)
   - Go to project settings
   - Click "Environment Variables"
   - Add API keys if you upgrade to paid APIs

---

## 📊 What You Built

Your AirWatch app features:

✅ **Real-time air quality monitoring**
✅ **Hyperlocal data using GPS**
✅ **6 pollutant metrics** (PM2.5, PM10, O3, NO2, etc.)
✅ **Health recommendations**
✅ **Auto-refresh every 15 minutes**
✅ **Beautiful, responsive design**
✅ **Works on all devices**

---

## 🌟 Share Your App!

Once deployed, share your app:
- Copy the Vercel URL
- Share on social media
- Send to friends and family
- Help people protect their health!

---

**Need help?** 
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

**Happy deploying! 🚀**
