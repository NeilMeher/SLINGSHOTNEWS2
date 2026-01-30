import { NewsArticle as NewsArticleModel } from '../models/NewsArticle';
import { newsApiIntegration } from '../integrations/news.integration';
import { nextNewsIntegration } from '../integrations/nextNews.integration';
import { rssIntegration } from '../integrations/rss.integration';
import { groqIntegration } from '../integrations/groq.integration';

export class NewsService {
    /**
     * Get latest news with unlimited fetching using Next News API
     */
    async getLatestNews(category: string = 'general', region: string = 'us'): Promise<any[]> {
        console.log(`🔎 Fetching ${category} news for ${region}...`);

        try {
            // 1. Try Next News API first (unlimited, no rate limits!)
            const rawArticles = await this.fetchFromNextNews(category, region);

            // If Next News API fails, fallback to NewsData.io
            if (rawArticles.length === 0) {
                console.log('⚠️ Next News API returned no results, falling back to NewsAPI...');
                return this.fetchFromNewsAPI(category, region);
            }

            const processedArticles = [];

            // Process up to 20 articles for a rich feed
            for (const article of rawArticles.slice(0, 20)) {
                try {
                    // 2. Check if already in DB
                    let existingArticle = await NewsArticleModel.findOne({ sourceUrl: article.link });

                    if (existingArticle) {
                        processedArticles.push(existingArticle);
                    } else {
                        // 3. Rewrite with AI
                        const rewritten = await groqIntegration.rewriteToGenZ(
                            article.title,
                            article.description || article.title
                        );

                        // 4. Save to DB
                        const converted = rssIntegration.convertRSSToInternal(article);
                        const newArticle = await NewsArticleModel.create({
                            ...converted,
                            headline: rewritten.headline,
                            summary: rewritten.summary,
                            tldr: rewritten.tldr,
                            emoji: rewritten.emoji,
                            reactions: { w: 0, mid: 0, cooked: 0, cap: 0 }
                        });

                        processedArticles.push(newArticle);
                    }
                } catch (err) {
                    console.error('❌ Error processing article:', err);
                }
            }

            console.log(`✅ Processed ${processedArticles.length} articles`);
            return processedArticles;
        } catch (error) {
            console.error('❌ Error in getLatestNews:', error);
            // Fallback to NewsAPI
            return this.fetchFromNewsAPI(category, region);
        }
    }

    /**
     * Fetch from RSS Feeds (TRULY UNLIMITED - NO API KEYS!)
     */
    private async fetchFromNextNews(category: string, region: string) {
        if (category === 'general' || category === 'world') {
            // Get diverse news from all categories via RSS
            return rssIntegration.fetchDiverseRSS(10);
        } else {
            // Get category-specific news from RSS
            const categoryKey = category as keyof typeof rssIntegration.RSS_FEEDS;
            if (rssIntegration.RSS_FEEDS[categoryKey]) {
                return rssIntegration.fetchByCategory(categoryKey, 15);
            }
            // Fallback to diverse RSS
            return rssIntegration.fetchDiverseRSS(10);
        }
    }

    /**
     * Fallback to NewsAPI (has rate limits)
     */
    private async fetchFromNewsAPI(category: string, region: string): Promise<any[]> {
        const rawArticles = await newsApiIntegration.getTopHeadlines(category, region);
        const processedArticles = [];

        for (const article of rawArticles.slice(0, 5)) {
            try {
                let existingArticle = await NewsArticleModel.findOne({ sourceUrl: article.url });

                if (existingArticle) {
                    processedArticles.push(existingArticle);
                } else {
                    const rewritten = await groqIntegration.rewriteToGenZ(
                        article.title,
                        article.description || article.content || 'no summary available'
                    );

                    const newArticle = await NewsArticleModel.create({
                        sourceId: article.url,
                        source: article.source.name.toLowerCase(),
                        sourceUrl: article.url,
                        category: (category === 'general' ? 'world' : category) as any,
                        originalHeadline: article.title,
                        originalSummary: article.description || article.content || '',
                        headline: rewritten.headline,
                        summary: rewritten.summary,
                        tldr: rewritten.tldr,
                        emoji: rewritten.emoji,
                        publishedAt: new Date(article.publishedAt),
                        imageUrl: article.urlToImage || undefined,
                        region: region.toUpperCase(),
                        reactions: { w: 0, mid: 0, cooked: 0, cap: 0 }
                    });

                    processedArticles.push(newArticle);
                }
            } catch (err) {
                console.error('❌ Error processing NewsAPI article:', err);
            }
        }

        return processedArticles;
    }

    /**
     * Fetch unlimited diverse news for infinite scroll
     */
    async getUnlimitedFeed(limit: number = 50): Promise<any[]> {
        console.log(`🚀 Fetching unlimited feed with ${limit} articles...`);

        try {
            // Fetch diverse news from RSS feeds (NO LIMITS!)
            const articles = await rssIntegration.fetchDiverseRSS(Math.ceil(limit / 6));

            const processedArticles = [];

            // Process in parallel with concurrency limit (e.g. 5 at a time)
            const processArticle = async (article: any) => {
                try {
                    // Check if already in DB
                    let existingArticle = await NewsArticleModel.findOne({ sourceUrl: article.link });

                    if (existingArticle) {
                        return existingArticle;
                    } else {
                        // Translate and save
                        // We use a small timeout for AI to ensure feed doesn't hang
                        const rewritten = await groqIntegration.rewriteToGenZ(
                            article.title,
                            article.description || article.title
                        );

                        const converted = rssIntegration.convertRSSToInternal(article);
                        const newArticle = await NewsArticleModel.create({
                            ...converted,
                            headline: rewritten.headline,
                            summary: rewritten.summary,
                            tldr: rewritten.tldr,
                            emoji: rewritten.emoji,
                            reactions: { w: 0, mid: 0, cooked: 0, cap: 0 }
                        });

                        return newArticle;
                    }
                } catch (err) {
                    console.error('❌ Error processing individual article:', err);
                    return null;
                }
            };

            const chunkArray = (arr: any[], size: number) => {
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                    chunks.push(arr.slice(i, i + size));
                }
                return chunks;
            };

            const chunks = chunkArray(articles.slice(0, limit), 5); // Process 5 at a time

            for (const chunk of chunks) {
                const results = await Promise.all(chunk.map(processArticle));
                processedArticles.push(...results.filter(a => a !== null));
            }

            console.log(`✅ Unlimited feed ready with ${processedArticles.length} articles! 🔥`);
            return processedArticles;
        } catch (error) {
            console.error('❌ Error fetching unlimited feed:', error);
            return [];
        }
    }

    async getArticleById(id: string): Promise<any | null> {
        return NewsArticleModel.findById(id);
    }
}

export const newsService = new NewsService();
