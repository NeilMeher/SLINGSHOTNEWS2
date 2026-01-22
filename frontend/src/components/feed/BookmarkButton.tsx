import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
    articleId: string;
    isBookmarked?: boolean;
    bookmarkCount?: number;
    onToggle: (articleId: string) => Promise<{ bookmarked: boolean; bookmarksCount: number }>;
    showCount?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'pill';
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    articleId,
    isBookmarked = false,
    bookmarkCount = 0,
    onToggle,
    showCount = true,
    size = 'md',
    variant = 'default'
}) => {
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [count, setCount] = useState(bookmarkCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Size configurations
    const sizes = {
        sm: { icon: 16, text: '10px', padding: 'p-1.5' },
        md: { icon: 20, text: '12px', padding: 'p-2' },
        lg: { icon: 24, text: '14px', padding: 'p-3' }
    };

    const handleToggle = useCallback(async () => {
        if (isAnimating) return;

        setIsAnimating(true);

        // Optimistic update
        const previousBookmarked = bookmarked;
        const previousCount = count;

        setBookmarked(!bookmarked);
        setCount(bookmarked ? Math.max(0, count - 1) : count + 1);

        // Haptic feedback
        if (window.navigator.vibrate) {
            window.navigator.vibrate(30);
        }

        try {
            const result = await onToggle(articleId);
            setBookmarked(result.bookmarked);
            setCount(result.bookmarksCount);

            // Show toast
            setToastMessage(result.bookmarked ? 'saved for later 🔖' : 'removed from saved');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (error) {
            // Rollback on error
            setBookmarked(previousBookmarked);
            setCount(previousCount);
        } finally {
            setTimeout(() => setIsAnimating(false), 200);
        }
    }, [articleId, bookmarked, count, isAnimating, onToggle]);

    const formatCount = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    const sizeConfig = sizes[size];

    // Render based on variant
    if (variant === 'minimal') {
        return (
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleToggle}
                className={`${sizeConfig.padding} rounded-full transition-colors ${bookmarked
                    ? 'text-accent-pink'
                    : 'text-white/40 hover:text-white/60'
                    }`}
            >
                <motion.div
                    animate={{
                        scale: isAnimating ? [1, 1.3, 1] : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <Bookmark
                        size={sizeConfig.icon}
                        fill={bookmarked ? 'currentColor' : 'none'}
                    />
                </motion.div>
            </motion.button>
        );
    }

    if (variant === 'pill') {
        return (
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${bookmarked
                    ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/30'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                    }`}
            >
                <motion.div
                    animate={{
                        scale: isAnimating ? [1, 1.2, 1] : 1,
                        rotate: isAnimating ? [0, -10, 10, 0] : 0
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Bookmark
                        size={sizeConfig.icon}
                        fill={bookmarked ? 'currentColor' : 'none'}
                    />
                </motion.div>
                <span className="text-xs font-bold lowercase">
                    {bookmarked ? 'saved' : 'save'}
                </span>
                {showCount && count > 0 && (
                    <span className="text-xs opacity-60">
                        {formatCount(count)}
                    </span>
                )}
            </motion.button>
        );
    }

    // Default variant
    return (
        <div className="relative">
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleToggle}
                className={`flex items-center gap-2 ${sizeConfig.padding} rounded-full transition-all active:scale-90 ${bookmarked
                    ? 'text-accent-pink'
                    : 'text-white/40 hover:text-white/60'
                    }`}
            >
                <motion.div
                    animate={{
                        scale: isAnimating ? [1, 1.3, 1] : 1,
                        y: isAnimating && !bookmarked ? [0, -5, 0] : 0
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Bookmark
                        size={sizeConfig.icon}
                        fill={bookmarked ? 'currentColor' : 'none'}
                    />
                </motion.div>
                {showCount && count > 0 && (
                    <motion.span
                        key={count}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-bold"
                        style={{ fontSize: sizeConfig.text }}
                    >
                        {formatCount(count)}
                    </motion.span>
                )}
            </motion.button>

            {/* Floating bookmark icon animation */}
            <AnimatePresence>
                {isAnimating && !bookmarked && (
                    <motion.div
                        initial={{ y: 0, opacity: 1, scale: 1 }}
                        animate={{ y: -30, opacity: 0, scale: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    >
                        <Bookmark size={sizeConfig.icon} className="text-accent-pink" fill="currentColor" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-800 rounded-lg whitespace-nowrap text-xs font-bold shadow-lg"
                    >
                        {toastMessage}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
