import React, { useState } from 'react';

export const Legend: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div 
            className="absolute bottom-28 sm:bottom-4 left-4 z-[9999] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300"
        >
            {/* Collapsed State - Just the header */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="p-2 sm:p-3 w-full text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                       
                        <svg className="w-3 h-3 text-slate-600 dark:text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
            )}

            {/* Expanded State - Full legend */}
            {isExpanded && (
                <div className="p-2 sm:p-3">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Magnitude</h4>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded transition-colors"
                        >
                            <svg className="w-3 h-3 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs">≥ 6.0</span>
                            <span className="hidden sm:inline text-xs">(Strong)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                            <span className="text-xs">4.5 - 5.9</span>
                            <span className="hidden sm:inline text-xs">(Moderate)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-xs">2.5 - 4.4</span>
                            <span className="hidden sm:inline text-xs">(Light)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                            <span className="text-xs">&lt; 2.5</span>
                            <span className="hidden sm:inline text-xs">(Minor)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
