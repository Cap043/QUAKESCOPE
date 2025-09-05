import React, { useState } from 'react';

interface MobileLayerControlsProps {
    showHeatmap: boolean;
    showClustering: boolean;
    onToggleHeatmap: () => void;
    onToggleClustering: () => void;
    isDarkMode: boolean;
}

export const MobileLayerControls: React.FC<MobileLayerControlsProps> = ({
    showHeatmap,
    showClustering,
    onToggleHeatmap,
    onToggleClustering,
    isDarkMode
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Dropdown Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-white hover:bg-slate-50 text-slate-600'
                } shadow-sm border border-slate-200 dark:border-slate-700`}
                title="Layer Controls"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`absolute bottom-full right-0 mb-2 p-3 rounded-lg shadow-lg border min-w-[200px] ${
                    isDarkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-200'
                }`}>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Map Layers
                    </div>
                    
                    <div className="space-y-3">
                        {/* Heatmap Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-red-500"></div>
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                    Heatmap
                                </span>
                            </div>
                            <button
                                onClick={onToggleHeatmap}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    showHeatmap
                                        ? 'bg-sky-500'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        showHeatmap ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Clustering Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-400 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                    Clustering
                                </span>
                            </div>
                            <button
                                onClick={onToggleClustering}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    showClustering
                                        ? 'bg-sky-500'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        showClustering ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default MobileLayerControls;
