# 🚀 Slingshot News - Project Status

## ✅ System Status: OPERATIONAL

**Last Updated:** January 30, 2026

---

## 🏗️ Architecture Overview

### Grok API Wrapper (Python FastAPI)
- **Location:** `./Grok-Api`
- **Port:** 6969
- **Purpose:** FREE & UNLIMITED AI translation (Primary)
- **Model:** grok-3-fast (or grok-3-auto)

### Backend (Express.js + TypeScript)
- **Location:** `./backend`
- **Port:** 5000
- **Database:** MongoDB (Memory Server for development)
- **Features:**
  - RESTful API with versioning (`/api/v1/`)
  - JWT Authentication with refresh tokens
  - Real-time updates via Socket.IO
  - Swagger API documentation at `/api-docs`
  - Background jobs for news sync, translation, and trending updates

### Frontend (React + Vite + TypeScript)
- **Location:** `./frontend`
- **Port:** 3000 (or next available)
- **UI Framework:** Tailwind CSS
- **Animation:** Framer Motion
- **Features:**
  - Vertical swipe-based news feed (TikTok-style)
  - User authentication (signup/login)
  - Bookmarks and reactions
  - Profile management

---

## 🤖 AI Translation Priority

The system uses a **fallback strategy** for AI translations:

| Priority | Service | Status | Limits |
|----------|---------|--------|--------|
| 1st | **Grok API Wrapper** | Primary | FREE & Unlimited |
| 2nd | **Groq SDK** | Fallback | Rate Limited |

If the Grok API fails, the system automatically falls back to Groq SDK. The backend has a 60-second cooldown for the Grok API after failures to avoid excessive retries.

---

## 🔧 How to Run

### Quick Start (All Services)
Double-click `START_ALL.bat` to launch all three services at once!

### Manual Start

#### 1. Start Grok API Server (Primary Translation)
```bash
cd Grok-Api
pip install -r requirements.txt  # First time only
python api_server.py
```

#### 2. Start Backend
```bash
cd backend
npm install  # First time only
npm run dev
```

#### 3. Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```

### Access Points
- **Grok API:** http://localhost:6969
- **Frontend:** http://localhost:3000 (or next available port)
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/api/v1/health

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/check-username/:username` | Check username availability |

### News Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/news/feed` | Paginated news feed |
| GET | `/api/v1/news/unlimited` | Unlimited news feed (RSS-based) |
| GET | `/api/v1/news/trending` | Trending articles |
| GET | `/api/v1/news/search` | Search articles |
| GET | `/api/v1/news/:id` | Get single article |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update profile |
| PATCH | `/api/v1/users/me/avatar` | Update avatar |

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bookmarks` | Get user's bookmarks |
| POST | `/api/v1/articles/:articleId/bookmark` | Toggle bookmark |
| DELETE | `/api/v1/bookmarks/:articleId` | Remove bookmark |

### Reactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/articles/:articleId/react` | React to article |

---

## 🔑 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/slingshot_news
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NEWS_API_KEY=your_newsapi_key
NEWSDATA_API_KEY=your_newsdata_key
GROQ_API_KEY=your_groq_key
GROK_API_URL=http://localhost:6969/ask
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="Slingshot News"
VITE_ENVIRONMENT=development
```

---

## 📦 Project Structure

```
SLINGSHOT NEWS 1/
├── Grok-Api/                    # FREE Grok API Wrapper
│   ├── core/                    # Core Grok integration
│   ├── api_server.py            # FastAPI server
│   └── requirements.txt         # Python dependencies
├── backend/
│   ├── src/
│   │   ├── config/              # Database, env, socket, swagger config
│   │   ├── controllers/         # Route handlers
│   │   ├── integrations/        # External API integrations (RSS, Grok, Groq)
│   │   ├── jobs/                # Background cron jobs
│   │   ├── middlewares/         # Auth, rate limiting, error handling
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Helpers (JWT, validators, etc.)
│   │   └── index.ts             # App entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── START_ALL.bat                # Quick start script
└── PROJECT_STATUS.md            # This file
```

---

## ✅ Fixes Applied

1. **TypeScript Error Fixed:** 
   - `src/scripts/trigger-now.ts` - Fixed import of `newsAggregatorService` (was incorrectly named `newsAggregator`)

2. **Category Enum Fix:**
   - `src/models/NewsArticle.ts` - Added 'general' to the category enum to fix validation errors when RSS feeds return 'general' as category

3. **Grok API Integration:**
   - `src/integrations/groq.integration.ts` - Rewrote to use Grok API as primary with Groq SDK as fallback
   - Added cooldown mechanism to avoid excessive retries on Grok API failures

4. **Both Projects Compile Successfully:**
   - Backend: `npx tsc --noEmit` ✅
   - Frontend: `npx tsc --noEmit` ✅

---

## ⚠️ Known Limitations

1. **Grok API IP Restrictions:** The Grok API wrapper may fail with 500 errors if your IP is flagged. Use a proxy if needed.

2. **API Rate Limits:** NewsData.io free tier has rate limits. The app falls back to RSS feeds when rate limited.

3. **Memory Database:** Development uses MongoDB Memory Server - data resets on restart.

4. **Port Conflicts:** Frontend may use alternative ports if 3000-3001 are in use.

---

## 🎯 Features Working

- [x] User Registration & Login
- [x] JWT Authentication with Remember Me
- [x] Vertical swipeable news feed
- [x] Gen Z style article translations (via Grok/Groq)
- [x] RSS feed integration (unlimited, no rate limits)
- [x] Article reactions (W, Mid, Cooked, Cap)
- [x] Bookmark articles
- [x] User profile management
- [x] Email verification flow
- [x] Real-time updates via Socket.IO
- [x] Background news sync jobs
- [x] Trending calculations
- [x] Search functionality

---

## 🚀 Ready to Use!

The application is now fully operational with:
- **Grok API Wrapper** running on port 6969 (Primary Translation)
- **Backend** running on port 5000
- **Frontend** running on port 3000

Simply run `START_ALL.bat` to launch everything!
