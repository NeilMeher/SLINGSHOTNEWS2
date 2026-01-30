import React from 'react';

interface VerticalNewsCardProps {
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
        reactions?: {
            w: number;
            mid: number;
            cooked: number;
            cap: number;
        };
        userReaction?: string | null;
    };
    onReact: (articleId: string, type: string) => void;
    onShare?: (articleId: string) => void;
}

const categoryColors: Record<string, { bg: string; border: string; shadow: string; bullet: string }> = {
    tech: { bg: 'bg-[#0791ed]/90', border: 'border-[#0791ed]/50', shadow: 'shadow-[0_0_15px_rgba(7,145,237,0.5)]', bullet: 'bg-[#0791ed]' },
    money: { bg: 'bg-amber-500/90', border: 'border-amber-500/50', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', bullet: 'bg-amber-400' },
    world: { bg: 'bg-emerald-500/90', border: 'border-emerald-500/50', shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]', bullet: 'bg-emerald-400' },
    politics: { bg: 'bg-purple-500/90', border: 'border-purple-500/50', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]', bullet: 'bg-purple-400' },
    science: { bg: 'bg-cyan-500/90', border: 'border-cyan-500/50', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', bullet: 'bg-cyan-400' },
    health: { bg: 'bg-rose-500/90', border: 'border-rose-500/50', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]', bullet: 'bg-rose-400' },
};

const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
};

export const VerticalNewsCard: React.FC<VerticalNewsCardProps> = ({ article, onReact, onShare }) => {
    const colors = categoryColors[article.category] || categoryColors.world;
    const reactions = article.reactions || { w: 0, mid: 0, cooked: 0, cap: 0 };

    const handleReact = (type: string) => {
        onReact(article._id, type);
    };

    return (
        <article className="feed-slide relative bg-gray-900 flex flex-col overflow-hidden h-screen w-full snap-start snap-always">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    alt=""
                    className="w-full h-full object-cover scale-110 brightness-75 contrast-125"
                    src={article.imageUrl || `https://picsum.photos/seed/${article._id}/800/1200`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 via-60% to-black/80"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col pt-32 pb-24 px-5">
                <div className="w-full pr-16">
                    {/* Category & Time */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`flex h-6 px-3 items-center justify-center rounded-full ${colors.bg} backdrop-blur-sm border ${colors.border} ${colors.shadow}`}>
                            <p className="text-white text-[10px] font-black tracking-widest uppercase">{article.category}</p>
                        </div>
                        <span className="text-xs text-gray-300 font-medium drop-shadow-md">{formatTimeAgo(article.publishedAt)}</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-white text-3xl md:text-4xl leading-[1.05] font-black tracking-tight mb-5 drop-shadow-xl lowercase">
                        {article.headline || article.originalHeadline || 'loading...'} {article.emoji || '📰'}
                    </h2>

                    {/* Summary Bullets */}
                    <ul className="space-y-3 mb-6">
                        {(article.summary && article.summary.length > 0 ? article.summary :
                            article.originalSummary ? [article.originalSummary] : ['Loading content...']).slice(0, 3).map((point, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${colors.bullet} flex-shrink-0 shadow-[0_0_8px_currentColor]`}></span>
                                    <p className="text-gray-100 text-sm font-bold leading-snug drop-shadow-sm">{point}</p>
                                </li>
                            ))}
                    </ul>

                    {/* Source */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            <span className="text-black font-bold text-[8px] uppercase">{article.source.charAt(0)}</span>
                        </div>
                        <p className="text-gray-200 text-xs font-bold capitalize">{article.source}</p>
                    </div>
                </div>

                {/* Reaction Buttons - Right Side */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 mt-16 flex flex-col gap-5 items-center z-20">
                    {/* W Reaction */}
                    <button
                        onClick={() => handleReact('w')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform ${article.userReaction === 'w' ? 'ring-2 ring-[#0791ed]' : ''}`}>
                            <span className={`text-xl font-bold font-display ${article.userReaction === 'w' ? 'text-[#0791ed]' : 'text-white'}`}>W</span>
                        </div>
                        <span className={`text-[10px] font-bold ${article.userReaction === 'w' ? 'text-[#0791ed]' : ''}`}>{formatNumber(reactions.w)}</span>
                    </button>

                    {/* Mid Reaction */}
                    <button
                        onClick={() => handleReact('mid')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform ${article.userReaction === 'mid' ? 'ring-2 ring-[#0791ed]' : ''}`}>
                            <span className={`text-lg font-bold font-display ${article.userReaction === 'mid' ? 'text-[#0791ed]' : 'text-gray-300'}`}>mid</span>
                        </div>
                        <span className={`text-[10px] font-medium ${article.userReaction === 'mid' ? 'text-[#0791ed] font-bold' : 'opacity-80'}`}>{formatNumber(reactions.mid)}</span>
                    </button>

                    {/* Cooked Reaction */}
                    <button
                        onClick={() => handleReact('cooked')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform ${article.userReaction === 'cooked' ? 'ring-2 ring-[#0791ed]' : ''}`}>
                            <span className={`text-xl ${article.userReaction === 'cooked' ? 'text-[#0791ed]' : ''}`}>💀</span>
                        </div>
                        <span className={`text-[10px] font-medium ${article.userReaction === 'cooked' ? 'text-[#0791ed] font-bold' : 'opacity-80'}`}>{formatNumber(reactions.cooked)}</span>
                    </button>

                    {/* Cap Reaction */}
                    <button
                        onClick={() => handleReact('cap')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform ${article.userReaction === 'cap' ? 'ring-2 ring-[#0791ed]' : ''}`}>
                            <span className={`text-lg font-bold font-display ${article.userReaction === 'cap' ? 'text-[#0791ed]' : 'text-gray-300'}`}>cap</span>
                        </div>
                        <span className={`text-[10px] font-medium ${article.userReaction === 'cap' ? 'text-[#0791ed] font-bold' : 'opacity-80'}`}>{formatNumber(reactions.cap)}</span>
                    </button>

                    {/* Share Button */}
                    <button
                        onClick={() => onShare?.(article._id)}
                        className="mt-2 flex flex-col items-center gap-1"
                    >
                        <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-[10px] font-medium">Share</span>
                    </button>
                </div>

                {/* Read Original Button */}
                <div className="mt-auto w-full">
                    <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold hover:bg-white/20 flex items-center gap-1.5 transition-all shadow-lg"
                    >
                        Read Original
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </article>
    );
};
