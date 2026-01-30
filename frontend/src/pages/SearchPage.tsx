import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from '../components/common/SearchBar';
import { ArrowLeft, Search as SearchIcon, TrendingUp, Sparkles } from 'lucide-react';
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
    { value: 'all', label: 'all', emoji: '📚' },
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
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [trendingTopics] = useState(['AI Revolution', 'Climate Change', 'Space Exploration', 'Crypto Market']);

    const performSearch = useCallback(async (searchQuery: string, category: Category = 'all') => {
        if (!searchQuery || searchQuery.length < 2) {
            setArticles([]);
            return;
        }

        setLoading(true);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                page: '1',
                limit: '50'
            });

            if (category !== 'all') {
                params.append('category', category);
            }

            const result = await authService.fetchWithAuth(`/v1/news/search?${params}`);

            if (result.success) {
                setArticles(result.data.articles);
            }
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        performSearch(searchQuery, selectedCategory);
    };

    const handleCategoryChange = (category: Category) => {
        setSelectedCategory(category);
        if (query) {
            performSearch(query, category);
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

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            tech: 'from-blue-500 to-cyan-500',
            money: 'from-green-500 to-emerald-500',
            world: 'from-purple-500 to-pink-500',
            politics: 'from-red-500 to-orange-500',
            science: 'from-indigo-500 to-blue-500',
            health: 'from-pink-500 to-rose-500'
        };
        return colors[category] || 'from-gray-500 to-gray-600';
    };

    return (
        <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', 'Space Grotesk', sans-serif" }}>
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-xl border-b border-white/10">
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-2.5">
                            <SearchIcon className="text-[#0791ed]" size={26} />
                            <h1 className="text-2xl font-extrabold tracking-tight lowercase">
                                explore
                            </h1>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <SearchBar onSearch={handleSearch} showRecentSearches={false} />

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-2 scrollbar-hide">
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.value}
                                onClick={() => handleCategoryChange(cat.value)}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${selectedCategory === cat.value
                                        ? 'bg-[#0791ed] text-white shadow-lg shadow-[#0791ed]/30'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span className="text-sm">{cat.emoji}</span>
                                <span>{cat.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-[#0791ed] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : !query ? (
                    /* Initial State - Instagram Style */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Trending Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-[#0791ed]" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">
                                    trending topics
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {trendingTopics.map((topic, idx) => (
                                    <motion.button
                                        key={topic}
                                        onClick={() => handleSearch(topic)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-[#0791ed]/50 transition-all"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ background: `linear-gradient(135deg, #0791ed 0%, rgba(7, 145, 237, 0.3) 100%)` }}
                                        />
                                        <div className="relative h-full flex items-center justify-center p-4">
                                            <p className="text-sm font-bold text-center lowercase leading-tight">
                                                {topic}
                                            </p>
                                            <Sparkles className="absolute top-3 right-3 text-[#0791ed] opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Empty State */}
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#0791ed]/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
                                <SearchIcon size={40} className="text-white/30" />
                            </div>
                            <h2 className="text-xl font-extrabold tracking-tight lowercase mb-2">
                                discover news
                            </h2>
                            <p className="text-white/50 text-sm max-w-xs lowercase">
                                search for stories that match your vibe 🔥
                            </p>
                        </div>
                    </motion.div>
                ) : articles.length === 0 ? (
                    /* No Results */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <SearchIcon size={40} className="text-white/20" />
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight lowercase mb-2">
                            no results found
                        </h2>
                        <p className="text-white/50 text-sm max-w-xs lowercase">
                            try different keywords or browse trending topics
                        </p>
                    </motion.div>
                ) : (
                    /* Instagram-Style Grid */
                    <div>
                        <div className="mb-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                                {articles.length} results for "{query}"
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                            <AnimatePresence mode="popLayout">
                                {articles.map((article, index) => (
                                    <motion.div
                                        key={article._id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ delay: index * 0.02 }}
                                        onClick={() => onArticleClick?.(article._id)}
                                        className="relative aspect-square cursor-pointer group overflow-hidden rounded-sm"
                                    >
                                        {/* Background Image or Gradient */}
                                        {article.imageUrl ? (
                                            <img
                                                src={article.imageUrl}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(article.category)}`} />
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />

                                        {/* Category Badge */}
                                        <div className="absolute top-2 left-2">
                                            <span className="text-xs px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full font-bold uppercase text-white">
                                                {article.emoji}
                                            </span>
                                        </div>

                                        {/* Hover Content */}
                                        <div className="absolute inset-0 p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                            <p className="text-[10px] font-bold leading-tight line-clamp-3 lowercase">
                                                {article.headline}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[8px] text-white/60 lowercase">
                                                    {formatTimeAgo(article.publishedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
