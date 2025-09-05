import React, { useState } from 'react';
import { SunIcon, MoonIcon, MapPinIcon, ListIcon, AnalyticsIcon } from './Icons';
import { Controls } from './Controls';
import { StatsBar } from './StatsBar';
import { CitySearch } from './CitySearch';
import { TimeRange, MobileView, Earthquake } from '../lib/types';

interface AppShellProps {
    isDarkMode: boolean;
    setIsDarkMode: (dark: boolean) => void;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    minMag: number;
    setMinMag: (mag: number) => void;
    mobileView: MobileView;
    setMobileView: (view: MobileView) => void;
    quakes: Earthquake[] | null;
    lastUpdated: number | null;
    showHeatmap: boolean;
    showClustering: boolean;
    onToggleHeatmap: () => void;
    onToggleClustering: () => void;
    onViewAnalytics?: () => void;
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
    isDarkMode,
    setIsDarkMode,
    timeRange,
    setTimeRange,
    minMag,
    setMinMag,
    mobileView,
    setMobileView,
    quakes,
    lastUpdated,
    showHeatmap,
    showClustering,
    onToggleHeatmap,
    onToggleClustering,
    onViewAnalytics,
    children
}) => {
    const [isMobileSearchCollapsed, setIsMobileSearchCollapsed] = useState(true);
    return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
            <header className="flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-sm border-b border-slate-200 dark:border-slate-800 z-20">
                <div className="max-w-screen-2xl mx-auto py-3">
                    <div className="flex items-center justify-between px-4 sm:px-6">
                        <h1 className="text-xl font-bold tracking-tight flex items-center">
                            <span className="bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                                QuakeScope
                            </span>
                            {/* <span className="ml-2 text-base font-semibold text-sky-600 dark:text-sky-400">
                                – {quakes?.length || 0} Quakes {timeRange === 'hour' ? 'Hour' : timeRange === 'day' ? 'Today' : 'Week'}
                                {minMag > 0 && ` (≥${minMag}M)`}
                            </span> */}
                        </h1>
                        <div className="flex items-center gap-2">
                            {/* Mobile Search - Top Right */}
                            <div className="sm:hidden">
                                <CitySearch 
                                    isDarkMode={isDarkMode} 
                                    isMobile={true} 
                                    isCollapsed={isMobileSearchCollapsed}
                                    onToggleCollapse={() => setIsMobileSearchCollapsed(!isMobileSearchCollapsed)}
                                />
                            </div>
                            
                            {/* Analytics Button */}
                            {onViewAnalytics && (
                                <button 
                                    onClick={onViewAnalytics}
                                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
                                    title="View Analytics"
                                >
                                    <AnalyticsIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                                </button>
                            )}
                            
                        <button 
                            onClick={() => setIsDarkMode(!isDarkMode)} 
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {isDarkMode ? 
                                <SunIcon className="w-5 h-5 text-yellow-400" /> : 
                                <MoonIcon className="w-5 h-5 text-slate-600" />
                            }
                        </button>
                        </div>
                    </div>
                    
                    {/* Desktop Controls */}
                    <div className="hidden sm:block mt-3">
                        <Controls 
                            timeRange={timeRange}
                            setTimeRange={setTimeRange}
                            minMag={minMag}
                            setMinMag={setMinMag}
                            mobileView={mobileView}
                            setMobileView={setMobileView}
                            quakeCount={quakes?.length || 0}
                            isDarkMode={isDarkMode}
                            showHeatmap={showHeatmap}
                            showClustering={showClustering}
                            onToggleHeatmap={onToggleHeatmap}
                            onToggleClustering={onToggleClustering}
                        />
                    </div>
                    
                    
                    <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-2">
                        <StatsBar quakes={quakes} lastUpdated={lastUpdated} timeRange={timeRange} isDarkMode={isDarkMode} />
                    </div>
                </div>
            </header>

            <main className="flex-grow min-h-0 relative">
                {children}
            </main>

            {/* Mobile Controls at Bottom */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg transition-all duration-300">
                <div className="px-4 py-4 space-y-4">
                    {/* Magnitude Scale - Top Row */}
                    <div className="flex items-center gap-3 transition-all duration-300">
                        <div className="flex items-center gap-3 flex-grow">
                            <label htmlFor="minMag" className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors duration-300">
                                Min. Magnitude
                            </label>
                            <div className="flex-grow flex items-center gap-3">
                                <input
                                    id="minMag"
                                    type="range"
                                    min="0"
                                    max="8"
                                    step="0.5"
                                    value={minMag}
                                    onChange={e => setMinMag(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider transition-all duration-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                                />
                                <span className="font-mono text-sky-600 dark:text-sky-400 text-sm font-bold transition-all duration-300">
                                    {minMag.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider Line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>

                    {/* Navigation Controls - Bottom Row */}
                    <div className="flex items-center gap-2">
                        {/* Time Filter - 50% width */}
                        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm w-1/2 transition-all duration-300 hover:shadow-md">
                            <button
                                onClick={() => setTimeRange('hour')}
                                className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                                    timeRange === 'hour' 
                                        ? 'bg-sky-500 text-white shadow-lg scale-105' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Hour
                            </button>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button
                                onClick={() => setTimeRange('day')}
                                className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                                    timeRange === 'day' 
                                        ? 'bg-sky-500 text-white shadow-lg scale-105' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Day
                            </button>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button
                                onClick={() => setTimeRange('week')}
                                className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                                    timeRange === 'week' 
                                        ? 'bg-sky-500 text-white shadow-lg scale-105' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Week
                            </button>
                        </div>

                        {/* Reset Button - 20% width */}
                        <button
                            onClick={() => {
                                // Reset map to global view focusing on high earthquake regions
                                if ((window as any).__mapReset) {
                                    (window as any).__mapReset();
                                }
                            }}
                            className="w-1/5 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                            title="Reset to global view"
                        >
                            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300 mx-auto transition-transform duration-300 hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        {/* Map/List Toggle - 30% width */}
                        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm w-3/10 transition-all duration-300 hover:shadow-md">
                            <button 
                                onClick={() => setMobileView('map')} 
                                className={`flex-1 p-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                    mobileView === 'map' 
                                        ? 'bg-sky-500 text-white shadow-lg scale-105' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="Map View"
                            >
                                <MapPinIcon className="w-4 h-4 mx-auto" />
                            </button>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button 
                                onClick={() => setMobileView('list')} 
                                className={`flex-1 p-2 rounded-lg transition-all duration-300 transform hover:scale-105 relative ${
                                    mobileView === 'list' 
                                        ? 'bg-sky-500 text-white shadow-lg scale-105' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="List View"
                            >
                                <ListIcon className="w-4 h-4 mx-auto" />
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm transition-all duration-300 animate-pulse">
                                    {quakes?.length || 0}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
