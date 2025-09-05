interface AppState {
    timeRange: 'hour' | 'day' | 'week';
    minMag: number;
    isDarkMode: boolean;
    mobileView: 'map' | 'list';
    showHeatmap: boolean;
    showClustering: boolean;
    mapCenter?: [number, number];
    mapZoom?: number;
}

export const encodeAppState = (state: AppState): string => {
    const encoded = {
        t: state.timeRange,
        m: state.minMag,
        d: state.isDarkMode ? 1 : 0,
        v: state.mobileView,
        h: state.showHeatmap ? 1 : 0,
        c: state.showClustering ? 1 : 0,
        lat: state.mapCenter?.[0],
        lng: state.mapCenter?.[1],
        z: state.mapZoom
    };

    // Remove undefined values
    const cleaned = Object.fromEntries(
        Object.entries(encoded).filter(([_, value]) => value !== undefined)
    );

    return btoa(JSON.stringify(cleaned));
};

export const decodeAppState = (encoded: string): Partial<AppState> => {
    try {
        const decoded = JSON.parse(atob(encoded));
        
        return {
            timeRange: decoded.t || 'day',
            minMag: decoded.m || 0,
            isDarkMode: decoded.d === 1,
            mobileView: decoded.v || 'map',
            showHeatmap: decoded.h === 1,
            showClustering: decoded.c === 1,
            mapCenter: decoded.lat && decoded.lng ? [decoded.lat, decoded.lng] : undefined,
            mapZoom: decoded.z
        };
    } catch (error) {
        console.error('Failed to decode app state:', error);
        return {};
    }
};

export const generateShareableUrl = (state: AppState): string => {
    const encoded = encodeAppState(state);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?state=${encoded}`;
};

export const getStateFromUrl = (): Partial<AppState> => {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    
    if (stateParam) {
        return decodeAppState(stateParam);
    }
    
    return {};
};

export const updateUrlWithState = (state: AppState): void => {
    const encoded = encodeAppState(state);
    const url = new URL(window.location.href);
    url.searchParams.set('state', encoded);
    
    // Update URL without triggering page reload
    window.history.replaceState({}, '', url.toString());
};
