import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

// --- ICONS (Self-contained SVGs to avoid external dependencies) ---
const SunIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
);
const MoonIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);
const MapPinIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const ListIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
);
const AlertTriangleIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
);


// --- CONFIG & HELPERS (replaces lib/ and api/ files) ---

const USGS_FEED_URLS = {
    hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
    day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
};

const getMagnitudeColor = (mag) => {
    if (mag === null || mag === undefined) return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    if (mag < 2.5) return 'text-green-500 bg-green-500/10 border-green-500/30'; // Minor
    if (mag < 4.5) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'; // Light
    if (mag < 6.0) return 'text-orange-500 bg-orange-500/10 border-orange-500/30'; // Moderate
    return 'text-red-500 bg-red-500/10 border-red-500/30'; // Strong
};

const getMagnitudeMarkerOptions = (mag) => {
    let color, weight, opacity;
    const magnitude = mag || 0;
    if (magnitude < 2.5) { color = '#22c55e'; weight = 1; opacity = 0.6; }
    else if (magnitude < 4.5) { color = '#eab308'; weight = 1; opacity = 0.7; }
    else if (magnitude < 6.0) { color = '#f97316'; weight = 2; opacity = 0.8; }
    else { color = '#ef4444'; weight = 2; opacity = 0.9; }

    return {
        radius: 2 + Math.pow(magnitude, 1.5),
        fillColor: color,
        color: color,
        weight: weight,
        opacity: opacity,
        fillOpacity: 0.5
    };
};

const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp) / 1000);
    if (isNaN(seconds)) return 'Just now';
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const formatFullDate = (timestamp) => {
    return new Date(timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};


// --- CUSTOM HOOK (replaces hooks/useEarthquakes.ts) ---

function useEarthquakes(timeRange) {
    const [state, setState] = useState({
        data: null,
        status: 'idle', // 'idle' | 'loading' | 'error' | 'success'
        error: null,
        lastUpdated: null,
    });
    const cache = useRef({});

    const fetchData = useCallback(async () => {
        const url = USGS_FEED_URLS[timeRange];
        const cacheKey = url;
        const now = Date.now();
        const twoMinutes = 2 * 60 * 1000;

        if (cache.current[cacheKey] && (now - cache.current[cacheKey].timestamp < twoMinutes)) {
             setState(prev => ({ ...prev, status: 'success', data: cache.current[cacheKey].data, lastUpdated: cache.current[cacheKey].timestamp }));
             return;
        }

        setState(prev => ({ ...prev, status: 'loading' }));
        const abortController = new AbortController();

        try {
            const response = await fetch(url, { signal: abortController.signal });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();

            const transformedData = json.features.map(feature => ({
                id: feature.id,
                mag: feature.properties.mag,
                place: feature.properties.place,
                time: feature.properties.time,
                depthKm: feature.geometry.coordinates[2],
                lon: feature.geometry.coordinates[0],
                lat: feature.geometry.coordinates[1],
                url: feature.properties.url,
            })).sort((a, b) => b.time - a.time); // Sort by newest first
            
            const updatedTimestamp = Date.now();
            cache.current[cacheKey] = { data: transformedData, timestamp: updatedTimestamp };
            setState({ data: transformedData, status: 'success', error: null, lastUpdated: updatedTimestamp });

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Failed to fetch earthquake data:", error);
                setState({ data: null, status: 'error', error, lastUpdated: null });
            }
        }

        return () => abortController.abort();
    }, [timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...state, refetch: fetchData };
}


// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 bg-red-50 dark:bg-red-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
                        <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Something went wrong</h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// --- UI COMPONENTS (replaces components/ folder) ---

const LoadingState = () => (
    <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500 mx-auto"></div>
            <p className="mt-4 text-slate-700 dark:text-slate-300 font-semibold">Fetching latest earthquake data...</p>
        </div>
    </div>
);

const ErrorState = ({ onRetry }) => (
    <div className="absolute inset-0 bg-red-50 dark:bg-red-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Couldn't Fetch Data</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                There was a problem contacting the USGS server. Please check your connection.
            </p>
            <div className="mt-6 flex gap-4 justify-center">
                 <a 
                    href="https://earthquake.usgs.gov/data/comcat/data-event-sourcing.php" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    USGS Status
                </a>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                >
                    Retry
                </button>
            </div>
        </div>
    </div>
);

const Legend = () => (
    <div className="absolute bottom-4 left-4 z-[1000] p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h4 className="font-bold text-sm mb-2 text-slate-800 dark:text-slate-200">Magnitude</h4>
        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>≥ 6.0 (Strong)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div>4.5 - 5.9</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>2.5 - 4.4</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div>&lt; 2.5 (Minor)</div>
        </div>
    </div>
);

const StatsBar = ({ quakes, lastUpdated }) => {
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
            {lastUpdated && <p className="text-xs text-slate-500 dark:text-slate-400">Updated: {formatRelativeTime(lastUpdated)}</p>}
        </div>
    );
};

