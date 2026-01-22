import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];
    onItemsPerPageChange?: (limit: number) => void;
    totalItems?: number;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    itemsPerPageOptions = [10, 20, 50],
    onItemsPerPageChange,
    totalItems,
    className = ''
}) => {
    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Items per page selector */}
            {itemsPerPage && onItemsPerPageChange && (
                <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="text-white/40">show:</span>
                    {itemsPerPageOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => {
                                onItemsPerPageChange(option);
                                onPageChange(1);
                            }}
                            className={`px-3 py-1 rounded-lg font-bold transition ${itemsPerPage === option
                                    ? 'bg-accent-pink text-white'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                    <span className="text-white/40">per page</span>
                </div>
            )}

            {/* Page navigation */}
            <div className="flex items-center justify-center gap-2">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {generatePageNumbers().map((page, idx) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${idx}`} className="px-2 text-white/20">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`min-w-[36px] h-9 px-3 rounded-lg font-bold text-sm transition ${currentPage === page
                                        ? 'bg-accent-pink text-white'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next button */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next page"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Page info */}
            {totalItems && itemsPerPage && (
                <div className="text-center text-xs text-white/30">
                    showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
                </div>
            )}
        </div>
    );
};
