import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export const WorldWrapHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Enable world wrapping
        map.setMaxBounds(null);
        
        // Custom world wrap handler
        const handleMapMove = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            
            // If longitude goes beyond -180 or 180, wrap it around
            let lng = center.lng;
            if (lng < -180) {
                lng += 360;
            } else if (lng > 180) {
                lng -= 360;
            }
            
            // Only update if we need to wrap
            if (lng !== center.lng) {
                map.setView([center.lat, lng], zoom, { animate: false });
            }
        };

        // Add event listeners
        map.on('moveend', handleMapMove);
        map.on('zoomend', handleMapMove);

        // Cleanup
        return () => {
            map.off('moveend', handleMapMove);
            map.off('zoomend', handleMapMove);
        };
    }, [map]);

    return null;
};
