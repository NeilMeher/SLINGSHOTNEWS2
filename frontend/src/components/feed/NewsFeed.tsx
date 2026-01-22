import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { NewsCard } from './NewsCard';
import { authService } from '../../services/authService';

type ReactionType = 'w' | 'mid' | 'cooked' | 'cap';

interface Reactions {
    w: number;
    mid: number;
    cooked: number;
    cap: number;
}

interface Article {
    _id: string;
    headline: string;
    summary: string[];
    tldr: string;
    emoji: string;
    category: string;
    source: string;
    sourceUrl: string;
    publishedAt: string;
    imageUrl?: string;
    reactions?: Reactions;
    userReaction?: ReactionType | null;
    userBookmarked?: boolean;
    bookmarks?: number;
}

interface NewsFeedProps {
    feedType?: 'latest' | 'trending';
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ feedType = 'latest' }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchArticles = useCallback(async (isInitial = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const endpoint = feedType === 'trending' ? '/v1/news/trending' : '/v1/news/feed';
            const url = isInitial
                ? `${endpoint}?limit=10`
                : `${endpoint}?limit=10&cursor=${cursor}`;

            const result = await authService.fetchWithAuth(url);

            if (result.success) {
                const newArticles = feedType === 'trending' ? result.data : result.data.articles;
                const nextCursor = feedType === 'trending' ? null : result.data.nextCursor;
                const more = feedType === 'trending' ? false : result.data.hasMore;

                setArticles(prev => isInitial ? newArticles : [...prev, ...newArticles]);
                setCursor(nextCursor);
                setHasMore(more);
            }
        } catch (err) {
            console.error('failed to fetch feed', err);
        } finally {
            setLoading(false);
        }
    }, [feedType, cursor, loading]);

    useEffect(() => {
        fetchArticles(true);
    }, [feedType]);

    const handleReact = async (articleId: string, type: string): Promise<void> => {
        try {
            // Use the new article-specific endpoint
            const result = await authService.fetchWithAuth(`/v1/articles/${articleId}/react`, {
                method: 'POST',
                body: JSON.stringify({ type })
            });

            if (result.success) {
                // Update article with server response
                setArticles(prev => prev.map(a =>
                    a._id === articleId
                        ? {
                            ...a,
                            reactions: result.data.reactions,
                            userReaction: result.data.userReaction
                        }
                        : a
                ));
            }
        } catch (err) {
            console.error('reaction failed', err);
            throw err; // Rethrow for ReactionBar rollback
        }
    };

    const handleBookmark = async (articleId: string): Promise<{ bookmarked: boolean; bookmarksCount: number }> => {
        try {
            // Use the article-specific endpoint
            const result = await authService.fetchWithAuth(`/v1/articles/${articleId}/bookmark`, {
                method: 'POST'
            });

            if (result.success) {
                setArticles(prev => prev.map(a =>
                    a._id === articleId
                        ? {
                            ...a,
                            userBookmarked: result.data.bookmarked,
                            bookmarks: result.data.bookmarksCount
                        }
                        : a
                ));
                return {
                    bookmarked: result.data.bookmarked,
                    bookmarksCount: result.data.bookmarksCount
                };
            }
            throw new Error('Bookmark failed');
        } catch (err) {
            console.error('bookmark failed', err);
            throw err;
        }
    };


    return (
        <div id="scrollableDiv" className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
            <InfiniteScroll
                dataLength={articles.length}
                next={() => fetchArticles()}
                hasMore={hasMore}
                loader={
                    <div className="h-screen flex items-center justify-center bg-black">
                        <div className="w-12 h-12 border-4 border-accent-pink border-t-transparent rounded-full animate-spin" />
                    </div>
                }
                scrollableTarget="scrollableDiv"
                endMessage={
                    <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
                        <p className="text-white/20 font-black text-2xl lowercase italic tracking-tighter">
                            you're all caught up on the vibes 🚀
                        </p>
                    </div>
                }
            >
                {articles.map((article) => (
                    <NewsCard
                        key={article._id}
                        article={article}
                        onReact={handleReact}
                        onBookmark={handleBookmark}
                    />
                ))}
            </InfiniteScroll>
        </div>
    );
};

