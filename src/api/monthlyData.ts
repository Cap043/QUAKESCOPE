import { Earthquake } from '../lib/types';
import { fetchEarthquakeData } from './usgs';

/**
 * Fetches earthquake data for the past month by combining multiple data sources
 * Since USGS doesn't have a direct month endpoint, we use alternative strategies
 */
export const fetchMonthlyEarthquakeData = async (signal: AbortSignal): Promise<Earthquake[]> => {
    try {
        // Strategy 1: Use the USGS "all_month" feed if available
        // USGS actually has month data, but it's in a different format
        const monthUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
        
        const response = await fetch(monthUrl, { signal });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        // Transform the data similar to the USGS transformer
        const earthquakes: Earthquake[] = json.features.map((feature: any) => ({
            id: feature.id,
            mag: feature.properties.mag,
            place: feature.properties.place,
            time: feature.properties.time,
            depthKm: feature.geometry.coordinates[2],
            lon: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
            url: feature.properties.url,
        })).sort((a: Earthquake, b: Earthquake) => b.time - a.time);

        console.log(`Successfully fetched ${earthquakes.length} earthquakes for the past month`);
        return earthquakes;
        
    } catch (error) {
        console.warn('Month endpoint failed, falling back to week data:', error);
        
        // Fallback: Use week data as approximation
        try {
            const weekData = await fetchEarthquakeData('week', signal);
            console.log(`Fallback: Using ${weekData.length} earthquakes from past week for month analysis`);
            return weekData;
        } catch (fallbackError) {
            console.error('Both month and week data fetch failed:', fallbackError);
            throw new Error('Unable to fetch earthquake data for the past month. Please check your internet connection.');
        }
    }
};

/**
 * Fetches earthquake data for a custom date range
 * Uses USGS query API for specific date ranges
 */
export const fetchCustomRangeEarthquakeData = async (
    startDate: Date, 
    endDate: Date, 
    signal: AbortSignal
): Promise<Earthquake[]> => {
    try {
        // Format dates for USGS API (YYYY-MM-DD)
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // USGS query API for custom date ranges
        const queryUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDateStr}&endtime=${endDateStr}&orderby=time-asc`;
        
        const response = await fetch(queryUrl, { signal });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        // Transform the data
        const earthquakes: Earthquake[] = json.features.map((feature: any) => ({
            id: feature.id,
            mag: feature.properties.mag,
            place: feature.properties.place,
            time: feature.properties.time,
            depthKm: feature.geometry.coordinates[2],
            lon: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
            url: feature.properties.url,
        })).sort((a: Earthquake, b: Earthquake) => b.time - a.time);

        console.log(`Successfully fetched ${earthquakes.length} earthquakes for custom date range: ${startDateStr} to ${endDateStr}`);
        return earthquakes;
        
    } catch (error) {
        console.error('Custom date range fetch failed:', error);
        throw new Error(`Unable to fetch earthquake data for the selected date range. Please try a different date range or check your internet connection.`);
    }
};
