import { Reaction } from '../models/Reaction';
import { NewsArticle } from '../models/NewsArticle';
import mongoose from 'mongoose';

export type ReactionType = 'w' | 'mid' | 'cooked' | 'cap';

export class ReactionService {
    async toggleReaction(userId: string, articleId: string, type: ReactionType) {
        const article = await NewsArticle.findById(articleId);
        if (!article) throw new Error('article not found 💀');

        const existing = await Reaction.findOne({ userId, articleId });

        if (existing) {
            if (existing.type === type) {
                // Same reaction - remove it (toggle off)
                await existing.deleteOne();
                await this.decrementReactionCount(articleId, type);

                const updatedArticle = await NewsArticle.findById(articleId);
                return {
                    removed: true,
                    type,
                    reactions: updatedArticle?.reactions,
                    userReaction: null
                };
            } else {
                // Different reaction - update it
                const oldType = existing.type as ReactionType;
                existing.type = type;
                await existing.save();

                await this.decrementReactionCount(articleId, oldType);
                await this.incrementReactionCount(articleId, type);

                const updatedArticle = await NewsArticle.findById(articleId);
                return {
                    updated: true,
                    oldType,
                    newType: type,
                    reactions: updatedArticle?.reactions,
                    userReaction: type
                };
            }
        } else {
            // No existing reaction - create new
            await Reaction.create({ userId, articleId, type });
            await this.incrementReactionCount(articleId, type);

            const updatedArticle = await NewsArticle.findById(articleId);
            return {
                created: true,
                type,
                reactions: updatedArticle?.reactions,
                userReaction: type
            };
        }
    }

    /**
     * Remove a user's reaction from an article
     */
    async removeReaction(userId: string, articleId: string) {
        const article = await NewsArticle.findById(articleId);
        if (!article) throw new Error('article not found 💀');

        const existing = await Reaction.findOne({ userId, articleId });

        if (!existing) {
            return {
                removed: false,
                message: 'no reaction to remove',
                reactions: article.reactions,
                userReaction: null
            };
        }

        const reactionType = existing.type as ReactionType;
        await existing.deleteOne();
        await this.decrementReactionCount(articleId, reactionType);

        const updatedArticle = await NewsArticle.findById(articleId);
        return {
            removed: true,
            type: reactionType,
            reactions: updatedArticle?.reactions,
            userReaction: null
        };
    }

    private async incrementReactionCount(articleId: string, type: ReactionType) {
        await NewsArticle.updateOne(
            { _id: articleId },
            { $inc: { [`reactions.${type}`]: 1 } }
        );
    }

    private async decrementReactionCount(articleId: string, type: ReactionType) {
        await NewsArticle.updateOne(
            { _id: articleId },
            { $inc: { [`reactions.${type}`]: -1 } }
        );
    }

    async getArticleReactions(articleId: string, userId?: string) {
        const article = await NewsArticle.findById(articleId);
        if (!article) throw new Error('article not found 💀');

        let userReaction = null;
        if (userId) {
            const reaction = await Reaction.findOne({ userId, articleId });
            userReaction = reaction?.type || null;
        }

        return {
            reactions: article.reactions,
            total: (article.reactions.w || 0) + (article.reactions.mid || 0) +
                (article.reactions.cooked || 0) + (article.reactions.cap || 0),
            userReaction
        };
    }

    /**
     * Get reaction leaderboard - articles with most W reactions
     */
    async getLeaderboard(limit: number = 10, period: string = 'all') {
        let dateFilter: any = {};
        const now = new Date();

        switch (period) {
            case 'day':
                dateFilter = { publishedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
                break;
            case 'week':
                dateFilter = { publishedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case 'month':
                dateFilter = { publishedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
                break;
            default:
                dateFilter = {};
        }

        const articles = await NewsArticle.find({
            ...dateFilter,
            'reactions.w': { $gt: 0 }
        })
            .select('headline emoji category source imageUrl reactions publishedAt')
            .sort({ 'reactions.w': -1 })
            .limit(limit)
            .lean();

        // Calculate percentages and rankings
        const leaderboard = articles.map((article, index) => {
            const total = (article.reactions.w || 0) + (article.reactions.mid || 0) +
                (article.reactions.cooked || 0) + (article.reactions.cap || 0);
            const wPercentage = total > 0 ? Math.round((article.reactions.w / total) * 100) : 0;

            return {
                rank: index + 1,
                articleId: article._id,
                headline: article.headline,
                emoji: article.emoji,
                category: article.category,
                source: article.source,
                imageUrl: article.imageUrl,
                reactions: article.reactions,
                totalReactions: total,
                wPercentage,
                publishedAt: article.publishedAt
            };
        });

        return {
            period,
            articles: leaderboard
        };
    }

    /**
     * Get user's reaction history
     */
    async getUserReactions(userId: string, limit: number = 50) {
        const reactions = await Reaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('articleId', 'headline emoji category')
            .lean();

        return reactions;
    }
}

export const reactionService = new ReactionService();

