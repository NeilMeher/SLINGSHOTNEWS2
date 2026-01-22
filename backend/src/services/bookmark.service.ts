import { Bookmark } from '../models/Bookmark';
import { NewsArticle, INewsArticle } from '../models/NewsArticle';
import mongoose from 'mongoose';

interface PaginationResult {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

interface BookmarkListResult {
    articles: INewsArticle[];
    pagination: PaginationResult;
}

interface BookmarkToggleResult {
    bookmarked: boolean;
    bookmarksCount: number;
}

export class BookmarkService {
    /**
     * Toggle bookmark on an article (add if not exists, remove if exists)
     */
    async toggleBookmark(userId: string, articleId: string): Promise<BookmarkToggleResult> {
        const article = await NewsArticle.findById(articleId);
        if (!article) {
            throw new Error('article not found 💀');
        }

        const existing = await Bookmark.findOne({ userId, articleId });

        if (existing) {
            // Already bookmarked - remove it
            await existing.deleteOne();
            await NewsArticle.updateOne(
                { _id: articleId },
                { $inc: { bookmarks: -1 } }
            );

            const updatedArticle = await NewsArticle.findById(articleId);
            return {
                bookmarked: false,
                bookmarksCount: updatedArticle?.bookmarks || 0
            };
        } else {
            // Not bookmarked - add it
            await Bookmark.create({ userId, articleId });
            await NewsArticle.updateOne(
                { _id: articleId },
                { $inc: { bookmarks: 1 } }
            );

            const updatedArticle = await NewsArticle.findById(articleId);
            return {
                bookmarked: true,
                bookmarksCount: updatedArticle?.bookmarks || 1
            };
        }
    }

    /**
     * Add a bookmark (explicit add, not toggle)
     */
    async addBookmark(userId: string, articleId: string): Promise<BookmarkToggleResult> {
        const article = await NewsArticle.findById(articleId);
        if (!article) {
            throw new Error('article not found 💀');
        }

        const existing = await Bookmark.findOne({ userId, articleId });
        if (existing) {
            return {
                bookmarked: true,
                bookmarksCount: article.bookmarks
            };
        }

        await Bookmark.create({ userId, articleId });
        await NewsArticle.updateOne(
            { _id: articleId },
            { $inc: { bookmarks: 1 } }
        );

        return {
            bookmarked: true,
            bookmarksCount: article.bookmarks + 1
        };
    }

    /**
     * Remove a bookmark
     */
    async removeBookmark(userId: string, articleId: string): Promise<BookmarkToggleResult> {
        const article = await NewsArticle.findById(articleId);
        if (!article) {
            throw new Error('article not found 💀');
        }

        const existing = await Bookmark.findOne({ userId, articleId });
        if (!existing) {
            return {
                bookmarked: false,
                bookmarksCount: article.bookmarks
            };
        }

        await existing.deleteOne();
        await NewsArticle.updateOne(
            { _id: articleId },
            { $inc: { bookmarks: -1 } }
        );

        return {
            bookmarked: false,
            bookmarksCount: Math.max(0, article.bookmarks - 1)
        };
    }

    /**
     * Get user's bookmarked articles with pagination
     */
    async getUserBookmarks(
        userId: string,
        options: {
            page?: number;
            limit?: number;
            category?: string;
            search?: string;
            sortBy?: 'savedDate' | 'publishedDate';
        } = {}
    ): Promise<BookmarkListResult> {
        const {
            page = 1,
            limit = 20,
            category,
            search,
            sortBy = 'savedDate'
        } = options;

        // Build article filter
        const articleFilter: any = {};
        if (category) {
            articleFilter.category = category;
        }
        if (search) {
            articleFilter.$or = [
                { headline: { $regex: search, $options: 'i' } },
                { tldr: { $regex: search, $options: 'i' } },
                { summary: { $elemMatch: { $regex: search, $options: 'i' } } }
            ];
        }

        // Get bookmarks with populated articles
        const bookmarksQuery = Bookmark.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: 'articleId',
                match: Object.keys(articleFilter).length > 0 ? articleFilter : undefined,
                select: 'headline summary tldr emoji category source sourceUrl publishedAt imageUrl reactions bookmarks'
            });

        const bookmarks = await bookmarksQuery.lean();

        // Filter out nulls from populate match
        const articles = bookmarks
            .map(b => b.articleId as unknown as INewsArticle)
            .filter(Boolean);

        // Sort by published date if requested
        if (sortBy === 'publishedDate') {
            articles.sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
        }

        // Get total count
        const total = await Bookmark.countDocuments({ userId });

        return {
            articles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        };
    }

    /**
     * Check if user has bookmarked an article
     */
    async isBookmarked(userId: string, articleId: string): Promise<boolean> {
        const bookmark = await Bookmark.findOne({ userId, articleId });
        return !!bookmark;
    }

    /**
     * Get bookmark status for multiple articles
     */
    async getBookmarkStatus(userId: string, articleIds: string[]): Promise<Record<string, boolean>> {
        const bookmarks = await Bookmark.find({
            userId,
            articleId: { $in: articleIds }
        }).select('articleId');

        const status: Record<string, boolean> = {};
        articleIds.forEach(id => {
            status[id] = bookmarks.some(b => b.articleId.toString() === id);
        });

        return status;
    }

    /**
     * Remove all bookmarks for a user
     */
    async removeAllBookmarks(userId: string): Promise<{ removedCount: number }> {
        // Get all user's bookmarks
        const bookmarks = await Bookmark.find({ userId }).select('articleId');
        const articleIds = bookmarks.map(b => b.articleId);

        // Decrement bookmark counts on articles
        if (articleIds.length > 0) {
            await NewsArticle.updateMany(
                { _id: { $in: articleIds } },
                { $inc: { bookmarks: -1 } }
            );
        }

        // Delete all bookmarks
        const result = await Bookmark.deleteMany({ userId });

        return { removedCount: result.deletedCount };
    }

    /**
     * Export user's bookmarks as JSON
     */
    async exportBookmarks(userId: string): Promise<object[]> {
        const bookmarks = await Bookmark.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'articleId',
                select: 'headline summary tldr emoji category source sourceUrl publishedAt'
            })
            .lean();

        return bookmarks.map(b => {
            const article = b.articleId as any;
            return {
                savedAt: b.createdAt,
                headline: article?.headline,
                summary: article?.summary,
                tldr: article?.tldr,
                category: article?.category,
                source: article?.source,
                sourceUrl: article?.sourceUrl,
                publishedAt: article?.publishedAt
            };
        }).filter(b => b.headline); // Filter out deleted articles
    }

    /**
     * Get bookmark count for a user
     */
    async getBookmarkCount(userId: string): Promise<number> {
        return Bookmark.countDocuments({ userId });
    }
}

export const bookmarkService = new BookmarkService();
