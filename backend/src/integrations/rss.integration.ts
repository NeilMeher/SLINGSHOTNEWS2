import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure']
    }
});

// Curated list of high-quality RSS feeds - OPTIMIZED FOR GEN Z INTEREST
export const RSS_FEEDS = {
    // General News (Mix of serious + viral)
    general: [
        { name: 'VICE', url: 'https://www.vice.com/en/rss', region: 'GLOBAL' },
        { name: 'BuzzFeed', url: 'https://www.buzzfeed.com/world.xml', region: 'US' },
        { name: 'Insider', url: 'https://www.insider.com/rss', region: 'US' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', region: 'US' },
        { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', region: 'UK' },
    ],

    // Tech & AI (Focus on hype)
    tech: [
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', region: 'US' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', region: 'US' },
        { name: 'Gizmodo', url: 'https://gizmodo.com/rss', region: 'US' },
        { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', region: 'US' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss', region: 'US' },
    ],

    // Money & Crypto
    money: [
        { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', region: 'GLOBAL' },
        { name: 'Business Insider', url: 'https://www.businessinsider.com/rss', region: 'US' },
        { name: 'Fortune', url: 'https://fortune.com/feed/', region: 'US' },
        { name: 'CNBC', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', region: 'US' },
    ],

    // World (Keep it real but impactful)
    world: [
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', region: 'GLOBAL' },
        { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', region: 'UK' },
        { name: 'Reuters', url: 'https://www.reutersagency.com/feed/', region: 'GLOBAL' },
    ],

    // Politics (Only the big stuff)
    politics: [
        { name: 'Politico', url: 'https://www.politico.com/rss/politics08.xml', region: 'US' },
        { name: 'The Hill', url: 'https://thehill.com/feed/', region: 'US' },
    ],

    // Science (Space & Future)
    science: [
        { name: 'Futurism', url: 'https://futurism.com/feed', region: 'GLOBAL' },
        { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', region: 'UK' },
        { name: 'PopSci', url: 'https://www.popsci.com/feed/', region: 'US' },
    ],

    // Health
    health: [
        { name: 'Health', url: 'https://www.health.com/feed', region: 'US' },
        { name: 'Medical News', url: 'https://www.medicalnewstoday.com/feed', region: 'GLOBAL' },
    ],
};

export interface RSSArticle {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    source: string;
    category: string;
    region: string;
    imageUrl?: string;
}

// Keywords to exclude (boring stuff)
const EXCLUDED_KEYWORDS = [
    'obituary', 'funeral', 'stock market report', 'weather forecast',
    'lottery', 'winning numbers', 'briefing', 'transcript', 'schedule',
    'correction', 'editor', 'letter to', 'opinion:', 'crossword'
];

/**
 * Fetch articles from a single RSS feed with Smart Filtering
 */
export const fetchFeed = async (feedUrl: string, source: string, category: string, region: string): Promise<RSSArticle[]> => {
    try {
        const feed = await parser.parseURL(feedUrl);

        const articles: RSSArticle[] = feed.items
            .filter(item => {
                const text = ((item.title || '') + ' ' + (item.contentSnippet || '')).toLowerCase();
                // Filter out boring stuff
                return !EXCLUDED_KEYWORDS.some(keyword => text.includes(keyword));
            })
            .slice(0, 20)
            .map(item => {
                // Try to extract image from various sources
                let imageUrl: string | undefined;

                if (item['media:content']) {
                    imageUrl = item['media:content'].$.url;
                } else if (item['media:thumbnail']) {
                    imageUrl = item['media:thumbnail'].$.url;
                } else if (item.enclosure && item.enclosure.url) {
                    imageUrl = item.enclosure.url;
                }

                return {
                    title: item.title || 'Untitled',
                    link: item.link || '',
                    description: item.contentSnippet || item.content || item.title || '',
                    pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                    source,
                    category,
                    region,
                    imageUrl
                };
            });

        console.log(`✅ Fetched ${articles.length} filtered articles from ${source}`);
        return articles;
    } catch (error) {
        const err = error as any;
        console.error(`❌ Error fetching RSS feed from ${source}:`, err.message);
        return [];
    }
};

/**
 * Fetch articles from multiple RSS feeds
 */
export const fetchMultipleFeeds = async (
    feeds: Array<{ name: string; url: string; region: string }>,
    category: string,
    articlesPerFeed: number = 10
): Promise<RSSArticle[]> => {
    const promises = feeds.map(feed => fetchFeed(feed.url, feed.name, category, feed.region));
    const results = await Promise.allSettled(promises);

    const allArticles: RSSArticle[] = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value.slice(0, articlesPerFeed));
        }
    });

    // Remove duplicates based on title
    const uniqueArticles = allArticles.filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
    );

    console.log(`✅ Fetched ${uniqueArticles.length} unique articles from ${feeds.length} feeds`);
    return uniqueArticles;
};

/**
 * Fetch articles by category
 */
export const fetchByCategory = async (category: keyof typeof RSS_FEEDS, articlesPerFeed: number = 10): Promise<RSSArticle[]> => {
    const feeds = RSS_FEEDS[category];
    if (!feeds || feeds.length === 0) {
        console.warn(`⚠️ No RSS feeds found for category: ${category}`);
        return [];
    }

    return fetchMultipleFeeds(feeds, category, articlesPerFeed);
};

/**
 * Fetch diverse articles from all categories (UNLIMITED!)
 */
export const fetchDiverseRSS = async (articlesPerCategory: number = 5): Promise<RSSArticle[]> => {
    const categories = Object.keys(RSS_FEEDS) as (keyof typeof RSS_FEEDS)[];
    const allArticles: RSSArticle[] = [];

    // Fetch from each category in parallel
    const promises = categories.map(cat => fetchByCategory(cat, articlesPerCategory));
    const results = await Promise.allSettled(promises);

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
        }
    });

    // Shuffle for variety
    const shuffled = allArticles.sort(() => Math.random() - 0.5);

    // Remove duplicates
    const uniqueArticles = shuffled.filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
    );

    console.log(`🎲 Fetched ${uniqueArticles.length} diverse RSS articles across ${categories.length} categories`);
    return uniqueArticles;
};

/**
 * Convert RSS article to internal format
 */
export const convertRSSToInternal = (article: RSSArticle) => {
    return {
        sourceId: generateArticleId(article.link),
        source: article.source,
        sourceUrl: article.link,
        originalHeadline: article.title,
        originalSummary: article.description,
        imageUrl: article.imageUrl,
        publishedAt: parsePublishDate(article.pubDate),
        category: article.category,
        region: article.region,
        tone: 'formal' as const,
    };
};

/**
 * Generate unique ID from URL
 */
const generateArticleId = (url: string): string => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
};

/**
 * Parse various date formats
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
    return new Date();
};

export const rssIntegration = {
    fetchFeed,
    fetchMultipleFeeds,
    fetchByCategory,
    fetchDiverseRSS,
    convertRSSToInternal,
    RSS_FEEDS,
};
