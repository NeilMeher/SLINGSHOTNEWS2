import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ReactionType = 'w' | 'mid' | 'cooked' | 'cap';

interface Reactions {
    w: number;
    mid: number;
    cooked: number;
    cap: number;
}

interface ReactionBarProps {
    articleId: string;
    initialReactions?: Reactions;
    initialUserReaction?: ReactionType | null;
    onReact: (type: ReactionType) => Promise<void>;
}

interface FloatingEmoji {
    id: number;
    emoji: string;
    x: number;
}

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
}

const reactionButtons: Array<{
    type: ReactionType;
    emoji: string;
    label: string;
    color: string;
    bgActive: string;
}> = [
        { type: 'w', emoji: '🔥', label: 'W', color: '#FF6B35', bgActive: 'rgba(255, 107, 53, 0.2)' },
        { type: 'mid', emoji: '😐', label: 'mid', color: '#FFD700', bgActive: 'rgba(255, 215, 0, 0.2)' },
        { type: 'cooked', emoji: '💀', label: 'cooked', color: '#8B8B8B', bgActive: 'rgba(139, 139, 139, 0.2)' },
        { type: 'cap', emoji: '🧢', label: 'cap', color: '#3B82F6', bgActive: 'rgba(59, 130, 246, 0.2)' }
    ];

export const ReactionBar: React.FC<ReactionBarProps> = ({
    articleId,
    initialReactions = { w: 0, mid: 0, cooked: 0, cap: 0 },
    initialUserReaction = null,
    onReact
}) => {
    const [reactions, setReactions] = useState<Reactions>(initialReactions);
    const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction);
    const [isAnimating, setIsAnimating] = useState<ReactionType | null>(null);
    const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
    const emojiCounter = useRef(0);

    // Update state when initial props change
    useEffect(() => {
        setReactions(initialReactions);
        setUserReaction(initialUserReaction);
    }, [initialReactions, initialUserReaction]);

    // Trigger haptic feedback
    const triggerHaptic = useCallback(() => {
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
    }, []);

    // Create floating emoji effect
    const createFloatingEmoji = useCallback((emoji: string) => {
        const id = emojiCounter.current++;
        const x = Math.random() * 60 - 30; // Random x offset

        setFloatingEmojis(prev => [...prev, { id, emoji, x }]);

        // Remove after animation
        setTimeout(() => {
            setFloatingEmojis(prev => prev.filter(e => e.id !== id));
        }, 1000);
    }, []);

    // Create confetti effect for 'w' reactions
    const createConfetti = useCallback(() => {
        const colors = ['#FF6B35', '#FFD700', '#FF1493', '#00FF00', '#00BFFF'];
        const pieces: ConfettiPiece[] = [];

        for (let i = 0; i < 12; i++) {
            pieces.push({
                id: Date.now() + i,
                x: Math.random() * 100 - 50,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        setConfetti(pieces);

        setTimeout(() => {
            setConfetti([]);
        }, 1500);
    }, []);

    const handleReact = useCallback(async (type: ReactionType) => {
        // Prevent double clicks during animation
        if (isAnimating) return;

        setIsAnimating(type);
        triggerHaptic();

        // Find the reaction button config
        const btn = reactionButtons.find(b => b.type === type);

        // Optimistic UI update
        const previousUserReaction = userReaction;
        const previousReactions = { ...reactions };

        if (userReaction === type) {
            // Toggle off (remove reaction)
            setUserReaction(null);
            setReactions(prev => ({
                ...prev,
                [type]: Math.max(0, prev[type] - 1)
            }));
        } else {
            // Add or change reaction
            if (previousUserReaction) {
                // Decrement previous reaction
                setReactions(prev => ({
                    ...prev,
                    [previousUserReaction]: Math.max(0, prev[previousUserReaction] - 1)
                }));
            }
            setUserReaction(type);
            setReactions(prev => ({
                ...prev,
                [type]: prev[type] + 1
            }));

            // Visual effects
            if (btn) {
                createFloatingEmoji(btn.emoji);
            }

            // Extra confetti for 'w' reactions
            if (type === 'w') {
                createConfetti();
            }
        }

        try {
            await onReact(type);
        } catch (error) {
            // Rollback on error
            setUserReaction(previousUserReaction);
            setReactions(previousReactions);
        } finally {
            setTimeout(() => setIsAnimating(null), 200);
        }
    }, [userReaction, reactions, isAnimating, onReact, triggerHaptic, createFloatingEmoji, createConfetti]);

    // Format count (1.2k, 2.5M, etc.)
    const formatCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <div className="relative">
            {/* Confetti Effect */}
            <AnimatePresence>
                {confetti.map((piece) => (
                    <motion.div
                        key={piece.id}
                        initial={{ y: 0, x: piece.x, opacity: 1, scale: 0 }}
                        animate={{
                            y: -80,
                            x: piece.x + (Math.random() - 0.5) * 40,
                            opacity: 0,
                            scale: 1,
                            rotate: Math.random() * 360
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute left-1/2 bottom-full pointer-events-none"
                        style={{ backgroundColor: piece.color }}
                    >
                        <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: piece.color }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Floating Emojis */}
            <AnimatePresence>
                {floatingEmojis.map((emoji) => (
                    <motion.span
                        key={emoji.id}
                        initial={{ y: 0, x: emoji.x, opacity: 1, scale: 0.5 }}
                        animate={{ y: -60, opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute left-1/2 bottom-full text-2xl pointer-events-none"
                    >
                        {emoji.emoji}
                    </motion.span>
                ))}
            </AnimatePresence>

            <div className="emoji-bar">
                {reactionButtons.map((btn) => {
                    const isActive = userReaction === btn.type;
                    const count = reactions[btn.type];

                    return (
                        <motion.button
                            key={btn.type}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.85 }}
                            animate={{
                                scale: isAnimating === btn.type ? [1, 1.3, 1] : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            onClick={() => handleReact(btn.type)}
                            className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
                            style={{
                                backgroundColor: isActive ? btn.bgActive : 'transparent',
                            }}
                        >
                            {/* Active Indicator Ring */}
                            {isActive && (
                                <motion.div
                                    layoutId={`ring-${articleId}`}
                                    className="absolute inset-0 rounded-2xl border-2"
                                    style={{ borderColor: btn.color }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}

                            {/* Emoji */}
                            <motion.span
                                className="text-2xl"
                                animate={{
                                    rotate: isActive ? [0, -10, 10, 0] : 0,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {btn.emoji}
                            </motion.span>

                            {/* Label + Count */}
                            <div className="flex items-center gap-1">
                                <span
                                    className="text-[8px] font-bold uppercase tracking-tighter transition-colors"
                                    style={{ color: isActive ? btn.color : 'rgba(255,255,255,0.3)' }}
                                >
                                    {btn.label}
                                </span>
                                {count > 0 && (
                                    <motion.span
                                        key={count}
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-[10px] font-black"
                                        style={{ color: isActive ? btn.color : 'rgba(255,255,255,0.5)' }}
                                    >
                                        {formatCount(count)}
                                    </motion.span>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

