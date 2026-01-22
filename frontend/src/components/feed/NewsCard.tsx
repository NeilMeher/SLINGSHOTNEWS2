import React from 'react';
import { motion } from 'framer-motion';
import { ReactionBar } from './ReactionBar';
import { BookmarkButton } from './BookmarkButton';
import { Share2, ExternalLink } from 'lucide-react';
import { authService } from '../../services/authService';

type ReactionType = 'w' | 'mid' | 'cooked' | 'cap';

interface Reactions {
    w: number;
    mid: number;
    cooked: number;
    cap: number;
}

interface NewsCardProps {
    article: {
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
    };
    onReact: (articleId: string, type: string) => Promise<void>;
    onBookmark: (articleId: string) => Promise<{ bookmarked: boolean; bookmarksCount: number }>;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onReact, onBookmark }) => {
    const formatTimeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    const handleReact = async (type: ReactionType): Promise<void> => {
        // Haptic feedback is now handled in ReactionBar
        await onReact(article._id, type);
    };

    const trackView = async () => {
        try {
            await authService.fetchWithAuth(`/v1/news/${article._id}/view`, { method: 'POST' });
        } catch (err) {
            // handle error silently
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: article.headline,
            text: article.tldr,
            url: article.sourceUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(article.sourceUrl);
            }
        } catch (err) {
            // User cancelled or error
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            onViewportEnter={trackView}
            viewport={{ once: true, amount: 0.5 }}
            className="h-screen w-full snap-start flex flex-col bg-black text-white relative overflow-hidden"
        >
            {/* Background Image / Blur Accent */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {article.imageUrl ? (
                    <>
                        <img
                            src={article.imageUrl}
                            className="w-full h-full object-cover opacity-30 blur-[80px] scale-150"
                            alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-accent-pink/10 via-black to-accent-blue/10" />
                )}
            </div>

            <div className="relative z-10 flex flex-col h-full p-6 pt-16">
                {/* Image Card */}
                {article.imageUrl && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-2xl shadow-white/5 border border-white/10"
                    >
                        <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                )}

                {/* Category & Time */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-accent-blue/20 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
                        {article.category}
                    </span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                        {formatTimeAgo(article.publishedAt)}
                    </span>
                    <span className="ml-auto text-xs text-white/20 font-mono tracking-tighter">
                        gen-z verified ✅
                    </span>
                </div>

                {/* Headline */}
                <h2 className="text-3xl font-black mb-4 leading-tight tracking-tighter lowercase">
                    {article.headline} <span className="text-4xl">{article.emoji}</span>
                </h2>

                {/* TLDR */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6 group">
                    <p className="text-[10px] font-black text-accent-yellow uppercase mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-accent-yellow rounded-full animate-pulse" />
                        tldr;
                    </p>
                    <p className="text-sm italic text-white/80 leading-relaxed font-medium">
                        "{article.tldr}"
                    </p>
                </div>

                {/* Summary Bullets */}
                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                    {article.summary.map((point, i) => (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className="flex gap-4"
                        >
                            <span className="text-accent-pink font-bold flex-shrink-0 mt-1">/</span>
                            <p className="text-base text-white/70 leading-snug lowercase">
                                {point}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Post Interaction */}
                <div className="mt-auto pt-6 space-y-6">
                    <ReactionBar
                        articleId={article._id}
                        initialReactions={article.reactions || { w: 0, mid: 0, cooked: 0, cap: 0 }}
                        initialUserReaction={article.userReaction}
                        onReact={handleReact}
                    />

                    <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-3">
                        <BookmarkButton
                            articleId={article._id}
                            isBookmarked={article.userBookmarked}
                            bookmarkCount={article.bookmarks}
                            onToggle={onBookmark}
                            variant="minimal"
                        />

                        <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] text-white/20 font-bold uppercase hover:text-white transition-colors"
                        >
                            <ExternalLink size={12} />
                            source: {article.source}
                        </a>

                        <button
                            onClick={handleShare}
                            className="text-white/40 hover:text-white transition-all active:scale-90"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


