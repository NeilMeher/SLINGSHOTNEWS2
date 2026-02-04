# 📱 Building Slingshot News APK

This guide explains how to build the Android APK for Slingshot News.

## 🚀 Quick Start (Recommended: GitHub Actions)

### Step 1: Deploy Your Backend First
Before building the APK, you need your backend deployed so the app can connect to it.

**Deploy to Render (Free):**
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add Environment Variables (from your `.env` file):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEWSDATA_API_KEY`
   - `GROQ_API_KEY`
   - etc.
6. Deploy and copy your URL (e.g., `https://slingshot-news-api.onrender.com`)

### Step 2: Configure GitHub Secrets
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add: `BACKEND_API_URL` = `https://your-backend-url.onrender.com/api`

### Step 3: Trigger the Build
**Option A: Push to main/master branch**
```bash
git add .
git commit -m "Build APK"
git push origin main
```

**Option B: Manual trigger**
1. Go to GitHub repo → Actions tab
2. Click "Build Android APK"
3. Click "Run workflow"

### Step 4: Download Your APK
1. Go to GitHub repo → Actions tab
2. Click on the completed workflow run
3. Scroll down to "Artifacts"
4. Download `slingshot-news-debug` or `slingshot-news-release`

---

## 📦 APK Types

| Type | File | Use Case |
|------|------|----------|
| **Debug** | `app-debug.apk` | Testing, development |
| **Release** | `app-release-unsigned.apk` | Distribution (needs signing for Play Store) |

---

## 🏪 Publishing to Play Store (Optional)

To publish to Google Play Store, you need to sign the release APK:

### 1. Generate a Keystore
```bash
keytool -genkey -v -keystore slingshot-news.keystore -alias slingshot -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Add Signing Config to GitHub Secrets
- `KEYSTORE_BASE64`: Base64-encoded keystore file
- `KEYSTORE_PASSWORD`: Your keystore password
- `KEY_ALIAS`: `slingshot`
- `KEY_PASSWORD`: Your key password

### 3. Update the workflow to sign the APK

---

## 🔧 Local Build (Alternative)

If you prefer to build locally, you need:

1. **Install Android Studio** from [developer.android.com/studio](https://developer.android.com/studio)
2. **Set ANDROID_HOME** environment variable
3. **Run these commands:**

```bash
cd frontend
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK will be at: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🌐 Backend Deployment Options

| Platform | Free Tier | URL Pattern |
|----------|-----------|-------------|
| **Render** | 750 hours/month | `https://app-name.onrender.com` |
| **Railway** | $5 credit/month | `https://app-name.up.railway.app` |
| **Fly.io** | 3 VMs free | `https://app-name.fly.dev` |

---

## ❓ Troubleshooting

### APK crashes on startup
- Check that `BACKEND_API_URL` secret is set correctly
- Ensure backend is deployed and accessible

### Build fails
- Check GitHub Actions logs for specific errors
- Ensure all dependencies are committed

### App shows "Network Error"
- Backend might be sleeping (free tier spins down after inactivity)
- Wait 30 seconds for it to wake up

---

## 📁 Project Structure

```
SLINGSHOT NEWS 1/
├── frontend/                 # React app (becomes APK)
│   ├── android/             # Capacitor Android project
│   ├── capacitor.config.ts  # Capacitor configuration
│   └── dist/                # Built web assets
├── backend/                 # Node.js API server
├── landing-page/            # Download page (optional)
└── .github/workflows/       # GitHub Actions
    └── build-android.yml    # APK build workflow
```
