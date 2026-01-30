# 🚀 Slingshot News

**News that actually hits different. fr fr. no cap.** 🔥

A modern, Gen Z-focused news aggregation app with Instagram-style UI, multi-source news feeds, and reaction-based engagement.

---

## ✨ Features

### 📰 Multi-Source News Aggregation
- Fetches from **5 different news sources**:
  - NewsData.io (NEW)
  - NewsAPI
  - BBC News
  - Reuters
  - Associated Press
- Smart deduplication
- Real-time updates
- Category-based filtering

### 🎨 Instagram-Style Explore
- 3-column grid layout
- Trending topics
- Visual category coding
- Smooth animations
- Gradient backgrounds
- Hover effects

### 📱 TikTok-Style Feed
- Vertical swipe scrolling
- Full-screen cards
- Infinite scroll
- Smooth transitions

### 💬 Engagement Features
- Reactions: W, Mid, Cooked, Cap
- Bookmark articles
- Share functionality
- Comment system (coming soon)

### 👤 User Features
- Onboarding flow
- Interest selection
- Region preferences
- Profile management
- Email verification

---

## 🎯 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Plus Jakarta Sans, Space Grotesk

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Auth**: JWT
- **API Integration**: Axios
- **AI**: Groq (Llama 3.1 70B)

### APIs Used
- NewsData.io (Latest addition)
- NewsAPI
- BBC News API
- Groq AI

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- API Keys (provided in `.env`)

### Installation

1. **Clone the repository**
   ```bash
   cd "C:\Users\neilm\OneDrive\Desktop\SLINGSHOT NEWS 1"
   ```

2. **Install Frontend Dependencies**
   ```powershell
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```powershell
   cd ../backend
   npm install
   ```

4. **Configure Environment Variables**
   - Backend `.env` is already configured
   - Frontend `.env` is already configured
   - See `.env.example` files for reference

5. **Fix MongoDB Connection**
   - Follow instructions in `MONGODB_FIX.md`
   - Whitelist your IP in MongoDB Atlas

6. **Start the Application**

   **Frontend** (Terminal 1):
   ```powershell
   cd frontend
   npm run dev
   ```
   Opens at: http://localhost:3000

   **Backend** (Terminal 2):
   ```powershell
   cd backend
   npm run dev
   ```
   Runs on: http://localhost:5000

---

## 📂 Project Structure

```
SLINGSHOT NEWS 1/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SearchPage.tsx (Instagram UI)
│   │   │   └── SavedPage.tsx
│   │   ├── components/
│   │   │   ├── feed/
│   │   │   ├── onboarding/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.css (Font config)
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── integrations/
│   │   │   ├── news.integration.ts
│   │   │   └── newsdata.integration.ts (NEW)
│   │   ├── services/
│   │   │   ├── newsAggregator.service.ts
│   │   │   ├── emailService.ts
│   │   │   ├── bookmark.service.ts
│   │   │   └── ...
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   └── package.json
│
├── QUICKSTART.md (Start here!)
├── SUMMARY.md (Full details)
├── IMPROVEMENTS.md (Changelog)
├── CHECKLIST.md (Testing guide)
└── MONGODB_FIX.md (Database setup)
```

---

## 🎨 Design System

### Colors
```css
Primary: #0791ed (Slingshot Blue)
Background: #000000 (Black)
Text: #ffffff (White)
Accent: #FF007A (Pink)
```

### Typography
```css
Primary: Plus Jakarta Sans (400-800)
Secondary: Space Grotesk (300-700)
```

### Category Colors
- 💻 Tech: Blue → Cyan
- 💰 Money: Green → Emerald
- 🌍 World: Purple → Pink
- 🏛️ Politics: Red → Orange
- 🔬 Science: Indigo → Blue
- 🏥 Health: Pink → Rose

---

## 🔑 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb+srv://...
JWT_SECRET=dev_secret_one_two_three
JWT_REFRESH_SECRET=dev_refresh_secret_one_two_three
NEWS_API_KEY=your_newsapi_key_here
NEWSDATA_API_KEY=your_newsdata_key_here
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="Slingshot News"
VITE_ENVIRONMENT=development
```

