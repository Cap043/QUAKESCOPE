import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
    quakes: Array<{
        lat: number;
        lon: number;
        magnitude: number;
        depth: number;
    }>;
    isVisible: boolean;
    intensity?: number;
    radius?: number;
    blur?: number;
    maxZoom?: number;
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
    quakes,
    isVisible,
    intensity = 1.2,
    radius = 35,
    blur = 20,
    maxZoom = 18
}) => {
    const map = useMap();
    const heatmapLayerRef = useRef<L.HeatLayer | null>(null);

    useEffect(() => {
        if (!map) return;

        // Create heatmap data points with magnitude-based intensity
        const heatmapData = quakes.map(quake => [
            quake.lat,
            quake.lon,
            Math.min(quake.magnitude / 6, 1) * intensity // Normalize magnitude to 0-1 range and apply intensity
        ]);

        // Remove existing heatmap layer
        if (heatmapLayerRef.current) {
            map.removeLayer(heatmapLayerRef.current);
            heatmapLayerRef.current = null;
        }

        // Add new heatmap layer if visible and we have data
        if (isVisible && heatmapData.length > 0) {
            const heatmapLayer = (L as any).heatLayer(heatmapData, {
                radius,
                blur,
                maxZoom,
                gradient: {
                    0.0: '#0000FF',  // Low intensity - bright blue
                    0.1: '#0080FF',  // Low-medium - light blue
                    0.2: '#00FFFF',  // Medium-low - cyan
                    0.3: '#00FF80',  // Medium - green-cyan
                    0.4: '#80FF00',  // Medium - lime green
                    0.5: '#FFFF00',  // Medium-high - bright yellow
                    0.6: '#FF8000',  // High - orange
                    0.7: '#FF4000',  // High - red-orange
                    0.8: '#FF2000',  // Very high - bright red
                    0.9: '#FF0080',  // Very high - magenta-red
                    1.0: '#FF00FF'   // Maximum - bright magenta
                }
            });

            heatmapLayer.addTo(map);
            heatmapLayerRef.current = heatmapLayer;
        }

        return () => {
            if (heatmapLayerRef.current) {
                map.removeLayer(heatmapLayerRef.current);
                heatmapLayerRef.current = null;
            }
        };
    }, [map, quakes, isVisible, intensity, radius, blur, maxZoom]);

    return null;
};

export default HeatmapLayer;
