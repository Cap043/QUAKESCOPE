import { useState, useEffect, useCallback, useRef } from 'react';
import { Earthquake, TimeRange } from '../lib/types';
import { fetchEarthquakeData } from '../api/usgs';

interface EarthquakeState {
    data: Earthquake[] | null;
    status: 'idle' | 'loading' | 'error' | 'success';
    error: Error | null;
    lastUpdated: number | null;
}

export function useEarthquakes(timeRange: TimeRange) {
    const [state, setState] = useState<EarthquakeState>({
        data: null,
        status: 'idle',
        error: null,
        lastUpdated: null,
    });
    
    const cache = useRef<Record<string, { data: Earthquake[]; timestamp: number }>>({});

    const fetchData = useCallback(async () => {
        const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${timeRange}.geojson`;
        const cacheKey = url;
        const now = Date.now();
        const twoMinutes = 2 * 60 * 1000;

        // Check cache first
        if (cache.current[cacheKey] && (now - cache.current[cacheKey].timestamp < twoMinutes)) {
            setState(prev => ({ 
                ...prev, 
                status: 'success', 
                data: cache.current[cacheKey].data, 
                lastUpdated: cache.current[cacheKey].timestamp 
            }));
            return;
        }

        setState(prev => ({ ...prev, status: 'loading' }));
        const abortController = new AbortController();

        try {
            const data = await fetchEarthquakeData(timeRange, abortController.signal);
            
            const updatedTimestamp = Date.now();
            cache.current[cacheKey] = { data, timestamp: updatedTimestamp };
            
            setState({ 
                data, 
                status: 'success', 
                error: null, 
                lastUpdated: updatedTimestamp 
            });

        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error("Failed to fetch earthquake data:", error);
                setState({ 
                    data: null, 
                    status: 'error', 
                    error, 
                    lastUpdated: null 
                });
            }
        }

        return () => abortController.abort();
    }, [timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...state, refetch: fetchData };
}
