import React, { useState, useEffect, useCallback } from 'react';
import { VerticalNewsCard } from './VerticalNewsCard';
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

interface VerticalNewsFeedProps {
    feedType?: 'latest' | 'trending';
    onNavigate?: (page: 'home' | 'trending' | 'profile') => void;
    activePage?: 'home' | 'trending' | 'profile';
}

export const VerticalNewsFeed: React.FC<VerticalNewsFeedProps> = ({
    feedType = 'latest',
    onNavigate,
    activePage = 'home'
}) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchArticles = useCallback(async (isInitial = false) => {
        if (loading) return;
        setLoading(true);

        try {
            // Use unlimited endpoint for regular feed
            const endpoint = feedType === 'trending' ? '/v1/news/trending' : '/v1/news/unlimited';

            // For unlimited feed, we just request more (no cursor needed currently)
            // For trending, we might use cursor if implemented, but currently it's just top 10
            let url = endpoint;

            if (feedType === 'trending') {
                url = `${endpoint}?limit=10`;
            } else {
                // Unlimited feed - request 10 at a time
                url = `${endpoint}?limit=10`;
            }

            // If using cursor based (old feed), keep logic:
            if (feedType !== 'trending' && !url.includes('unlimited') && cursor && !isInitial) {
                url += `&cursor=${cursor}`;
            }

            const result = await authService.fetchWithAuth(url);

            if (result.success) {
                let newArticles: Article[] = [];
                let nextCursor = null;
                let more = true;

                if (result.data.unlimited) {
                    // Handle unlimited feed response
                    newArticles = result.data.articles;
                    more = true; // Always has more
                    nextCursor = null;
                } else if (result.data.articles) {
                    // Handle standard paginated response
                    newArticles = result.data.articles;
                    nextCursor = result.data.nextCursor;
                    more = result.data.hasMore;
                } else if (Array.isArray(result.data)) {
                    // Handle trending response (direct array)
                    newArticles = result.data;
                    more = false; // Trending is fixed list usually
                }

                setArticles(prev => {
                    // Filter duplicates for unlimited feed
                    if (isInitial) return newArticles;

                    const existingIds = new Set(prev.map(a => a._id));
                    const uniqueNew = newArticles.filter(a => !existingIds.has(a._id));
                    return [...prev, ...uniqueNew];
                });

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

    const handleReact = async (articleId: string, type: string) => {
        try {
            const result = await authService.fetchWithAuth(`/v1/articles/${articleId}/react`, {
                method: 'POST',
                body: JSON.stringify({ type })
            });

            if (result.success) {
                setArticles(prev =>
                    prev.map(article =>
                        article._id === articleId
                            ? { ...article, reactions: result.data.reactions, userReaction: result.data.userReaction }
                            : article
                    )
                );
            }
        } catch (err) {
            console.error('react failed', err);
        }
    };

    const handleShare = async (articleId: string) => {
        const article = articles.find(a => a._id === articleId);
        if (article && navigator.share) {
            try {
                await navigator.share({
                    title: article.headline,
                    text: article.tldr,
                    url: article.sourceUrl
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        }
    };

    // Infinite scroll handler
    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 2 && hasMore && !loading) {
            fetchArticles(false);
        }
    };

    return (
        <div className="h-screen w-full bg-black relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 pointer-events-none">
                <div className="flex flex-col items-center justify-center py-6">
                    <h1 className="text-white text-2xl font-extrabold leading-none tracking-tight drop-shadow-2xl">SLINGSHOT</h1>
                    <span className="text-[10px] font-bold tracking-[0.4em] text-[#0791ed] mt-1 drop-shadow-md">NEWS</span>
                </div>
            </header>

            {/* Feed Container */}
            <main
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
                style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {loading && articles.length === 0 ? (
                    <div className="h-screen w-full flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#0791ed] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    articles.map((article) => (
                        <VerticalNewsCard
                            key={article._id}
                            article={article}
                            onReact={handleReact}
                            onShare={handleShare}
                        />
                    ))
                )}

                {/* Loading More */}
                {loading && articles.length > 0 && (
                    <div className="h-screen w-full flex items-center justify-center snap-start">
                        <div className="w-10 h-10 border-4 border-[#0791ed] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-black/60 backdrop-blur-2xl border-t border-white/10 z-50">
                <div className="flex items-center justify-between px-10 h-[68px] pb-safe">
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="flex flex-col items-center justify-center gap-1 group w-12"
                    >
                        <div className="relative">
                            <svg
                                className={`w-7 h-7 ${activePage === 'home' ? 'text-[#0791ed]' : 'text-gray-500 group-hover:text-white'} transition-colors`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                            {activePage === 'home' && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#0791ed] shadow-[0_0_12px_#0791ed]"></span>
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate?.('trending')}
                        className="flex flex-col items-center justify-center gap-1 group w-12"
                    >
                        <svg
                            className={`w-7 h-7 ${activePage === 'trending' ? 'text-[#0791ed]' : 'text-gray-500 group-hover:text-white'} transition-colors`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                        </svg>
                        {activePage === 'trending' && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#0791ed] shadow-[0_0_12px_#0791ed]"></span>
                        )}
                    </button>

                    <button
                        onClick={() => onNavigate?.('profile')}
                        className="flex flex-col items-center justify-center gap-1 group w-12"
                    >
                        <svg
                            className={`w-7 h-7 ${activePage === 'profile' ? 'text-[#0791ed]' : 'text-gray-500 group-hover:text-white'} transition-colors`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </button>
                </div>
            </nav>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            `}</style>
        </div>
    );
};
