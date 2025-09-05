import React, { useMemo } from 'react';
import { Earthquake } from '../lib/types';

interface TrendGraphProps {
    quakes: Earthquake[];
    timeRange: 'hour' | 'day' | 'week';
    isDarkMode: boolean;
    className?: string;
}

export const TrendGraph: React.FC<TrendGraphProps> = ({
    quakes,
    timeRange,
    isDarkMode,
    className = ''
}) => {
    const trendData = useMemo(() => {
        if (!quakes || quakes.length === 0) return [];

        const now = new Date();
        const intervals: { [key: string]: number } = {};
        let intervalMs: number;
        let intervalCount: number;

        // Determine interval based on time range
        switch (timeRange) {
            case 'hour':
                intervalMs = 5 * 60 * 1000; // 5 minutes
                intervalCount = 12; // 12 intervals of 5 minutes = 1 hour
                break;
            case 'day':
                intervalMs = 60 * 60 * 1000; // 1 hour
                intervalCount = 24; // 24 intervals of 1 hour = 1 day
                break;
            case 'week':
                intervalMs = 24 * 60 * 60 * 1000; // 1 day
                intervalCount = 7; // 7 intervals of 1 day = 1 week
                break;
            default:
                intervalMs = 60 * 60 * 1000;
                intervalCount = 24;
        }

        // Initialize intervals
        for (let i = 0; i < intervalCount; i++) {
            const intervalStart = new Date(now.getTime() - (intervalCount - i) * intervalMs);
            const intervalKey = intervalStart.toISOString();
            intervals[intervalKey] = 0;
        }

        // Count earthquakes in each interval
        quakes.forEach(quake => {
            const quakeTime = new Date(quake.time);
            const intervalIndex = Math.floor((now.getTime() - quakeTime.getTime()) / intervalMs);
            
            if (intervalIndex >= 0 && intervalIndex < intervalCount) {
                const intervalStart = new Date(now.getTime() - (intervalCount - intervalIndex) * intervalMs);
                const intervalKey = intervalStart.toISOString();
                intervals[intervalKey] = (intervals[intervalKey] || 0) + 1;
            }
        });

        // Convert to array and normalize
        const data = Object.values(intervals);
        const maxValue = Math.max(...data, 1); // Avoid division by zero

        return data.map(value => value / maxValue);
    }, [quakes, timeRange]);

    const maxQuakes = useMemo(() => {
        if (!quakes || quakes.length === 0) return 0;
        return Math.max(...trendData.map((_, index) => {
            const intervalMs = timeRange === 'hour' ? 5 * 60 * 1000 : 
                              timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            const intervalCount = timeRange === 'hour' ? 12 : timeRange === 'day' ? 24 : 7;
            const now = new Date();
            const intervalStart = new Date(now.getTime() - (intervalCount - index) * intervalMs);
            const intervalEnd = new Date(intervalStart.getTime() + intervalMs);
            
            return quakes.filter(quake => {
                const quakeTime = new Date(quake.time);
                return quakeTime >= intervalStart && quakeTime < intervalEnd;
            }).length;
        }));
    }, [quakes, timeRange, trendData]);

    if (trendData.length === 0) {
        return (
            <div className={`trend-graph ${className}`}>
                <div className="text-xs text-slate-500 dark:text-slate-400">No data</div>
            </div>
        );
    }

    const svgWidth = 120;
    const svgHeight = 30;
    const padding = 2;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    // Create SVG path
    const points = trendData.map((value, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const y = padding + chartHeight - (value * chartHeight);
        return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    return (
        <div className={`trend-graph ${className}`}>
            <div className="flex items-center gap-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Trend
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    Max: {maxQuakes}
                </div>
            </div>
            <div className="mt-1">
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    className="w-full h-8"
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                >
                    {/* Background */}
                    <rect
                        width={svgWidth}
                        height={svgHeight}
                        fill={isDarkMode ? '#1e293b' : '#f8fafc'}
                        rx="4"
                    />
                    
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                                strokeWidth="0.5"
                            />
                        </pattern>
                    </defs>
                    <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />
                    
                    {/* Trend line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={isDarkMode ? '#3b82f6' : '#1d4ed8'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    
                    {/* Area under curve */}
                    <path
                        d={`${pathData} L ${padding + chartWidth},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`}
                        fill={isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(29, 78, 216, 0.1)'}
                    />
                    
                    {/* Data points */}
                    {trendData.map((value, index) => {
                        const x = padding + (index / (trendData.length - 1)) * chartWidth;
                        const y = padding + chartHeight - (value * chartHeight);
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill={isDarkMode ? '#3b82f6' : '#1d4ed8'}
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default TrendGraph;
