import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export const MapBoundsHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Only set vertical bounds, allow horizontal infinite scrolling
        const verticalBounds = L.latLngBounds([[-85, -180], [85, 180]]);
        map.setMaxBounds(verticalBounds);
        
        // Handle map movement to ensure it stays within vertical bounds only
        const handleMapMove = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            
            // Only check and correct vertical bounds, allow horizontal wrapping
            if (center.lat < -85 || center.lat > 85) {
                // Clamp latitude to bounds, keep longitude as is for wrapping
                const clampedLat = Math.max(-85, Math.min(85, center.lat));
                map.setView([clampedLat, center.lng], zoom, { animate: true, duration: 0.5 });
            }
        };

        // Add event listeners - only on move end to avoid interference
        map.on('moveend', handleMapMove);

        // Initial bounds check
        handleMapMove();

        // Cleanup
        return () => {
            map.off('moveend', handleMapMove);
            map.off('zoomend', handleMapMove);
            map.off('drag', handleMapMove);
        };
    }, [map]);

    return null;
};
