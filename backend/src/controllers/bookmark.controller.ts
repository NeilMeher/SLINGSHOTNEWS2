import { Request, Response } from 'express';
import { Bookmark } from '../models/Bookmark';
import { NewsArticle } from '../models/NewsArticle';
import { sendResponse, sendError } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';
import { bookmarkService } from '../services/bookmark.service';

export class BookmarkController {
    /**
     * POST /api/v1/articles/:articleId/bookmark
     * POST /api/v1/bookmarks (legacy, uses body.articleId)
     * Toggle bookmark on an article
     */
    public toggleBookmark = asyncHandler(async (req: any, res: Response) => {
        const articleId = req.params.articleId || req.body.articleId;
        const userId = req.user.id;

        if (!articleId) {
            return sendError(res, 'articleId is required 💀', StatusCodes.BAD_REQUEST);
        }

        try {
            const result = await bookmarkService.toggleBookmark(userId, articleId);

            return sendResponse(res, {
                message: result.bookmarked ? 'saved for later 🔖' : 'removed from saved 🗑️',
                data: result
            });
        } catch (error: any) {
            return sendError(res, error.message, StatusCodes.NOT_FOUND);
        }
    });

    /**
     * GET /api/v1/bookmarks
     * Get user's saved articles with pagination, filtering, and search
     */
    public getMyBookmarks = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user.id;
        const {
            page = '1',
            limit = '20',
            category,
            search,
            sortBy = 'savedDate'
        } = req.query;

        const result = await bookmarkService.getUserBookmarks(userId, {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            category: category as string,
            search: search as string,
            sortBy: sortBy as 'savedDate' | 'publishedDate'
        });

        // Add userBookmarked flag to each article
        const articlesWithBookmarkStatus = result.articles.map(article => ({
            ...article,
            userBookmarked: true
        }));

        return sendResponse(res, {
            message: 'your saved articles fetched 📚',
            data: {
                articles: articlesWithBookmarkStatus,
                pagination: result.pagination
            }
        });
    });

    /**
     * DELETE /api/v1/bookmarks/:articleId
     * Remove a specific bookmark
     */
    public removeBookmark = asyncHandler(async (req: any, res: Response) => {
        const { articleId } = req.params;
        const userId = req.user.id;

        if (!articleId) {
            return sendError(res, 'articleId is required 💀', StatusCodes.BAD_REQUEST);
        }

        try {
            const result = await bookmarkService.removeBookmark(userId, articleId);

            return sendResponse(res, {
                message: 'bookmark removed 🗑️',
                data: result
            });
        } catch (error: any) {
            return sendError(res, error.message, StatusCodes.NOT_FOUND);
        }
    });

    /**
     * DELETE /api/v1/bookmarks
     * Remove all user's bookmarks
     */
    public removeAllBookmarks = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user.id;

        const result = await bookmarkService.removeAllBookmarks(userId);

        return sendResponse(res, {
            message: `removed ${result.removedCount} bookmarks 🧹`,
            data: result
        });
    });

    /**
     * GET /api/v1/bookmarks/export
     * Export user's bookmarks as JSON
     */
    public exportBookmarks = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user.id;

        const bookmarks = await bookmarkService.exportBookmarks(userId);

        return sendResponse(res, {
            message: 'bookmarks exported 📤',
            data: {
                exportedAt: new Date().toISOString(),
                count: bookmarks.length,
                bookmarks
            }
        });
    });

    /**
     * GET /api/v1/bookmarks/count
     * Get user's bookmark count
     */
    public getBookmarkCount = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user.id;

        const count = await bookmarkService.getBookmarkCount(userId);

        return sendResponse(res, {
            message: 'bookmark count fetched 📊',
            data: { count }
        });
    });

    /**
     * POST /api/v1/bookmarks/check
     * Check bookmark status for multiple articles
     */
    public checkBookmarkStatus = asyncHandler(async (req: any, res: Response) => {
        const userId = req.user.id;
        const { articleIds } = req.body;

        if (!articleIds || !Array.isArray(articleIds)) {
            return sendError(res, 'articleIds array is required 💀', StatusCodes.BAD_REQUEST);
        }

        const status = await bookmarkService.getBookmarkStatus(userId, articleIds);

        return sendResponse(res, {
            message: 'bookmark status checked ✅',
            data: { status }
        });
    });
}

export const bookmarkController = new BookmarkController();

