import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const WorldWrapHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Enable world wrapping
        map.options.worldCopyJump = true;
        
        // Remove any existing bounds to allow infinite horizontal scrolling
        map.setMaxBounds(undefined);
        
        // Enable continuous world wrapping
        map.on('drag', () => {
            const mapCenter = map.getCenter();
            const mapZoom = map.getZoom();
            
            // Check if we need to wrap around
            if (mapCenter.lng > 180) {
                map.setView([mapCenter.lat, mapCenter.lng - 360], mapZoom, { animate: false });
            } else if (mapCenter.lng < -180) {
                map.setView([mapCenter.lat, mapCenter.lng + 360], mapZoom, { animate: false });
            }
        });
        
        // Cleanup
        return () => {
            map.off('drag');
        };
    }, [map]);

    return null;
};
