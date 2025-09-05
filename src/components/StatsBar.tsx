import React, { useMemo } from 'react';
import { Earthquake } from '../lib/types';
import { formatRelativeTime } from '../lib/format';
import { TrendGraph } from './TrendGraph';

interface StatsBarProps {
    quakes: Earthquake[] | null;
    lastUpdated: number | null;
    timeRange: 'hour' | 'day' | 'week';
    isDarkMode: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ quakes, lastUpdated, timeRange, isDarkMode }) => {
    const stats = useMemo(() => {
        if (!quakes || quakes.length === 0) {
            return { total: 0, strongest: 'N/A', avgMag: 'N/A' };
        }
        
        const mags = quakes.map(q => q.mag).filter(m => m !== null);
        if (mags.length === 0) {
            return { total: quakes.length, strongest: 'N/A', avgMag: 'N/A' };
        }
        
        const total = quakes.length;
        const strongest = Math.max(...mags);
        const avgMag = (mags.reduce((sum, m) => sum + m, 0) / mags.length).toFixed(1);
        
        return { total, strongest: strongest.toFixed(1), avgMag };
    }, [quakes]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm px-4 sm:px-6">
            <div className="flex gap-6">
                <p><strong>Total:</strong> <span className="font-mono">{stats.total}</span></p>
                <p><strong>Strongest:</strong> <span className="font-mono">{stats.strongest}</span> M</p>
                <p><strong>Average:</strong> <span className="font-mono">{stats.avgMag}</span> M</p>
            </div>
            <div className="flex items-center gap-4">
                <TrendGraph 
                    quakes={quakes || []} 
                    timeRange={timeRange} 
                    isDarkMode={isDarkMode}
                    className="hidden sm:block"
                />
                {lastUpdated && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Updated: {formatRelativeTime(lastUpdated)}
                    </p>
                )}
            </div>
        </div>
    );
};
