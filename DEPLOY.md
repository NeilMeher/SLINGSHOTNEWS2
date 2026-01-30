# 🚀 Deploying Slingshot News to Vercel

Vercel can deploy **EVERYTHING** - frontend, backend, and even the Grok API!

---

## 🎯 Quick Overview

You'll deploy 2 projects to Vercel:
1. **Backend API** → `slingshot-api.vercel.app`
2. **Frontend** → `slingshot-news.vercel.app`

Both are **FREE** on Vercel's hobby plan!

---

## Step 1: Push to GitHub

First, push your project to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/slingshot-news.git
git push -u origin main
```

---

## Step 2: Set Up MongoDB Atlas (FREE)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a FREE cluster (M0 Sandbox)
3. Create a database user (remember username/password)
4. In **Network Access**, add `0.0.0.0/0` to allow all IPs
5. Get your connection string: `mongodb+srv://user:pass@cluster.mongodb.net/slingshot_news`

---

## Step 3: Deploy Backend to Vercel

### 3.1 Create Vercel Account
Go to [vercel.com](https://vercel.com) and sign up with GitHub.

### 3.2 Import Backend
1. Click **Add New** → **Project**
2. Import your GitHub repository
3. Configure:
   - **Root Directory:** `backend`
   - **Framework Preset:** `Other`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3.3 Add Environment Variables
Click **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `mongodb+srv://...` (your MongoDB Atlas URL) |
| `JWT_SECRET` | `your_super_secure_secret_32_chars_min` |
| `JWT_REFRESH_SECRET` | `another_super_secure_secret_32_chars` |
| `NEWS_API_KEY` | `your_newsapi_key_here` |
| `NEWSDATA_API_KEY` | `your_newsdata_key_here` |
| `GROQ_API_KEY` | `your_groq_api_key_here` |
| `GROK_API_URL` | `http://localhost:6969/ask` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |

### 3.4 Deploy
Click **Deploy** and wait ~2 minutes.

You'll get a URL like: `https://slingshot-backend-xxx.vercel.app`

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Import Frontend
1. Click **Add New** → **Project** again
2. Import the SAME GitHub repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4.2 Add Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |
| `VITE_APP_NAME` | `Slingshot News` |
| `VITE_ENVIRONMENT` | `production` |

**⚠️ Replace `your-backend.vercel.app` with your actual backend URL from Step 3!**

### 4.3 Deploy
Click **Deploy** and wait ~1 minute.

---

## Step 5: Update Backend CORS

Go back to your **Backend project** in Vercel:
1. Go to **Settings** → **Environment Variables**
2. Update these with your frontend URL:
   - `FRONTEND_URL` = `https://slingshot-news-xxx.vercel.app`
   - `CORS_ORIGIN` = `https://slingshot-news-xxx.vercel.app`
3. **Redeploy** the backend (Deployments → click on latest → Redeploy)

---

## 🎉 You're Live!

Your app is now live at:
- **Frontend:** `https://slingshot-news-xxx.vercel.app`
- **Backend API:** `https://slingshot-backend-xxx.vercel.app`
- **API Docs:** `https://slingshot-backend-xxx.vercel.app/api-docs`

---

## 📱 Custom Domain (Optional)

1. Go to your project → **Settings** → **Domains**
2. Add your custom domain (e.g., `slingshotnews.com`)
3. Follow the DNS setup instructions

---

## ⚠️ Vercel Free Tier Limits

| Feature | Limit |
|---------|-------|
| Bandwidth | 100 GB/month |
| Serverless Function Duration | 10 seconds |
| Serverless Invocations | 100,000/month |
| Builds | 6,000 minutes/month |

This is plenty for a news app!

---

## 🔧 Troubleshooting

### "Function invocation timeout"
- Vercel serverless has a 10-second limit on free tier
- The news sync takes time, so use Vercel Cron Jobs instead

### "CORS error"
- Make sure `CORS_ORIGIN` matches your frontend URL exactly
- Include `https://` in the URL

### "Database connection error"
- Check MongoDB Atlas network access (whitelist `0.0.0.0/0`)
- Verify your connection string is correct

### "Build failed"
- Check the build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`

---

## 🔄 Automatic Deployments

Every time you push to GitHub, Vercel automatically:
1. Detects the changes
2. Builds your project
3. Deploys to production

No manual deployments needed!

---

## 🚀 That's It!

Your Slingshot News app is now live on Vercel with:
- ✅ Frontend (React/Vite)
- ✅ Backend API (Express.js as serverless)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deployments from Git
