import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface RegionStepProps {
    onNext: (region: string) => void;
}

export const RegionStep: React.FC<RegionStepProps> = ({ onNext }) => {
    const [region, setRegion] = useState<string | null>(null);

    const regions = [
        { code: 'US', flag: '🇺🇸', label: 'united states' },
        { code: 'UK', flag: '🇬🇧', label: 'united kingdom' },
        { code: 'CA', flag: '🇨🇦', label: 'canada' },
        { code: 'AU', flag: '🇦🇺', label: 'australia' },
        { code: 'IN', flag: '🇮🇳', label: 'india' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto"
        >
            <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                where you at?
            </h1>
            <p className="text-gray-400 mb-10 text-lg text-center">we'll bring the local heat 🔥</p>

            <div className="w-full space-y-4 mb-10">
                {regions.map(r => (
                    <button
                        key={r.code}
                        onClick={() => setRegion(r.code)}
                        className={`w-full flex items-center gap-6 p-5 rounded-3xl transition-all duration-300 border-2 ${region === r.code
                                ? 'bg-emerald-500 border-emerald-400 shadow-xl shadow-emerald-500/20 scale-[1.02]'
                                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <span className="text-4xl transform scale-110">{r.flag}</span>
                        <span className="text-xl font-bold tracking-tight">{r.label}</span>
                        {region === r.code && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto text-2xl"
                            >
                                ✨
                            </motion.span>
                        )}
                    </button>
                ))}
            </div>

            <button
                onClick={() => region && onNext(region)}
                disabled={!region}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-2xl py-4 font-bold text-xl shadow-lg shadow-emerald-500/20 transform active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
                let's go 🚀
            </button>
        </motion.div>
    );
};
