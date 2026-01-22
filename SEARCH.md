# Search Implementation Documentation

## Overview
Comprehensive search functionality for Slingshot News with full-text search, category filtering, pagination, and recent searches.

## Backend Implementation

### MongoDB Text Index
Added to `NewsArticle` model for full-text search:

```typescript
NewsArticleSchema.index({ 
    headline: 'text', 
    tldr: 'text', 
    summary: 'text',
    originalHeadline: 'text'
});
```

### Search API Endpoint
**Route**: `GET /api/v1/news/search`

**Query Parameters**:
- `q` (required): Search query (minimum 2 characters)
- `category` (optional): Filter by category (tech, money, world, politics, science, health)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "message": "found 42 results for \"AI\" 🔍",
  "data": {
    "articles": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3,
      "hasMore": true
    },
    "query": "AI"
  }
}
```

**Features**:
- ✅ Full-text search using MongoDB `$text` operator
- ✅ Relevance scoring with `$meta: 'textScore'`
- ✅ Category filtering
- ✅ Pagination support
- ✅ Minimum 2 character validation
- ✅ Maximum 100 results per page

## Frontend Implementation

### Components Created

#### 1. SearchBar Component
**Location**: `frontend/src/components/common/SearchBar.tsx`

**Features**:
- ✅ Debounced search (300ms delay)
- ✅ Minimum character validation (2 chars)
- ✅ Loading indicator while searching
- ✅ Clear button (X icon)
- ✅ Recent searches dropdown
- ✅ Recent searches stored in localStorage
- ✅ Animated suggestions
- ✅ Auto-focus support

**Props**:
```typescript
interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    minLength?: number;
    debounceMs?: number;
    showRecentSearches?: boolean;
    className?: string;
}
```

**Usage**:
```tsx
<SearchBar 
    onSearch={handleSearch}
    showRecentSearches={true}
    minLength={2}
    debounceMs={300}
/>
```

#### 2. SearchPage Component
**Location**: `frontend/src/pages/SearchPage.tsx`

**Features**:
- ✅ Full search interface
- ✅ Category filtering
- ✅ Pagination with page numbers
- ✅ Text highlighting in results
- ✅ Loading states
- ✅ Empty states (initial & no results)
- ✅ Result count display
- ✅ Responsive design

**States**:
- **Initial**: Shows search prompt
- **Loading**: Spinner animation
- **Results**: List of matching articles with highlights
- **No Results**: Helpful message with suggestions

### Navigation Integration

Added to `App.tsx`:
- Search icon button in header
- `showSearch` state
- SearchPage routing
- Conditional header visibility

## Features Implemented

### ✅ Backend
- [x] MongoDB text index on headline, tldr, summary
- [x] GET /api/v1/news/search endpoint
- [x] Text search validation (min 2 chars)
- [x] Category filtering
- [x] Pagination support
- [x] Relevance scoring
- [x] Max results limit (100)

### ✅ Frontend
- [x] SearchBar component with debouncing
- [x] Clear search button (X icon)
- [x] Loading indicator
- [x] Minimum character hint
- [x] Recent searches (localStorage)
- [x] Recent searches dropdown
- [x] SearchPage with full UI
- [x] Text highlighting in results
- [x] Category filter toggle
- [x] Pagination controls
- [x] Result count display
- [x] Empty state for no results
- [x] Initial state prompt

## Text Highlighting

Implemented in `SearchPage`:

```typescript
const highlightText = (text: string, search: string) => {
    if (!search) return text;
    
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, idx) => 
        part.toLowerCase() === search.toLowerCase() ? (
            <mark className="bg-accent-yellow/30 text-white px-0.5 rounded">
                {part}
            </mark>
        ) : part
    );
};
```

Highlights matching text in:
- Article headlines
- TLDR summaries

## Recent Searches

**Storage**: localStorage (`slingshot_recent_searches`)
**Limit**: 5 most recent searches
**Features**:
- Automatically saves successful searches
- Click to re-search
- Clear all button
- Persists across sessions

## User Experience

### Search Flow
1. User clicks search icon in header
2. SearchPage opens with search bar focused
3. User types query (min 2 chars)
4. Debounced search triggers after 300ms
5. Results appear with highlighted text
6. User can filter by category
7. Pagination available for many results

### Empty States

**Initial State**:
```
🔍
search slingshot news
find articles by keyword, topic, or category 🔍
```

**No Results**:
```
🔍
no results found
try different keywords or check your spelling
```

## Performance Optimizations

- **Debouncing**: 300ms delay prevents excessive API calls
- **Text Index**: MongoDB text index for fast searches
- **Pagination**: Limits results to 20 per page
- **Relevance Sorting**: Most relevant results first
- **localStorage**: Recent searches cached locally

## Accessibility

- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ ARIA labels on pagination
- ✅ Clear visual feedback
- ✅ Loading states
- ✅ Error messages

## Mobile Responsive

- ✅ Touch-friendly buttons
- ✅ Scrollable category filters
- ✅ Responsive layout
- ✅ Mobile-optimized search bar

## Testing Checklist

- [ ] Search with 1 character (should show hint)
- [ ] Search with 2+ characters (should trigger search)
- [ ] Clear button works
- [ ] Recent searches save and load
- [ ] Category filtering works
- [ ] Pagination works
- [ ] Text highlighting appears
- [ ] Empty states display correctly
- [ ] Loading states show
- [ ] Back button returns to feed
- [ ] Mobile responsive

## API Examples

### Basic Search
```
GET /api/v1/news/search?q=AI
```

### Search with Category
```
GET /api/v1/news/search?q=climate&category=science
```

### Search with Pagination
```
GET /api/v1/news/search?q=tech&page=2&limit=20
```

## Future Enhancements

- [ ] Search suggestions/autocomplete
- [ ] Search history analytics
- [ ] Advanced filters (date range, source)
- [ ] Save search queries
- [ ] Search result export
- [ ] Voice search
- [ ] Search shortcuts (keyboard)

## Files Modified/Created

### Backend
- `backend/src/models/NewsArticle.ts` - Added text index
- `backend/src/controllers/news.controller.ts` - Added searchArticles method
- `backend/src/routes/news.routes.ts` - Added /search route

### Frontend
- `frontend/src/components/common/SearchBar.tsx` - Created
- `frontend/src/pages/SearchPage.tsx` - Created
- `frontend/src/App.tsx` - Added search navigation

## Dependencies

No new dependencies required! Uses existing:
- MongoDB text search (built-in)
- React hooks (built-in)
- framer-motion (already installed)
- lucide-react (already installed)

## License

Part of Slingshot News open-source project.
