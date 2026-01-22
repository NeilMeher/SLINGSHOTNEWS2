import { Request, Response } from 'express';
import { Reaction } from '../models/Reaction';
import { NewsArticle } from '../models/NewsArticle';
import { sendResponse, sendError } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';

import { reactionService, ReactionType } from '../services/reaction.service';

export class ReactionController {
    /**
     * POST /api/v1/articles/:articleId/react
     * Toggle reaction on an article (create/update/remove)
     */
    public toggleReaction = asyncHandler(async (req: any, res: Response) => {
        const { articleId } = req.params;
        const { type } = req.body;
        const userId = req.user.id;

        // Support both path param and body for articleId (backward compat)
        const targetArticleId = articleId || req.body.articleId;

        if (!targetArticleId || !type) {
            return sendError(res, 'articleId and type are required 💀', StatusCodes.BAD_REQUEST);
        }

        const validTypes = ['w', 'mid', 'cooked', 'cap'];
        if (!validTypes.includes(type)) {
            return sendError(res, 'invalid reaction type, no cap 🧢', StatusCodes.BAD_REQUEST);
        }

        const result = await reactionService.toggleReaction(userId, targetArticleId, type as ReactionType);

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.to(`article:${targetArticleId}`).emit('reaction:update', {
                articleId: targetArticleId,
                reactions: result.reactions,
                total: Object.values(result.reactions || {}).reduce((a: number, b: number) => a + b, 0)
            });
        }

        return sendResponse(res, {
            message: 'vibe recorded successfully! 🔥',
            data: result
        });
    });

    /**
     * DELETE /api/v1/articles/:articleId/react
     * Remove user's reaction from an article
     */
    public removeReaction = asyncHandler(async (req: any, res: Response) => {
        const { articleId } = req.params;
        const userId = req.user.id;

        if (!articleId) {
            return sendError(res, 'articleId is required 💀', StatusCodes.BAD_REQUEST);
        }

        const result = await reactionService.removeReaction(userId, articleId);

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.to(`article:${articleId}`).emit('reaction:update', {
                articleId,
                reactions: result.reactions
            });
        }

        return sendResponse(res, {
            message: 'reaction removed 👋',
            data: result
        });
    });

    /**
     * GET /api/v1/articles/:articleId/reactions
     * Get reaction breakdown for an article
     */
    public getReactions = asyncHandler(async (req: any, res: Response) => {
        const { articleId } = req.params;
        const userId = req.user?.id;

        if (!articleId) {
            return sendError(res, 'articleId is required 💀', StatusCodes.BAD_REQUEST);
        }

        const result = await reactionService.getArticleReactions(articleId, userId);

        return sendResponse(res, {
            message: 'reactions fetched 📡',
            data: result
        });
    });

    /**
     * GET /api/v1/articles/leaderboard
     * Get most W'd articles (reaction leaderboard)
     */
    public getLeaderboard = asyncHandler(async (req: any, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10;
        const period = req.query.period || 'all'; // 'day', 'week', 'month', 'all'

        const result = await reactionService.getLeaderboard(limit, period as string);

        return sendResponse(res, {
            message: 'leaderboard fetched 🏆',
            data: result
        });
    });
}

export const reactionController = new ReactionController();
