import { Request, Response } from 'express';
import { feedService } from '../services/feed.service';
import { sendResponse, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { StatusCodes } from '../utils/statusCodes';

export class FeedController {
    /**
     * personalized home feed
     */
    public getHome = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user.id;
        const { cursor, limit } = req.query;

        const result = await feedService.getHomeFeed(
            userId,
            cursor as string,
            limit ? parseInt(limit as string) : 20
        );

        return sendResponse(res, {
            message: 'home feed served fresh 🍦',
            data: result
        });
    });

    /**
     * global trending feed
     */
    public getTrending = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user?.id;
        const { cursor, limit } = req.query;

        const result = await feedService.getTrendingFeed(
            userId,
            cursor as string,
            limit ? parseInt(limit as string) : 20
        );

        return sendResponse(res, {
            message: 'trending feed is popping off 🔥',
            data: result
        });
    });

    /**
     * category-specific feed
     */
    public getCategory = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user?.id;
        const { category } = req.params;
        const { cursor, limit } = req.query;

        const result = await feedService.getCategoryFeed(
            category,
            userId,
            cursor as string,
            limit ? parseInt(limit as string) : 20
        );

        return sendResponse(res, {
            message: `${category} feed delivered 📡`,
            data: result
        });
    });
}

export const feedController = new FeedController();
