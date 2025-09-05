import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Earthquake } from '../lib/types';
import { getMagnitudeColor } from '../lib/colors';
import { formatRelativeTime, formatDepth } from '../lib/format';

type SortOption = 'time' | 'magnitude' | 'depth';
type SortOrder = 'asc' | 'desc';

interface QuakeListProps {
    quakes: Earthquake[] | null;
    selectedQuakeId: string | null;
    onQuakeSelect: (quakeId: string, coords: [number, number]) => void;
    onQuakeHover: (quakeId: string | null) => void;
    className?: string;
}

export const QuakeList: React.FC<QuakeListProps> = ({
    quakes,
    selectedQuakeId,
    onQuakeSelect,
    onQuakeHover,
    className = ''
}) => {
    const listRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLLIElement>(null);
    const [sortBy, setSortBy] = useState<SortOption>('time');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    useEffect(() => {
        if (selectedQuakeId && selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [selectedQuakeId]);

    const sortedQuakes = useMemo(() => {
        if (!quakes) return [];
        
        return [...quakes].sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'time':
                    comparison = a.time - b.time;
                    break;
                case 'magnitude':
                    const magA = a.mag || 0;
                    const magB = b.mag || 0;
                    comparison = magA - magB;
                    break;
                case 'depth':
                    comparison = a.depthKm - b.depthKm;
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [quakes, sortBy, sortOrder]);

    const handleSortChange = (newSortBy: SortOption) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (option: SortOption) => {
        if (sortBy !== option) {
            return (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        
        return sortOrder === 'asc' ? (
            <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
        );
    };

    if (!quakes || quakes.length === 0) {
        return (
            <div className={`p-8 text-center text-slate-500 dark:text-slate-400 ${className}`}>
                <p className="font-semibold">No Earthquakes Found</p>
                <p className="text-sm mt-1">Try lowering the minimum magnitude or expanding the time range.</p>
            </div>
        );
    }

    return (
        <div 
            ref={listRef} 
            className={`h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 ${className}`} 
            onMouseLeave={() => onQuakeHover(null)}
        >
            {/* Sort Controls */}
            <div className="flex-shrink-0 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Earthquakes ({quakes.length})
                    </h3>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => handleSortChange('time')}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            sortBy === 'time'
                                ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {getSortIcon('time')}
                        Time
                    </button>
                    <button
                        onClick={() => handleSortChange('magnitude')}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            sortBy === 'magnitude'
                                ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {getSortIcon('magnitude')}
                        Magnitude
                    </button>
                    <button
                        onClick={() => handleSortChange('depth')}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            sortBy === 'depth'
                                ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {getSortIcon('depth')}
                        Depth
                    </button>
                </div>
            </div>

            {/* Earthquake List */}
            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                    {sortedQuakes.map(quake => {
                        const isSelected = quake.id === selectedQuakeId;
                        return (
                            <li
                                key={quake.id}
                                ref={isSelected ? selectedItemRef : null}
                                onClick={() => onQuakeSelect(quake.id, [quake.lat, quake.lon])}
                                onMouseEnter={() => onQuakeHover(quake.id)}
                                className={`p-4 cursor-pointer transition-colors duration-300 ${
                                    isSelected 
                                        ? 'bg-sky-100 dark:bg-sky-900/50' 
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg border-2 ${getMagnitudeColor(quake.mag)}`}>
                                        {quake.mag !== null ? quake.mag.toFixed(1) : 'N/A'}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {quake.place || 'Unknown location'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {formatRelativeTime(quake.time)} &middot; {formatDepth(quake.depthKm)} depth
                                        </p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
