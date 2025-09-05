import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export const MapBoundsHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // No bounds handling - let Leaflet work naturally
        // This ensures horizontal infinite scrolling works perfectly

        // No cleanup needed - no event listeners
    }, [map]);

    return null;
};
