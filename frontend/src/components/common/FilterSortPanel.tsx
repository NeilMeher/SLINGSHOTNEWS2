import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

type Category = 'all' | 'tech' | 'money' | 'world' | 'politics' | 'science' | 'health';
type SortField = 'publishedAt' | 'views' | 'bookmarks' | 'trendingScore';
type SortOrder = 'asc' | 'desc';

interface FilterOptions {
    category: Category;
    region: string;
    dateFrom?: string;
    dateTo?: string;
    minViews?: number;
    minBookmarks?: number;
}

interface SortOptions {
    field: SortField;
    order: SortOrder;
}

interface FilterSortPanelProps {
    filters: FilterOptions;
    sort: SortOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onSortChange: (sort: SortOptions) => void;
    onClear: () => void;
    className?: string;
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

const sortFields: { value: SortField; label: string }[] = [
    { value: 'publishedAt', label: 'newest first' },
    { value: 'views', label: 'most viewed' },
    { value: 'bookmarks', label: 'most saved' },
    { value: 'trendingScore', label: 'trending' }
];

export const FilterSortPanel: React.FC<FilterSortPanelProps> = ({
    filters,
    sort,
    onFilterChange,
    onSortChange,
    onClear,
    className = ''
}) => {
    const [showPanel, setShowPanel] = useState(false);
    const [activeTab, setActiveTab] = useState<'filter' | 'sort'>('filter');

    const handleCategoryChange = (category: Category) => {
        onFilterChange({ ...filters, category });
    };

    const handleSortFieldChange = (field: SortField) => {
        onSortChange({ ...sort, field });
    };

    const toggleSortOrder = () => {
        onSortChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.category !== 'all') count++;
        if (filters.region !== 'all') count++;
        if (filters.dateFrom) count++;
        if (filters.dateTo) count++;
        if (filters.minViews) count++;
        if (filters.minBookmarks) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();
    const isDefaultSort = sort.field === 'publishedAt' && sort.order === 'desc';

    return (
        <div className={`relative ${className}`}>
            {/* Toggle Button */}
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        setShowPanel(!showPanel);
                        setActiveTab('filter');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${activeFilterCount > 0 || showPanel
                            ? 'bg-accent-pink text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                >
                    <Filter size={16} />
                    <span>filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => {
                        setShowPanel(!showPanel);
                        setActiveTab('sort');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${!isDefaultSort || showPanel
                            ? 'bg-accent-blue text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                >
                    <ArrowUpDown size={16} />
                    <span>sort</span>
                </button>
            </div>

            {/* Filter/Sort Panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[320px]"
                    >
                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('filter')}
                                className={`flex-1 px-4 py-3 text-sm font-bold transition ${activeTab === 'filter'
                                        ? 'bg-white/5 text-white border-b-2 border-accent-pink'
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Filter size={14} />
                                    <span>filter</span>
                                    {activeFilterCount > 0 && (
                                        <span className="px-1.5 py-0.5 bg-accent-pink/20 text-accent-pink rounded-full text-xs">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('sort')}
                                className={`flex-1 px-4 py-3 text-sm font-bold transition ${activeTab === 'sort'
                                        ? 'bg-white/5 text-white border-b-2 border-accent-blue'
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <ArrowUpDown size={14} />
                                    <span>sort</span>
                                </div>
                            </button>
                        </div>

                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {activeTab === 'filter' ? (
                                <div className="space-y-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase mb-2">
                                            category
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    onClick={() => handleCategoryChange(cat.value)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${filters.category === cat.value
                                                            ? 'bg-accent-pink text-white'
                                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <span>{cat.emoji}</span>
                                                    <span>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Clear Filters */}
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={() => {
                                                onClear();
                                                setShowPanel(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-white/60 hover:text-white transition"
                                        >
                                            <X size={14} />
                                            <span>clear all filters</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Sort Field */}
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase mb-2">
                                            sort by
                                        </label>
                                        <div className="space-y-2">
                                            {sortFields.map((field) => (
                                                <button
                                                    key={field.value}
                                                    onClick={() => handleSortFieldChange(field.value)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition ${sort.field === field.value
                                                            ? 'bg-accent-blue text-white'
                                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <span>{field.label}</span>
                                                    {sort.field === field.value && (
                                                        <span className="text-xs opacity-60">
                                                            {sort.order === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sort Order Toggle */}
                                    <button
                                        onClick={toggleSortOrder}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-white/60 hover:text-white transition"
                                    >
                                        <span>{sort.order === 'desc' ? 'descending' : 'ascending'}</span>
                                        <span className="text-lg">{sort.order === 'desc' ? '↓' : '↑'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && !showPanel && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 mt-2"
                >
                    {filters.category !== 'all' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-accent-pink/20 text-accent-pink rounded-full text-xs font-bold">
                            <span>{categories.find(c => c.value === filters.category)?.emoji}</span>
                            <span>{filters.category}</span>
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className="hover:bg-white/10 rounded-full p-0.5"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};
