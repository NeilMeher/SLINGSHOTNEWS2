# 🚨 IMMEDIATE FIX - GET FRESH NEWS NOW!

## The Problem
The backend has the viral news code but needs to restart to:
1. Load the new routes
2. Run a fresh sync with viral keywords
3. Translate the new articles

---

## ✅ QUICK FIX (2 steps)

### Step 1: Restart Backend

**In the backend terminal**, press:
```
Ctrl + C
```

Then restart:
```powershell
npm run dev
```

### Step 2: Trigger Manual Sync

Once backend is running, open your browser and go to:
```
http://localhost:5000/api/v1/manual/sync
```

Or run this in PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/manual/sync" -Method POST
```

**This will**:
- ✅ Fetch fresh VIRAL news (Elon, Trump, TikTok, etc.)
- ✅ Translate 30 articles immediately
- ✅ Take ~1-2 minutes

### Step 3: Refresh Your Feed

After manual sync completes:
1. Refresh your browser
2. Pull down to refresh feed
3. You should see NEW viral articles!

---

## 🎯 WHAT THIS DOES

The manual sync endpoint (`/api/v1/manual/sync`) will:

1. **Fetch viral news** with these keywords:
   - Tech: Elon Musk, AI, ChatGPT, Tesla, TikTok
   - Money: Crypto crash, Bitcoin, stock market
   - Politics: Trump, scandal, election
   - And more!

2. **Score by addictiveness**:
   - Elon/Trump: +10 pts
   - Scandal/Drama: +8 pts
   - TikTok/Twitter: +6 pts
   - Crypto/Money: +5 pts

3. **Translate immediately**:
   - Gen Z style
   - "no cap", "fr fr", "cooked"
   - All lowercase
   - Emoji spam 💀

---

## ⏰ TIMELINE

- **Now**: Restart backend (30 seconds)
- **+1 min**: Call manual sync endpoint
- **+2-3 min**: Sync + translation completes
- **+3 min**: Refresh feed = NEW VIRAL NEWS! 🔥

---

## 🔥 AFTER THIS YOU'LL SEE

Instead of boring news:
- ❌ "Government releases report"
- ❌ "Company announces product"

You'll get VIRAL stuff like:
- ✅ "the way that elon just fired everyone fr fr 💀"
- ✅ "tiktok is lowkey getting banned and it's cooked rn"
- ✅ "crypto just crashed no cap billions gone 💸"

---

## 📝 EXACT STEPS

1. **Restart backend**:
   ```
   Ctrl + C in backend terminal
   npm run dev
   ```

2. **Wait for "Server running"**

3. **Open browser, go to**:
   ```
   http://localhost:5000/api/v1/manual/sync
   ```
   (Just paste in address bar and press Enter)

4. **Wait 1-2 minutes** (you'll see JSON response when done)

5. **Refresh your news feed**

6. **VIRAL NEWS!** 🔥

---

## 🎉 RESULT

After this you'll have:
- ✅ Fresh viral/trending news
- ✅ Gen Z translated
- ✅ Sorted by addictiveness
- ✅ Ultra recent (< 3 hours old gets priority)

**DO THIS NOW and you'll see the difference immediately!** 🚀

---

**Quick summary**:
1. Restart backend (`Ctrl+C` then `npm run dev`)
2. Visit: `http://localhost:5000/api/v1/manual/sync`
3. Wait 2 min
4. Refresh feed
5. FIRE content! 🔥
