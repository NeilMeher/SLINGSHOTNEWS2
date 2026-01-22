import { NewsArticle as NewsArticleModel } from '../models/NewsArticle';
import { newsApiIntegration } from '../integrations/news.integration';
import { groqIntegration } from '../integrations/groq.integration';

export class NewsService {
    async getLatestNews(category: string = 'general', region: string = 'us'): Promise<any[]> {
        // 1. Fetch from NewsAPI
        const rawArticles = await newsApiIntegration.getTopHeadlines(category, region);

        const processedArticles = [];

        for (const article of rawArticles.slice(0, 5)) { // Limit to 5 for rapid response during dev
            try {
                // 2. Check if already in DB (using URL as unique source mapping for now)
                let existingArticle = await NewsArticleModel.findOne({ sourceUrl: article.url });

                if (existingArticle) {
                    processedArticles.push(existingArticle);
                } else {
                    // 3. Rewrite with AI
                    const rewritten = await groqIntegration.rewriteToGenZ(
                        article.title,
                        article.description || article.content || 'no summary available'
                    );

                    // 4. Save to DB with full schema
                    const newArticle = await NewsArticleModel.create({
                        sourceId: article.url, // Using URL as unique source ID for simplicity with NewsAPI
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
                console.error('❌ Error processing article:', err);
            }
        }

        return processedArticles;
    }

    async getArticleById(id: string): Promise<any | null> {
        return NewsArticleModel.findById(id);
    }
}

export const newsService = new NewsService();
