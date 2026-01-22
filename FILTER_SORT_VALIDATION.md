# Filtering, Sorting & Validation Documentation

## Overview
Comprehensive filtering, sorting, and validation system for Slingshot News with backend API support and beautiful frontend UI components.

## Backend Implementation

### 1. Enhanced Filtering

**Endpoint**: `GET /api/v1/news/feed`

**Query Parameters**:
```typescript
{
    // Filtering
    category?: 'all' | 'tech' | 'money' | 'world' | 'politics' | 'science' | 'health';
    region?: string;
    dateFrom?: string;  // ISO date
    dateTo?: string;    // ISO date
    minViews?: number;
    minBookmarks?: number;
    
    // Sorting
    sort?: 'publishedAt' | 'views' | 'bookmarks' | 'createdAt' | 'trendingScore';
    order?: 'asc' | 'desc';
    
    // Pagination
    cursor?: string;
    limit?: number;
}
```

**Example Requests**:
```bash
# Filter by category and sort by views
GET /api/v1/news/feed?category=tech&sort=views&order=desc

# Filter by date range
GET /api/v1/news/feed?dateFrom=2024-01-01&dateTo=2024-01-31

# Filter by minimum engagement
GET /api/v1/news/feed?minViews=100&minBookmarks=10

# Combined filters
GET /api/v1/news/feed?category=tech&sort=bookmarks&order=desc&minViews=50
```

**Response**:
```json
{
    "success": true,
    "message": "feed fetched successfully 🔥",
    "data": {
        "articles": [...],
        "nextCursor": "...",
        "hasMore": true,
        "filters": {
            "category": "tech",
            "region": "all",
            "sort": "views",
            "order": "desc"
        }
    }
}
```

### 2. Sorting Implementation

**Whitelisted Sort Fields**:
- `publishedAt` (default) - Newest articles first
- `views` - Most viewed articles
- `bookmarks` - Most saved articles
- `createdAt` - Creation date
- `trendingScore` - Trending algorithm score

**Sort Order**:
- `desc` (default) - Descending order
- `asc` - Ascending order

**Security**: Only whitelisted fields can be used for sorting to prevent NoSQL injection.

### 3. Validation with Zod

**Location**: `backend/src/validators/schemas.ts`

**Available Schemas**:

#### User Registration
```typescript
{
    email: string (email format, 5-255 chars)
    password: string (8-128 chars, uppercase, lowercase, number, special char)
    username: string (3-30 chars, alphanumeric + underscore)
    dateOfBirth: string (must be 13+ years old)
}
```

#### Profile Update
```typescript
{
    displayName?: string (2-50 chars)
    bio?: string (max 500 chars)
    phone?: string (valid phone format)
    location?: {
        city?: string (max 100 chars)
        country?: string (max 100 chars)
    }
    socialLinks?: {
        twitter?: string (valid URL)
        instagram?: string (valid URL)
        website?: string (valid URL)
    }
}
```

#### Feed Query
```typescript
{
    category?: enum
    region?: string
    cursor?: string
    limit?: number (max 50)
    sort?: enum
    order?: enum
    dateFrom?: string
    dateTo?: string
    minViews?: number (non-negative)
    minBookmarks?: number (non-negative)
}
```

#### Search Query
```typescript
{
    q: string (2-200 chars)
    category?: enum
    page?: number (positive integer)
    limit?: number (max 100)
}
```

**Validation Middleware**:
```typescript
import { validate } from '../middlewares/validation.middleware';
import { userRegistrationSchema } from '../validators/schemas';

router.post('/signup', validate(userRegistrationSchema, 'body'), authController.signup);
```

**Error Response Format**:
```json
{
    "success": false,
    "message": "validation failed 💀",
    "errors": [
        {
            "field": "email",
            "message": "invalid email address"
        },
        {
            "field": "password",
            "message": "password must contain at least one uppercase letter"
        }
    ]
}
```

## Frontend Implementation

### 1. FilterSortPanel Component

**Location**: `frontend/src/components/common/FilterSortPanel.tsx`

**Features**:
- ✅ Tabbed interface (Filter / Sort)
- ✅ Category filtering with emoji icons
- ✅ Sort field selection
- ✅ Sort order toggle (ascending/descending)
- ✅ Active filter count badge
- ✅ Active filter chips
- ✅ Clear all filters button
- ✅ Smooth animations
- ✅ Slingshot aesthetic (pink/blue accents)

**Props**:
```typescript
interface FilterSortPanelProps {
    filters: {
        category: Category;
        region: string;
        dateFrom?: string;
        dateTo?: string;
        minViews?: number;
        minBookmarks?: number;
    };
    sort: {
        field: SortField;
        order: SortOrder;
    };
    onFilterChange: (filters: FilterOptions) => void;
    onSortChange: (sort: SortOptions) => void;
    onClear: () => void;
    className?: string;
}
```

