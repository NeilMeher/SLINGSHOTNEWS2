import { Request, Response } from 'express';
import { newsService } from '../services/newsService';
import { newsAggregatorService } from '../services/newsAggregator.service';
import { NewsArticle } from '../models/NewsArticle';
import { sendResponse, sendError } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';

export class NewsController {
    public getFeed = asyncHandler(async (req: Request, res: Response) => {
        const {
            category,
            region,
            cursor,
            limit = 10,
            sort = 'publishedAt',
            order = 'desc',
            dateFrom,
            dateTo,
            minViews,
            minBookmarks
        } = req.query;

        // Whitelist of allowed sort fields
        const allowedSortFields = ['publishedAt', 'views', 'bookmarks', 'createdAt', 'trendingScore'];
        const sortField = allowedSortFields.includes(sort as string) ? sort as string : 'publishedAt';
        const sortOrder = order === 'asc' ? 1 : -1;

        // Build query
        const query: any = {};

        // Category filter
        if (category && category !== 'all' && category !== 'general') {
            query.category = category;
        }

        // Region filter
        if (region && region !== 'all') {
            query.region = (region as string).toUpperCase();
        }

        // Date range filter
        if (dateFrom || dateTo) {
            query.publishedAt = {};
            if (dateFrom) query.publishedAt.$gte = new Date(dateFrom as string);
            if (dateTo) query.publishedAt.$lte = new Date(dateTo as string);
        }

        // Minimum views filter
        if (minViews) {
            query.views = { $gte: parseInt(minViews as string) };
        }

        // Minimum bookmarks filter
        if (minBookmarks) {
            query.bookmarks = { $gte: parseInt(minBookmarks as string) };
        }

        // Cursor pagination
        if (cursor) {
            query._id = { $lt: cursor };
        }

        const articles = await NewsArticle.find(query)
            .sort({ [sortField]: sortOrder, _id: -1 })
            .limit(Number(limit) + 1);

        const hasMore = articles.length > Number(limit);
        const results = hasMore ? articles.slice(0, Number(limit)) : articles;
        const nextCursor = hasMore ? results[results.length - 1]._id : null;

        return sendResponse(res, {
            message: 'feed fetched successfully 🔥',
            data: {
                articles: results,
                nextCursor,
                hasMore,
                filters: {
                    category: category || 'all',
                    region: region || 'all',
                    sort: sortField,
                    order: order || 'desc'
                }
            },
        });
    });

    public getTrendingFeed = asyncHandler(async (req: Request, res: Response) => {
        const articles = await NewsArticle.find({ trending: true })
            .sort({ trendingScore: -1 })
            .limit(10);

        return sendResponse(res, {
            message: 'trending news fetched successfully 🔥',
            data: articles,
        });
    });

    /**
     * Get unlimited news feed - no rate limits!
     */
    public getUnlimitedFeed = asyncHandler(async (req: Request, res: Response) => {
        const { limit = 50 } = req.query;
        const limitNum = Math.min(Number(limit), 100); // Max 100 per request

        console.log(`🚀 Unlimited feed requested with limit: ${limitNum}`);

        const articles = await newsService.getUnlimitedFeed(limitNum);

        return sendResponse(res, {
            message: `unlimited feed loaded with ${articles.length} fresh articles! 🔥`,
            data: {
                articles,
                count: articles.length,
                unlimited: true
            }
        });
    });

    public syncNews = asyncHandler(async (req: Request, res: Response) => {
        const result = await newsAggregatorService.syncNews();
        return sendResponse(res, {
            message: `sync complete! ${result.count} new articles inhaled 🚀`,
            data: result
        });
    });

    public getSources = asyncHandler(async (req: Request, res: Response) => {
        const sources = [
            { id: 'newsapi', name: 'NewsAPI.org', type: 'aggregator' },
            { id: 'reuters', name: 'Reuters', type: 'direct' },
            { id: 'ap', name: 'Associated Press', type: 'direct' },
            { id: 'bbc', name: 'BBC News', type: 'direct' }
        ];
        return sendResponse(res, {
            message: 'active sources fetched 📡',
            data: sources
        });
    });

    public getArticle = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const article = await newsService.getArticleById(id as string);

        if (!article) {
            return sendError(res, 'article not found 💀', StatusCodes.NOT_FOUND);
        }

        return sendResponse(res, {
            message: 'article found 🙌',
            data: article,
        });
    });

    public trackView = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const article = await NewsArticle.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });

        return sendResponse(res, {
            message: 'view tracked 🔥',
            data: { views: article?.views }
        });
    });

    public searchArticles = asyncHandler(async (req: Request, res: Response) => {
        const { q, category, page = 1, limit = 20 } = req.query;

        // Validate search query
        if (!q || typeof q !== 'string') {
            return sendError(res, 'search query required 🔍', StatusCodes.BAD_REQUEST);
        }

        if (q.length < 2) {
            return sendError(res, 'search query must be at least 2 characters', StatusCodes.BAD_REQUEST);
        }

        // Build search query
        const searchQuery: any = {
            $text: { $search: q }
        };

        // Add category filter if provided
        if (category && category !== 'all') {
            searchQuery.category = category;
        }

        // Calculate pagination
        const pageNum = parseInt(page as string);
        const limitNum = Math.min(parseInt(limit as string), 100); // Max 100 results
        const skip = (pageNum - 1) * limitNum;

        // Execute search with text score for relevance sorting
        const [articles, total] = await Promise.all([
            NewsArticle.find(searchQuery, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
                .skip(skip)
                .limit(limitNum),
            NewsArticle.countDocuments(searchQuery)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return sendResponse(res, {
            message: `found ${total} results for "${q}" 🔍`,
            data: {
                articles,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasMore: pageNum < totalPages
                },
                query: q
            }
        });
    });
}

export const newsController = new NewsController();
