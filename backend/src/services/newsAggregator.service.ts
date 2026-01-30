import axios from 'axios';
import { NewsArticle } from '../models/NewsArticle';
import { newsApiIntegration } from '../integrations/news.integration';
import { newsDataIntegration } from '../integrations/newsdata.integration';
import { compareTwoStrings } from 'string-similarity';
import { config } from '../config/env';

export interface RawArticle {
    sourceId: string;
    source: string;
    sourceUrl: string;
    category: 'tech' | 'money' | 'world' | 'politics' | 'science' | 'health';
    region: string;
    originalHeadline: string;
    originalSummary: string;
    publishedAt: Date;
    imageUrl?: string;
}

export class NewsAggregatorService {
    private readonly BBC_URL = 'https://bbc-news-api.vercel.app/api/news';

    async fetchLatestNews(category: string, region: string, limit: number = 20): Promise<RawArticle[]> {
        // ONLY use NewsData.io (working API with 200 req/day)
        // NewsAPI is rate limited (100/day exhausted)
        // BBC/Reuters/AP are broken
        const results: RawArticle[][] = await Promise.all([
            this.fetchFromNewsData(category, region),
            this.fetchViralFromNewsData(category) // Fetch viral content from NewsData
        ]);

        const merged = results.flat();
        const deduplicated = this.deduplicateArticles(merged);

        // Sort by ADDICTIVENESS + recency
        return deduplicated
            .map(article => ({
                ...article,
                addictiveness: this.scoreAddictiveness(article)
            }))
            .sort((a, b) => {
                // Primary: addictiveness score
                if (b.addictiveness !== a.addictiveness) {
                    return b.addictiveness - a.addictiveness;
                }
                // Secondary: recency
                return b.publishedAt.getTime() - a.publishedAt.getTime();
            })
            .slice(0, limit);
    }

    /**
     * Fetch VIRAL content from NewsData.io
     */
    private async fetchViralFromNewsData(category: string): Promise<RawArticle[]> {
        try {
            const viralKeywords = this.getViralKeywords(category);
            const keyword = viralKeywords[Math.floor(Math.random() * viralKeywords.length)];

            const articles = await newsDataIntegration.searchNews(keyword);

            return articles.map(a => ({
                sourceId: a.article_id,
                source: a.source_id || 'newsdata',
                sourceUrl: a.link,
                category: category as any,
                region: 'US',
                originalHeadline: a.title,
                originalSummary: a.description || a.content || '',
                publishedAt: new Date(a.pubDate),
                imageUrl: a.image_url || undefined
            }));
        } catch (err: any) {
            console.error('❌ Viral NewsData fetch error:', err?.message);
            return [];
        }
    }

