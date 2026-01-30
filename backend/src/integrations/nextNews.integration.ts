import axios from 'axios';

const BASE_URL = 'https://riad-news-api.vercel.app/api/news';

export interface NextNewsArticle {
    source: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
}

export interface NextNewsResponse {
    status: 'success' | 'error';
    data?: NextNewsArticle[];
    message?: string;
}

// Available news sources with their short codes
export const NEWS_SOURCES = {
    // US Sources
    'US-FN': 'Fox News',
    'US-CNN': 'CNN',
    'US-ABC': 'ABC News',
    'US-NBC': 'NBC News',
    'US-CBS': 'CBS News',
    'US-NYT': 'New York Times',
    'US-WP': 'Washington Post',
    'US-USA': 'USA Today',
    'US-WSJ': 'Wall Street Journal',

    // UK Sources
    'UK-BBC': 'BBC News',
    'UK-TG': 'The Guardian',
    'UK-DM': 'Daily Mail',
    'UK-SKY': 'Sky News',

    // International
    'INTER-AJ': 'Al Jazeera',
    'INTER-RT': 'Reuters',
    'INTER-AP': 'Associated Press',

    // Tech & Business
    'US-TC': 'TechCrunch',
    'US-VB': 'VentureBeat',
    'US-W': 'Wired',
    'US-V': 'The Verge',
};

export const CATEGORIES = {
    general: ['US-CNN', 'US-ABC', 'UK-BBC', 'INTER-RT'],
    tech: ['US-TC', 'US-VB', 'US-W', 'US-V'],
    business: ['US-WSJ', 'INTER-RT', 'US-W'],
    politics: ['US-CNN', 'US-FN', 'UK-BBC', 'UK-TG'],
    entertainment: ['US-ABC', 'US-NBC'],
    world: ['UK-BBC', 'INTER-AJ', 'INTER-RT', 'UK-TG'],
};

/**
 * Fetch random news articles from Next News API
 */
export const fetchRandomNews = async (): Promise<NextNewsArticle[]> => {
    try {
        const response = await axios.get<NextNewsResponse>(BASE_URL, {
            timeout: 10000,
        });

        if (response.data.status === 'success' && response.data.data) {
            console.log(`✅ Fetched ${response.data.data.length} articles from Next News API`);
            return response.data.data;
        }

        console.warn('⚠️ Next News API returned no data');
        return [];
    } catch (error) {
        const err = error as any;
        console.error('❌ Next News API Error:', err.message);
        return [];
    }
};

/**
 * Fetch news from a specific source
 */
export const fetchNewsBySource = async (sourceCode: string): Promise<NextNewsArticle[]> => {
    try {
        const response = await axios.get<NextNewsResponse>(`${BASE_URL}/source`, {
            params: { code: sourceCode },
            timeout: 10000,
        });

        if (response.data.status === 'success' && response.data.data) {
            console.log(`✅ Fetched ${response.data.data.length} articles from ${NEWS_SOURCES[sourceCode as keyof typeof NEWS_SOURCES] || sourceCode}`);
            return response.data.data;
        }

        console.warn(`⚠️ Next News API returned no data for source: ${sourceCode}`);
        return [];
    } catch (error) {
        const err = error as any;
        console.error(`❌ Next News API Error for ${sourceCode}:`, err.message);
        return [];
    }
};

/**
 * Fetch news from multiple sources
 */
export const fetchNewsFromMultipleSources = async (sourceCodes: string[]): Promise<NextNewsArticle[]> => {
    const promises = sourceCodes.map(code => fetchNewsBySource(code));
    const results = await Promise.allSettled(promises);

    const allArticles: NextNewsArticle[] = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
        }
    });

    // Remove duplicates based on title
    const uniqueArticles = allArticles.filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
    );

    console.log(`✅ Fetched ${uniqueArticles.length} unique articles from ${sourceCodes.length} sources`);
    return uniqueArticles;
};

/**
 * Fetch news by category
 */
export const fetchNewsByCategory = async (category: keyof typeof CATEGORIES): Promise<NextNewsArticle[]> => {
    const sources = CATEGORIES[category];
    if (!sources || sources.length === 0) {
        console.warn(`⚠️ No sources found for category: ${category}`);
        return [];
    }

    return fetchNewsFromMultipleSources(sources);
};

/**
 * Fetch diverse news from all categories
 */
export const fetchDiverseNews = async (articlesPerCategory: number = 5): Promise<NextNewsArticle[]> => {
    const categories = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];
    const allArticles: NextNewsArticle[] = [];

    for (const category of categories) {
        const sources = CATEGORIES[category];
        const selectedSources = sources.slice(0, Math.ceil(articlesPerCategory / 5));

        const articles = await fetchNewsFromMultipleSources(selectedSources);
        allArticles.push(...articles.slice(0, articlesPerCategory));
    }

    // Shuffle articles for variety
    const shuffled = allArticles.sort(() => Math.random() - 0.5);

    // Remove duplicates
    const uniqueArticles = shuffled.filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
    );

    console.log(`🎲 Fetched ${uniqueArticles.length} diverse articles across all categories`);
    return uniqueArticles;
};

/**
 * Convert Next News article to our internal format
 */
export const convertToInternalFormat = (article: NextNewsArticle, category: string = 'general', region: string = 'global') => {
    return {
        sourceId: generateArticleId(article.link),
        source: article.source,
        sourceUrl: article.link,
        originalHeadline: article.title,
        originalSummary: article.description || article.title,
        imageUrl: undefined, // Next News API doesn't provide images
        publishedAt: parsePublishDate(article.pubDate),
        category,
        region,
        tone: 'formal' as const,
        isTranslated: false,
    };
};

/**
 * Generate a unique ID from URL
 */
const generateArticleId = (url: string): string => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
};

/**
 * Parse various date formats from RSS feeds
 */
const parsePublishDate = (dateStr: string): Date => {
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch (error) {
        console.warn(`⚠️ Failed to parse date: ${dateStr}`);
    }
    return new Date(); // Fallback to current date
};

export const nextNewsIntegration = {
    fetchRandomNews,
    fetchNewsBySource,
    fetchNewsFromMultipleSources,
    fetchNewsByCategory,
    fetchDiverseNews,
    convertToInternalFormat,
    NEWS_SOURCES,
    CATEGORIES,
};