**Usage Example**:
```tsx
import { FilterSortPanel } from '../components/common/FilterSortPanel';

function MyFeed() {
    const [filters, setFilters] = useState({
        category: 'all',
        region: 'all'
    });
    
    const [sort, setSort] = useState({
        field: 'publishedAt',
        order: 'desc'
    });
    
    return (
        <FilterSortPanel
            filters={filters}
            sort={sort}
            onFilterChange={setFilters}
            onSortChange={setSort}
            onClear={() => {
                setFilters({ category: 'all', region: 'all' });
                setSort({ field: 'publishedAt', order: 'desc' });
            }}
        />
    );
}
```

### 2. UI Components

**Filter Button**:
- Shows active filter count badge
- Pink accent when filters active
- Smooth hover transitions

**Sort Button**:
- Blue accent when non-default sort
- Shows current sort direction (↑ ↓)

**Filter Chips**:
- Display active filters below panel
- Click X to remove individual filter
- Animated appearance/disappearance

**Panel Design**:
- Dark background (zinc-900)
- Glassmorphism effect
- Smooth slide-down animation
- Category grid (2 columns)
- Sort list (stacked)

### 3. URL Persistence

**Format**:
```
/feed?category=tech&sort=views&order=desc&page=1
```

**Implementation** (for SavedPage):
```typescript
// Update URL when filters change
const updateUrlParams = (params) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all') {
            url.searchParams.set(key, value.toString());
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url.toString());
};

// Read URL on mount
const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get('category') || 'all',
        sort: params.get('sort') || 'publishedAt',
        order: params.get('order') || 'desc'
    };
};
```

## Validation Features

### Backend Validation

**Middleware Chain**:
```typescript
router.post('/signup',
    sanitize,                                    // Remove dangerous input
    validate(userRegistrationSchema, 'body'),   // Validate schema
    authController.signup                        // Handle request
);
```

**Multiple Source Validation**:
```typescript
import { validateMultiple } from '../middlewares/validation.middleware';

router.get('/articles',
    validateMultiple({
        query: feedQuerySchema,
        params: articleParamsSchema
    }),
    newsController.getFeed
);
```

**Sanitization**:
- Removes `<script>` tags
- Removes `javascript:` protocol
- Removes event handlers (`onclick`, etc.)
- Trims whitespace

### Frontend Validation (Future Enhancement)

**React Hook Form + Zod**:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')} />
            {errors.email && <span>{errors.email.message}</span>}
        </form>
    );
}
```

## Security Features

### 1. Input Sanitization
- XSS prevention
- Script tag removal
- Event handler removal

### 2. Validation Whitelist
- Only allowed sort fields accepted
- Enum validation for categories
- Max limits on pagination

### 3. Type Safety
- Zod runtime validation
- TypeScript compile-time types
- Consistent error formats

## Performance Optimizations

### 1. Database Indexing
```typescript
// Ensure indexes exist for filtered/sorted fields
NewsArticleSchema.index({ category: 1, publishedAt: -1 });
NewsArticleSchema.index({ views: -1 });
NewsArticleSchema.index({ bookmarks: -1 });
NewsArticleSchema.index({ trendingScore: -1 });
```

### 2. Query Optimization
- Only fetch required fields
- Use cursor pagination for infinite scroll
- Limit maximum results per request

### 3. Frontend Caching
- Cache filter/sort preferences in localStorage
- Debounce filter changes
- Optimistic UI updates

## Testing Checklist

### Backend
- [ ] Filter by each category
- [ ] Filter by date range
- [ ] Filter by minimum views/bookmarks
- [ ] Sort by each field (asc/desc)
- [ ] Combined filters work correctly
- [ ] Invalid sort fields rejected
- [ ] Validation errors formatted correctly
- [ ] Sanitization removes dangerous input

### Frontend
- [ ] Filter panel opens/closes smoothly
- [ ] Active filter count updates
- [ ] Filter chips display correctly
- [ ] Clear filters button works
- [ ] Sort order toggles correctly
- [ ] URL updates with filters
- [ ] Browser back/forward works
- [ ] Mobile responsive

## Files Created/Modified

### Backend
- `backend/src/controllers/news.controller.ts` - Enhanced getFeed with filtering/sorting
- `backend/src/validators/schemas.ts` - Zod validation schemas
- `backend/src/middlewares/validation.middleware.ts` - Validation middleware

### Frontend
- `frontend/src/components/common/FilterSortPanel.tsx` - Filter/Sort UI component

### Documentation
- `FILTER_SORT_VALIDATION.md` - This file

## Future Enhancements

- [ ] Saved filter presets
- [ ] Advanced date picker UI
- [ ] Range sliders for views/bookmarks
- [ ] Multi-select categories
- [ ] Custom filter combinations
- [ ] Filter analytics (most used filters)
- [ ] A/B testing different default sorts

## License

Part of Slingshot News open-source project.
