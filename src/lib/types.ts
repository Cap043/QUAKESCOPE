export interface Earthquake {
    id: string;
    mag: number | null;
    place: string;
    time: number;
    depthKm: number;
    lon: number;
    lat: number;
    url: string;
}

export interface EarthquakeFeature {
    id: string;
    properties: {
        mag: number | null;
        place: string;
        time: number;
        url: string;
    };
    geometry: {
        coordinates: [number, number, number]; // [lon, lat, depth]
    };
}

export interface EarthquakeResponse {
    features: EarthquakeFeature[];
}

export type TimeRange = 'hour' | 'day' | 'week';
export type MobileView = 'map' | 'list';
