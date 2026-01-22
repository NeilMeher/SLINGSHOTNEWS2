import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bookmark,
    Search,
    Filter,
    Trash2,
    Download,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { authService } from '../services/authService';


type Category = 'all' | 'tech' | 'money' | 'world' | 'politics' | 'science' | 'health';

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
    reactions?: {
        w: number;
        mid: number;
        cooked: number;
        cap: number;
    };
    userBookmarked?: boolean;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

interface SavedPageProps {
    onBack?: () => void;
    onArticleClick?: (articleId: string) => void;
}

const categories: { value: Category; label: string; emoji: string }[] = [
    { value: 'all', label: 'all', emoji: '📚' },
    { value: 'tech', label: 'tech', emoji: '💻' },
    { value: 'money', label: 'money', emoji: '💰' },
    { value: 'world', label: 'world', emoji: '🌍' },
    { value: 'politics', label: 'politics', emoji: '🏛️' },
    { value: 'science', label: 'science', emoji: '🔬' },
    { value: 'health', label: 'health', emoji: '🏥' }
];

const itemsPerPageOptions = [10, 20, 50];

// Helper to get URL params
const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        page: parseInt(params.get('page') || '1'),
        limit: parseInt(params.get('limit') || '20'),
        category: (params.get('category') || 'all') as Category,
        search: params.get('search') || ''
    };
};

// Helper to update URL params
const updateUrlParams = (params: { page?: number; limit?: number; category?: string; search?: string }) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
            url.searchParams.set(key, value.toString());
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url.toString());
};

