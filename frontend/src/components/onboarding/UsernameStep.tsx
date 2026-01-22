import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UsernameStepProps {
    onNext: (username: string) => void;
}

export const UsernameStep: React.FC<UsernameStepProps> = ({ onNext }) => {
    const [username, setUsername] = useState('');
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (username.length >= 3) {
                setChecking(true);
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/check-username/${username}`);
                    const result = await response.json();
                    setAvailable(result.data.available);
                } catch (err) {
                    console.error('failed to check username', err);
                }
                setChecking(false);
            } else {
                setAvailable(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [username]);

    const isValid = username.length >= 3 && /^[a-z0-9_]+$/.test(username);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto"
        >
            <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                pick a name
            </h1>
            <p className="text-gray-400 mb-10 text-lg">make it unique, no cap 🧢</p>

            <div className="w-full relative">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                    placeholder="yourname"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                />

                <div className="h-6 mt-2 px-2">
                    {checking && <p className="text-sm text-blue-400 animate-pulse">checking vibes...</p>}
                    {!checking && available === true && isValid && (
                        <p className="text-sm text-green-400 flex items-center gap-1">
                            <span>✅</span> looking good!
                        </p>
                    )}
                    {!checking && available === false && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                            <span>❌</span> already taken, try again
                        </p>
                    )}
                    {!checking && username.length > 0 && !isValid && (
                        <p className="text-sm text-yellow-500">min 3 chars, lowercase & underscores only</p>
                    )}
                </div>
            </div>

            <button
                onClick={() => available && isValid && onNext(username)}
                disabled={!available || !isValid || checking}
                className={`mt-12 w-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl py-4 font-bold text-xl shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all disabled:opacity-30 disabled:grayscale`}
            >
                continue
            </button>
        </motion.div>
    );
};
