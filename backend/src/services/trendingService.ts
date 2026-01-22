import { NewsArticle } from '../models/NewsArticle';

export class TrendingService {
    /**
     * Updates the trending score for an article.
     * Score = (Total Reactions * 2 + Bookmarks * 5 + Views) / (Hours since published + 2)^1.5
     */
    public async calculateTrendingScores() {
        const articles = await NewsArticle.find({
            publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });

        for (const article of articles) {
            const totalReactions =
                (article.reactions.w || 0) +
                (article.reactions.mid || 0) +
                (article.reactions.cooked || 0) +
                (article.reactions.cap || 0);
            const bookmarks = article.bookmarks || 0;
            const views = article.views || 0;

            const baseScore = (totalReactions * 2) + (bookmarks * 5) + views;
            const hoursSincePublished = Math.max(0.1, (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60));

            const trendingScore = baseScore / Math.pow(hoursSincePublished + 2, 1.5);

            article.trendingScore = trendingScore;
            // Set as trending if score is above a threshold (e.g., 0.5)
            article.trending = trendingScore > 0.5;

            await article.save();
        }

        console.log(`✅ Trending scores updated for ${articles.length} articles`);
    }

    /**
     * Increments view count for an article.
     */
    public async incrementViews(articleId: string) {
        await NewsArticle.findByIdAndUpdate(articleId, { $inc: { views: 1 } });
    }
}

export const trendingService = new TrendingService();