    /**
     * Fetch VIRAL trending content
     */
    private async fetchViralContent(category: string): Promise<RawArticle[]> {
        try {
            const viralKeywords = this.getViralKeywords(category);
            const searchQuery = viralKeywords.join(' OR ');

            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    apiKey: config.NEWS_API_KEY,
                    q: searchQuery,
                    sortBy: 'popularity',
                    pageSize: 15,
                    language: 'en'
                }
            });

            return (response.data.articles || []).map((a: any) => this.mapNewsAPI(a, category as any, 'US'));
        } catch (err: any) {
            console.error('❌ Viral content fetch error:', err?.message);
            return [];
        }
    }

    /**
     * Get viral keywords by category
     */
    private getViralKeywords(category: string): string[] {
        const keywordMap: Record<string, string[]> = {
            tech: ['elon musk', 'ai', 'chatgpt', 'tesla', 'apple', 'meta', 'tiktok', 'crypto'],
            money: ['crypto crash', 'bitcoin', 'stock market', 'millionaire', 'bankruptcy', 'scam'],
            world: ['war', 'crisis', 'protest', 'scandal', 'disaster', 'controversy'],
            politics: ['trump', 'election', 'scandal', 'resign', 'fired', 'exposed'],
            science: ['nasa', 'space', 'discovery', 'breakthrough', 'study reveals'],
            health: ['covid', 'vaccine', 'outbreak', 'warning', 'danger']
        };

        return keywordMap[category] || ['viral', 'trending', 'breaking'];
    }

    /**
     * Score article by "addictiveness"
     */
    private scoreAddictiveness(article: RawArticle): number {
        let score = 0;
        const headline = article.originalHeadline.toLowerCase();
        const summary = article.originalSummary.toLowerCase();

        // Viral personalities (Elon, Trump, celebrities)
        const viralPeople = ['elon', 'musk', 'trump', 'biden', 'kardashian', 'bezos', 'zuckerberg'];
        viralPeople.forEach(person => {
            if (headline.includes(person)) score += 10;
        });

        // Controversy words (drama, scandal, etc.)
        const controversialWords = ['drama', 'scandal', 'exposed', 'fired', 'quit', 'crash', 'fails', 'lawsuit'];
        controversialWords.forEach(word => {
            if (headline.includes(word)) score += 8;
            if (summary.includes(word)) score += 3;
        });

        // Trending tech/platforms
        const platforms = ['tiktok', 'twitter', 'instagram', 'youtube', 'reddit', 'meta'];
        platforms.forEach(platform => {
            if (headline.includes(platform)) score += 6;
        });

        // Numbers (prices, amounts make it interesting)
        const hasNumber = /\$\d+|million|billion|thousand/.test(headline);
        if (hasNumber) score += 5;

        // Recency bonus
        const hoursOld = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60);
        if (hoursOld < 3) score += 15; // Ultra fresh
        else if (hoursOld < 12) score += 10;
        else if (hoursOld < 24) score += 5;

        return score;
    }

    async syncNews(): Promise<{ count: number }> {
        const categories: RawArticle['category'][] = ['tech', 'money', 'world', 'politics', 'science', 'health'];
        const regions = ['US', 'UK', 'CA', 'AU', 'IN'];

        let totalCount = 0;

        for (const cat of categories) {
            for (const reg of regions) {
                try {
                    const articles = await this.fetchLatestNews(cat, reg, 10);

                    for (const art of articles) {
                        const exists = await NewsArticle.findOne({
                            $or: [{ sourceUrl: art.sourceUrl }, { originalHeadline: art.originalHeadline }]
                        });

                        if (!exists) {
                            await NewsArticle.create(art);
                            totalCount++;
                        }
                    }
                } catch (err) {
                    console.error(`❌ Sync failed for ${cat}/${reg}:`, err);
                }
            }
        }

        return { count: totalCount };
    }

    async fetchTrendingNews(region: string): Promise<RawArticle[]> {
        // For trending, we'll hit NewsAPI with specific trending markers or just return the latest merge
        const headlines = await newsApiIntegration.getTopHeadlines('general', region.toLowerCase());
        return headlines.map(h => this.mapNewsAPI(h, 'world', region));
    }

    async searchNews(query: string, category?: string): Promise<RawArticle[]> {
        const headlines = await newsApiIntegration.searchNews(query);
        return headlines.map(h => this.mapNewsAPI(h, (category || 'world') as any, 'US'));
    }

    private async fetchFromNewsData(category: string, region: string): Promise<RawArticle[]> {
        try {
            const newsDataCat = newsDataIntegration.mapCategoryToNewsData(category);
            // NewsData.io uses different country codes (GB instead of UK)
            const newsDataRegion = region === 'UK' ? 'GB' : region;
            const articles = await newsDataIntegration.getLatestNews(newsDataCat, newsDataRegion);

            return articles.map(a => ({
                sourceId: a.article_id,
                source: a.source_id || 'newsdata',
                sourceUrl: a.link,
                category: category as any,
                region: region.toUpperCase(),
                originalHeadline: a.title,
                originalSummary: a.description || a.content || '',
                publishedAt: new Date(a.pubDate),
                imageUrl: a.image_url || undefined
            }));
        } catch (err: any) {
            console.error('❌ NewsData Fetch Error:', err?.message || err);
            return [];
        }
    }

    private async fetchFromNewsAPI(category: string, region: string): Promise<RawArticle[]> {
        const newsApiCat = this.mapCategoryToNewsAPI(category);
        const articles = await newsApiIntegration.getTopHeadlines(newsApiCat, region.toLowerCase());
        return articles.map(a => this.mapNewsAPI(a, category as any, region));
    }

    private async fetchFromBBC(category: string): Promise<RawArticle[]> {
        try {
            // BBC API usually doesn't have region support in the vercel proxy, just topic
            const response = await axios.get(this.BBC_URL, { params: { topic: category } });
            const data = response.data.news || response.data;

            return (Array.isArray(data) ? data : []).map(a => ({
                sourceId: a.url || Math.random().toString(),
                source: 'bbc',
                sourceUrl: a.url,
                category: category as any,
                region: 'UK', // Default for BBC
                originalHeadline: a.title || a.headline,
                originalSummary: a.description || a.content || '',
                publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
                imageUrl: a.image || a.urlToImage
            }));
        } catch (err: any) {
            console.error('❌ BBC Fetch Error:', err?.message || err);
            return [];
        }
    }

    private async fetchFromReuters(category: string): Promise<RawArticle[]> {
        // Mocking Reuters hit via NewsAPI filtering since direct enterprise API isn't provided
        // or using the realtime-newsapi logic if it were a direct endpoint.
        const articles = await newsApiIntegration.searchNews(`reuters ${category}`);
        return articles
            .filter(a => a.source.name.toLowerCase().includes('reuters'))
            .map(a => this.mapNewsAPI(a, category as any, 'US'));
    }

    private async fetchFromAP(category: string): Promise<RawArticle[]> {
        const articles = await newsApiIntegration.searchNews(`associated press ${category}`);
        return articles
            .filter(a => a.source.name.toLowerCase().includes('associated press') || a.source.name.toLowerCase().includes('ap'))
            .map(a => this.mapNewsAPI(a, category as any, 'US'));
    }

    private deduplicateArticles(articles: RawArticle[]): RawArticle[] {
        const unique: RawArticle[] = [];
        for (const article of articles) {
            const isDuplicate = unique.some(u =>
                compareTwoStrings(u.originalHeadline.toLowerCase(), article.originalHeadline.toLowerCase()) > 0.85
            );
            if (!isDuplicate) {
                unique.push(article);
            }
        }
        return unique;
    }

    private mapNewsAPI(article: any, category: RawArticle['category'], region: string): RawArticle {
        return {
            sourceId: article.url,
            source: article.source.name.toLowerCase(),
            sourceUrl: article.url,
            category,
            region: region.toUpperCase(),
            originalHeadline: article.title,
            originalSummary: article.description || article.content || '',
            publishedAt: new Date(article.publishedAt),
            imageUrl: article.urlToImage || undefined
        };
    }

    private mapCategoryToNewsAPI(category: string): string {
        const map: Record<string, string> = {
            tech: 'technology',
            money: 'business',
            world: 'general',
            politics: 'politics',
            science: 'science',
            health: 'health'
        };
        return map[category] || 'general';
    }
}

export const newsAggregatorService = new NewsAggregatorService();
