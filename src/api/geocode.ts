export interface GeocodeResult {
    display_name: string;
    lat: string;
    lon: string;
    type: string;
}

export const searchLocation = async (query: string): Promise<GeocodeResult[]> => {
    if (!query.trim()) return [];
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
            {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }
        
        const results: GeocodeResult[] = await response.json();
        return results;
    } catch (error) {
        console.warn('Geocoding failed:', error);
        return [];
    }
};
