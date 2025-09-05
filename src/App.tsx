import { useState, useEffect, useMemo, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/AppShell';
import { MapView } from './components/MapView';
import { QuakeList } from './components/QuakeList';
import { AnalyticsPage } from './components/AnalyticsPage';
import { Loading, LoadingMap } from './components/Loading';
import { ErrorState } from './components/ErrorState';
import { useEarthquakes } from './hooks/useEarthquakes';
import { TimeRange, MobileView } from './lib/types';

export default function App() {
    // --- State Management ---
    const [isReady, setIsReady] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => 
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [timeRange, setTimeRange] = useState<TimeRange>('day');
    const [minMag, setMinMag] = useState(0);
    const [mobileView, setMobileView] = useState<MobileView>('map');
    const [selectedQuakeId, setSelectedQuakeId] = useState<string | null>(null);
    const [hoveredQuakeId, setHoveredQuakeId] = useState<string | null>(null);
    const [mapFlyToCoords, setMapFlyToCoords] = useState<[number, number] | null>(null);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showClustering, setShowClustering] = useState(false);
    const [currentView, setCurrentView] = useState<'map' | 'analytics'>('map');

    // --- Data Fetching ---
    const { data: allQuakes, status, error, refetch, lastUpdated } = useEarthquakes(timeRange);

    // --- Derived State & Memoization ---
    const filteredQuakes = useMemo(() => {
        if (!allQuakes) return [];
        return allQuakes.filter(q => q.mag === null || q.mag >= minMag);
    }, [allQuakes, minMag]);

    // --- Effects ---
    useEffect(() => {
        // Set initial title immediately
        document.title = 'QuakeScope – Earthquake Monitor';
        
        // Ensure React is fully initialized before rendering the map
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    // Dynamic page title based on earthquake count and time range
    useEffect(() => {
        console.log('Title update effect triggered:', { 
            filteredQuakes: filteredQuakes?.length, 
            timeRange, 
            minMag, 
            status,
            allQuakes: allQuakes?.length
        });
        
        let newTitle = 'QuakeScope – Earthquake Monitor';
        
        if (status === 'loading') {
            newTitle = 'QuakeScope – Loading...';
        } else if (status === 'error') {
            newTitle = 'QuakeScope – Error Loading Data';
        } else if (filteredQuakes && filteredQuakes.length > 0) {
            const count = filteredQuakes.length;
            const timeRangeText = timeRange === 'hour' ? 'Hour' : timeRange === 'day' ? 'Today' : 'Week';
            const magnitudeText = minMag > 0 ? ` (≥${minMag}M)` : '';
            newTitle = `QuakeScope – ${count} Quakes ${timeRangeText}${magnitudeText}`;
        } else if (allQuakes && allQuakes.length === 0) {
            newTitle = 'QuakeScope – No Earthquakes Found';
        }
        
        // Force update the title
        document.title = newTitle;
        console.log('Title set to:', newTitle);
        
        // Also try to trigger a title change event
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = newTitle;
        }
    }, [filteredQuakes, timeRange, minMag, status, allQuakes]);
    
    useEffect(() => {
        setSelectedQuakeId(null);
    }, [timeRange]);

    // --- Handlers ---
    const handleQuakeSelect = useCallback((quakeId: string, coords: [number, number]) => {
        setSelectedQuakeId(quakeId);
        setMapFlyToCoords(coords);
        if (window.innerWidth < 640) {
            setMobileView('map');
        }
    }, []);

    const handleToggleHeatmap = useCallback(() => {
        setShowHeatmap(prev => !prev);
    }, []);

    const handleToggleClustering = useCallback(() => {
        setShowClustering(prev => !prev);
    }, []);

    const handleViewAnalytics = useCallback(() => {
        setCurrentView('analytics');
    }, []);

    const handleBackToMap = useCallback(() => {
        setCurrentView('map');
    }, []);

    const handleViewOnMap = useCallback((quakeId: string, coords: [number, number]) => {
        setSelectedQuakeId(quakeId);
        setMapFlyToCoords(coords);
        setCurrentView('map');
        if (window.innerWidth < 640) {
            setMobileView('map');
        }
    }, []);


    // --- Render ---
    if (currentView === 'analytics') {
        return (
            <ErrorBoundary>
                <AnalyticsPage
                    quakes={filteredQuakes}
                    timeRange={timeRange}
                    isDarkMode={isDarkMode}
                    onViewOnMap={handleViewOnMap}
                    onBack={handleBackToMap}
                    onThemeChange={setIsDarkMode}
                />
            </ErrorBoundary>
        );
    }

    return (
        <AppShell
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            minMag={minMag}
            setMinMag={setMinMag}
            mobileView={mobileView}
            setMobileView={setMobileView}
            quakes={filteredQuakes}
            lastUpdated={lastUpdated}
            showHeatmap={showHeatmap}
            showClustering={showClustering}
            onToggleHeatmap={handleToggleHeatmap}
            onToggleClustering={handleToggleClustering}
            onViewAnalytics={handleViewAnalytics}
        >
            <ErrorBoundary>
                                <div className="h-full w-full flex flex-col sm:flex-row overflow-hidden">
                    <div className={`sm:w-1/3 sm:max-w-sm md:w-1/4 h-full border-r border-slate-200 dark:border-slate-800 shadow-lg sm:shadow-none overflow-hidden
                       ${mobileView === 'list' ? 'block' : 'hidden'} sm:block`}>
                        <QuakeList 
                            quakes={filteredQuakes}
                            selectedQuakeId={selectedQuakeId}
                            onQuakeSelect={handleQuakeSelect}
                            onQuakeHover={setHoveredQuakeId}
                        />
                    </div>

                    <div className={`flex-grow h-full ${mobileView === 'map' ? 'block' : 'hidden'} sm:block pb-28 sm:pb-0`}>
                        {typeof window !== 'undefined' && isReady ? (
                            <ErrorBoundary>
                                <MapView
                                    quakes={filteredQuakes}
                                    hoveredQuakeId={hoveredQuakeId}
                                    selectedQuakeId={selectedQuakeId}
                                    mapFlyToCoords={mapFlyToCoords}
                                    isDarkMode={isDarkMode}
                                    onQuakeSelect={handleQuakeSelect}
                                    onQuakeHover={setHoveredQuakeId}
                                    onLocationSearch={() => {
                                        // This will be handled by the LocationSearchHandler inside MapView
                                    }}
                                    timeRange={timeRange}
                                    minMag={minMag}
                                    mobileView={mobileView}
                                    showHeatmap={showHeatmap}
                                    showClustering={showClustering}
                                    onToggleHeatmap={handleToggleHeatmap}
                                    onToggleClustering={handleToggleClustering}
                                />
                            </ErrorBoundary>
                        ) : (
                            <LoadingMap />
                        )}
                    </div>
                </div>

                {status === 'loading' && <Loading />}
                {status === 'error' && <ErrorState onRetry={refetch} error={error} />}
            </ErrorBoundary>
        </AppShell>
    );
}