export const SavedPage: React.FC<SavedPageProps> = ({ onBack, onArticleClick }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);

    // Read initial state from URL
    const urlParams = getUrlParams();
    const [currentPage, setCurrentPage] = useState(urlParams.page);
    const [itemsPerPage, setItemsPerPage] = useState(urlParams.limit);
    const [searchQuery, setSearchQuery] = useState(urlParams.search);
    const [selectedCategory, setSelectedCategory] = useState<Category>(urlParams.category);
    const [showFilters, setShowFilters] = useState(false);

    // Actions
    const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const fetchBookmarks = useCallback(async (page: number, limit: number) => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }

            const result = await authService.fetchWithAuth(`/v1/bookmarks?${params}`);

            if (result.success) {
                setArticles(result.data.articles);
                setPagination(result.data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch bookmarks', err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, searchQuery]);

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            const params = getUrlParams();
            setCurrentPage(params.page);
            setItemsPerPage(params.limit);
            setSelectedCategory(params.category);
            setSearchQuery(params.search);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Fetch when page, limit, category, or search changes
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchBookmarks(currentPage, itemsPerPage);
            updateUrlParams({
                page: currentPage,
                limit: itemsPerPage,
                category: selectedCategory,
                search: searchQuery
            });
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [currentPage, itemsPerPage, selectedCategory, searchQuery, fetchBookmarks]);

    const handleRemoveBookmark = async (articleId: string) => {
        try {
            const result = await authService.fetchWithAuth(`/v1/bookmarks/${articleId}`, {
                method: 'DELETE'
            });

            if (result.success) {
                setArticles(prev => prev.filter(a => a._id !== articleId));
                if (pagination) {
                    setPagination({ ...pagination, total: pagination.total - 1 });
                }
            }
        } catch (err) {
            console.error('Failed to remove bookmark', err);
        }
    };

    const handleRemoveAll = async () => {
        try {
            const result = await authService.fetchWithAuth('/v1/bookmarks', {
                method: 'DELETE'
            });

            if (result.success) {
                setArticles([]);
                setPagination(null);
                setShowRemoveAllConfirm(false);
            }
        } catch (err) {
            console.error('Failed to remove all bookmarks', err);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await authService.fetchWithAuth('/v1/bookmarks/export');

            if (result.success) {
                // Create and download JSON file
                const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `slingshot-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Failed to export bookmarks', err);
        } finally {
            setIsExporting(false);
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-white/5">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <Bookmark className="text-accent-pink" size={24} />
                                <h1 className="text-xl font-black tracking-tighter lowercase">
                                    saved
                                </h1>
                                {pagination && (
                                    <span className="text-sm text-white/30 font-bold">
                                        ({pagination.total})
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                disabled={isExporting || articles.length === 0}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition disabled:opacity-30"
                            >
                                {isExporting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Download size={18} />
                                )}
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-full transition ${showFilters ? 'bg-accent-pink text-white' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="search your saved articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm placeholder:text-white/30 focus:outline-none focus:border-accent-pink/50 transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4 pb-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setSelectedCategory(cat.value)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${selectedCategory === cat.value
                                                ? 'bg-accent-pink text-white'
                                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                                                }`}
                                        >
                                            <span>{cat.emoji}</span>
                                            <span>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-accent-pink border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : articles.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Bookmark size={32} className="text-white/20" />
                        </div>
                        <h2 className="text-xl font-black tracking-tighter lowercase mb-2">
                            no saved articles yet
                        </h2>
                        <p className="text-white/40 text-sm max-w-xs">
                            tap the bookmark icon on any article to save it for later 🔖
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* Remove All Button */}
                        {articles.length > 0 && (
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setShowRemoveAllConfirm(true)}
                                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition"
                                >
                                    <Trash2 size={14} />
                                    <span>remove all</span>
                                </button>
                            </div>
                        )}

                        {/* Articles List */}
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {articles.map((article, index) => (
                                    <motion.div
                                        key={article._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20, height: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 group"
                                    >
                                        <div
                                            className="flex gap-3 cursor-pointer"
                                            onClick={() => onArticleClick?.(article._id)}
                                        >
                                            {/* Thumbnail */}
                                            {article.imageUrl && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={article.imageUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2">
                                                    <h3 className="text-sm font-bold leading-tight line-clamp-2 lowercase flex-1">
                                                        {article.headline}
                                                    </h3>
                                                    <span className="text-lg flex-shrink-0">{article.emoji}</span>
                                                </div>

                                                <p className="text-xs text-white/40 mt-1 line-clamp-1 lowercase">
                                                    {article.tldr}
                                                </p>

                                                <div className="flex items-center gap-2 mt-2 text-[10px] text-white/30">
                                                    <span className="px-2 py-0.5 bg-white/5 rounded-full uppercase font-bold">
                                                        {article.category}
                                                    </span>
                                                    <span>{article.source}</span>
                                                    <span>•</span>
                                                    <span>{formatTimeAgo(article.publishedAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <div className="flex justify-end mt-3 pt-3 border-t border-white/5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveBookmark(article._id);
                                                }}
                                                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition"
                                            >
                                                <X size={14} />
                                                <span>remove</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination Controls */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-8 space-y-4">
                                {/* Items per page selector */}
                                <div className="flex items-center justify-center gap-2 text-xs">
                                    <span className="text-white/40">show:</span>
                                    {itemsPerPageOptions.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setItemsPerPage(option);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-3 py-1 rounded-lg font-bold transition ${itemsPerPage === option
                                                ? 'bg-accent-pink text-white'
                                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                    <span className="text-white/40">per page</span>
                                </div>

                                {/* Page navigation */}
                                <div className="flex items-center justify-center gap-2">
                                    {/* Previous button */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            const pages: (number | string)[] = [];
                                            const totalPages = pagination.totalPages;
                                            const current = currentPage;

                                            if (totalPages <= 7) {
                                                // Show all pages if 7 or fewer
                                                for (let i = 1; i <= totalPages; i++) {
                                                    pages.push(i);
                                                }
                                            } else {
                                                // Always show first page
                                                pages.push(1);

                                                if (current > 3) {
                                                    pages.push('...');
                                                }

                                                // Show pages around current
                                                const start = Math.max(2, current - 1);
                                                const end = Math.min(totalPages - 1, current + 1);

                                                for (let i = start; i <= end; i++) {
                                                    pages.push(i);
                                                }

                                                if (current < totalPages - 2) {
                                                    pages.push('...');
                                                }

                                                // Always show last page
                                                pages.push(totalPages);
                                            }

                                            return pages.map((page, idx) => {
                                                if (page === '...') {
                                                    return (
                                                        <span key={`ellipsis-${idx}`} className="px-2 text-white/20">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page as number)}
                                                        className={`min-w-[36px] h-9 px-3 rounded-lg font-bold text-sm transition ${currentPage === page
                                                            ? 'bg-accent-pink text-white'
                                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>

                                    {/* Next button */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                        disabled={currentPage === pagination.totalPages}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                {/* Page info */}
                                <div className="text-center text-xs text-white/30">
                                    showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} articles
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Remove All Confirmation Modal */}
            <AnimatePresence>
                {showRemoveAllConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                        onClick={() => setShowRemoveAllConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={28} className="text-red-400" />
                                </div>
                                <h3 className="text-lg font-black tracking-tighter lowercase mb-2">
                                    remove all bookmarks?
                                </h3>
                                <p className="text-white/40 text-sm mb-6">
                                    this will remove all {pagination?.total} saved articles.
                                    this action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRemoveAllConfirm(false)}
                                        className="flex-1 py-3 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition"
                                    >
                                        cancel
                                    </button>
                                    <button
                                        onClick={handleRemoveAll}
                                        className="flex-1 py-3 bg-red-500 rounded-2xl font-bold hover:bg-red-600 transition"
                                    >
                                        remove all
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
