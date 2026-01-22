import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { ArrowLeft, Search as SearchIcon, Filter } from 'lucide-react';
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
}

interface SearchPageProps {
    onBack?: () => void;
    onArticleClick?: (articleId: string) => void;
}

const categories: { value: Category; label: string; emoji: string }[] = [
    { value: 'all', label: 'all categories', emoji: '📚' },
    { value: 'tech', label: 'tech', emoji: '💻' },
    { value: 'money', label: 'money', emoji: '💰' },
    { value: 'world', label: 'world', emoji: '🌍' },
    { value: 'politics', label: 'politics', emoji: '🏛️' },
    { value: 'science', label: 'science', emoji: '🔬' },
    { value: 'health', label: 'health', emoji: '🏥' }
];

export const SearchPage: React.FC<SearchPageProps> = ({ onBack, onArticleClick }) => {
    const [query, setQuery] = useState('');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [showFilters, setShowFilters] = useState(false);

    const performSearch = useCallback(async (searchQuery: string, page: number = 1, category: Category = 'all') => {
        if (!searchQuery || searchQuery.length < 2) {
            setArticles([]);
            setTotalResults(0);
            return;
        }

        setLoading(true);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                page: page.toString(),
                limit: '20'
            });

            if (category !== 'all') {
                params.append('category', category);
            }

            const result = await authService.fetchWithAuth(`/v1/news/search?${params}`);

            if (result.success) {
                setArticles(result.data.articles);
                setTotalResults(result.data.pagination.total);
                setTotalPages(result.data.pagination.totalPages);
                setCurrentPage(result.data.pagination.page);
            }
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        setCurrentPage(1);
        performSearch(searchQuery, 1, selectedCategory);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        performSearch(query, page, selectedCategory);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (category: Category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        performSearch(query, 1, category);
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

    // Highlight matching text
    const highlightText = (text: string, search: string) => {
        if (!search) return text;

        const parts = text.split(new RegExp(`(${search})`, 'gi'));
        return parts.map((part, idx) =>
            part.toLowerCase() === search.toLowerCase() ? (
                <mark key={idx} className="bg-accent-yellow/30 text-white px-0.5 rounded">
                    {part}
                </mark>
            ) : part
        );
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-white/5">
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            <SearchIcon className="text-accent-pink" size={24} />
                            <h1 className="text-xl font-black tracking-tighter lowercase">
                                search
                            </h1>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <SearchBar onSearch={handleSearch} showRecentSearches={true} />

                    {/* Category Filter Toggle */}
                    {query && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${showFilters ? 'bg-accent-pink text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                <Filter size={14} />
                                <span>filter by category</span>
                            </button>
                        </div>
                    )}

                    {/* Category Filters */}
                    <AnimatePresence>
                        {showFilters && query && (
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
                                            onClick={() => handleCategoryChange(cat.value)}
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

                    {/* Results Count */}
                    {query && !loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-xs text-white/40"
                        >
                            {totalResults > 0 ? (
                                <span>found <strong className="text-accent-pink">{totalResults}</strong> results for "{query}"</span>
                            ) : (
                                <span>no results found for "{query}"</span>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-accent-pink border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : !query ? (
                    /* Initial State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <SearchIcon size={32} className="text-white/20" />
                        </div>
                        <h2 className="text-xl font-black tracking-tighter lowercase mb-2">
                            search slingshot news
                        </h2>
                        <p className="text-white/40 text-sm max-w-xs">
                            find articles by keyword, topic, or category 🔍
                        </p>
                    </motion.div>
                ) : articles.length === 0 ? (
                    /* No Results */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <SearchIcon size={32} className="text-white/20" />
                        </div>
                        <h2 className="text-xl font-black tracking-tighter lowercase mb-2">
                            no results found
                        </h2>
                        <p className="text-white/40 text-sm max-w-xs">
                            try different keywords or check your spelling
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* Results List */}
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {articles.map((article, index) => (
                                    <motion.div
                                        key={article._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-accent-pink/30 transition cursor-pointer group"
                                        onClick={() => onArticleClick?.(article._id)}
                                    >
                                        <div className="flex gap-3">
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
                                                        {highlightText(article.headline, query)}
                                                    </h3>
                                                    <span className="text-lg flex-shrink-0">{article.emoji}</span>
                                                </div>

                                                <p className="text-xs text-white/40 mt-1 line-clamp-2 lowercase">
                                                    {highlightText(article.tldr, query)}
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
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    totalItems={totalResults}
                                    itemsPerPage={20}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
