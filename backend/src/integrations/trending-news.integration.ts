import axios from 'axios';
import { config } from '../config/env';

// Viral/trending keywords for addictive content
const VIRAL_KEYWORDS = [
    'elon musk', 'twitter', 'tiktok', 'viral', 'trending', 'drama', 'controversy',
    'ai', 'chatgpt', 'crypto', 'bitcoin', 'tesla', 'spacex', 'meta', 'instagram',
    'youtube', 'streamer', 'influencer', 'celebrity', 'scandal', 'exposed',
    'crypto crash', 'stock market', 'millionaire', 'billionaire', 'tech layoffs',
    'gaming', 'esports', 'netflix', 'marvel', 'sports', 'nba', 'football'
];

export class TrendingNewsIntegration {
    private readonly newsApiKey = process.env.NEWS_API_KEY || '';
    private readonly newsDataKey = process.env.NEWSDATA_API_KEY || '';

    /**
     * Fetch VIRAL trending news that's actually interesting
     */
    async fetchViralNews(limit: number = 20): Promise<any[]> {
        const results = await Promise.all([
            this.fetchNewsAPITrending(),
            this.fetchViralByKeywords(),
            this.fetchTechCrunch(),
            this.fetchRedditTrending()
        ]);

        return results
            .flat()
            .filter(a => a !== null)
            .slice(0, limit);
    }

    /**
     * Get trending headlines from NewsAPI
     */
    private async fetchNewsAPITrending(): Promise<any[]> {
        try {
            const response = await axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    apiKey: this.newsApiKey,
                    country: 'us',
                    pageSize: 20,
                    category: 'technology'
                }
            });

            return response.data.articles || [];
        } catch (err: any) {
            console.error('❌ NewsAPI trending error:', err?.message);
            return [];
        }
    }

    /**
     * Search for viral keywords
     */
    private async fetchViralByKeywords(): Promise<any[]> {
        try {
            // Pick 3 random viral keywords
            const keywords = this.getRandomKeywords(3);
            const searchQuery = keywords.join(' OR ');

            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    apiKey: this.newsApiKey,
                    q: searchQuery,
                    sortBy: 'popularity',
                    pageSize: 15,
                    language: 'en'
                }
            });

            return response.data.articles || [];
        } catch (err: any) {
            console.error('❌ Viral keywords error:', err?.message);
            return [];
        }
    }

    /**
     * TechCrunch RSS for tech drama
     */
    private async fetchTechCrunch(): Promise<any[]> {
        try {
            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    apiKey: this.newsApiKey,
                    sources: 'techcrunch',
                    pageSize: 10
                }
            });

            return response.data.articles || [];
        } catch (err: any) {
            console.error('❌ TechCrunch error:', err?.message);
            return [];
        }
    }

    /**
     * Simulate Reddit trending (using NewsAPI with viral keywords)
     */
    private async fetchRedditTrending(): Promise<any[]> {
        try {
            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    apiKey: this.newsApiKey,
                    q: 'reddit OR viral OR trending',
                    sortBy: 'popularity',
                    pageSize: 10
                }
            });

            return response.data.articles || [];
        } catch (err: any) {
            console.error('❌ Reddit trending error:', err?.message);
            return [];
        }
    }

    /**
     * Get random viral keywords
     */
    private getRandomKeywords(count: number): string[] {
        const shuffled = [...VIRAL_KEYWORDS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Score articles by "addictiveness"
     */
    scoreAddictiveness(article: any): number {
        let score = 0;
        const title = (article.title || article.headline || '').toLowerCase();
        const desc = (article.description || article.summary || '').toLowerCase();

        // Viral keyword bonus
        VIRAL_KEYWORDS.forEach(keyword => {
            if (title.includes(keyword)) score += 3;
            if (desc.includes(keyword)) score += 1;
        });

        // Controversy indicators
        const controversialWords = ['drama', 'scandal', 'exposed', 'leaked', 'fired', 'quit', 'crash', 'fails'];
        controversialWords.forEach(word => {
            if (title.includes(word)) score += 5;
        });

        // Recency bonus (newer = better)
        const hoursOld = article.publishedAt ?
            (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60) : 999;
        if (hoursOld < 6) score += 10;
        else if (hoursOld < 24) score += 5;

        return score;
    }
}

export const trendingNewsIntegration = new TrendingNewsIntegration();
