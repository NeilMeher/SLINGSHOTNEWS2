import axios from 'axios';
import { NewsArticle } from '../models/NewsArticle';
import { newsApiIntegration } from '../integrations/news.integration';
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
        const results: RawArticle[][] = await Promise.all([
            this.fetchFromNewsAPI(category, region),
            this.fetchFromBBC(category),
            this.fetchFromReuters(category),
            this.fetchFromAP(category)
        ]);

        const merged = results.flat();
        const deduplicated = this.deduplicateArticles(merged);

        // Sort by publishedAt desc
        return deduplicated
            .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
            .slice(0, limit);
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
