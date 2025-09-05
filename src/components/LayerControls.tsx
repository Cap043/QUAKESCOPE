import React from 'react';

interface LayerControlsProps {
    showHeatmap: boolean;
    showClustering: boolean;
    onToggleHeatmap: () => void;
    onToggleClustering: () => void;
    isDarkMode: boolean;
    className?: string;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
    showHeatmap,
    showClustering,
    onToggleHeatmap,
    onToggleClustering,
    isDarkMode,
    className = ''
}) => {
    return (
        <div className={`layer-controls ${className}`}>
            <div className={`p-2 rounded-lg shadow-sm border ${
                isDarkMode 
                    ? 'bg-slate-800/90 border-slate-700' 
                    : 'bg-white/90 border-slate-200'
            } backdrop-blur-sm`}>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Map Layers
                </div>
                
                <div className="space-y-2">
                    {/* Heatmap Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showHeatmap}
                            onChange={onToggleHeatmap}
                            className="w-4 h-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-red-500"></div>
                            <span className="text-xs text-slate-700 dark:text-slate-300">
                                Heatmap
                            </span>
                        </div>
                    </label>

                    {/* Clustering Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showClustering}
                            onChange={onToggleClustering}
                            className="w-4 h-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-400 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xs text-slate-700 dark:text-slate-300">
                                Clustering
                            </span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default LayerControls;
