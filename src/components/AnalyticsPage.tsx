import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { Earthquake, TimeRange } from '../lib/types';
import { formatMagnitude, formatDepth, formatTimeAgo, formatCoordinates } from '../lib/format';
import { SunIcon, MoonIcon } from './Icons';
import { fetchEarthquakeData } from '../api/usgs';
import { fetchMonthlyEarthquakeData, fetchCustomRangeEarthquakeData } from '../api/monthlyData';

type ExtendedTimeRange = TimeRange | 'month' | 'custom';

interface AnalyticsPageProps {
    quakes: Earthquake[];
    timeRange: TimeRange;
    isDarkMode: boolean;
    onViewOnMap: (quakeId: string, coords: [number, number]) => void;
    onBack: () => void;
    onThemeChange?: (isDark: boolean) => void;
}

interface CountUpProps {
    end: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2000, decimals = 0, suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(end * easeOutQuart);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return (
        <span>
            {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}{suffix}
        </span>
    );
};

const OverviewCard: React.FC<{
    title: string;
    value: number;
    suffix?: string;
    decimals?: number;
    icon: React.ReactNode;
    subtitle?: string;
    isDarkMode: boolean;
}> = ({ title, value, suffix = '', decimals = 0, icon, subtitle, isDarkMode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`
                p-6 rounded-2xl shadow-xl backdrop-blur-sm border
                ${isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80' 
                    : 'bg-white/80 border-slate-200 hover:bg-white/90'
                }
                transition-all duration-300 cursor-pointer
            `}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                    {icon}
                </div>
            </div>
            <div className="space-y-1">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {title}
                </h3>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <CountUp end={value} decimals={decimals} suffix={suffix} />
                </div>
                {subtitle && (
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, isDarkMode }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`
                p-3 rounded-lg shadow-lg border
                ${isDarkMode 
                    ? 'bg-slate-800 border-slate-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                }
            `}>
                <p className="font-medium">{label}</p>
                <p className="text-sm">
                    Count: <span className="font-semibold text-blue-500">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

const ErrorCard: React.FC<{
    error: Error;
    onRetry: () => void;
    isDarkMode: boolean;
}> = ({ error, onRetry, isDarkMode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                p-8 rounded-2xl shadow-xl backdrop-blur-sm border-2 border-dashed text-center max-w-md mx-auto
                ${isDarkMode 
                    ? 'bg-slate-800/80 border-red-500/30 text-white' 
                    : 'bg-white/80 border-red-300/50 text-slate-900'
                }
            `}
        >
            {/* Cute Error Icon */}
            <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 2,
                    ease: "easeInOut"
                }}
                className="mb-6"
            >
                <div className={`
                    w-20 h-20 mx-auto rounded-full flex items-center justify-center
                    ${isDarkMode ? 'bg-red-500/20' : 'bg-red-50'}
                `}>
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            </motion.div>

            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Oops! Data Fetch Failed
            </h3>
            
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {error.message.includes('Failed to fetch') || error.message.includes('NetworkError') 
                    ? "🌐 Network connection issue. Please check your internet connection and try again."
                    : error.message.includes('404')
                    ? "📊 No earthquake data available for this time period."
                    : `❗ ${error.message}`
                }
            </p>

            <div className="space-y-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className={`
                        w-full px-4 py-2 rounded-lg font-medium transition-all
                        ${isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                    `}
                >
                    🔄 Try Again
                </motion.button>
                
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    💡 Showing cached data from previous session
                </p>
            </div>
        </motion.div>
    );
};

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
    quakes,
    timeRange: initialTimeRange,
    isDarkMode: initialDarkMode,
    onViewOnMap,
    onBack,
    onThemeChange
}) => {
    // Local state for analytics-specific controls
    const [localTimeRange, setLocalTimeRange] = useState<ExtendedTimeRange>(initialTimeRange);
    const [localDarkMode, setLocalDarkMode] = useState(initialDarkMode);
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [localMinMag, setLocalMinMag] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [analyticsQuakes, setAnalyticsQuakes] = useState<Earthquake[]>(quakes);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    // Sync with parent props
    useEffect(() => {
        setLocalDarkMode(initialDarkMode);
    }, [initialDarkMode]);

    // Fetch data based on local time range
    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const abortController = new AbortController();
                let data: Earthquake[];

                if (localTimeRange === 'custom' && customStartDate && customEndDate) {
                    // For custom range, use the specialized custom range fetcher
                    data = await fetchCustomRangeEarthquakeData(customStartDate, customEndDate, abortController.signal);
                } else if (localTimeRange === 'month') {
                    // For month, use the specialized month fetcher
                    data = await fetchMonthlyEarthquakeData(abortController.signal);
                } else {
                    // For standard ranges, use regular USGS endpoints
                    let fetchTimeRange: TimeRange;
                    let needsFetch = true;

                    switch (localTimeRange) {
                        case 'week':
                            fetchTimeRange = 'week';
                            needsFetch = initialTimeRange !== 'week';
                            break;
                        case 'day':
                            fetchTimeRange = 'day';
                            needsFetch = initialTimeRange !== 'day';
                            break;
                        case 'hour':
                            fetchTimeRange = 'hour';
                            needsFetch = initialTimeRange !== 'hour';
                            break;
                        default:
                            fetchTimeRange = 'day';
                            needsFetch = initialTimeRange !== 'day';
                    }

                    if (!needsFetch) {
                        setAnalyticsQuakes(quakes);
                        setIsLoading(false);
                        return;
                    }

                    data = await fetchEarthquakeData(fetchTimeRange, abortController.signal);
                }

                setAnalyticsQuakes(data);
                console.log(`Successfully loaded ${data.length} earthquakes for ${localTimeRange} analysis`);
            } catch (err) {
                console.error('Failed to fetch analytics data:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(new Error(`Failed to load earthquake data: ${errorMessage}`));
                
                // Fallback to provided quakes
                setAnalyticsQuakes(quakes);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [localTimeRange, quakes, initialTimeRange, customStartDate, customEndDate]);
    // Handle theme change
    const handleThemeToggle = () => {
        const newDarkMode = !localDarkMode;
        setLocalDarkMode(newDarkMode);
        if (onThemeChange) {
            onThemeChange(newDarkMode);
        }
    };

    // Handle retry
    const handleRetry = () => {
        setError(null);
        setAnalyticsQuakes([]); // Clear current data to force fresh fetch
        // The useEffect will automatically trigger due to the error state change
    };

    // Filter quakes based on local controls
    const filteredQuakes = useMemo(() => {
        if (!analyticsQuakes) return [];
        
        let filtered = [...analyticsQuakes];
        
        // Filter by magnitude
        filtered = filtered.filter(q => q.mag === null || q.mag >= localMinMag);
        
        // Filter by time range
        const now = Date.now();
        if (localTimeRange === 'custom' && customStartDate && customEndDate) {
            const startTime = customStartDate.getTime();
            const endTime = customEndDate.getTime() + (24 * 60 * 60 * 1000); // End of day
            filtered = filtered.filter(q => q.time >= startTime && q.time <= endTime);
        } else if (localTimeRange === 'month') {
            const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(q => q.time >= monthAgo);
        } else if (localTimeRange === 'week') {
            const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(q => q.time >= weekAgo);
        } else if (localTimeRange === 'day') {
            const dayAgo = now - (24 * 60 * 60 * 1000);
            filtered = filtered.filter(q => q.time >= dayAgo);
        } else if (localTimeRange === 'hour') {
            const hourAgo = now - (60 * 60 * 1000);
            filtered = filtered.filter(q => q.time >= hourAgo);
        }
        
        return filtered;
    }, [analyticsQuakes, localMinMag, localTimeRange, customStartDate, customEndDate]);

    // Analytics calculations
    const analytics = useMemo(() => {
        if (!filteredQuakes || !Array.isArray(filteredQuakes) || filteredQuakes.length === 0) {
            return {
                totalQuakes: 0,
                strongestQuake: null,
                averageMagnitude: 0,
                deepestQuake: null,
                shallowestQuake: null,
                magnitudeDistribution: [],
                depthDistribution: [],
                timeDistribution: [],
                topRegions: [],
                notableQuakes: []
            };
        }

        const totalQuakes = filteredQuakes.length;
        
        // Strongest earthquake
        const strongestQuake = filteredQuakes.reduce((max, quake) => 
            (quake.mag || 0) > (max.mag || 0) ? quake : max
        );

        // Average magnitude
        const validMagnitudes = filteredQuakes.filter(q => q.mag !== null).map(q => q.mag!);
        const averageMagnitude = validMagnitudes.length > 0 
            ? validMagnitudes.reduce((sum, mag) => sum + mag, 0) / validMagnitudes.length 
            : 0;

        // Deepest and shallowest
        const deepestQuake = filteredQuakes.reduce((max, quake) => 
            quake.depthKm > max.depthKm ? quake : max
        );
        const shallowestQuake = filteredQuakes.reduce((min, quake) => 
            quake.depthKm < min.depthKm ? quake : min
        );

        // Magnitude distribution (detailed 1-unit intervals)
        const magRanges = [
            { range: '0-1', min: 0, max: 1, count: 0, color: '#10b981' },      // Emerald
            { range: '1-2', min: 1, max: 2, count: 0, color: '#22c55e' },      // Green
            { range: '2-3', min: 2, max: 3, count: 0, color: '#84cc16' },      // Lime
            { range: '3-4', min: 3, max: 4, count: 0, color: '#eab308' },      // Yellow
            { range: '4-5', min: 4, max: 5, count: 0, color: '#f59e0b' },      // Amber
            { range: '5-6', min: 5, max: 6, count: 0, color: '#f97316' },      // Orange
            { range: '6-7', min: 6, max: 7, count: 0, color: '#ef4444' },      // Red
            { range: '7+', min: 7, max: 10, count: 0, color: '#dc2626' }       // Dark Red
        ];

        filteredQuakes.forEach(quake => {
            const mag = quake.mag || 0;
            let range = magRanges.find(r => mag >= r.min && mag < r.max);
            
            // If no range found, use the last range (for very high magnitudes)
            if (!range) {
                range = magRanges[magRanges.length - 1];
            }
            
            // Extra safety check
            if (range) {
                range.count++;
            }
        });

        // Filter out magnitude ranges with zero counts for cleaner visualization
        const filteredMagRanges = magRanges.filter(range => range.count > 0);

        // Depth distribution (specific ranges as requested)
        const depthRanges = [
            { name: '<15km (Very Shallow)', count: 0, color: '#06d6a0' },        // Emerald
            { name: '15-30km (Shallow)', count: 0, color: '#22c55e' },           // Green
            { name: '30-70km (Moderate)', count: 0, color: '#3b82f6' },          // Blue
            { name: '70-150km (Intermediate)', count: 0, color: '#f59e0b' },     // Amber
            { name: '150km+ (Deep)', count: 0, color: '#ef4444' }                // Red
        ];

        filteredQuakes.forEach(quake => {
            const depth = quake.depthKm || 0;
            const absDepth = Math.abs(depth);
            
            if (absDepth < 15) {
                depthRanges[0].count++;
            } else if (absDepth < 30) {
                depthRanges[1].count++;
            } else if (absDepth < 70) {
                depthRanges[2].count++;
            } else if (absDepth < 150) {
                depthRanges[3].count++;
            } else {
                depthRanges[4].count++;
            }
        });

        // Filter out depth ranges with zero counts for cleaner visualization
        const filteredDepthRanges = depthRanges.filter(range => range.count > 0);

        // Time distribution (simplified)
        const timeDistribution: Array<{ time: string; count: number; avgMag: number }> = [];
        if (localTimeRange === 'hour') {
            // Group by 10-minute intervals
            const intervals = 6;
            for (let i = 0; i < intervals; i++) {
                timeDistribution.push({
                    time: `${(i * 10)}m ago`,
                    count: 0,
                    avgMag: 0
                });
            }
        } else if (localTimeRange === 'day') {
            // Group by 4-hour intervals
            const intervals = 6;
            for (let i = 0; i < intervals; i++) {
                timeDistribution.push({
                    time: `${(i * 4)}h ago`,
                    count: 0,
                    avgMag: 0
                });
            }
        } else if (localTimeRange === 'month') {
            // Group by days for month view
            const intervals = 30;
            for (let i = 0; i < intervals; i++) {
                timeDistribution.push({
                    time: `${i + 1}d ago`,
                    count: 0,
                    avgMag: 0
                });
            }
        } else {
            // Group by days for week view
            const intervals = 7;
            for (let i = 0; i < intervals; i++) {
                timeDistribution.push({
                    time: `${i + 1}d ago`,
                    count: 0,
                    avgMag: 0
                });
            }
        }

        // Simple time grouping (can be enhanced)
        const now = Date.now();
        filteredQuakes.forEach(quake => {
            const ageMs = now - quake.time;
            let index = 0;
            
            if (localTimeRange === 'hour') {
                index = Math.min(Math.floor(ageMs / (10 * 60 * 1000)), 5);
            } else if (localTimeRange === 'day') {
                index = Math.min(Math.floor(ageMs / (4 * 60 * 60 * 1000)), 5);
            } else if (localTimeRange === 'month') {
                index = Math.min(Math.floor(ageMs / (24 * 60 * 60 * 1000)), 29);
            } else {
                index = Math.min(Math.floor(ageMs / (24 * 60 * 60 * 1000)), 6);
            }
            
            timeDistribution[index].count++;
            if (quake.mag) {
                timeDistribution[index].avgMag += quake.mag;
            }
        });

        // Calculate average magnitudes
        timeDistribution.forEach(interval => {
            if (interval.count > 0) {
                interval.avgMag = interval.avgMag / interval.count;
            }
        });

        // Top regions (simplified by extracting country/region from place)
        const regionCounts: Record<string, number> = {};
        filteredQuakes.forEach(quake => {
            // Extract region from place (last part after comma, or full string)
            const parts = quake.place.split(',');
            const region = parts[parts.length - 1].trim() || 'Unknown';
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        });

        const topRegions = Object.entries(regionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([region, count]) => ({ region, count }));

        // Notable quakes (top 3 by magnitude)
        const notableQuakes = [...filteredQuakes]
            .sort((a, b) => (b.mag || 0) - (a.mag || 0))
            .slice(0, 3);

        return {
            totalQuakes,
            strongestQuake,
            averageMagnitude,
            deepestQuake,
            shallowestQuake,
            magnitudeDistribution: filteredMagRanges,
            depthDistribution: filteredDepthRanges,
            timeDistribution,
            topRegions,
            notableQuakes
        };
    }, [filteredQuakes, localTimeRange]);

    return (
        <div className={`min-h-screen ${localDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Enhanced Header with Controls */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                    sticky top-0 z-50 backdrop-blur-sm border-b
                    ${localDarkMode 
                        ? 'bg-slate-900/80 border-slate-700' 
                        : 'bg-white/80 border-slate-200'
                    }
                `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onBack}
                                className={`
                                    p-2 rounded-xl transition-colors
                                    ${localDarkMode 
                                        ? 'hover:bg-slate-700 text-slate-300' 
                                        : 'hover:bg-slate-100 text-slate-600'
                                    }
                                `}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>
                            <div>
                                <h1 className={`text-2xl font-bold ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Analytics Dashboard
                                </h1>
                                <p className={`text-sm ${localDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {localTimeRange === 'custom' && customStartDate && customEndDate 
                                        ? `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`
                                        : `Past ${localTimeRange}`
                                    } • {isLoading ? 'Loading...' : `${analytics.totalQuakes} earthquakes analyzed`}
                                    {error && ' (using cached data)'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleThemeToggle}
                            className={`
                                p-2 rounded-xl transition-colors
                                ${localDarkMode 
                                    ? 'hover:bg-slate-700 text-slate-300' 
                                    : 'hover:bg-slate-100 text-slate-600'
                                }
                            `}
                        >
                            {localDarkMode ? 
                                <SunIcon className="w-5 h-5 text-yellow-400" /> : 
                                <MoonIcon className="w-5 h-5 text-slate-600" />
                            }
                        </motion.button>
                    </div>

                    {/* Advanced Controls */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Desktop Time Range Selection */}
                        <div className="hidden sm:flex flex-wrap items-center gap-2">
                            {(['hour', 'day', 'week', 'month', 'custom'] as ExtendedTimeRange[]).map(range => (
                                <motion.button
                                    key={range}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setLocalTimeRange(range)}
                                    className={`
                                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                                        ${localTimeRange === range
                                            ? localDarkMode 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'bg-blue-500 text-white shadow-lg'
                                            : localDarkMode
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                        }
                                    `}
                                >
                                    Past {range === 'custom' ? 'Custom' : range.charAt(0).toUpperCase() + range.slice(1)}
                                </motion.button>
                            ))}
                        </div>

                        {/* Mobile Filter Dropdown */}
                        <div className="sm:hidden w-full">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className={`
                                    w-full px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between
                                    ${localDarkMode
                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }
                                `}
                            >
                                <span>Filters & Time Range</span>
                                <svg 
                                    className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Desktop Advanced Filters Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`
                                hidden sm:flex px-4 py-2 rounded-lg text-sm font-medium transition-all items-center gap-2
                                ${localDarkMode
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }
                            `}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            Filters
                        </motion.button>
                    </div>

                    {/* Mobile Filter Dropdown Content */}
                    <AnimatePresence>
                        {showMobileFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="sm:hidden mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-4"
                            >
                                {/* Mobile Time Range Selection */}
                                <div>
                                    <label className={`block text-sm font-medium mb-3 ${localDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Time Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['hour', 'day', 'week', 'month', 'custom'] as ExtendedTimeRange[]).map(range => (
                                            <motion.button
                                                key={range}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setLocalTimeRange(range)}
                                                className={`
                                                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                                                    ${localTimeRange === range
                                                        ? localDarkMode 
                                                            ? 'bg-blue-600 text-white shadow-lg' 
                                                            : 'bg-blue-500 text-white shadow-lg'
                                                        : localDarkMode
                                                            ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                                            : 'bg-white text-slate-700 hover:bg-slate-50'
                                                    }
                                                `}
                                            >
                                                {range === 'custom' ? 'Custom' : range.charAt(0).toUpperCase() + range.slice(1)}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Magnitude Filter */}
                                <div>
                                    <label className={`block text-sm font-medium mb-3 ${localDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Minimum Magnitude: {localMinMag.toFixed(1)}M
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="8"
                                        step="0.1"
                                        value={localMinMag}
                                        onChange={(e) => setLocalMinMag(parseFloat(e.target.value))}
                                        className={`
                                            w-full h-2 rounded-lg appearance-none cursor-pointer
                                            ${localDarkMode ? 'bg-slate-600' : 'bg-slate-300'}
                                        `}
                                        style={{
                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(localMinMag / 8) * 100}%, ${localDarkMode ? '#475569' : '#cbd5e1'} ${(localMinMag / 8) * 100}%, ${localDarkMode ? '#475569' : '#cbd5e1'} 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>0.0M</span>
                                        <span>8.0M+</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom Date Range Picker */}
                    <AnimatePresence>
                        {localTimeRange === 'custom' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <div className="flex flex-col">
                                        <label className={`text-sm font-medium mb-2 ${localDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            Start Date
                                        </label>
                                        <DatePicker
                                            selected={customStartDate}
                                            onChange={(date: Date | null) => setCustomStartDate(date)}
                                            selectsStart
                                            startDate={customStartDate || undefined}
                                            endDate={customEndDate || undefined}
                                            maxDate={new Date()}
                                            className={`
                                                px-3 py-2 rounded-lg border text-sm
                                                ${localDarkMode
                                                    ? 'bg-slate-700 border-slate-600 text-white'
                                                    : 'bg-white border-slate-300 text-slate-900'
                                                }
                                            `}
                                            placeholderText="Select start date"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className={`text-sm font-medium mb-2 ${localDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            End Date
                                        </label>
                                        <DatePicker
                                            selected={customEndDate}
                                            onChange={(date: Date | null) => setCustomEndDate(date)}
                                            selectsEnd
                                            startDate={customStartDate || undefined}
                                            endDate={customEndDate || undefined}
                                            minDate={customStartDate || undefined}
                                            maxDate={new Date()}
                                            className={`
                                                px-3 py-2 rounded-lg border text-sm
                                                ${localDarkMode
                                                    ? 'bg-slate-700 border-slate-600 text-white'
                                                    : 'bg-white border-slate-300 text-slate-900'
                                                }
                                            `}
                                            placeholderText="Select end date"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Advanced Filters */}
                    <AnimatePresence>
                        {showAdvancedFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800"
                            >
                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                    {/* Magnitude Filter */}
                                    <div className="flex flex-col flex-1">
                                        <label className={`text-sm font-medium mb-2 ${localDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            Minimum Magnitude: {localMinMag.toFixed(1)}M
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="8"
                                            step="0.1"
                                            value={localMinMag}
                                            onChange={(e) => setLocalMinMag(parseFloat(e.target.value))}
                                            className={`
                                                w-full h-2 rounded-lg appearance-none cursor-pointer
                                                ${localDarkMode ? 'bg-slate-600' : 'bg-slate-300'}
                                            `}
                                            style={{
                                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(localMinMag / 8) * 100}%, ${localDarkMode ? '#475569' : '#cbd5e1'} ${(localMinMag / 8) * 100}%, ${localDarkMode ? '#475569' : '#cbd5e1'} 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>0.0M</span>
                                            <span>8.0M+</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
                {/* Loading Overlay */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center"
                        >
                            <div className={`
                                p-4 rounded-lg shadow-lg
                                ${localDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}
                            `}>
                                <div className="flex items-center space-x-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    <span>Loading earthquake data...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Card */}
                {error && !isLoading && (
                    <div className="mb-8">
                        <ErrorCard 
                            error={error} 
                            onRetry={handleRetry} 
                            isDarkMode={localDarkMode} 
                        />
                    </div>
                )}

                {/* Overview Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <OverviewCard
                        title="Total Earthquakes"
                        value={analytics.totalQuakes}
                        icon={
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                        isDarkMode={localDarkMode}
                    />
                    
                    <OverviewCard
                        title="Strongest Earthquake"
                        value={analytics.strongestQuake?.mag || 0}
                        decimals={1}
                        suffix="M"
                        subtitle={analytics.strongestQuake ? 
                            analytics.strongestQuake.place.split(',').slice(-1)[0].trim() : 
                            'No data'
                        }
                        icon={
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        isDarkMode={localDarkMode}
                    />
                    
                    <OverviewCard
                        title="Average Magnitude"
                        value={analytics.averageMagnitude}
                        decimals={1}
                        suffix="M"
                        icon={
                            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6M9 19H4a1 1 0 01-1-1v-2a1 1 0 011-1h5M15 19h5a1 1 0 001-1v-2a1 1 0 00-1-1h-5" />
                            </svg>
                        }
                        isDarkMode={localDarkMode}
                    />
                    
                    <OverviewCard
                        title="Depth Range"
                        value={analytics.deepestQuake ? analytics.deepestQuake.depthKm - analytics.shallowestQuake!.depthKm : 0}
                        decimals={1}
                        suffix=" km"
                        subtitle={analytics.deepestQuake && analytics.shallowestQuake ? 
                            `${analytics.shallowestQuake.depthKm.toFixed(1)} - ${analytics.deepestQuake.depthKm.toFixed(1)} km` : 
                            'No data'
                        }
                        icon={
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        }
                        isDarkMode={localDarkMode}
                    />
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Magnitude Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`
                            p-6 rounded-2xl shadow-xl backdrop-blur-sm border
                            ${localDarkMode 
                                ? 'bg-slate-800/80 border-slate-700' 
                                : 'bg-white/80 border-slate-200'
                            }
                        `}
                    >
                        <h3 className={`text-lg font-semibold mb-6 ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Magnitude Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.magnitudeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke={localDarkMode ? '#374151' : '#e2e8f0'} />
                                <XAxis 
                                    dataKey="range" 
                                    stroke={localDarkMode ? '#9ca3af' : '#64748b'}
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke={localDarkMode ? '#9ca3af' : '#64748b'}
                                    fontSize={12}
                                />
                                <Tooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const count = payload[0].value;
                                            return (
                                                <div className={`
                                                    p-3 rounded-lg shadow-lg border
                                                    ${localDarkMode 
                                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                                        : 'bg-white border-slate-200 text-slate-900'
                                                    }
                                                `}>
                                                    <p className="font-medium">Magnitude {label}</p>
                                                    <p className="text-sm">
                                                        Count: <span className="font-semibold text-blue-500">{count}</span>
                                                    </p>
                                                    <p className="text-xs opacity-75">
                                                        {((count as number / analytics.totalQuakes) * 100).toFixed(1)}% of total
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    radius={[4, 4, 0, 0]}
                                >
                                    {analytics.magnitudeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Depth Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`
                            p-6 rounded-2xl shadow-xl backdrop-blur-sm border
                            ${localDarkMode 
                                ? 'bg-slate-800/80 border-slate-700' 
                                : 'bg-white/80 border-slate-200'
                            }
                        `}
                    >
                        <h3 className={`text-lg font-semibold mb-6 ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Depth Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={analytics.depthDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {analytics.depthDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className={`
                                                    p-3 rounded-lg shadow-lg border
                                                    ${localDarkMode 
                                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                                        : 'bg-white border-slate-200 text-slate-900'
                                                    }
                                                `}>
                                                    <p className="font-medium">{data.name}</p>
                                                    <p className="text-sm">
                                                        Count: <span className="font-semibold" style={{ color: data.color }}>{data.count}</span>
                                                    </p>
                                                    <p className="text-xs opacity-75">
                                                        {((data.count / analytics.totalQuakes) * 100).toFixed(1)}% of total
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend 
                                    wrapperStyle={{ 
                                        color: localDarkMode ? '#e2e8f0' : '#334155',
                                        fontSize: '12px'
                                    }}
                                    iconSize={10}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Trend Over Time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`
                        p-6 rounded-2xl shadow-xl backdrop-blur-sm border
                        ${localDarkMode 
                            ? 'bg-slate-800/80 border-slate-700' 
                            : 'bg-white/80 border-slate-200'
                        }
                    `}
                >
                    <h3 className={`text-lg font-semibold mb-6 ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Trend Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[...analytics.timeDistribution].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke={localDarkMode ? '#374151' : '#e2e8f0'} />
                            <XAxis 
                                dataKey="time" 
                                stroke={localDarkMode ? '#9ca3af' : '#64748b'}
                                fontSize={12}
                            />
                            <YAxis 
                                stroke={localDarkMode ? '#9ca3af' : '#64748b'}
                                fontSize={12}
                            />
                            <Tooltip content={<CustomTooltip isDarkMode={localDarkMode} />} />
                            <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Active Regions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className={`
                            p-6 rounded-2xl shadow-xl backdrop-blur-sm border
                            ${localDarkMode 
                                ? 'bg-slate-800/80 border-slate-700' 
                                : 'bg-white/80 border-slate-200'
                            }
                        `}
                    >
                        <h3 className={`text-lg font-semibold mb-6 ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Most Active Regions
                        </h3>
                        <div className="space-y-4">
                            {analytics.topRegions.map((region, index) => (
                                <motion.div
                                    key={region.region}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                            ${index === 0 ? 'bg-yellow-500 text-white' : 
                                              index === 1 ? 'bg-gray-400 text-white' :
                                              index === 2 ? 'bg-amber-600 text-white' :
                                              localDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-700'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className={`font-medium ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {region.region}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`
                                            h-2 rounded-full bg-blue-500 transition-all duration-1000
                                        `} style={{ 
                                            width: `${(region.count / analytics.topRegions[0]?.count) * 100}px`,
                                            minWidth: '20px'
                                        }} />
                                        <span className={`text-sm font-semibold ${localDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {region.count}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Notable Quakes */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className={`
                            p-6 rounded-2xl shadow-xl backdrop-blur-sm border
                            ${localDarkMode 
                                ? 'bg-slate-800/80 border-slate-700' 
                                : 'bg-white/80 border-slate-200'
                            }
                        `}
                    >
                        <h3 className={`text-lg font-semibold mb-6 ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Notable Earthquakes
                        </h3>
                        <div className="space-y-4">
                            {analytics.notableQuakes.map((quake, index) => (
                                <motion.div
                                    key={quake.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 + index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className={`
                                        p-4 rounded-xl border transition-all duration-300 cursor-pointer
                                        ${localDarkMode 
                                            ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' 
                                            : 'bg-slate-50 border-slate-200 hover:bg-white'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className={`
                                                px-2 py-1 rounded-lg text-xs font-bold
                                                ${(quake.mag || 0) >= 6 ? 'bg-red-500 text-white' :
                                                  (quake.mag || 0) >= 4.5 ? 'bg-orange-500 text-white' :
                                                  (quake.mag || 0) >= 2.5 ? 'bg-yellow-500 text-white' :
                                                  'bg-green-500 text-white'}
                                            `}>
                                                {formatMagnitude(quake.mag)}M
                                            </div>
                                            <span className={`text-sm font-medium ${localDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {quake.place.split(',')[0]}
                                            </span>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onViewOnMap(quake.id, [quake.lat, quake.lon])}
                                            className={`
                                                px-3 py-1 rounded-lg text-xs font-medium transition-colors
                                                ${localDarkMode 
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                }
                                            `}
                                        >
                                            View on Map
                                        </motion.button>
                                    </div>
                                    <div className={`text-xs space-y-1 ${localDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        <p>Depth: {formatDepth(quake.depthKm)} • {formatTimeAgo(quake.time)}</p>
                                        <p>{formatCoordinates(quake.lat, quake.lon)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
