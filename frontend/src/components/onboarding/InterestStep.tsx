import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InterestStepProps {
    onNext: (interests: string[]) => void;
}

export const InterestStep: React.FC<InterestStepProps> = ({ onNext }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const interests = [
        { id: 'tech', emoji: '💻', label: 'tech' },
        { id: 'money', emoji: '💸', label: 'money' },
        { id: 'world', emoji: '🌍', label: 'world' },
        { id: 'politics', emoji: '🏛️', label: 'politics' },
        { id: 'science', emoji: '🔬', label: 'science' },
        { id: 'health', emoji: '💊', label: 'health' }
    ];

    const toggleInterest = (id: string) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto"
        >
            <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-center">
                what's your vibe?
            </h1>
            <p className="text-gray-400 mb-10 text-lg">pick at least one to start</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-10">
                {interests.map(interest => (
                    <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${selected.includes(interest.id)
                                ? 'border-purple-500 bg-purple-500/20 scale-[1.02] shadow-xl shadow-purple-500/10'
                                : 'border-white/5 bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        <div className="text-5xl">{interest.emoji}</div>
                        <div className="text-lg font-bold tracking-wide uppercase">{interest.label}</div>
                    </button>
                ))}
            </div>

            <button
                onClick={() => selected.length > 0 && onNext(selected)}
                disabled={selected.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl py-4 font-bold text-xl shadow-lg shadow-purple-500/20 transform active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
                continue ({selected.length} selected)
            </button>
        </motion.div>
    );
};
