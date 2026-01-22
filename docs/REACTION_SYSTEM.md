# Gen Z Reaction System - Implementation Documentation

## Overview

The reaction system allows users to react to news articles with Gen Z-style reactions:
- **🔥 W (win)** - Good news, impressive
- **😐 mid** - Mediocre, meh, nothing special
- **💀 cooked** - Bad situation, things went wrong
- **🧢 cap** - Fake news, suspicious, not believable

## Backend Implementation

### Models

#### Reaction Model (`backend/src/models/Reaction.ts`)
```typescript
interface IReaction {
    userId: ObjectId;
    articleId: ObjectId;
    type: 'w' | 'mid' | 'cooked' | 'cap';
    createdAt: Date;
}
```

#### NewsArticle Model - Reactions Field
```typescript
reactions: {
    w: number;
    mid: number;
    cooked: number;
    cap: number;
}
```

### API Endpoints

#### POST `/api/v1/articles/:articleId/react`
Toggle reaction on an article (create/update/remove).

**Request Body:**
```json
{
    "type": "w" | "mid" | "cooked" | "cap"
}
```

**Response:**
```json
{
    "success": true,
    "message": "vibe recorded successfully! 🔥",
    "data": {
        "created": true,  // or "updated", "removed"
        "type": "w",
        "reactions": { "w": 15, "mid": 3, "cooked": 1, "cap": 0 },
        "userReaction": "w"
    }
}
```

#### DELETE `/api/v1/articles/:articleId/react`
Remove user's reaction from an article.

#### GET `/api/v1/articles/:articleId/reactions`
Get reaction breakdown for an article.

**Response:**
```json
{
    "success": true,
    "data": {
        "reactions": { "w": 15, "mid": 3, "cooked": 1, "cap": 0 },
        "total": 19,
        "userReaction": "w"  // or null if not reacted
    }
}
```

#### GET `/api/v1/articles/leaderboard`
Get most W'd articles (reaction leaderboard).

**Query Parameters:**
- `limit` (default: 10) - Number of articles to return
- `period` ('day' | 'week' | 'month' | 'all', default: 'all')

**Response:**
```json
{
    "success": true,
    "data": {
        "period": "week",
        "articles": [
            {
                "rank": 1,
                "articleId": "...",
                "headline": "ai just passed the bar exam 💀",
                "emoji": "🤖",
                "category": "tech",
                "reactions": { "w": 150, "mid": 20, "cooked": 5, "cap": 3 },
                "totalReactions": 178,
                "wPercentage": 84
            }
        ]
    }
}
```

### Service Layer (`backend/src/services/reaction.service.ts`)

```typescript
class ReactionService {
    // Toggle reaction (create/update/remove)
    async toggleReaction(userId: string, articleId: string, type: ReactionType);
    
    // Remove a user's reaction
    async removeReaction(userId: string, articleId: string);
    
    // Get article reactions with user's reaction
    async getArticleReactions(articleId: string, userId?: string);
    
    // Get leaderboard of most W'd articles
    async getLeaderboard(limit: number, period: string);
    
    // Get user's reaction history
    async getUserReactions(userId: string, limit: number);
}
```

### Real-time Updates (Socket.io)

#### Server Setup (`backend/src/config/socket.ts`)
- Handles WebSocket connections for real-time reaction updates
- Supports article rooms for targeted updates
- Emits `reaction:update` events when reactions change

#### Socket Events

**Client → Server:**
- `article:join` - Join an article room for updates
- `article:leave` - Leave an article room
- `reaction:sent` - Notify others of a reaction

**Server → Client:**
- `reaction:update` - Updated reaction counts for an article
- `reaction:pulse` - Real-time emoji burst from other users

## Frontend Implementation

### Components

#### ReactionBar (`frontend/src/components/feed/ReactionBar.tsx`)
Enhanced reaction bar with:
- Animated emoji buttons with hover/tap effects
- Reaction counts with formatted numbers (1.2k, 2.5M)
- Active state highlighting with colored borders
- Floating emoji burst effect on reaction
- Confetti effect for 'W' reactions
- Haptic feedback on mobile devices
- Optimistic UI updates with rollback on error

**Props:**
```typescript
interface ReactionBarProps {
    articleId: string;
    initialReactions?: { w: number; mid: number; cooked: number; cap: number };
    initialUserReaction?: 'w' | 'mid' | 'cooked' | 'cap' | null;
    onReact: (type: ReactionType) => Promise<void>;
}
```

#### ReactionLeaderboard (`frontend/src/components/feed/ReactionLeaderboard.tsx`)
Leaderboard component showing:
- Most W'd articles ranked
- Time period filters (24h, 7 days, 30 days, all time)
- Animated progress bars showing W percentage
- Rank badges (👑🥈🥉) for top 3
- Reaction breakdown for each article

### Hooks

#### useSocket (`frontend/src/hooks/useSocket.ts`)
Custom hook for Socket.io connection:
- Manages WebSocket connection
- Provides functions to join/leave article rooms
- Handles real-time reaction updates
- Auto-reconnection with exponential backoff

## Installation

### Backend Dependencies
```bash
cd backend
npm install socket.io
```

### Frontend Dependencies
```bash
cd frontend
npm install socket.io-client
```

## Usage Example

### Frontend Usage
```tsx
import { ReactionBar } from './components/feed/ReactionBar';

function ArticleCard({ article }) {
    const handleReact = async (type: ReactionType) => {
        const result = await api.post(`/articles/${article._id}/react`, { type });
        // UI updates handled by ReactionBar optimistically
    };

    return (
        <div>
            <h1>{article.headline}</h1>
            <ReactionBar
                articleId={article._id}
                initialReactions={article.reactions}
                initialUserReaction={article.userReaction}
                onReact={handleReact}
            />
        </div>
    );
}
```

### Adding Leaderboard Page
```tsx
import { ReactionLeaderboard } from './components/feed/ReactionLeaderboard';

function LeaderboardPage() {
    const navigate = useNavigate();
    
    return (
        <ReactionLeaderboard 
            onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
        />
    );
}
```

## Features Implemented

✅ **Core Functionality**
- Toggle reactions (one per user per article)
- Synchronized reaction counts on article model
- User reaction tracking

✅ **API Endpoints**
- POST /api/v1/articles/:articleId/react (toggle)
- DELETE /api/v1/articles/:articleId/react (remove)
- GET /api/v1/articles/:articleId/reactions (get counts)
- GET /api/v1/articles/leaderboard (most W'd articles)

✅ **Real-time Updates**
- Socket.io integration
- Article room subscriptions
- Reaction pulse events

✅ **Frontend UX**
- Animated reaction feedback
- Confetti effect for W reactions
- Haptic feedback on mobile
- Optimistic UI updates
- Reaction leaderboard component

✅ **Quality Checks**
- Input validation
- Error handling with rollback
- Backward compatibility with legacy endpoints