---

## 📱 Features in Detail

### 1. News Feed
- Full-screen vertical scrolling
- Real-time reaction counts
- Bookmark functionality
- Share articles
- Infinite scroll
- Loading states

### 2. Explore/Search (Instagram-Style)
- 3-column grid layout
- Trending topics section
- Category filter pills
- Visual grid with images/gradients
- Smooth animations
- Empty states

### 3. Saved Articles
- Advanced filtering
- Search functionality
- Pagination controls
- Export to JSON
- Remove individual/all
- Category filtering

### 4. User Management
- Onboarding flow
- Interest selection
- Region preferences
- Profile editing
- Email verification
- Settings panel

---

## 🧪 Testing

See `CHECKLIST.md` for comprehensive testing guide.

**Quick Test:**
1. Open http://localhost:3000
2. Create account
3. Complete onboarding
4. Swipe through feed
5. Click search icon
6. See Instagram grid
7. Bookmark articles
8. Go to saved page

---

## 📚 API Documentation

### News Endpoints
```
GET  /api/v1/news/feed          - Personalized feed
GET  /api/v1/news/trending      - Trending news
GET  /api/v1/news/search?q=...  - Search articles
```

### User Endpoints
```
POST /api/v1/auth/signup        - Create account
POST /api/v1/auth/login         - Login
GET  /api/v1/user/profile       - Get profile
PUT  /api/v1/user/profile       - Update profile
```

### Interaction Endpoints
```
POST   /api/v1/articles/:id/react     - Add reaction
POST   /api/v1/articles/:id/bookmark  - Toggle bookmark
GET    /api/v1/bookmarks               - Get saved articles
DELETE /api/v1/bookmarks/:id          - Remove bookmark
```

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy with Node.js 18+
```

### Environment Variables
- Set all `.env` variables in platform
- Update CORS settings
- Update `FRONTEND_URL` to production URL

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
See `MONGODB_FIX.md` for detailed fix

### Frontend Not Loading
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm run dev
```

### Backend Errors
```bash
# Check MongoDB connection
# Verify API keys
# Check console logs
```

---

## 📖 Documentation

- **Getting Started**: `QUICKSTART.md`
- **Full Summary**: `SUMMARY.md`
- **What Changed**: `IMPROVEMENTS.md`
- **Testing Guide**: `CHECKLIST.md`
- **MongoDB Fix**: `MONGODB_FIX.md`

---

## 🎯 Recent Updates (January 2026)

### Added
- ✅ NewsData.io integration (5th news source)
- ✅ Instagram-style search/explore page
- ✅ Enhanced email verification
- ✅ Consistent Plus Jakarta Sans fonts
- ✅ Code organization improvements

### Improved
- ✅ News freshness (multi-source)
- ✅ UI/UX polish
- ✅ Loading states
- ✅ Empty states
- ✅ Documentation

---

## 🤝 Contributing

This is a personal project, but feedback is welcome!

---

## 📄 License

Private project - All rights reserved

---

## 👤 Contact

For support or questions, please refer to the documentation files.

---

## ⭐ Credits

**Built with:**
- React & TypeScript
- Tailwind CSS
- Framer Motion
- MongoDB
- Express
- NewsData.io, NewsAPI
- Groq AI

**Design Inspiration:**
- Instagram (Grid layout)
- TikTok (Vertical feed)
- Gen Z aesthetic

---

## 🎉 Status

**Current Version**: v1.0.0 (January 2026)

**Status**: 
- ✅ Frontend: Running
- ⚠️ Backend: Needs MongoDB connection
- ✅ UI: Polished
- ✅ Code: Organized

**Next Steps**: Fix MongoDB connection (see `MONGODB_FIX.md`)

---

**Made with 🔥 for Gen Z news consumers**

*news that actually hits different. fr fr. no cap.* 🚀
