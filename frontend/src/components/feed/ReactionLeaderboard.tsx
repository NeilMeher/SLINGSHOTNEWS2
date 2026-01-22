import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, TrendingUp, Clock } from 'lucide-react';
import { authService } from '../../services/authService';

type TimePeriod = 'day' | 'week' | 'month' | 'all';

interface LeaderboardArticle {
    rank: number;
    articleId: string;
    headline: string;
    emoji: string;
    category: string;
    source: string;
    imageUrl?: string;
    reactions: {
        w: number;
        mid: number;
        cooked: number;
        cap: number;
    };
    totalReactions: number;
    wPercentage: number;
    publishedAt: string;
}

interface LeaderboardProps {
    onArticleClick?: (articleId: string) => void;
}

const periodLabels: Record<TimePeriod, string> = {
    day: '24h',
    week: '7 days',
    month: '30 days',
    all: 'all time'
};

export const ReactionLeaderboard: React.FC<LeaderboardProps> = ({ onArticleClick }) => {
    const [articles, setArticles] = useState<LeaderboardArticle[]>([]);
    const [period, setPeriod] = useState<TimePeriod>('week');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const result = await authService.fetchWithAuth(`/v1/articles/leaderboard?limit=10&period=${period}`);
            if (result.success) {
                setArticles(result.data.articles);
            }
        } catch (err) {
            console.error('failed to fetch leaderboard', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return {
                    bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
                    border: 'border-yellow-500/50',
                    text: 'text-yellow-400',
                    icon: '👑'
                };
            case 2:
                return {
                    bg: 'bg-gradient-to-r from-gray-400/20 to-gray-300/20',
                    border: 'border-gray-400/50',
                    text: 'text-gray-300',
                    icon: '🥈'
                };
            case 3:
                return {
                    bg: 'bg-gradient-to-r from-amber-700/20 to-orange-700/20',
                    border: 'border-amber-600/50',
                    text: 'text-amber-500',
                    icon: '🥉'
                };
            default:
                return {
                    bg: 'bg-white/5',
                    border: 'border-white/10',
                    text: 'text-white/50',
                    icon: `#${rank}`
                };
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
        <div className="bg-black min-h-screen text-white p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Trophy size={28} className="text-yellow-400" />
                    <h1 className="text-2xl font-black tracking-tighter lowercase">
                        w leaderboard 🔥
                    </h1>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${period === p
                                    ? 'bg-accent-pink text-white'
                                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                                }`}
                        >
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {periodLabels[p]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-accent-pink border-t-transparent rounded-full animate-spin" />
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-white/30 text-lg">no articles yet 💀</p>
                </div>
            ) : (
                /* Leaderboard Items */
                <motion.div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {articles.map((article, index) => {
                            const style = getRankStyle(article.rank);

                            return (
                                <motion.div
                                    key={article.articleId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onArticleClick?.(article.articleId)}
                                    className={`${style.bg} ${style.border} border rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Rank */}
                                        <div className={`${style.text} font-black text-lg min-w-[32px] text-center`}>
                                            {typeof style.icon === 'string' && style.icon.startsWith('#')
                                                ? style.icon
                                                : <span className="text-xl">{style.icon}</span>
                                            }
                                        </div>

                                        {/* Article Image (if available) */}
                                        {article.imageUrl && (
                                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                                <img
                                                    src={article.imageUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-2 mb-1">
                                                <h3 className="text-sm font-bold leading-tight line-clamp-2 lowercase flex-1">
                                                    {article.headline}
                                                </h3>
                                                <span className="text-lg flex-shrink-0">{article.emoji}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-[10px] text-white/40">
                                                <span className="uppercase font-bold">{article.category}</span>
                                                <span>•</span>
                                                <span>{article.source}</span>
                                                <span>•</span>
                                                <span>{formatTimeAgo(article.publishedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Bar */}
                                    <div className="mt-3 flex items-center gap-4">
                                        {/* W Count */}
                                        <div className="flex items-center gap-1">
                                            <Flame size={16} className="text-orange-500" />
                                            <span className="text-sm font-black text-orange-400">
                                                {article.reactions.w}
                                            </span>
                                        </div>

                                        {/* W Percentage */}
                                        <div className="flex-1">
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${article.wPercentage}%` }}
                                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Percentage Label */}
                                        <span className="text-xs font-bold text-white/40">
                                            {article.wPercentage}% W
                                        </span>

                                        {/* Total Reactions */}
                                        <div className="flex items-center gap-1 text-white/30">
                                            <TrendingUp size={12} />
                                            <span className="text-xs font-bold">
                                                {article.totalReactions}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reaction Breakdown Mini */}
                                    <div className="mt-2 flex gap-3 text-[10px]">
                                        <span className="text-orange-400">🔥 {article.reactions.w}</span>
                                        <span className="text-yellow-400">😐 {article.reactions.mid}</span>
                                        <span className="text-gray-400">💀 {article.reactions.cooked}</span>
                                        <span className="text-blue-400">🧢 {article.reactions.cap}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};
