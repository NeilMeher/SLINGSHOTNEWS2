import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, TrendingUp, Clock } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    minLength?: number;
    debounceMs?: number;
    showRecentSearches?: boolean;
    className?: string;
}

const RECENT_SEARCHES_KEY = 'slingshot_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'search articles...',
    minLength = 2,
    debounceMs = 300,
    showRecentSearches = true,
    className = ''
}) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout>();

    // Load recent searches from localStorage
    useEffect(() => {
        if (showRecentSearches) {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                try {
                    setRecentSearches(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse recent searches', e);
                }
            }
        }
    }, [showRecentSearches]);

    // Save to recent searches
    const saveToRecentSearches = useCallback((searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < minLength) return;

        setRecentSearches(prev => {
            const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [minLength]);

    // Debounced search
    const handleSearch = useCallback((searchQuery: string) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (searchQuery.length === 0) {
            onSearch('');
            setIsSearching(false);
            return;
        }

        if (searchQuery.length < minLength) {
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        debounceTimer.current = setTimeout(() => {
            onSearch(searchQuery);
            saveToRecentSearches(searchQuery);
            setIsSearching(false);
            setShowSuggestions(false);
        }, debounceMs);
    }, [onSearch, minLength, debounceMs, saveToRecentSearches]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        handleSearch(value);
    };

    // Clear search
    const handleClear = () => {
        setQuery('');
        onSearch('');
        setIsSearching(false);
        inputRef.current?.focus();
    };

    // Select from recent searches
    const handleSelectRecent = (searchQuery: string) => {
        setQuery(searchQuery);
        onSearch(searchQuery);
        setShowSuggestions(false);
    };

    // Clear recent searches
    const handleClearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    // Handle focus
    const handleFocus = () => {
        if (showRecentSearches && recentSearches.length > 0 && !query) {
            setShowSuggestions(true);
        }
    };

    // Handle blur with delay to allow clicking suggestions
    const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm placeholder:text-white/30 focus:outline-none focus:border-accent-pink/50 transition"
                />

                {/* Loading or Clear Button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                        {isSearching ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Loader2 size={16} className="animate-spin text-accent-pink" />
                            </motion.div>
                        ) : query ? (
                            <motion.button
                                key="clear"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleClear}
                                className="text-white/30 hover:text-white transition"
                            >
                                <X size={16} />
                            </motion.button>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            {/* Minimum character hint */}
            {query.length > 0 && query.length < minLength && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-white/30 mt-1 ml-1"
                >
                    type at least {minLength} characters to search
                </motion.p>
            )}

            {/* Recent Searches Dropdown */}
            <AnimatePresence>
                {showSuggestions && recentSearches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                    >
                        <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2">
                                <div className="flex items-center gap-2 text-xs text-white/40 uppercase font-bold">
                                    <Clock size={12} />
                                    <span>recent searches</span>
                                </div>
                                <button
                                    onClick={handleClearRecent}
                                    className="text-xs text-white/30 hover:text-white transition"
                                >
                                    clear
                                </button>
                            </div>

                            {recentSearches.map((search, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleSelectRecent(search)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition text-left group"
                                >
                                    <Search size={14} className="text-white/20 group-hover:text-accent-pink transition" />
                                    <span className="text-sm text-white/70 group-hover:text-white transition">
                                        {search}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
