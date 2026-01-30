import { NewsArticle } from '../models/NewsArticle';
import { User } from '../models/User';
import { Reaction } from '../models/Reaction';
import { Bookmark } from '../models/Bookmark';
import mongoose from 'mongoose';

export class FeedService {
    /**
     * personalized home feed based on user interests and region
     */
    async getHomeFeed(userId: string, cursor?: string, limit = 20) {
        const user = await User.findById(userId);
        if (!user) throw new Error('user not found 💀');

        const interests = user.interests || [];
        const region = user.region || 'US';

        // query articles matching interests - show both translated and untranslated
        const query: any = {
            category: { $in: interests.length > 0 ? interests : ['tech', 'money', 'world', 'politics', 'science', 'health'] },
            publishedAt: { $lte: new Date() }
        };

        if (cursor) {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        const articles = await NewsArticle
            .find(query)
            .sort({ publishedAt: -1, _id: -1 })
            .limit(limit);

        const enrichedArticles = await this.enrichWithUserData(articles, userId);

        return {
            articles: enrichedArticles,
            nextCursor: articles.length > 0 ? articles[articles.length - 1]._id : null,
            hasMore: articles.length === limit
        };
    }

    /**
     * global trending feed based on trendingScore
     */
    async getTrendingFeed(userId?: string, cursor?: string, limit = 20) {
        const query: any = {
            trending: true,
            publishedAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } // last 48h
        };

        if (cursor) {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        const articles = await NewsArticle
            .find(query)
            .sort({ trendingScore: -1, _id: -1 })
            .limit(limit);

        const enrichedArticles = userId ? await this.enrichWithUserData(articles, userId) : articles;

        return {
            articles: enrichedArticles,
            nextCursor: articles.length > 0 ? articles[articles.length - 1]._id : null,
            hasMore: articles.length === limit
        };
    }

    /**
     * filtered feed by category
     */
    async getCategoryFeed(category: string, userId?: string, cursor?: string, limit = 20) {
        const query: any = {
            category,
            publishedAt: { $lte: new Date() }
        };

        if (cursor) {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        const articles = await NewsArticle
            .find(query)
            .sort({ publishedAt: -1, _id: -1 })
            .limit(limit);

        const enrichedArticles = userId ? await this.enrichWithUserData(articles, userId) : articles;

        return {
            articles: enrichedArticles,
            nextCursor: articles.length > 0 ? articles[articles.length - 1]._id : null,
            hasMore: articles.length === limit
        };
    }

    /**
     * recalculate trending scores for all recent articles
     */
    async updateTrendingScores() {
        const lastSync = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // last 3 days
        const articles = await NewsArticle.find({ publishedAt: { $gte: lastSync } });

        for (const article of articles) {
            const hoursSincePublished = Math.max(1, (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60));

            // score = (reactions * 2) + (views * 0.1) + (bookmarks * 3) / (hours)^1.5
            const totalReactions = (article.reactions.w || 0) + (article.reactions.mid || 0) +
                (article.reactions.cooked || 0) + (article.reactions.cap || 0);

            const score = ((totalReactions * 2) + (article.views * 0.1) + (article.bookmarks * 3)) /
                Math.pow(hoursSincePublished, 1.5);

            article.trendingScore = score;
            await article.save();
        }

        // mark top 50 as trending
        await NewsArticle.updateMany({}, { trending: false });
        const topArticles = await NewsArticle.find({})
            .sort({ trendingScore: -1 })
            .limit(50);

        const topIds = topArticles.map(a => a._id);
        await NewsArticle.updateMany({ _id: { $in: topIds } }, { trending: true });

        return topIds.length;
    }

    private async enrichWithUserData(articles: any[], userId: string) {
        const articleIds = articles.map(a => a._id);

        const [reactions, bookmarks] = await Promise.all([
            Reaction.find({ userId, articleId: { $in: articleIds } }),
            Bookmark.find({ userId, articleId: { $in: articleIds } })
        ]);

        return articles.map(article => {
            const articleObj = article.toObject();
            const reaction = reactions.find(r => r.articleId.toString() === article._id.toString());
            const bookmarked = bookmarks.some(b => b.articleId.toString() === article._id.toString());

            return {
                ...articleObj,
                userReacted: reaction ? reaction.type : null,
                userBookmarked: bookmarked
            };
        });
    }
}

export const feedService = new FeedService();