const Controls = ({ timeRange, setTimeRange, minMag, setMinMag, mobileView, setMobileView, quakeCount }) => {
    const timeRanges = [
        { id: 'hour', label: 'Past Hour' },
        { id: 'day', label: 'Past Day' },
        { id: 'week', label: 'Past Week' }
    ];

    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                {timeRanges.map(range => (
                    <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${timeRange === range.id ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            <div className="w-full sm:w-auto flex items-center gap-3">
                <label htmlFor="minMag" className="text-sm font-semibold whitespace-nowrap">Min. Mag:</label>
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
                    <span className="font-mono text-sky-600 dark:text-sky-400 w-8 text-center">{minMag.toFixed(1)}</span>
                </div>
            </div>

            <div className="sm:hidden flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                <button onClick={() => setMobileView('map')} className={`p-2 rounded-full transition-colors ${mobileView === 'map' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : ''}`}>
                    <MapPinIcon className="w-5 h-5" />
                </button>
                 <button onClick={() => setMobileView('list')} className={`p-2 rounded-full transition-colors relative ${mobileView === 'list' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : ''}`}>
                    <ListIcon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white text-[10px] font-bold">
                        {quakeCount}
                    </span>
                </button>
            </div>
        </div>
    );
};

const QuakeList = ({ quakes, selectedQuakeId, onQuakeSelect, onQuakeHover, className }) => {
    const listRef = useRef(null);
    const selectedItemRef = useRef(null);

    useEffect(() => {
        if (selectedQuakeId && selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [selectedQuakeId]);


    if (!quakes || quakes.length === 0) {
        return (
             <div className={`p-8 text-center text-slate-500 dark:text-slate-400 ${className}`}>
                 <p className="font-semibold">No Earthquakes Found</p>
                 <p className="text-sm mt-1">Try lowering the minimum magnitude or expanding the time range.</p>
             </div>
        )
    }

    return (
        <div ref={listRef} className={`overflow-y-auto bg-slate-50 dark:bg-slate-900/50 ${className}`} onMouseLeave={() => onQuakeHover(null)}>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {quakes.map(quake => {
                    const isSelected = quake.id === selectedQuakeId;
                    return (
                        <li
                            key={quake.id}
                            ref={isSelected ? selectedItemRef : null}
                            onClick={() => onQuakeSelect(quake.id, [quake.lat, quake.lon])}
                            onMouseEnter={() => onQuakeHover(quake.id)}
                            className={`p-4 cursor-pointer transition-colors duration-300 ${isSelected ? 'bg-sky-100 dark:bg-sky-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg border-2 ${getMagnitudeColor(quake.mag)}`}>
                                    {quake.mag !== null ? quake.mag.toFixed(1) : 'N/A'}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{quake.place || 'Unknown location'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {formatRelativeTime(quake.time)} &middot; {quake.depthKm.toFixed(1)} km depth
                                    </p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};


const FlyToMarker = ({ position, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (position && map) {
            try {
                map.flyTo(position, zoom, {
                    animate: true,
                    duration: 1.5
                });
            } catch (error) {
                console.warn('Map flyTo failed:', error);
            }
        }
    }, [position, zoom, map]);
    return null;
};

// Fallback map component when react-leaflet fails
const FallbackMap = ({ quakes, onQuakeSelect, isDarkMode }) => (
    <div className="h-full w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
            <MapPinIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Map Unavailable</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                The interactive map is currently unavailable. Please use the list view to explore earthquake data.
            </p>
            <div className="text-xs text-slate-400 dark:text-slate-500">
                {quakes?.length || 0} earthquakes found
            </div>
        </div>
    </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
    // --- State Management ---
    const [isReady, setIsReady] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [timeRange, setTimeRange] = useState('day'); // 'hour' | 'day' | 'week'
    const [minMag, setMinMag] = useState(0); // Default to 0 to show all
    const [mobileView, setMobileView] = useState('map'); // 'map' | 'list'
    const [selectedQuakeId, setSelectedQuakeId] = useState(null);
    const [hoveredQuakeId, setHoveredQuakeId] = useState(null);
    const [mapFlyToCoords, setMapFlyToCoords] = useState(null);

    // --- Data Fetching ---
    const { data: allQuakes, status, error, refetch, lastUpdated } = useEarthquakes(timeRange);

    // --- Derived State & Memoization ---
    const filteredQuakes = useMemo(() => {
        if (!allQuakes) return [];
        return allQuakes.filter(q => q.mag === null || q.mag >= minMag);
    }, [allQuakes, minMag]);

    // --- Effects ---
    useEffect(() => {
        // Dynamically add Leaflet's CSS to the document head
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        
        // Check if the link already exists to avoid duplicates
        if (!document.querySelector('link[href*="leaflet"]')) {
            document.head.appendChild(link);
        }

        // Cleanup function to remove the link when the component unmounts
        return () => {
            const existingLink = document.querySelector('link[href*="leaflet"]');
            if (existingLink) {
                document.head.removeChild(existingLink);
            }
        };
    }, []); // Empty dependency array ensures this runs only once

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);
    
    useEffect(() => {
        // Ensure React is fully initialized before rendering the map
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        setSelectedQuakeId(null);
    }, [timeRange, minMag]);


    // --- Handlers ---
    const handleQuakeSelect = useCallback((quakeId, coords) => {
        setSelectedQuakeId(quakeId);
        setMapFlyToCoords(coords);
        if (window.innerWidth < 640) {
             setMobileView('map');
        }
    }, []);
    
    const getDynamicMarkerOptions = useCallback((quake, isHovered, isSelected) => {
        const baseOptions = getMagnitudeMarkerOptions(quake.mag);
        if (isHovered || isSelected) {
            return {
                ...baseOptions,
                weight: baseOptions.weight + 2,
                opacity: 1,
                fillOpacity: 0.75,
                radius: baseOptions.radius + 3,
            };
        }
        return baseOptions;
    }, []);

    // --- Render ---
    return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
            <header className="flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-sm border-b border-slate-200 dark:border-slate-800 z-20">
                <div className="max-w-screen-2xl mx-auto py-3">
                    <div className="flex items-center justify-between px-4 sm:px-6">
                        <h1 className="text-xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
                            QuakeScope
                        </h1>
                         <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-slate-600" />}
                        </button>
                    </div>
                     <div className="mt-3">
                        <Controls 
                           timeRange={timeRange} setTimeRange={setTimeRange}
                           minMag={minMag} setMinMag={setMinMag}
                           mobileView={mobileView} setMobileView={setMobileView}
                           quakeCount={filteredQuakes.length}
                        />
                    </div>
                    <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-2">
                        <StatsBar quakes={filteredQuakes} lastUpdated={lastUpdated}/>
                    </div>
                </div>
            </header>

            <main className="flex-grow min-h-0 relative">
                <ErrorBoundary>
                    <div className="h-full w-full flex flex-col sm:flex-row">
                        <div className={`sm:w-1/3 sm:max-w-sm md:w-1/4 h-full border-r border-slate-200 dark:border-slate-800 shadow-lg sm:shadow-none
                           ${mobileView === 'list' ? 'block' : 'hidden'} sm:block`}>
                            <QuakeList 
                                quakes={filteredQuakes}
                                selectedQuakeId={selectedQuakeId}
                                onQuakeSelect={handleQuakeSelect}
                                onQuakeHover={setHoveredQuakeId}
                            />
                        </div>

                                                                        <div className={`flex-grow h-full ${mobileView === 'map' ? 'block' : 'hidden'} sm:block`}>
                            {typeof window !== 'undefined' && isReady ? (
                                <ErrorBoundary>
                                    <MapContainer
                                        center={[20, 0]}
                                        zoom={2}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}
                                        minZoom={2}
                                        key="map-container"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url={isDarkMode 
                                                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            }
                                        />
                                        {filteredQuakes.map(quake => (
                                            <CircleMarker
                                                key={quake.id}
                                                center={[quake.lat, quake.lon]}
                                                pathOptions={getDynamicMarkerOptions(quake, quake.id === hoveredQuakeId, quake.id === selectedQuakeId)}
                                                eventHandlers={{
                                                    click: () => handleQuakeSelect(quake.id, [quake.lat, quake.lon]),
                                                    mouseover: () => setHoveredQuakeId(quake.id),
                                                    mouseout: () => setHoveredQuakeId(null),
                                                }}
                                            >
                                                <Popup minWidth={200}>
                                                    <div className="font-sans">
                                                        <h3 className={`text-lg font-bold mb-1 ${getMagnitudeColor(quake.mag).split(' ')[0]}`}>
                                                            {quake.mag !== null ? quake.mag.toFixed(1) : 'N/A'} Magnitude
                                                        </h3>
                                                        <p className="text-sm font-semibold text-slate-800">{quake.place || 'Unknown location'}</p>
                                                        <p className="text-xs text-slate-500 mt-2">
                                                            {formatFullDate(quake.time)}<br/>
                                                            {quake.depthKm.toFixed(1)} km depth
                                                        </p>
                                                        <a href={quake.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline mt-2 block">
                                                            View on USGS &rarr;
                                                        </a>
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        ))}
                                        <FlyToMarker position={mapFlyToCoords} zoom={6} />
                                        <Legend />
                                    </MapContainer>
                                </ErrorBoundary>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500 mx-auto"></div>
                                        <p className="mt-4 text-slate-700 dark:text-slate-300 font-semibold">Loading map...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                </div>

                {status === 'loading' && <LoadingState />}
                {status === 'error' && <ErrorState onRetry={refetch} />}
                    </ErrorBoundary>
            </main>
        </div>
    );
}

