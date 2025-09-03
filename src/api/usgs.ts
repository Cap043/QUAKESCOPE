import { Earthquake, EarthquakeResponse, TimeRange } from '../lib/types';

export const USGS_FEED_URLS: Record<TimeRange, string> = {
    hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
    day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
};

export const transformEarthquakeData = (response: EarthquakeResponse): Earthquake[] => {
    return response.features.map(feature => ({
        id: feature.id,
        mag: feature.properties.mag,
        place: feature.properties.place,
        time: feature.properties.time,
        depthKm: feature.geometry.coordinates[2],
        lon: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
        url: feature.properties.url,
    })).sort((a, b) => b.time - a.time); // Sort by newest first
};

export const fetchEarthquakeData = async (timeRange: TimeRange, signal: AbortSignal): Promise<Earthquake[]> => {
    const url = USGS_FEED_URLS[timeRange];
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json: EarthquakeResponse = await response.json();
    return transformEarthquakeData(json);
};
