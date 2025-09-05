import React from 'react';
import { TimeRange, MobileView } from '../lib/types';
import { MapPinIcon, ListIcon } from './Icons';
import { CitySearch } from './CitySearch';

interface ControlsProps {
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    minMag: number;
    setMinMag: (mag: number) => void;
    mobileView: MobileView;
    setMobileView: (view: MobileView) => void;
    quakeCount: number;
    isDarkMode: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
    timeRange,
    setTimeRange,
    minMag,
    setMinMag,
    mobileView,
    setMobileView,
    quakeCount,
    isDarkMode
}) => {
    const timeRanges = [
        { id: 'hour' as TimeRange, label: 'Past Hour' },
        { id: 'day' as TimeRange, label: 'Past Day' },
        { id: 'week' as TimeRange, label: 'Past Week' }
    ];

    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-2 sm:px-6">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                {timeRanges.map(range => (
                    <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                            timeRange === range.id 
                                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
                        }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* City Search - Desktop Only */}
            <div className="hidden sm:block w-64">
                <CitySearch isDarkMode={isDarkMode} />
            </div>

            {/* Magnitude Scale */}
            <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-3">
                <label htmlFor="minMag" className="text-xs sm:text-sm font-semibold whitespace-nowrap">Min. Mag:</label>
                <div className="flex-grow flex items-center gap-2">
                    <input
                        id="minMag"
                        type="range"
                        min="0"
                        max="8"
                        step="0.5"
                        value={minMag}
                        onChange={e => setMinMag(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-mono text-sky-600 dark:text-sky-400 w-6 sm:w-8 text-center text-xs sm:text-sm">
                        {minMag.toFixed(1)}
                    </span>
                </div>
            </div>

            {/* Mobile Controls */}
            <div className="sm:hidden flex items-center justify-center">
                {/* Map/List Toggle */}
                <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <button 
                        onClick={() => setMobileView('map')} 
                        className={`p-2 rounded-full transition-colors ${
                            mobileView === 'map' 
                                ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' 
                                : ''
                        }`}
                    >
                        <MapPinIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setMobileView('list')} 
                        className={`p-2 rounded-full transition-colors relative ${
                            mobileView === 'list' 
                                ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' 
                                : ''
                        }`}
                    >
                        <ListIcon className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white text-[10px] font-bold">
                            {quakeCount}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
