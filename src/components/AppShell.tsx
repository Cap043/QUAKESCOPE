import React from 'react';
import { SunIcon, MoonIcon } from './Icons';
import { Controls } from './Controls';
import { StatsBar } from './StatsBar';
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
    children
}) => {
    return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
            <header className="flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-sm border-b border-slate-200 dark:border-slate-800 z-20">
                <div className="max-w-screen-2xl mx-auto py-3">
                    <div className="flex items-center justify-between px-4 sm:px-6">
                        <h1 className="text-xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
                            QuakeScope
                        </h1>
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
                        />
                    </div>
                    
                    <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-2">
                        <StatsBar quakes={quakes} lastUpdated={lastUpdated} />
                    </div>
                </div>
            </header>

            <main className="flex-grow min-h-0 relative">
                {children}
            </main>

            {/* Mobile Controls at Bottom */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="px-4 py-3">
                    <Controls 
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                        minMag={minMag}
                        setMinMag={setMinMag}
                        mobileView={mobileView}
                        setMobileView={setMobileView}
                        quakeCount={quakes?.length || 0}
                    />
                </div>
            </div>
        </div>
    );
};
